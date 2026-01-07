import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, Zap, Trophy, Star, Gift, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const QUEST_TYPE_CONFIG = {
  daily: { icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Daily Challenge' },
  weekly: { icon: Trophy, color: 'text-violet-400', bgColor: 'bg-violet-500/20', label: 'Weekly Mission' },
  epic: { icon: Star, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Epic Journey' },
  hidden: { icon: Target, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Hidden Quest' },
  pathway: { icon: Target, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Pathway' },
};

function QuestItem({ quest }) {
  const config = QUEST_TYPE_CONFIG[quest.quest_type] || QUEST_TYPE_CONFIG.daily;
  const Icon = config.icon;
  const progress = quest.target_count > 0 ? (quest.current_count / quest.target_count) * 100 : 0;
  const isComplete = quest.status === 'completed' || progress >= 100;

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
          <p className="text-xs text-amber-300/70">{config.label}</p>
          <p className="text-sm text-amber-100 font-medium truncate">{quest.title}</p>
        </div>
      </div>
      
      <div className="ml-7">
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
            {quest.current_count}/{quest.target_count}
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
        
        {quest.reward_rp > 0 && (
          <p className="text-[10px] text-amber-300/50 mt-0.5">
            Reward: {quest.reward_rp} RP {quest.reward_ggg > 0 && `+ ${quest.reward_ggg} GGG`}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function QuestTracker({ quests, onClaimRewards, hasClaimable, isClaimPending }) {
  const activeQuests = quests.filter(q => q.status === 'active' || q.status === 'completed');
  const dailyQuests = activeQuests.filter(q => q.quest_type === 'daily');
  const weeklyQuests = activeQuests.filter(q => q.quest_type === 'weekly');
  const epicQuests = activeQuests.filter(q => q.quest_type === 'epic' || q.quest_type === 'pathway');

  return (
    <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
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