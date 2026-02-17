import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, Clock, Users, Video, MapPin, 
  Radio, Target, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay, addDays, isSameDay } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

const ITEM_TYPE_CONFIG = {
  meeting: { icon: Users, color: 'bg-blue-500', label: 'Meeting', page: 'Meetings' },
  event: { icon: CalendarIcon, color: 'bg-emerald-500', label: 'Event', page: 'Events' },
  broadcast: { icon: Radio, color: 'bg-violet-500', label: 'Broadcast', page: 'Broadcast' },
  mission: { icon: Target, color: 'bg-amber-500', label: 'Mission', page: 'Missions' }
};

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch all schedulable items
  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 100)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_time', 100)
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => base44.entities.Broadcast.list('-scheduled_time', 100)
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-start_time', 50)
  });

  // Combine all items into a unified schedule
  const allItems = useMemo(() => {
    const items = [];

    // Add meetings
    meetings.forEach(m => {
      if (m.scheduled_time && (m.status === 'scheduled' || m.status === 'accepted' || m.status === 'pending')) {
        items.push({
          id: m.id,
          type: 'meeting',
          title: m.title,
          time: m.scheduled_time,
          endTime: null,
          duration: m.duration_minutes,
          status: m.status,
          location: m.location,
          online_link: m.online_link,
          host: { name: m.host_name, avatar: m.host_avatar },
          guest: { name: m.guest_name, avatar: m.guest_avatar },
          isHost: m.host_id === currentUser?.email,
          isGuest: m.guest_id === currentUser?.email
        });
      }
    });

    // Add events
    events.forEach(e => {
      if (e.start_time && e.status !== 'cancelled') {
        items.push({
          id: e.id,
          type: 'event',
          title: e.title,
          time: e.start_time,
          endTime: e.end_time,
          description: e.description,
          location: e.location,
          online_link: e.online_link,
          host: { name: e.host_name, avatar: e.host_avatar },
          attendeeCount: e.attendee_count || 0,
          isHost: e.host_id === currentUser?.email,
          isAttending: e.attendee_ids?.includes(currentUser?.email)
        });
      }
    });

    // Add broadcasts
    broadcasts.forEach(b => {
      if (b.scheduled_time && b.status !== 'cancelled') {
        items.push({
          id: b.id,
          type: 'broadcast',
          title: b.title,
          time: b.scheduled_time,
          duration: b.duration_minutes,
          status: b.status,
          broadcastType: b.broadcast_type,
          online_link: b.live_stream_url,
          host: { name: b.host_name, avatar: b.host_avatar },
          rsvpCount: b.rsvp_count || 0,
          isHost: b.host_id === currentUser?.email,
          isRsvp: b.rsvp_user_ids?.includes(currentUser?.email)
        });
      }
    });

    // Add missions with start times
    missions.forEach(m => {
      if (m.start_time) {
        items.push({
          id: m.id,
          type: 'mission',
          title: m.title,
          time: m.start_time,
          endTime: m.end_time,
          description: m.objective,
          participantCount: m.participant_count || 0,
          isParticipant: m.participant_ids?.includes(currentUser?.email)
        });
      }
    });

    // Sort by time
    return items.sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [meetings, events, broadcasts, missions, currentUser?.email]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    // Filter by type
    if (filter !== 'all') {
      items = items.filter(i => i.type === filter);
    }

    // Filter by selected date in calendar view
    if (viewMode === 'calendar' && selectedDate) {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      items = items.filter(i => {
        const itemDate = parseISO(i.time);
        return itemDate >= dayStart && itemDate <= dayEnd;
      });
    }

    return items;
  }, [allItems, filter, viewMode, selectedDate]);

  // Get upcoming items (next 7 days) for list view
  const upcomingItems = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return filteredItems.filter(i => {
      const itemDate = parseISO(i.time);
      return isAfter(itemDate, now) && isBefore(itemDate, weekFromNow);
    });
  }, [filteredItems]);

  // Get dates with events for calendar highlighting
  const datesWithEvents = useMemo(() => {
    const dates = new Set();
    allItems.forEach(item => {
      try {
        const date = parseISO(item.time);
        dates.add(format(date, 'yyyy-MM-dd'));
      } catch {}
    });
    return dates;
  }, [allItems]);

  const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c1538f946_meets.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent">
      {/* Hero Section */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src={HERO_IMAGE}
          alt="Schedule"
          className="hero-image w-full h-full object-cover object-center"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide flex items-center gap-3"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                <CalendarIcon className="w-8 h-8" />
                Global Schedule
              </h1>
              <ForwardButton currentPage="Schedule" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <p className="text-violet-200/90 text-base">
              All your meetings, events, broadcasts & missions in one place
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 -mt-6 relative z-[5]">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="h-9 bg-white border">
                <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                <TabsTrigger value="meeting" className="text-xs px-3">Meetings</TabsTrigger>
                <TabsTrigger value="event" className="text-xs px-3">Events</TabsTrigger>
                <TabsTrigger value="broadcast" className="text-xs px-3">Broadcasts</TabsTrigger>
                <TabsTrigger value="mission" className="text-xs px-3">Missions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1"
            >
              <Users className="w-4 h-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="gap-1"
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </Button>
          </div>
        </div>

        <div className={cn(
          "grid gap-6",
          viewMode === 'calendar' ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border p-4 sticky top-24">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md"
                  modifiers={{
                    hasEvent: (date) => datesWithEvents.has(format(date, 'yyyy-MM-dd'))
                  }}
                  modifiersStyles={{
                    hasEvent: { 
                      fontWeight: 'bold',
                      backgroundColor: 'rgb(139 92 246 / 0.1)',
                      borderRadius: '50%'
                    }
                  }}
                />
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-slate-900">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className={cn(viewMode === 'calendar' ? "lg:col-span-2" : "")}>
            {(viewMode === 'list' ? upcomingItems : filteredItems).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {viewMode === 'calendar' ? 'Nothing scheduled for this day' : 'No upcoming items'}
                </h3>
                <p className="text-slate-500">
                  {viewMode === 'calendar' 
                    ? 'Select a different date or create a new event'
                    : 'Schedule a meeting, RSVP to an event, or join a mission'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(viewMode === 'list' ? upcomingItems : filteredItems).map((item) => {
                  const config = ITEM_TYPE_CONFIG[item.type];
                  const ItemIcon = config.icon;
                  const itemDate = parseISO(item.time);
                  const isToday = isSameDay(itemDate, new Date());
                  const isPast = isBefore(itemDate, new Date());

                  return (
                    <div 
                      key={`${item.type}-${item.id}`}
                      className={cn(
                        "bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all",
                        isPast && "opacity-60",
                        item.status === 'live' && "ring-2 ring-red-500"
                      )}
                    >
                      <div className="flex">
                        {/* Type indicator */}
                        <div className={cn(
                          "w-2 shrink-0",
                          config.color
                        )} />
                        
                        {/* Date column */}
                        <div className={cn(
                          "w-20 p-3 flex flex-col items-center justify-center border-r",
                          isToday && "bg-violet-50"
                        )}>
                          <span className="text-lg font-bold text-slate-900">{format(itemDate, 'd')}</span>
                          <span className="text-xs text-slate-500">{format(itemDate, 'MMM')}</span>
                          <span className="text-xs text-slate-400">{format(itemDate, 'EEE')}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Type badge & time */}
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge className={cn("text-xs", config.color, "text-white")}>
                                  <ItemIcon className="w-3 h-3 mr-1" />
                                  {config.label}
                                </Badge>
                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(itemDate, 'h:mm a')}
                                </span>
                                {item.duration && (
                                  <span className="text-xs text-slate-400">({item.duration} min)</span>
                                )}
                                {item.status === 'live' && (
                                  <Badge className="bg-red-500 text-white text-xs animate-pulse">LIVE</Badge>
                                )}
                                {item.status === 'pending' && (
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Pending</Badge>
                                )}
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>

                              {/* Meta info */}
                              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                {item.host && (
                                  <span className="flex items-center gap-1">
                                    <Avatar className="w-4 h-4">
                                      <AvatarImage src={item.host.avatar} />
                                      <AvatarFallback className="text-[8px]">{item.host.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    {item.host.name}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {item.location}
                                  </span>
                                )}
                                {item.online_link && (
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <Video className="w-3 h-3" />
                                    Online
                                  </span>
                                )}
                                {item.attendeeCount !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {item.attendeeCount} attending
                                  </span>
                                )}
                                {item.rsvpCount !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {item.rsvpCount} RSVPs
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action button */}
                            <Link to={createPageUrl(config.page)}>
                              <Button variant="outline" size="sm" className="shrink-0">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}