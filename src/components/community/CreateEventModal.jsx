import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Video, X } from "lucide-react";

const CATEGORIES = [
  { value: 'meditation', label: 'Meditation' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'ceremony', label: 'Ceremony' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'training', label: 'Training' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'other', label: 'Other' }
];

export default function CreateEventModal({ open, onOpenChange, user, circleId = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_time: '',
    event_type: 'online',
    category: 'meetup',
    location: '',
    online_link: '',
    max_attendees: '',
    is_free: true,
    price_ggg: 0,
    tags: [],
    recurring: 'none'
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch user's circles for optional circle association
  const { data: circles = [] } = useQuery({
    queryKey: ['userCircles', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Circle.list('-created_date', 100);
      return all.filter(c => c.member_ids?.includes(user?.email));
    },
    enabled: !!user?.email
  });

  const [selectedCircle, setSelectedCircle] = useState(circleId || '');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onOpenChange(false);
      setFormData({
        title: '', description: '', start_date: '', start_time: '', end_time: '',
        event_type: 'online', category: 'meetup', location: '', online_link: '',
        max_attendees: '', is_free: true, price_ggg: 0, tags: [], recurring: 'none'
      });
    }
  });

  const handleCreate = () => {
    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    let endDateTime = null;
    if (formData.end_time) {
      endDateTime = new Date(`${formData.start_date}T${formData.end_time}`);
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      host_id: user.email,
      host_name: user.full_name,
      host_avatar: user.avatar_url,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime?.toISOString(),
      event_type: formData.event_type,
      category: formData.category,
      location: formData.location,
      online_link: formData.online_link,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      is_free: formData.is_free,
      price_ggg: formData.is_free ? 0 : formData.price_ggg,
      tags: formData.tags,
      recurring: formData.recurring,
      circle_id: selectedCircle || undefined,
      attendee_ids: [user.email],
      attendee_count: 1,
      status: 'upcoming'
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create an Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Event Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekly Meditation Circle"
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Event Type</Label>
              <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will happen at this event?"
              className="mt-2 min-h-20"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> Start *</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> End</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          {formData.event_type !== 'online' && (
            <div>
              <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Address or venue name"
                className="mt-2"
              />
            </div>
          )}

          {formData.event_type !== 'in_person' && (
            <div>
              <Label className="flex items-center gap-1"><Video className="w-3 h-3" /> Online Link</Label>
              <Input
                value={formData.online_link}
                onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
                placeholder="Zoom, Google Meet, etc."
                className="mt-2"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max Attendees</Label>
              <Input
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Unlimited"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Recurring</Label>
              <Select value={formData.recurring} onValueChange={(v) => setFormData({ ...formData, recurring: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {circles.length > 0 && (
            <div>
              <Label>Associate with Circle (optional)</Label>
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a circle..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {circles.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div>
              <p className="text-sm font-medium">Free Event</p>
              <p className="text-xs text-slate-500">Toggle off to set a GGG price</p>
            </div>
            <Switch
              checked={formData.is_free}
              onCheckedChange={(c) => setFormData({ ...formData, is_free: c })}
            />
          </div>

          {!formData.is_free && (
            <div>
              <Label>Price (GGG)</Label>
              <Input
                type="number"
                value={formData.price_ggg}
                onChange={(e) => setFormData({ ...formData, price_ggg: parseFloat(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.title.trim() || !formData.start_date || !formData.start_time || createMutation.isPending}
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}