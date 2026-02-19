import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, Search, UserCheck, UsersRound, X, Check, Building2
} from "lucide-react";

export default function RecipientSelectorModal({ 
  open, 
  onClose, 
  onConfirm, 
  currentUserEmail 
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectedTeamIds, setSelectedTeamIds] = useState(new Set());

  // Fetch all profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-created_date', 50)
  });

  // Fetch collaborators (users you've had meetings with)
  const { data: meetings = [] } = useQuery({
    queryKey: ['myMeetings', currentUserEmail],
    queryFn: () => base44.entities.Meeting.filter({
      status: 'completed'
    }, '-created_date', 100),
    enabled: !!currentUserEmail
  });

  const collaboratorIds = useMemo(() => {
    const ids = new Set();
    meetings.forEach(m => {
      if (m.host_id === currentUserEmail && m.guest_id) ids.add(m.guest_id);
      if (m.guest_id === currentUserEmail && m.host_id) ids.add(m.host_id);
    });
    return ids;
  }, [meetings, currentUserEmail]);

  const collaborators = useMemo(() => {
    return profiles.filter(p => collaboratorIds.has(p.user_id));
  }, [profiles, collaboratorIds]);

  // Filter profiles based on search
  const filteredProfiles = useMemo(() => {
    const list = profiles.filter(p => p.user_id !== currentUserEmail);
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => 
      p.display_name?.toLowerCase().includes(q) ||
      p.handle?.toLowerCase().includes(q) ||
      p.user_id?.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery, currentUserEmail]);

  // Filter teams based on search
  const filteredTeams = useMemo(() => {
    if (!searchQuery) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter(t => t.name?.toLowerCase().includes(q));
  }, [teams, searchQuery]);

  const toggleUser = (userId) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUserIds(newSet);
  };

  const toggleTeam = (teamId) => {
    const newSet = new Set(selectedTeamIds);
    if (newSet.has(teamId)) {
      newSet.delete(teamId);
    } else {
      newSet.add(teamId);
    }
    setSelectedTeamIds(newSet);
  };

  const selectAll = () => {
    if (activeTab === 'all') {
      setSelectedUserIds(new Set(filteredProfiles.map(p => p.user_id)));
    } else if (activeTab === 'collaborators') {
      setSelectedUserIds(new Set(collaborators.map(p => p.user_id)));
    } else if (activeTab === 'teams') {
      setSelectedTeamIds(new Set(teams.map(t => t.id)));
    }
  };

  const clearAll = () => {
    setSelectedUserIds(new Set());
    setSelectedTeamIds(new Set());
  };

  const handleConfirm = () => {
    // Get all user IDs including team members
    const allUserIds = new Set(selectedUserIds);
    selectedTeamIds.forEach(teamId => {
      const team = teams.find(t => t.id === teamId);
      if (team?.member_ids) {
        team.member_ids.forEach(id => allUserIds.add(id));
      }
      if (team?.leader_id) allUserIds.add(team.leader_id);
    });
    
    // Remove current user
    allUserIds.delete(currentUserEmail);
    
    // Get profiles for selected users
    const selectedProfiles = profiles.filter(p => allUserIds.has(p.user_id));
    
    onConfirm({
      userIds: Array.from(allUserIds),
      profiles: selectedProfiles,
      teamIds: Array.from(selectedTeamIds)
    });
    onClose();
  };

  const totalSelected = selectedUserIds.size + selectedTeamIds.size;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            Select Recipients
          </DialogTitle>
          <DialogDescription>
            Choose users or teams to receive email invitations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users or teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all" className="gap-1">
                <Users className="w-4 h-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="collaborators" className="gap-1">
                <UserCheck className="w-4 h-4" />
                Collaborators
              </TabsTrigger>
              <TabsTrigger value="teams" className="gap-1">
                <UsersRound className="w-4 h-4" />
                Teams
              </TabsTrigger>
            </TabsList>

            {/* All Users Tab */}
            <TabsContent value="all" className="flex-1 min-h-0 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{filteredProfiles.length} users</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                </div>
              </div>
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredProfiles.map(profile => (
                    <div
                      key={profile.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleUser(profile.user_id);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUserIds.has(profile.user_id) 
                          ? 'bg-violet-50 border border-violet-200' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <Checkbox 
                        checked={selectedUserIds.has(profile.user_id)}
                        onCheckedChange={() => toggleUser(profile.user_id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{profile.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile.display_name}</p>
                        <p className="text-xs text-slate-500 truncate">@{profile.handle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Collaborators Tab */}
            <TabsContent value="collaborators" className="flex-1 min-h-0 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{collaborators.length} collaborators</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                </div>
              </div>
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {collaborators.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No collaborators yet</p>
                      <p className="text-xs">Complete meetings to build your network</p>
                    </div>
                  ) : (
                    collaborators.map(profile => (
                      <div
                        key={profile.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleUser(profile.user_id);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedUserIds.has(profile.user_id) 
                            ? 'bg-violet-50 border border-violet-200' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox 
                          checked={selectedUserIds.has(profile.user_id)}
                          onCheckedChange={() => toggleUser(profile.user_id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>{profile.display_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{profile.display_name}</p>
                          <p className="text-xs text-slate-500 truncate">@{profile.handle}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="flex-1 min-h-0 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{filteredTeams.length} teams</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                </div>
              </div>
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredTeams.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No teams found</p>
                    </div>
                  ) : (
                    filteredTeams.map(team => (
                      <div
                        key={team.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleTeam(team.id);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedTeamIds.has(team.id) 
                            ? 'bg-violet-50 border border-violet-200' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox 
                          checked={selectedTeamIds.has(team.id)}
                          onCheckedChange={() => toggleTeam(team.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <UsersRound className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{team.name}</p>
                          <p className="text-xs text-slate-500">{team.member_count || 1} members</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {team.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Selected Summary & Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm">
              {totalSelected > 0 ? (
                <span className="text-violet-600 font-medium">
                  {selectedUserIds.size} users, {selectedTeamIds.size} teams selected
                </span>
              ) : (
                <span className="text-slate-500">No recipients selected</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleConfirm}
                disabled={totalSelected === 0}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm Selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}