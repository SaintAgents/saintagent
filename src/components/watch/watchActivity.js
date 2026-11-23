import { base44 } from '@/api/base44Client';
import { itemKey, itemPath, types } from '@/components/watch/watchItems';

export async function watchActivity(items, email) {
  const byType = new Map();
  for (const item of items) {
    if (!types[item.item_type]?.entity) continue;
    if (!byType.has(item.item_type)) byType.set(item.item_type, []);
    byType.get(item.item_type).push(item.record_id);
  }
  const ids = [...new Set(items.map(item => item.record_id))];
  const paths = [...new Set(items.map(itemPath).filter(Boolean))];
  const fields = [...new Set(['record_id', 'entity_id', 'item_id', ...Object.values(types).map(type => type.field).filter(Boolean)])];
  const filter = { user_id: email, created_date: { $gte: items.map(item => item.created_date).sort()[0] }, $or: [
    ...fields.map(field => ({ [`metadata.${field}`]: { $in: ids } })), ...(paths.length ? [{action_url: {$in: paths}}] : []),
  ] };
  const [rows, notifications] = await Promise.all([
    Promise.all([...byType].map(async ([type, ids]) => {
      const visibility = type === 'person' ? { profile_visibility: 'public' } : type === 'rights_asset' ? { owner_id: email || null } : {};
      const records = await base44.entities[types[type].entity].filter({ id: { $in: ids }, ...visibility }, '-updated_date', ids.length);
      return records.map(record => [itemKey({item_type: type, record_id: record.id}), record.updated_date]);
    })),
    email && items.length ? base44.entities.Notification.filter(filter, '-created_date', 100) : [],
  ]);
  const dates = new Map(rows.flat());
  return items.flatMap(item => {
    const events = [{ id: `${item.id}:start`, date: item.created_date, label: 'Started watching', item }];
    const edited = dates.get(itemKey(item));
    if (edited && Date.parse(edited) > Date.parse(item.created_date)) events.push({ id: `${item.id}:update`, date: edited, label: 'Record updated', item });
    for (const notification of notifications) {
      if (Date.parse(notification.created_date) < Date.parse(item.created_date)) continue;
      const keys = ['record_id', 'entity_id', 'item_id', types[item.item_type]?.field].filter(Boolean);
      if ((itemPath(item) && itemPath(item) === notification.action_url) || keys.some(field => notification.metadata?.[field] === item.record_id)) events.push({ id: `${item.id}:${notification.id}`, date: notification.created_date, label: 'Related notification', detail: notification.title, item });
    }
    return events;
  }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}