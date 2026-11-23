import { Link } from 'react-router-dom';
import { ArrowUpRight, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sourceHref, sourceTypes } from '@/components/intelligence/intelligenceSources';

export default function IntelligenceResults({ search, onExpand, busy }) {
  if (!search) return null;
  return <section aria-label="Search results" className="space-y-3">
    <h2 className="font-heading text-xl font-semibold">Results for “{search.objective}”</h2>
    {!!search.relatedTerms?.length && <p className="break-words text-sm">AI-added search terms: {search.relatedTerms.join(', ')}</p>}
    {!search.matches.length && <p>No accessible sources matched. Try another phrase or change the source filter.</p>}
    {search.matches.map(ref => <article data-intel-panel key={`${ref.kind}:${ref.id}`} className="space-y-2 rounded-lg border p-4">
      <p className="text-xs uppercase tracking-widest">{sourceTypes[ref.kind]?.[0]}{ref.date && ` · ${new Date(ref.date).toLocaleDateString()}`}</p>
      <h3 className="break-words font-heading text-lg font-semibold">{ref.title}</h3>
      {ref.excerpt && <p className="line-clamp-4 whitespace-pre-line break-words text-sm">{ref.excerpt}</p>}
      {!!ref.matched.length && <p className="break-words text-xs">Matched: {ref.matched.join(', ')}</p>}
      <div className="flex flex-wrap items-center gap-3"><Link className="inline-flex items-center gap-1 text-sm underline" to={sourceHref(ref)}>Open source <ArrowUpRight size={14} /></Link><Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={() => onExpand(ref)}><GitBranch /> Expand research</Button></div>
    </article>)}
  </section>;
}