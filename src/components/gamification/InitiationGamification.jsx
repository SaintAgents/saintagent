import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, Globe, Crown, Zap, Star, Trophy, Lock, Unlock,
  ChevronRight, Clock, Flame, Target, Gift, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Initiation definitions with gamification elements
const INITIATION_GAMIFICATION = {
  '144k_activation': {
    title: '144K Activation',
    icon: Globe,
    color: 'amber',
    milestones: [
      { level: 1, name: 'Grid Awakener', requirement: 'Complete first meditation', reward: { rp: 100, badge: 'grid_awakener' } },
      { level: 2, name: 'Frequency Anchor', requirement: 'Complete 3 sessions', reward: { rp: 250, ggg: 0.1 } },
      { level: 3, name: 'Node Activator', requirement: 'Reach coherence 7+', reward: { rp: 500, badge: 'frequency_stabilizer' } },
      { level: 4, name: 'Grid Master', requirement: 'Complete mastery challenge', reward: { rp: 1000, ggg: 0.5, badge: 'grid_master' } }
    ],
    cooldownHours: 24,
    masteryChallenge: {
      title: 'Grid Mastery Challenge',
      description: 'Maintain high coherence meditation for 21 consecutive days',
      requirement: 21,
      reward: { rp: 2000, ggg: 1.0, badge: 'grid_guardian', title: 'Guardian of the Grid' }
    }
  },
  '7th_seal': {
    title: '7th Seal Initiation',
    icon: Eye,
    color: 'violet',
    milestones: [
      { level: 1, name: 'Seal Seeker', requirement: 'Begin the initiation', reward: { rp: 150, badge: 'seal_seeker' } },
      { level: 2, name: 'Timeline Walker', requirement: 'Choose timeline alignment', reward: { rp: 300, ggg: 0.15 } },
      { level: 3, name: 'Seal Opener', requirement: 'Open the 7th seal', reward: { rp: 750, badge: '7th_seal_initiated' } },
      { level: 4, name: 'Timeline Weaver', requirement: 'Complete mastery challenge', reward: { rp: 1500, ggg: 1.0, badge: 'timeline_weaver' } }
    ],
    cooldownHours: 48,
    masteryChallenge: {
      title: 'Timeline Mastery Challenge',
      description: 'Complete advanced timeline meditations and integrate all approach methods',
      requirement: 7,
      reward: { rp: 3000, ggg: 2.0, badge: 'timeline_master', title: 'Master of Timelines' }
    }
  },
  'high_priesthood': {
    title: 'High Priesthood',
    icon: Crown,
    color: 'purple',
    milestones: [
      { level: 1, name: 'Lineage Rememberer', requirement: 'Begin remembrance', reward: { rp: 200, badge: 'lineage_rememberer' } },
      { level: 2, name: 'Frequency Keeper', requirement: 'Maintain practices', reward: { rp: 500, ggg: 0.25 } },
      { level: 3, name: 'High Priest', requirement: 'Complete ordination', reward: { rp: 1000, badge: 'high_priest' } },
      { level: 4, name: 'Order Guardian', requirement: 'Complete mastery challenge', reward: { rp: 2500, ggg: 2.0, badge: 'order_guardian' } }
    ],
    cooldownHours: 72,
    masteryChallenge: {
      title: 'Priesthood Mastery',
      description: 'Guide 3 others through their initiations and maintain daily practice for 40 days',
      requirement: 40,
      reward: { rp: 5000, ggg: 5.0, badge: 'grand_priest', title: 'Grand High Priest' }
    }
  }
};

export default function InitiationGamification({ userId, profile }) {
  const queryClient = useQueryClient();
  const [selectedInitiation, setSelectedInitiation] = useState(null);

  // Fetch user's initiations
  const { data: initiations = [] } = useQuery({
    queryKey: ['userInitiations', userId],
    queryFn: () => base44.entities.Initiation.filter({ user_id: userId }),
    enabled: !!userId
  });

  // Fetch user's badges
  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => base44.entities.Badge.filter({ user_id: userId }),
    enabled: !!userId
  });

  // Calculate progress for each initiation type
  const getInitiationProgress = (initType) => {
    const config = INITIATION_GAMIFICATION[initType];
    if (!config) return null;

    const userInitiations = initiations.filter(i => i.initiation_type === initType);
    const completedCount = userInitiations.filter(i => 
      i.status === 'completed' || i.status === 'integrated'
    ).length;

    // Calculate current level
    let currentLevel = 0;
    config.milestones.forEach((milestone, idx) => {
      if (completedCount > idx) currentLevel = idx + 1;
    });

    // Check cooldown
    const lastCompleted = userInitiations
      .filter(i => i.status === 'completed' || i.status === 'integrated')
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];

    let cooldownRemaining = 0;
    if (lastCompleted?.completed_at) {
      const cooldownEnd = new Date(lastCompleted.completed_at);
      cooldownEnd.setHours(cooldownEnd.getHours() + config.cooldownHours);
      cooldownRemaining = Math.max(0, cooldownEnd - new Date()) / (1000 * 60 * 60);
    }

    // Check mastery challenge eligibility
    const masteryUnlocked = currentLevel >= 3;
    const masteryProgress = userInitiations.filter(i => 
      i.status === 'integrated' && 
      new Date(i.completed_at) > new Date(Date.now() - config.masteryChallenge.requirement * 24 * 60 * 60 * 1000)
    ).length;

    return {
      initType,
      config,
      completedCount,
      currentLevel,
      cooldownRemaining,
      isInCooldown: cooldownRemaining > 0,
      masteryUnlocked,
      masteryProgress,
      masteryCompleted: masteryProgress >= config.masteryChallenge.requirement
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Initiation Journey</h2>
        <p className="text-slate-600">Track your progress, earn rewards, and unlock mastery challenges</p>
      </div>

      {/* Initiation Cards */}
      <div className="grid gap-4">
        {Object.entries(INITIATION_GAMIFICATION).map(([initType, config]) => {
          const progress = getInitiationProgress(initType);
          const Icon = config.icon;

          return (
            <Card 
              key={initType}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                config.color === 'amber' && "border-amber-200 hover:border-amber-400",
                config.color === 'violet' && "border-violet-200 hover:border-violet-400",
                config.color === 'purple' && "border-purple-200 hover:border-purple-400"
              )}
              onClick={() => setSelectedInitiation(initType)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center",
                    config.color === 'amber' && "bg-amber-100",
                    config.color === 'violet' && "bg-violet-100",
                    config.color === 'purple' && "bg-purple-100"
                  )}>
                    <Icon className={cn(
                      "w-7 h-7",
                      config.color === 'amber' && "text-amber-600",
                      config.color === 'violet' && "text-violet-600",
                      config.color === 'purple' && "text-purple-600"
                    )} />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{config.title}</h3>
                      <Badge className={cn(
                        config.color === 'amber' && "bg-amber-100 text-amber-700",
                        config.color === 'violet' && "bg-violet-100 text-violet-700",
                        config.color === 'purple' && "bg-purple-100 text-purple-700"
                      )}>
                        Level {progress?.currentLevel || 0}/4
                      </Badge>
                    </div>

                    {/* Milestone Progress */}
                    <div className="flex items-center gap-2 mb-3">
                      {config.milestones.map((milestone, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            progress?.currentLevel > idx
                              ? config.color === 'amber' ? "bg-amber-500 text-white" :
                                config.color === 'violet' ? "bg-violet-500 text-white" :
                                "bg-purple-500 text-white"
                              : "bg-slate-200 text-slate-500"
                          )}
                        >
                          {progress?.currentLevel > idx ? '✓' : idx + 1}
                        </div>
                      ))}
                      {/* Mastery */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        progress?.masteryCompleted
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                          : progress?.masteryUnlocked
                            ? "bg-slate-300 text-slate-600"
                            : "bg-slate-200 text-slate-400"
                      )}>
                        {progress?.masteryUnlocked ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-4 text-sm">
                      {progress?.isInCooldown ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-4 h-4" />
                          <span>Cooldown: {Math.ceil(progress.cooldownRemaining)}h remaining</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Unlock className="w-4 h-4" />
                          <span>Ready to begin</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-slate-500">
                        <Target className="w-4 h-4" />
                        <span>{progress?.completedCount || 0} completed</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInitiation && (
          <InitiationDetailModal
            initType={selectedInitiation}
            progress={getInitiationProgress(selectedInitiation)}
            badges={badges}
            onClose={() => setSelectedInitiation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InitiationDetailModal({ initType, progress, badges, onClose }) {
  const config = progress?.config;
  if (!config) return null;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className={cn(
          "p-6 text-white",
          config.color === 'amber' && "bg-gradient-to-br from-amber-500 to-orange-600",
          config.color === 'violet' && "bg-gradient-to-br from-violet-500 to-purple-600",
          config.color === 'purple' && "bg-gradient-to-br from-purple-500 to-pink-600"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-8 h-8" />
            <h2 className="text-xl font-bold">{config.title}</h2>
          </div>
          <p className="text-white/80">Level {progress.currentLevel}/4 • {progress.completedCount} completions</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Milestones */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Milestones & Rewards
            </h3>
            <div className="space-y-3">
              {config.milestones.map((milestone, idx) => {
                const isCompleted = progress.currentLevel > idx;
                const isCurrent = progress.currentLevel === idx;

                return (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all",
                      isCompleted && "bg-emerald-50 border-emerald-200",
                      isCurrent && "bg-amber-50 border-amber-200",
                      !isCompleted && !isCurrent && "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          isCompleted && "bg-emerald-500 text-white",
                          isCurrent && "bg-amber-500 text-white",
                          !isCompleted && !isCurrent && "bg-slate-300 text-slate-600"
                        )}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <span className="font-medium text-slate-900">{milestone.name}</span>
                      </div>
                      {isCurrent && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 ml-8">{milestone.requirement}</p>
                    <div className="flex items-center gap-3 mt-2 ml-8">
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-slate-600">+{milestone.reward.rp} RP</span>
                      </div>
                      {milestone.reward.ggg && (
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="w-3 h-3 text-emerald-500" />
                          <span className="text-slate-600">+{milestone.reward.ggg} GGG</span>
                        </div>
                      )}
                      {milestone.reward.badge && (
                        <div className="flex items-center gap-1 text-xs">
                          <Gift className="w-3 h-3 text-violet-500" />
                          <span className="text-slate-600">Badge</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mastery Challenge */}
          <div className={cn(
            "p-4 rounded-xl border-2",
            progress.masteryUnlocked 
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300"
              : "bg-slate-100 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <Crown className={cn(
                  "w-5 h-5",
                  progress.masteryUnlocked ? "text-amber-600" : "text-slate-400"
                )} />
                {config.masteryChallenge.title}
              </h4>
              {!progress.masteryUnlocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Unlock at Level 3
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">{config.masteryChallenge.description}</p>
            
            {progress.masteryUnlocked && (
              <>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.masteryProgress}/{config.masteryChallenge.requirement}</span>
                  </div>
                  <Progress 
                    value={(progress.masteryProgress / config.masteryChallenge.requirement) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-amber-100 text-amber-700 text-xs">
                    +{config.masteryChallenge.reward.rp} RP
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    +{config.masteryChallenge.reward.ggg} GGG
                  </Badge>
                  <Badge className="bg-violet-100 text-violet-700 text-xs">
                    Exclusive Badge
                  </Badge>
                  <Badge className="bg-pink-100 text-pink-700 text-xs">
                    Title: {config.masteryChallenge.reward.title}
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* Cooldown Status */}
          {progress.isInCooldown && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Cooldown Active</p>
                <p className="text-sm text-amber-600">
                  {Math.ceil(progress.cooldownRemaining)} hours until next session
                </p>
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}