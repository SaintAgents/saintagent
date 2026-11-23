import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GitBranch } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { sourceHref, sourceTypes } from '@/components/intelligence/intelligenceSources';

const labels = {evidence:'Source evidence', interpretation:'Interpretation', hypothesis:'Hypothesis', unresolved:'Unresolved'};
export default function IntelligenceReport({ id, owner, onBranch, busy }) {
  const query = useQuery({queryKey:['intelligence-study',owner,id],retry:false,queryFn:async () => (await base44.entities.IntelligenceStudy.filter({id,created_by_id:owner},'-created_date',1))[0] || null});
  if (query.isPending) return <p role="status">Loading investigation…</p>;
  if (query.isError) return <p role="alert">Could not open this investigation. <Button variant="outline" size="sm" onClick={() => query.refetch()}>Retry</Button></p>;
  const report = query.data;
  if (!report) return <p>This investigation is unavailable.</p>;
  return <article data-intel-panel className="space-y-5 rounded-lg border p-4 sm:p-6">
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-widest">Saved research brief · {new Date(report.created_date).toLocaleDateString()}</p>
      <h2 className="break-words font-heading text-2xl font-semibold">{report.objective}</h2>
      {report.parent_id && <Link className="text-sm underline" to={`/Intelligence?study=${encodeURIComponent(report.parent_id)}`}>Open original investigation</Link>}
      <p className="whitespace-pre-line break-words">{report.summary}</p>
      <p className="text-xs">AI-generated from accessible excerpts. Citations show what was consulted, not independent verification.</p>
    </header>
    {Object.entries(labels).map(([kind,label]) => {
      const findings = report.findings.filter(item => item.kind === kind);
      return findings.length > 0 && <section key={kind}><h3 className="mb-2 font-semibold">{label}</h3><ul className="space-y-2 pl-5 list-disc">{findings.map((item,i) => <li key={i} className="break-words">{item.text}{item.citations.map(n => report.sources[n-1] && <a className="ml-1 underline" key={n} href={`#study-${report.id}-source-${n}`} aria-label={`Source ${n}`}>[{n}]</a>)}</li>)}</ul></section>;
    })}
    {!!report.next_steps.length && <section><h3 className="font-semibold">Suggested next steps</h3><ul className="list-disc space-y-1 pl-5">{report.next_steps.map((step,i) => <li className="break-words" key={i}>{step}</li>)}</ul></section>}
    <section><h3 className="mb-2 font-semibold">Sources consulted</h3><ol className="list-decimal space-y-2 pl-5">{report.sources.map((ref,i) => <li key={i} id={`study-${report.id}-source-${i+1}`} className="scroll-mt-36 break-words">{sourceHref(ref) ? <Link to={sourceHref(ref)} className="underline">{ref.title}</Link> : ref.title} <span className="text-xs">· {sourceTypes[ref.kind]?.[0]}</span></li>)}</ol></section>
    <Button type="button" variant="outline" onClick={() => onBranch(report)} disabled={!!busy}><GitBranch /> Expand as a new branch</Button>
  </article>;
}