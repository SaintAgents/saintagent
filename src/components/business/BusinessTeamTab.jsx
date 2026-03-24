import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import TeamMemberCard from '@/components/business/TeamMemberCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BusinessTeamTab({ entity, isOwner, onAddMember }) {
  const team = entity.team_roles || [];
  const queryClient = useQueryClient();
  const [removeTarget, setRemoveTarget] = useState(null);

  const handleUpdate = async (userId, updates) => {
    const newTeamRoles = team.map(m =>
      m.user_id === userId ? { ...m, ...updates } : m
    );
    await base44.entities.BusinessEntity5D.update(entity.id, { team_roles: newTeamRoles });
    queryClient.invalidateQueries({ queryKey: ['businessEntity5D', entity.id] });
    toast.success('Team member updated');
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const newTeamRoles = team.filter(m => m.user_id !== removeTarget);
    const newTeamMemberIds = (entity.team_member_ids || []).filter(id => id !== removeTarget);
    await base44.entities.BusinessEntity5D.update(entity.id, {
      team_roles: newTeamRoles,
      team_member_ids: newTeamMemberIds,
    });
    queryClient.invalidateQueries({ queryKey: ['businessEntity5D', entity.id] });
    toast.success('Team member removed');
    setRemoveTarget(null);
  };

  const removeName = team.find(m => m.user_id === removeTarget)?.name || 'this member';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Team Members ({team.length})</h3>
        {isOwner && (
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={onAddMember}>
            <UserPlus className="w-4 h-4" /> Add Member
          </Button>
        )}
      </div>

      {team.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No team members yet</p>
          {isOwner && (
            <Button size="sm" variant="outline" className="mt-3 rounded-xl gap-2" onClick={onAddMember}>
              <UserPlus className="w-4 h-4" /> Add your first team member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member, i) => (
            <TeamMemberCard
              key={member.user_id || i}
              member={member}
              isOwner={isOwner}
              onUpdate={handleUpdate}
              onRemove={(userId) => setRemoveTarget(userId)}
            />
          ))}
        </div>
      )}

      {/* Remove confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{removeName}</strong> from the team? They will lose access to team features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}