import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  Calendar,
  MessageCircle,
  Star,
  ArrowRight
} from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

export default function MeetingCard({ meeting, onAction, isCompact = false }) {
  const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-blue-50 text-blue-700 border-blue-200",
    scheduled: "bg-violet-50 text-violet-700 border-violet-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    declined: "bg-slate-50 text-slate-500 border-slate-200",
    cancelled: "bg-slate-50 text-slate-500 border-slate-200",
    no_show: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const formatMeetingTime = (dateStr) => {
    if (!dateStr) return "Time TBD";
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, "MMM d, h:mm a");
  };

  const otherPerson = meeting.host_id === "current" ? {
    name: meeting.guest_name,
    avatar: meeting.guest_avatar
  } : {
    name: meeting.host_name,
    avatar: meeting.host_avatar
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
        <Avatar className="w-8 h-8">
          <AvatarImage src={otherPerson.avatar} />
          <AvatarFallback className="text-xs">{otherPerson.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{meeting.title}</p>
          <p className="text-xs text-slate-500">{formatMeetingTime(meeting.scheduled_time)}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        <Avatar className="w-11 h-11 ring-2 ring-white shadow-sm">
          <AvatarImage src={otherPerson.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            {otherPerson.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900">{meeting.title}</h4>
              <p className="text-sm text-slate-500">with {otherPerson.name}</p>
            </div>
            <Badge className={cn("border", statusColors[meeting.status])}>
              {meeting.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {formatMeetingTime(meeting.scheduled_time)}
            </div>
            {meeting.duration_minutes && (
              <span className="text-slate-400">• {meeting.duration_minutes}min</span>
            )}
          </div>

          {meeting.location && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              {meeting.location}
            </div>
          )}

          {meeting.online_link && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-violet-600">
              <Video className="w-4 h-4" />
              Video meeting
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
        {meeting.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-lg"
              onClick={() => onAction?.('accept', meeting)}
            >
              <Check className="w-4 h-4 mr-1.5" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => onAction?.('propose', meeting)}
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Propose Time
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              className="shrink-0"
              onClick={() => onAction?.('decline', meeting)}
            >
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </>
        )}
        {meeting.status === 'scheduled' && (
          <>
            <Button 
              size="sm" 
              className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-lg"
              onClick={() => onAction?.('join', meeting)}
            >
              <Video className="w-4 h-4 mr-1.5" />
              Join Meeting
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => onAction?.('reschedule', meeting)}
            >
              Reschedule
            </Button>
          </>
        )}
        {meeting.status === 'accepted' && !meeting.host_confirmed && (
          <Button 
            size="sm" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            onClick={() => onAction?.('confirm', meeting)}
          >
            <Check className="w-4 h-4 mr-1.5" />
            Confirm Completion
          </Button>
        )}
        {meeting.status === 'completed' && (
          <>
            <div className="flex-1 flex items-center gap-2 text-sm text-emerald-600">
              <Check className="w-4 h-4" />
              <span>+{meeting.ggg_earned || 25} GGG earned</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="rounded-lg"
              onClick={() => onAction?.('testimonial', meeting)}
            >
              <Star className="w-4 h-4 mr-1.5" />
              Leave Review
            </Button>
          </>
        )}
      </div>
    </div>
  );
}