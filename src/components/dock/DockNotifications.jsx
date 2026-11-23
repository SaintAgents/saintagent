import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { safePath } from '@/components/dock/dockCatalog';

const types = ['match', 'meeting', 'mission', 'booking', 'message', 'follow', 'ggg', 'rank', 'system', 'collaboration', 'post', 'event', 'task_assigned', 'task_due', 'task_dependency', 'project', 'peer_review', 'task_update', 'milestone', 'business_listing', 'digital_product', 'project_update'];
const routes = { meeting:'/Meetings', booking:'/Meetings', mission:'/Missions', event:'/Events', post:'/CommunityFeed', message:'/Messages', project:'/Projects', follow:'/Profiles', ggg:'/CommandDeck', rank:'/Gamification', task_assigned:'/Projects' };
const label = value => value.replaceAll('_', ' ').replace(/^./, char => char.toUpperCase());

export default function DockNotifications({ user, visible, open, settings, save }) {
  const [type, setType] = useState(''), [expanded, setExpanded] = useState(null);
  const client = useQueryClient();
  const limit = settings.notificationLimit || 5;
  const key = ['notifications', user.email];
  const list = useQuery({ queryKey: [...key, 'dock', type, limit], enabled: visible, queryFn: () => base44.entities.Notification.filter({ user_id: user.email, ...(type && { type }) }, { sort: '-created_date', limit }) });
  const unread = useQuery({ queryKey: [...key, 'dock-unread'], enabled: visible, queryFn: () => base44.entities.Notification.count({ user_id: user.email, is_read: { $ne: true } }) });
  const read = useMutation({
    mutationFn: async id => {
      if (id) return base44.entities.Notification.update(id, { is_read: true });
      let more;
      do {
        const batch = await base44.entities.Notification.updateMany({ user_id: user.email, is_read: { $ne: true } }, { $set: { is_read: true } });
        more = batch.has_more;
      } while (more);
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
  if (!visible) return null;
  return <div className="dock-links space-y-2">
    <div className="flex flex-wrap items-end gap-2"><label>Type<select className="ml-2 rounded border bg-background" value={type} onChange={e => { setExpanded(null); setType(e.target.value); }}><option value="">All types</option>{types.map(value => <option key={value} value={value}>{label(value)}</option>)}</select></label>
      <button type="button" disabled={read.isPending || unread.data === 0} onClick={() => read.mutate(null)}>Mark all read{unread.data > 0 ? ` (${unread.data})` : ''}</button></div>
    {list.isError ? <><p role="alert">Could not load notifications.</p><button type="button" onClick={() => list.refetch()}>Retry</button></> : list.isPending ? <p role="status">Loading notifications…</p> : list.data.items.length ? list.data.items.map(n => {
      const target = safePath(n.action_url) ? n.action_url : routes[n.type];
      return <div key={n.id}><button type="button" aria-expanded={expanded === n.id} onClick={() => { setExpanded(expanded === n.id ? null : n.id); if (!n.is_read && !read.isPending) read.mutate(n.id); }}>{!n.is_read && '• '}{n.title}{n.priority && n.priority !== 'normal' && ` · ${label(n.priority)}`}</button>
        {expanded === n.id && <div className="canopy-status"><p>{n.message}</p>{!n.is_read && <button type="button" disabled={read.isPending} onClick={() => read.mutate(n.id)}>Mark as read</button>}{target && <button type="button" onClick={() => open(target)}>{n.action_label || 'Open'}</button>}</div>}</div>;
    }) : <p>No notifications in this view.</p>}
    {list.data?.has_more && <button type="button" onClick={() => save({ notificationLimit: limit + 5 })}>Show more</button>}
    {read.isError && <p role="alert">Could not mark notifications as read. Try again.</p>}
  </div>;
}