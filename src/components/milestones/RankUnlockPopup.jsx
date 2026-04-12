import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Star, Sparkles, Crown, Flame, Eye, Zap, Sun, TrendingUp, Check, Lock } from 'lucide-react';
import { RP_LADDER } from '@/components/reputation/rpUtils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const RANK_ICONS = {
  seeker: Eye, initiate: Flame, adept: Zap, practitioner: Shield,
  master: Star, sage: Sparkles, oracle: Eye, ascended: Sun, guardian: Crown,
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

const RANK_DESCRIPTIONS = {
  seeker: 'You have begun your journey. Explore the platform, connect with others, and start building your presence.',
  initiate: 'You are now recognized as an active participant. Your contributions are beginning to make a difference.',
  adept: 'Your skills and reputation are growing. You are becoming a valued member of the community.',
  practitioner: 'A seasoned contributor with proven abilities. Others look to you for guidance and collaboration.',
  master: 'True mastery achieved. Your influence shapes the community and inspires others to grow.',
  sage: 'Deep wisdom and sustained service. You are a pillar of knowledge and trust in the network.',
  oracle: 'Visionary insight and transformative leadership. Your presence elevates everyone around you.',
  ascended: 'Transcendent impact. You have achieved extraordinary levels of service, trust, and community building.',
  guardian: 'The highest honor. You are a guardian of the community\'s mission, values, and future.',
};

export default function RankUnlockPopup({ rank, currentRP = 0, open, onClose }) {
  if (!rank) return null;
  
  const Icon = RANK_ICONS[rank.code] || Shield;
  const isUnlocked = currentRP >= rank.min;
  const rpNeeded = Math.max(0, rank.min - currentRP);
  const rankIdx = RP_LADDER.findIndex(r => r.code === rank.code);
  const prevRank = rankIdx > 0 ? RP_LADDER[rankIdx - 1] : null;
  const nextRank = rankIdx < RP_LADDER.length - 1 ? RP_LADDER[rankIdx + 1] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUnlocked ? <Check className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-slate-400" />}
            {rank.title}
            <Badge className={cn("text-xs", isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg",
              isUnlocked
                ? `bg-gradient-to-br ${RANK_COLORS[rank.code]} text-white`
                : "bg-slate-200 text-slate-400"
            )}
          >
            <Icon className="w-10 h-10" />
          </motion.div>

          {isUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-600">Rank Achieved!</p>
            </motion.div>
          )}

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            {RANK_DESCRIPTIONS[rank.code]}
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Required RP</span>
              <span className="font-bold text-slate-800">{rank.min.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-500">Your RP</span>
              <span className={cn("font-bold", isUnlocked ? "text-emerald-600" : "text-slate-800")}>
                {currentRP.toLocaleString()}
              </span>
            </div>
            {!isUnlocked && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-slate-500">RP Needed</span>
                <span className="font-bold text-amber-600">{rpNeeded.toLocaleString()}</span>
              </div>
            )}
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", isUnlocked ? "bg-emerald-500" : "bg-violet-500")}
                style={{ width: `${Math.min((currentRP / rank.min) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Navigation hints */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>{prevRank ? `← ${prevRank.title} (${prevRank.min} RP)` : ''}</span>
            <span>{nextRank ? `${nextRank.title} (${nextRank.min} RP) →` : '🏆 Max Rank'}</span>
          </div>
        </div>

        <Button onClick={onClose} className="w-full rounded-xl">Close</Button>
      </DialogContent>
    </Dialog>
  );
}