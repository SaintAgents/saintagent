import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import GroupDetailPage from '@/components/groups/GroupDetailPage';
import { myGroupsFilter } from '@/components/groups/myGroupsQuery';

export default function GroupShortcutDetail() {
  const [params, setParams] = useSearchParams();
  const id = params.get('group');
  const { user } = useAuth();
  const email = user?.email;
  const group = useQuery({
    queryKey: ['circles', 'group-shortcut', email, id],
    enabled: !!id && !!email,
    queryFn: async () => {
      const { items } = await base44.entities.Circle.filter({ id, ...myGroupsFilter(email) }, { limit: 1 });
      return items[0] ?? null;
    },
  });
  const notFound = !!id && !!email && group.isSuccess && !group.data;
  useEffect(() => {
    if (!notFound) return;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);
  if (!id) return null;
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete('group');
    next.delete('tab');
    next.delete('post');
    setParams(next, { replace: true });
  };
  if (group.data) return <GroupDetailPage key={id} circle={group.data} user={user} onBack={close} />;
  return <div className="grid min-h-[50vh] place-items-center bg-background p-4 text-foreground">
    <div className="space-y-3 text-center">
      <p role="status">{notFound ? 'This Circle is unavailable or you don’t have access.' : group.isError ? 'Couldn’t open this group.' : 'Opening group…'}</p>
      {group.isError && <Button variant="ghost" onClick={() => group.refetch()}>Retry</Button>}
      <Button variant="outline" onClick={close}>Back to Groups</Button>
    </div>
  </div>;
}