import { useId } from 'react';
import { Link } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sourceHref, sourceTypes } from '@/components/intelligence/intelligenceSources';
import DeepDivePlan from '@/components/deepdive/DeepDivePlan';

const labels = { evidence:'What the sources say', interpretation:'Interpretation', hypothesis:'Hypothesis', unresolved:'Open questions & possible conflicts' };
const matches = ['person','mentor','project','mission','listing','course','organization'];
const dateLabel = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(value)) : null;
export default function DeepDiveReport({ report, owner, busy, branch, onParent, onOpenStudy }) {
  const prefix = useId();
  const linked = report.sources.filter(ref => matches.includes(ref.kind) && ref.matched?.length);
  const direct = report.sources.filter(ref => ref.kind !== 'library').length;
  return <article className="space-y-5 text-sm">
    <header className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest">{report.id ? 'Saved investigation' : 'Unsaved investigation'}{dateLabel(report.created_date) && ` · ${dateLabel(report.created_date)}`}</p><h3 className="break-words font-heading text-2xl font-semibold">{report.objective}</h3><p className="whitespace-pre-line break-words">{report.summary}</p><p className="text-muted-foreground">Evidence coverage: {direct} platform {direct === 1 ? 'record' : 'records'} · {report.sources.length - direct} prior briefs. Confidence is provisional; no independent verification was performed.</p>{report.parent_id && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onParent}>Open original investigation</Button>}</header>
    {Object.entries(labels).map(([kind,label]) => {
      const rows = report.findings.filter(row => row.kind === kind);
      return rows.length > 0 && <section key={kind} className="space-y-2"><h4 className="font-semibold">{label}</h4><ul className="space-y-2">{rows.map((row,i) => <li key={i} className="break-words border-l pl-3">{row.text}{row.citations.map(n => report.sources[n-1] && <a className="ml-1 underline" key={n} href={`#${prefix}-${n}`} aria-label={`Source ${n}`}>[{n}]</a>)}{report.id && <button type="button" disabled={busy} onClick={() => branch(row.text)} className="ml-2 inline-flex items-center gap-1 text-xs underline"><GitBranch size={13} /> Drill deeper</button>}</li>)}</ul></section>;
    })}
    {!!report.next_steps.length && <section className="space-y-2"><h4 className="font-semibold">Suggested next steps</h4><ol className="list-decimal space-y-1 pl-5">{report.next_steps.map((step,i) => <li key={i} className="break-words">{step}</li>)}</ol></section>}
    <section className="space-y-2"><h4 className="font-semibold">Sources inspected</h4><ol className="list-decimal space-y-2 pl-5">{report.sources.map((ref,i) => <li key={i} id={`${prefix}-${i+1}`} className="scroll-mt-4 break-words">{ref.kind === 'library' && onOpenStudy && sourceHref(ref) ? <button type="button" className="underline" disabled={busy} onClick={() => onOpenStudy(ref.id)}>{ref.title}</button> : sourceHref(ref) ? <Link className="underline" to={sourceHref(ref)}>{ref.title}</Link> : ref.title} <span className="text-muted-foreground">· {sourceTypes[ref.kind]?.[0]}{dateLabel(ref.date) && ` · ${dateLabel(ref.date)}`}{ref.kind === 'library' && ' · AI-generated brief'}</span></li>)}</ol></section>
    {!!linked.length && <section className="space-y-2"><h4 className="font-semibold">Related SaintAgent records</h4><p className="text-muted-foreground">Matched by search terms, not endorsements or confirmed availability.</p><ul className="space-y-2">{linked.map(ref => <li key={`${ref.kind}:${ref.id}`} className="break-words"><Link to={sourceHref(ref)} className="underline">{ref.title}{ref.kind === 'mentor' && !ref.profile_number && ' (mentor directory)'}</Link> · {sourceTypes[ref.kind][0]} · Matched: {ref.matched.join(', ')}</li>)}</ul></section>}
    {report.id ? <div className="space-y-3"><Button type="button" variant="outline" disabled={busy} onClick={() => branch(report.objective)}><GitBranch /> Expand as a branch</Button>{report.next_steps.length > 0 && <DeepDivePlan key={report.id} report={report} owner={owner} />}</div> : <p>Save this investigation to branch from its findings or prepare a Planner draft.</p>}
  </article>;
}