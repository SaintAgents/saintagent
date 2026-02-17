import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Radio, Calendar, Clock, Users, Play, Bell, BellOff, 
  Video, Mic, ExternalLink, CheckCircle 
} from "lucide-react";
import { format, parseISO } from "date-fns";

const BROADCAST_TYPE_COLORS = {
  podcast: 'bg-violet-100 text-violet-700',
  webinar: 'bg-blue-100 text-blue-700',
  town_hall: 'bg-amber-100 text-amber-700',
  interview: 'bg-emerald-100 text-emerald-700',
  workshop: 'bg-pink-100 text-pink-700',
  ama: 'bg-cyan-100 text-cyan-700'
};

const BROADCAST_TYPE_LABELS = {
  podcast: 'Podcast',
  webinar: 'Webinar',
  town_hall: 'Town Hall',
  interview: 'Interview',
  workshop: 'Workshop',
  ama: 'AMA'
};

export default function BroadcastCard({ broadcast, currentUser, onRsvp, isAdmin }) {
  const isRsvp = broadcast.rsvp_user_ids?.includes(currentUser?.email);
  const isLive = broadcast.status === 'live';
  const isPast = broadcast.status === 'ended';
  const isHost = broadcast.host_id === currentUser?.email;

  return (
    <div className={cn(
      "bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all",
      isLive && "ring-2 ring-red-500"
    )}>
      <div className="flex">
        {/* Date Column */}
        <div className={cn(
          "w-24 p-4 flex flex-col items-center justify-center text-white",
          isLive ? "bg-gradient-to-br from-red-500 to-pink-500" :
          isPast ? "bg-gradient-to-br from-slate-400 to-slate-500" :
          "bg-gradient-to-br from-violet-500 to-indigo-600"
        )}>
          {isLive ? (
            <>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse mb-2" />
              <span className="text-sm font-bold">LIVE</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold">{format(parseISO(broadcast.scheduled_time), 'd')}</span>
              <span className="text-sm">{format(parseISO(broadcast.scheduled_time), 'MMM')}</span>
              <span className="text-xs opacity-80">{format(parseISO(broadcast.scheduled_time), 'EEE')}</span>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={cn("text-xs", BROADCAST_TYPE_COLORS[broadcast.broadcast_type])}>
                  {BROADCAST_TYPE_LABELS[broadcast.broadcast_type]}
                </Badge>
                {broadcast.is_featured && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">Featured</Badge>
                )}
                {isHost && (
                  <Badge className="bg-violet-100 text-violet-700 text-xs">Host</Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg text-slate-900 mb-1">{broadcast.title}</h3>
              
              {/* Description */}
              {broadcast.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{broadcast.description}</p>
              )}

              {/* Host Info */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={broadcast.host_avatar} />
                  <AvatarFallback className="text-xs">{broadcast.host_name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-600">Hosted by {broadcast.host_name}</span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(parseISO(broadcast.scheduled_time), 'h:mm a')}
                </span>
                <span className="flex items-center gap-1">
                  <Mic className="w-4 h-4" />
                  {broadcast.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {broadcast.rsvp_count || 0} RSVPs
                </span>
              </div>

              {/* Topics */}
              {broadcast.topics?.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {broadcast.topics.slice(0, 3).map((topic, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image */}
            {broadcast.cover_image_url && (
              <img 
                src={broadcast.cover_image_url} 
                alt={broadcast.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            {isLive ? (
              <Button 
                className="bg-red-500 hover:bg-red-600 gap-2"
                onClick={() => window.open(broadcast.live_stream_url, '_blank')}
              >
                <Play className="w-4 h-4" />
                Join Live
              </Button>
            ) : isPast ? (
              broadcast.recording_url && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(broadcast.recording_url, '_blank')}
                >
                  <Video className="w-4 h-4" />
                  Watch Recording
                </Button>
              )
            ) : (
              <>
                <Button
                  variant={isRsvp ? "default" : "outline"}
                  className={cn("gap-2", isRsvp && "bg-emerald-600 hover:bg-emerald-700")}
                  onClick={() => onRsvp(broadcast.id, isRsvp)}
                >
                  {isRsvp ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      RSVP'd
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      RSVP & Notify Me
                    </>
                  )}
                </Button>
                
                {isHost && broadcast.zoom_start_url && (
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(broadcast.zoom_start_url, '_blank')}
                  >
                    <Video className="w-4 h-4" />
                    Start Broadcast
                  </Button>
                )}
              </>
            )}

            {broadcast.live_stream_url && !isLive && !isPast && (
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-1 text-slate-500"
                onClick={() => {
                  navigator.clipboard.writeText(broadcast.live_stream_url);
                }}
              >
                <ExternalLink className="w-3 h-3" />
                Copy Link
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}