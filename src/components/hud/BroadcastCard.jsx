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
  const { data: broadcasts = [] } = useQuery({
    queryKey: ['upcomingBroadcasts'],
    queryFn: () => base44.entities.Broadcast.filter({ status: 'upcoming' }, '-start_time', 5),
    staleTime: 60000
  });
  
  const { data: liveBroadcasts = [] } = useQuery({
    queryKey: ['liveBroadcasts'],
    queryFn: () => base44.entities.Broadcast.filter({ status: 'live' }, '-created_date', 3),
    refetchInterval: 10000
  });
  
  const allBroadcasts = [...liveBroadcasts, ...broadcasts].slice(0, 3);
  
  return (
    <div className="space-y-3">
      {liveBroadcasts.length > 0 && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE NOW
            </span>
          </div>
          {liveBroadcasts.slice(0, 1).map((bc) => (
            <div key={bc.id} className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={bc.host_avatar} />
                <AvatarFallback>{bc.host_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{bc.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{bc.host_name}</p>
              </div>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 gap-1 shrink-0">
                <Play className="w-3 h-3" />
                Join
              </Button>
            </div>
          ))}
        </div>
      )}
      
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
                    {format(parseISO(bc.start_time), 'MMM d, h:mm a')}
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