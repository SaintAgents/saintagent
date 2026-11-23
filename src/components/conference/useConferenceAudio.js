import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import conferenceMesh from '@/components/conference/conferenceMesh';

export default function useConferenceAudio(code, onEnd) {
  const room = useRef(null), mesh = useRef(null), mic = useRef(null), attempt = useRef(0);
  const [peers, setPeers] = useState([]), [streams, setStreams] = useState({}), [states, setStates] = useState([]);
  const [status,setStatus] = useState('Connecting to the call…'), [admitted,setAdmitted] = useState(false);
  const [muted,setMuted] = useState(false), [held,setHeld] = useState(false), [micStatus,setMicStatus] = useState('off');
  useEffect(() => {
    if (mic.current) mic.current.enabled = !held && !muted;
  }, [muted,held,micStatus]);
  const requestMic = useCallback(async deviceId => {
    const n = ++attempt.current;
    setMicStatus('pending');
    const timer = setTimeout(() => { if (n === attempt.current) setMicStatus('waiting'); }, 8000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:deviceId ? {deviceId:{exact:deviceId}} : true});
      const track = stream.getAudioTracks()[0];
      if (n !== attempt.current || !mesh.current) { track.stop(); return; }
      track.enabled = false;
      const previous = mic.current;
      await mesh.current.track(track);
      if (n !== attempt.current || !mesh.current) { track.stop(); return; }
      mic.current = track; previous?.stop(); setMicStatus('ready');
    } catch { if (n === attempt.current) setMicStatus(mic.current ? 'ready' : 'denied'); }
    finally { clearTimeout(timer); }
  }, []);
  useEffect(() => {
    if (typeof RTCPeerConnection !== 'function') { setStatus('This browser does not support WebRTC audio calls.'); return; }
    const conn = base44.actors.ConferenceSignal(code).connect(); room.current = conn;
    const session = conferenceMesh({send:(to,signal) => conn.send({type:'signal',to,signal}),changed:setStates,getTrack:() => mic.current,
      receiveTrack:(seat,stream) => setStreams(old => ({...old,[seat]:stream})),removed:seat => setStreams(old => Object.fromEntries(Object.entries(old).filter(([id]) => id !== seat))),failed:() => setStatus('Could not connect audio to a participant.')});
    mesh.current = session;
    const timeout = setTimeout(() => setStatus('Could not confirm admission. Leave and reopen the invitation to retry.'), 10000);
    const sub = conn.subscribe(msg => {
      if (msg.type === 'admitted') { session.admit(msg.seat); clearTimeout(timeout); setAdmitted(true); setStatus(''); }
      if (msg.type === 'roster') { setPeers(msg.peers); session.roster(msg.peers); }
      if (msg.type === 'signal') session.signal(msg.from,msg.signal);
      if (msg.type === 'notice') setStatus(msg.text);
      if (msg.type === 'ended') onEnd(msg.text);
    });
    return () => { clearTimeout(timeout); ++attempt.current; sub.unsubscribe(); conn.close(); session.dispose(); mic.current?.stop(); mic.current = null; mesh.current = null; room.current = null; };
  }, [code,onEnd]);
  return {peers,streams,states,status,admitted,muted,setMuted,held,setHeld,micStatus,requestMic,send:msg => room.current?.send(msg)};
}