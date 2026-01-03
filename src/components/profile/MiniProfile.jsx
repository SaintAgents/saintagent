import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { getRPRank, RP_LADDER } from '@/components/reputation/rpUtils';
import BadgesBar from '@/components/badges/BadgesBar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, TrendingUp, BadgeCheck, Users } from 'lucide-react';
import HelpHint from '@/components/hud/HelpHint';

const ROLE_LABELS = {
  member: 'Member',
  contributor: 'Contributor',
  moderator: 'Moderator',
  guardian: 'Guardian',
  reviewer: 'Reviewer',
  council_member: 'Council Member',
  administrator: 'Administrator',
  architect: 'Architect',
  founder_custodian: 'Founder'
};

export default function MiniProfile({
  userId,
  name,
  avatar,
  size = 40,
  showName = true,
  showHandle = true,
  className,
  showRankBadge = true,
  showTrustBadge = true,
  showReachBadge = true
}) {
  const { data: profs = [] } = useQuery({
    queryKey: ['miniProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId,
    refetchInterval: 10000
  });
  const profile = profs?.[0];

  const { data: roles = [] } = useQuery({
    queryKey: ['miniProfileRoles', userId],
    queryFn: () => base44.entities.UserRole.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId
  });

  const { data: miniBadges = [] } = useQuery({
    queryKey: ['miniProfileBadges', userId],
    queryFn: () => base44.entities.Badge.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId
  });

  const displayName = name || profile?.display_name || userId || 'User';
  const handle = profile?.handle;
  const sa = profile?.sa_number;
  const rpPointsVal = profile?.rp_points || 0;
  const rankTitle = (() => {
    const code = profile?.rp_rank_code;
    if (code) {
      const found = RP_LADDER.find((t) => t.code === code);
      if (found) return found.title;
    }
    return getRPRank(rpPointsVal)?.title || 'Seeker';
  })();

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)} data-user-id={userId}>
      <div className="relative">
        <RankedAvatar
          src={avatar || profile?.avatar_url}
          name={displayName}
          size={size}
          userId={userId}
          status={profile?.status}
          leaderTier={profile?.leader_tier}
          rpRankCode={profile?.rp_rank_code}
          rpPoints={profile?.rp_points}
          showPhotoIcon={true}
          galleryImages={profile?.gallery_images || []}
        />
      </div>
      {(showName || showHandle) &&
      <div className="min-w-0">
          {showName &&
        <div className="flex items-center gap-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{displayName}</div>
              <button
            type="button"
            onClick={() => {window.location.href = createPageUrl('Profile') + (userId ? `?id=${encodeURIComponent(userId)}` : '');}}
            title="Open full profile"
            className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-slate-100">

                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <HelpHint
            side="right"
            align="start"
            className="ml-0.5"
            size={20}
            content={
            <div className="min-w-[900px]">
                    <div className="bg-zinc-50 text-zinc-950 space-y-1.5">
                      <div className="text-sm font-semibold text-slate-800">Avatar Indicators</div>
                      <ul className="list-disc ml-4 text-xs text-slate-700 space-y-0.5">
                        <li className="text-zinc-950"><strong>Rank Ring</strong>: outer ring showing rank/progression</li>
                        <li className="text-zinc-950"><strong>Seal Badge</strong>: small circle on edge (role/qualification)</li>
                        <li className="text-zinc-950"><strong>Rank Sigil</strong>: symbol inside badge (rank meaning)</li>
                        <li className="text-zinc-950"><strong>Aura</strong>: subtle glow (elevated/active)</li>
                        <li className="text-zinc-950"><strong>Presence Marker</strong>: status dot (online/focus/dnd)</li>
                        <li className="text-zinc-950"><strong>Event Frame</strong>: decorative frame for special events</li>
                      </ul>
                    </div>
                  </div>
            } />

            </div>
        }
          {showHandle && (handle || sa) &&
        <div className="text-xs text-slate-500 truncate">
              {handle ? `@${handle}` : null} {sa ? (handle ? ' • ' : '') + `SA#${sa}` : ''}
            </div>
        }
          <div className="flex flex-wrap items-center gap-1 mt-0.5">
            {showRankBadge && (
              <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700">
                Rank {rankTitle}
              </Badge>
            )}
            {roles?.map((r) =>
          <Badge key={r.id} variant="secondary" className="h-5 text-[10px] capitalize">
                {ROLE_LABELS[r.role_code] || r.role_code?.replace(/_/g, ' ')}
              </Badge>
          )}
            {showTrustBadge && (
              <Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Trust {Math.round(profile?.trust_score ?? 0)}
              </Badge>
            )}
            {typeof profile?.influence_score === 'number' &&
          <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Inf {Math.round(profile.influence_score)}
              </Badge>
          }
            {showReachBadge && typeof profile?.reach_score === 'number' && (
              <Badge className="h-5 text-[10px] bg-blue-100 text-blue-700 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Reach {Math.round(profile.reach_score)}
              </Badge>
            )}
            {typeof profile?.expertise_score === 'number' &&
          <Badge className="h-5 text-[10px] bg-blue-100 text-blue-700 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Exp {Math.round(profile.expertise_score)}
              </Badge>
          }
          </div>
          {miniBadges?.length > 0 &&
        <div className="mt-1">
              <BadgesBar badges={miniBadges} defaultIfEmpty={false} />
            </div>
        }
        </div>
      }
    {/* Photo Viewer Overlay */}
    <PhotoViewer
        open={viewerOpen}
        images={[profile?.avatar_url, ...(profile?.gallery_images || [])].filter(Boolean).slice(0, 5)}
        onClose={() => setViewerOpen(false)} />

    </div>);

}