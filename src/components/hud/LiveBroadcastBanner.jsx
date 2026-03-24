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
    <button
      onClick={handleClick}
      className="fixed top-2 right-auto z-[10000] flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full shadow-lg cursor-pointer select-none transition-all"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
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