import React from 'react';
import { Sparkles } from 'lucide-react';
import { getRPRank } from '@/components/reputation/rpUtils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

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

export default function RankedAvatar({
  src,
  name,
  size = 96,
  leaderTier,
  rpRankCode,
  rpPoints,
  userId,
  className = '',
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
  const rpRankCodeFinal = rpRankCode ?? fetchedProfile?.rp_rank_code ?? getRPRank(rpPointsFinal || 0)?.code || 'seeker';
  const cfg = getRingConfig(rpRankCodeFinal);
  const basePad = cfg.pad; // thickness tuned for 96px
  const padPx = Math.max(2, Math.round((basePad / 96) * size));
  const gradient = `linear-gradient(135deg, ${cfg.grad[0]}, ${cfg.grad[1]})`;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} data-user-id={userId}>
      <div
        className="rounded-full"
        style={{ padding: padPx, background: gradient }}
      >
        <div className="rounded-full bg-white p-1">
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

      {leaderTierFinal === 'verified144k' && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </div>
      )}
    </div>
  );
}