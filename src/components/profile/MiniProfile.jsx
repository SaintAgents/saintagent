import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { getRPRank, RP_LADDER } from '@/components/reputation/rpUtils';
import BadgesBar from '@/components/badges/BadgesBar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, TrendingUp, BadgeCheck, Users, Coins } from 'lucide-react';
import HelpHint from '@/components/hud/HelpHint';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  showReachBadge = true,
  showHelpHint = true
}) {
  // Always call hooks unconditionally with stable keys
  // Use longer stale times to reduce API calls and prevent rate limiting
  const { data: profs = [] } = useQuery({
    queryKey: ['miniProfile', userId || 'none'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
  const profile = profs?.[0];

  const { data: roles = [] } = useQuery({
    queryKey: ['miniProfileRoles', userId || 'none'],
    queryFn: () => base44.entities.UserRole.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: miniBadges = [] } = useQuery({
    queryKey: ['miniProfileBadges', userId || 'none'],
    queryFn: () => base44.entities.Badge.filter({ user_id: userId, status: 'active' }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (userId) {
      document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
    }
  };

  // Determine if we should show the hero layout (larger sizes)
  const showHeroLayout = size >= 48;
  const heroHeight = Math.max(40, Math.round(size * 0.8));
  const heroImage = profile?.hero_image_url;

  return (
    <div className={cn('min-w-0', className)} data-user-id={userId}>
      {showHeroLayout ? (
        <div className="relative">
          {/* Mini Hero Banner */}
          <div 
            className="w-full rounded-t-lg overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600"
            style={{ height: heroHeight }}
          >
            {heroImage && (
              <img 
                src={heroImage} 
                alt="" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Avatar overlapping hero */}
          <div className="flex items-end gap-3 px-2" style={{ marginTop: -size / 2 }}>
            <div className="relative cursor-pointer shrink-0" onClick={handleAvatarClick}>
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
            
            {(showName || showHandle) && (
              <div className="min-w-0 pb-1">
                {showName && (
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{displayName}</div>
                  </div>
                )}
                {showHandle && (handle || sa) && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {handle ? `@${handle}` : null} {sa ? (handle ? ' • ' : '') + `SA#${sa}` : ''}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative cursor-pointer" onClick={handleAvatarClick}>
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
          {(showName || showHandle) && (
            <div className="min-w-0">
              {showName && (
                <div className="flex items-center gap-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{displayName}</div>
                  {showHelpHint && (
                    <HelpHint
                      side="right"
                      align="start"
                      className="ml-0.5"
                      size={16}
                      content={
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-slate-800 mb-1">Avatar Indicators</div>
                          <ul className="list-disc ml-4 text-xs text-slate-600 space-y-0.5">
                            <li><strong>Rank Ring</strong>: outer ring showing rank</li>
                            <li><strong>Rank Sigil</strong>: symbol at top-left</li>
                            <li><strong>Status Dot</strong>: online/focus/dnd</li>
                            <li><strong>Leader Badge</strong>: verified 144k sparkle</li>
                          </ul>
                        </div>
                      }
                    />
                  )}
                </div>
              )}
              {showHandle && (handle || sa) && (
                <div className="text-xs text-slate-500 truncate">
                  {handle ? `@${handle}` : null} {sa ? (handle ? ' • ' : '') + `SA#${sa}` : ''}
                </div>
              )}
              <TooltipProvider delayDuration={200}>
                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                  {showRankBadge && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700 cursor-help">
                          Rank: {rankTitle}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-xs">Your spiritual rank based on Reputation Points (RP). Progress through Seeker → Initiate → Adept → Master → Sage → Oracle → Guardian.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {roles?.map((r) => (
                    <Badge key={r.id} variant="secondary" className="h-5 text-[10px] capitalize">
                      {ROLE_LABELS[r.role_code] || r.role_code?.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {showTrustBadge && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-700 flex items-center gap-1 cursor-help">
                          <Shield className="w-3 h-3" />
                          Trust: {Math.round(profile?.trust_score ?? 0)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-xs"><strong>Trust Score</strong> measures reliability based on completed meetings, testimonials, and verified actions.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {typeof profile?.influence_score === 'number' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700 flex items-center gap-1 cursor-help">
                          <TrendingUp className="w-3 h-3" />
                          Influence: {Math.round(profile.influence_score)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-xs"><strong>Influence Score</strong> reflects your impact through engagement, content creation, and mentorship.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {showReachBadge && typeof profile?.reach_score === 'number' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="h-5 text-[10px] bg-blue-100 text-blue-700 flex items-center gap-1 cursor-help">
                          <Users className="w-3 h-3" />
                          Reach: {Math.round(profile.reach_score)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-xs"><strong>Reach Score</strong> shows your network size based on followers and connections.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {typeof profile?.expertise_score === 'number' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="h-5 text-[10px] bg-blue-100 text-blue-700 flex items-center gap-1 cursor-help">
                          <BadgeCheck className="w-3 h-3" />
                          Expertise: {Math.round(profile.expertise_score)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="text-xs"><strong>Expertise Score</strong> represents skill depth from endorsements, projects, and peer reviews.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {typeof profile?.ggg_balance === 'number' && profile.ggg_balance > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="h-5 text-[10px] bg-amber-100 text-amber-700 flex items-center gap-1 cursor-help">
                          <Coins className="w-3 h-3" />
                          {Math.round(profile.ggg_balance)} GGG
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[220px]">
                        <p className="text-xs"><strong>GGG (Give, Grow, Glow)</strong> is the platform's gratitude currency. Earn it by helping others, completing missions, and contributing to the community.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
              {miniBadges?.length > 0 && (
                <div className="mt-1">
                  <BadgesBar badges={miniBadges} defaultIfEmpty={false} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}