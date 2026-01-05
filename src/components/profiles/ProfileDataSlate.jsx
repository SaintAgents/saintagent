import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  TrendingUp,
  Star,
  Zap,
  Shield,
  Award,
  Sparkles,
  Users,
  MessageCircle
} from "lucide-react";

// Rank configuration with colors and glows
const RANK_CONFIG = {
  guardian: { label: 'Guardian', color: 'from-amber-400 to-yellow-500', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]', textColor: 'text-amber-500' },
  ascended: { label: 'Ascended', color: 'from-amber-200 to-amber-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.4)]', textColor: 'text-amber-400' },
  oracle: { label: 'Oracle', color: 'from-indigo-400 to-purple-500', glow: 'shadow-[0_0_15px_rgba(129,140,248,0.4)]', textColor: 'text-indigo-400' },
  sage: { label: 'Sage', color: 'from-violet-400 to-purple-500', glow: 'shadow-[0_0_12px_rgba(167,139,250,0.4)]', textColor: 'text-violet-400' },
  master: { label: 'Master', color: 'from-amber-500 to-orange-500', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]', textColor: 'text-amber-500' },
  practitioner: { label: 'Practitioner', color: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]', textColor: 'text-emerald-400' },
  adept: { label: 'Adept', color: 'from-green-400 to-emerald-500', glow: '', textColor: 'text-green-400' },
  initiate: { label: 'Initiate', color: 'from-blue-400 to-cyan-500', glow: '', textColor: 'text-blue-400' },
  seeker: { label: 'Seeker', color: 'from-slate-400 to-slate-500', glow: '', textColor: 'text-slate-400' },
};

// Badge icons mapping
const BADGE_ICONS = {
  genesis: { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  mentor: { icon: Users, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  builder: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  healer: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  leader: { icon: Award, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
};

export default function ProfileDataSlate({ profile }) {
  const rankCode = profile.rp_rank_code || 'seeker';
  const rankConfig = RANK_CONFIG[rankCode] || RANK_CONFIG.seeker;

  // Derive badges from achievements array
  const badges = (profile.achievements || []).slice(0, 3).map((a) => {
    const key = a.toLowerCase();
    for (const [badgeKey, config] of Object.entries(BADGE_ICONS)) {
      if (key.includes(badgeKey)) return { key: badgeKey, ...config, label: a };
    }
    return { key: a, icon: Star, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', label: a };
  });

  const handleClick = () => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: profile.user_id } }));
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative bg-white dark:bg-[#0a0a0a] rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        "border-slate-200 dark:border-[rgba(0,255,136,0.15)] hover:border-violet-300 dark:hover:border-[rgba(0,255,136,0.4)]",
        "hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(0,255,136,0.1)]",
        "hover:-translate-y-1"
      )}
    >
      {/* Rank glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        `bg-gradient-to-br ${rankConfig.color} blur-2xl`
      )} style={{ opacity: 0.05 }} />

      <div className="relative p-4">
        {/* Top Row: Avatar + Name + Rank */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar with rank ring */}
          <div className={cn("relative", rankConfig.glow)}>
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br p-0.5",
              rankConfig.color
            )}>
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0a0a]" />
            </div>
            <Avatar className="w-14 h-14 relative border-2 border-transparent">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 text-violet-700 dark:text-violet-300 font-semibold">
                {profile.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {/* Rank badge overlay */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              `bg-gradient-to-br ${rankConfig.color} text-white`,
              "border-2 border-white dark:border-[#0a0a0a]"
            )}>
              {rankConfig.label.charAt(0)}
            </div>
          </div>

          {/* Name and handle */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-[#00ff88] transition-colors">
              {profile.display_name || 'Anonymous'}
            </h3>
            {profile.handle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">@{profile.handle}</p>
            )}
            <Badge 
              variant="outline" 
              className={cn(
                "mt-1 text-[10px] px-1.5 py-0 border-0",
                `bg-gradient-to-r ${rankConfig.color} bg-clip-text text-transparent font-semibold`
              )}
            >
              {rankConfig.label}
            </Badge>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Coins className="w-3 h-3" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {(profile.ggg_balance || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">GGG</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-center gap-1 text-violet-500 mb-0.5">
              <TrendingUp className="w-3 h-3" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {profile.influence_score || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Influence</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5">
              <Star className="w-3 h-3" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              {profile.expertise_score || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Expertise</p>
          </div>
        </div>

        {/* Badges Row */}
        {badges.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    badge.bg
                  )}
                  title={badge.label}
                >
                  <Icon className={cn("w-3 h-3", badge.color)} />
                </div>
              );
            })}
            {profile.achievements?.length > 3 && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                +{profile.achievements.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Skills preview */}
        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map((skill, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800">
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Hover overlay with action hint */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end justify-center pb-4">
          <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-[#00ff88] font-medium">
            <MessageCircle className="w-3 h-3" />
            View Profile
          </div>
        </div>
      </div>
    </div>
  );
}