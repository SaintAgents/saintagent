import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Users, UserMinus, Ban, Trash2, UserPlus, Search,
  Shield, Clock, CheckCircle, BarChart3, X
} from "lucide-react";

function ParticipantRow({ userId, mission, currentUser, onRemove, onBan }) {
  const { data: profiles = [] } = useQuery({
    queryKey: ['participantProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }, '-updated_date', 1),
    staleTime: 300000,
  });
  const profile = profiles[0];
  const isCreator = mission.creator_id === userId;
  const isSelf = currentUser?.email === userId;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
      <Avatar className="w-9 h-9 cursor-pointer" data-user-id={userId}>
        <AvatarImage src={profile?.avatar_url} />
        <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
          {(profile?.display_name || userId).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{profile?.display_name || userId}</p>
        <p className="text-xs text-slate-500 truncate">@{profile?.handle || userId}</p>
      </div>
      {isCreator && (
        <Badge className="bg-amber-100 text-amber-700 text-[10px]">Creator</Badge>
      )}
      {!isCreator && !isSelf && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => onRemove(userId)} title="Remove from mission">
            <UserMinus className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={() => onBan(userId)} title="Ban from mission">
            <Ban className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      {isSelf && <Badge className="bg-blue-100 text-blue-700 text-[10px]">You</Badge>}
    </div>
  );
}

export default function MissionManagePanel({ mission, onClose }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const isCreator = currentUser?.email === mission?.creator_id;
  const participants = mission?.participant_ids || [];
  const allMembers = [mission.creator_id, ...participants.filter(p => p !== mission.creator_id)];

  // Mission stats
  const completedTasks = mission.tasks?.filter(t => t.completed)?.length || 0;
  const totalTasks = mission.tasks?.length || 0;
  const completedMilestones = mission.milestones?.filter(m => m.completed)?.length || 0;
  const totalMilestones = mission.milestones?.length || 0;

  const handleRemove = async (userId) => {
    const newParticipants = (mission.participant_ids || []).filter(p => p !== userId);
    await base44.entities.Mission.update(mission.id, {
      participant_ids: newParticipants,
      participant_count: newParticipants.length
    });
    toast.success('Participant removed');
    queryClient.invalidateQueries({ queryKey: ['myMissions'] });
    setConfirmAction(null);
    setTargetUser(null);
  };

  const handleBan = async (userId) => {
    const newParticipants = (mission.participant_ids || []).filter(p => p !== userId);
    await base44.entities.Mission.update(mission.id, {
      participant_ids: newParticipants,
      participant_count: newParticipants.length
    });
    // Create notification to banned user
    await base44.entities.Notification.create({
      user_id: userId,
      type: 'mission',
      title: `Removed from "${mission.title}"`,
      message: `You have been removed from the mission by the creator.`,
      priority: 'high',
    });
    toast.success('User banned from mission');
    queryClient.invalidateQueries({ queryKey: ['myMissions'] });
    setConfirmAction(null);
    setTargetUser(null);
  };

  const handleDelete = async () => {
    await base44.entities.Mission.delete(mission.id);
    toast.success('Mission deleted');
    queryClient.invalidateQueries({ queryKey: ['myMissions'] });
    setConfirmAction(null);
    onClose?.();
  };

  const handleStatusChange = async (newStatus) => {
    await base44.entities.Mission.update(mission.id, { status: newStatus });
    toast.success(`Mission marked as ${newStatus}`);
    queryClient.invalidateQueries({ queryKey: ['myMissions'] });
  };

  if (!mission) return null;

  return (
    <div className="space-y-4">
      {/* Mission Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            <div>
              <p className="text-lg font-bold text-slate-900">{allMembers.length}</p>
              <p className="text-[10px] text-slate-500">Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-lg font-bold text-slate-900">{completedTasks}/{totalTasks}</p>
              <p className="text-[10px] text-slate-500">Tasks Done</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-slate-900">{completedMilestones}/{totalMilestones}</p>
              <p className="text-[10px] text-slate-500">Milestones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-lg font-bold text-slate-900 capitalize">{mission.status}</p>
              <p className="text-[10px] text-slate-500">Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Actions */}
      {isCreator && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-500" />
              Mission Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {mission.status !== 'completed' && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange('completed')}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />Complete
                </Button>
              )}
              {mission.status !== 'active' && mission.status !== 'completed' && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange('active')}>
                  Activate
                </Button>
              )}
              {mission.status === 'active' && (
                <Button size="sm" variant="outline" onClick={() => handleStatusChange('cancelled')}>
                  Cancel
                </Button>
              )}
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmAction('delete')}>
                <Trash2 className="w-3.5 h-3.5 mr-1" />Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            Team Members ({allMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          {allMembers.map(uid => (
            <ParticipantRow
              key={uid}
              userId={uid}
              mission={mission}
              currentUser={currentUser}
              onRemove={(u) => { setTargetUser(u); setConfirmAction('remove'); }}
              onBan={(u) => { setTargetUser(u); setConfirmAction('ban'); }}
            />
          ))}
          {allMembers.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No team members yet</p>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(o) => { if (!o) { setConfirmAction(null); setTargetUser(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'delete' ? 'Delete Mission?' :
               confirmAction === 'ban' ? 'Ban User?' : 'Remove User?'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {confirmAction === 'delete'
              ? `This will permanently delete "${mission.title}" and all its data.`
              : confirmAction === 'ban'
              ? `This will remove the user and notify them they've been banned from this mission.`
              : 'This will remove the user from this mission.'}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setConfirmAction(null); setTargetUser(null); }}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (confirmAction === 'delete') handleDelete();
                else if (confirmAction === 'ban') handleBan(targetUser);
                else handleRemove(targetUser);
              }}
            >
              {confirmAction === 'delete' ? 'Delete' : confirmAction === 'ban' ? 'Ban' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}