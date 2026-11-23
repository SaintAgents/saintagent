import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { myGroupsFilter } from '@/components/groups/myGroupsQuery';

export default function SidePanelMyGroups({ onNavigate }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const email = user?.email;
  const groups = useInfiniteQuery({
    queryKey: ['circles', 'my-group-shortcuts', email],
    enabled: !!email,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.Circle.filter(myGroupsFilter(email), { sort: 'name', limit: 20, cursor: pageParam }),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
  if (!email) return null;
  const items = groups.data?.pages.flatMap(page => page.items) ?? [];
  const closeOnNavigate = event => {
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onNavigate?.();
  };

  return <section data-readable-surface className="mt-2 rounded-xl border bg-card p-2 text-card-foreground">
    <nav aria-label="My Groups">
      <p className="mb-1 px-1 text-xs font-semibold">My Groups</p>
      {groups.isPending && <p className="px-1 py-1 text-xs text-muted-foreground" role="status">Loading groups…</p>}
      {groups.isError && <div className="px-1 py-1 text-xs"><p role="status">Couldn’t load {groups.isFetchNextPageError ? 'more groups' : 'your groups'}.</p><Button variant="ghost" size="sm" onClick={() => groups.isFetchNextPageError ? groups.fetchNextPage() : groups.refetch()}>Retry</Button></div>}
      {groups.isSuccess && !items.length && <p className="px-1 py-1 text-xs text-muted-foreground">Groups you join or create will appear here. <Link className="underline" to="/Circles" onClick={closeOnNavigate}>Browse groups</Link></p>}
      {!!items.length && <ul className="space-y-0.5">
        {items.map(group => <li key={group.id}>
          <Link to={`/Circles?group=${encodeURIComponent(group.id)}`} title={group.name} onClick={closeOnNavigate}
            aria-current={params.get('group') === group.id ? 'page' : undefined}
            className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{group.name}</span>
          </Link>
        </li>)}
      </ul>}
      {groups.hasNextPage && !groups.isFetchNextPageError && <Button variant="ghost" size="sm" disabled={groups.isFetchingNextPage} onClick={() => groups.fetchNextPage()}>{groups.isFetchingNextPage ? 'Loading…' : 'Show more groups'}</Button>}
    </nav>
  </section>;
}