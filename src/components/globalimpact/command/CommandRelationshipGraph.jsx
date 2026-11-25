import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';
import { sourceHref } from '@/components/intelligence/intelligenceSources';

function position(index, total, x, orbit) {
  const y = total === 1 ? 140 : 27 + index * (226 / (total - 1));
  return [x + orbit * Math.sin(y * Math.PI / 280), y];
}
export default function CommandRelationshipGraph({ result }) {
  const [selected, setSelected] = useState(null);
  const findings = result?.evidence || [];
  const ids = [...new Set(findings.flatMap(finding => finding.citations))].sort((a,b) => a-b);
  const active = selected?.result === result ? selected.index : 0;
  const finding = findings[active];
  const fp = i => position(i, findings.length, 195, -29);
  const sp = i => position(i, ids.length, 329, 33);
  return <section className="mc-panel mc-relationships" aria-labelledby="mc-graph-title">
    <div className="mc-panel-title"><h2 id="mc-graph-title">Semantic Relationship Intelligence</h2><span>Citation map</span></div>
    <div className="mc-body space-y-3">
      {!finding ? <div className="mc-graph-empty"><Network size={42} aria-hidden="true" /><p>{result ? 'No citation links were returned for this goal.' : 'Run Mission Intelligence to map findings to their source records.'}</p></div> : <>
        <svg className="mc-graph" viewBox="0 0 400 280" role="img" aria-label="Links from the mission goal to cited findings and their sources">
          {findings.map(({citations}, i) => {const [x,y] = fp(i); return <g key={i} className={active === i ? 'mc-edge-current' : 'mc-edge'}><line x1="66" y1="140" x2={x} y2={y} />{citations.map(n => {const [sx,sy] = sp(ids.indexOf(n)); return <line key={n} x1={x} y1={y} x2={sx} y2={sy} />;})}</g>;})}
          <circle cx="66" cy="140" r="9" className="mc-goal-node" /><text x="66" y="163" textAnchor="middle">Goal</text>
          {findings.map((_,i) => {const [x,y] = fp(i); return <g key={i}><circle cx={x} cy={y} r={i === active ? 9 : 6} className={i === active ? 'mc-node-current' : 'mc-node'} /><text x={x-13} y={y+3} textAnchor="end">F{i+1}</text></g>;})}
          {ids.map((n,i) => {const [x,y] = sp(i); return <g key={n}><circle cx={x} cy={y} r="5" className={finding.citations.includes(n) ? 'mc-node-current' : 'mc-node'} /><text x={x-10} y={y+3} textAnchor="end">S{n}</text></g>;})}
        </svg>
        <div className="flex flex-wrap gap-1.5" aria-label="Explore findings">{findings.map((_,i) => <button className="mc-small-button" key={i} type="button" aria-pressed={active === i} onClick={() => setSelected({result,index:i})}>Finding {i+1}</button>)}</div>
        <div className="space-y-2 text-sm" aria-live="polite"><p>{finding.finding}</p><ul className="space-y-1">{finding.citations.map(n => {const source=result.sources[n-1]; const href=sourceHref(source); return <li key={n}>{href ? <Link to={href}>[{n}] {source.title}</Link> : <span>[{n}] {source.title}</span>}</li>;})}</ul></div>
      </>}
    </div>
  </section>;
}