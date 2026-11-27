import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const DAY = 86400000;
const RECENT_WINDOW = 14 * DAY;
const ABSENCE = 30 * DAY;

export default function useReturningTourInvitation(userId, enabled) {
  const client = useQueryClient();
  const key = ['tour-sign-in-history', userId];
  const { data } = useQuery({
    queryKey: key, enabled: enabled && !!userId, staleTime: 60000,
    queryFn: () => base44.entities.LiveEvent.filter({
      category: 'sign_ins', audience: 'personal', recipient_id: userId, is_demo: { $ne: true },
    }, '-metric', 5),
  });
  useEffect(() => {
    if (!enabled || !userId) return;
    return base44.entities.LiveEvent.subscribe(({ type, data: event }) => {
      if (type === 'create' && event?.category === 'sign_ins' && event.audience === 'personal' && event.recipient_id === userId && !event.is_demo) {
        client.invalidateQueries({ queryKey: ['tour-sign-in-history', userId] });
      }
    });
  }, [client, enabled, userId]);
  if (!enabled || !data?.length) return null;
  const [latest, previous] = [...new Set(data.map(event => Date.parse(event.metric)).filter(Number.isFinite))].sort((a, b) => b - a);
  const age = Date.now() - latest;
  // Legacy members may not have a previous sign-in in the recorded history.
  return age >= 0 && age < RECENT_WINDOW && (previous === undefined || latest - previous >= ABSENCE)
    ? new Date(latest).toISOString() : null;
}