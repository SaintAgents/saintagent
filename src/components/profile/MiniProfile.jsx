import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { getRPRank } from '@/components/reputation/rpUtils';
import BadgesBar from '@/components/badges/BadgesBar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, TrendingUp, BadgeCheck } from 'lucide-react';
import { createPageUrl } from '@/utils';

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
    refetchInterval: 10000,
  });
  const profile = profs?.[0];

  const { data: roles = [] } = useQuery({
    queryKey: ['miniProfileRoles', userId],
    queryFn: () => base44.entities.UserRole.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId,
  });

  const { data: miniBadges = [] } = useQuery({
    queryKey: ['miniProfileBadges', userId],
    queryFn: () => base44.entities.Badge.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId,
  });

  const displayName = name || profile?.display_name || userId || 'User';
  const handle = profile?.handle;
  const sa = profile?.sa_number;
  const rpInfo = getRPRank(profile?.rp_points || 0);

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)} data-user-id={userId}>
      <div
        onClick={() => { window.location.href = createPageUrl('Profile') + (userId ? `?id=${encodeURIComponent(userId)}` : ''); }}
        className="cursor-pointer"
        title="Open profile"
      >
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
      </div>
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
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700">
              Rank {rpInfo?.title || 'Seeker'}
            </Badge>
            {roles?.map((r) => (
              <Badge key={r.id} variant="secondary" className="h-5 text-[10px] capitalize">
                {ROLE_LABELS[r.role_code] || r.role_code?.replace(/_/g, ' ')}
              </Badge>
            ))}
            <Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Trust {Math.round(profile?.trust_score ?? 0)}
            </Badge>
            {typeof profile?.influence_score === 'number' && (
              <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Inf {Math.round(profile.influence_score)}
              </Badge>
            )}
            {typeof profile?.expertise_score === 'number' && (
              <Badge className="h-5 text-[10px] bg-blue-100 text-blue-700 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Exp {Math.round(profile.expertise_score)}
              </Badge>
            )}
          </div>
          {miniBadges?.length > 0 && (
            <div className="mt-1">
              <BadgesBar badges={miniBadges} defaultIfEmpty={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}