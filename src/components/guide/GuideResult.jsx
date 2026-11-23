import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { perspectives } from '@/components/guide/guideEngine';
import { sourceHref } from '@/components/intelligence/intelligenceSources';
import { referenceKey } from '@/components/watch/workspaceReferences';

export default function GuideResult({ result, userId }) {
  const [draft, setDraft] = useState(result.steps.map((step, i) => `${i + 1}. ${step}`).join('\n'));
  const client = useQueryClient();
  const save = useMutation({ mutationFn: () => base44.entities.WorkspaceReference.create({
    kind: 'plan', status: 'draft', title: result.objective.slice(0, 200), note: draft.trim(),
    references: result.sources.filter((_source, i) => result.evidence.some(row => row.citations.includes(i + 1))).map(({ id, kind, title }) => ({ item_type: kind, record_id: id, title, route: sourceHref({ id, kind }), source: 'Saint Intelligence' })),
  }), onSuccess: () => client.invalidateQueries({ queryKey: referenceKey(userId, 'plan') }) });
  return <section className="space-y-5 border-t pt-5" aria-label="Guide results" aria-live="polite">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Path Forward · {result.memoryUsed ? 'Blueprint included' : 'No Blueprint used'}</p><h3 className="mt-1 text-xl font-semibold">{result.recommendation}</h3>{result.why && <p className="mt-1 text-sm">{result.why}</p>}</div>
    <div><h4 className="font-semibold">What the sources support</h4>{result.evidence.length ? <ul className="mt-2 space-y-2 text-sm">{result.evidence.map(({ finding, citations }, index) => <li key={index}>{finding}<ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{citations.map(n => <li key={n}><Link className="underline underline-offset-2" to={sourceHref(result.sources[n - 1])}>[{n}] {result.sources[n - 1].title}</Link></li>)}</ul></li>)}</ul> : <p className="text-sm text-muted-foreground">No cited finding was available. Treat this plan as a starting hypothesis, not verified research.</p>}</div>
    {result.questions.length > 0 && <div><h4 className="font-semibold">What to clarify</h4><ul className="list-disc space-y-1 pl-5 text-sm">{result.questions.map((question, index) => <li key={index}>{question}</li>)}</ul></div>}
    {result.lenses && <div><h4 className="font-semibold">Seven-Point Guidance</h4><p className="mb-2 text-sm text-muted-foreground">Reflection and symbolism, not factual claims or predictions.</p><dl className="grid gap-2 sm:grid-cols-2">{Object.entries(perspectives).map(([key, [label]], i) => <div key={key} className="rounded-lg border p-3"><dt className="text-sm font-semibold">{i + 1}. {label}</dt><dd className="mt-1 text-sm">{result.lenses[key] || 'No interpretation available for this lens.'}</dd></div>)}</dl></div>}
    <div className="space-y-2"><label htmlFor="guide-plan-draft" className="font-semibold">Review and edit your next steps</label><Textarea id="guide-plan-draft" rows={5} maxLength={1000} value={draft} onChange={e => setDraft(e.target.value)} readOnly={save.isSuccess} disabled={save.isPending} />
      {save.isSuccess ? <Link className="text-sm font-semibold underline" to={`/Planner#reference-${encodeURIComponent(save.data.id)}`}>Open saved draft in Planner</Link> : <Button type="button" disabled={!draft.trim() || save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Approve and save as draft'}</Button>}
      {save.isError && <p role="alert" className="text-sm">Could not save your draft. Try again.</p>}
    </div>
  </section>;
}