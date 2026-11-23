import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { configDefaults, localRead, localWrite, prefDefaults } from '@/components/live/activity';

export default function useLiveActivity(user, enabled) {
  const client = useQueryClient();
  const prefKey = ['live-activity-preferences', user.id];
  const localKey = `live-activity-prefs:${user.id}`;
  const { data: prefs } = useQuery({ queryKey: prefKey, enabled: false, staleTime: Infinity, initialData: () => {
    const remote = user.live_activity_preferences, local = localRead(localKey, {});
    return { ...prefDefaults, ...((remote?.revision || 0) >= (local.revision || 0) ? remote : local) };
  } });
  const preferences = useMutation({ mutationFn: next => base44.auth.updateMe({ live_activity_preferences: next }), onSuccess: (_, next) => {
    client.setQueryData(prefKey, next);
    localWrite(localKey, next);
  } });
  const config = useQuery({ queryKey: ['shared-live-activity-config'], enabled, staleTime: 60000,
    placeholderData: () => localRead('shared-live-activity-config', undefined),
    queryFn: async () => {
      const result = await base44.entities.ToastConfig.list('-updated_date', 1);
      const value = result[0] || {};
      localWrite('shared-live-activity-config', value);
      return value;
    },
  });
  const eventKey = ['live-activity-events', user.id];
  const scope = { $or: [{ audience:'members' }, { audience:'personal', recipient_id:user.id }] };
  const events = useQuery({ queryKey:eventKey, enabled, staleTime: 30000,
    queryFn: () => base44.entities.LiveEvent.filter(scope, '-created_date', 50),
  });
  useEffect(() => {
    if (!enabled) return;
    const key = ['live-activity-events', user.id];
    const stopEvents = base44.entities.LiveEvent.subscribe(change => {
      const event = change.data;
      const allowed = event?.audience === 'members' || (event?.audience === 'personal' && event.recipient_id === user.id);
      if (!client.getQueryData(key)) { if (allowed) client.invalidateQueries({ queryKey:key }); return; }
      client.setQueryData(key, previous => {
        if (!previous) return previous;
        const remaining = previous.filter(item => item.id !== change.id && item.id !== event?.id);
        if (!allowed || change.type === 'delete') return remaining.length === previous.length ? previous : remaining;
        return [...remaining, event].sort((a, b) => Date.parse(b.created_date) - Date.parse(a.created_date)).slice(0, 50);
      });
    });
    const stopConfig = base44.entities.ToastConfig.subscribe(() => client.invalidateQueries({ queryKey:['shared-live-activity-config'] }));
    return () => { stopEvents(); stopConfig(); };
  }, [client, enabled, user.id]);
  const shared = useMemo(() => ({ ...configDefaults, ...config.data }), [config.data]);
  return { prefs, preferences, config: shared, configReady: config.isSuccess, events };
}