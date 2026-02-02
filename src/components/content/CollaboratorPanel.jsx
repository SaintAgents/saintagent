import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, X, Crown, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaboratorPanel({ project, profile }) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const { data: collaboratorProfiles = [] } = useQuery({
    queryKey: ['collaboratorProfiles', project?.collaborator_ids],
    queryFn: async () => {
      if (!project?.collaborator_ids?.length) return [];
      const profiles = await base44.entities.UserProfile.list('-created_date', 100);
      return profiles.filter(p => project.collaborator_ids.includes(p.user_id));
    },
    enabled: !!project?.collaborator_ids?.length
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: email });
      if (!profiles[0]) {
        throw new Error('User not found');
      }

      const existing = await base44.entities.CollaboratorInvite.filter({
        project_id: project.id,
        invitee_id: email,
        status: 'pending'
      });

      if (existing.length > 0) {
        throw new Error('Invite already sent');
      }

      await base44.entities.CollaboratorInvite.create({
        project_id: project.id,
        project_title: project.title,
        inviter_id: profile.user_id,
        inviter_name: profile.display_name,
        invitee_id: email,
        invitee_email: email,
        role,
        status: 'pending'
      });

      await base44.entities.Notification.create({
        user_id: email,
        type: 'collaboration',
        title: 'New collaboration invite',
        message: `${profile.display_name} invited you to collaborate on "${project.title}"`,
        action_url: `/ContentStudio`
      });
    },
    onSuccess: () => {
      toast.success('Invitation sent');
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['collaboratorProfiles'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send invite');
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (userId) => {
      const newCollaborators = project.collaborator_ids.filter(id => id !== userId);
      await base44.entities.ContentProject.update(project.id, {
        collaborator_ids: newCollaborators
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentProject'] });
      queryClient.invalidateQueries({ queryKey: ['collaboratorProfiles'] });
    }
  });

  const isOwner = project?.owner_id === profile?.user_id;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Team</h3>
          
          {/* Owner */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 mb-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={project.owner_avatar} />
              <AvatarFallback>{project.owner_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{project.owner_name}</p>
              <p className="text-xs text-violet-600 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Owner
              </p>
            </div>
          </div>

          {/* Collaborators */}
          <div className="space-y-2">
            {collaboratorProfiles.map(collab => (
              <div key={collab.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 group">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={collab.avatar_url} />
                  <AvatarFallback>{collab.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{collab.display_name}</p>
                  <p className="text-xs text-slate-500">Collaborator</p>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => removeMutation.mutate(collab.user_id)}
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Invite Collaborator</h4>
            <div className="space-y-3">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address..."
                type="email"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="co-author">Co-Author</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                disabled={!inviteEmail || inviteMutation.isPending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}