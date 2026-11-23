import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { itemPath, setWatching } from '@/components/watch/watchItems';

export const referenceKey = (owner, kind) => ['workspace-references', owner, kind];
export function useWorkspaceReferences(owner, kind, enabled = true, recordId) {
  const key = referenceKey(owner, kind);
  return useInfiniteQuery({ queryKey: recordId ? [...key, recordId] : key, enabled: !!owner && enabled, retry: false, initialPageParam: undefined,
    queryFn: ({pageParam}) => base44.entities.WorkspaceReference.filter({ created_by_id: owner, kind, ...(recordId ? {id:recordId} : {}) }, {sort:'-updated_date', limit:20, cursor:pageParam}),
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined });
}
export async function saveReference(owner, item, { kind, title, note, researchId }) {
  if (kind === 'watch') return setWatching(owner, item, true, { notify_on_new: true, notify_on_change: true });
  const ref = { item_type:item.item_type, record_id:item.record_id, title:item.display_name.slice(0,200), subtitle:(item.subtitle || '').slice(0,250), route:itemPath(item), source:item.source || 'SaintAgent' };
  if (kind === 'research' && researchId) {
    return base44.entities.WorkspaceReference.updateMany({id:researchId, created_by_id:owner, kind, 'references': { $not: { $elemMatch: {item_type:ref.item_type, record_id:ref.record_id} } }, 'references.99':{$exists:false}}, {$push:{references:ref}}).then(async result => {
      const [card] = await base44.entities.WorkspaceReference.filter({id:researchId, created_by_id:owner, kind}, '-updated_date', 1);
      if (!card?.references?.some(entry => entry.item_type === ref.item_type && entry.record_id === ref.record_id)) throw new Error('The research card is no longer available or is full.');
      return result;
    });
  }
  const source = {kind, source_type:ref.item_type, source_id:ref.record_id};
  const write = async () => {
    if (kind === 'saved') {
      const [saved] = await base44.entities.WorkspaceReference.filter({...source, created_by_id:owner}, '-created_date', 1);
      if (saved) return note !== saved.note ? base44.entities.WorkspaceReference.update(saved.id, {note}) : saved;
    }
    return base44.entities.WorkspaceReference.create({...source, title:title.trim() || ref.title, note, references:[ref]});
  };
  return kind === 'saved' && navigator.locks?.request ? navigator.locks.request(`sa-save:${JSON.stringify([owner, ref.item_type, ref.record_id])}`, write) : write();
}