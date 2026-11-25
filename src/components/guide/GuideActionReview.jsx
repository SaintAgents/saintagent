import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { actionFields } from '@/components/guide/guideActionDraft';

export default function GuideActionReview({ draft, setDraft, busy, save }) {
  const update = (index, changes) => setDraft({...draft, actions:draft.actions.map((action,i) => i === index ? {...action,...changes} : action)});
  if (!draft.actions.length) return <p role="status" className="text-sm">No actionable details found. Add a commitment or expected next step to the notes and try again.</p>;
  return <form className="space-y-3" onSubmit={e => {e.preventDefault(); save();}}>
    <label className="block space-y-1 text-sm font-medium">Draft title<Input required maxLength={160} value={draft.title} onChange={e => setDraft({...draft,title:e.target.value})} disabled={busy} /></label>
    {draft.actions.map((item,index) => <fieldset key={index} className="space-y-2 rounded-md border p-3" disabled={busy}>
      <legend className="px-2 text-sm font-semibold">Action {index+1}</legend>
      <div className="grid gap-2 sm:grid-cols-2">{actionFields.map(([key,label,max]) => <label className="space-y-1 text-sm" key={key}>{label}<Input required={key === 'task'} maxLength={max} placeholder={key === 'owner' ? 'Unassigned' : key === 'deadline' ? 'Not set' : undefined} value={item[key]} onChange={e => update(index, key === 'task' && item.task !== e.target.value ? {task:e.target.value,commitment:'proposed',evidence:''} : {[key]:e.target.value})} /></label>)}</div>
      <div className="flex flex-wrap items-center gap-2"><label className="text-sm">Status <select className="rounded border bg-background px-2 py-1" value={item.commitment} onChange={e => update(index,{commitment:e.target.value})}><option value="proposed">Proposed</option><option value="confirmed">Confirmed commitment</option></select></label>
      {draft.actions.length > 1 && <Button variant="outline" size="sm" type="button" onClick={() => setDraft({...draft,actions:draft.actions.filter((_,i) => i !== index)})}>Remove action {index+1}</Button>}</div>
      {item.evidence && <p className="break-words text-sm text-muted-foreground">Source excerpt: “{item.evidence}”</p>}
    </fieldset>)}
    <Button type="submit" disabled={busy || !draft.title.trim() || draft.actions.some(action => !action.task.trim())}>{busy ? 'Saving…' : 'Save private draft'}</Button>
  </form>;
}