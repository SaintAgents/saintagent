import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, UserPlus, Crown, Star, Eye, Wrench, 
  MoreVertical, X, Check, Search, Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_CONFIG = {
  owner: { label: 'Owner', icon: Crown, color: 'bg-amber-100 text-amber-700' },
  lead: { label: 'Lead', icon: Star, color: 'bg-violet-100 text-violet-700' },
  contributor: { label: 'Contributor', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
  advisor: { label: 'Advisor', icon: Eye, color: 'bg-emerald-100 text-emerald-700' },
  observer: { label: 'Observer', icon: Eye, color: 'bg-slate-100 text-slate-700' },
};

export default function ProjectTeamPanel({ projectId, isOwner = false }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('contributor');
  const [inviteNote, setInviteNote] = useState('');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['projectTeamMembers', projectId],
    queryFn: () => base44.entities.ProjectTeamMember.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['profilesForInvite'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100),
    enabled: inviteOpen
  });

  // Filter profiles not already in team
  const availableProfiles = allProfiles.filter(
    p => !members.some(m => m.user_id === p.user_id) && 
    (p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.handle?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const inviteMutation = useMutation({
    mutationFn: async ({ userId, profile }) => {
      await base44.entities.ProjectTeamMember.create({
        project_id: projectId,
        user_id: userId,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        role: selectedRole,
        status: 'invited',
        contribution_notes: inviteNote,
        joined_at: new Date().toISOString()
      });
      // Create notification
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'collaboration',
        title: 'Team Invitation',
        message: `You've been invited to join a project team`,
        action_url: `/Projects?id=${projectId}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTeamMembers', projectId] });
      setInviteOpen(false);
      setSearchQuery('');
      setInviteNote('');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) => 
      base44.entities.ProjectTeamMember.update(memberId, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTeamMembers', projectId] })
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.ProjectTeamMember.delete(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTeamMembers', projectId] })
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (memberId) => 
      base44.entities.ProjectTeamMember.update(memberId, { status: 'active' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTeamMembers', projectId] })
  });

  const activeMembers = members.filter(m => m.status === 'active');
  const pendingMembers = members.filter(m => m.status === 'invited' || m.status === 'pending');
  const currentUserMember = members.find(m => m.user_id === currentUser?.email);
  const isPendingInvite = currentUserMember?.status === 'invited';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-slate-900">Team</h3>
          <Badge variant="secondary" className="text-xs">{activeMembers.length}</Badge>
        </div>
        {isOwner && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search by name or handle..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="advisor">Advisor</SelectItem>
                    <SelectItem value="observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea 
                  placeholder="Add a note (optional)"
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  rows={2}
                />
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableProfiles.slice(0, 10).map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => inviteMutation.mutate({ userId: profile.user_id, profile })}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{profile.display_name}</p>
                        <p className="text-xs text-slate-500">@{profile.handle}</p>
                      </div>
                      <Mail className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                  {availableProfiles.length === 0 && searchQuery && (
                    <p className="text-sm text-slate-500 text-center py-4">No users found</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pending Invite Banner */}
      {isPendingInvite && (
        <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-between">
          <p className="text-sm text-violet-700">You've been invited to join this team</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7"
              onClick={() => removeMemberMutation.mutate(currentUserMember.id)}
            >
              Decline
            </Button>
            <Button 
              size="sm" 
              className="h-7 bg-violet-600 hover:bg-violet-700"
              onClick={() => acceptInviteMutation.mutate(currentUserMember.id)}
            >
              Accept
            </Button>
          </div>
        </div>
      )}

      {/* Active Members */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg" />)}
          </div>
        ) : activeMembers.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No team members yet</p>
        ) : (
          activeMembers.map((member) => {
            const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.contributor;
            const RoleIcon = roleConfig.icon;
            return (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border hover:border-violet-200 transition-colors"
              >
                <Avatar className="w-10 h-10 cursor-pointer" data-user-id={member.user_id}>
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback>{member.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{member.display_name}</p>
                  <Badge className={cn("text-[10px] h-5", roleConfig.color)}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleConfig.label}
                  </Badge>
                </div>
                {isOwner && member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'lead' })}>
                        Make Lead
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'contributor' })}>
                        Make Contributor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: 'advisor' })}>
                        Make Advisor
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        className="text-red-600"
                      >
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && isOwner && (
        <div className="pt-3 border-t">
          <p className="text-xs font-medium text-slate-500 mb-2">Pending Invites</p>
          <div className="space-y-2">
            {pendingMembers.map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-dashed"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback>{member.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{member.display_name}</p>
                  <p className="text-xs text-slate-400">Invited</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => removeMemberMutation.mutate(member.id)}
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}