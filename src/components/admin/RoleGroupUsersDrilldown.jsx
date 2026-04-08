import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Loader2, Shield, ChevronRight } from 'lucide-react';
import ROLE_DEFS from '@/components/roles/RoleDefinitions';

export default function RoleGroupUsersDrilldown({ group, open, onClose }) {
  const roleCodes = group?.roles || [];

  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['userRolesByGroup', group?.code],
    queryFn: () => base44.entities.UserRole.filter({ status: 'active' }),
    enabled: open && roleCodes.length > 0,
  });

  const { data: allProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['allProfilesForRoles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    enabled: open,
    staleTime: 300000,
  });

  // Filter roles that match this group
  const matchingRoles = userRoles.filter(ur => roleCodes.includes(ur.role_code));

  // Group users by role_code
  const usersByRole = {};
  for (const roleCode of roleCodes) {
    usersByRole[roleCode] = matchingRoles
      .filter(ur => ur.role_code === roleCode)
      .map(ur => {
        const profile = allProfiles.find(p => p.user_id === ur.user_id);
        return { ...ur, profile };
      });
  }

  const totalUsers = new Set(matchingRoles.map(ur => ur.user_id)).size;
  const isLoading = rolesLoading || profilesLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${group?.color || 'slate'}-500`} />
            {group?.name} — Members
          </DialogTitle>
          <p className="text-sm text-slate-500">
            {totalUsers} user{totalUsers !== 1 ? 's' : ''} across {roleCodes.length} role{roleCodes.length !== 1 ? 's' : ''}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-5 pb-4">
              {roleCodes.map(roleCode => {
                const users = usersByRole[roleCode] || [];
                const roleDef = ROLE_DEFS[roleCode];
                return (
                  <div key={roleCode}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-semibold text-slate-800">
                        {roleDef?.title || roleCode}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{users.length}</Badge>
                    </div>

                    {users.length === 0 ? (
                      <p className="text-xs text-slate-400 ml-6">No users assigned</p>
                    ) : (
                      <div className="space-y-1 ml-2">
                        {users.map(u => (
                          <div
                            key={u.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            data-user-id={u.user_id}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={u.profile?.avatar_url} />
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {(u.profile?.display_name || u.user_id || '?').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {u.profile?.display_name || u.user_id}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{u.user_id}</p>
                            </div>
                            {u.profile?.rank_code && (
                              <Badge variant="outline" className="text-[10px] capitalize">
                                {u.profile.rank_code}
                              </Badge>
                            )}
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}