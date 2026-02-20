import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, X } from 'lucide-react';

export default function AddTeamMemberModal({ open, onClose, entityType, entityId, currentTeamIds = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [skillReason, setSkillReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    enabled: open
  });

  const filteredProfiles = profiles.filter(p => {
    if (currentTeamIds.includes(p.user_id)) return false;
    if (!searchQuery) return true;
    return p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.user_id?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAdd = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    
    try {
      const newTeamIds = [...currentTeamIds, selectedUser.user_id];
      
      if (entityType === 'deal') {
        await base44.entities.Deal.update(entityId, { 
          team_member_ids: newTeamIds 
        });
        // Log activity
        await base44.entities.DealActivity.create({
          deal_id: entityId,
          activity_type: 'updated',
          description: `Added ${selectedUser.display_name} to team${skillReason ? `: ${skillReason}` : ''}`,
          actor_id: (await base44.auth.me()).email,
          actor_name: (await base44.auth.me()).full_name
        });
        queryClient.invalidateQueries({ queryKey: ['deals'] });
      } else {
        await base44.entities.Project.update(entityId, { 
          team_member_ids: newTeamIds 
        });
        await base44.entities.ProjectActivity.create({
          project_id: entityId,
          activity_type: 'team_member_added',
          description: `Added ${selectedUser.display_name}${skillReason ? ` - ${skillReason}` : ''}`,
          actor_id: (await base44.auth.me()).email,
          actor_name: (await base44.auth.me()).full_name
        });
        queryClient.invalidateQueries({ queryKey: ['fundedProjects'] });
      }
      
      onClose();
      setSelectedUser(null);
      setSkillReason('');
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to add team member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-500" />
            Add Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedUser ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredProfiles.slice(0, 20).map(profile => (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedUser(profile)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {profile.display_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          @{profile.handle} • {profile.user_id}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <p className="text-center text-slate-500 py-8">No users found</p>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-lg border border-cyan-200 dark:border-cyan-500/30">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>{selectedUser.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedUser.display_name}
                  </p>
                  <p className="text-sm text-slate-500">@{selectedUser.handle}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Skill / Role / Reason for adding</Label>
                <Textarea
                  placeholder="e.g., Legal expertise, Project manager, Technical advisor..."
                  value={skillReason}
                  onChange={(e) => setSkillReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleAdd} 
                  disabled={isSubmitting}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Team'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}