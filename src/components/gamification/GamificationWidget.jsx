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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import GamificationHub from './GamificationHub';

export default function GamificationWidget({ profile, compact = false }) {
  const [hubOpen, setHubOpen] = useState(false);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', profile?.user_id],
    queryFn: () => base44.entities.Challenge.filter({ user_id: profile.user_id, status: 'active' }, '-created_date', 5),
    enabled: !!profile?.user_id
  });

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const pendingRewards = challenges.filter(c => c.current_count >= c.target_count && c.status === 'active');
  
  const engagementPoints = profile?.engagement_points || 0;
  const level = Math.floor(engagementPoints / 1000) + 1;
  const levelProgress = (engagementPoints % 1000) / 10;

  if (compact) {
    return (
      <>
        <button
          onClick={() => setHubOpen(true)}
          className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 hover:border-amber-300 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Level {level}</p>
                <p className="text-xs text-amber-600">{engagementPoints.toLocaleString()} pts</p>
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
          <Progress value={levelProgress} className="h-1 mt-2" />
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
      {/* Level & Points */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{level}</span>
              </div>
              <Flame className="absolute -bottom-1 -right-1 w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">Level {level}</p>
              <p className="text-sm text-amber-600">{engagementPoints.toLocaleString()} points</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setHubOpen(true)} className="gap-1">
            <Trophy className="w-4 h-4" />
            View All
          </Button>
        </div>
        <div>
          <div className="flex justify-between text-xs text-amber-600 mb-1">
            <span>Progress to Level {level + 1}</span>
            <span>{1000 - (engagementPoints % 1000)} pts to go</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
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