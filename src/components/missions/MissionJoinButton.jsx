import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, Check, Send } from "lucide-react";

export default function MissionJoinButton({ mission, profile, user }) {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [roleApplied, setRoleApplied] = useState('');
  const queryClient = useQueryClient();

  const isParticipant = mission?.participant_ids?.includes(profile?.user_id);
  const isCreator = mission?.creator_id === user?.email;
  const requiresApproval = mission?.join_policy === 'approval_required';

  // Check if user already has a pending request
  const { data: existingRequests = [] } = useQuery({
    queryKey: ['myJoinRequest', mission?.id, profile?.user_id],
    queryFn: () => base44.entities.MissionJoinRequest.filter({
      mission_id: mission.id,
      user_id: profile.user_id,
    }, '-created_date', 1),
    enabled: !!mission?.id && !!profile?.user_id && requiresApproval && !isParticipant,
  });

  const pendingRequest = existingRequests.find(r => r.status === 'pending');
  const rejectedRequest = existingRequests.find(r => r.status === 'rejected');

  // Instant join mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      const newParticipants = [...(mission.participant_ids || []), profile.user_id];
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['missionParticipants'] });
    },
  });

  // Leave mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      const newParticipants = (mission.participant_ids || []).filter(id => id !== profile.user_id);
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['missionParticipants'] });
    },
  });

  // Request to join mutation
  const requestJoinMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MissionJoinRequest.create({
        mission_id: mission.id,
        user_id: profile.user_id,
        user_name: profile.display_name || user.full_name,
        user_avatar: profile.avatar_url || '',
        role_applied: roleApplied || '',
        message: message || '',
        status: 'pending',
      });
      // Notify mission creator
      await base44.entities.Notification.create({
        user_id: mission.creator_id,
        type: 'mission',
        title: 'New Join Request',
        message: `${profile.display_name || user.full_name} wants to join "${mission.title}"`,
        action_url: `/MissionDetail?id=${mission.id}`,
        action_label: 'Review Request',
        source_user_id: profile.user_id,
        source_user_name: profile.display_name || user.full_name,
        source_user_avatar: profile.avatar_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJoinRequest', mission.id] });
      setRequestDialogOpen(false);
      setMessage('');
      setRoleApplied('');
    },
  });

  // Already a participant — show leave button
  if (isParticipant) {
    return (
      <Button
        variant="outline"
        onClick={() => leaveMutation.mutate()}
        disabled={leaveMutation.isPending}
        className="bg-white/80 backdrop-blur-sm"
      >
        Leave Mission
      </Button>
    );
  }

  // Creator shouldn't see join button
  if (isCreator) return null;

  // Has pending request
  if (pendingRequest) {
    return (
      <Button disabled variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 gap-2">
        <Clock className="w-4 h-4" />
        Request Pending
      </Button>
    );
  }

  // Open join policy — instant join
  if (!requiresApproval) {
    return (
      <Button
        onClick={() => joinMutation.mutate()}
        disabled={joinMutation.isPending}
        className="bg-violet-600 hover:bg-violet-700 shadow-lg"
      >
        <Users className="w-4 h-4 mr-2" />
        Join Mission
      </Button>
    );
  }

  // Approval required — show request button + dialog
  return (
    <>
      <Button
        onClick={() => setRequestDialogOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 shadow-lg gap-2"
      >
        <Send className="w-4 h-4" />
        Request to Join
      </Button>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Request to Join
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              This mission requires approval from the creator. Submit a request and they'll review it.
            </p>

            {mission.roles_needed?.length > 0 && (
              <div>
                <Label>Which role are you applying for?</Label>
                <Select value={roleApplied} onValueChange={setRoleApplied}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {mission.roles_needed.map((role, i) => (
                      <SelectItem key={i} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Message to mission creator (optional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the creator why you'd like to join..."
                rows={3}
                className="mt-1"
              />
            </div>

            {rejectedRequest && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                Note: A previous request was declined. You can submit a new one.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => requestJoinMutation.mutate()}
                disabled={requestJoinMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}