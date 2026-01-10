import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Crown, Sparkles, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRPRank } from '@/components/reputation/rpUtils';

export default function EpicQuestCard({ profile }) {
  const currentRP = profile?.rp_points || 0;
  const rankInfo = getRPRank(currentRP);
  
  // Calculate progress to next rank
  const nextRankRP = rankInfo.nextMinPoints || 25000;
  const prevRankRP = rankInfo.minPoints || 0;
  const progressInRank = currentRP - prevRankRP;
  const totalForRank = nextRankRP - prevRankRP;
  const progressPercent = totalForRank > 0 ? Math.min((progressInRank / totalForRank) * 100, 100) : 100;

  const isMaxRank = rankInfo.code === 'guardian';

  return (
    <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
          <Star className="w-4 h-4 text-amber-400" />
          <CardTitle className="text-base text-amber-100">Epic Quest</CardTitle>
          <Star className="w-4 h-4 text-amber-400" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Quest Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-amber-200">
              {isMaxRank ? 'Guardian Achieved!' : `${rankInfo.nextTitle || 'Ascended'} Rank Awaits`}
            </h3>
          </div>
          <p className="text-xs text-amber-400/60">
            {isMaxRank ? 'You have reached the highest rank' : `Reach ${nextRankRP.toLocaleString()} RP`}
          </p>
        </div>

        {/* Progress Display */}
        <div className="relative mb-4">
          {/* Decorative frame */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 via-amber-400/20 to-amber-600/20 rounded-lg blur-sm" />
          
          <div className="relative bg-black/40 rounded-lg p-4 border border-amber-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-400/70">Progress</span>
              <span className="text-sm font-bold text-amber-300">
                {currentRP.toLocaleString()} / {nextRankRP.toLocaleString()}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-amber-900/50">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  boxShadow: '0 0 10px rgba(251,191,36,0.5)'
                }}
              />
            </div>
            
            <p className="text-center text-xs text-amber-400/50 mt-2">
              {Math.round(progressPercent)}% Complete
            </p>
          </div>
        </div>

        {/* Unlock Button */}
        <Button
          disabled={progressPercent < 100}
          className={`w-full rounded-lg font-medium transition-all ${
            progressPercent >= 100
              ? 'bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black shadow-lg shadow-amber-500/30'
              : 'bg-amber-900/30 text-amber-400/50 cursor-not-allowed'
          }`}
        >
          {progressPercent >= 100 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Unlock Rare Title!
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              {(nextRankRP - currentRP).toLocaleString()} RP Remaining
            </>
          )}
        </Button>

        {/* Reward Preview */}
        <div className="mt-3 text-center">
          <p className="text-[10px] text-amber-400/40 uppercase tracking-wider">Rewards</p>
          <div className="flex justify-center gap-3 mt-1">
            <span className="text-xs text-violet-400">Rare Badge</span>
            <span className="text-amber-400/30">•</span>
            <span className="text-xs text-amber-400">Exclusive Title</span>
            <span className="text-amber-400/30">•</span>
            <span className="text-xs text-emerald-400">Access Perks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}