import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Check,
  X
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";

export default function GroupEvents({ circle, user }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [tab, setTab] = useState('upcoming');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    online_link: '',
    event_type: 'online',
    category: 'meetup',
    max_attendees: ''
  });
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['groupEvents', circle.id],
    queryFn: () => base44.entities.Event.filter({ circle_id: circle.id }, '-start_time', 100),
    enabled: !!circle.id
  });

  // Fetch circle member profiles for notifications
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['circleMemberProfiles', circle.id],
    queryFn: async () => {
      if (!circle.member_ids?.length) return [];
      const profiles = await base44.entities.UserProfile.list('-updated_date', 200);
      return profiles.filter(p => circle.member_ids.includes(p.user_id));
    },
    enabled: !!circle.member_ids?.length
  });

  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      // Create the event
      const event = await base44.entities.Event.create({
        ...data,
        circle_id: circle.id,
        host_id: user.email,
        host_name: user.full_name,
        status: 'upcoming',
        attendee_ids: [user.email],
        attendee_count: 1
      });
      
      // Send notifications to all circle members (except host)
      const otherMembers = (circle.member_ids || []).filter(id => id !== user.email);
      await Promise.all(otherMembers.map(memberId => 
        base44.entities.Notification.create({
          user_id: memberId,
          type: 'event',
          title: `New event in ${circle.name}`,
          message: `${user.full_name} scheduled "${data.title}" for ${format(new Date(data.start_time), 'MMM d, h:mm a')}`,
          action_url: `/Circles`,
          priority: 'normal',
          source_user_id: user.email,
          source_user_name: user.full_name
        })
      ));
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupEvents', circle.id] });
      queryClient.invalidateQueries({ queryKey: ['circleEvents'] });
      setCreateOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        online_link: '',
        event_type: 'online',
        category: 'meetup',
        max_attendees: ''
      });
    }
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ event, action }) => {
      const currentAttendees = event.attendee_ids || [];
      let newAttendees;
      if (action === 'join') {
        newAttendees = [...currentAttendees, user.email];
      } else {
        newAttendees = currentAttendees.filter(id => id !== user.email);
      }
      return base44.entities.Event.update(event.id, {
        attendee_ids: newAttendees,
        attendee_count: newAttendees.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groupEvents', circle.id] })
  });

  const now = new Date();
  const upcomingEvents = events.filter(e => isAfter(parseISO(e.start_time), now));
  const pastEvents = events.filter(e => isBefore(parseISO(e.start_time), now));
  const displayEvents = tab === 'upcoming' ? upcomingEvents : pastEvents;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={tab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setTab('upcoming')}
            className={tab === 'upcoming' ? 'bg-violet-600 hover:bg-violet-700' : ''}
          >
            Upcoming ({upcomingEvents.length})
          </Button>
          <Button 
            variant={tab === 'past' ? 'default' : 'outline'}
            onClick={() => setTab('past')}
            className={tab === 'past' ? 'bg-violet-600 hover:bg-violet-700' : ''}
          >
            Past ({pastEvents.length})
          </Button>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {displayEvents.map(event => {
          const isAttending = event.attendee_ids?.includes(user.email);
          const isHost = event.host_id === user.email;
          const isPast = isBefore(parseISO(event.start_time), now);

          return (
            <div key={event.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all">
              <div className="flex">
                {/* Date Column */}
                <div className="w-24 bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-4 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{format(parseISO(event.start_time), 'd')}</span>
                  <span className="text-sm">{format(parseISO(event.start_time), 'MMM')}</span>
                  <span className="text-xs opacity-80">{format(parseISO(event.start_time), 'EEE')}</span>
                </div>

                {/* Content */}
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
                      </div>
                      <h3 className="font-semibold text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">{event.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(parseISO(event.start_time), 'h:mm a')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendee_count || 0}
                      {event.max_attendees && ` / ${event.max_attendees}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                  </div>

                  {!isPast && (
                    <div className="flex gap-2 mt-4">
                      {isHost ? (
                        <Badge className="bg-amber-100 text-amber-700">You're hosting</Badge>
                      ) : isAttending ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => rsvpMutation.mutate({ event, action: 'leave' })}
                          className="gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel RSVP
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => rsvpMutation.mutate({ event, action: 'join' })}
                          className="bg-violet-600 hover:bg-violet-700 gap-1"
                          disabled={event.max_attendees && event.attendee_count >= event.max_attendees}
                        >
                          <Check className="w-3 h-3" />
                          RSVP
                        </Button>
                      )}
                      {event.online_link && isAttending && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={event.online_link} target="_blank" rel="noopener noreferrer">
                            <Video className="w-3 h-3 mr-1" />
                            Join Link
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">
            No {tab} events
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            {tab === 'upcoming' ? 'Create an event for your group!' : 'No past events yet'}
          </p>
          {tab === 'upcoming' && (
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          )}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Group Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Start Time</label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">End Time</label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select 
                value={newEvent.event_type} 
                onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={newEvent.category} 
                onValueChange={(v) => setNewEvent({ ...newEvent, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meditation">Meditation</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="celebration">Celebration</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newEvent.event_type !== 'online' && (
              <Input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            )}
            {newEvent.event_type !== 'in_person' && (
              <Input
                placeholder="Online meeting link"
                value={newEvent.online_link}
                onChange={(e) => setNewEvent({ ...newEvent, online_link: e.target.value })}
              />
            )}
            <Input
              type="number"
              placeholder="Max attendees (optional)"
              value={newEvent.max_attendees}
              onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createEventMutation.mutate({
                  ...newEvent,
                  max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : undefined
                })}
                disabled={!newEvent.title.trim() || !newEvent.start_time || createEventMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}