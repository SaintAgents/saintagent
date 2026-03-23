import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Crown, Shield, Users } from 'lucide-react';

const ROLE_STYLES = {
  owner: { label: 'Owner', color: 'bg-amber-100 text-amber-700', icon: Crown },
  admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700', icon: Shield },
  member: { label: 'Member', color: 'bg-blue-100 text-blue-700', icon: Users },
};

export default function BusinessTeamTab({ entity, isOwner, onAddMember }) {
  const team = entity.team_roles || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Team Members ({team.length})</h3>
        {isOwner && (
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={onAddMember}>
            <UserPlus className="w-4 h-4" /> Add Member
          </Button>
        )}
      </div>

      {/* Team grid */}
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
          {team.map((member, i) => {
            const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.member;
            const RoleIcon = roleStyle.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow cursor-pointer" data-user-id={member.user_id}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">
                      {member.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{member.name || 'Team Member'}</p>
                    <p className="text-sm text-slate-500 truncate">{member.title || 'Member'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge className={`${roleStyle.color} gap-1 text-xs`}>
                    <RoleIcon className="w-3 h-3" /> {roleStyle.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}