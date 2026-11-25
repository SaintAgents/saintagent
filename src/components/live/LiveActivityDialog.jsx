import React from 'react';
import LiveActivityPreferences from '@/components/live/LiveActivityPreferences';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTime, safePath } from '@/components/live/activity';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export default function LiveActivityDialog({ state, dialog, close, preferences, sampleImage, eventTitle }) {
  const setup = dialog === 'setup';
  const list = dialog === 'all';
  const demoList = list && state.demo;
  const title = setup ? 'Ticker setup' : list ? (demoList ? 'Demo Activity' : 'Live Activity Notification Center') : eventTitle ?? (dialog.category === 'signals' ? 'GGT Signal' : 'Event details');
  return <Dialog open onOpenChange={open => { if (!open) close(); }}><DialogContent data-readable-surface className="max-h-[85dvh] overflow-auto">
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{setup ? 'Choose where activity appears and which events to see.' : list ? (demoList ? 'Fictional events for previewing the activity ticker.' : 'Recent live events. Dismissing a toast doesn’t remove it here.') : dialog.headline}</DialogDescription></DialogHeader>
    {setup ? <LiveActivityPreferences key={state.prefs.revision} prefs={state.prefs} preferences={preferences} onSaved={() => { close(); toast({ title: 'Activity preferences saved' }); }} /> : list ? <div className="space-y-2">
      {!demoList && state.events.isPending ? <p>Loading activity…</p> : !demoList && state.events.isError ? <Button onClick={() => state.events.refetch()}>Retry loading activity</Button> : !state.tickerHistory.length ? <p>No matching activity yet.</p> : state.tickerHistory.map(event => <Button key={event.id} variant="outline" className="h-auto w-full justify-between gap-2 whitespace-normal text-left" onClick={() => { close(); state.open(event); }}><span>{event.headline}</span><span className="shrink-0 text-xs">{formatTime(event.created_date)}</span></Button>)}
    </div> : <div className="space-y-2">{sampleImage && <img className="aspect-video w-full object-cover" src={sampleImage} alt="" />}{(sampleImage || dialog.is_demo) && <p className="text-xs font-semibold">Fictional demo event</p>}<p className="whitespace-pre-wrap">{dialog.description}</p><p className="text-xs">{[formatTime(dialog.created_date), dialog.metric, dialog.country].filter(Boolean).join(' · ')}</p>{safePath(dialog.action_path) && <Link to={dialog.action_path} onClick={close}>{sampleImage ? 'Open sample research' : 'Open related record'}</Link>}</div>}
  </DialogContent></Dialog>;
}