import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

const CATEGORIES = [
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'creative', label: 'Creative' },
  { value: 'business', label: 'Business' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'learning', label: 'Learning' },
  { value: 'social', label: 'Social' },
  { value: 'activism', label: 'Activism' },
  { value: 'other', label: 'Other' }
];

const SUGGESTED_VALUES = ['Authenticity', 'Compassion', 'Growth', 'Service', 'Unity', 'Creativity', 'Wisdom', 'Love', 'Truth', 'Freedom'];
const SUGGESTED_INTERESTS = ['Meditation', 'Yoga', 'Art', 'Music', 'Writing', 'Technology', 'Nature', 'Healing', 'Philosophy', 'Entrepreneurship'];

export default function CreateCircleModal({ open, onOpenChange, user }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    category: 'social',
    visibility: 'public',
    values: [],
    interests: [],
    tags: [],
    meeting_frequency: 'as_needed',
    chat_enabled: true
  });
  const [tagInput, setTagInput] = useState('');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Circle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      onOpenChange(false);
      setFormData({
        name: '', description: '', purpose: '', category: 'social',
        visibility: 'public', values: [], interests: [], tags: [],
        meeting_frequency: 'as_needed', chat_enabled: true
      });
    }
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...formData,
      owner_id: user.email,
      owner_name: user.full_name,
      member_ids: [user.email],
      member_count: 1
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const toggleValue = (val) => {
    const values = formData.values.includes(val)
      ? formData.values.filter(v => v !== val)
      : [...formData.values, val];
    setFormData({ ...formData, values });
  };

  const toggleInterest = (int) => {
    const interests = formData.interests.includes(int)
      ? formData.interests.filter(i => i !== int)
      : [...formData.interests, int];
    setFormData({ ...formData, interests });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Circle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Circle Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Meditation Collective"
              className="mt-2"
            />
          </div>

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
            <Label>Purpose</Label>
            <Input
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="What brings this circle together?"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell potential members about this circle..."
              className="mt-2 min-h-20"
            />
          </div>

          <div>
            <Label>Shared Values</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED_VALUES.map(val => (
                <Badge
                  key={val}
                  variant={formData.values.includes(val) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleValue(val)}
                >
                  {val}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Common Interests</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED_INTERESTS.map(int => (
                <Badge
                  key={int}
                  variant={formData.interests.includes(int) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleInterest(int)}
                >
                  {int}
                </Badge>
              ))}
            </div>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Visibility</Label>
              <Select value={formData.visibility} onValueChange={(v) => setFormData({ ...formData, visibility: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Meeting Frequency</Label>
              <Select value={formData.meeting_frequency} onValueChange={(v) => setFormData({ ...formData, meeting_frequency: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <div>
              <p className="text-sm font-medium">Enable Circle Chat</p>
              <p className="text-xs text-slate-500">Members can chat in real-time</p>
            </div>
            <Switch
              checked={formData.chat_enabled}
              onCheckedChange={(c) => setFormData({ ...formData, chat_enabled: c })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || createMutation.isPending}
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Circle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}