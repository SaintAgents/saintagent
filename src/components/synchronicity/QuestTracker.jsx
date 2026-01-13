import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, Trophy, Star, Gift, Check, Users, Eye, Route, Lock, Sparkles, Key, ArrowRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const QUEST_TYPE_CONFIG = {
  daily: { icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Daily Challenge' },
  weekly: { icon: Trophy, color: 'text-violet-400', bgColor: 'bg-violet-500/20', label: 'Weekly Mission' },
  epic: { icon: Star, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Epic Journey' },
  hidden: { icon: Eye, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Hidden Quest' },
  pathway: { icon: Route, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Pathway' },
  cooperative: { icon: Users, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Cooperative' },
};

const ACCESS_REWARD_LABELS = {
  early_tools: '🔧 Early Tool Access',
  exclusive_events: '🎫 Exclusive Events',
  leader_channel: '👑 Leader Channel',
  premium_features: '⭐ Premium Features',
  special_content: '📚 Special Content',
};

function QuestItem({ quest }) {
  const config = QUEST_TYPE_CONFIG[quest.quest_type] || QUEST_TYPE_CONFIG.daily;
  const Icon = config.icon;
  
  // Handle pathway quests with stages
  let progress = 0;
  let currentCount = quest.current_count || 0;
  let targetCount = quest.target_count || 1;
  
  if (quest.quest_type === 'pathway' && quest.pathway_data?.stages) {
    const stages = quest.pathway_data.stages;
    const completedStages = stages.filter(s => s.completed).length;
    progress = (completedStages / stages.length) * 100;
    currentCount = completedStages;
    targetCount = stages.length;
  } else {
    progress = targetCount > 0 ? (currentCount / targetCount) * 100 : 0;
  }
  
  const isComplete = quest.status === 'completed' || progress >= 100;
  const isHidden = quest.visibility === 'hidden';
  const isCooperative = quest.quest_type === 'cooperative';
  const participantCount = quest.cooperative_data?.participant_ids?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-3"
    >
      <div className="flex items-start gap-2 mb-1">
        <div className={`p-1 rounded ${config.bgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-amber-300/70">{config.label}</p>
            {quest.rarity === 'legendary' && <Sparkles className="w-3 h-3 text-amber-400" />}
            {quest.rarity === 'epic' && <Star className="w-3 h-3 text-violet-400" />}
          </div>
          <p className="text-sm text-amber-100 font-medium truncate">{quest.title}</p>
        </div>
      </div>
      
      <div className="ml-7">
        {/* Cooperative quest participants */}
        {isCooperative && (
          <div className="flex items-center gap-1 mb-1.5 text-[10px] text-cyan-400/80">
            <Users className="w-3 h-3" />
            <span>{participantCount}/{quest.cooperative_data?.max_participants || '∞'} participants</span>
          </div>
        )}

        {/* Pathway stages indicator */}
        {quest.quest_type === 'pathway' && quest.pathway_data?.stages && (
          <div className="flex gap-1 mb-1.5">
            {quest.pathway_data.stages.map((stage, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${stage.completed ? 'bg-emerald-400' : 'bg-amber-900/50'}`}
                title={`Stage ${i + 1}: ${stage.title}`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-amber-900/50">
            <motion.div 
              className={`h-full ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-amber-200/70 w-12 text-right">
            {currentCount}/{targetCount}
          </span>
        </div>
        
        {isComplete ? (
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <Check className="w-3 h-3" />
            <span>COMPLETE</span>
          </div>
        ) : (
          <p className="text-[10px] text-amber-400/60">{Math.round(progress)}%</p>
        )}
        
        {/* Rewards section */}
        <div className="mt-1 space-y-0.5">
          {(quest.reward_rp > 0 || quest.reward_ggg > 0) && (
            <p className="text-[10px] text-amber-300/50">
              {quest.reward_rp > 0 && `${quest.reward_rp} RP`}
              {quest.reward_rp > 0 && quest.reward_ggg > 0 && ' + '}
              {quest.reward_ggg > 0 && `${quest.reward_ggg} GGG`}
            </p>
          )}
          {quest.reward_access?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {quest.reward_access.map((access, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Key className="w-2 h-2 inline mr-0.5" />
                  {ACCESS_REWARD_LABELS[access] || access}
                </span>
              ))}
            </div>
          )}
          {quest.reward_badge && (
            <p className="text-[10px] text-amber-300/50">🏅 Badge: {quest.reward_badge}</p>
          )}
          {quest.reward_title && (
            <p className="text-[10px] text-violet-300/70">👑 Title: {quest.reward_title}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// What's Next guidance suggestions based on quest state
const WHATS_NEXT_SUGGESTIONS = [
  { trigger: 'no_quests', icon: Target, text: 'Check the Discovery tab for hidden quests', action: 'discovery' },
  { trigger: 'no_quests', icon: Sparkles, text: 'Generate a personalized quest in AI Suggests', action: 'suggestions' },
  { trigger: 'has_incomplete', icon: Zap, text: 'Complete a meeting to progress your quest', action: 'meetings' },
  { trigger: 'has_incomplete', icon: Users, text: 'Collaborate with others on a mission', action: 'missions' },
  { trigger: 'all_complete', icon: Trophy, text: 'Claim your rewards and start new quests!', action: 'claim' },
  { trigger: 'low_progress', icon: Route, text: 'Post a Daily Field Update to earn progress', action: 'feed' },
];

export default function QuestTracker({ quests, onClaimRewards, hasClaimable, isClaimPending }) {
  const activeQuests = quests.filter(q => q.status === 'active' || q.status === 'completed');
  const dailyQuests = activeQuests.filter(q => q.quest_type === 'daily');
  const weeklyQuests = activeQuests.filter(q => q.quest_type === 'weekly');
  const epicQuests = activeQuests.filter(q => q.quest_type === 'epic' || q.quest_type === 'pathway');
  
  // Determine what's next suggestion
  const getWhatsNextSuggestion = () => {
    if (activeQuests.length === 0) {
      return WHATS_NEXT_SUGGESTIONS.filter(s => s.trigger === 'no_quests')[Math.floor(Math.random() * 2)];
    }
    if (hasClaimable) {
      return WHATS_NEXT_SUGGESTIONS.find(s => s.trigger === 'all_complete');
    }
    const incompleteQuests = activeQuests.filter(q => q.status === 'active');
    if (incompleteQuests.length > 0) {
      const avgProgress = incompleteQuests.reduce((sum, q) => {
        const progress = q.target_count > 0 ? (q.current_count || 0) / q.target_count * 100 : 0;
        return sum + progress;
      }, 0) / incompleteQuests.length;
      
      if (avgProgress < 30) {
        return WHATS_NEXT_SUGGESTIONS.find(s => s.trigger === 'low_progress');
      }
      return WHATS_NEXT_SUGGESTIONS.filter(s => s.trigger === 'has_incomplete')[Math.floor(Math.random() * 2)];
    }
    return null;
  };
  
  const whatsNext = getWhatsNextSuggestion();

  return (
    <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10">
      <CardHeader className="pb-2 border-b border-amber-900/30">
        <CardTitle className="text-base flex items-center gap-2 text-amber-100">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          Quest Tracker
          <span className="ml-auto text-xs text-amber-400/70 font-normal">
            {activeQuests.length}/5
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <ScrollArea className="h-80 pr-2">
          {activeQuests.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-amber-900/50 mx-auto mb-2" />
              <p className="text-sm text-amber-400/50">No active quests</p>
              <p className="text-xs text-amber-400/30 mt-1">New quests appear daily</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailyQuests.length > 0 && (
                <div>
                  {dailyQuests.map(quest => (
                    <QuestItem key={quest.id} quest={quest} />
                  ))}
                </div>
              )}
              
              {weeklyQuests.length > 0 && (
                <div>
                  {weeklyQuests.map(quest => (
                    <QuestItem key={quest.id} quest={quest} />
                  ))}
                </div>
              )}
              
              {epicQuests.length > 0 && (
                <div>
                  {epicQuests.map(quest => (
                    <QuestItem key={quest.id} quest={quest} />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        {/* What's Next Guidance */}
        {whatsNext && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-500/30"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">What's Next?</span>
            </div>
            <div className="flex items-center gap-2">
              <whatsNext.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-200/90 flex-1">{whatsNext.text}</p>
              <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
            </div>
          </motion.div>
        )}

        <Button
          onClick={onClaimRewards}
          disabled={!hasClaimable || isClaimPending}
          className={`w-full mt-4 rounded-lg font-medium transition-all ${
            hasClaimable 
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
              : 'bg-amber-900/30 text-amber-400/50 cursor-not-allowed'
          }`}
        >
          <Gift className="w-4 h-4 mr-2" />
          {isClaimPending ? 'Claiming...' : 'Claim Rewards'}
        </Button>
      </CardContent>
    </Card>
  );
}