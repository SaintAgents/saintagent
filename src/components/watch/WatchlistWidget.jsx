import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { activeWatches, itemPath, watchKey } from '@/components/watch/watchItems';

export default function WatchlistWidget({ user, visible }) {
  const query = useQuery({ queryKey: [...watchKey(user.id), 'widget'], enabled: visible, staleTime: 30000, retry: false,
    queryFn: () => base44.entities.WatchItem.filter(activeWatches(user.id), '-created_date', 30) });
  if (!visible) return null;
  return <div className="dock-links space-y-1 text-sm [&>a]:block [&>a]:break-words [&_a]:underline [&_button]:underline">
    <div className="flex flex-wrap gap-2"><Link to="/Watchlist">Open Watchlist</Link><button type="button" disabled={query.isFetching} onClick={() => query.refetch()}>{query.isFetching ? 'Refreshing…' : 'Refresh'}</button></div>
    {query.isPending ? <p role="status">Loading watches…</p> : query.isError ? <p role="alert">Could not load your watches.</p> : !query.data.length ? <p>No watched items yet.</p> : query.data.map(item => itemPath(item) ? <a key={item.id} href={itemPath(item)}>{item.display_name}</a> : <p key={item.id}>{item.display_name}</p>)}
  </div>;
}