import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { categories, formatTime, safePath } from '@/components/live/activity';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

function Setup({ prefs, preferences, close }) {
  const [draft, set] = useState(prefs);
  return <form className="space-y-3 text-sm" onSubmit={e => { e.preventDefault(); preferences.mutate({ ...draft, revision:Date.now() }, { onSuccess:() => { close(); toast({ title:'Ticker setup saved' }); } }); }}>
    <label className="flex gap-2"><input type="checkbox" checked={draft.enabled} onChange={e => set({ ...draft, enabled:e.target.checked })} /> Show live ticker</label>
    <label className="flex gap-2"><input type="checkbox" checked={draft.suppress} onChange={e => set({ ...draft, suppress:e.target.checked })} /> Silence intelligent event toasts</label>
    <label className="flex gap-2"><input type="checkbox" checked={draft.demo} onChange={e => set({ ...draft, demo:e.target.checked })} /> Show shared demo events when enabled by an admin</label>
    <label className="flex items-center justify-between gap-3">Activity placement <select className="rounded border bg-background p-1" value={draft.placement} onChange={e => set({ ...draft, placement:e.target.value })}><option value="bottom">Bottom bar</option><option value="sidebar">Sidebar</option><option value="canopy">Command Canopy HUD</option></select></label>
    {draft.placement !== 'canopy' && <label className="flex gap-2"><input type="checkbox" checked={draft.showInCanopy} onChange={e => set({ ...draft, showInCanopy:e.target.checked })} /> Also show ticker in Command Canopy</label>}
    <label className="flex items-center justify-between gap-3">Ticker speed <select className="rounded border bg-background p-1" value={draft.speed} onChange={e => set({ ...draft, speed:e.target.value })}><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
    <fieldset className="grid grid-cols-2 gap-2"><legend className="mb-2">Activity categories (none selected means all)</legend>{Object.entries(categories).map(([id, [label]]) => <label key={id} className="flex items-center gap-2"><input type="checkbox" checked={draft.categories.includes(id)} onChange={e => set({ ...draft, categories:e.target.checked ? [...draft.categories, id] : draft.categories.filter(category => category !== id) })} />{label}</label>)}</fieldset>
    {preferences.isError && <p role="alert">Couldn’t save ticker setup. Try again.</p>}
    <Button type="submit" disabled={preferences.isPending}>{preferences.isPending ? 'Saving…' : 'Save ticker setup'}</Button>
  </form>;
}
export default function LiveActivityDialog({ state, dialog, close, preferences, sampleImage }) {
  const setup = dialog === 'setup';
  const list = dialog === 'all';
  const demoList = list && state.demo;
  const title = setup ? 'Ticker setup' : list ? (demoList ? 'Demo Activity' : 'Live Activity Notification Center') : dialog.category === 'signals' ? 'GGT Signal' : 'Event details';
  return <Dialog open onOpenChange={open => { if (!open) close(); }}><DialogContent data-readable-surface className="max-h-[85dvh] overflow-auto">
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{setup ? 'Choose where activity appears and which events to see.' : list ? (demoList ? 'Fictional events for previewing the activity ticker.' : 'Recent live events. Dismissing a toast doesn’t remove it here.') : dialog.headline}</DialogDescription></DialogHeader>
    {setup ? <Setup {...{ prefs:state.prefs, preferences, close }} /> : list ? <div className="space-y-2">
      {!demoList && state.events.isPending ? <p>Loading activity…</p> : !demoList && state.events.isError ? <Button onClick={() => state.events.refetch()}>Retry loading activity</Button> : !state.tickerHistory.length ? <p>No matching activity yet.</p> : state.tickerHistory.map(event => <Button key={event.id} variant="outline" className="h-auto w-full justify-between gap-2 whitespace-normal text-left" onClick={() => { close(); state.open(event); }}><span>{event.headline}</span><span className="shrink-0 text-xs">{formatTime(event.created_date)}</span></Button>)}
    </div> : <div className="space-y-2">{sampleImage && <img className="aspect-video w-full object-cover" src={sampleImage} alt="" />}{(sampleImage || dialog.is_demo) && <p className="text-xs font-semibold">Fictional demo event</p>}<p className="whitespace-pre-wrap">{dialog.description}</p><p className="text-xs">{[formatTime(dialog.created_date), dialog.metric, dialog.country].filter(Boolean).join(' · ')}</p>{safePath(dialog.action_path) && <Link to={dialog.action_path} onClick={close}>{sampleImage ? 'Open sample research' : 'Open related record'}</Link>}</div>}
  </DialogContent></Dialog>;
}