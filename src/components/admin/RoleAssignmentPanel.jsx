import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Search, UserPlus, UserMinus, Loader2, Shield, Check, X, Filter
} from "lucide-react";
import { 
  ROLE_ORDER, 
  DEFAULT_ROLE_GROUPS 
} from '@/components/roles/RoleDefinitions';
import ROLE_DEFS from '@/components/roles/RoleDefinitions';
import { toast } from 'sonner';

export default function RoleAssignmentPanel({ roleGroups = [] }) {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all | assigned | unassigned
  const queryClient = useQueryClient();

  const allGroups = [
    ...Object.values(DEFAULT_ROLE_GROUPS).map(g => ({ ...g, _isDefault: true })),
    ...roleGroups.filter(g => g.is_active !== false)
  ];

  const { data: allProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['allProfilesForAssignment'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: allUserRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['allUserRolesForAssignment'],
    queryFn: () => base44.entities.UserRole.filter({ status: 'active' }),
    staleTime: 60000,
  });

  const assignMutation = useMutation({
    mutationFn: async ({ userId, roleCode, groupCode }) => {
      return base44.entities.UserRole.create({
        user_id: userId,
        role_code: roleCode,
        status: 'active',
        assigned_by: (await base44.auth.me()).email,
        assigned_at: new Date().toISOString(),
        role_group: groupCode,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserRolesForAssignment'] });
      queryClient.invalidateQueries({ queryKey: ['userRolesByGroup'] });
      toast.success('Role assigned');
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (roleId) => {
      return base44.entities.UserRole.update(roleId, { status: 'revoked' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserRolesForAssignment'] });
      queryClient.invalidateQueries({ queryKey: ['userRolesByGroup'] });
      toast.success('Role revoked');
    }
  });

  // Determine which role codes belong to the selected group
  const activeRoleCodes = useMemo(() => {
    if (selectedGroup === 'all') {
      return ROLE_ORDER.filter(c => c !== 'member');
    }
    const group = allGroups.find(g => g.code === selectedGroup);
    return group?.roles || [];
  }, [selectedGroup, allGroups]);

  // Build a lookup: userId -> array of active UserRole records matching activeRoleCodes
  const userRolesMap = useMemo(() => {
    const map = {};
    for (const ur of allUserRoles) {
      if (!activeRoleCodes.includes(ur.role_code)) continue;
      if (!map[ur.user_id]) map[ur.user_id] = [];
      map[ur.user_id].push(ur);
    }
    return map;
  }, [allUserRoles, activeRoleCodes]);

  // Filter + search profiles
  const filteredProfiles = useMemo(() => {
    let list = allProfiles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.display_name || '').toLowerCase().includes(q) ||
        (p.user_id || '').toLowerCase().includes(q) ||
        (p.handle || '').toLowerCase().includes(q)
      );
    }

    if (filterMode === 'assigned') {
      list = list.filter(p => userRolesMap[p.user_id]?.length > 0);
    } else if (filterMode === 'unassigned') {
      list = list.filter(p => !userRolesMap[p.user_id]?.length);
    }

    return list;
  }, [allProfiles, searchQuery, filterMode, userRolesMap]);

  const assignedCount = allProfiles.filter(p => userRolesMap[p.user_id]?.length > 0).length;

  const isLoading = profilesLoading || rolesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-violet-600" />
          User Role Assignment
        </CardTitle>
        <p className="text-sm text-slate-500">
          Assign or remove roles for users. {assignedCount} of {allProfiles.length} users have role assignments.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search users by name, email, or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {allGroups.map(g => (
                <SelectItem key={g.code} value={g.code}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${g.color || 'slate'}-500`} />
                    {g.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterMode} onValueChange={setFilterMode}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="assigned">Assigned Only</SelectItem>
              <SelectItem value="unassigned">Unassigned Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role Legend */}
        <div className="flex flex-wrap gap-1 p-3 bg-slate-50 rounded-lg">
          <span className="text-xs font-medium text-slate-600 mr-2">Active Roles:</span>
          {activeRoleCodes.map(code => (
            <Badge key={code} variant="outline" className="text-[10px]">
              {ROLE_DEFS[code]?.title || code}
            </Badge>
          ))}
        </div>

        {/* Summary Bar */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>Showing <strong>{filteredProfiles.length}</strong> users</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-500" />
            {assignedCount} assigned
          </span>
          <span className="flex items-center gap-1">
            <X className="w-3 h-3 text-slate-400" />
            {allProfiles.length - assignedCount} unassigned
          </span>
        </div>

        {/* Users List */}
        <ScrollArea className="h-[500px] pr-2">
          <div className="space-y-1">
            {filteredProfiles.map(profile => (
              <UserRoleRow
                key={profile.id}
                profile={profile}
                assignedRoles={userRolesMap[profile.user_id] || []}
                activeRoleCodes={activeRoleCodes}
                allGroups={allGroups}
                selectedGroup={selectedGroup}
                onAssign={(roleCode) => {
                  const group = allGroups.find(g => g.roles?.includes(roleCode));
                  assignMutation.mutate({
                    userId: profile.user_id,
                    roleCode,
                    groupCode: group?.code || '',
                  });
                }}
                onRevoke={(roleId) => revokeMutation.mutate(roleId)}
                isPending={assignMutation.isPending || revokeMutation.isPending}
              />
            ))}
            {filteredProfiles.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No users match your filters</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function UserRoleRow({ profile, assignedRoles, activeRoleCodes, allGroups, selectedGroup, onAssign, onRevoke, isPending }) {
  const [expanded, setExpanded] = useState(false);
  const hasRoles = assignedRoles.length > 0;

  return (
    <div className={`border rounded-lg transition-colors ${hasRoles ? 'bg-violet-50/50 border-violet-200' : 'border-slate-200 hover:bg-slate-50'}`}>
      {/* Summary Row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Avatar className="w-9 h-9">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
            {(profile.display_name || profile.user_id || '?').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {profile.display_name || profile.user_id}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{profile.user_id}</p>
        </div>

        {/* Current roles badges */}
        <div className="flex flex-wrap gap-1 max-w-[300px]">
          {assignedRoles.map(ur => (
            <Badge key={ur.id} className="bg-violet-100 text-violet-700 text-[10px] gap-1">
              <Shield className="w-2.5 h-2.5" />
              {ROLE_DEFS[ur.role_code]?.title || ur.role_code}
            </Badge>
          ))}
          {!hasRoles && (
            <Badge variant="outline" className="text-[10px] text-slate-400">No roles</Badge>
          )}
        </div>

        <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {expanded ? 'Close' : 'Manage'}
        </Button>
      </div>

      {/* Expanded Role Toggles */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {activeRoleCodes.map(roleCode => {
              const existing = assignedRoles.find(ur => ur.role_code === roleCode);
              const isAssigned = !!existing;
              return (
                <button
                  key={roleCode}
                  disabled={isPending}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isAssigned
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700'
                  }`}
                  onClick={() => isAssigned ? onRevoke(existing.id) : onAssign(roleCode)}
                  title={isAssigned ? `Revoke ${ROLE_DEFS[roleCode]?.title}` : `Assign ${ROLE_DEFS[roleCode]?.title}`}
                >
                  {isAssigned ? (
                    <>
                      <Check className="w-3 h-3" />
                      {ROLE_DEFS[roleCode]?.title || roleCode}
                      <X className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      {ROLE_DEFS[roleCode]?.title || roleCode}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}