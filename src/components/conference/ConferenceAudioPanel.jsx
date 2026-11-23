import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useConferenceAudio from '@/components/conference/useConferenceAudio';
import ConferenceAudioDevices from '@/components/conference/ConferenceAudioDevices';

export default function ConferenceAudioPanel({ call, host, onEnd }) {
  const audio = useConferenceAudio(call.code,onEnd);
  const [email,setEmail] = useState(''), [speaker,setSpeaker] = useState(() => localStorage.getItem('conferenceSpeaker') || '');
  const [seconds,setSeconds] = useState(0), [ending,setEnding] = useState(false), [notice,setNotice] = useState('');
  const elements = useRef(new Map());
  const requestMic = audio.requestMic;
  useEffect(() => { if (audio.admitted) requestMic(localStorage.getItem('conferenceMic') || ''); }, [audio.admitted,requestMic]);
  useEffect(() => { if (!audio.states.includes('connected')) return; const timer = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [audio.states.includes('connected')]);
  useEffect(() => {
    for (const [seat,stream] of Object.entries(audio.streams)) {
      const el = elements.current.get(seat);
      if (!el) continue;
      if (el.srcObject !== stream) { el.srcObject = stream; el.play().catch(() => setNotice('Select Enable playback if you cannot hear the call.')); }
      el.setSinkId?.(speaker).catch(() => setNotice('Could not select that speaker. Try System default.'));
    }
  }, [audio.streams,speaker]);
  const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`;
  return <section data-readable-surface className="space-y-4 rounded-xl border bg-card p-4">
    <h2 className="text-lg font-semibold">{call.title}</h2>
    <p className="text-sm" role="status">{audio.admitted ? audio.states.includes('connected') ? `Audio connected · ${elapsed}` : audio.peers.length < 2 ? 'Waiting for other participants…' : audio.states.some(s => s === 'failed' || s === 'disconnected') ? 'Audio could not connect to a participant. Leave and rejoin to retry.' : 'Connecting audio…' : 'Joining call…'}</p>
    {audio.status && <p className="text-sm" role="status">{audio.status}</p>}
    {notice && <p className="text-sm" role="status">{notice}</p>}
    {!!audio.peers.length && <ul aria-label="Participants" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">{audio.peers.map(p => <li key={p.seat}>{p.name}</li>)}</ul>}
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" disabled={audio.micStatus !== 'ready'} onClick={() => audio.setMuted(!audio.muted)}>{audio.muted ? 'Unmute' : 'Mute'}</Button>
      <Button variant="outline" disabled={!audio.admitted} onClick={() => audio.setHeld(!audio.held)}>{audio.held ? 'Resume' : 'Hold'}</Button>
      {audio.admitted && audio.micStatus !== 'ready' && <Button variant="outline" disabled={audio.micStatus === 'pending'} onClick={() => requestMic('')}>{audio.micStatus === 'pending' ? 'Requesting microphone…' : 'Enable microphone'}</Button>}
      {!!Object.keys(audio.streams).length && <Button variant="outline" onClick={() => Promise.all([...elements.current.values()].map(el => el.play())).then(() => setNotice('')).catch(() => setNotice('Playback was blocked by this browser.'))}>Enable playback</Button>}
      {host && audio.admitted && <Button variant="destructive" disabled={ending} onClick={() => { setEnding(true); audio.send({type:'end'}); }}>{ending ? 'Ending…' : 'End for everyone'}</Button>}
      <Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/ConferencePortal?call=${call.code}`); setNotice('Invite link copied. Only invited members can join.'); } catch { setNotice('Could not copy the invite link. Copy the address from your browser.'); } }}>Copy invite link</Button>
      <Button variant="outline" onClick={() => onEnd('')}>Leave</Button>
    </div>
    {['denied','waiting'].includes(audio.micStatus) && <p className="text-sm">You can listen without a microphone. Enable it to speak.</p>}
    {audio.admitted && <ConferenceAudioDevices {...{micStatus:audio.micStatus,requestMic,speaker,setSpeaker}} />}
    {host && audio.admitted && <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); audio.send({type:'invite',email}); setEmail(''); }}><Input className="w-auto max-w-full" type="email" required maxLength={254} aria-label="Member email to invite" placeholder="Member email" value={email} onChange={e => setEmail(e.target.value)} /><Button type="submit" variant="outline">Invite member</Button></form>}
    {Object.keys(audio.streams).map(seat => <audio key={seat} autoPlay muted={audio.held} ref={el => { if (el) elements.current.set(seat,el); else elements.current.delete(seat); }} />)}
  </section>;
}