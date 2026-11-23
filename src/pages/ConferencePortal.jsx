import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConferenceList from '@/components/conference/ConferenceList';
import ConferenceAudioPanel from '@/components/conference/ConferenceAudioPanel';

export default function ConferencePortal() {
  const {user} = useAuth(), qc = useQueryClient(), [params,setParams] = useSearchParams();
  const [title,setTitle] = useState(''), [email,setEmail] = useState(''), [tab,setTab] = useState('invitations');
  const [busy,setBusy] = useState(false), [notice,setNotice] = useState(''), [joined,setJoined] = useState(null);
  const code = params.get('call'), valid = /^[0-9a-f-]{36}$/i.test(code || ''), uid = user?.id, preview = isTourPreview();
  const pick = useCallback(code => { setJoined(null); setNotice(''); setParams(code ? {call:code} : {}); },[setParams]);
  const finish = useCallback(text => { setJoined(null); setNotice(text); setParams({}, {replace:true}); qc.invalidateQueries({queryKey:['conferences',uid]}); },[qc,setParams,uid]);
  useEffect(() => { if (uid) return base44.entities.ConferenceRoom.subscribe(() => qc.invalidateQueries({queryKey:['conferences',uid]})); },[qc,uid]);
  const selected = useQuery({queryKey:['conferences',uid,'room',code], enabled:!!uid && valid, queryFn:async () => (await base44.entities.ConferenceRoom.filter({code,member_ids:uid},'-created_date',1))[0] || null});
  async function start(e) {
    e.preventDefault(); setBusy(true); setNotice('');
    try { const {data} = await base44.functions.invoke('startConference',{title,email}); pick(data.code); setJoined(data.code); setTab('mine'); qc.invalidateQueries({queryKey:['conferences',uid]}); }
    catch (error) { setNotice(error.response?.data?.error || 'The call could not start. Try again.'); }
    finally { setBusy(false); }
  }
  const call = selected.data;
  return <div className="mx-auto max-w-3xl space-y-5 px-4 pb-24 pt-5 text-foreground">
    <header><h1 className="font-heading text-2xl font-bold">Conference Portal</h1><p className="text-sm text-muted-foreground">Start or join a private audio call with up to six SaintAgent members.</p></header>
    {notice && <p role="status" className="rounded-lg border bg-card p-3">{notice}</p>}
    {joined === code && call ? <ConferenceAudioPanel key={code} call={call} host={call.host_id === uid} onEnd={finish} /> : code ? <section data-readable-surface className="space-y-3 rounded-xl border bg-card p-4">
      {valid && selected.isPending ? <p role="status">Opening call…</p> : selected.isError ? <p role="alert">Could not load the call. <Button variant="link" onClick={() => selected.refetch()}>Retry</Button></p> : call?.status === 'active' ? <><h2 className="font-semibold">{call.title}</h2><p className="text-sm">Hosted by {call.host_name}</p><Button disabled={preview} onClick={() => setJoined(code)}>Join audio</Button></> : <p>This call has ended or is not available to you.</p>}
      <Button variant="ghost" onClick={() => pick(null)}>Back to calls</Button>
    </section> : <form data-readable-surface onSubmit={start} className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="grid gap-1 text-sm">Call name<Input required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} /></label><label className="grid gap-1 text-sm">Member email<Input required maxLength={254} type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><Button type="submit" disabled={busy || preview}>{busy ? 'Starting…' : 'Start audio call'}</Button></form>}
    {!code && <section className="space-y-3"><div className="flex flex-wrap gap-2" aria-label="Conference lists">{[['invitations','Invitations'],['mine','My Conferences'],['history','Conference History']].map(([id,label]) => <Button key={id} variant={id === tab ? 'default' : 'outline'} aria-pressed={id === tab} onClick={() => setTab(id)}>{label}</Button>)}</div>{uid && <ConferenceList tab={tab} userId={uid} onPick={pick} />}</section>}
  </div>;
}