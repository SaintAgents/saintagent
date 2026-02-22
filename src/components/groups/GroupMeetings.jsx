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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Check,
  X,
  CalendarClock,
  Vote,
  Send,
  UserPlus,
  ThumbsUp,
  Loader2,
  ExternalLink
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { toast } from 'sonner';

export default function GroupMeetings({ circle, user }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [viewTab, setViewTab] = useState('upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
  // New meeting state
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60,
    meeting_type: 'group_call',
    location: '',
    online_link: '',
    invited_members: [],
    is_poll: false,
    proposed_times: []
  });
  
  // Poll creation state
  const [pollTimes, setPollTimes] = useState(['', '', '']);
  
  const queryClient = useQueryClient();

  // Fetch group meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ['groupMeetings', circle.id],
    queryFn: () => base44.entities.Meeting.filter({ circle_id: circle.id }, '-scheduled_time', 100),
    enabled: !!circle.id
  });

  // Fetch member profiles
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['circleMemberProfiles', circle.id],
    queryFn: async () => {
      if (!circle.member_ids?.length) return [];
      const profiles = await base44.entities.UserProfile.list('-updated_date', 500);
      return profiles.filter(p => circle.member_ids.includes(p.user_id));
    },
    enabled: !!circle.member_ids?.length
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (data) => {
      const meetingData = {
        title: data.title,
        host_id: user.email,
        host_name: user.full_name,
        circle_id: circle.id,
        circle_name: circle.name,
        scheduled_time: data.scheduled_time,
        duration_minutes: data.duration_minutes,
        meeting_type: data.meeting_type,
        location: data.location || '',
        online_link: data.online_link || '',
        status: data.is_poll ? 'polling' : 'scheduled',
        notes: data.description,
        invited_ids: data.invited_members.length > 0 ? data.invited_members : circle.member_ids,
        rsvp_yes: [user.email],
        rsvp_no: [],
        rsvp_maybe: [],
        proposed_times: data.is_poll ? data.proposed_times : [],
        time_votes: data.is_poll ? {} : null
      };

      // Use existing Meeting entity with extended fields
      const meeting = await base44.entities.Meeting.create({
        ...meetingData,
        guest_id: data.invited_members[0] || circle.member_ids?.find(id => id !== user.email) || user.email
      });

      // Notify invited members
      const invitedList = data.invited_members.length > 0 ? data.invited_members : circle.member_ids || [];
      const othersToNotify = invitedList.filter(id => id !== user.email);
      
      await Promise.all(othersToNotify.map(memberId =>
        base44.entities.Notification.create({
          user_id: memberId,
          type: 'meeting',
          title: data.is_poll ? `Meeting poll in ${circle.name}` : `New meeting in ${circle.name}`,
          message: data.is_poll 
            ? `${user.full_name} is scheduling "${data.title}" - vote for your preferred time!`
            : `${user.full_name} scheduled "${data.title}" for ${format(new Date(data.scheduled_time), 'MMM d, h:mm a')}`,
          action_url: `/Circles`,
          priority: 'normal',
          source_user_id: user.email,
          source_user_name: user.full_name
        })
      ));

      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMeetings', circle.id] });
      setCreateOpen(false);
      setPollOpen(false);
      resetForm();
      toast.success('Meeting created!');
    }
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async ({ meeting, response }) => {
      const updates = {
        rsvp_yes: (meeting.rsvp_yes || []).filter(id => id !== user.email),
        rsvp_no: (meeting.rsvp_no || []).filter(id => id !== user.email),
        rsvp_maybe: (meeting.rsvp_maybe || []).filter(id => id !== user.email)
      };
      
      if (response === 'yes') updates.rsvp_yes.push(user.email);
      else if (response === 'no') updates.rsvp_no.push(user.email);
      else if (response === 'maybe') updates.rsvp_maybe.push(user.email);
      
      return base44.entities.Meeting.update(meeting.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMeetings', circle.id] });
      toast.success('RSVP updated');
    }
  });

  // Vote for time slot
  const voteTimeMutation = useMutation({
    mutationFn: async ({ meeting, timeSlot }) => {
      const currentVotes = meeting.time_votes || {};
      const slotVotes = currentVotes[timeSlot] || [];
      
      let newSlotVotes;
      if (slotVotes.includes(user.email)) {
        newSlotVotes = slotVotes.filter(id => id !== user.email);
      } else {
        newSlotVotes = [...slotVotes, user.email];
      }
      
      return base44.entities.Meeting.update(meeting.id, {
        time_votes: { ...currentVotes, [timeSlot]: newSlotVotes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMeetings', circle.id] });
    }
  });

  // Finalize poll - select winning time
  const finalizePollMutation = useMutation({
    mutationFn: async ({ meeting, selectedTime }) => {
      return base44.entities.Meeting.update(meeting.id, {
        scheduled_time: selectedTime,
        status: 'scheduled',
        proposed_times: [],
        time_votes: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMeetings', circle.id] });
      toast.success('Meeting time confirmed!');
    }
  });

  const resetForm = () => {
    setNewMeeting({
      title: '',
      description: '',
      scheduled_time: '',
      duration_minutes: 60,
      meeting_type: 'group_call',
      location: '',
      online_link: '',
      invited_members: [],
      is_poll: false,
      proposed_times: []
    });
    setPollTimes(['', '', '']);
  };

  const toggleMemberInvite = (memberId) => {
    setNewMeeting(prev => ({
      ...prev,
      invited_members: prev.invited_members.includes(memberId)
        ? prev.invited_members.filter(id => id !== memberId)
        : [...prev.invited_members, memberId]
    }));
  };

  const now = new Date();
  const upcomingMeetings = meetings.filter(m => 
    m.status === 'polling' || (m.scheduled_time && isAfter(parseISO(m.scheduled_time), now))
  );
  const pastMeetings = meetings.filter(m => 
    m.status !== 'polling' && m.scheduled_time && isBefore(parseISO(m.scheduled_time), now)
  );
  const displayMeetings = viewTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  const getUserRsvp = (meeting) => {
    if (meeting.rsvp_yes?.includes(user.email)) return 'yes';
    if (meeting.rsvp_no?.includes(user.email)) return 'no';
    if (meeting.rsvp_maybe?.includes(user.email)) return 'maybe';
    return null;
  };

  const getProfileByEmail = (email) => memberProfiles.find(p => p.user_id === email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <Button 
            variant={viewTab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setViewTab('upcoming')}
            className={viewTab === 'upcoming' ? 'bg-violet-600 hover:bg-violet-700' : ''}
          >
            Upcoming ({upcomingMeetings.length})
          </Button>
          <Button 
            variant={viewTab === 'past' ? 'default' : 'outline'}
            onClick={() => setViewTab('past')}
            className={viewTab === 'past' ? 'bg-violet-600 hover:bg-violet-700' : ''}
          >
            Past ({pastMeetings.length})
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPollOpen(true)} variant="outline" className="gap-2">
            <Vote className="w-4 h-4" />
            Poll Times
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="grid gap-4">
        {displayMeetings.map(meeting => {
          const isHost = meeting.host_id === user.email;
          const isPast = meeting.scheduled_time && isBefore(parseISO(meeting.scheduled_time), now);
          const isPolling = meeting.status === 'polling';
          const userRsvp = getUserRsvp(meeting);
          const hostProfile = getProfileByEmail(meeting.host_id);

          return (
            <div key={meeting.id} className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
              <div className="flex">
                {/* Date/Status Column */}
                <div className={cn(
                  "w-24 p-4 flex flex-col items-center justify-center text-white",
                  isPolling ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-violet-500 to-indigo-600"
                )}>
                  {isPolling ? (
                    <>
                      <Vote className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Polling</span>
                    </>
                  ) : meeting.scheduled_time ? (
                    <>
                      <span className="text-2xl font-bold">{format(parseISO(meeting.scheduled_time), 'd')}</span>
                      <span className="text-sm">{format(parseISO(meeting.scheduled_time), 'MMM')}</span>
                      <span className="text-xs opacity-80">{format(parseISO(meeting.scheduled_time), 'h:mm a')}</span>
                    </>
                  ) : (
                    <Calendar className="w-6 h-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs gap-1">
                          {meeting.meeting_type === 'group_call' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {meeting.meeting_type?.replace('_', ' ')}
                        </Badge>
                        {meeting.duration_minutes && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="w-3 h-3" />
                            {meeting.duration_minutes} min
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{meeting.title}</h3>
                      {meeting.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{meeting.notes}</p>
                      )}
                      
                      {/* Host info */}
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={hostProfile?.avatar_url} />
                          <AvatarFallback className="text-[10px]">{meeting.host_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span>Hosted by {isHost ? 'you' : meeting.host_name}</span>
                      </div>
                    </div>

                    {/* RSVP counts */}
                    <div className="text-right text-sm">
                      <div className="flex items-center justify-end gap-3 text-xs">
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {meeting.rsvp_yes?.length || 0}
                        </span>
                        <span className="text-amber-600 flex items-center gap-1">
                          ? {meeting.rsvp_maybe?.length || 0}
                        </span>
                        <span className="text-red-500 flex items-center gap-1">
                          <X className="w-3 h-3" /> {meeting.rsvp_no?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Polling UI */}
                  {isPolling && meeting.proposed_times?.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vote for your preferred time:</p>
                      <div className="space-y-2">
                        {meeting.proposed_times.map((time, idx) => {
                          const votes = meeting.time_votes?.[time] || [];
                          const hasVoted = votes.includes(user.email);
                          return (
                            <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={hasVoted ? "default" : "outline"}
                                  className={cn("h-7 w-7 p-0", hasVoted && "bg-violet-600")}
                                  onClick={() => voteTimeMutation.mutate({ meeting, timeSlot: time })}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <span className="text-sm">{format(parseISO(time), 'EEE, MMM d • h:mm a')}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{votes.length} votes</Badge>
                            </div>
                          );
                        })}
                      </div>
                      {isHost && (
                        <div className="mt-3 pt-3 border-t dark:border-slate-700">
                          <Select onValueChange={(time) => finalizePollMutation.mutate({ meeting, selectedTime: time })}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Finalize time..." />
                            </SelectTrigger>
                            <SelectContent>
                              {meeting.proposed_times.map((time, idx) => (
                                <SelectItem key={idx} value={time}>
                                  {format(parseISO(time), 'EEE, MMM d • h:mm a')} ({(meeting.time_votes?.[time] || []).length} votes)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RSVP Actions */}
                  {!isPast && !isPolling && (
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <span className="text-sm text-slate-500 mr-2">RSVP:</span>
                      <Button
                        size="sm"
                        variant={userRsvp === 'yes' ? 'default' : 'outline'}
                        className={cn("h-8 gap-1", userRsvp === 'yes' && "bg-emerald-600 hover:bg-emerald-700")}
                        onClick={() => rsvpMutation.mutate({ meeting, response: 'yes' })}
                      >
                        <Check className="w-3 h-3" /> Yes
                      </Button>
                      <Button
                        size="sm"
                        variant={userRsvp === 'maybe' ? 'default' : 'outline'}
                        className={cn("h-8 gap-1", userRsvp === 'maybe' && "bg-amber-500 hover:bg-amber-600")}
                        onClick={() => rsvpMutation.mutate({ meeting, response: 'maybe' })}
                      >
                        ? Maybe
                      </Button>
                      <Button
                        size="sm"
                        variant={userRsvp === 'no' ? 'default' : 'outline'}
                        className={cn("h-8 gap-1", userRsvp === 'no' && "bg-red-500 hover:bg-red-600")}
                        onClick={() => rsvpMutation.mutate({ meeting, response: 'no' })}
                      >
                        <X className="w-3 h-3" /> No
                      </Button>
                      
                      {meeting.online_link && userRsvp === 'yes' && (
                        <Button variant="outline" size="sm" asChild className="ml-auto h-8">
                          <a href={meeting.online_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" /> Join
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

      {displayMeetings.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700">
          <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            No {viewTab} meetings
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            {viewTab === 'upcoming' ? 'Schedule a meeting for your group!' : 'No past meetings yet'}
          </p>
          {viewTab === 'upcoming' && (
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Schedule Meeting
            </Button>
          )}
        </div>
      )}

      {/* Schedule Meeting Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Schedule Group Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Meeting title"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
            />
            <Textarea
              placeholder="Meeting agenda or description (optional)"
              value={newMeeting.description}
              onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              rows={2}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newMeeting.scheduled_time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Duration</label>
                <Select 
                  value={String(newMeeting.duration_minutes)} 
                  onValueChange={(v) => setNewMeeting({ ...newMeeting, duration_minutes: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Select 
              value={newMeeting.meeting_type} 
              onValueChange={(v) => setNewMeeting({ ...newMeeting, meeting_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group_call">Video Call</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="collaboration">Collaboration Session</SelectItem>
                <SelectItem value="casual">Casual Hangout</SelectItem>
              </SelectContent>
            </Select>

            {newMeeting.meeting_type === 'in_person' && (
              <Input
                placeholder="Location"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
              />
            )}
            {newMeeting.meeting_type !== 'in_person' && (
              <Input
                placeholder="Meeting link (Zoom, Google Meet, etc.)"
                value={newMeeting.online_link}
                onChange={(e) => setNewMeeting({ ...newMeeting, online_link: e.target.value })}
              />
            )}

            {/* Member Selection */}
            <div>
              <label className="text-sm text-slate-500 mb-2 block flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite Members (leave empty to invite all)
              </label>
              <ScrollArea className="h-32 border rounded-lg p-2">
                <div className="space-y-1">
                  {memberProfiles.filter(p => p.user_id !== user.email).map(member => (
                    <label 
                      key={member.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Checkbox
                        checked={newMeeting.invited_members.includes(member.user_id)}
                        onCheckedChange={() => toggleMemberInvite(member.user_id)}
                      />
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="text-xs">{member.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.display_name}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>Cancel</Button>
              <Button 
                onClick={() => createMeetingMutation.mutate(newMeeting)}
                disabled={!newMeeting.title.trim() || !newMeeting.scheduled_time || createMeetingMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {createMeetingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Poll Times Dialog */}
      <Dialog open={pollOpen} onOpenChange={setPollOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-500" />
              Create Time Poll
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Let members vote on their preferred meeting time.</p>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Meeting title"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
            />
            <Textarea
              placeholder="What's this meeting about?"
              value={newMeeting.description}
              onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              rows={2}
            />

            <div>
              <label className="text-sm text-slate-500 mb-2 block">Proposed Times</label>
              <div className="space-y-2">
                {pollTimes.map((time, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 w-6">{idx + 1}.</span>
                    <Input
                      type="datetime-local"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...pollTimes];
                        newTimes[idx] = e.target.value;
                        setPollTimes(newTimes);
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPollTimes([...pollTimes, ''])}
                  className="mt-2"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Time Option
                </Button>
              </div>
            </div>

            <Select 
              value={String(newMeeting.duration_minutes)} 
              onValueChange={(v) => setNewMeeting({ ...newMeeting, duration_minutes: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setPollOpen(false); resetForm(); }}>Cancel</Button>
              <Button 
                onClick={() => createMeetingMutation.mutate({
                  ...newMeeting,
                  is_poll: true,
                  proposed_times: pollTimes.filter(t => t),
                  scheduled_time: pollTimes.find(t => t) || new Date().toISOString()
                })}
                disabled={!newMeeting.title.trim() || pollTimes.filter(t => t).length < 2 || createMeetingMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 gap-2"
              >
                {createMeetingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Vote className="w-4 h-4" />}
                Create Poll
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}