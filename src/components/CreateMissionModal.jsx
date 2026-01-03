import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { GGG_TO_USD } from '@/components/earnings/gggMatrix';

export default function CreateMissionModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    mission_type: 'personal',
    reward_ggg: '',
    reward_rank_points: '',
    max_participants: '',
    image_url: ''
  });

  const MAX_USD = 55;
  const MAX_GGG = MAX_USD / GGG_TO_USD;

  const [uploading, setUploading] = useState(false);
  const [localFile, setLocalFile] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: currentUser.email });
    }
  });
  const profile = profiles?.[0];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Mission.create({
        ...data,
        creator_id: user.email,
        creator_name: profile?.display_name || user.full_name,
        status: 'active',
        reward_ggg: Math.min(parseFloat(data.reward_ggg) || 0, MAX_GGG),
        reward_rank_points: parseInt(data.reward_rank_points) || 0,
        max_participants: parseInt(data.max_participants) || null,
        participant_count: 0,
        participant_ids: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      onClose();
      setFormData({
        title: '',
        description: '',
        objective: '',
        mission_type: 'personal',
        reward_ggg: '',
        reward_rank_points: '',
        max_participants: '',
        image_url: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Mission Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Build AI Agent for Community"
              required
            />
          </div>

          <div>
            <Label>Objective</Label>
            <Input
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="What is the goal?"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the mission in detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mission Type</Label>
              <Select
                value={formData.mission_type}
                onValueChange={(value) => setFormData({ ...formData, mission_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="leader">Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Max Participants (optional)</Label>
              <Input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GGG Reward (optional)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.reward_ggg}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  const safe = isNaN(raw) ? '' : Math.min(raw, MAX_GGG);
                  setFormData({ ...formData, reward_ggg: safe });
                }}
                placeholder="0.00"
              />
              <div className="mt-1 text-xs text-slate-500">
                {(() => {
                  const g = Number(formData.reward_ggg) || 0;
                  const usd = Math.min(g * GGG_TO_USD, MAX_USD);
                  return `≈ $${usd.toFixed(2)} (capped at $${MAX_USD.toFixed(2)})`;
                })()}
              </div>
            </div>

            <div>
              <Label>Rank Points (optional)</Label>
              <Input
                type="number"
                value={formData.reward_rank_points}
                onChange={(e) => setFormData({ ...formData, reward_rank_points: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !formData.title || !formData.objective}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Mission
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}