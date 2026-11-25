export default function CommandStageEvidence({ result }) {
  if (!result) return <p>Build an action plan first to see the evidence.</p>;
  const { evidence, sources, questions, studyId } = result;
  const cited = new Set(evidence.flatMap(row => row.citations));
  return <>
    <p className="font-semibold">{evidence.length} cited {evidence.length === 1 ? 'finding' : 'findings'} · {sources.length} {sources.length === 1 ? 'source' : 'sources'}</p>
    {evidence.length ? <ul className="list-disc space-y-2 pl-4">{evidence.map(({ finding, citations }, i) => <li key={i}>{finding} <small className="text-muted-foreground">{citations.map(n => `[${n}]`).join(' ')}</small></li>)}</ul>
      : <p>No cited findings were returned. Treat the recommendation as a starting hypothesis.</p>}
    {!!sources.length && <div className="space-y-2">
      <p className="font-semibold">{studyId ? 'Provisional research notes' : 'Source records and excerpts'}</p>
      <ol className="space-y-2">{sources.map((source, i) => <li key={`${source.kind}:${source.id}`} className="border-l pl-2">
        <p className="font-medium">[{i + 1}] {source.title}{!cited.has(i + 1) && <small className="ml-1 text-muted-foreground">· Not cited</small>}</p>
        {source.excerpt && <blockquote className="whitespace-pre-line text-xs">{source.excerpt}</blockquote>}
      </li>)}</ol>
    </div>}
    {!!questions.length && <div><p className="font-semibold">Open questions</p><ul className="list-disc space-y-1 pl-4">{questions.map((question, i) => <li key={i}>{question}</li>)}</ul></div>}
  </>;
}