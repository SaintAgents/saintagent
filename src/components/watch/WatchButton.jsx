import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { activeWatches, setWatching, watchKey } from '@/components/watch/watchItems';

export default function WatchButton({ user, item }) {
  const client = useQueryClient();
  const key = watchKey(user.id);
  const query = useQuery({ queryKey: [...key, 'item', item.item_type, item.record_id], staleTime: 30000, retry: false, queryFn: async () => {
    const records = await base44.entities.WatchItem.filter({ ...activeWatches(user.id), item_type: item.item_type, record_id: item.record_id }, '-created_date', 1);
    return !!records.length;
  }});
  const mutation = useMutation({ mutationFn: desired => setWatching(user.id, item, desired), onSuccess: async (_, desired) => {
    await client.invalidateQueries({ queryKey: key });
    toast.success(desired ? 'Added to Watchlist' : 'Removed from Watchlist');
  }, onError: () => toast.error('Could not update your Watchlist. Please try again.') });
  const watching = query.data === true;
  return <Button type="button" size="sm" variant={watching ? 'secondary' : 'outline'} aria-pressed={watching} disabled={query.isPending || query.isFetching || mutation.isPending} onClick={() => query.isError ? query.refetch() : mutation.mutate(!watching)}>
    {watching ? <EyeOff /> : <Eye />}{query.isPending ? 'Checking Watch…' : mutation.isPending ? 'Updating…' : query.isError ? 'Retry Watch check' : watching ? 'Watching' : 'Watch'}
  </Button>;
}