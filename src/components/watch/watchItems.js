import { base44 } from '@/api/base44Client';
import { safePath } from '@/components/dock/dockCatalog';

export const types = {
  project: { entity: 'Project', page: 'Projects', label: 'Project', field: 'project_id' },
  organization: { entity: 'BusinessEntity5D', page: 'BusinessEntityProfile', label: 'Organization', field: 'business_id' },
  listing: { entity: 'Listing', page: 'ListingDetail', label: 'Listing', field: 'listing_id' },
  mission: { entity: 'Mission', page: 'MissionDetail', label: 'Mission', field: 'mission_id' },
  person: { entity: 'UserProfile', label: 'Person', field: 'profile_id' },
};
export const typeLabel = type => types[type]?.label || type.replace(/[_-]/g, ' ');
export const watchKey = owner => ['watch-items', owner];
export const activeWatches = owner => ({ created_by_id: owner, active: true });
export const itemKey = item => JSON.stringify([item.item_type, item.record_id]);
export const itemPath = item => types[item.item_type]?.page ? `/${types[item.item_type].page}?id=${encodeURIComponent(item.record_id)}` : safePath(item.route) ? item.route : '';
export const watchDate = date => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
const pending = new Map();

export function setWatching(owner, item, desired) {
  const filter = { created_by_id: owner, item_type: item.item_type, record_id: item.record_id };
  const key = JSON.stringify([owner, itemKey(item)]);
  const write = async () => {
    if (!desired) { await base44.entities.WatchItem.deleteMany(filter); return; }
    const [existing] = await base44.entities.WatchItem.filter(filter, '-created_date', 1);
    if (!existing) await base44.entities.WatchItem.create({ ...item, display_name: item.display_name.slice(0, 200), watchlist_name: 'General', active: true });
    else if (!existing.active) await base44.entities.WatchItem.update(existing.id, { active: true });
  };
  const request = (pending.get(key) || Promise.resolve()).catch(() => {}).then(() => navigator.locks?.request ? navigator.locks.request(`sa-watch:${key}`, write) : write());
  pending.set(key, request);
  return request.finally(() => { if (pending.get(key) === request) pending.delete(key); });
}