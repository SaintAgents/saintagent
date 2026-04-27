import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Video, Image, Loader2, Upload } from "lucide-react";

export default function EditEventModal({ open, onOpenChange, event }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});
  const [creatingZoom, setCreatingZoom] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (event && open) {
      const start = event.start_time ? new Date(event.start_time) : null;
      const end = event.end_time ? new Date(event.end_time) : null;
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_date: start ? start.toISOString().slice(0, 10) : '',
        start_time: start ? start.toTimeString().slice(0, 5) : '',
        end_time: end ? end.toTimeString().slice(0, 5) : '',
        event_type: event.event_type || 'online',
        category: event.category || 'meetup',
        location: event.location || '',
        online_link: event.online_link || '',
        image_url: event.image_url || '',
        max_attendees: event.max_attendees || '',
        status: event.status || 'upcoming',
      });
    }
  }, [event, open]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.update(event.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', event.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onOpenChange(false);
    }
  });

  const handleSave = () => {
    const startDateTime = formData.start_date && formData.start_time
      ? new Date(`${formData.start_date}T${formData.start_time}`).toISOString()
      : undefined;
    const endDateTime = formData.start_date && formData.end_time
      ? new Date(`${formData.start_date}T${formData.end_time}`).toISOString()
      : undefined;

    updateMutation.mutate({
      title: formData.title,
      description: formData.description,
      start_time: startDateTime,
      end_time: endDateTime,
      event_type: formData.event_type,
      category: formData.category,
      location: formData.location,
      online_link: formData.online_link,
      image_url: formData.image_url,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      status: formData.status,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image_url: file_url }));
    setUploadingImage(false);
  };

  const handleCreateZoom = async () => {
    setCreatingZoom(true);
    const startISO = formData.start_date && formData.start_time
      ? new Date(`${formData.start_date}T${formData.start_time}`).toISOString()
      : undefined;
    const durationMin = formData.start_time && formData.end_time
      ? Math.round((new Date(`${formData.start_date}T${formData.end_time}`) - new Date(`${formData.start_date}T${formData.start_time}`)) / 60000)
      : 60;
    const res = await base44.functions.invoke('zoomMeeting', {
      action: 'create',
      meetingDetails: {
        topic: formData.title || 'Event Meeting',
        start_time: startISO,
        duration: durationMin > 0 ? durationMin : 60
      }
    });
    if (res.data?.meeting?.join_url) {
      setFormData(prev => ({ ...prev, online_link: res.data.meeting.join_url }));
    }
    setCreatingZoom(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Title *</Label>
            <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-2" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-2 min-h-20" />
          </div>

          {/* Image */}
          <div>
            <Label className="flex items-center gap-1"><Image className="w-3 h-3" /> Cover Image</Label>
            {formData.image_url && (
              <img src={formData.image_url} alt="Cover" className="w-full h-32 object-cover rounded-lg mt-2" />
            )}
            <div className="flex gap-2 mt-2">
              <Input value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="Image URL..." className="flex-1" />
              <label className="shrink-0">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" disabled={uploadingImage} className="gap-1.5 cursor-pointer" asChild>
                  <span>
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</Label>
              <Input type="date" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> Start</Label>
              <Input type="time" value={formData.start_time || ''} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> End</Label>
              <Input type="time" value={formData.end_time || ''} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} className="mt-2" />
            </div>
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Event Type</Label>
              <Select value={formData.event_type || 'online'} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status || 'upcoming'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          {formData.event_type !== 'online' && (
            <div>
              <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</Label>
              <Input value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-2" placeholder="Address or venue" />
            </div>
          )}

          {/* Online Link + Zoom */}
          {formData.event_type !== 'in_person' && (
            <div>
              <Label className="flex items-center gap-1"><Video className="w-3 h-3" /> Online Link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={formData.online_link || ''} onChange={(e) => setFormData({ ...formData, online_link: e.target.value })} placeholder="Zoom, Google Meet, etc." className="flex-1" />
                <Button type="button" variant="outline" size="sm" disabled={creatingZoom} className="shrink-0 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={handleCreateZoom}>
                  {creatingZoom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  {creatingZoom ? 'Creating...' : 'Zoom'}
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label>Max Attendees</Label>
            <Input type="number" value={formData.max_attendees || ''} onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })} placeholder="Unlimited" className="mt-2" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.title?.trim() || updateMutation.isPending} className="flex-1 bg-violet-600 hover:bg-violet-700">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}