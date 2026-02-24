import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, ArrowRight, Sparkles, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isFuture } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function EventsCard() {
  const { data: events = [] } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => base44.entities.Event.filter({ status: 'upcoming' }, 'start_time', 8),
    staleTime: 60000
  });
  
  // Filter to only future events
  const futureEvents = events.filter(e => {
    try {
      return isFuture(parseISO(e.start_time));
    } catch {
      return false;
    }
  });
  
  return (
    <div className="space-y-3">
      {futureEvents.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <CircleDot className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">No upcoming events</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Host a community gathering or workshop</p>
          <Button 
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600"
            onClick={() => window.location.href = createPageUrl('Events')}
          >
            Create Event
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {futureEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
                <CircleDot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(event.start_time), 'MMM d, h:mm a')}
                  </span>
                  {event.attendee_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.attendee_count}
                    </span>
                  )}
                </div>
                {event.location && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {event.location}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="shrink-0 text-xs capitalize">
                {event.category}
              </Badge>
            </div>
          ))}
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full gap-2"
        onClick={() => window.location.href = createPageUrl('Events')}
      >
        <Calendar className="w-4 h-4" />
        View All Events
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Button>
    </div>
  );
}