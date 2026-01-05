import React, { useState } from 'react';
import { Sparkles, Image, Shield } from 'lucide-react';
import { getRPRank } from '@/components/reputation/rpUtils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PhotoViewer from '@/components/profile/PhotoViewer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getRingConfig(rankCode = 'seeker') {
  const map = {
    seeker: { grad: ['#6b7280', '#b45309'], pad: 2 }, // graphite → soft bronze
    initiate: { grad: ['#64748b', '#60a5fa'], pad: 2.5 }, // steel blue
    adept: { grad: ['#60a5fa', '#cbd5e1'], pad: 3 }, // blue-silver
    practitioner: { grad: ['#10b981', '#e5e7eb'], pad: 3.5 }, // emerald-platinum
    master: { grad: ['#f59e0b', '#fafaf9'], pad: 4 }, // deep gold-ivory
    sage: { grad: ['#7c3aed', '#f59e0b'], pad: 4.5 }, // violet-antique gold
    oracle: { grad: ['#4338ca', '#fde68a'], pad: 5 }, // indigo-gold accent
    ascended: { grad: ['#fafaf9', '#fde68a'], pad: 5.5 }, // white-gold
    guardian: { grad: ['#111827', '#d1d5db'], pad: 6 }, // obsidian-platinum
  };
  return map[rankCode] || map.seeker;
}

function RankSymbol({ code = 'seeker', size = 12, color = '#ffffff' }) {
  const s = Math.max(10, size);
  const cx = 8, cy = 8;
  switch (code) {
    case 'seeker':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="3" fill={color} />
        </svg>
      );
    case 'initiate':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 8h12a6 6 0 0 0-12 0Z" fill={color} />
        </svg>
      );
    case 'adept':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8,2 14,14 2,14" fill={color} />
        </svg>
      );
    case 'practitioner':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8,2 14,8 8,14 2,8" fill={color} />
        </svg>
      );
    case 'master':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8,2 13.5,5 13.5,11 8,14 2.5,11 2.5,5" fill={color} />
        </svg>
      );
    case 'sage':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
            <line x1="8" y1="2.5" x2="8" y2="13.5" />
            <line x1="3.2" y1="6" x2="12.8" y2="10" />
            <line x1="12.8" y1="6" x2="3.2" y2="10" />
          </g>
        </svg>
      );
    case 'oracle':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="5.5" stroke={color} strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r="2.2" fill={color} />
        </svg>
      );
    case 'ascended':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="5.5" stroke={color} strokeWidth="1.2" />
          <circle cx={cx} cy={cy} r="2.2" fill={color} />
        </svg>
      );
    case 'guardian':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2c2 .9 4 1.4 6 2v4c0 3-3 5.5-6 6-3-.5-6-3-6-6V4c2-.6 4-1.1 6-2Z" fill={color} />
        </svg>
      );
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx={cx} cy={cy} r="3" fill={color} />
        </svg>
      );
  }
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
  showPhotoIcon = false,
  galleryImages = [],
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  
  // Always fetch profile when showPhotoIcon is true to get gallery images
  const needsFetch = !!userId && (rpRankCode == null || leaderTier == null || rpPoints == null || showPhotoIcon);
  const { data: fetched = [] } = useQuery({
    queryKey: ['rankedAvatarProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!needsFetch,
  });
  const fetchedProfile = fetched?.[0];
  
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

  // Presence indicator mapping
  const STATUS_STYLES = {
    online: 'bg-emerald-500',
    focus: 'bg-amber-500',
    dnd: 'bg-rose-500',
    offline: 'bg-slate-400',
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

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`relative ${className}`} style={{ width: size, height: size }} data-user-id={userId}>
        {/* Rank Ring with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="rounded-full cursor-help"
              style={{ padding: padPx, background: gradient }}
            >
              <div className="rounded-full bg-white p-1 relative">
                {/* Rank symbol top-left with Tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="absolute -top-1 -left-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow cursor-help z-20 hover:scale-110 transition-transform" 
                      style={{ width: symbolPx, height: symbolPx, border: '1px solid rgba(255,255,255,0.6)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RankSymbol code={rpRankCodeFinal} size={rankIconSize} color="#ffffff" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-white text-xs px-3 py-2 max-w-[200px]">
                    <p className="font-semibold capitalize">{rpInfo?.title || rpRankCodeFinal}</p>
                    <p className="text-slate-300">{rpPointsFinal || 0} Rank Points</p>
                    {rpInfo?.nextTitle && (
                      <p className="text-slate-400 text-[10px] mt-1">
                        {rpInfo.nextMin - (rpPointsFinal || 0)} RP to {rpInfo.nextTitle}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
                
                <div className="w-full h-full rounded-full overflow-hidden">
                  {src ? (
                    <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-violet-600">{(name || 'U').slice(0, 1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs px-3 py-2">
            <p>Rank Ring: <span className="capitalize font-semibold">{rpInfo?.title || rpRankCodeFinal}</span></p>
          </TooltipContent>
        </Tooltip>

        {/* Status dot (bottom-left) with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute -bottom-1 -left-1 rounded-full cursor-help z-20 hover:scale-110 transition-transform ${STATUS_STYLES[statusFinal] || STATUS_STYLES.online}`}
              style={{ width: statusPx, height: statusPx, borderWidth: statusBorder, borderColor: '#ffffff', borderStyle: 'solid' }}
              onClick={(e) => e.stopPropagation()}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs px-3 py-2">
            <p>Status: <span className="capitalize font-semibold">{statusFinal || 'online'}</span></p>
          </TooltipContent>
        </Tooltip>

        {/* 144K Leader Badge with Tooltip */}
        {leaderTierFinal === 'verified144k' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 flex items-center justify-center shadow-md cursor-help z-20 hover:scale-110 transition-transform" 
                style={{ width: leaderPx, height: leaderPx, borderWidth: statusBorder, borderColor: '#ffffff', borderStyle: 'solid' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Sparkles style={{ width: leaderIconPx, height: leaderIconPx }} className="text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-amber-900 text-amber-100 text-xs px-3 py-2 max-w-[200px]">
              <p className="font-semibold">144K Sovereign Agent</p>
              <p className="text-amber-200 text-[10px]">Verified community node with leadership privileges</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Trust Sigil (top-right, opposite of rank) - only show if not showing photo icon */}
        {!showPhotoIcon && trustScoreFinal > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="absolute -top-1 -right-1 rounded-full bg-emerald-500 flex items-center justify-center shadow-md cursor-help z-20 hover:scale-110 transition-transform" 
                style={{ width: trustPx, height: trustPx, border: '2px solid white' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Shield style={{ width: trustIconPx, height: trustIconPx }} className="text-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-emerald-900 text-emerald-100 text-xs px-3 py-2 max-w-[220px]">
              <p className="font-semibold">Trust Score: {trustScoreFinal}%</p>
              <p className="text-emerald-200 text-[10px]">Verified through community interactions, testimonials, and collaborations</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Photo gallery icon (top-right) - show if we have images or are still loading */}
        {showPhotoIcon && (allImages.length > 0 || needsFetch) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (allImages.length > 0) {
                    setViewerOpen(true);
                  }
                }}
                className="absolute -top-1 -right-1 rounded-full bg-white/90 hover:bg-white hover:scale-110 flex items-center justify-center shadow-md transition-all cursor-pointer z-20"
                style={{ width: symbolPx, height: symbolPx, border: '1px solid rgba(0,0,0,0.1)' }}
              >
                <Image style={{ width: rankIconSize, height: rankIconSize }} className="text-slate-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-slate-900 text-white text-xs px-3 py-2">
              <p>View Photos ({allImages.length})</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Photo Viewer Modal */}
        {showPhotoIcon && (
          <PhotoViewer
            open={viewerOpen}
            images={allImages}
            startIndex={0}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}