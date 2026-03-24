import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Radio, X, ExternalLink } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function LiveBroadcastBanner({ sidebarCollapsed }) {
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissedLiveBroadcasts') || '[]');
    } catch { return []; }
  });

  const { data: liveBroadcasts = [] } = useQuery({
    queryKey: ['liveBroadcasts'],
    queryFn: () => base44.entities.Broadcast.filter({ status: 'live' }, '-updated_date', 5),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const visible = liveBroadcasts.filter(b => !dismissedIds.includes(b.id));
  const broadcast = visible[0];

  if (!broadcast) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    const next = [...dismissedIds, broadcast.id];
    setDismissedIds(next);
    try { localStorage.setItem('dismissedLiveBroadcasts', JSON.stringify(next)); } catch {}
  };

  const handleClick = () => {
    if (broadcast.live_stream_url) {
      window.open(broadcast.live_stream_url, '_blank');
    } else {
      window.location.href = createPageUrl('Broadcast') + `?id=${broadcast.id}`;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "fixed top-0 right-0 z-[9998] h-8 flex items-center cursor-pointer select-none",
        "bg-red-600 text-white transition-all duration-300",
        sidebarCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
      )}
    >
      <div className="w-full flex items-center justify-center gap-2 px-3 relative">
        {/* Pulsing dot + LIVE label */}
        <span className="relative flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">Live</span>
        </span>

        <span className="text-xs font-medium truncate max-w-md">
          {broadcast.title}
          {broadcast.host_name ? ` — hosted by ${broadcast.host_name}` : ''}
        </span>

        <span className="text-[10px] bg-white/20 rounded px-1.5 py-0.5 font-medium shrink-0 flex items-center gap-1">
          Join Now <ExternalLink className="w-2.5 h-2.5" />
        </span>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}