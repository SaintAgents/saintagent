import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Coins,
  TrendingUp,
  Star,
  Zap,
  Shield,
  Award,
  Sparkles,
  Users,
  MessageCircle,
  UserPlus,
  Target,
  Send } from
"lucide-react";

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
  seeker: { label: 'Seeker', color: 'from-slate-400 to-slate-500', glow: '', textColor: 'text-slate-400' }
};

// Badge icons mapping
const BADGE_ICONS = {
  genesis: { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  mentor: { icon: Users, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  builder: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  healer: { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  leader: { icon: Award, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' }
};

export default function ProfileDataSlate({ profile, recentMissions = [], onTagClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rankCode = profile.rp_rank_code || 'seeker';
  const rankConfig = RANK_CONFIG[rankCode] || RANK_CONFIG.seeker;
  const isOnline = profile.status === 'online' || profile.last_seen_at && new Date(profile.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);

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

  const handleMessage = (e) => {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: profile.user_id,
        recipientName: profile.display_name,
        recipientAvatar: profile.avatar_url
      }
    }));
  };

  const handleInvite = (e) => {
    e.stopPropagation();
    // Placeholder for invite to circle functionality
    console.log('Invite to circle:', profile.user_id);
  };

  const handleSkillClick = (e, skill) => {
    e.stopPropagation();
    onTagClick?.(skill);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "group relative bg-white dark:bg-[#0a0a0a] rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        "border-slate-200 dark:border-[rgba(0,255,136,0.15)] hover:border-violet-300 dark:hover:border-[rgba(0,255,136,0.4)]",
        "hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(0,255,136,0.1)]",
        "hover:-translate-y-1"
      )}>

      {/* Rank glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        `bg-gradient-to-br ${rankConfig.color} blur-2xl`
      )} style={{ opacity: 0.05 }} />

      <div className="relative p-4">
        {/* Top Row: Avatar + Name + Rank */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar with rank ring and online indicator */}
          <div className={cn("relative", rankConfig.glow, "dark:shadow-[0_0_15px_rgba(0,255,136,0.4)]")}>
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br p-0.5",
              rankConfig.color,
              "dark:from-[#00ff88] dark:to-[#00d4ff]"
            )}>
              <div className="w-full h-full rounded-full bg-white dark:bg-[#050505]" />
            </div>
            <Avatar className="w-14 h-14 relative border-2 border-transparent">
              <AvatarImage src={profile.avatar_url} className="dark:brightness-100 dark:contrast-100" style={{ filter: 'none' }} />
              <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-[#00ff88]/20 dark:to-[#00d4ff]/20 text-violet-700 dark:text-[#00ff88] font-semibold">
                {profile.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {/* Online status indicator */}
            <div className={cn(
              "absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0a0a0a]",
              isOnline ?
              "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" :
              "bg-slate-400 dark:bg-slate-600"
            )} />
            {/* Rank badge overlay */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              `bg-gradient-to-br ${rankConfig.color} text-white`,
              "border-2 border-white dark:border-[#050505]",
              "dark:bg-gradient-to-br dark:from-[#00ff88] dark:to-[#00d4ff] dark:text-black dark:shadow-[0_0_8px_rgba(0,255,136,0.6)]"
            )}>
              {rankConfig.label.charAt(0)}
            </div>
          </div>

          {/* Name and handle */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate group-hover:text-violet-600 transition-colors" style={{ color: 'var(--profile-name-color, #0f172a)' }}>
              <span className="bg-transparent text-emerald-300 from-green-400 to-emerald-500 dark:bg-none dark:text-[#00ff88]">
                {profile.display_name || 'Anonymous'}
              </span>
            </h3>
            {profile.handle &&
            <p className="text-sm text-slate-500 truncate">
                <span className="dark:text-[#00ff88]/80">@{profile.handle}</span>
              </p>
            }
            <Badge
              variant="outline"
              className={cn(
                "mt-1 text-[10px] px-1.5 py-0 border-0 font-semibold",
                "dark:text-[#00ff88] dark:drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]"
              )}
              style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}>

              <span className="bg-lime-900 text-green-100 from-amber-400 to-yellow-500 dark:bg-none dark:text-[#00ff88]">
                {rankConfig.label}
              </span>
            </Badge>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[rgba(0,255,136,0.05)] dark:border dark:border-[rgba(0,255,136,0.2)]">
            <div className="flex items-center justify-center gap-1 text-amber-500 dark:text-[#00ff88] mb-0.5">
              <Coins className="w-3 h-3" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white dark:drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">
              {(profile.ggg_balance || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-[#00ff88]/70">GGG</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[rgba(0,255,136,0.05)] dark:border dark:border-[rgba(0,255,136,0.2)]">
            <div className="flex items-center justify-center gap-1 text-violet-500 dark:text-[#00ff88] mb-0.5">
              <TrendingUp className="w-3 h-3" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white dark:drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">
              {profile.influence_score || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-[#00ff88]/70">Influence</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-[rgba(0,255,136,0.05)] dark:border dark:border-[rgba(0,255,136,0.2)]">
            <div className="flex items-center justify-center gap-1 text-emerald-500 dark:text-[#00ff88] mb-0.5">
              <Star className="w-3 h-3" />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white dark:drop-shadow-[0_0_4px_rgba(0,255,136,0.5)]">
              {profile.expertise_score || 0}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-[#00ff88]/70">Expertise</p>
          </div>
        </div>

        {/* Badges Row */}
        {badges.length > 0 &&
        <div className="flex items-center gap-1.5 mb-3">
            {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  badge.bg,
                  "dark:bg-[rgba(0,255,136,0.15)] dark:border dark:border-[rgba(0,255,136,0.3)]"
                )}
                title={badge.label}>

                  <Icon className={cn("w-3 h-3", badge.color, "dark:text-[#00ff88]")} />
                </div>);

          })}
            {profile.achievements?.length > 3 &&
          <span className="text-[10px] text-slate-500 dark:text-[#00ff88]/70">
                +{profile.achievements.length - 3}
              </span>
          }
          </div>
        }

        {/* Skills preview - clickable tags */}
        {profile.skills?.length > 0 &&
        <div className="flex flex-wrap gap-1 mb-3">
            {profile.skills.slice(0, 3).map((skill, idx) =>
          <Badge
            key={idx}
            variant="secondary"
            className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer transition-colors"
            onClick={(e) => handleSkillClick(e, skill)}>

                {skill}
              </Badge>
          )}
            {profile.skills.length > 3 &&
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800">
                +{profile.skills.length - 3}
              </Badge>
          }
          </div>
        }

        {/* Expanded content on hover - Bio snippet and recent missions */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        )}>
          {profile.bio &&
          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
              {profile.bio}
            </p>
          }
          {recentMissions?.length > 0 &&
          <div className="space-y-1">
              <p className="text-[9px] text-slate-500 dark:text-slate-500 uppercase font-medium">Recent Missions</p>
              {recentMissions.slice(0, 2).map((m, i) =>
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                  <Target className="w-2.5 h-2.5 text-violet-500" />
                  <span className="truncate">{m.title}</span>
                </div>
            )}
            </div>
          }
        </div>

        {/* Quick action buttons on hover */}
        <div className={cn(
          "flex items-center gap-1.5 mt-2 transition-all duration-300",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] gap-1 border-slate-200 dark:border-slate-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300"
            onClick={handleMessage}>

            <Send className="w-3 h-3" />
            Message
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-[10px] gap-1 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
            onClick={handleInvite}>

            <UserPlus className="w-3 h-3" />
            Invite
          </Button>
        </div>

        {/* Default hover hint when not expanded */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent transition-opacity pointer-events-none flex items-end justify-center pb-4",
          isExpanded ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-[#00ff88] font-medium">
            <MessageCircle className="w-3 h-3" />
            View Profile
          </div>
        </div>
      </div>
    </div>);

}