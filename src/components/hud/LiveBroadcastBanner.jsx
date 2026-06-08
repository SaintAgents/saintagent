import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function LiveBroadcastBanner() {
  // Check if broadcasts are enabled via platform settings
  const { data: settingsList = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
  });
  const broadcastsEnabled = settingsList[0]?.broadcasts_enabled !== false;

  // Always fetch broadcasts — don't gate on broadcastsEnabled to avoid query toggling
  // which clears cached data and makes the LIVE pill disappear
  const { data: broadcasts = { live: [], scheduled: [] } } = useQuery({
    queryKey: ['liveBroadcasts'],
    queryFn: async () => {
      const [live, scheduled] = await Promise.all([
        base44.entities.Broadcast.filter({ status: 'live' }, '-updated_date', 5),
        base44.entities.Broadcast.filter({ status: 'scheduled' }, '-scheduled_time', 20),
      ]);
      return { live, scheduled };
    },
    refetchInterval: 30000,
    staleTime: 20000,
    gcTime: 120000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const now = Date.now();
  const GRACE_MS = 2 * 60 * 60 * 1000; // 2 hour grace period after broadcast ends

  // A broadcast is "active" if explicitly live, within its time window, or ended within the last 2 hours
  const activeBroadcasts = [...(broadcasts.live || []), ...(broadcasts.scheduled || [])].filter(b => {
    if (b.status === 'live') {
      if (!b.scheduled_time || !b.duration_minutes) return true;
      const endTime = new Date(b.scheduled_time).getTime() + b.duration_minutes * 60000;
      return now < endTime + GRACE_MS;
    }
    if (b.status === 'scheduled' && b.scheduled_time) {
      const startTime = new Date(b.scheduled_time).getTime();
      const duration = (b.duration_minutes || 60) * 60000;
      const endTime = startTime + duration;
      return now >= startTime && now < endTime + GRACE_MS;
    }
    return false;
  });

  // Kill switch OFF = force-hide the Live pill no matter what
  if (!broadcastsEnabled) return null;

  const broadcast = activeBroadcasts[0];
  if (!broadcast) return null;

  // Determine if broadcast is still actually running or recently ended
  const isStillLive = (() => {
    if (!broadcast.scheduled_time || !broadcast.duration_minutes) return broadcast.status === 'live';
    const endTime = new Date(broadcast.scheduled_time).getTime() + broadcast.duration_minutes * 60000;
    return now < endTime;
  })();

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
      className={cn(
        "flex items-center gap-1.5 text-white px-2.5 py-1 rounded-full cursor-pointer select-none transition-all shrink-0",
        isStillLive ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
      )}
      title={broadcast.title}
    >
      <span className="relative flex h-2 w-2">
        {isStillLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      <span className="text-xs font-bold uppercase tracking-wider">
        {isStillLive ? 'Live' : 'Just Aired'}
      </span>
    </button>
  );
}