import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Radio, Mic, Users, Clock, ArrowRight, Sparkles, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function BroadcastCard() {
  const { data: rawBroadcasts } = useQuery({
    queryKey: ['upcomingBroadcasts'],
    queryFn: () => base44.entities.Broadcast.filter({ status: 'upcoming' }, '-start_time', 5),
    staleTime: 60000
  });
  
  const { data: rawLiveBroadcasts } = useQuery({
    queryKey: ['liveBroadcastsCard'],
    queryFn: async () => {
      const [live, scheduled] = await Promise.all([
        base44.entities.Broadcast.filter({ status: 'live' }, '-created_date', 5),
        base44.entities.Broadcast.filter({ status: 'scheduled' }, '-scheduled_time', 10),
      ]);
      return [...live, ...scheduled];
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
  
  const now = Date.now();
  const GRACE_MS = 2 * 60 * 60 * 1000; // 2 hour grace period
  const broadcasts = Array.isArray(rawBroadcasts) ? rawBroadcasts : [];
  
  // Filter live/recent broadcasts from combined results
  const liveBroadcasts = (Array.isArray(rawLiveBroadcasts) ? rawLiveBroadcasts : []).filter(b => {
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
  
  const allBroadcasts = [...liveBroadcasts, ...broadcasts].slice(0, 3);
  
  return (
    <div className="space-y-3">
      {liveBroadcasts.length > 0 && liveBroadcasts.slice(0, 1).map((bc) => {
        const isStillLive = (() => {
          if (!bc.scheduled_time || !bc.duration_minutes) return bc.status === 'live';
          const endTime = new Date(bc.scheduled_time).getTime() + bc.duration_minutes * 60000;
          return now < endTime;
        })();
        return (
        <div key={bc.id} className={cn(
          "p-3 rounded-lg border",
          isStillLive
            ? "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-200 dark:border-red-700"
            : "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200 dark:border-amber-700"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("flex items-center gap-1.5 text-xs font-medium", isStillLive ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>
              <span className={cn("w-2 h-2 rounded-full", isStillLive ? "bg-red-500 animate-pulse" : "bg-amber-500")} />
              {isStillLive ? 'LIVE NOW' : 'JUST AIRED'}
            </span>
          </div>
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={bc.host_avatar} />
                <AvatarFallback>{bc.host_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{bc.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{bc.host_name}</p>
              </div>
              <Button size="sm" className={cn(
                "gap-1 shrink-0",
                isStillLive ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
              )}>
                <Play className="w-3 h-3" />
                {isStillLive ? 'Join' : 'Watch'}
              </Button>
            </div>
        </div>
        );
      })}
      
      {allBroadcasts.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <Radio className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">No upcoming broadcasts</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">Check back soon for community calls</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allBroadcasts.filter(bc => bc.status !== 'live').slice(0, 2).map((bc) => (
            <div key={bc.id} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{bc.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(bc.start_time || bc.scheduled_time) ? format(parseISO(bc.start_time || bc.scheduled_time), 'MMM d, h:mm a') : 'TBD'}
                  </span>
                  {bc.attendee_count > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {bc.attendee_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full gap-2"
        onClick={() => window.location.href = createPageUrl('Broadcast')}
      >
        <Radio className="w-4 h-4" />
        View All Broadcasts
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Button>
    </div>
  );
}