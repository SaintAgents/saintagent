import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SharedSearch() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const results = useInfiniteQuery({
    queryKey: ['shared-project-search', user?.id, query], enabled: !!user && query.length >= 2, retry: false,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => (await base44.functions.invoke('searchSharedProjects', { query, cursor: pageParam })).data,
    getNextPageParam: page => page.nextCursor ?? undefined,
  });
  const items = results.data?.pages.flatMap(page => page.items) ?? [];
  function submit(event) {
    event.preventDefault();
    const term = input.trim();
    if (term.length < 2) return;
    if (term === query) results.refetch();
    else setQuery(term);
  }
  return <section className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-24 pt-6 sm:px-6">
    <Link to="/GlobalImpactDashboard" className="inline-flex items-center gap-2 text-sm underline underline-offset-4"><ArrowLeft className="size-4" /> Global Impact Dashboard</Link>
    <header className="space-y-2"><h1 className="font-heading text-3xl font-bold">Shared Search</h1><p>Find projects and funding opportunities approved for sharing.</p></header>
    <form role="search" onSubmit={submit} className="space-y-2">
      <label htmlFor="shared-search-query" className="text-sm font-medium">Search by title or summary</label>
      <div className="flex gap-2"><Input id="shared-search-query" type="search" value={input} onChange={event => setInput(event.target.value)} minLength={2} maxLength={120} required /><Button type="submit" disabled={input.trim().length < 2 || results.isFetching}><Search aria-hidden="true" /> Search</Button></div>
    </form>
    <p className="text-sm">SaintAgent projects are included. Gaia Global Treasury isn’t connected yet.</p>
    {query && <div className="space-y-3" aria-busy={results.isFetching}>
      <h2 className="font-heading text-xl font-semibold">Results for “{query}”</h2>
      {results.isPending && <p role="status">Searching SaintAgent…</p>}
      {results.isError && !results.isFetchNextPageError && <p role="alert">Couldn’t search SaintAgent. Select Search to try again.</p>}
      {results.isSuccess && !items.length && <p>No shared projects matched your search.</p>}
      {!!items.length && <ul className="space-y-3">{items.map((item, index) => <li key={`${item.link}-${index}`} className="break-words rounded-lg border bg-card p-4 text-card-foreground">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide">SaintAgent · Project</p>
        <h3 className="font-heading text-lg font-semibold"><a href={item.link} className="underline underline-offset-4">{item.title}</a></h3>
        <p className="mt-2 text-sm">{item.summary}</p>
      </li>)}</ul>}
      {results.isFetchNextPageError && <p role="alert">Couldn’t load more results. Select Load more to retry.</p>}
      {results.hasNextPage && <Button variant="outline" disabled={results.isFetching} onClick={() => results.fetchNextPage()}>{results.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button>}
    </div>}
  </section>;
}