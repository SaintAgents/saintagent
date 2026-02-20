import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon, Clock, Radio, Loader2, Video, Bell, Mail, Users, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RecipientSelectorModal from './RecipientSelectorModal';

export default function CreateBroadcastModal({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [broadcastType, setBroadcastType] = useState('podcast');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [duration, setDuration] = useState(60);
  const [topics, setTopics] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createZoomLink, setCreateZoomLink] = useState(true);
  const [notifyAll, setNotifyAll] = useState(true);
  const [emailAll, setEmailAll] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState(null); // { userIds, profiles, teamIds }
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });



  const timeSlots = [];
  for (let h = 6; h <= 22; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const handleSubmit = async () => {
    if (!title || !selectedDate || !currentUser) return;
    
    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const me = myProfile?.[0];
      
      // Create Zoom meeting if enabled
      let zoomJoinUrl = '';
      let zoomStartUrl = '';
      let zoomMeetingId = '';
      
      // Get all profiles for email if needed
      let allProfiles = [];
      if (emailAll || notifyAll) {
        allProfiles = await base44.entities.UserProfile.list('-created_date', 500);
      }

      if (createZoomLink) {
      try {
        const zoomResponse = await base44.functions.invoke('zoomMeeting', {
          action: 'create',
          meetingDetails: {
            topic: title,
            start_time: scheduledTime.toISOString(),
            duration: duration,
            agenda: description || `${broadcastType} broadcast`
          },
          // Send emails to all users if emailAll is enabled
          sendEmails: emailAll,
          hostEmail: currentUser.email,
          hostName: currentUser.full_name || me?.display_name
        });

        if (zoomResponse.data?.success) {
          zoomJoinUrl = zoomResponse.data.meeting.join_url;
          zoomStartUrl = zoomResponse.data.meeting.start_url;
          zoomMeetingId = zoomResponse.data.meeting.id?.toString();
        }

        // If email is enabled, send individual emails to selected recipients
          if (emailAll && zoomJoinUrl && selectedRecipients?.profiles?.length > 0) {
            console.log('BROADCAST EMAIL: Sending emails to:', selectedRecipients.profiles.map(p => p.user_id));
            const emailPromises = selectedRecipients.profiles
              .slice(0, 100) // Limit to 100 emails
              .map(p => {
                console.log('Sending email to:', p.user_id);
                return base44.integrations.Core.SendEmail({
                  to: p.user_id,
                  subject: `📡 Broadcast Invitation: ${title}`,
                  body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="margin: 0;">📡 You're Invited!</h1>
                      </div>
                      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
                        <p>Hi ${p.display_name || 'there'},</p>
                        <p><strong>${currentUser.full_name || me?.display_name}</strong> has scheduled a broadcast and you're invited to join!</p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
                          <p><strong>📌 ${title}</strong></p>
                          <p><strong>🕐 When:</strong> ${format(scheduledTime, 'EEEE, MMMM d, yyyy')}</p>
                          <p style="margin-left: 24px;">• Pacific: ${scheduledTime.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Los_Angeles' })} PT</p>
                          <p style="margin-left: 24px;">• Eastern: ${scheduledTime.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })} ET</p>
                          <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
                          <p><strong>📺 Type:</strong> ${broadcastType}</p>
                        </div>
                        <div style="text-align: center;">
                          <a href="${zoomJoinUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Join Broadcast</a>
                        </div>
                      </div>
                    </div>
                  `
                });
              });

            const results = await Promise.allSettled(emailPromises);
            console.log('Email results:', results);
            results.forEach((result, i) => {
              if (result.status === 'rejected') {
                console.error(`Email to ${selectedRecipients.profiles[i]?.user_id} failed:`, result.reason);
              } else {
                console.log(`Email to ${selectedRecipients.profiles[i]?.user_id} sent:`, result.value);
              }
            });
          }
      } catch (zoomError) {
        console.error('Failed to create Zoom meeting:', zoomError);
      }
      }

      // Create the broadcast
      const broadcast = await base44.entities.Broadcast.create({
        title,
        description,
        host_id: currentUser.email,
        host_name: currentUser.full_name || me?.display_name,
        host_avatar: me?.avatar_url,
        scheduled_time: scheduledTime.toISOString(),
        duration_minutes: duration,
        broadcast_type: broadcastType,
        cover_image_url: coverImageUrl || undefined,
        live_stream_url: zoomJoinUrl || '',
        zoom_start_url: zoomStartUrl || '',
        zoom_meeting_id: zoomMeetingId || '',
        topics: topics ? topics.split(',').map(t => t.trim()).filter(Boolean) : [],
        notify_all: notifyAll,
        status: 'scheduled'
      });

      // If notify_all is true, create notifications for all users
      if (notifyAll) {
        try {
          const allProfiles = await base44.entities.UserProfile.list('-created_date', 500);
          const notifications = allProfiles
            .filter(p => p.user_id !== currentUser.email)
            .map(p => ({
              user_id: p.user_id,
              type: 'event',
              title: '📡 New Broadcast Scheduled',
              message: `${currentUser.full_name || me?.display_name} scheduled "${title}" for ${format(scheduledTime, 'MMM d')} at ${format(scheduledTime, 'h:mm a')}`,
              action_url: '/Broadcast',
              action_label: 'View & RSVP',
              source_user_id: currentUser.email,
              source_user_name: currentUser.full_name || me?.display_name,
              source_user_avatar: me?.avatar_url
            }));
          
          // Create notifications in batches
          if (notifications.length > 0) {
            await base44.entities.Notification.bulkCreate(notifications.slice(0, 100));
          }
        } catch (notifError) {
          console.error('Failed to send notifications:', notifError);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setBroadcastType('podcast');
      setSelectedDate(null);
      setSelectedTime('12:00');
      setDuration(60);
      setTopics('');
      setCoverImageUrl('');
    } catch (error) {
      console.error('Failed to create broadcast:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-violet-600" />
            Schedule Broadcast
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="Episode title or broadcast name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What will this broadcast be about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Broadcast Type</Label>
            <Select value={broadcastType} onValueChange={setBroadcastType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="podcast">Podcast</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="town_hall">Town Hall</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="ama">AMA (Ask Me Anything)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
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
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
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
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topics */}
          <div className="space-y-2">
            <Label>Topics (comma separated)</Label>
            <Input
              placeholder="spirituality, growth, community"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image (optional)</Label>
            {coverImageUrl ? (
              <div className="relative">
                <img 
                  src={coverImageUrl} 
                  alt="Cover preview" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setCoverImageUrl('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="https://... or upload"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  className="gap-1"
                  onClick={() => document.getElementById('broadcast-cover-upload').click()}
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload
                </Button>
                <input
                  id="broadcast-cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setCoverImageUrl(file_url);
                    } catch (err) {
                      console.error('Upload failed:', err);
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Zoom Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Create Zoom Meeting</p>
                <p className="text-xs text-blue-600">Auto-generate a Zoom link for viewers</p>
              </div>
            </div>
            <Switch
              checked={createZoomLink}
              onCheckedChange={setCreateZoomLink}
            />
          </div>

          {/* Notify All Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">Notify All Users</p>
                <p className="text-xs text-amber-600">Send in-app notification to everyone</p>
              </div>
            </div>
            <Switch
              checked={notifyAll}
              onCheckedChange={setNotifyAll}
            />
          </div>

          {/* Email Invites - Admin only */}
          {currentUser?.role === 'admin' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Send Email Invitations</p>
                    <p className="text-xs text-emerald-600">Email invites with Zoom link to recipients</p>
                  </div>
                </div>
                <Switch
                  checked={emailAll}
                  onCheckedChange={(checked) => {
                    setEmailAll(checked);
                    if (checked && !selectedRecipients) {
                      setShowRecipientModal(true);
                    }
                  }}
                />
              </div>

              {/* Recipient Selection - only show when email is enabled */}
              {emailAll && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Recipients</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRecipientModal(true)}
                      className="gap-1"
                    >
                      <Users className="w-3 h-3" />
                      {selectedRecipients ? 'Change' : 'Select'}
                    </Button>
                  </div>
                  
                  {selectedRecipients ? (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="w-3 h-3" />
                        {selectedRecipients.userIds?.length || 0} users
                      </Badge>
                      {selectedRecipients.teamIds?.length > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          {selectedRecipients.teamIds.length} teams
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Click "Select" to choose recipients</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recipient Selector Modal */}
          <RecipientSelectorModal
            open={showRecipientModal}
            onClose={() => setShowRecipientModal(false)}
            onConfirm={setSelectedRecipients}
            currentUserEmail={currentUser?.email}
          />

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!title || !selectedDate || submitting}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {createZoomLink ? 'Creating Zoom & Scheduling...' : 'Scheduling...'}
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                Schedule Broadcast
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}