import React, { useState } from 'react';
import { Sparkles, Image } from 'lucide-react';
import { getRPRank } from '@/components/reputation/rpUtils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PhotoViewer from '@/components/profile/PhotoViewer';

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
  userId,
  className = '',
  status,
}) {
  const needsFetch = !!userId && (rpRankCode == null || leaderTier == null || rpPoints == null);
  const { data: fetched = [] } = useQuery({
    queryKey: ['rankedAvatarProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!needsFetch,
  });
  const fetchedProfile = fetched?.[0];

  const leaderTierFinal = leaderTier ?? fetchedProfile?.leader_tier;
  const rpPointsFinal = rpPoints ?? fetchedProfile?.rp_points;
  const rpRankCodeFinal = rpRankCode ?? fetchedProfile?.rp_rank_code ?? (getRPRank(rpPointsFinal || 0)?.code || 'seeker');

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

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} data-user-id={userId}>
      <div
        className="rounded-full"
        style={{ padding: padPx, background: gradient }}
      >
        <div className="rounded-full bg-white p-1 relative">
          {/* Rank symbol top-left */}
          <div className="absolute -top-1 -left-1 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center shadow" style={{ width: symbolPx, height: symbolPx, border: '1px solid rgba(255,255,255,0.6)' }}>
            <RankSymbol code={rpRankCodeFinal} size={rankIconSize} color="#ffffff" />
          </div>
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

      {/* Status dot (bottom-left) */}
                  <div
                    className={`absolute -bottom-1 -left-1 rounded-full ${STATUS_STYLES[statusFinal] || STATUS_STYLES.online}`}
                    style={{ width: statusPx, height: statusPx, borderWidth: statusBorder, borderColor: '#ffffff', borderStyle: 'solid' }}
                    title={statusFinal || 'online'}
                  />

                  {leaderTierFinal === 'verified144k' && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 flex items-center justify-center shadow-md" style={{ width: leaderPx, height: leaderPx, borderWidth: statusBorder, borderColor: '#ffffff', borderStyle: 'solid' }}>
                      <Sparkles style={{ width: leaderIconPx, height: leaderIconPx }} className="text-white" />
                    </div>
                  )}
    </div>
  );
}