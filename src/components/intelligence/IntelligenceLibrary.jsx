import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function IntelligenceLibrary({ owner, current, samples, demoHref, demoButton }) {
  const query = useInfiniteQuery({queryKey:['intelligence-library',owner],enabled:!samples,retry:false,initialPageParam:undefined,
    queryFn:({pageParam}) => base44.entities.IntelligenceStudy.filter({created_by_id:owner},{limit:12,sort:'-created_date',cursor:pageParam}),
    getNextPageParam:page => page.has_more ? page.next_cursor : undefined});
  const rows = query.data?.pages.flatMap(page => page.items) || [];
  return <aside data-intel-panel className="space-y-4 rounded-lg border p-4" aria-label="My Research">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><BookOpen size={18} /> My Research</h2>{demoButton}</div>
    {samples ? <ul className="space-y-3">{samples.map(row => <li key={row.id} className="border-t pt-3 text-sm"><Link className="block break-words underline" to={demoHref(row.id)} aria-current={current === row.id ? 'page' : undefined}>{row.objective}</Link><p className="text-xs">{row.parent_id ? 'Sample branch' : 'Sample investigation'}</p></li>)}</ul> : <>
    {query.isPending && <p role="status">Loading research…</p>}
    {query.isError && <p role="alert">Could not load research. <Button size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button></p>}
    {query.isSuccess && !rows.length && <p className="text-sm">Your saved Deep Dives and branches will appear here.</p>}
    <ul className="space-y-3">{rows.map(row => <li key={row.id} className="border-t pt-3 text-sm"><Link className="block break-words underline" to={`/Intelligence?study=${encodeURIComponent(row.id)}`} aria-current={current === row.id ? 'page' : undefined}>{row.objective}</Link><p className="text-xs">{row.parent_id ? 'Branch' : 'Investigation'} · {new Date(row.created_date).toLocaleDateString()}</p></li>)}</ul>
    {query.hasNextPage && <Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button>}
    <Link className="inline-block text-sm underline" to="/SavedItems?tab=research">Open saved research cards</Link>
    </>}
  </aside>;
}