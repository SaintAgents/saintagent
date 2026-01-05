import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Sparkles, Clock, Target, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  { value: 'mission', label: 'Mission' },
  { value: 'project', label: 'Project' },
  { value: 'idea', label: 'Idea/Concept' },
  { value: 'learning', label: 'Learning Together' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'other', label: 'Other' },
];

const PROJECT_STAGES = [
  { value: 'ideation', label: 'Ideation', desc: 'Just an idea' },
  { value: 'planning', label: 'Planning', desc: 'Defining scope' },
  { value: 'early_development', label: 'Early Development', desc: 'Getting started' },
  { value: 'active', label: 'Active', desc: 'In progress' },
  { value: 'scaling', label: 'Scaling', desc: 'Growing fast' },
  { value: 'maintenance', label: 'Maintenance', desc: 'Stable' },
];

const COLLABORATION_TYPES = [
  { value: 'co-founder', label: 'Co-founder', icon: '🚀' },
  { value: 'contributor', label: 'Contributor', icon: '🛠️' },
  { value: 'advisor', label: 'Advisor', icon: '💡' },
  { value: 'mentor', label: 'Mentor', icon: '🎯' },
  { value: 'learner', label: 'Learner', icon: '📚' },
  { value: 'partner', label: 'Partner', icon: '🤝' },
];

const TIME_COMMITMENTS = [
  { value: 'few_hours_week', label: 'Few hours/week' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'one_time', label: 'One-time' },
];

export default function CollaborationRequestModal({ open, onClose, targetUser, myProfile, prefilledMission }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    project_title: prefilledMission?.title || '',
    project_type: prefilledMission ? 'mission' : 'project',
    project_stage: 'ideation',
    collaboration_type: 'contributor',
    time_commitment: 'flexible',
    skills_needed: '',
    message: '',
  });

  // Fetch user's missions for quick select
  const { data: myMissions = [] } = useQuery({
    queryKey: ['myMissionsForCollab'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Mission.filter({ creator_id: u.email, status: 'active' }, '-updated_date', 20);
    },
    enabled: open,
  });

  const sendRequest = useMutation({
    mutationFn: async () => {
      const request = await base44.entities.CollaborationRequest.create({
        from_user_id: myProfile.user_id,
        to_user_id: targetUser.user_id,
        from_name: myProfile.display_name,
        from_avatar: myProfile.avatar_url,
        to_name: targetUser.display_name,
        project_title: formData.project_title,
        project_type: formData.project_type,
        project_stage: formData.project_stage,
        collaboration_type: formData.collaboration_type,
        time_commitment: formData.time_commitment,
        skills_needed: formData.skills_needed.split(',').map(s => s.trim()).filter(Boolean),
        message: formData.message,
        mission_id: prefilledMission?.id || null,
        status: 'pending',
      });

      // Create notification for recipient
      await base44.entities.Notification.create({
        user_id: targetUser.user_id,
        type: 'collaboration',
        title: `Collaboration request from ${myProfile.display_name}`,
        message: `Wants to collaborate on "${formData.project_title}" as ${formData.collaboration_type}`,
        priority: 'high',
        source_user_id: myProfile.user_id,
        source_user_name: myProfile.display_name,
        source_user_avatar: myProfile.avatar_url,
        metadata: {
          request_id: request.id,
          project_title: formData.project_title,
          collaboration_type: formData.collaboration_type,
        },
      });

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onClose();
    },
  });

  const handleMissionSelect = (missionId) => {
    const mission = myMissions.find(m => m.id === missionId);
    if (mission) {
      setFormData(prev => ({
        ...prev,
        project_title: mission.title,
        project_type: 'mission',
        skills_needed: (mission.roles_needed || []).join(', '),
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-violet-500" />
            Send Collaboration Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Target user preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
            <Avatar className="w-12 h-12">
              <AvatarImage src={targetUser?.avatar_url} />
              <AvatarFallback className="bg-violet-100 text-violet-600">
                {targetUser?.display_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-900">{targetUser?.display_name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(targetUser?.skills || []).slice(0, 3).map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quick mission select */}
          {myMissions.length > 0 && (
            <div>
              <Label className="text-xs text-slate-500">Quick fill from mission</Label>
              <Select onValueChange={handleMissionSelect}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a mission (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {myMissions.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Project title */}
          <div>
            <Label className="text-xs text-slate-500">Project/Mission Title *</Label>
            <Input
              className="mt-1"
              placeholder="What are you working on?"
              value={formData.project_title}
              onChange={(e) => setFormData(prev => ({ ...prev, project_title: e.target.value }))}
            />
          </div>

          {/* Project type & stage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Project Type</Label>
              <Select value={formData.project_type} onValueChange={(v) => setFormData(prev => ({ ...prev, project_type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Stage</Label>
              <Select value={formData.project_stage} onValueChange={(v) => setFormData(prev => ({ ...prev, project_stage: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STAGES.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center gap-2">
                        <span>{s.label}</span>
                        <span className="text-xs text-slate-400">({s.desc})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Collaboration type */}
          <div>
            <Label className="text-xs text-slate-500 mb-2 block">Looking for</Label>
            <div className="grid grid-cols-3 gap-2">
              {COLLABORATION_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, collaboration_type: t.value }))}
                  className={cn(
                    "p-2 rounded-lg border text-center transition-all",
                    formData.collaboration_type === t.value
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <span className="text-lg">{t.icon}</span>
                  <p className="text-xs mt-1">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time commitment */}
          <div>
            <Label className="text-xs text-slate-500">Time Commitment</Label>
            <Select value={formData.time_commitment} onValueChange={(v) => setFormData(prev => ({ ...prev, time_commitment: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_COMMITMENTS.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills needed */}
          <div>
            <Label className="text-xs text-slate-500">Skills Needed (comma-separated)</Label>
            <Input
              className="mt-1"
              placeholder="e.g., React, Design, Marketing"
              value={formData.skills_needed}
              onChange={(e) => setFormData(prev => ({ ...prev, skills_needed: e.target.value }))}
            />
          </div>

          {/* Personal message */}
          <div>
            <Label className="text-xs text-slate-500">Personal Message *</Label>
            <Textarea
              className="mt-1 min-h-24"
              placeholder="Introduce yourself and explain why you'd like to collaborate..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => sendRequest.mutate()}
            disabled={!formData.project_title || !formData.message || sendRequest.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {sendRequest.isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}