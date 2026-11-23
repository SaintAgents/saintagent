import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WatchTimeline from '@/components/watch/WatchTimeline';
import { itemPath, setWatching, typeLabel, watchKey } from '@/components/watch/watchItems';

export default function WatchlistGroups({ items, counts, owner, email, editable }) {
  const [selected, setSelected] = useState(null);
  const client = useQueryClient();
  const removal = useMutation({ mutationFn: item => setWatching(owner, item, false), onSuccess: async () => {
    setSelected(null); await client.invalidateQueries({ queryKey: watchKey(owner) }); toast.success('Removed from Watchlist');
  }, onError: () => toast.error('Could not remove this watch. Please try again.') });
  const groups = Object.groupBy ? Object.groupBy(items, item => item.watchlist_name) : items.reduce((groups, item) => { (groups[item.watchlist_name] ||= []).push(item); return groups; }, Object.create(null));
  return <>{Object.entries(groups).map(([name, watches]) => <section key={name} className="rounded-xl border bg-card p-4 text-card-foreground" data-readable-surface>
    <h2 className="mb-2 font-semibold">{name} <span className="text-sm text-muted-foreground">({counts.get(name) ?? '—'})</span></h2>
    <ul className="divide-y">{watches.map(item => <li key={item.id} className="flex flex-wrap items-center gap-2 py-2">
      <button type="button" className="min-w-0 flex-1 break-words text-left hover:underline" onClick={() => setSelected(item)}><strong>{item.display_name}</strong><span className="ml-2 text-sm text-muted-foreground">{typeLabel(item.item_type)}</span></button>
      {itemPath(item) && <a href={itemPath(item)} className="text-sm underline">Open record</a>}
      {editable && <Button type="button" variant="outline" size="sm" disabled={removal.isPending} onClick={() => removal.mutate(item)} aria-label={`Remove ${item.display_name}`}>Remove</Button>}
    </li>)}</ul>
  </section>)}
  <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent data-readable-surface className="max-h-[85dvh] overflow-y-auto">
    <DialogHeader><DialogTitle>{selected?.display_name}</DialogTitle><DialogDescription>What changed since you started watching</DialogDescription></DialogHeader>
    {selected && <WatchTimeline items={[selected]} {...{owner, email}} />}
    {selected && itemPath(selected) && <a href={itemPath(selected)} className="underline">Open record</a>}
  </DialogContent></Dialog></>;
}