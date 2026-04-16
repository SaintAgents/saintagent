import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, UserMinus, Ban, UserPlus, Search, CheckCircle2, X, Clock, Shield
} from "lucide-react";
import { createPageUrl } from '@/utils';

function TeamMemberRow({ userId, mission, currentUser, onAction }) {
  const { data: profiles = [] } = useQuery({
    queryKey: ['participantProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }, '-updated_date', 1),
    staleTime: 300000,
  });
  const profile = profiles[0];
  const isCreator = mission.creator_id === userId;
  const isSelf = currentUser?.email === userId;

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <Avatar className="w-10 h-10 cursor-pointer" data-user-id={userId}>
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
          {(profile?.display_name || userId).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{profile?.display_name || userId}</p>
        <p className="text-xs text-slate-500 truncate">@{profile?.handle || userId.split('@')[0]}</p>
      </div>
      {isCreator && <Badge className="bg-amber-100 text-amber-700 text-xs">Owner</Badge>}
      {isSelf && !isCreator && <Badge className="bg-blue-100 text-blue-700 text-xs">You</Badge>}
      {!isCreator && !isSelf && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-500"
            onClick={() => onAction('remove', userId, profile?.display_name || userId)}
            title="Remove from mission"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-red-600"
            onClick={() => onAction('ban', userId, profile?.display_name || userId)}
            title="Ban from mission"
          >
            <Ban className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MissionManageTeam({ mission, currentUser }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [targetName, setTargetName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch join requests
  const { data: joinRequests = [] } = useQuery({
    queryKey: ['missionJoinRequests', mission?.id],
    queryFn: () => base44.entities.MissionJoinRequest.filter({ mission_id: mission?.id }),
    enabled: !!mission?.id,
    staleTime: 30000,
  });
  const pendingRequests = joinRequests.filter(r => r.status === 'pending');

  // Fetch searchable profiles for adding members
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfilesForAdd'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    staleTime: 120000,
  });

  const allMembers = [mission.creator_id, ...(mission.participant_ids || []).filter(p => p !== mission.creator_id)];
  const filteredMembers = searchQuery
    ? allMembers.filter(uid => uid.toLowerCase().includes(searchQuery.toLowerCase()))
    : allMembers;

  const addableProfiles = addMemberSearch.trim()
    ? allProfiles.filter(p =>
        !allMembers.includes(p.user_id) &&
        (p.display_name?.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
         p.handle?.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
         p.user_id?.toLowerCase().includes(addMemberSearch.toLowerCase()))
      ).slice(0, 5)
    : [];

  const removeMutation = useMutation({
    mutationFn: async (userId) => {
      const newParticipants = (mission.participant_ids || []).filter(p => p !== userId);
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
    },
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['myMissions'] });
      setConfirmAction(null);
    }
  });

  const banMutation = useMutation({
    mutationFn: async (userId) => {
      const newParticipants = (mission.participant_ids || []).filter(p => p !== userId);
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'mission',
        title: `Removed from "${mission.title}"`,
        message: 'You have been removed from the mission by the creator.',
        priority: 'high',
      });
    },
    onSuccess: () => {
      toast.success('User banned from mission');
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['myMissions'] });
      setConfirmAction(null);
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: async (userId) => {
      const newParticipants = [...(mission.participant_ids || []), userId];
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'mission',
        title: `Added to "${mission.title}"`,
        message: `You've been added to the mission by the owner.`,
        action_url: createPageUrl('MissionDetail') + '?id=' + mission.id
      });
    },
    onSuccess: () => {
      toast.success('Member added');
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['myMissions'] });
      setAddMemberSearch('');
    }
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.MissionJoinRequest.update(request.id, {
        status: 'approved',
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString()
      });
      const newParticipants = [...(mission.participant_ids || []), request.user_id];
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
      // Send notification via engine (in-app + email)
      await base44.functions.invoke('missionNotificationEngine', {
        action: 'join_request_status_changed',
        mission_id: mission.id,
        join_request_id: request.id,
        new_status: 'approved',
      }).catch(e => console.warn('Notification engine failed:', e));
    },
    onSuccess: () => {
      toast.success('Request approved');
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['missionJoinRequests', mission.id] });
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.MissionJoinRequest.update(request.id, {
        status: 'rejected',
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString()
      });
      // Send notification via engine (in-app + email)
      await base44.functions.invoke('missionNotificationEngine', {
        action: 'join_request_status_changed',
        mission_id: mission.id,
        join_request_id: request.id,
        new_status: 'rejected',
      }).catch(e => console.warn('Notification engine failed:', e));
    },
    onSuccess: () => {
      toast.success('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['missionJoinRequests', mission.id] });
    }
  });

  const handleAction = (action, userId, name) => {
    setTargetUser(userId);
    setTargetName(name);
    setConfirmAction(action);
  };

  return (
    <div className="space-y-6">
      {/* Pending Join Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Join Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={request.user_avatar} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                    {request.user_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{request.user_name}</p>
                  {request.role_applied && <p className="text-xs text-slate-500">Role: {request.role_applied}</p>}
                  {request.message && <p className="text-xs text-slate-600 italic mt-0.5">"{request.message}"</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8" onClick={() => approveRequestMutation.mutate(request)} disabled={approveRequestMutation.isPending}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => rejectRequestMutation.mutate(request)} disabled={rejectRequestMutation.isPending}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Member */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            Add Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, handle, or email..."
            value={addMemberSearch}
            onChange={(e) => setAddMemberSearch(e.target.value)}
            className="mb-2"
          />
          {addableProfiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {addableProfiles.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-violet-200 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback className="text-xs bg-violet-100 text-violet-600">{p.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.display_name}</p>
                    <p className="text-xs text-slate-500">@{p.handle}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addMemberMutation.mutate(p.user_id)} disabled={addMemberMutation.isPending}>
                    <UserPlus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          {addMemberSearch.trim() && addableProfiles.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-3">No matching users found</p>
          )}
        </CardContent>
      </Card>

      {/* Current Team */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Team Members ({allMembers.length})
            </CardTitle>
            <div className="relative w-48">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <Input
                placeholder="Filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredMembers.map(uid => (
            <TeamMemberRow
              key={uid}
              userId={uid}
              mission={mission}
              currentUser={currentUser}
              onAction={handleAction}
            />
          ))}
          {filteredMembers.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No members found</p>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'ban' ? 'Ban User?' : 'Remove User?'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {confirmAction === 'ban'
              ? `This will remove ${targetName} and notify them they've been banned.`
              : `This will remove ${targetName} from the mission.`}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (confirmAction === 'ban') banMutation.mutate(targetUser);
                else removeMutation.mutate(targetUser);
              }}
            >
              {confirmAction === 'ban' ? 'Ban' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}