export default function conferenceMesh({ send, changed, receiveTrack, removed, failed, getTrack }) {
  const peers = new Map();
  let self;
  function drop(seat) { peers.get(seat)?.pc.close(); peers.delete(seat); removed(seat); }
  function make(seat) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const {sender} = pc.addTransceiver('audio', {direction:'sendrecv'});
    const peer = {pc,sender, pending:[], queue:Promise.resolve()};
    peers.set(seat, peer);
    sender.replaceTrack(getTrack()).catch(failed);
    pc.ontrack = e => receiveTrack(seat, e.streams[0] || new MediaStream([e.track]));
    pc.onicecandidate = e => { if (e.candidate) send(seat, {type:'ice',candidate:e.candidate.toJSON()}); };
    pc.onconnectionstatechange = () => changed([...peers.values()].map(p => p.pc.connectionState));
    return peer;
  }
  const queue = (peer, run) => { peer.queue = peer.queue.then(() => { if (peer.pc.signalingState !== 'closed') return run(peer.pc); }).catch(() => { if (peer.pc.signalingState !== 'closed') failed(); }); };
  return {
    admit(seat) { for (const id of peers.keys()) drop(id); self = seat; changed([]); },
    roster(members) {
      const local = members.find(p => p.seat === self);
      if (!local) return;
      for (const id of peers.keys()) if (!members.some(p => p.seat === id)) drop(id);
      for (const {seat,id} of members) {
        if (seat === self || peers.has(seat)) continue;
        const peer = make(seat);
        if (local.id < id) queue(peer, async pc => { await pc.setLocalDescription(await pc.createOffer()); send(seat, pc.localDescription.toJSON()); });
      }
      changed([...peers.values()].map(p => p.pc.connectionState));
    },
    signal(seat, signal) {
      const peer = peers.get(seat) || make(seat);
      queue(peer, async pc => {
        if (signal.type === 'ice') { if (!pc.remoteDescription) peer.pending.push(signal.candidate); else await pc.addIceCandidate(signal.candidate); return; }
        await pc.setRemoteDescription(signal);
        for (const candidate of peer.pending.splice(0)) await pc.addIceCandidate(candidate);
        if (signal.type === 'offer') { await pc.setLocalDescription(await pc.createAnswer()); send(seat, pc.localDescription.toJSON()); }
      });
    },
    track(next) { return Promise.all([...peers.values()].map(p => p.sender.replaceTrack(next))); },
    dispose() { for (const id of peers.keys()) drop(id); }
  };
}