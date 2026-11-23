import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { titlePattern } from '@/components/vault/vault';
import ResearchBrowserItem from '@/components/deepdive/ResearchBrowserItem';

export default function ResearchBrowser({ owner, view, onInvestigate }) {
  const cards = view === 'cards';
  const label = cards ? 'research cards' : 'published insights';
  const [input, setInput] = useState(''), [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);
  const query = useInfiniteQuery({
    queryKey: [...(cards ? ['workspace-references', owner, 'research'] : ['newsArticles']), 'deep-dive-browser', owner, search],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => {
      const filter = cards ? { created_by_id: owner, kind: 'research' } : { is_published: true };
      const fields = cards ? ['title', 'note', 'references.title'] : ['title', 'summary', 'category', 'tags'];
      if (search) filter.$or = fields.map(field => ({ [field]: titlePattern(search) }));
      const entity = cards ? base44.entities.WorkspaceReference : base44.entities.NewsArticle;
      return entity.filter(filter, { sort: cards ? '-updated_date' : '-published_date', limit: 12, cursor: pageParam });
    },
    getNextPageParam: page => page.next_cursor || undefined,
  });
  const rows = query.data?.pages.flatMap(page => page.items) || [];
  return <section aria-label={label} className="space-y-3">
    <p className="text-sm">{cards ? 'Open your saved cards, review their notes and linked records, or use one as a starting point.' : 'Browse published SaintAgent insights and use an article as a source in your investigation.'}</p>
    <Input type="search" aria-label={`Search ${label}`} placeholder={`Search ${label}…`} value={input} maxLength={120} onChange={event => { setInput(event.target.value); setSelected(null); }} />
    {query.isPending && <p role="status">Loading {label}…</p>}
    {query.isError && !rows.length && <p role="alert">Could not load {label}. <Button type="button" size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button></p>}
    {query.isSuccess && !rows.length && <p className="text-sm">{search ? 'No matching results.' : cards ? 'No saved research cards yet. Use Save To… on a record to start a card.' : 'No published insights yet.'}</p>}
    <ul className="space-y-2">{rows.map(row => <ResearchBrowserItem key={row.id} {...{ row, cards, onInvestigate }} expanded={selected === row.id} toggle={() => setSelected(selected === row.id ? null : row.id)} />)}</ul>
    {query.hasNextPage && <Button type="button" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : query.isFetchNextPageError ? 'Retry loading more' : 'Load more'}</Button>}
  </section>;
}