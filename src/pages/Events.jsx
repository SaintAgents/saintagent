import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Search, MapPin, Video, Sparkles } from "lucide-react";
import CreateEventModal from '@/components/community/CreateEventModal';
import EventCard from '@/components/community/EventCard';
import BackButton from '@/components/hud/BackButton';
import { isPast, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';

export default function Events() {
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_time', 100)
  });

  // Filter events
  const filteredEvents = events.filter(event => {
    const eventDate = parseISO(event.start_time);
    const eventPast = isPast(eventDate) && event.status !== 'live';
    
    // Tab filter
    if (tab === 'upcoming' && eventPast) return false;
    if (tab === 'past' && !eventPast) return false;
    if (tab === 'my_events' && event.host_id !== user?.email && !event.attendee_ids?.includes(user?.email)) return false;
    if (tab === 'today' && !isToday(eventDate)) return false;
    if (tab === 'this_week' && !isThisWeek(eventDate)) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    
    // Type filter
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false;
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!event.title?.toLowerCase().includes(q) && 
          !event.description?.toLowerCase().includes(q) &&
          !event.host_name?.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  // Sort: live first, then by start_time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.start_time) - new Date(b.start_time);
  });

  // Stats
  const todayCount = events.filter(e => isToday(parseISO(e.start_time))).length;
  const thisWeekCount = events.filter(e => isThisWeek(parseISO(e.start_time))).length;
  const myEventsCount = events.filter(e => e.host_id === user?.email || e.attendee_ids?.includes(user?.email)).length;
  const liveCount = events.filter(e => e.status === 'live').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="relative h-64 md:h-72 overflow-hidden page-hero">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/faf641524_universal_upscale_0_3edbb2cf-f692-4c67-a028-2024050dad4b_0.jpg"
          alt="Events"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 hero-content">
          <div className="flex items-center gap-3 mb-2">
            <BackButton className="text-white/80 hover:text-white" />
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Events & Meetups
          </h1>
          <p className="text-white/80 text-lg max-w-md">Discover and create gatherings with conscious community</p>
          <Button onClick={() => setCreateOpen(true)} className="mt-4 bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-6 -mt-8 relative z-10">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white border">
            <p className="text-xs text-slate-500">Today</p>
            <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border">
            <p className="text-xs text-slate-500">This Week</p>
            <p className="text-2xl font-bold text-slate-900">{thisWeekCount}</p>
          </div>
          <div className="p-4 rounded-xl bg-white border">
            <p className="text-xs text-slate-500">My Events</p>
            <p className="text-2xl font-bold text-violet-600">{myEventsCount}</p>
          </div>
          {liveCount > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs text-red-600">Live Now</p>
              <p className="text-2xl font-bold text-red-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {liveCount}
              </p>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-12 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="meditation">Meditation</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="ceremony">Ceremony</SelectItem>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="celebration">Celebration</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 h-12 rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="h-12 bg-white rounded-xl border">
            <TabsTrigger value="upcoming" className="rounded-lg">Upcoming</TabsTrigger>
            <TabsTrigger value="today" className="rounded-lg">Today</TabsTrigger>
            <TabsTrigger value="this_week" className="rounded-lg">This Week</TabsTrigger>
            <TabsTrigger value="my_events" className="rounded-lg">My Events</TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-500 mb-6">
              {tab === 'my_events' 
                ? "You haven't joined or created any events yet"
                : "Be the first to create an event!"}
            </p>
            <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map(event => (
              <EventCard key={event.id} event={event} user={user} />
            ))}
          </div>
        )}
      </div>

      <CreateEventModal 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        user={user}
      />
    </div>
  );
}