import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Target, Star, Sparkles, Gift, Crown, Users, Coins,
  Calendar, Shield, Heart, Eye, Lock, ChevronRight, Clock, Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import QuestStartModal from './QuestStartModal';

const QUEST_TEMPLATES = [
  {
    id: 'initiates_oath',
    title: "The Initiate's Oath",
    description: 'Begin your journey by attending your first meeting and connecting with the community.',
    sacredPurpose: 'Take the first step into connection and trust.',
    category: 'onboarding',
    quest_type: 'pathway',
    rarity: 'common',
    objectives: [
      { id: 'attend_meeting', description: 'Attend or host your first meeting', target: 1 },
      { id: 'send_dm', description: 'Send your first direct message', target: 1 },
    ],
    rewards: { rp: 50, ggg: 5, badge: 'first_meeting' },
    duration: '7 days',
    icon: Calendar
  },
  {
    id: 'seven_days_coherence',
    title: 'Seven Days of Coherence',
    description: 'Maintain daily activity for 7 consecutive days to build momentum.',
    sacredPurpose: 'Cultivate discipline and sustained engagement.',
    category: 'alignment',
    quest_type: 'pathway',
    rarity: 'common',
    objectives: [
      { id: 'daily_login', description: 'Log in each day', target: 7 },
      { id: 'daily_action', description: 'Complete at least one action daily', target: 7 },
    ],
    rewards: { rp: 100, ggg: 10, badge: 'streak_7' },
    duration: '7 days',
    icon: Star
  },
  {
    id: 'social_quest',
    title: 'The Social Weaver',
    description: 'Build meaningful connections across the community.',
    sacredPurpose: 'Transform through connection and network weaving.',
    category: 'social',
    quest_type: 'pathway',
    rarity: 'rare',
    objectives: [
      { id: 'connections', description: 'Make 10 new connections', target: 10 },
      { id: 'messages', description: 'Send 25 direct messages', target: 25 },
      { id: 'global_chat', description: 'Participate in Global Chat 5 times', target: 5 },
    ],
    rewards: { rp: 200, ggg: 25, badge: 'social_butterfly' },
    duration: '30 days',
    icon: Users
  },
  {
    id: 'mentors_path',
    title: "The Mentor's Path",
    description: 'Guide and uplift others through mentorship sessions.',
    sacredPurpose: 'Share wisdom and serve others growth.',
    category: 'leadership',
    quest_type: 'epic',
    rarity: 'epic',
    objectives: [
      { id: 'mentorship_sessions', description: 'Complete 10 mentorship sessions', target: 10 },
      { id: 'positive_feedback', description: 'Receive positive testimonials', target: 5 },
    ],
    rewards: { rp: 500, ggg: 100, badge: 'top_mentor', title: 'Guide of Light' },
    duration: '90 days',
    prerequisites: ['initiates_oath'],
    icon: Crown
  },
  {
    id: 'trust_exemplar',
    title: 'Trust Exemplar',
    description: 'Become a pillar of reliability and integrity.',
    sacredPurpose: 'Embody stability and foundational trust.',
    category: 'trust',
    quest_type: 'epic',
    rarity: 'epic',
    objectives: [
      { id: 'trust_score', description: 'Maintain 90+ Trust Score', target: 90 },
      { id: 'days_maintained', description: 'Hold for 90 days', target: 90 },
      { id: 'transactions', description: 'Complete 50+ verified transactions', target: 50 },
    ],
    rewards: { rp: 750, ggg: 150, badge: 'trust_anchor', access: ['stewardship_council'] },
    duration: '90 days',
    icon: Shield
  },
  {
    id: 'synchronicity_master',
    title: 'Synchronicity Master',
    description: 'Master the art of meaningful connections and divine timing.',
    sacredPurpose: 'See invisible threads and orchestrate serendipity.',
    category: 'mystical',
    quest_type: 'epic',
    rarity: 'legendary',
    visibility: 'hidden',
    objectives: [
      { id: 'perfect_matches', description: 'Achieve 20 perfect synchronicity matches', target: 20 },
      { id: 'collaborations', description: 'Facilitate major collaborative breakthroughs', target: 3 },
    ],
    rewards: { rp: 1000, ggg: 250, badge: 'synchronicity_weaver', title: 'Reality Weaver' },
    duration: 'No limit',
    icon: Sparkles
  },
];

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700 border-slate-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300'
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'shadow-green-200',
  rare: 'shadow-blue-300 shadow-lg',
  epic: 'shadow-purple-400 shadow-xl',
  legendary: 'shadow-amber-400 shadow-xl ring-2 ring-amber-300'
};

export default function AvailableQuestsPanel({ profile, activeQuests = [] }) {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const activeQuestIds = activeQuests.map(q => q.quest_template_id);
  const availableQuests = QUEST_TEMPLATES.filter(q => 
    !activeQuestIds.includes(q.id) && q.visibility !== 'hidden'
  );

  const startQuestMutation = useMutation({
    mutationFn: async (template) => {
      // Check active quest limit (max 5)
      if (activeQuests.length >= 5) {
        throw new Error('Maximum 5 active quests allowed');
      }

      const questData = {
        user_id: profile.user_id,
        quest_template_id: template.id,
        title: template.title,
        description: template.description,
        quest_type: template.quest_type,
        category: template.category,
        rarity: template.rarity,
        target_count: template.objectives.reduce((sum, o) => sum + o.target, 0),
        current_count: 0,
        reward_rp: template.rewards.rp || 0,
        reward_ggg: template.rewards.ggg || 0,
        reward_badge: template.rewards.badge,
        reward_title: template.rewards.title,
        reward_access: template.rewards.access || [],
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: template.duration !== 'No limit' 
          ? new Date(Date.now() + parseInt(template.duration) * 24 * 60 * 60 * 1000).toISOString()
          : null,
        pathway_data: {
          pathway_id: template.id,
          pathway_name: template.title,
          current_stage: 1,
          total_stages: template.objectives.length,
          stages: template.objectives.map((obj, idx) => ({
            stage_num: idx + 1,
            title: obj.description,
            target_action: obj.id,
            target_count: obj.target,
            current_count: 0,
            completed: false
          }))
        }
      };

      await base44.entities.Quest.create(questData);

      // Send notification
      await base44.entities.Notification.create({
        user_id: profile.user_id,
        type: 'quest',
        title: `Pathway Activated: ${template.title}`,
        message: template.sacredPurpose,
        priority: 'normal'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      setStartModalOpen(false);
      setSelectedQuest(null);
    }
  });

  const handleStartQuest = (template) => {
    setSelectedQuest(template);
    setStartModalOpen(true);
  };

  const confirmStartQuest = () => {
    if (selectedQuest) {
      startQuestMutation.mutate(selectedQuest);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-500" />
          Available Pathways
        </h3>
        <Badge variant="outline" className="gap-1">
          <Play className="w-3 h-3" />
          {activeQuests.length}/5 Active
        </Badge>
      </div>

      {activeQuests.length >= 5 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <Lock className="w-4 h-4 inline mr-2" />
          Maximum active quests reached. Complete or abandon a quest to start a new one.
        </div>
      )}

      <ScrollArea className="h-[500px] pr-2">
        <div className="space-y-4">
          {availableQuests.map((quest) => {
            const Icon = quest.icon;
            const isLocked = quest.prerequisites?.some(p => !activeQuestIds.includes(p));
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className={cn(
                  "transition-all cursor-pointer hover:shadow-lg",
                  RARITY_GLOW[quest.rarity],
                  isLocked && "opacity-60"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl shrink-0",
                        quest.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-100 to-yellow-200' :
                        quest.rarity === 'epic' ? 'bg-gradient-to-br from-purple-100 to-violet-200' :
                        quest.rarity === 'rare' ? 'bg-gradient-to-br from-blue-100 to-cyan-200' :
                        'bg-slate-100'
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          quest.rarity === 'legendary' ? 'text-amber-600' :
                          quest.rarity === 'epic' ? 'text-purple-600' :
                          quest.rarity === 'rare' ? 'text-blue-600' :
                          'text-slate-600'
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {quest.title}
                          </h4>
                          <Badge className={RARITY_COLORS[quest.rarity]}>
                            {quest.rarity}
                          </Badge>
                          {isLocked && (
                            <Badge variant="outline" className="gap-1">
                              <Lock className="w-3 h-3" />
                              Locked
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-violet-600 dark:text-violet-400 italic mt-1">
                          "{quest.sacredPurpose}"
                        </p>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                          {quest.description}
                        </p>

                        {/* Objectives Preview */}
                        <div className="mt-3 space-y-1">
                          {quest.objectives.slice(0, 2).map((obj, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                              <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center">
                                {idx + 1}
                              </div>
                              {obj.description}
                            </div>
                          ))}
                          {quest.objectives.length > 2 && (
                            <p className="text-xs text-slate-400">
                              +{quest.objectives.length - 2} more objectives
                            </p>
                          )}
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {quest.rewards.rp > 0 && (
                            <Badge variant="outline" className="gap-1 text-violet-600">
                              <Star className="w-3 h-3" />
                              {quest.rewards.rp} RP
                            </Badge>
                          )}
                          {quest.rewards.ggg > 0 && (
                            <Badge variant="outline" className="gap-1 text-amber-600">
                              <Coins className="w-3 h-3" />
                              {quest.rewards.ggg} GGG
                            </Badge>
                          )}
                          {quest.rewards.badge && (
                            <Badge variant="outline" className="gap-1 text-emerald-600">
                              <Gift className="w-3 h-3" />
                              Badge
                            </Badge>
                          )}
                          {quest.duration && (
                            <Badge variant="outline" className="gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              {quest.duration}
                            </Badge>
                          )}
                        </div>

                        {/* Action */}
                        <div className="mt-4">
                          <Button
                            onClick={() => handleStartQuest(quest)}
                            disabled={isLocked || activeQuests.length >= 5}
                            className={cn(
                              "gap-2",
                              quest.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' :
                              quest.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600' :
                              'bg-violet-600 hover:bg-violet-700'
                            )}
                          >
                            <Play className="w-4 h-4" />
                            Begin Pathway
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quest Start Modal */}
      <QuestStartModal
        open={startModalOpen}
        onClose={() => {
          setStartModalOpen(false);
          setSelectedQuest(null);
        }}
        quest={selectedQuest}
        onConfirm={confirmStartQuest}
        isPending={startQuestMutation.isPending}
      />
    </div>
  );
}