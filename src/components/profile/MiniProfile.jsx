import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RankedAvatar from '@/components/reputation/RankedAvatar';
// RP ladder utilities - inlined to avoid import issues
const RP_LADDER = [
  { level: 1, code: 'seeker', title: 'Seeker', min: 200, nextMin: 500 },
  { level: 2, code: 'initiate', title: 'Initiate', min: 500, nextMin: 800 },
  { level: 3, code: 'adept', title: 'Adept', min: 800, nextMin: 1200 },
  { level: 4, code: 'practitioner', title: 'Practitioner', min: 1200, nextMin: 1800 },
  { level: 5, code: 'master', title: 'Master', min: 1800, nextMin: 2600 },
  { level: 6, code: 'sage', title: 'Sage', min: 2600, nextMin: 3600 },
  { level: 7, code: 'oracle', title: 'Oracle', min: 3600, nextMin: 5200 },
  { level: 8, code: 'ascended', title: 'Ascended', min: 5200, nextMin: 7200 },
  { level: 9, code: 'guardian', title: 'Guardian', min: 7200, nextMin: 10000 },
];

function getRPRank(points = 0) {
  if (points < RP_LADDER[0].min) {
    const next = RP_LADDER[0];
    return { ...next, currentMin: next.min, nextTitle: RP_LADDER[1]?.title || null };
  }
  const tier = RP_LADDER.find((t) => (t.nextMin ?? Infinity) > points && t.min <= points) || RP_LADDER[RP_LADDER.length - 1];
  const nextIndex = RP_LADDER.findIndex((t) => t.code === tier.code) + 1;
  return { ...tier, currentMin: tier.min, nextTitle: RP_LADDER[nextIndex]?.title || null };
}
import BadgesBar from '@/components/badges/BadgesBar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, TrendingUp, BadgeCheck, Users, Coins } from 'lucide-react';
import HelpHint from '@/components/hud/HelpHint';
import TipButton from '@/components/creator/TipButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DestinyCardTooltip from '@/components/destiny/DestinyCardTooltip';


// Default fallback hero image
const DEFAULT_HERO_IMAGE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/31742c677_universal_upscale_0_ec38ae88-7005-4eed-a87e-5dd7b72e47dc_0.jpg';

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
  showHelpHint = true,
  showTipButton = true
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
    e.preventDefault();
    e.stopPropagation();
    if (userId) {
      document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
    }
  };
  
  const handleNameClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (userId) {
      document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
    }
  };

  // Determine if we should show the hero layout (larger sizes)
  const showHeroLayout = size >= 64;
  const heroHeight = Math.max(32, Math.round(size * 0.5));
  const heroImage = profile?.hero_image_url;
  
  // Make avatar bigger - minimum 56px for activity feed items
  const actualSize = Math.max(56, size);

  return (
    <div className={cn('min-w-0', className)} data-user-id={userId}>
      {showHeroLayout ? (
        <div className="relative">
          {/* Mini Hero Banner - smaller */}
          <div 
            className="w-full rounded-t-lg overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600"
            style={{ height: `${heroHeight}px` }}
          >
            <img 
              src={heroImage || DEFAULT_HERO_IMAGE} 
              alt="Profile Hero" 
              className="w-full h-full object-cover hero-image"
              data-no-filter="true"
              style={{ filter: 'none' }}
            />
          </div>
          
          {/* Avatar and info side by side, avatar at top where data starts */}
          <div className="flex items-start gap-4 px-3 pt-3">
            <div className="relative cursor-pointer shrink-0" onClick={handleAvatarClick}>
              <RankedAvatar
                src={avatar || profile?.avatar_url}
                name={displayName}
                size={actualSize}
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
              <div className="min-w-0 flex-1 pt-1">
                {showName && (
                  <div className="flex items-center gap-1 min-w-0">
                    <div 
                      className="text-base font-semibold truncate text-slate-900 dark:text-white cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      onClick={handleNameClick}
                    >
                      {displayName}
                    </div>
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
                {sa && (
                  <div className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                    SA#{sa}
                  </div>
                )}
                {showHandle && handle && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    @{handle}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 relative">
        <div className="relative cursor-pointer shrink-0" onClick={handleAvatarClick}>
          <RankedAvatar
            src={avatar || profile?.avatar_url}
            name={displayName}
            size={actualSize}
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
                <div 
                  className="text-sm font-medium truncate text-slate-900 dark:text-white cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  onClick={handleNameClick}
                >
                  {displayName}
                </div>
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
              {sa && (
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  SA#{sa}
                </div>
              )}
              {showHandle && handle && (
                <div className="text-xs text-slate-500 truncate">
                  @{handle}
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
                  {roles?.slice(0, 4).map((r) => (
                    <Badge key={r.id} variant="secondary" className="h-5 text-[10px] capitalize">
                      {ROLE_LABELS[r.role_code] || r.role_code?.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {roles?.length > 4 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="h-5 text-[10px] cursor-help">
                          +{roles.length - 4} more
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {roles.slice(4).map((r) => (
                            <span key={r.id} className="text-xs capitalize">
                              {ROLE_LABELS[r.role_code] || r.role_code?.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
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
              {/* Birth Card & Sun Card with tooltips */}
              {(profile?.birth_card || profile?.sun_card) && (
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  {profile?.birth_card && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 dark:text-slate-400">Birth:</span>
                      <DestinyCardTooltip card={profile.birth_card} className="text-slate-900 dark:text-white font-medium" />
                    </div>
                  )}
                  {profile?.sun_card && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 dark:text-slate-400">Sun:</span>
                      <DestinyCardTooltip card={profile.sun_card} className="text-slate-900 dark:text-white font-medium" />
                    </div>
                  )}
                </div>
              )}
              {miniBadges?.length > 0 && (
                <div className="mt-1">
                  <BadgesBar badges={miniBadges} max={4} defaultIfEmpty={false} />
                </div>
              )}
              {showTipButton && userId && (
                <div className="mt-2">
                  <TipButton
                    toUserId={userId}
                    toUserName={displayName}
                    variant="icon"
                    className="h-7 w-7"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}