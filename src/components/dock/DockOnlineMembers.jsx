import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import OnlineUsersModal from '@/components/OnlineUsersModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const previewSize = 6;

async function getOnlineMembers() {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const query = { status: { $ne: 'offline' }, $and: [
    { $or: [{ visible_to: 'everyone' }, { visible_to: { $exists: false } }] },
    { $or: [{ last_heartbeat: { $gt: cutoff } }, { updated_date: { $gt: cutoff } }] },
  ] };
  const [total, preview] = await Promise.all([
    base44.entities.LiveStatus.aggregate({ query, countDistinct: 'user_id' }),
    base44.entities.LiveStatus.aggregate({ query, groupBy: 'user_id', max: 'updated_date', sort: '-max_updated_date', limit: previewSize }),
  ]);
  const count = total.rows[0]?.count_distinct_user_id ?? 0;
  const ids = preview.rows.map(row => row.user_id);
  const profiles = ids.length ? await base44.entities.UserProfile.filter({ user_id: { $in: ids } }, '-updated_date', previewSize * 2) : [];
  return { count, members: ids.map(id => ({ id, profile: profiles.find(profile => profile.user_id === id) })) };
}

export default function DockOnlineMembers({ visible, userId, aboveCanopy = false }) {
  const [open, setOpen] = useState(false);
  const { data, isError } = useQuery({
    queryKey: ['dock-online-members', userId], queryFn: getOnlineMembers,
    enabled: visible && !!userId, staleTime: 30_000, refetchInterval: visible ? 60_000 : false, retry: false,
  });
  const label = data ? `${data.count} ${data.count === 1 ? 'member' : 'members'} online` : isError ? 'Online count unavailable' : 'Checking who’s online…';
  const more = data ? data.count - data.members.length : 0;
  return <>
    <button type="button" className="block w-full text-left" aria-label={`${label}. Open the online members list`} onClick={() => setOpen(true)}>
      <span className="font-medium" aria-live="polite">{label}</span>
      {!!data?.members.length && <span className="mt-2 flex flex-wrap items-center gap-1.5">
        {data.members.map(({ id, profile }) => {
          const name = profile?.display_name || 'Member';
          return <Avatar key={id} title={name} className="h-7 w-7 rounded-full border">
            <AvatarImage src={profile?.avatar_url} alt={name} />
            <AvatarFallback className="bg-muted text-xs text-muted-foreground" aria-label={name}>{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>;
        })}
        {more > 0 && <span aria-hidden="true" className="text-xs">+{more}</span>}
      </span>}
    </button>
    {open && <OnlineUsersModal open aboveCanopy={aboveCanopy} onClose={() => setOpen(false)} />}
  </>;
}