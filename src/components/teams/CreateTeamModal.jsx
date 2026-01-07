import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Target, Crown, X, Plus } from "lucide-react";

export default function CreateTeamModal({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    team_type: 'squad',
    max_members: 20,
    visibility: 'public',
    focus_areas: [],
    values: []
  });
  const [focusInput, setFocusInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Team.create(data),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onCreated?.(team);
      onClose();
      setFormData({
        name: '',
        description: '',
        team_type: 'squad',
        max_members: 20,
        visibility: 'public',
        focus_areas: [],
        values: []
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    createMutation.mutate({
      ...formData,
      leader_id: user?.email,
      leader_name: user?.full_name,
      member_ids: [user?.email],
      member_count: 1,
      status: 'recruiting'
    });
  };

  const addFocus = () => {
    if (focusInput.trim() && !formData.focus_areas.includes(focusInput.trim())) {
      setFormData({ ...formData, focus_areas: [...formData.focus_areas, focusInput.trim()] });
      setFocusInput('');
    }
  };

  const addValue = () => {
    if (valueInput.trim() && !formData.values.includes(valueInput.trim())) {
      setFormData({ ...formData, values: [...formData.values, valueInput.trim()] });
      setValueInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            Create a Team
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Team Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter team name..."
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is your team about?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team Type</Label>
              <Select value={formData.team_type} onValueChange={(v) => setFormData({ ...formData, team_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="squad">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" /> Squad
                    </div>
                  </SelectItem>
                  <SelectItem value="guild">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Guild
                    </div>
                  </SelectItem>
                  <SelectItem value="crew">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" /> Crew
                    </div>
                  </SelectItem>
                  <SelectItem value="alliance">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" /> Alliance
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Visibility</Label>
              <Select value={formData.visibility} onValueChange={(v) => setFormData({ ...formData, visibility: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Max Members</Label>
            <Input
              type="number"
              value={formData.max_members}
              onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 20 })}
              min={2}
              max={100}
            />
          </div>

          <div>
            <Label>Focus Areas</Label>
            <div className="flex gap-2">
              <Input
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                placeholder="Add focus area..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocus())}
              />
              <Button type="button" variant="outline" onClick={addFocus}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.focus_areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.focus_areas.map((area, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {area}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setFormData({
                        ...formData,
                        focus_areas: formData.focus_areas.filter((_, idx) => idx !== i)
                      })}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Team Values</Label>
            <div className="flex gap-2">
              <Input
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Add value..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addValue())}
              />
              <Button type="button" variant="outline" onClick={addValue}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.values.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.values.map((val, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    {val}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setFormData({
                        ...formData,
                        values: formData.values.filter((_, idx) => idx !== i)
                      })}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || createMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}