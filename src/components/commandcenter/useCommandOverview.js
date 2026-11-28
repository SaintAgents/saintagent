import { useEffect, useState } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { commandSources } from '@/components/commandcenter/commandSources';

export function commandDate(value) {
  const date = value && new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (!date || Number.isNaN(+date)) return '';
  return date.toLocaleString(undefined, { month:'short', day:'numeric', ...(value.length === 10 ? {} : { hour:'numeric', minute:'2-digit' }) });
}
export function useCommandOverview(user) {
  const client = useQueryClient();
  const [now,setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(timer); }, []);
  const day = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const d = { day, start:new Date(now.getFullYear(),now.getMonth(),now.getDate()).toISOString(), end:new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).toISOString() };
  const results = useQueries({ queries:commandSources.map(source => ({
    queryKey:['command-overview',user.id,source.id,day], staleTime:60000, retry:false,
    queryFn:async () => {
      const entity = base44.entities[source.entity], filter = source.list(user,d);
      const [page,count] = await Promise.allSettled([
        entity.filter(filter,{ sort:source.sort || '-created_date',limit:8 }),
        source.metric || source.id === 'priorities' ? entity.count(source.count?.(user,d) || filter) : Promise.resolve(null),
      ]);
      return { rows:page.status === 'fulfilled' ? (page.value.items || []).map(source.format) : null,
        total:count.status === 'fulfilled' && Number.isFinite(count.value) ? count.value : null, more:page.value?.has_more === true };
    },
  })) });
  useEffect(() => {
    let timer;
    const stop = base44.entities.Notification.subscribe(event => {
      if (event.data?.user_id !== user.email && event.data?.user_id !== user.id && event.type !== 'delete') return;
      clearTimeout(timer);
      timer = setTimeout(() => ['activity','opportunities'].forEach(id => client.invalidateQueries({ queryKey:['command-overview',user.id,id] })), 900);
    });
    return () => { clearTimeout(timer); stop(); };
  }, [client,user.id,user.email]);
  return { now, data:Object.fromEntries(commandSources.map((source,i) => [source.id,results[i]])) };
}