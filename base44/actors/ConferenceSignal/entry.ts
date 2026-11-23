import { Actor, ActorError } from 'base44:runtime/actors';

const LIMIT = 6;
export default class ConferenceSignal extends Actor {
  static callable = ['initialize'];
  room = null;
  peers = new Map();
  async handleStart() {
    this.room = (await this.storage.get('room')) || null;
    const saved = (await this.storage.get('peers')) || [];
    const live = new Set(this.getConnections().map(conn => conn.id));
    this.peers = new Map(saved.filter(([id]) => live.has(id)));
  }
  async initialize({code,title,host,recipient}, {identity}) {
    if (identity.type !== 'service' || this.room) throw new ActorError(403, 'Not allowed');
    const startedAt = new Date().toISOString();
    const { id } = await this.client.asServiceRole.entities.ConferenceRoom.create({code,title,host_id:host.id,host_name:host.name,member_ids:[host.id,recipient.id],status:'active',started_at:startedAt});
    this.room = {id, code, title, host, members:[host.id,recipient.id], names:{[host.id]:host.name,[recipient.id]:recipient.name}, startedAt, answered:false, ended:false};
    await this.save();
    await this.schedule('unanswered', Date.now() + 35000);
    await this.schedule('expiry', Date.now() + 2 * 60 * 60 * 1000);
    await this.notify(recipient.email);
    return { ok:true };
  }
  save() { return this.storage.put('room', this.room); }
  savePeers() { return this.storage.put('peers', [...this.peers]); }
  async notify(email) {
    await this.client.asServiceRole.entities.Notification.create({user_id:email,type:'meeting',priority:'urgent',title:`${this.room.host.name} invited you to an audio call`,message:this.room.title,action_label:'Open invitation',action_url:`/ConferencePortal?call=${this.room.code}`}).catch(() => console.warn('Could not send call notification'));
  }
  async handleConnect(conn) {
    const id = conn.identity?.type === 'authenticated' ? conn.identity.userId : null;
    if (!id || !this.room || this.room.ended || !this.room.members.includes(id)) { conn.reject(4003,'Call is closed or unavailable'); return; }
    if ([...this.peers].some(([key, peer]) => key !== conn.id && peer.id === id)) { conn.reject(4001,'This call is already open in another tab'); return; }
    if (this.peers.has(conn.id) && this.peers.get(conn.id).id !== id) { conn.reject(4003,'Call is unavailable'); return; }
    const seat = crypto.randomUUID();
    this.peers.set(conn.id,{id,seat});
    if (id === this.room.host.id) await this.cancelSchedule('hostGone');
    else if (!this.room.answered) { this.room.answered = true; await this.save(); await this.cancelSchedule('unanswered'); }
    await this.savePeers();
    conn.send({type:'admitted',seat});
    this.roster();
  }
  roster() {
    if (!this.room || this.room.ended) return;
    const peers = [...this.peers.values()].map(({id,seat}) => ({id,seat,name:this.room.names[id]}));
    for (const conn of this.getConnections()) if (this.peerFor(conn)) conn.send({type:'roster',peers});
  }
  peerFor(conn) {
    const peer = this.peers.get(conn.id);
    return peer && conn.identity?.type === 'authenticated' && peer.id === conn.identity.userId ? peer : null;
  }
  async handleMessage(conn, msg) {
    const peer = this.peerFor(conn);
    if (!peer || !this.room || this.room.ended || !msg || typeof msg !== 'object') return;
    if (msg.type === 'end' && peer.id === this.room.host.id) { await this.end('The host ended the call.'); return; }
    if (msg.type === 'invite' && peer.id === this.room.host.id) {
      if (typeof msg.email !== 'string' || msg.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email.trim())) { conn.send({type:'notice',text:'Enter a valid member email.'}); return; }
      const [target] = await this.client.asServiceRole.entities.User.filter({email:msg.email.trim().toLowerCase()}, '-created_date', 1);
      if (this.room.ended || !this.peers.has(conn.id)) return;
      if (!target || this.room.members.includes(target.id) || this.room.members.length >= LIMIT) { conn.send({type:'notice',text:'That member could not be invited. Calls allow up to six members.'}); return; }
      this.room.members.push(target.id); this.room.names[target.id] = target.full_name || 'Member';
      await this.save();
      await this.client.asServiceRole.entities.ConferenceRoom.update(this.room.id,{member_ids:[...this.room.members]});
      await this.notify(target.email);
      conn.send({type:'notice',text:'Invitation added.'});
      return;
    }
    if (msg.type !== 'signal' || typeof msg.to !== 'string' || msg.to === peer.seat) return;
    const target = [...this.peers].find(([,entry]) => entry.seat === msg.to)?.[0];
    if (!target) return;
    const signal = msg.signal;
    if (!signal || typeof signal !== 'object') return;
    let value;
    if (['offer','answer'].includes(signal.type) && typeof signal.sdp === 'string' && signal.sdp.length <= 24000) value = {type:signal.type,sdp:signal.sdp};
    if (signal.type === 'ice' && typeof signal.candidate?.candidate === 'string' && signal.candidate.candidate.length <= 2048 && JSON.stringify(signal.candidate).length <= 3000) value = {type:'ice',candidate:signal.candidate};
    if (value) this.getConnections().find(c => c.id === target && this.peerFor(c))?.send({type:'signal',from:peer.seat,signal:value});
  }
  async handleClose(conn) {
    const peer = this.peerFor(conn);
    if (!peer) return;
    this.peers.delete(conn.id);
    await this.savePeers();
    this.roster();
    if (!this.room.ended && peer.id === this.room.host.id && ![...this.peers.values()].some(p => p.id === this.room.host.id)) await this.schedule('hostGone', Date.now() + 45000);
  }
  async handleWake(key) {
    if (!this.room || this.room.ended) return;
    if (key === 'unanswered' && !this.room.answered) await this.end('No one answered the call.');
    if (key === 'hostGone' && ![...this.peers.values()].some(p => p.id === this.room.host.id)) await this.end('The host disconnected.');
    if (key === 'expiry') await this.end('The call reached its two-hour limit.');
  }
  async end(text) {
    if (this.room.ended) return;
    this.room.ended = true;
    await this.save();
    for (const conn of this.getConnections()) if (this.peerFor(conn)) conn.send({type:'ended',text});
    await this.client.asServiceRole.entities.ConferenceRoom.update(this.room.id,{status:'ended',ended_at:new Date().toISOString()});
  }
}