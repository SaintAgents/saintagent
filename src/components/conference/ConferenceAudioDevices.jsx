import { useEffect, useState } from 'react';

export default function ConferenceAudioDevices({ micStatus, requestMic, speaker, setSpeaker }) {
  const [devices,setDevices] = useState([]);
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const refresh = () => navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => setDevices([]));
    refresh();
    navigator.mediaDevices.addEventListener('devicechange',refresh);
    return () => navigator.mediaDevices.removeEventListener('devicechange',refresh);
  }, [micStatus]);
  return <div className="flex flex-wrap gap-3 text-sm">
    {micStatus === 'ready' && devices.some(d => d.kind === 'audioinput' && d.deviceId) && <label className="grid gap-1">Microphone<select className="rounded-md border bg-background p-2" defaultValue={localStorage.getItem('conferenceMic') || ''} onChange={e => { localStorage.setItem('conferenceMic',e.target.value); requestMic(e.target.value); }}><option value="">System default</option>{devices.filter(d => d.kind === 'audioinput' && d.deviceId && d.deviceId !== 'default').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}</select></label>}
    {typeof HTMLMediaElement.prototype.setSinkId === 'function' && devices.some(d => d.kind === 'audiooutput' && d.deviceId) && <label className="grid gap-1">Speaker<select className="rounded-md border bg-background p-2" value={speaker} onChange={e => { localStorage.setItem('conferenceSpeaker',e.target.value); setSpeaker(e.target.value); }}><option value="">System default</option>{devices.filter(d => d.kind === 'audiooutput' && d.deviceId && d.deviceId !== 'default').map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Speaker'}</option>)}</select></label>}
  </div>;
}