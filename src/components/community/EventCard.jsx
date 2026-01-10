import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Video, Users, ExternalLink } from "lucide-react";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import DemoStamp from '@/components/ui/DemoStamp';

export default function EventCard({ event, user, onViewDetails }) {
  const queryClient = useQueryClient();

  const isAttending = event.attendee_ids?.includes(user?.email);
  const isHost = event.host_id === user?.email;
  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;
  const eventDate = parseISO(event.start_time);
  const isEventPast = isPast(eventDate);
  const isLive = event.status === 'live';

  const joinMutation = useMutation({
    mutationFn: async () => {
      const newAttendees = [...(event.attendee_ids || []), user.email];
      return base44.entities.Event.update(event.id, {
        attendee_ids: newAttendees,
        attendee_count: newAttendees.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const newAttendees = (event.attendee_ids || []).filter(id => id !== user.email);
      return base44.entities.Event.update(event.id, {
        attendee_ids: newAttendees,
        attendee_count: newAttendees.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
  });

  const formatEventDate = () => {
    if (isToday(eventDate)) return `Today at ${format(eventDate, 'h:mm a')}`;
    if (isTomorrow(eventDate)) return `Tomorrow at ${format(eventDate, 'h:mm a')}`;
    return format(eventDate, 'MMM d, h:mm a');
  };

  const categoryColors = {
    meditation: 'bg-purple-100 text-purple-700',
    workshop: 'bg-blue-100 text-blue-700',
    meetup: 'bg-emerald-100 text-emerald-700',
    ceremony: 'bg-amber-100 text-amber-700',
    discussion: 'bg-cyan-100 text-cyan-700',
    training: 'bg-indigo-100 text-indigo-700',
    celebration: 'bg-pink-100 text-pink-700',
    other: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all",
      isLive && "ring-2 ring-red-500",
      isEventPast && "opacity-60"
    )}>
      {/* Image or gradient header */}
      {event.image_url ? (
        <div className="h-32 relative">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          {isLive && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white animate-pulse">
              🔴 LIVE NOW
            </Badge>
          )}
        </div>
      ) : (
        <div className={cn(
          "h-24 relative",
          event.event_type === 'online' 
            ? "bg-gradient-to-r from-blue-500 to-indigo-600"
            : "bg-gradient-to-r from-emerald-500 to-teal-600"
        )}>
          {isLive && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white animate-pulse">
              🔴 LIVE NOW
            </Badge>
          )}
          <div className="absolute bottom-2 right-2">
            {event.event_type === 'online' ? (
              <Video className="w-8 h-8 text-white/50" />
            ) : (
              <MapPin className="w-8 h-8 text-white/50" />
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Category & Type badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Badge className={cn("text-xs", categoryColors[event.category] || categoryColors.other)}>
            {event.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {event.event_type === 'online' ? 'Online' : event.event_type === 'in_person' ? 'In Person' : 'Hybrid'}
          </Badge>
          {event.recurring !== 'none' && (
            <Badge variant="outline" className="text-xs">
              {event.recurring}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
        
        {event.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">{event.description}</p>
        )}

        {/* Date & Location */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            {formatEventDate()}
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              {event.location}
            </div>
          )}
        </div>

        {/* Host & Attendees */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 cursor-pointer" data-user-id={event.host_id}>
            <Avatar className="w-6 h-6">
              <AvatarImage src={event.host_avatar} />
              <AvatarFallback className="text-xs">{event.host_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-500">by {event.host_name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            {event.attendee_count || 0}
            {event.max_attendees && ` / ${event.max_attendees}`}
          </div>
        </div>

        {/* Price */}
        {!event.is_free && (
          <div className="mb-3 px-2 py-1 rounded bg-amber-50 text-amber-700 text-sm">
            {event.price_ggg} GGG
          </div>
        )}

        {/* Demo Stamp */}
        <DemoStamp size="sm" />

        {/* Actions */}
        <div className="flex gap-2">
          {isHost ? (
            <>
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onViewDetails?.(event)}>
                Manage
              </Button>
              <Button disabled className="flex-1 rounded-xl bg-violet-100 text-violet-700">
                Hosting
              </Button>
            </>
          ) : isAttending ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => leaveMutation.mutate()} 
                disabled={leaveMutation.isPending}
                className="flex-1 rounded-xl"
              >
                Leave
              </Button>
              {event.online_link && !isEventPast && (
                <Button 
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 gap-1"
                  onClick={() => window.open(event.online_link, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                  Join
                </Button>
              )}
              {!event.online_link && (
                <Button disabled className="flex-1 rounded-xl bg-emerald-100 text-emerald-700">
                  Attending
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending || isFull || isEventPast}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              {isFull ? 'Event Full' : isEventPast ? 'Event Ended' : 'RSVP'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}