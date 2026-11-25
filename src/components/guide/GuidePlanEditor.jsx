import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { directions, planFields, planKey, resolvePlanReferences } from '@/components/guide/guidePlan';
import { sourceHref } from '@/components/intelligence/intelligenceSources';
import GuideMissionHandoff from '@/components/guide/GuideMissionHandoff';

export default function GuidePlanEditor({ initial, owner, onSave, onDirty, deferMissionHandoff, links = [] }) {
  const uid = useId(), client = useQueryClient();
  const [draft,setDraft] = useState(initial);
  const [saved,setSaved] = useState(null);
  const set = (key,value) => { save.reset(); onDirty?.(true); setDraft(previous => ({...previous,[key]:value})); };
  const save = useMutation({ mutationFn: async () => {
    const links = await resolvePlanReferences(draft.references);
    const safe = new Set(links.map(ref => `${ref.kind}:${ref.id}`));
    const references = draft.references.filter(ref => safe.has(`${ref.kind}:${ref.id}`));
    const payload = { title:draft.title.trim(), objective:draft.objective, direction:draft.direction, references,
      ...Object.fromEntries(planFields.map(([key]) => [key,draft[key]?.trim() || ''])) };
    return initial.id ? base44.entities.GuideActionPlan.update(initial.id,payload) : base44.entities.GuideActionPlan.create(payload);
  }, onSuccess: record => { if (!initial.id) setSaved(record); onDirty?.(false); client.invalidateQueries({queryKey:planKey(owner)}); onSave?.(record); } });
  return <><form className="space-y-3" onSubmit={e => { e.preventDefault(); if (!save.isPending && !saved && draft.title.trim() && draft.first_action.trim()) save.mutate(); }}>
    <h4 className="font-semibold">Review your action plan</h4>
    <p className="text-sm text-muted-foreground">Saving approves only this private Planner draft. It won’t publish a Mission, send messages, or assign work.</p>
    <fieldset disabled={save.isPending || !!saved} className="grid gap-3 sm:grid-cols-2">
      <label htmlFor={`${uid}-title`} className="space-y-1 text-sm">Plan title<Input id={`${uid}-title`} className="bg-background" maxLength={200} required value={draft.title} onChange={e => set('title',e.target.value)} /></label>
      <label htmlFor={`${uid}-direction`} className="space-y-1 text-sm">Recommended direction<select id={`${uid}-direction`} className="block h-9 w-full rounded-md border border-input bg-background px-2" value={draft.direction} onChange={e => set('direction',e.target.value)}>{Object.entries(directions).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      {planFields.map(([key,label,max]) => <label key={key} htmlFor={`${uid}-${key}`} className="space-y-1 text-sm">{label}<Textarea id={`${uid}-${key}`} className="bg-background" rows={2} maxLength={max} required={key === 'first_action'} value={draft[key] || ''} onChange={e => set(key,e.target.value)} /></label>)}
    </fieldset>
    {links.some(sourceHref) && <div className="space-y-2 text-sm"><p className="font-semibold">Related sources</p><ul className="space-y-1">{links.filter(sourceHref).map(ref => <li key={`${ref.kind}:${ref.id}`}><Link className="underline" to={sourceHref(ref)}>{ref.title}</Link></li>)}</ul></div>}
    {draft.direction === 'explore_existing' && <Link className="block text-sm underline" to="/GlobalImpactDashboard?workspace=radar">Find existing initiatives in Collaboration Radar</Link>}
    {draft.direction === 'gather_information' && <Link className="block text-sm underline" to={`/Intelligence?objective=${encodeURIComponent(draft.objective)}`}>Investigate this goal in Saint Intelligence</Link>}
    {saved ? <p role="status" className="text-sm">Private plan saved. {!onSave && <Link className="font-semibold underline" to={`/Planner?guidePlan=${encodeURIComponent(saved.id)}#guide-action-plans`}>Open in Planner</Link>}</p> : <Button type="submit" disabled={save.isPending || !draft.title.trim() || !draft.first_action.trim()}>{save.isPending ? 'Saving…' : initial.id ? 'Save changes' : 'Approve and save private plan'}</Button>}
    {initial.id && save.isSuccess && <p role="status" className="text-sm">Changes saved.</p>}
    {save.isError && <p role="alert" className="text-sm">Couldn’t save the plan. Try again.</p>}
  </form>{saved && !deferMissionHandoff && <GuideMissionHandoff plan={saved} owner={owner} />}</>;
}