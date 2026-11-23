import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConferenceList from '@/components/conference/ConferenceList';
import ConferenceAudioPanel from '@/components/conference/ConferenceAudioPanel';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

export default function DockConferenceRooms({user, visible, invite}) {
  const client = useQueryClient();
  const [call,setCall] = useState(null), [create,setCreate] = useState(Boolean(invite)), [busy,setBusy] = useState(false), [notice,setNotice] = useState('');
  const preview = isTourPreview();
  async function open(code, join = false) {
    const [room] = await base44.entities.ConferenceRoom.filter({ code, member_ids:user.id, status:'active' }, '-created_date', 1);
    if (!room) throw new Error('This private call is not available to you.');
    setCall({...room, joined:join}); setCreate(false);
  }
  async function run(fn) {
    setBusy(true); setNotice('');
    try { await fn(); } catch (e) { setNotice(e.response?.data?.error || e.message || 'Could not open the call.'); } finally { setBusy(false); }
  }
  function start(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(async () => {
      const {data} = await base44.functions.invoke('startConference', {title:form.get('title'), email:form.get('email')});
      await client.invalidateQueries({queryKey:['conferences',user.id]});
      await open(data.code, true);
    });
  }
  return <div className="grid gap-2">
    <Link to="/ConferencePortal">Open Conference Portal</Link>
    {notice && <p role="status">{notice}</p>}
    {call && <div className="grid gap-2"><button onClick={() => run(async () => { await navigator.clipboard.writeText(new URL(`/ConferencePortal?call=${encodeURIComponent(call.code)}`, location.origin).href); setNotice('Link copied. Only invited members can join.'); })}>Copy member invite link</button>
      {call.joined ? <ConferenceAudioPanel key={call.code} call={call} host={call.host_id === user.id} onEnd={message => {setCall(null); setNotice(message || 'Left the call.'); client.invalidateQueries({queryKey:['conferences',user.id]});}} /> : <><strong>{call.title}</strong><button disabled={preview || busy} onClick={() => setCall({...call,joined:true})}>Join audio</button><button onClick={() => setCall(null)}>Back</button></>}
    </div>}
    {!call && (create ? <form className="grid gap-2" onSubmit={start}>
      <label>Room name <input name="title" required maxLength={100} defaultValue={invite ? `Call with ${invite.name}`.slice(0,100) : ''} /></label>
      <label>Member email <input type="email" name="email" required maxLength={254} defaultValue={invite?.id || ''} /></label>
      <button disabled={busy || preview}>{busy ? 'Starting…' : 'Start audio call'}</button><button type="button" onClick={() => setCreate(false)}>Cancel</button>
    </form> : <button disabled={preview || busy} onClick={() => setCreate(true)}>Create room</button>)}
    {!call && !invite && visible && !create && <ConferenceList tab="all" userId={user.id} onPick={code => { if (!busy && !preview) run(() => open(code)); }} />}
  </div>;
}