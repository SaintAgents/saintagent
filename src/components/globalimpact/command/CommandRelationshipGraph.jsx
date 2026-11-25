import { useState } from 'react';
import { Network } from 'lucide-react';
import CommandCitationDiagram from '@/components/globalimpact/command/CommandCitationDiagram';
import CommandCitationInspector from '@/components/globalimpact/command/CommandCitationInspector';

export default function CommandRelationshipGraph({ result }) {
  const [selected, setSelected] = useState(null);
  const findings = result?.evidence ?? [];
  const sources = (result?.sources ?? []).map((source, i) => ({ ...source, number:i+1, linked:findings.flatMap((finding,j) => finding.citations.includes(i+1) ? [j] : []) }));
  const active = selected?.result === result && selected ? selected.active : findings.length ? {finding:0} : {source:1};
  const uncited = sources.filter(source => !source.linked.length).length;
  const shared = sources.filter(source => source.linked.length > 1).length;
  const links = sources.reduce((total, source) => total + source.linked.length, 0);
  const metrics = [['Findings',findings.length],['Sources',sources.length],['Citation links',links],['Shared sources',shared],['Uncited sources',uncited]];
  return <section className="mc-panel mc-relationships" aria-labelledby="mc-graph-title">
    <div className="mc-panel-title"><h2 id="mc-graph-title">Semantic Relationship Intelligence</h2><span>Citation map</span></div>
    <div className="mc-body space-y-3">
      {!result ? <div className="mc-graph-empty"><Network size={42} aria-hidden="true" /><p>Run Mission Intelligence to trace findings to their source records.</p></div> : <>
        <dl className="flex flex-wrap gap-x-4 gap-y-2 text-xs">{metrics.map(([label,value]) => <div key={label}><dt className="mc-muted">{label}</dt><dd className="mc-gold text-base font-bold">{value}</dd></div>)}</dl>
        {!findings.length && <p className="mc-muted text-sm">{sources.length ? 'Sources were retrieved, but no findings cited them.' : 'No accessible sources were retrieved for this goal.'}</p>}
        {!!sources.length && <><CommandCitationDiagram findings={findings} sources={sources} active={active} /><p className="mc-muted text-xs">Larger source nodes are cited by multiple findings; outlined nodes are uncited. Citation links are not independent verification.</p><CommandCitationInspector result={result} sources={sources} active={active} choose={next => setSelected({result,active:next})} /></>}
        {!!result.questions?.length && <div className="mc-gaps text-sm"><h3 className="mc-kicker">Still to verify</h3><ul className="mt-1 list-disc space-y-1 pl-4">{result.questions.map((question,i) => <li key={i}>{question}</li>)}</ul></div>}
      </>}
    </div>
  </section>;
}