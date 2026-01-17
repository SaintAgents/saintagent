import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Video, MapPin } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

const MEETING_TYPES = [
  { value: "casual", label: "Casual Chat", description: "Get to know each other" },
  { value: "collaboration", label: "Collaboration", description: "Discuss working together" },
  { value: "mentorship", label: "Mentorship", description: "Learning or guidance session" },
  { value: "consultation", label: "Consultation", description: "Professional advice" },
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
];

export default function BookingRequestModal({ 
  open, 
  onOpenChange, 
  targetUser,  // { id, name, avatar, email }
  listing,     // optional - if booking a specific listing/offer
  match,       // optional - if booking from a match
}) {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [meetingType, setMeetingType] = useState("casual");
  const [duration, setDuration] = useState(30);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  // Get current user profile
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
  });
  const myProfile = profiles?.[0];

  const handleSubmit = async () => {
    if (!date || !time || !targetUser) return;
    
    setIsSubmitting(true);
    try {
      // Combine date and time
      const scheduledTime = new Date(date);
      const [hours, minutes] = time.split(':');
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Create meeting request
      const meetingData = {
        title: title || `Meeting with ${targetUser.name}`,
        host_id: currentUser.email,
        guest_id: targetUser.email || targetUser.id,
        host_name: myProfile?.display_name || currentUser.full_name,
        guest_name: targetUser.name,
        host_avatar: myProfile?.avatar_url,
        guest_avatar: targetUser.avatar,
        scheduled_time: scheduledTime.toISOString(),
        duration_minutes: duration,
        meeting_type: meetingType,
        status: 'pending',
        notes: notes,
      };

      // If booking a listing, add listing reference
      if (listing) {
        meetingData.listing_id = listing.id;
      }

      await base44.entities.Meeting.create(meetingData);

      // Create notification for the recipient
      await base44.entities.Notification.create({
        user_id: targetUser.email || targetUser.id,
        type: 'meeting',
        title: 'New Meeting Request',
        message: `${myProfile?.display_name || currentUser.full_name} wants to meet with you on ${format(scheduledTime, 'PPP')} at ${time}`,
        action_url: '/Meetings',
        action_label: 'View Request',
        source_user_id: currentUser.email,
        source_user_name: myProfile?.display_name || currentUser.full_name,
        source_user_avatar: myProfile?.avatar_url,
      });

      // If this was from a match, update match status
      if (match?.id) {
        await base44.entities.Match.update(match.id, { status: 'converted' });
      }

      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      onOpenChange(false);
      
      // Reset form
      setDate(null);
      setTime("");
      setTitle("");
      setNotes("");
    } catch (error) {
      console.error('Failed to create booking request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = date && time && targetUser;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-violet-600" />
            {listing ? `Book: ${listing.title}` : `Request Meeting`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Target User Display */}
          {targetUser && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              {targetUser.avatar ? (
                <img src={targetUser.avatar} alt={targetUser.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-violet-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{targetUser.name}</p>
                <p className="text-sm text-slate-500">Meeting request will be sent</p>
              </div>
            </div>
          )}

          {/* Meeting Title */}
          <div className="space-y-2">
            <Label>Meeting Title (optional)</Label>
            <Input
              placeholder={`Meeting with ${targetUser?.name || 'user'}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-slate-500 ml-2 text-xs">- {type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Add a note about what you'd like to discuss..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Meeting Format Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
            <Video className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 dark:text-blue-300">
              A video meeting link will be generated when the request is accepted
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}