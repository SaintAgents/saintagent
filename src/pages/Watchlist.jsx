import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WatchTimeline from '@/components/watch/WatchTimeline';
import WatchlistGroups from '@/components/watch/WatchlistGroups';
import { activeWatches, watchKey } from '@/components/watch/watchItems';

export default function Watchlist() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const owner = params.get('member') || user.id;
  const mine = owner === user.id;
  const allowed = mine || user.role === 'admin';
  const key = watchKey(owner), filter = activeWatches(owner);
  const client = useQueryClient();
  const query = useInfiniteQuery({ queryKey: [...key, 'page'], enabled: allowed, retry: false, initialPageParam: undefined,
    queryFn: ({pageParam}) => base44.entities.WatchItem.filter(filter, { sort: '-created_date', limit: 30, cursor: pageParam }),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
  const stats = useQuery({ queryKey: [...key, 'stats'], enabled: allowed, retry: false, queryFn: async () => {
    const [total, groups, types] = await Promise.all([base44.entities.WatchItem.count(filter),
      base44.entities.WatchItem.aggregate({query: filter, groupBy: 'watchlist_name'}), base44.entities.WatchItem.aggregate({query: filter, groupBy: 'item_type'})]);
    return { total, groups: groups.rows, types: types.rows.length };
  }});
  const items = query.data?.pages.flatMap(page => page.items) || [];
  const refreshing = query.isFetching || stats.isFetching;
  if (!allowed) return <section className="p-6"><h1 className="text-2xl font-bold">Watchlist</h1><p>This member’s Watchlist is private.</p><a className="underline" href="/Watchlist">Open my Watchlist</a></section>;
  const listing = <WatchlistGroups key={owner} items={items} counts={new Map(stats.data?.groups.map(row => [row.watchlist_name, row.count]))} owner={owner} email={mine ? user.email : undefined} editable={mine} />;
  return <section className="mx-auto max-w-5xl space-y-4 px-4 py-6 pb-24 text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{mine ? 'My Watchlist' : 'Member Watchlist'}</h1><p className="text-muted-foreground">{mine ? 'Follow records and review related activity.' : 'Read-only view'}</p></div><Button variant="outline" disabled={refreshing} onClick={() => client.invalidateQueries({queryKey: key})}>{refreshing ? 'Refreshing…' : 'Refresh'}</Button></header>
    {stats.data && <dl className="grid grid-cols-3 gap-2">{[['Watched items', stats.data.total], ['Watchlists', stats.data.groups.length], ['Record types', stats.data.types]].map(([label, count]) => <div key={label} className="rounded-lg border bg-card p-3 text-card-foreground"><dt className="text-sm">{label}</dt><dd className="text-xl font-bold">{count}</dd></div>)}</dl>}
    {stats.isError && <p role="alert">Watchlist totals are unavailable.</p>}
    {query.isPending ? <p role="status">Loading watches…</p> : query.isError && !items.length ? <p role="alert">Could not load watches. Use Refresh to try again.</p> : !items.length ? <p>No watched items yet. Use Watch on a supported record to add it here.</p> : mine ? <Tabs defaultValue="list"><TabsList><TabsTrigger value="list">Watchlists</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger></TabsList><TabsContent className="space-y-3" value="list"><WatchTimeline items={items} owner={owner} email={user.email} summaryOnly />{listing}</TabsContent><TabsContent value="timeline"><WatchTimeline items={items} owner={owner} email={user.email} /></TabsContent></Tabs> : listing}
    {query.isFetchNextPageError && <p role="alert">Could not load more watches. Try again.</p>}
    {query.hasNextPage && <Button variant="outline" disabled={query.isFetching} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : 'Load more watches'}</Button>}
  </section>;
}