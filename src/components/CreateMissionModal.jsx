import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X } from "lucide-react";
import { GGG_TO_USD } from '@/components/earnings/gggMatrix';

export default function CreateMissionModal({ open, onClose, prefillData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    mission_type: 'personal',
    reward_ggg: '',
    reward_rank_points: '',
    reward_boost: '',
    max_participants: '',
    image_url: '',
    roles_needed: [],
    tasks: []
  });

  // Handle prefill data from AI generator
  useEffect(() => {
    if (prefillData) {
      setFormData({
        title: prefillData.title || '',
        description: prefillData.description || '',
        objective: prefillData.objective || '',
        mission_type: prefillData.mission_type || 'personal',
        reward_ggg: prefillData.reward_ggg || '',
        reward_rank_points: prefillData.reward_rank_points || '',
        reward_boost: prefillData.reward_boost || '',
        max_participants: '',
        image_url: '',
        roles_needed: prefillData.roles_needed || [],
        tasks: prefillData.tasks || []
      });
    }
  }, [prefillData]);

  const DEFAULT_MAX_USD = 55;
  const DEFAULT_MAX_GGG = DEFAULT_MAX_USD / GGG_TO_USD;

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

  // Fetch platform settings for mission cap
  const { data: platformSettings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list()
  });
  const settings = platformSettings[0];
  
  // Check if user can override cap
  const canOverrideCap = user?.role === 'admin' || (settings?.mission_cap_override_emails || []).includes(user?.email);
  const configuredCapUSD = settings?.mission_reward_cap_usd ?? 55;
  const effectiveMaxUSD = canOverrideCap ? Infinity : configuredCapUSD;
  const effectiveMaxGGG = canOverrideCap ? Infinity : (effectiveMaxUSD / GGG_TO_USD);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Mission.create({
        ...data,
        creator_id: user.email,
        creator_name: profile?.display_name || user.full_name,
        status: 'active',
        reward_ggg: canOverrideCap ? (parseFloat(data.reward_ggg) || 0) : Math.min(parseFloat(data.reward_ggg) || 0, effectiveMaxGGG),
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Create New Mission</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
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

          {/* Cover Image */}
          <div>
            <Label>Cover Image</Label>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {formData.image_url && (
                <div className="rounded-lg border p-2 bg-slate-50">
                  <img src={formData.image_url} alt="Cover" className="w-full h-40 object-cover rounded" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={(e) => setLocalFile(e.target.files?.[0] || null)} />
                <Button type="button" variant="outline" disabled={!localFile || uploading} onClick={async () => {
                  if (!localFile) return;
                  setUploading(true);
                  const res = await base44.integrations.Core.UploadFile({ file: localFile });
                  const url = res?.file_url;
                  if (url) setFormData({ ...formData, image_url: url });
                  setUploading(false);
                }}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Or paste image URL</Label>
                <Input className="mt-1" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
              </div>
            </div>
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
                  if (canOverrideCap) {
                    setFormData({ ...formData, reward_ggg: isNaN(raw) ? '' : raw });
                  } else {
                    const safe = isNaN(raw) ? '' : Math.min(raw, effectiveMaxGGG);
                    setFormData({ ...formData, reward_ggg: safe });
                  }
                }}
                placeholder="0.00"
              />
              <div className="mt-1 text-xs text-slate-500">
                {(() => {
                  const g = Number(formData.reward_ggg) || 0;
                  const usd = g * GGG_TO_USD;
                  if (canOverrideCap) {
                    return `≈ $${usd.toFixed(2)} (no cap - override enabled)`;
                  }
                  return `≈ $${Math.min(usd, effectiveMaxUSD).toFixed(2)} (capped at $${configuredCapUSD.toFixed(2)})`;
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

        </form>
        
        <div className="flex justify-end gap-3 pt-4 border-t shrink-0 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="mission-form"
            disabled={createMutation.isPending || !formData.title || !formData.objective}
            className="bg-violet-600 hover:bg-violet-700"
            onClick={handleSubmit}
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Mission
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}