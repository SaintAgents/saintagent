import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Trophy, Target, Star, Gift, ChevronRight, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChallengeCard from './ChallengeCard';
import Leaderboard from './Leaderboard';
import MotivationalCard from './MotivationalCard';
import { getRPRank } from '@/components/reputation/rpUtils';
import { RANK_BADGE_IMAGES } from '@/components/reputation/rankBadges';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import GamificationHub from './GamificationHub';

export default function GamificationWidget({ profile, compact = false }) {
  const [hubOpen, setHubOpen] = useState(false);

  const userIdentifier = profile?.sa_number || profile?.user_id;

  // DISABLED to prevent rate limits - challenges show empty state
  const challenges = [];

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const pendingRewards = challenges.filter(c => c.current_count >= c.target_count && c.status === 'active');
  
  const rpPoints = profile?.rank_points || profile?.rp_points || 0;
  const rpInfo = getRPRank(rpPoints);
  const rankProgress = ((rpPoints - rpInfo.currentMin) / (rpInfo.nextMin - rpInfo.currentMin)) * 100;

  if (compact) {
    return (
      <>
        <button
          onClick={() => setHubOpen(true)}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 hover:border-amber-300 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={RANK_BADGE_IMAGES[rpInfo.code]}
                alt={rpInfo.title}
                className="w-10 h-10 object-contain"
                data-no-filter="true"
              />
              <div>
                <p className="text-sm font-medium text-amber-900 capitalize">{rpInfo.title}</p>
                <p className="text-xs text-amber-600">{rpPoints.toLocaleString()} RP</p>
              </div>
            </div>
            {pendingRewards.length > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 animate-pulse">
                <Gift className="w-3 h-3 mr-1" />
                {pendingRewards.length}
              </Badge>
            )}
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </div>
          <Progress value={rankProgress} className="h-1 mt-2" />
        </button>

        <Dialog open={hubOpen} onOpenChange={setHubOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Gamification Hub
              </DialogTitle>
            </DialogHeader>
            <GamificationHub profile={profile} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rank & Points */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={RANK_BADGE_IMAGES[rpInfo.code]}
                alt={rpInfo.title}
                className="w-14 h-14 object-contain"
                data-no-filter="true"
              />
              <Flame className="absolute -bottom-1 -right-1 w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 capitalize">{rpInfo.title}</p>
              <p className="text-sm text-amber-600">{rpPoints.toLocaleString()} RP</p>
              {rpInfo.nextTitle && (
                <p className="text-xs text-orange-500">Progress to {rpInfo.nextTitle}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setHubOpen(true)} className="gap-1">
            <Trophy className="w-4 h-4" />
            View All
          </Button>
        </div>
        <div>
          <div className="flex justify-between text-xs text-amber-600 mb-1">
            <span>Progress to {rpInfo.nextTitle || 'Max Rank'}</span>
            <span>{rpInfo.nextMin ? `${rpInfo.nextMin - rpPoints} RP to go` : 'Max'}</span>
          </div>
          <Progress value={rankProgress} className="h-2" />
        </div>
      </div>

      {/* Active Challenges Preview */}
      {activeChallenges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Active Challenges
            </h4>
            {pendingRewards.length > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                {pendingRewards.length} ready!
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {activeChallenges.slice(0, 2).map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} compact />
            ))}
          </div>
        </div>
      )}

      {/* Mini Leaderboard */}
      <Leaderboard compact />

      {/* Source Text Reference */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-200 dark:border-violet-700">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-500">📖</span>
          <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Foundation</p>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Based on the <span className="font-semibold text-violet-600 dark:text-violet-400">7th Seal Hidden Wisdom Unveiled</span> (Volumes 1-5)
        </p>
      </div>

      <Dialog open={hubOpen} onOpenChange={setHubOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Gamification Hub
            </DialogTitle>
          </DialogHeader>
          <GamificationHub profile={profile} />
        </DialogContent>
      </Dialog>
    </div>
  );
}