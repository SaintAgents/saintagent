import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar as CalendarIcon, Clock, Users, Video, MapPin, 
  Radio, Target, ChevronRight, Sparkles
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, addDays, isSameDay } from "date-fns";
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";

const ITEM_TYPE_CONFIG = {
  meeting: { icon: Users, color: 'bg-blue-500', label: 'Meeting' },
  event: { icon: CalendarIcon, color: 'bg-emerald-500', label: 'Event' },
  broadcast: { icon: Radio, color: 'bg-violet-500', label: 'Broadcast' },
  mission: { icon: Target, color: 'bg-amber-500', label: 'Mission' }
};

export default function GlobalScheduleCard({ limit = 5 }) {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch all schedulable items
  const { data: meetings = [] } = useQuery({
    queryKey: ['scheduleMeetings'],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 50),
    staleTime: 60000
  });

  const { data: events = [] } = useQuery({
    queryKey: ['scheduleEvents'],
    queryFn: () => base44.entities.Event.list('-start_time', 50),
    staleTime: 60000
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['scheduleBroadcasts'],
    queryFn: () => base44.entities.Broadcast.list('-scheduled_time', 50),
    staleTime: 60000
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['scheduleMissions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-start_time', 30),
    staleTime: 60000
  });

  // Combine and filter upcoming items
  const upcomingItems = useMemo(() => {
    const items = [];
    const now = new Date();
    const weekFromNow = addDays(now, 7);

    // Add meetings
    meetings.forEach(m => {
      if (m.scheduled_time && (m.status === 'scheduled' || m.status === 'accepted' || m.status === 'pending')) {
        const itemDate = parseISO(m.scheduled_time);
        if (isAfter(itemDate, now) && isBefore(itemDate, weekFromNow)) {
          items.push({
            id: m.id,
            type: 'meeting',
            title: m.title,
            time: m.scheduled_time,
            duration: m.duration_minutes,
            status: m.status,
            host: { name: m.host_name, avatar: m.host_avatar },
            isHost: m.host_id === currentUser?.email,
            online_link: m.online_link
          });
        }
      }
    });

    // Add events
    events.forEach(e => {
      if (e.start_time && e.status !== 'cancelled') {
        const itemDate = parseISO(e.start_time);
        if (isAfter(itemDate, now) && isBefore(itemDate, weekFromNow)) {
          items.push({
            id: e.id,
            type: 'event',
            title: e.title,
            time: e.start_time,
            host: { name: e.host_name, avatar: e.host_avatar },
            attendeeCount: e.attendee_count || 0,
            online_link: e.online_link
          });
        }
      }
    });

    // Add broadcasts
    broadcasts.forEach(b => {
      if (b.scheduled_time && b.status !== 'cancelled') {
        const itemDate = parseISO(b.scheduled_time);
        if (isAfter(itemDate, now) && isBefore(itemDate, weekFromNow)) {
          items.push({
            id: b.id,
            type: 'broadcast',
            title: b.title,
            time: b.scheduled_time,
            duration: b.duration_minutes,
            status: b.status,
            host: { name: b.host_name, avatar: b.host_avatar },
            rsvpCount: b.rsvp_count || 0
          });
        }
      }
    });

    // Add missions with start times
    missions.forEach(m => {
      if (m.start_time) {
        const itemDate = parseISO(m.start_time);
        if (isAfter(itemDate, now) && isBefore(itemDate, weekFromNow)) {
          items.push({
            id: m.id,
            type: 'mission',
            title: m.title,
            time: m.start_time,
            participantCount: m.participant_count || 0
          });
        }
      }
    });

    // Sort by time and limit
    return items.sort((a, b) => new Date(a.time) - new Date(b.time)).slice(0, limit);
  }, [meetings, events, broadcasts, missions, currentUser?.email, limit]);

  // Group items by date
  const groupedByDate = useMemo(() => {
    const groups = {};
    upcomingItems.forEach(item => {
      const dateKey = format(parseISO(item.time), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return groups;
  }, [upcomingItems]);

  const todayCount = upcomingItems.filter(item => isSameDay(parseISO(item.time), new Date())).length;

  if (upcomingItems.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500 mb-2">No upcoming events this week</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => window.location.href = createPageUrl('Schedule')}
        >
          <CalendarIcon className="w-4 h-4" />
          Open Schedule
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-slate-50">
          <p className="text-lg font-bold text-slate-900">{upcomingItems.length}</p>
          <p className="text-xs text-slate-500">This Week</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-blue-50">
          <p className="text-lg font-bold text-blue-600">{upcomingItems.filter(i => i.type === 'meeting').length}</p>
          <p className="text-xs text-slate-500">Meetings</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-emerald-50">
          <p className="text-lg font-bold text-emerald-600">{upcomingItems.filter(i => i.type === 'event').length}</p>
          <p className="text-xs text-slate-500">Events</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-violet-50">
          <p className="text-lg font-bold text-violet-600">{todayCount}</p>
          <p className="text-xs text-slate-500">Today</p>
        </div>
      </div>

      {/* Items list */}
      <ScrollArea className="max-h-[300px]">
        <div className="space-y-3">
          {Object.entries(groupedByDate).map(([dateKey, items]) => {
            const date = parseISO(dateKey);
            const isToday = isSameDay(date, new Date());
            
            return (
              <div key={dateKey}>
                {/* Date header */}
                <div className={cn(
                  "text-xs font-medium mb-2 px-2 py-1 rounded",
                  isToday ? "bg-violet-100 text-violet-700" : "text-slate-500"
                )}>
                  {isToday ? 'Today' : format(date, 'EEEE, MMM d')}
                </div>
                
                {/* Items for this date */}
                <div className="space-y-2">
                  {items.map((item) => {
                    const config = ITEM_TYPE_CONFIG[item.type];
                    const ItemIcon = config.icon;
                    const itemDate = parseISO(item.time);

                    return (
                      <div 
                        key={`${item.type}-${item.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white border hover:border-violet-200 hover:shadow-sm transition-all"
                      >
                        {/* Type indicator */}
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          config.color.replace('bg-', 'bg-opacity-20 bg-')
                        )}>
                          <ItemIcon className={cn("w-4 h-4", config.color.replace('bg-', 'text-').replace('-500', '-600'))} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(itemDate, 'h:mm a')}
                            </span>
                            {item.host && (
                              <span className="flex items-center gap-1">
                                <Avatar className="w-3 h-3">
                                  <AvatarImage src={item.host.avatar} />
                                  <AvatarFallback className="text-[6px]">{item.host.name?.[0]}</AvatarFallback>
                                </Avatar>
                                {item.host.name?.split(' ')[0]}
                              </span>
                            )}
                            {item.online_link && (
                              <Video className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                        </div>

                        {/* Status badge */}
                        {item.status === 'pending' && (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 shrink-0">
                            Pending
                          </Badge>
                        )}
                        {item.status === 'live' && (
                          <Badge className="bg-red-500 text-white text-[10px] animate-pulse shrink-0">
                            LIVE
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* View all link */}
      <div className="mt-4 pt-3 border-t">
        <Button 
          variant="ghost" 
          className="w-full text-violet-600 gap-1"
          onClick={() => window.location.href = createPageUrl('Schedule')}
        >
          View Full Schedule
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}