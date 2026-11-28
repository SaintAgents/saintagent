import { useLocation, useSearchParams } from 'react-router-dom';
import { Target, Users } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { myGroupsFilter } from '@/components/groups/myGroupsQuery';
import GroupShortcutList from '@/components/hud/GroupShortcutList';
import MyGroupsHint from '@/components/hud/MyGroupsHint';

const nextPage = page => page.has_more ? page.next_cursor : undefined;

export default function SidePanelMyGroups({ onNavigate }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const email = user?.email;
  const circles = useInfiniteQuery({
    queryKey: ['circles', 'my-group-shortcuts', email],
    enabled: !!email,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.Circle.filter(myGroupsFilter(email), { sort: 'name', limit: 20, cursor: pageParam }),
    getNextPageParam: nextPage,
  });
  const missions = useInfiniteQuery({
    queryKey: ['missions', 'my-group-shortcuts', email],
    enabled: !!email,
    initialPageParam: undefined,
    queryFn: ({ pageParam }) => base44.entities.Mission.filter({
      $or: [{ creator_id: email }, { participant_ids: { $in: [email] } }],
    }, { sort: 'title', limit: 20, cursor: pageParam }),
    getNextPageParam: nextPage,
  });
  if (!email) return null;
  const closeOnNavigate = event => {
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onNavigate?.();
  };

  return <section data-readable-surface className="mt-2 rounded-xl border bg-card p-2 text-card-foreground">
    <nav aria-label="My Groups">
      <MyGroupsHint />
      <GroupShortcutList label="Circles" query={circles} icon={Users} browsePath="/Circles" name={item => item.name}
        currentId={/^\/circles\/?$/i.test(pathname) ? params.get('group') : null}
        to={id => `/Circles?group=${encodeURIComponent(id)}`} onNavigate={closeOnNavigate} />
      <GroupShortcutList label="Missions" query={missions} icon={Target} browsePath="/Missions" name={item => item.title}
        currentId={/^\/missiondetail\/?$/i.test(pathname) ? params.get('id') : null}
        to={id => `/MissionDetail?id=${encodeURIComponent(id)}`} onNavigate={closeOnNavigate} />
    </nav>
  </section>;
}