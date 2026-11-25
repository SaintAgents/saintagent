import { Link } from 'react-router-dom';
import { sourceHref, sourceTypes } from '@/components/intelligence/intelligenceSources';

function describeSource(source) {
  if (!source.linked.length) return 'Not cited in this run';
  return `Cited by ${source.linked.length} ${source.linked.length === 1 ? 'finding' : 'findings'}`;
}
export default function CommandCitationInspector({ result, active, sources, choose }) {
  const source = sources[active.source - 1];
  const finding = result.evidence[active.finding];
  const date = source?.date && Number.isFinite(Date.parse(source.date)) ? new Date(source.date).toLocaleDateString() : null;
  const href = source && sourceHref(source);
  return <div className="space-y-3 border-t pt-3 text-sm" aria-label="Citation evidence inspector">
    {!!result.evidence.length && <div role="group" aria-label="Select a finding" className="flex flex-wrap gap-1.5">{result.evidence.map((row,i) => <button className="mc-small-button" key={i} type="button" aria-pressed={active.finding === i} onClick={() => choose({finding:i})}>F{i+1} · {row.citations.length} {row.citations.length === 1 ? 'source' : 'sources'}</button>)}</div>}
    {!!sources.length && <div role="group" aria-label="Select a source" className="flex flex-wrap gap-1.5">{sources.map(item => <button className="mc-small-button" key={item.number} type="button" title={item.title} aria-label={`S${item.number}: ${item.title}. ${describeSource(item)}.`} aria-pressed={active.source === item.number} onClick={() => choose({source:item.number})}>S{item.number} · {item.linked.length || 'Uncited'}</button>)}</div>}
    <div aria-live="polite" className="space-y-2">
      {finding && <><h3 className="mc-kicker">F{active.finding + 1} · Finding</h3><p>{finding.finding}</p><ul className="space-y-1">{finding.citations.map(n => <li key={n}><button className="mc-small-button text-left" type="button" onClick={() => choose({source:n})}>S{n} · {sources[n-1].title}</button></li>)}</ul></>}
      {source && <><h3 className="font-semibold">S{source.number} · {source.title}</h3><p className="mc-muted text-xs">{source.type || sourceTypes[source.kind]?.[0] || 'Source'}{date && ` · ${date}`} · {describeSource(source)}</p>
        {!!source.matched?.length && <p className="mc-muted text-xs">Matched terms: {source.matched.join(', ')}</p>}
        {source.excerpt && <div className="space-y-1"><h4 className="mc-kicker">{result.studyId ? 'Provisional research notes' : source.kind === 'demo' ? 'Sample excerpt' : 'Retrieved excerpt'}</h4><blockquote className="mc-gaps whitespace-pre-line">{source.excerpt}</blockquote></div>}
        {href && <Link to={href}>Open source record</Link>}
        {!!source.linked.length && <ul className="space-y-1">{source.linked.map(i => <li key={i}><button className="mc-small-button text-left" type="button" onClick={() => choose({finding:i})}>F{i+1} · {result.evidence[i].finding}</button></li>)}</ul>}
      </>}
    </div>
  </div>;
}