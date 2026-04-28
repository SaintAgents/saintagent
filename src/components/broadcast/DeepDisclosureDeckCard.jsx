import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, Clock, Radio, Users, Eye, EyeOff, MessageCircle, ExternalLink } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { createPageUrl } from '@/utils';

export default function DeepDisclosureDeckCard() {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem('ddDeckCardHidden') === 'true'; } catch { return false; }
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['ddBroadcasts'],
    queryFn: () => base44.entities.Broadcast.filter({ broadcast_type: 'podcast' }, '-scheduled_time', 10),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const ddEpisodes = broadcasts.filter(b =>
    b.title?.toLowerCase().includes('deep disclosure') || 
    b.topics?.some(t => t.toLowerCase().includes('deep disclosure'))
  );

  const now = new Date();
  const liveEpisode = ddEpisodes.find(b => {
    if (b.status === 'live') return true;
    const st = parseISO(b.scheduled_time);
    const et = new Date(st.getTime() + (b.duration_minutes || 60) * 60000);
    return st <= now && now < et && b.status !== 'ended' && b.status !== 'cancelled';
  });

  const nextEpisode = ddEpisodes.find(b =>
    b.status === 'scheduled' && isAfter(parseISO(b.scheduled_time), now)
  );

  const latestPast = ddEpisodes.find(b => b.status === 'ended' && b.recording_url);
  const featured = liveEpisode || nextEpisode || latestPast;

  const toggleHidden = () => {
    const next = !hidden;
    setHidden(next);
    try { localStorage.setItem('ddDeckCardHidden', String(next)); } catch {}
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50">
      {/* Hide toggle */}
      <button
        onClick={toggleHidden}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors"
        title={hidden ? 'Show Deep Disclosure' : 'Hide Deep Disclosure'}
      >
        {hidden ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {/* Header */}
      <div className="p-4 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-md">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            Deep Disclosure
            {liveEpisode && (
              <Badge className="bg-red-500 text-white text-[10px] gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
              </Badge>
            )}
          </h3>
          <p className="text-xs text-slate-500">Uplift Community Podcast</p>
        </div>
      </div>

      {/* Content */}
      {!hidden && (
        <div className="px-4 pb-4 space-y-3">
          {featured ? (
            <div className={cn(
              "p-3 rounded-xl border",
              liveEpisode ? "bg-red-50 border-red-200" : "bg-white/80 border-violet-100"
            )}>
              <div className="flex items-center gap-2 mb-1.5">
                {liveEpisode ? (
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                ) : nextEpisode ? (
                  <Clock className="w-4 h-4 text-violet-500" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-500" />
                )}
                <span className="text-xs font-semibold text-slate-600">
                  {liveEpisode ? 'LIVE NOW' : nextEpisode ? 'UPCOMING' : 'LATEST EPISODE'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{featured.title}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{format(parseISO(featured.scheduled_time), 'MMM d, h:mm a')}</span>
                <span>{featured.duration_minutes}m</span>
                <span className="flex items-center gap-0.5">
                  <Users className="w-3 h-3" />
                  {(featured.going_count || 0) + (featured.interested_count || 0)}
                </span>
              </div>
              {liveEpisode && (
                <Button 
                  size="sm"
                  className="mt-2 bg-red-500 hover:bg-red-600 gap-1.5 w-full"
                  onClick={() => window.open(liveEpisode.live_stream_url, '_blank')}
                >
                  <Play className="w-3.5 h-3.5" /> Join Live
                </Button>
              )}
              {!liveEpisode && latestPast?.recording_url && !nextEpisode && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="mt-2 gap-1.5 w-full"
                  onClick={() => window.open(latestPast.recording_url, '_blank')}
                >
                  <Play className="w-3.5 h-3.5" /> Watch
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-slate-500">
              <Mic className="w-8 h-8 text-violet-300 mx-auto mb-2" />
              No episodes yet — stay tuned!
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 gap-1.5 text-violet-600 border-violet-200"
              onClick={() => window.location.href = createPageUrl('Broadcast')}
            >
              <ExternalLink className="w-3.5 h-3.5" /> All Episodes
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1.5 text-violet-600"
              onClick={() => window.location.href = createPageUrl('Broadcast') + '?contact=true'}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Interview
            </Button>
          </div>
        </div>
      )}

      {/* Collapsed state */}
      {hidden && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-400 italic">Section hidden — click eye to show</p>
        </div>
      )}
    </div>
  );
}