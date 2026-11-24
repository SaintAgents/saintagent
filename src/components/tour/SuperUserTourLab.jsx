import React, { useState } from 'react';
import { Briefcase, LayoutDashboard, ListChecks, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const views = [['deck', 'Command Deck', LayoutDashboard], ['profile', 'Profile', UserRound], ['business', 'Business', Briefcase], ['project', 'Project', ListChecks]];
const defaultBio = 'I help neighborhoods build shared gardens. I’m looking for volunteer coordinators and site partners.';
const task = 'Confirm site access with the garden lead';

export default function SuperUserTourLab({ step }) {
  const [active, takeControl] = useState(false), [selected, select] = useState(null);
  const [bio, setBio] = useState(defaultBio), [draft, edit] = useState(null), [done, complete] = useState(false);
  const view = selected?.step === step ? selected.view : views[step][0];
  const go = (next) => { edit(null); select({ step, view: next }); };
  return <section aria-label="Super User demo workspace" className="min-h-0 min-w-0 space-y-4 overflow-auto border-b bg-card p-4 text-card-foreground md:border-b-0">
    <div className="border-b pb-3"><h4 className="font-semibold">Super User demo</h4><p className="text-xs text-muted-foreground">Fictional workspace · No real account access</p></div>
    {!active ? <div className="space-y-3"><p className="text-sm">Explore SaintAgent as Avery Chen, founder of Greenway Commons.</p><Button onClick={() => takeControl(true)}>Take control of the demo</Button></div> : <>
      <p className="text-sm font-semibold">Viewing as Avery Chen <span className="text-xs font-normal">· Demo</span></p>
      <div className="flex flex-wrap gap-1" aria-label="Demo destinations">{views.map(([id, label, Icon]) => <Button key={id} size="sm" variant={view === id ? 'default' : 'outline'} aria-pressed={view === id} className="aria-pressed:ring-2" onClick={() => go(id)}><Icon />{label}</Button>)}</div>
      <div className="space-y-3 rounded-md border p-4 text-sm" aria-label={views.find(([id]) => id === view)[1]}>
        {view === 'deck' && <><h4 className="font-semibold">Welcome back, Avery</h4><p>Your current focus: open a neighborhood garden with a local partner.</p><p role="status">Next task: {task} · {done ? 'Complete' : 'To do'}</p><Button size="sm" onClick={() => go('project')}>Open active project</Button></>}
        {view === 'profile' && <><h4 className="font-semibold">Avery Chen</h4><p>Founder · Community garden organizer</p>{draft === null ? <><p>{bio}</p><Button size="sm" onClick={() => edit(bio)}>Edit demo bio</Button></> : <form className="space-y-2" onSubmit={e => { e.preventDefault(); setBio(draft.trim()); edit(null); }}><Textarea value={draft} onChange={e => edit(e.target.value)} aria-label="Demo bio" maxLength={400} required /><Button size="sm" type="submit" disabled={!draft.trim()}>Save demo bio</Button> <Button size="sm" type="button" variant="outline" onClick={() => edit(null)}>Cancel</Button></form>}</>}
        {view === 'business' && <><h4 className="font-semibold">Greenway Commons</h4><p>Community garden planning and volunteer training.</p><dl className="space-y-1"><dt className="font-semibold">Your role</dt><dd>Founder and project lead</dd><dt className="font-semibold">Team</dt><dd>Avery Chen · Sam Rivera, site coordinator</dd></dl><Button size="sm" onClick={() => go('project')}>Open Neighborhood Garden Pilot</Button></>}
        {view === 'project' && <><h4 className="font-semibold">Neighborhood Garden Pilot</h4><p>Milestone: get the site ready for the first volunteer day.</p><label className="flex items-start gap-2"><input className="mt-1" type="checkbox" checked={done} onChange={e => complete(e.target.checked)} />{task}</label><p role="status">Task status: {done ? 'Complete' : 'To do'}</p><Button size="sm" variant="outline" onClick={() => go('deck')}>Back to Command Deck</Button></>}
      </div>
    </>}
  </section>;
}