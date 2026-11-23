import { useInfiniteQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ConferenceList({ tab, userId, onPick }) {
  const filter = { member_ids:userId, status:tab === 'history' ? 'ended' : 'active', ...(tab === 'mine' ? {host_id:userId} : tab === 'invitations' ? {host_id:{$ne:userId}} : {}) };
  const list = useInfiniteQuery({queryKey:['conferences',userId,tab], initialPageParam:undefined, queryFn:({pageParam}) => base44.entities.ConferenceRoom.filter(filter,{limit:12,sort:'-started_at',cursor:pageParam}), getNextPageParam:p => p.has_more ? p.next_cursor : undefined});
  if (list.isPending) return <p role="status">Loading calls…</p>;
  if (list.isError) return <p role="alert">Calls could not load. <Button variant="link" onClick={() => list.refetch()}>Retry</Button></p>;
  const entries = list.data.pages.flatMap(page => page.items);
  if (!entries.length) return <p className="text-sm text-muted-foreground">{tab === 'invitations' ? 'No active invitations.' : tab === 'history' ? 'No past calls.' : 'No active calls that you started.'}</p>;
  return <ul className="space-y-2">{entries.map(call => <li key={call.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"><div className="min-w-0 break-words"><p className="font-medium">{call.title}</p><p className="text-sm text-muted-foreground">Hosted by {call.host_name} · {new Date(call.started_at).toLocaleString()}</p></div>{tab !== 'history' && <Button variant="outline" onClick={() => onPick(call.code)}>Open call</Button>}</li>)}
  {list.hasNextPage && <li><Button variant="outline" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>{list.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button></li>}</ul>;
}