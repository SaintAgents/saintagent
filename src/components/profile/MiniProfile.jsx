import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ROLE_LABELS = {
  member: 'Member',
  contributor: 'Contributor',
  moderator: 'Moderator',
  guardian: 'Guardian',
  reviewer: 'Reviewer',
  council_member: 'Council Member',
  administrator: 'Administrator',
  architect: 'Architect',
  founder_custodian: 'Founder',
};

export default function MiniProfile({
  userId,
  name,
  avatar,
  size = 40,
  showName = true,
  showHandle = true,
  className,
}) {
  const { data: profs = [] } = useQuery({
    queryKey: ['miniProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId,
  });
  const profile = profs?.[0];

  const { data: roles = [] } = useQuery({
    queryKey: ['miniProfileRoles', userId],
    queryFn: () => base44.entities.UserRole.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId,
  });

  const displayName = name || profile?.display_name || userId || 'User';
  const handle = profile?.handle;
  const sa = profile?.sa_number;

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)} data-user-id={userId}>
      <RankedAvatar
        src={avatar || profile?.avatar_url}
        name={displayName}
        size={size}
        userId={userId}
        status={profile?.status}
        leaderTier={profile?.leader_tier}
        rpRankCode={profile?.rp_rank_code}
        rpPoints={profile?.rp_points}
      />
      {(showName || showHandle) && (
        <div className="min-w-0">
          {showName && (
            <div className="text-sm font-medium text-slate-900 truncate">{displayName}</div>
          )}
          {showHandle && (handle || sa) && (
            <div className="text-xs text-slate-500 truncate">
              {handle ? `@${handle}` : null} {sa ? (handle ? ' • ' : '') + `SA#${sa}` : ''}
            </div>
          )}
          {roles?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {roles.map((r) => (
                <Badge key={r.id} variant="secondary" className="h-5 text-[10px] capitalize">
                  {ROLE_LABELS[r.role_code] || r.role_code?.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}