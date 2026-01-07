import React, { useState } from 'react';
import { Sparkles, Image, Shield } from 'lucide-react';
import { getRPRank } from '@/components/reputation/rpUtils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PhotoViewer from '@/components/profile/PhotoViewer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AffiliateBadge, getAffiliateTier } from '@/components/reputation/affiliateBadges';
import { RANK_BADGE_IMAGES } from '@/components/reputation/rankBadges';

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
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Always call useQuery unconditionally to avoid hook order issues
  // The enabled flag controls whether it actually fetches
  const needsFetch = !!userId && (rpRankCode == null || leaderTier == null || rpPoints == null || showPhotoIcon || affiliatePaidCount == null);
  const { data: fetched = [] } = useQuery({
    queryKey: ['rankedAvatarProfile', userId || 'none'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: needsFetch,
  });
  const fetchedProfile = fetched?.[0];
  
  // Fetch affiliate stats for affiliate badge
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCodeForAvatar', userId || 'none'],
    queryFn: () => base44.entities.AffiliateCode.filter({ user_id: userId }),
    enabled: !!userId && affiliatePaidCount == null,
  });
  const affiliateCode = affiliateCodes?.[0];
  const affiliatePaidFinal = affiliatePaidCount ?? affiliateCode?.total_paid ?? 0;
  const affiliateTier = getAffiliateTier(affiliatePaidFinal);
  
  // Combine gallery images - use fetched profile gallery if available
  const fetchedGallery = fetchedProfile?.gallery_images || [];
  const propsGallery = galleryImages || [];
  const combinedGallery = fetchedGallery.length > 0 ? fetchedGallery : propsGallery;
  const avatarUrl = src || fetchedProfile?.avatar_url;
  const allImages = [avatarUrl, ...combinedGallery].filter(Boolean).slice(0, 6);

  const leaderTierFinal = leaderTier ?? fetchedProfile?.leader_tier;
  const rpPointsFinal = rpPoints ?? fetchedProfile?.rp_points;
  const rpRankCodeFinal = rpRankCode ?? fetchedProfile?.rp_rank_code ?? (getRPRank(rpPointsFinal || 0)?.code || 'seeker');
  const trustScoreFinal = trustScore ?? fetchedProfile?.trust_score ?? 0;
  const rpInfo = getRPRank(rpPointsFinal || 0);
  const statusMessageFinal = statusMessage ?? fetchedProfile?.status_message;

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
    <div className={`relative ${className}`} style={{ width: size, height: size }} data-user-id={userId}>
      {/* Main Avatar with Rank Ring */}
      <div
        className="rounded-full"
        style={{ padding: padPx, background: gradient }}
      >
        {/* Inner ring: white bg */}
        <div className="rounded-full bg-white dark:bg-[#050505] p-1 relative">
          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#050505]">
            <img 
                  src={src || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e09de6616_DALLE2024-06-03003136-Adetailedandhigh-resolutioncoindesignfortheGaiaGlobalTreasuryThecoinfeaturesagoldensurfacewithatreeinthecentersymbolizinggro_inPixio.png'} 
                  alt={name || 'Avatar'} 
                  className="w-full h-full object-cover"
                  style={{ filter: 'none' }}
                  data-no-filter="true"
                />
          </div>
        </div>
      </div>

      {/* Rank badge top-left with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="absolute -top-2 -left-2 flex items-center justify-center cursor-help z-20 hover:scale-110 transition-transform drop-shadow-lg" 
              style={{ width: symbolPx * 2, height: symbolPx * 2 }}
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

      {/* Status dot (bottom-left) with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute -bottom-1 -left-1 rounded-full cursor-help z-20 hover:scale-110 transition-transform ${STATUS_STYLES[statusFinal] || STATUS_STYLES.online}`}
              style={{ width: statusPx, height: statusPx, borderWidth: statusBorder, borderColor: '#ffffff', borderStyle: 'solid' }}
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

      {/* 144K Leader Badge */}
      {leaderTierFinal === 'verified144k' && (
        <div 
          className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 flex items-center justify-center shadow-md cursor-help z-20 hover:scale-110 transition-transform" 
          style={{ width: leaderPx, height: leaderPx, borderWidth: statusBorder, borderColor: '#ffffff', borderStyle: 'solid' }}
          onClick={(e) => e.stopPropagation()}
          title="144K Sovereign Agent - Verified community node with leadership privileges"
        >
          <Sparkles style={{ width: leaderIconPx, height: leaderIconPx }} className="text-white" />
        </div>
      )}

      {/* Trust Sigil (top-right, opposite of rank) - only show if not showing photo icon */}
      {!showPhotoIcon && trustScoreFinal > 0 && (
        <div 
          className="absolute -top-1 -right-1 rounded-full bg-emerald-500 flex items-center justify-center shadow-md cursor-help z-20 hover:scale-110 transition-transform" 
          style={{ width: trustPx, height: trustPx, border: '2px solid white' }}
          onClick={(e) => e.stopPropagation()}
          title={`Trust Score: ${trustScoreFinal}% - Verified through community interactions`}
        >
          <Shield style={{ width: trustIconPx, height: trustIconPx }} className="text-white" />
        </div>
      )}

      {/* Affiliate Badge (top-right) - show SA shield badge with tooltip */}
      {affiliatePaidFinal >= 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="absolute -top-2 -right-2 flex items-center justify-center cursor-help z-20 hover:scale-110 transition-transform drop-shadow-lg" 
                style={{ width: symbolPx * 2, height: symbolPx * 2 }}
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

      {/* Photo gallery icon (bottom-center) - show if we have images or are still loading */}
      {showPhotoIcon && (allImages.length > 0 || needsFetch) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (allImages.length > 0) {
              setViewerOpen(true);
            }
          }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 hover:bg-white hover:scale-110 flex items-center justify-center shadow-md transition-all cursor-pointer z-20"
          style={{ width: symbolPx, height: symbolPx, border: '1px solid rgba(0,0,0,0.1)' }}
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