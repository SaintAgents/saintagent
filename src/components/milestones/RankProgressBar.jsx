import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { RP_LADDER } from '@/components/reputation/rpUtils';
import { Shield, Star, Sparkles, Crown, Flame, Eye, Zap, Sun, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RANK_ICONS = {
  seeker: Eye,
  initiate: Flame,
  adept: Zap,
  practitioner: Shield,
  master: Star,
  sage: Sparkles,
  oracle: Eye,
  ascended: Sun,
  guardian: Crown,
};

const RANK_COLORS = {
  seeker: 'from-slate-400 to-slate-500',
  initiate: 'from-blue-400 to-blue-600',
  adept: 'from-cyan-400 to-teal-600',
  practitioner: 'from-emerald-400 to-green-600',
  master: 'from-violet-400 to-purple-600',
  sage: 'from-amber-400 to-yellow-600',
  oracle: 'from-pink-400 to-rose-600',
  ascended: 'from-orange-400 to-red-500',
  guardian: 'from-yellow-300 to-amber-500',
};

const RANK_BG = {
  seeker: 'bg-slate-100 border-slate-300',
  initiate: 'bg-blue-50 border-blue-300',
  adept: 'bg-cyan-50 border-cyan-300',
  practitioner: 'bg-emerald-50 border-emerald-300',
  master: 'bg-violet-50 border-violet-300',
  sage: 'bg-amber-50 border-amber-300',
  oracle: 'bg-pink-50 border-pink-300',
  ascended: 'bg-orange-50 border-orange-300',
  guardian: 'bg-yellow-50 border-yellow-300',
};

export default function RankProgressBar({ currentRP = 0, onRankClick }) {
  const [hoveredRank, setHoveredRank] = useState(null);
  const maxRP = RP_LADDER[RP_LADDER.length - 1].nextMin;
  const overallPercent = Math.min((currentRP / maxRP) * 100, 100);

  // Find current rank
  const currentRankIdx = RP_LADDER.findIndex((r, i) => {
    const next = RP_LADDER[i + 1];
    if (!next) return true;
    return currentRP < next.min;
  });

  return (
    <div className="space-y-4">
      {/* Overall progress bar */}
      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-emerald-500 to-amber-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${overallPercent}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Rank markers */}
        {RP_LADDER.map((rank, i) => {
          const pos = (rank.min / maxRP) * 100;
          const isUnlocked = currentRP >= rank.min;
          return (
            <div
              key={rank.code}
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ left: `${pos}%` }}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded-full border-2 cursor-pointer transition-transform hover:scale-150",
                  isUnlocked
                    ? "bg-white border-violet-500 shadow-sm"
                    : "bg-slate-300 border-slate-400"
                )}
                onMouseEnter={() => setHoveredRank(rank.code)}
                onMouseLeave={() => setHoveredRank(null)}
                onClick={() => onRankClick?.(rank)}
              />
            </div>
          );
        })}
      </div>

      {/* Rank cards row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {RP_LADDER.map((rank, i) => {
          const Icon = RANK_ICONS[rank.code] || Shield;
          const isUnlocked = currentRP >= rank.min;
          const isCurrent = i === currentRankIdx;
          const progressInRank = isCurrent
            ? Math.min(((currentRP - rank.min) / (rank.nextMin - rank.min)) * 100, 100)
            : isUnlocked ? 100 : 0;

          return (
            <motion.div
              key={rank.code}
              whileHover={{ scale: 1.05, y: -2 }}
              onClick={() => onRankClick?.(rank)}
              className={cn(
                "relative rounded-xl p-3 text-center cursor-pointer border-2 transition-all",
                isCurrent
                  ? "ring-2 ring-violet-400 shadow-lg " + RANK_BG[rank.code]
                  : isUnlocked
                    ? RANK_BG[rank.code]
                    : "bg-slate-50 border-slate-200 opacity-60"
              )}
            >
              {!isUnlocked && (
                <Lock className="absolute top-1 right-1 w-3 h-3 text-slate-400" />
              )}
              <div className={cn(
                "w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1.5",
                isUnlocked
                  ? `bg-gradient-to-br ${RANK_COLORS[rank.code]} text-white shadow-md`
                  : "bg-slate-200 text-slate-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <p className={cn("text-xs font-bold", isUnlocked ? "text-slate-800" : "text-slate-400")}>
                {rank.title}
              </p>
              <p className="text-[10px] text-slate-500">{rank.min} RP</p>
              {/* Mini progress in current rank */}
              {isCurrent && (
                <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${RANK_COLORS[rank.code]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressInRank}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}