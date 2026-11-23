import { useQuery } from '@tanstack/react-query';
import { watchActivity } from '@/components/watch/watchActivity';
import { watchDate, watchKey } from '@/components/watch/watchItems';

export default function WatchTimeline({ items, owner, email, summaryOnly = false }) {
  const query = useQuery({ queryKey: [...watchKey(owner), 'timeline', items.map(item => item.id), !!email], enabled: items.length > 0, retry: false, staleTime: 30000, queryFn: () => watchActivity(items, email) });
  if (!items.length) return <p>No watched items yet.</p>;
  if (query.isPending) return <p role="status">Checking current activity…</p>;
  if (query.isError) return <p role="alert">Could not load activity. <button className="underline" onClick={() => query.refetch()}>Retry</button></p>;
  const recent = query.data.filter(entry => entry.label !== 'Started watching').length;
  if (summaryOnly) return <p className="text-sm text-muted-foreground">Recent activity for the watches shown: {recent} related {recent === 1 ? 'update or notification' : 'updates or notifications'}. See Timeline for details.</p>;
  return <div className="space-y-3"><p className="text-sm text-muted-foreground">{recent ? `${recent} related updates or notifications` : 'No related updates or notifications yet'} for {items.length === 1 ? 'this item' : 'the items shown'}. Record updates show the latest change, not a full edit history.</p>
    <ol className="divide-y">{query.data.map(entry => <li key={entry.id} className="py-2"><p className="font-medium">{entry.label}{items.length !== 1 ? ` · ${entry.item.display_name}` : ''}</p>{entry.detail && <p>{entry.detail}</p>}<time dateTime={entry.date} className="text-sm text-muted-foreground">{watchDate(entry.date)}</time></li>)}</ol>
  </div>;
}