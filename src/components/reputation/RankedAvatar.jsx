import React, { useState } from 'react';
import { Sparkles, Image, Shield, Award } from 'lucide-react';
import { getRPRank } from '@/components/reputation/rpUtils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PhotoViewer from '@/components/profile/PhotoViewer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AffiliateBadge, getAffiliateTier } from '@/components/reputation/affiliateBadges';
import { RANK_BADGE_IMAGES } from '@/components/reputation/rankBadges';
import { QUEST_BADGE_IMAGES } from '@/components/badges/badgesData';
import { HERO_IMAGES } from '@/components/hud/HeroImageData';

// Hero image URLs to exclude from personal photo galleries
const HERO_IMAGE_URLS = new Set(HERO_IMAGES.map(h => h.url));

// Rank titles for tooltips
const RANK_TITLES = {
  seeker: 'Seeker',
  initiate: 'Initiate',
  adept: 'Adept',
  practitioner: 'Practitioner',
  master: 'Master',
  sage: 'Sage',
  oracle: 'Oracle',
  ascended: 'Ascended',
  guardian: 'Guardian',
};

function getRingConfig(rankCode = 'seeker') {
  const map = {
    seeker: { grad: ['#6b7280', '#9ca3af'], pad: 2 }, // slate gray
    initiate: { grad: ['#60a5fa', '#93c5fd'], pad: 2.5 }, // blue
    adept: { grad: ['#34d399', '#6ee7b7'], pad: 3 }, // green-emerald
    practitioner: { grad: ['#10b981', '#34d399'], pad: 3.5 }, // emerald-teal
    master: { grad: ['#f59e0b', '#fbbf24'], pad: 4 }, // amber-gold
    sage: { grad: ['#8b5cf6', '#a78bfa'], pad: 4.5 }, // violet-purple
    oracle: { grad: ['#6366f1', '#818cf8'], pad: 5 }, // indigo-purple
    ascended: { grad: ['#fde68a', '#fef3c7'], pad: 5.5 }, // gold-ivory
    guardian: { grad: ['#f59e0b', '#fcd34d'], pad: 6 }, // amber-yellow (matches Guardian badge)
  };
  return map[rankCode] || map.seeker;
}

// Default avatar - purple silhouette
const DEFAULT_AVATAR = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/7ede07682_12563.jpg';


export default function RankedAvatar({
  src,
  name,
  size = 96,
  leaderTier,
  rpRankCode,
  rpPoints,
  trustScore,
  userId,
  className = '',
  status,
  statusMessage,
  showPhotoIcon = false,
  galleryImages = [],
  affiliatePaidCount,
  saNumber,

}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Always call useQuery unconditionally to avoid hook order issues
  // The enabled flag controls whether it actually fetches
  // IMPORTANT: Only fetch if we DON'T have the src prop - prevents overriding passed avatar
  const needsFetch = !!userId && !src && (rpRankCode == null || leaderTier == null || rpPoints == null || showPhotoIcon || affiliatePaidCount == null || saNumber == null);
  const { data: fetched = [] } = useQuery({
    queryKey: ['rankedAvatarProfile', userId || 'none'],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await base44.entities.UserProfile.filter({ user_id: userId });
      } catch (err) {
        console.warn('RankedAvatar profile fetch error:', err?.message);
        return []; // Return empty on error to prevent crashes
      }
    },
    enabled: needsFetch,
    staleTime: 300000, // 5 minutes - reduce API calls
    gcTime: 600000, // 10 minutes cache
    retry: false, // Don't retry on rate limit
  });
  const fetchedProfile = fetched?.[0];
  
  // Fetch affiliate stats for affiliate badge
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCodeForAvatar', userId || 'none'],
    queryFn: async () => {
      try {
        return await base44.entities.AffiliateCode.filter({ user_id: userId });
      } catch (err) {
        console.warn('RankedAvatar affiliate fetch error:', err?.message);
        return [];
      }
    },
    enabled: !!userId && affiliatePaidCount == null,
    staleTime: 300000,
    gcTime: 600000,
    retry: false,
  });
  const affiliateCode = affiliateCodes?.[0];
  const affiliatePaidFinal = affiliatePaidCount ?? affiliateCode?.total_paid ?? 0;
  const affiliateTier = getAffiliateTier(affiliatePaidFinal);
  
  // Combine gallery images - use fetched profile gallery if available
  const fetchedGallery = fetchedProfile?.gallery_images || [];
  const propsGallery = galleryImages || [];
  const combinedGallery = fetchedGallery.length > 0 ? fetchedGallery : propsGallery;
  
  // Debug: Log avatar URL sources
  const avatarUrl = src || fetchedProfile?.avatar_url;
  // Only use default if no avatar URL provided - never override a valid URL
  const finalAvatarUrl = (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '' && avatarUrl !== 'null' && avatarUrl !== 'undefined') 
    ? avatarUrl 
    : DEFAULT_AVATAR;
  
  // Debug logging for avatar issues
  if (typeof window !== 'undefined' && window.location.pathname.includes('CommandDeck')) {
    console.log('RankedAvatar debug:', { 
      srcProp: src, 
      fetchedAvatar: fetchedProfile?.avatar_url, 
      finalAvatarUrl,
      userId,
      needsFetch
    });
  }
  // Filter out hero images from personal gallery
  const allImages = [finalAvatarUrl, ...combinedGallery]
    .filter(url => url && !HERO_IMAGE_URLS.has(url))
    .slice(0, 6);

  const leaderTierFinal = leaderTier ?? fetchedProfile?.leader_tier;
  const rpPointsFinal = rpPoints ?? fetchedProfile?.rp_points;
  const rpRankCodeFinal = rpRankCode ?? fetchedProfile?.rp_rank_code ?? (getRPRank(rpPointsFinal || 0)?.code || 'seeker');
  const trustScoreFinal = trustScore ?? fetchedProfile?.trust_score ?? 0;
  const rpInfo = getRPRank(rpPointsFinal || 0);
  const statusMessageFinal = statusMessage ?? fetchedProfile?.status_message;
  const saNumberFinal = saNumber ?? fetchedProfile?.sa_number;
  const mysticalIdImage = fetchedProfile?.mystical_id_image;

  // Fetch user badges for sigil display - try email first, then SA#
  const { data: userBadges = [] } = useQuery({
    queryKey: ['rankedAvatarBadges', userId || saNumberFinal || 'none'],
    queryFn: async () => {
      try {
        // Try email (userId) first since badges are stored with email
        let results = await base44.entities.Badge.filter({ user_id: userId, status: 'active' }, '-created_date', 20);
        // If no results and we have SA#, try with SA#
        if ((!results || results.length === 0) && saNumberFinal && saNumberFinal !== userId) {
          results = await base44.entities.Badge.filter({ user_id: saNumberFinal, status: 'active' }, '-created_date', 20);
        }
        return results || [];
      } catch (err) {
        console.warn('RankedAvatar badges fetch error:', err?.message);
        return [];
      }
    },
    enabled: !!(userId || saNumberFinal),
    staleTime: 300000,
    gcTime: 600000,
    retry: false,
  });

  // Determine which sigils to show
  // Trust shield only shows at 100% trust (perfect score badge)
  const showTrustSigil = trustScoreFinal >= 100;
  // Affiliate badge always shows (bronze tier for new users)
  const showAffiliateBadge = true;

  // Presence indicator mapping
  const STATUS_STYLES = {
    online: 'bg-emerald-500',
    focus: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-slate-400',
  };
  const STATUS_LABELS = {
    online: 'Online',
    focus: 'Focus Mode',
    dnd: 'Do Not Disturb',
    offline: 'Offline',
  };
  const statusFinal = status ?? fetchedProfile?.status ?? 'online';

  const cfg = getRingConfig(rpRankCodeFinal);
  const basePad = cfg.pad; // thickness tuned for 96px
  const padPx = Math.max(2, Math.round((basePad / 96) * size));
  const gradient = `linear-gradient(135deg, ${cfg.grad[0]}, ${cfg.grad[1]})`;
  // Overlay sizes scale with avatar size
  const symbolPx = Math.max(10, Math.round(size * 0.18));
  const rankIconSize = Math.max(8, Math.round(symbolPx * 0.65));
  const statusPx = Math.max(6, Math.round(size * 0.18));
  const statusBorder = Math.max(1, Math.round(size * 0.03));
  const leaderPx = Math.max(12, Math.round(size * 0.26));
  const leaderIconPx = Math.max(8, Math.round(leaderPx * 0.55));

  // Trust sigil size
  const trustPx = Math.max(14, Math.round(size * 0.22));
  const trustIconPx = Math.max(8, Math.round(trustPx * 0.55));

  const rankTitle = RANK_TITLES[rpRankCodeFinal] || 'Seeker';

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Main Avatar with Rank Ring */}
      <div
        className="rounded-full"
        style={{ padding: padPx, background: gradient }}
      >
        {/* Inner ring: white bg */}
        <div className="rounded-full bg-white dark:bg-[#050505] p-1 relative">
          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600">
            {finalAvatarUrl ? (
              <img 
                src={finalAvatarUrl} 
                alt={name || 'Avatar'} 
                className="w-full h-full object-cover"
                style={{ filter: 'none' }}
                data-no-filter="true"
                onError={(e) => {
                  // Hide the broken image - fallback will show
                  e.target.style.display = 'none';
                  e.target.nextSibling?.classList?.remove('hidden');
                }}
              />
            ) : null}
            {/* Fallback initial - hidden when image loads successfully */}
            <div className={`absolute inset-0 flex items-center justify-center ${finalAvatarUrl ? 'hidden' : ''}`}>
              <span 
                className="text-white font-bold select-none" 
                style={{ fontSize: `${size * 0.35}px` }}
              >
                {name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rank badge top-left with tooltip - positioned to touch avatar circle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="absolute flex items-center justify-center cursor-help z-20 hover:scale-110 transition-transform drop-shadow-lg" 
              style={{ 
                width: symbolPx * 2, 
                height: symbolPx * 2,
                top: 0,
                left: 0,
                transform: 'translate(-30%, -30%)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={RANK_BADGE_IMAGES[rpRankCodeFinal] || RANK_BADGE_IMAGES.seeker} 
                alt={rankTitle} 
                className="object-contain"
                style={{ width: symbolPx * 2, height: symbolPx * 2, filter: 'none' }}
                data-no-filter="true"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] z-[9999]">
            <p className="font-semibold text-sm capitalize">{rankTitle}</p>
            <p className="text-xs text-slate-500">{rpPointsFinal || 0} RP</p>
            {rpInfo?.nextTitle && (
              <p className="text-xs text-violet-500">{rpInfo.nextMin - (rpPointsFinal || 0)} to {rpInfo.nextTitle}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Status dot (bottom-left) with tooltip - positioned to touch avatar circle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute rounded-full cursor-help z-20 hover:scale-110 transition-transform ${STATUS_STYLES[statusFinal] || STATUS_STYLES.online}`}
              style={{ 
                width: statusPx, 
                height: statusPx, 
                borderWidth: statusBorder, 
                borderColor: '#ffffff', 
                borderStyle: 'solid',
                bottom: 7,
                left: 10,
                transform: 'translate(-50%, 50%)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px] z-[9999]">
            <p className="font-medium text-sm">{STATUS_LABELS[statusFinal] || 'Online'}</p>
            {statusMessageFinal && (
              <p className="text-xs text-slate-500 mt-0.5">{statusMessageFinal}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 144K Leader Badge - positioned to touch avatar circle */}
      {leaderTierFinal === 'verified144k' && (
        <div 
          className="absolute rounded-full bg-amber-400 flex items-center justify-center shadow-md cursor-help z-20 hover:scale-110 transition-transform" 
          style={{ 
            width: leaderPx, 
            height: leaderPx, 
            borderWidth: statusBorder, 
            borderColor: '#ffffff', 
            borderStyle: 'solid',
            bottom: 0,
            right: 0,
            transform: 'translate(25%, 25%)'
          }}
          onClick={(e) => e.stopPropagation()}
          title="144K Sovereign Agent - Verified community node with leadership privileges"
        >
          <Sparkles style={{ width: leaderIconPx, height: leaderIconPx }} className="text-white" />
        </div>
      )}

      {/* Trust Sigil (top-right) - positioned to touch avatar circle */}
      {showTrustSigil && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="absolute rounded-full bg-emerald-500 flex items-center justify-center shadow-md cursor-help z-20 hover:scale-110 transition-transform" 
                style={{ 
                  width: trustPx, 
                  height: trustPx, 
                  border: '2px solid white',
                  top: 0,
                  right: 0,
                  transform: 'translate(25%, -25%)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Shield style={{ width: trustIconPx, height: trustIconPx }} className="text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] z-[9999]">
              <p className="font-semibold text-sm">Trust Score</p>
              <p className="text-xs text-slate-500">{trustScoreFinal}% verified</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Affiliate Badge (adjusts position vertically if Trust is present) */}
      {showAffiliateBadge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="absolute flex items-center justify-center cursor-help z-20 hover:scale-110 transition-transform drop-shadow-lg" 
                style={{ 
                  width: symbolPx * 2, 
                  height: symbolPx * 2,
                  top: showTrustSigil ? '20%' : 0,
                  right: showTrustSigil ? '-5%' : 0,
                  transform: 'translate(30%, -30%)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <AffiliateBadge tier={affiliateTier} size={symbolPx * 2} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] z-[9999]">
              <p className="font-semibold text-sm capitalize">{affiliateTier} Affiliate</p>
              <p className="text-xs text-slate-500">{affiliatePaidFinal} paid referrals</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Earned Badge Sigils - row below avatar - only show badges that have images */}
      {(() => {
        // Filter to badges that have an image (either icon_url or in QUEST_BADGE_IMAGES)
        const badgesWithImages = userBadges.filter((badge) => {
          const badgeCode = badge.badge_code || badge.code || '';
          return badge.icon_url || QUEST_BADGE_IMAGES[badgeCode] || QUEST_BADGE_IMAGES[badgeCode?.toLowerCase?.()];
        }).slice(0, 3);
        
        if (badgesWithImages.length === 0 || size < 64) return null;
        
        return (
          <div 
            className="absolute flex items-center justify-center gap-0.5 z-10"
            style={{
              bottom: -Math.round(symbolPx * 0.8),
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            {badgesWithImages.map((badge) => {
              const badgeCode = badge.badge_code || badge.code || '';
              const badgeImageUrl = badge.icon_url || QUEST_BADGE_IMAGES[badgeCode] || QUEST_BADGE_IMAGES[badgeCode?.toLowerCase?.()];
              const badgeName = badge.badge_name || badgeCode?.replace?.(/_/g, ' ') || 'Badge';
              
              return (
                <TooltipProvider key={badge.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className="cursor-help hover:scale-110 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img 
                          src={badgeImageUrl} 
                          alt={badgeName} 
                          className="object-contain drop-shadow-md"
                          style={{ width: symbolPx * 1.2, height: symbolPx * 1.2, filter: 'none' }}
                          data-no-filter="true"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px] z-[9999]">
                      <p className="font-semibold text-sm capitalize">{badgeName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        );
      })()}



      {/* Photo gallery icon (bottom-center) - positioned to touch avatar circle */}
      {showPhotoIcon && (allImages.length > 0 || needsFetch) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (allImages.length > 0) {
              setViewerOpen(true);
            }
          }}
          className="absolute rounded-full bg-white/90 hover:bg-white hover:scale-110 flex items-center justify-center shadow-md transition-all cursor-pointer z-20"
          style={{ 
            width: symbolPx, 
            height: symbolPx, 
            border: '1px solid rgba(0,0,0,0.1)',
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, 40%)'
          }}
          title={`View Photos (${allImages.length})`}
        >
          <Image style={{ width: rankIconSize, height: rankIconSize }} className="text-slate-600" />
        </button>
      )}

      {/* Photo Viewer Modal - always render to keep hooks consistent */}
      <PhotoViewer
        open={viewerOpen}
        images={allImages}
        startIndex={0}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}