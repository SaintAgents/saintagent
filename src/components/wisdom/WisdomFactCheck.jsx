import React from 'react';
import { dateLabel, safeUrl } from '@/components/wisdom/wisdomCards';

export default function WisdomFactCheck({ check }) {
  if (!check?.verdict) return null;
  return <section className="space-y-3 rounded-lg border bg-card p-4">
    <h3 className="font-heading text-base font-semibold">AI fact-check: {check.verdict} · {check.confidence}% confidence</h3>
    <p className="text-xs text-muted-foreground">{check.checker} · {dateLabel(check.checked_at)}</p>
    <p className="whitespace-pre-wrap text-sm">{check.summary}</p>
    {!!check.claims?.length && <div><h4 className="font-semibold">Claims and evidence</h4><ul className="space-y-2 pl-5 text-sm list-disc">{check.claims.map((claim,i) => <li key={i}><strong>{claim.claim}</strong> — {claim.assessment}<p>{claim.evidence}</p></li>)}</ul></div>}
    {[['Corrections',check.corrections],['Missing context',check.missing_context],['Teaching points',check.teaching_points]].map(([label,items]) => !!items?.length && <div key={label}><h4 className="font-semibold">{label}</h4><ul className="list-disc pl-5 text-sm">{items.map((item,i) => <li key={i}>{item}</li>)}</ul></div>)}
    {!!check.sources?.length && <div><h4 className="font-semibold">Evidence sources</h4><ul className="space-y-2 text-sm">{check.sources.map((source,i) => {
      const url = safeUrl(source.url);
      return url && <li key={i}><strong>{source.relationship}:</strong> <a href={url} target="_blank" rel="noreferrer" className="underline">{source.title || url}</a><p>{source.note}</p></li>;
    })}</ul></div>}
    <p className="text-xs text-muted-foreground">An AI fact-check is evidence for readers, not a substitute for human judgment.</p>
  </section>;
}