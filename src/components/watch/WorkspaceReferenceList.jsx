import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import RecordKeepActions from '@/components/watch/RecordKeepActions';
import { itemPath } from '@/components/watch/watchItems';
import { referenceKey, useWorkspaceReferences } from '@/components/watch/workspaceReferences';

export default function WorkspaceReferenceList({ owner, kind, recordId }) {
  const query = useWorkspaceReferences(owner,kind,true,recordId), client = useQueryClient();
  const removal = useMutation({mutationFn: id => base44.entities.WorkspaceReference.delete(id),
    onSuccess: () => client.invalidateQueries({queryKey:referenceKey(owner,kind)}), onError: () => toast.error('Could not remove this item.')});
  const { hash } = useLocation();
  useEffect(() => {
    if (/^#(?:reference-[\w-]+|linked-drafts)$/.test(hash)) document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'});
  }, [hash, query.data]);
  const rows = query.data?.pages.flatMap(page => page.items) || [];
  if (query.isPending) return <p role="status">Loading…</p>;
  if (query.isError && !rows.length) return <p role="alert">Could not load items. <button className="underline" onClick={() => query.refetch()}>Retry</button></p>;
  if (!rows.length) return <p className="text-muted-foreground">{recordId ? 'This item is no longer available.' : 'Nothing here yet. Choose Save To… on a record to add it.'}</p>;
  return <div className="space-y-3">{rows.map(row => <section key={row.id} id={`reference-${row.id}`} data-readable-surface className="scroll-mt-32 rounded-lg border p-3">
    <div className="flex items-start justify-between gap-2"><h3 className="break-words font-semibold">{row.title}{kind === 'plan' && <span className="ml-2 text-xs font-normal">Draft</span>}</h3><Button type="button" variant="outline" size="sm" disabled={removal.isPending} aria-label={`Remove ${row.title}`} onClick={() => {if(window.confirm(`Remove “${row.title}”? The original record will not change.`)) removal.mutate(row.id);}}>Remove</Button></div>
    {row.note && <p className="whitespace-pre-wrap break-words text-sm">{row.note}</p>}
    {kind === 'research' && <RecordKeepActions type="research" id={row.id} title={row.title} route={`/SavedItems?tab=research&id=${encodeURIComponent(row.id)}`} />}
    <ul className="mt-2 space-y-1">{row.references.map(ref => <li key={JSON.stringify([ref.item_type,ref.record_id])} className="break-words text-sm">{itemPath(ref) ? <a className="underline" href={itemPath(ref)}>{ref.title}</a> : ref.title}{ref.subtitle && <span className="ml-2">{ref.subtitle}</span>}{ref.source && <span className="ml-2 text-muted-foreground">{ref.source}</span>}</li>)}</ul>
  </section>)}{query.isFetchNextPageError && <p role="alert">Could not load more items. Try again.</p>}{query.hasNextPage && <Button variant="outline" disabled={query.isFetching} onClick={() => query.fetchNextPage()}>{query.isFetching ? 'Loading…' : 'Load more'}</Button>}</div>;
}