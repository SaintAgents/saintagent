import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GuidePlanEditor from '@/components/guide/GuidePlanEditor';
import { suggestedPlan } from '@/components/guide/guidePlan';
import { perspectives } from '@/components/guide/guideEngine';
import { openDeepDive } from '@/components/deepdive/deepDive';
import { sourceHref } from '@/components/intelligence/intelligenceSources';

export default function GuideResult({ result, userId, onSave, onMissionDraft }) {
  return <section className="space-y-5 border-t pt-5" aria-label="Guide results" aria-live="polite">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Path Forward · {result.memoryUsed ? 'Blueprint included' : 'No Blueprint used'}</p><h3 className="mt-1 text-xl font-semibold">{result.recommendation}</h3>{result.why && <p className="mt-1 text-sm">{result.why}</p>}</div>
    {result.studyId && <Button variant="outline" type="button" onClick={() => openDeepDive({id:result.studyId})}>Open Deep Dive report</Button>}
    <div><h4 className="font-semibold">What the sources support</h4>{result.evidence.length ? <ul className="mt-2 space-y-2 text-sm">{result.evidence.map(({ finding, citations }, index) => <li key={index}>{finding}<ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">{citations.map(n => <li key={n}><Link className="underline underline-offset-2" to={sourceHref(result.sources[n - 1])}>[{n}] {result.sources[n - 1].title}</Link></li>)}</ul></li>)}</ul> : <p className="text-sm text-muted-foreground">No cited finding was available. Treat this plan as a starting hypothesis, not verified research.</p>}</div>
    {result.questions.length > 0 && <div><h4 className="font-semibold">What to clarify</h4><ul className="list-disc space-y-1 pl-5 text-sm">{result.questions.map((question, index) => <li key={index}>{question}</li>)}</ul></div>}
    {result.lenses && <div><h4 className="font-semibold">Seven-Point Guidance</h4><p className="mb-2 text-sm text-muted-foreground">Reflection and symbolism, not factual claims or predictions.</p><dl className="grid gap-2 sm:grid-cols-2">{Object.entries(perspectives).map(([key, [label]], i) => <div key={key} className="rounded-lg border p-3"><dt className="text-sm font-semibold">{i + 1}. {label}</dt><dd className="mt-1 text-sm">{result.lenses[key] || 'No interpretation available for this lens.'}</dd></div>)}</dl></div>}
    <GuidePlanEditor initial={suggestedPlan(result)} owner={userId} onSave={onSave} onMissionDraft={onMissionDraft} links={result.sources.filter((_,i) => result.evidence.some(row => row.citations.includes(i + 1)))} />
  </section>;
}