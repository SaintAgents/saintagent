import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useActivity } from '@/components/live/useActivity';
import { demoPulse } from '@/components/globalimpact/impactDemo';

export default function useImpactTimeline(demo, { category, search }) {
  const activity = useActivity();
  const { user } = useAuth();
  const client = useQueryClient();
  const filtered = Boolean(category || search);
  const prefix = 'impact-timeline';
  const filteredEvents = useQuery({
    queryKey: [prefix, user?.id, category, search],
    enabled: Boolean(!demo && activity && user?.id && filtered),
    queryFn: async () => (await base44.entities.LiveEvent.filter({
      is_demo: { $ne: true },
      $or: [{ audience: 'members' }, { audience: 'personal', recipient_id: user.id }],
      ...(category && { category }),
      ...(search && { headline: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }),
    }, { sort: '-created_date', limit: 50 })).items,
  });
  const updatedAt = activity?.events?.dataUpdatedAt;
  useEffect(() => {
    if (!demo && updatedAt) client.invalidateQueries({ queryKey: [prefix, user?.id] });
  }, [client, demo, updatedAt, user?.id]);

  if (demo) return { events: demoPulse.filter(event => (!category || event.category === category) && event.headline.toLowerCase().includes(search.toLowerCase())) };
  const source = filtered ? filteredEvents : activity?.events;
  if (!activity) return { events: [] };
  return { events: (source?.data || []).filter(event => !event.is_demo), loading: source?.isPending, error: source?.isError };
}