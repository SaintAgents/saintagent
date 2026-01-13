import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, EyeOff, Lock, Unlock, Sparkles, Star, Zap, 
  Gift, Search, Compass, Crown, Heart, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Hidden quest triggers and their conditions
const DISCOVERY_TRIGGERS = {
  daily_quest_count: {
    name: 'Quest Completion Streak',
    icon: Target,
    thresholds: [5, 10, 25, 50, 100],
    hint: '✨ Something stirs in the shadows...'
  },
  rank_reached: {
    name: 'Rank Achievement',
    icon: Crown,
    thresholds: ['initiate', 'adept', 'practitioner', 'master', 'sage'],
    hint: '🌟 A new path reveals itself...'
  },
  badge_earned: {
    name: 'Badge Collection',
    icon: Star,
    hint: '🎖️ Your achievements unlock mysteries...'
  },
  user_interaction: {
    name: 'Community Connection',
    icon: Heart,
    thresholds: [3, 10, 25, 50],
    hint: '💫 Connections bring revelations...'
  },
  initiation_completed: {
    name: 'Initiation Mastery',
    icon: Eye,
    hint: '🔮 The initiated see what others cannot...'
  }
};

// Quest suggestion categories based on archetypes
const ARCHETYPE_QUEST_MAP = {
  healer: ['healing_arts', 'energy_work', 'mentorship', 'service'],
  builder: ['project_creation', 'team_building', 'technology', 'innovation'],
  teacher: ['knowledge_sharing', 'mentorship', 'content_creation', 'guidance'],
  seeker: ['exploration', 'learning', 'spiritual_growth', 'discovery'],
  guardian: ['protection', 'community', 'stewardship', 'leadership'],
  visionary: ['prophecy', 'innovation', 'future_building', 'inspiration'],
  connector: ['networking', 'collaboration', 'matchmaking', 'harmony']
};

export default function HiddenQuestSystem({ userId, profile, badges = [], quests = [] }) {
  const queryClient = useQueryClient();
  const [discoveryAnimation, setDiscoveryAnimation] = useState(null);
  const [showHints, setShowHints] = useState(true);

  // Fetch initiations for discovery triggers
  const { data: initiations = [] } = useQuery({
    queryKey: ['userInitiations', userId],
    queryFn: () => base44.entities.Initiation.filter({ user_id: userId }),
    enabled: !!userId
  });

  // Fetch hidden quests
  const { data: hiddenQuests = [] } = useQuery({
    queryKey: ['hiddenQuests', userId],
    queryFn: () => base44.entities.Quest.filter({ 
      user_id: userId, 
      visibility: 'hidden' 
    }),
    enabled: !!userId
  });

  // Fetch discovered quests
  const { data: discoveredQuests = [] } = useQuery({
    queryKey: ['discoveredQuests', userId],
    queryFn: () => base44.entities.Quest.filter({ 
      user_id: userId, 
      visibility: 'discovered' 
    }),
    enabled: !!userId
  });

  // Calculate discovery progress
  const calculateDiscoveryProgress = () => {
    const completedQuests = quests.filter(q => q.status === 'completed' || q.status === 'claimed');
    const completedInitiations = initiations.filter(i => i.status === 'completed' || i.status === 'integrated');
    
    return {
      daily_quest_count: completedQuests.length,
      rank_reached: profile?.rp_rank_code || 'seeker',
      badge_count: badges.length,
      initiation_count: completedInitiations.length,
      user_interactions: profile?.meetings_completed || 0
    };
  };

  const progress = calculateDiscoveryProgress();

  // Check if any hidden quests should be revealed
  const checkDiscoveryTriggers = async () => {
    for (const quest of hiddenQuests) {
      if (!quest.discovery_trigger) continue;
      
      const trigger = quest.discovery_trigger;
      let shouldReveal = false;

      switch (trigger.trigger_type) {
        case 'daily_quest_count':
          shouldReveal = progress.daily_quest_count >= (trigger.trigger_count || 5);
          break;
        case 'rank_reached':
          const rankOrder = ['seeker', 'initiate', 'adept', 'practitioner', 'master', 'sage', 'oracle', 'ascended', 'guardian'];
          const currentRankIdx = rankOrder.indexOf(progress.rank_reached);
          const requiredRankIdx = rankOrder.indexOf(trigger.trigger_value);
          shouldReveal = currentRankIdx >= requiredRankIdx;
          break;
        case 'badge_earned':
          shouldReveal = badges.some(b => b.code === trigger.trigger_value);
          break;
        case 'initiation_completed':
          shouldReveal = initiations.some(i => 
            i.initiation_type === trigger.trigger_value && 
            (i.status === 'completed' || i.status === 'integrated')
          );
          break;
        case 'user_interaction':
          shouldReveal = progress.user_interactions >= (trigger.trigger_count || 3);
          break;
      }

      if (shouldReveal) {
        await revealQuest(quest);
      }
    }
  };

  // Reveal a hidden quest
  const revealQuest = async (quest) => {
    setDiscoveryAnimation(quest);
    
    await base44.entities.Quest.update(quest.id, {
      visibility: 'discovered',
      discovered_at: new Date().toISOString()
    });

    queryClient.invalidateQueries({ queryKey: ['hiddenQuests'] });
    queryClient.invalidateQueries({ queryKey: ['discoveredQuests'] });

    // Clear animation after delay
    setTimeout(() => setDiscoveryAnimation(null), 3000);
  };

  // Check triggers on mount and when progress changes
  useEffect(() => {
    if (userId && hiddenQuests.length > 0) {
      checkDiscoveryTriggers();
    }
  }, [userId, progress.daily_quest_count, progress.rank_reached, badges.length]);

  // Get hints for undiscovered quests
  const getActiveHints = () => {
    return hiddenQuests
      .filter(q => q.discovery_trigger?.hint_text)
      .map(q => ({
        hint: q.discovery_trigger.hint_text,
        type: q.discovery_trigger.trigger_type,
        progress: getHintProgress(q.discovery_trigger)
      }))
      .slice(0, 3);
  };

  const getHintProgress = (trigger) => {
    if (!trigger) return 0;
    switch (trigger.trigger_type) {
      case 'daily_quest_count':
        return Math.min(100, (progress.daily_quest_count / (trigger.trigger_count || 5)) * 100);
      case 'user_interaction':
        return Math.min(100, (progress.user_interactions / (trigger.trigger_count || 3)) * 100);
      case 'badge_earned':
        return badges.some(b => b.code === trigger.trigger_value) ? 100 : 0;
      default:
        return 0;
    }
  };

  const hints = getActiveHints();

  return (
    <div className="space-y-4">
      {/* Discovery Animation Overlay */}
      <AnimatePresence>
        {discoveryAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-2xl p-8 max-w-md text-center border-2 border-amber-400"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
              >
                <Eye className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Quest Discovered!</h2>
              <p className="text-white text-lg mb-1">{discoveryAnimation.title}</p>
              <p className="text-violet-300 text-sm">{discoveryAnimation.description}</p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-400/30">
                  +{discoveryAnimation.reward_rp} RP
                </Badge>
                {discoveryAnimation.reward_ggg > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
                    +{discoveryAnimation.reward_ggg} GGG
                  </Badge>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discovery Progress Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-violet-900/50 border-violet-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-violet-400" />
              <CardTitle className="text-white">Quest Discovery</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHints(!showHints)}
              className="text-violet-400 hover:text-violet-300"
            >
              {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-violet-500/10">
              <p className="text-lg font-bold text-white">{progress.daily_quest_count}</p>
              <p className="text-xs text-violet-300">Quests Done</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-500/10">
              <p className="text-lg font-bold text-white">{badges.length}</p>
              <p className="text-xs text-amber-300">Badges</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald-500/10">
              <p className="text-lg font-bold text-white">{progress.initiation_count}</p>
              <p className="text-xs text-emerald-300">Initiations</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-pink-500/10">
              <p className="text-lg font-bold text-white">{discoveredQuests.length}</p>
              <p className="text-xs text-pink-300">Discovered</p>
            </div>
          </div>

          {/* Hints Section */}
          {showHints && hints.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-violet-400 font-medium">Mystical Hints</p>
              {hints.map((hint, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/30 border border-violet-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-violet-200 italic">{hint.hint}</p>
                    {hint.progress > 0 && hint.progress < 100 && (
                      <Badge variant="outline" className="text-xs text-violet-400 border-violet-500/30">
                        {Math.round(hint.progress)}%
                      </Badge>
                    )}
                  </div>
                  {hint.progress > 0 && hint.progress < 100 && (
                    <Progress value={hint.progress} className="h-1" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hidden Quests Remaining */}
          {hiddenQuests.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-black/20 border border-dashed border-violet-500/30 text-center">
              <Lock className="w-5 h-5 text-violet-500 mx-auto mb-1" />
              <p className="text-sm text-violet-300">
                {hiddenQuests.length} hidden quest{hiddenQuests.length > 1 ? 's' : ''} await discovery
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discovered Quests List */}
      {discoveredQuests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Recently Discovered
          </h3>
          {discoveredQuests.slice(0, 3).map(quest => (
            <DiscoveredQuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscoveredQuestCard({ quest }) {
  const progress = quest.target_count > 0 
    ? Math.min(100, (quest.current_count / quest.target_count) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900">{quest.title}</h4>
            <Badge className="bg-amber-100 text-amber-700 text-xs">Discovered</Badge>
          </div>
          <p className="text-sm text-slate-600 mb-2">{quest.description}</p>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="w-3 h-3 text-amber-500" />
              +{quest.reward_rp} RP
            </div>
            {quest.reward_ggg > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Zap className="w-3 h-3 text-emerald-500" />
                +{quest.reward_ggg} GGG
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{quest.current_count}/{quest.target_count}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}