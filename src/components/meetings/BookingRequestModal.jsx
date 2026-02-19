import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Clock, Send, Search, User, Video, MapPin, Loader2, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function BookingRequestModal({ open, onClose, preSelectedUser = null }) {
  const [step, setStep] = useState(preSelectedUser ? 2 : 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Sync selectedUser when preSelectedUser changes
  React.useEffect(() => {
    if (preSelectedUser) {
      setSelectedUser(preSelectedUser);
      setStep(2);
    } else {
      setSelectedUser(null);
      setStep(1);
    }
  }, [preSelectedUser]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [meetingType, setMeetingType] = useState('casual');
  const [locationType, setLocationType] = useState('online');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [createZoomLink, setCreateZoomLink] = useState(true);
  const [sendEmailInvite, setSendEmailInvite] = useState(true);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200)
  });

  // Filter profiles for search
  const filteredProfiles = profiles.filter(p => {
    if (p.user_id === currentUser?.email) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.display_name?.toLowerCase().includes(q) ||
      p.handle?.toLowerCase().includes(q) ||
      p.user_id?.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  const timeSlots = [];
  for (let h = 6; h <= 22; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const handleSelectUser = (profile) => {
    setSelectedUser(profile);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedDate || !currentUser) return;
    
    // Get guest user_id - handle both direct user_id and email fallbacks
    const guestUserId = selectedUser.user_id || selectedUser.email || selectedUser.id;
    if (!guestUserId) {
      console.error('No valid user_id for guest');
      return;
    }
    
    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const me = myProfile?.[0];
      const guestName = selectedUser.display_name || selectedUser.name || 'User';

      // Create Zoom meeting if online and createZoomLink is enabled
      let zoomJoinUrl = '';
      let zoomStartUrl = '';
      let zoomMeetingId = '';
      
      if (locationType === 'online' && createZoomLink) {
        try {
          const zoomResponse = await base44.functions.invoke('zoomMeeting', {
            action: 'create',
            meetingDetails: {
              topic: title || `Meeting with ${guestName}`,
              start_time: scheduledTime.toISOString(),
              duration: duration,
              agenda: message || `${meetingType} meeting between ${currentUser.full_name || me?.display_name} and ${guestName}`
            },
            // Send email invites to both host and guest
            sendEmails: sendEmailInvite,
            hostEmail: currentUser.email,
            hostName: currentUser.full_name || me?.display_name,
            guestEmail: guestUserId,
            guestName: guestName
          });
          
          if (zoomResponse.data?.success) {
            zoomJoinUrl = zoomResponse.data.meeting.join_url;
            zoomStartUrl = zoomResponse.data.meeting.start_url;
            zoomMeetingId = zoomResponse.data.meeting.id?.toString();
          }
        } catch (zoomError) {
          console.error('Failed to create Zoom meeting:', zoomError);
          // Continue without Zoom link - meeting can still be created
        }
      }

      // Create the meeting request
      await base44.entities.Meeting.create({
        title: title || `Meeting with ${guestName}`,
        host_id: currentUser.email,
        guest_id: guestUserId,
        host_name: currentUser.full_name || me?.display_name,
        guest_name: guestName,
        host_avatar: me?.avatar_url,
        guest_avatar: selectedUser.avatar_url || selectedUser.avatar,
        scheduled_time: scheduledTime.toISOString(),
        duration_minutes: duration,
        meeting_type: meetingType,
        location: locationType === 'online' ? 'Online' : '',
        online_link: zoomJoinUrl || '',
        notes: message,
        status: 'pending'
      });

      // Send notification to the recipient
      await base44.entities.Notification.create({
        user_id: guestUserId,
        type: 'meeting',
        title: 'New Meeting Request',
        message: `${currentUser.full_name || me?.display_name} wants to schedule a ${meetingType} meeting with you on ${format(scheduledTime, 'MMM d')} at ${format(scheduledTime, 'h:mm a')}`,
        action_url: '/Meetings',
        action_label: 'View Request',
        source_user_id: currentUser.email,
        source_user_name: currentUser.full_name || me?.display_name,
        source_user_avatar: me?.avatar_url
      });

      onClose();
      // Reset form
      setStep(1);
      setSelectedUser(null);
      setSelectedDate(null);
      setSelectedTime('10:00');
      setMessage('');
      setTitle('');
    } catch (error) {
      console.error('Failed to create meeting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(preSelectedUser ? 2 : 1);
    if (!preSelectedUser) setSelectedUser(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-violet-600" />
            {step === 1 ? 'Select Person to Meet' : 'Request a Meeting'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, handle, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* User List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No users found</p>
                </div>
              ) : (
                filteredProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectUser(profile)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-violet-50 hover:border-violet-200 transition-all text-left"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>{profile.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{profile.display_name}</p>
                      <p className="text-sm text-slate-500 truncate">@{profile.handle}</p>
                    </div>
                    <span className="text-xs text-slate-400 capitalize">{profile.rp_rank_code || 'seeker'}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Selected User Display */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedUser?.avatar_url} />
                <AvatarFallback>{selectedUser?.display_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-violet-900">{selectedUser?.display_name}</p>
                <p className="text-sm text-violet-600">@{selectedUser?.handle}</p>
              </div>
              {!preSelectedUser && (
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Change
                </Button>
              )}
            </div>

            {/* Meeting Title */}
            <div className="space-y-2">
              <Label>Meeting Title (optional)</Label>
              <Input
                placeholder={`Meeting with ${selectedUser?.display_name}`}
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
                  <SelectItem value="casual">Casual Chat</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="mission">Mission Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Type */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={locationType === 'online' ? 'default' : 'outline'}
                  className={cn("flex-1 gap-2", locationType === 'online' && "bg-violet-600")}
                  onClick={() => setLocationType('online')}
                >
                  <Video className="w-4 h-4" />
                  Online
                </Button>
                <Button
                  type="button"
                  variant={locationType === 'in-person' ? 'default' : 'outline'}
                  className={cn("flex-1 gap-2", locationType === 'in-person' && "bg-violet-600")}
                  onClick={() => setLocationType('in-person')}
                >
                  <MapPin className="w-4 h-4" />
                  In Person
                </Button>
              </div>
            </div>

            {/* Zoom Link Option - only show for online meetings */}
            {locationType === 'online' && (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Create Zoom Meeting</p>
                      <p className="text-xs text-blue-600">Automatically generate a Zoom link</p>
                    </div>
                  </div>
                  <Switch
                    checked={createZoomLink}
                    onCheckedChange={setCreateZoomLink}
                  />
                </div>

                {/* Email Invite Option */}
                {createZoomLink && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-emerald-900">Send Email Invites</p>
                        <p className="text-xs text-emerald-600">Both you and {selectedUser?.display_name} will receive an email</p>
                      </div>
                    </div>
                    <Switch
                      checked={sendEmailInvite}
                      onCheckedChange={setSendEmailInvite}
                    />
                  </div>
                )}
              </>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea
                placeholder="Add a note about what you'd like to discuss..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedDate || submitting}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {locationType === 'online' && createZoomLink ? 'Creating Zoom Meeting...' : 'Sending Request...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Meeting Request
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}