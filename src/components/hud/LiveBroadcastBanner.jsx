import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function LiveBroadcastBanner() {
  const { data: liveBroadcasts = [] } = useQuery({
    queryKey: ['liveBroadcasts'],
    queryFn: () => base44.entities.Broadcast.filter({ status: 'live' }, '-updated_date', 5),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // Filter out broadcasts that have exceeded their scheduled duration
  const activeBroadcasts = liveBroadcasts.filter(b => {
    if (!b.scheduled_time || !b.duration_minutes) return true;
    const endTime = new Date(b.scheduled_time).getTime() + b.duration_minutes * 60000;
    return Date.now() < endTime;
  });

  const broadcast = activeBroadcasts[0];
  if (!broadcast) return null;

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