import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function LiveBroadcastBanner() {
  // Check if broadcasts are enabled via platform settings
  const { data: settingsList = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
    staleTime: 30000,
  });
  const broadcastsEnabled = settingsList[0]?.broadcasts_enabled !== false;

  // Fetch both explicitly live AND scheduled broadcasts (which may be in their time window)
  const { data: broadcasts = [] } = useQuery({
    queryKey: ['liveBroadcasts'],
    queryFn: async () => {
      const [live, scheduled] = await Promise.all([
        base44.entities.Broadcast.filter({ status: 'live' }, '-updated_date', 5),
        base44.entities.Broadcast.filter({ status: 'scheduled' }, '-scheduled_time', 20),
      ]);
      return [...live, ...scheduled];
    },
    refetchInterval: 30000,
    staleTime: 15000,
    enabled: broadcastsEnabled,
  });

  const now = Date.now();

  // A broadcast is "active" if explicitly live, OR if scheduled and within its time window
  const activeBroadcasts = broadcasts.filter(b => {
    if (b.status === 'live') {
      // If explicitly live, check it hasn't exceeded duration
      if (!b.scheduled_time || !b.duration_minutes) return true;
      const endTime = new Date(b.scheduled_time).getTime() + b.duration_minutes * 60000;
      return now < endTime;
    }
    // For scheduled broadcasts: check if current time is within [scheduled_time, scheduled_time + duration]
    if (b.status === 'scheduled' && b.scheduled_time) {
      const startTime = new Date(b.scheduled_time).getTime();
      const duration = (b.duration_minutes || 60) * 60000;
      const endTime = startTime + duration;
      return now >= startTime && now < endTime;
    }
    return false;
  });

  const broadcast = activeBroadcasts[0];
  if (!broadcast || !broadcastsEnabled) return null;

  const handleClick = () => {
    if (broadcast.live_stream_url) {
      window.open(broadcast.live_stream_url, '_blank');
    } else {
      window.location.href = createPageUrl('Broadcast') + `?id=${broadcast.id}`;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-full cursor-pointer select-none transition-all shrink-0"
      title={broadcast.title}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      <span className="text-xs font-bold uppercase tracking-wider">Live</span>
    </button>
  );
}