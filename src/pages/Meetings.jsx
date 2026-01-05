import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Check, Plus, Users, Video, MapPin } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";

import QuickCreateModal from '@/components/hud/QuickCreateModal';
import MeetingCard from '@/components/hud/MeetingCard';
import RescheduleDialog from '@/components/meetings/RescheduleDialog';
import HelpHint from '@/components/hud/HelpHint';
import BackButton from '@/components/hud/BackButton';

export default function Meetings() {
  const [tab, setTab] = useState('upcoming');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 50)
  });

  // Fetch circle events for integration
  const { data: circleEvents = [] } = useQuery({
    queryKey: ['circleEvents'],
    queryFn: () => base44.entities.Event.list('-start_time', 100)
  });

  // Filter upcoming circle events the user is attending or hosting
  const myCircleEvents = circleEvents.filter(e => 
    isAfter(parseISO(e.start_time), new Date()) &&
    (e.host_id === currentUser?.email || e.attendee_ids?.includes(currentUser?.email))
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Meeting.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meetings'] })
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const pending = meetings.filter(m => m.status === 'pending');
  const scheduled = meetings.filter(m => m.status === 'scheduled' || m.status === 'accepted');
  const completed = meetings.filter(m => m.status === 'completed');

  const filteredMeetings = 
    tab === 'pending' ? pending :
    tab === 'upcoming' ? scheduled :
    tab === 'completed' ? completed : meetings;

  const handleAction = async (action, meeting) => {
    switch (action) {
      case 'accept':
        updateMutation.mutate({ id: meeting.id, data: { status: 'scheduled' } });
        break;
      case 'decline':
        updateMutation.mutate({ id: meeting.id, data: { status: 'declined' } });
        break;
      case 'confirm':
        updateMutation.mutate({ id: meeting.id, data: { status: 'completed', guest_confirmed: true, ggg_earned: 25 } });
        break;
      case 'reschedule':
        setRescheduleMeeting(meeting);
        break;
    }
  };

  const handleCreate = async (type, data) => {
    if (type !== 'meeting' || !currentUser) return;
    await base44.entities.Meeting.create({
      title: data.title || 'Meeting',
      host_id: currentUser.email,
      guest_id: data.recipient,
      host_name: currentUser.full_name,
      guest_name: data.recipient,
      meeting_type: data.type || 'casual',
      status: 'pending'
    });
    queryClient.invalidateQueries({ queryKey: ['meetings'] });
    setQuickCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BackButton />
              <Calendar className="w-6 h-6 text-blue-500" />
              Meetings & Connections
              <HelpHint content="Meetings are verified touchpoints that build trust and earn GGG. Request & Accept: Send meeting requests to matches or accept incoming requests. Dual Confirmation: Both parties MUST confirm completion to trigger GGG rewards—this prevents gaming. Meeting Types: Collaboration, Mentorship, Consultation, Casual, or Mission-related—each serves different purposes. Pending meetings await response, Upcoming are scheduled, and Completed have been verified by both parties." />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 ml-9">Schedule, attend, and verify your meetings to earn GGG</p>
          </div>
          <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setQuickCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Request Meeting
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">{pending.length}</p>
                <p className="text-sm text-amber-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{scheduled.length}</p>
                <p className="text-sm text-blue-600">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{completed.length}</p>
                <p className="text-sm text-emerald-600">Completed</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-900">{myCircleEvents.length}</p>
                <p className="text-sm text-violet-600">Circle Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-4 h-11 bg-white rounded-xl border">
            <TabsTrigger value="pending" className="rounded-lg">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg">
              Upcoming ({scheduled.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg">
              Circle Events ({myCircleEvents.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Meetings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tab === 'events' ? (
          // Circle Events Tab
          myCircleEvents.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No upcoming circle events</h3>
              <p className="text-slate-500 mb-6">RSVP to events in your circles to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myCircleEvents.map(event => {
                const isHost = event.host_id === currentUser?.email;
                const categoryColors = {
                  meditation: 'bg-purple-100 text-purple-700',
                  workshop: 'bg-blue-100 text-blue-700',
                  meetup: 'bg-emerald-100 text-emerald-700',
                  ceremony: 'bg-amber-100 text-amber-700',
                  discussion: 'bg-cyan-100 text-cyan-700',
                  training: 'bg-rose-100 text-rose-700',
                  celebration: 'bg-pink-100 text-pink-700',
                  other: 'bg-slate-100 text-slate-700'
                };
                return (
                  <div key={event.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all">
                    <div className="flex">
                      <div className="w-24 bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-4 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{format(parseISO(event.start_time), 'd')}</span>
                        <span className="text-sm">{format(parseISO(event.start_time), 'MMM')}</span>
                        <span className="text-xs opacity-80">{format(parseISO(event.start_time), 'EEE')}</span>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={cn("text-xs", categoryColors[event.category] || categoryColors.other)}>
                                {event.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs gap-1">
                                {event.event_type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                {event.event_type}
                              </Badge>
                              {isHost && <Badge className="bg-amber-100 text-amber-700 text-xs">Hosting</Badge>}
                            </div>
                            <h3 className="font-semibold text-slate-900">{event.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-1 mt-1">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(parseISO(event.start_time), 'h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendee_count || 0} attending
                          </span>
                        </div>
                        {event.online_link && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" asChild className="gap-1">
                              <a href={event.online_link} target="_blank" rel="noopener noreferrer">
                                <Video className="w-3 h-3" />
                                Join Call
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No meetings yet</h3>
            <p className="text-slate-500 mb-6">Start connecting with matches to schedule meetings</p>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
              Find Matches
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map(meeting => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
      <QuickCreateModal 
        open={quickCreateOpen}
        initialType="meeting"
        onClose={() => setQuickCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RescheduleDialog 
        open={!!rescheduleMeeting} 
        meeting={rescheduleMeeting}
        onClose={() => setRescheduleMeeting(null)}
        onSave={(iso) => {
          updateMutation.mutate({ id: rescheduleMeeting.id, data: { scheduled_time: iso, status: 'scheduled' } });
          setRescheduleMeeting(null);
        }}
      />
    </div>
  );
}