import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Rocket, CheckCircle, Circle, Lock, ChevronRight, Sparkles, Eye,
  Users, MessageSquare, Target, BarChart3, Briefcase, Zap, Shield, Gift, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUEST_STEPS = [
  {
    id: 'explore_profile',
    title: 'Complete Your Profile',
    description: 'Upload an avatar, add a bio, and set your location to make yourself discoverable.',
    icon: Users,
    color: 'text-violet-500 bg-violet-50',
    check: (profile) => !!(profile?.avatar_url && profile?.bio && profile?.location),
    hint: 'Go to your Profile page and fill in the essentials.',
  },
  {
    id: 'discover_matches',
    title: 'Discover Your Matches',
    description: 'Visit the Matches page to see who the platform has connected you with based on your skills and interests.',
    icon: Sparkles,
    color: 'text-amber-500 bg-amber-50',
    check: (_, flags) => flags?.visited_matches,
    hint: 'Navigate to the Matches page from the sidebar.',
  },
  {
    id: 'send_message',
    title: 'Start a Conversation',
    description: 'Send your first message to another member. Collaboration starts with a hello!',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-50',
    check: (_, flags) => flags?.sent_message,
    hint: 'Open Messages and reach out to someone.',
  },
  {
    id: 'join_mission',
    title: 'Join a Mission',
    description: 'Missions are team challenges with real impact. Browse and join one that resonates with you.',
    icon: Target,
    color: 'text-emerald-500 bg-emerald-50',
    check: (_, flags) => flags?.joined_mission,
    hint: 'Head to the Missions page and click Join on any mission.',
  },
  {
    id: 'explore_marketplace',
    title: 'Browse the Marketplace',
    description: 'Discover services, courses, and collaboration opportunities offered by the community.',
    icon: Briefcase,
    color: 'text-pink-500 bg-pink-50',
    check: (_, flags) => flags?.visited_marketplace,
    hint: 'Visit the Marketplace from the sidebar.',
  },
  {
    id: 'explore_projects',
    title: 'Explore Projects',
    description: 'See what the community is building. Projects are where ideas become reality.',
    icon: BarChart3,
    color: 'text-cyan-500 bg-cyan-50',
    check: (_, flags) => flags?.visited_projects,
    hint: 'Check out the Projects page.',
  },
  {
    id: 'earn_ggg',
    title: 'Earn Your First GGG',
    description: 'Complete any action that earns GGG tokens — the platform\'s value currency.',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-50',
    check: (profile) => (profile?.ggg_balance || 0) > 0,
    hint: 'Complete quests, attend events, or help others to earn GGG.',
  },
  {
    id: 'unlock_advanced',
    title: 'Unlock Advanced Mode',
    description: 'You\'ve explored the platform! Claim your reward and unlock the full Advanced experience.',
    icon: Rocket,
    color: 'text-violet-600 bg-violet-100',
    check: (_, flags) => flags?.advanced_unlocked,
    hint: 'Complete all previous steps to unlock.',
    isFinal: true,
  },
];

function StepCard({ step, index, isCompleted, isCurrent, isLocked, onMarkComplete }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
        isCompleted ? 'border-emerald-200 bg-emerald-50/30' :
        isCurrent ? 'border-violet-300 bg-violet-50/40 shadow-sm ring-1 ring-violet-200' :
        'border-slate-100 bg-slate-50/30 opacity-60'
      }`}>
        {/* Step Number / Status */}
        <div className="shrink-0 relative">
          {isCompleted ? (
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          ) : isCurrent ? (
            <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center ring-2 ring-violet-300 ring-offset-2`}>
              <Icon className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-300" />
            </div>
          )}
          {/* Connector line */}
          {index < QUEST_STEPS.length - 1 && (
            <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={`font-semibold text-sm ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
              {step.title}
            </h4>
            {isCompleted && <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700">Done</Badge>}
            {isCurrent && <Badge className="text-[10px] px-1.5 py-0 bg-violet-100 text-violet-700">Current</Badge>}
            {step.isFinal && !isCompleted && <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">Final</Badge>}
          </div>
          <p className="text-xs text-slate-500 mb-2">{step.description}</p>
          {isCurrent && !step.isFinal && (
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-violet-500 italic flex items-center gap-1">
                <Eye className="w-3 h-3" /> {step.hint}
              </p>
              <Button size="sm" variant="outline" className="text-xs h-7 ml-auto" onClick={() => onMarkComplete(step.id)}>
                Mark Complete <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdvancedModeQuest({ userId, profile }) {
  const queryClient = useQueryClient();
  const [celebrating, setCelebrating] = useState(false);

  // Fetch or create the quest record
  const { data: questRecords = [], isLoading } = useQuery({
    queryKey: ['advancedModeQuest', userId],
    queryFn: () => base44.entities.Quest.filter({ user_id: userId, quest_template_id: 'advanced_mode_pathway' }, '-created_date', 1),
    enabled: !!userId,
  });

  const quest = questRecords[0];
  const flags = quest?.initiation_data?.choices_made || {};

  // Auto-check profile-based steps
  const autoFlags = useMemo(() => {
    const f = { ...flags };
    if (profile?.avatar_url && profile?.bio && profile?.location) f.explore_profile = true;
    if ((profile?.ggg_balance || 0) > 0) f.earn_ggg = true;
    return f;
  }, [flags, profile]);

  const completedSteps = QUEST_STEPS.filter((s, i) => {
    if (s.id === 'explore_profile' || s.id === 'earn_ggg') return s.check(profile, autoFlags);
    if (s.id === 'unlock_advanced') return autoFlags.advanced_unlocked;
    return autoFlags[s.id];
  });

  const currentStepIndex = completedSteps.length;
  const progressPct = Math.round((completedSteps.length / QUEST_STEPS.length) * 100);
  const allPreFinalDone = currentStepIndex >= QUEST_STEPS.length - 1;
  const isFullyComplete = autoFlags.advanced_unlocked;

  const startQuestMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Quest.create({
        user_id: userId,
        title: 'Unlock Advanced Mode',
        description: 'Complete the guided pathway to unlock the full platform experience.',
        quest_type: 'pathway',
        category: 'onboarding',
        quest_template_id: 'advanced_mode_pathway',
        rarity: 'epic',
        status: 'active',
        target_count: QUEST_STEPS.length,
        current_count: 0,
        reward_rp: 50,
        reward_ggg: 1.0,
        reward_badge: 'advanced_explorer',
        reward_title: 'Advanced Explorer',
        reward_access: ['premium_features', 'early_tools'],
        started_at: new Date().toISOString(),
        initiation_data: {
          total_steps: QUEST_STEPS.length,
          steps_completed: [],
          choices_made: {},
        },
        pathway_data: {
          pathway_id: 'advanced_mode',
          pathway_name: 'Advanced Mode Pathway',
          current_stage: 1,
          total_stages: QUEST_STEPS.length,
          stages: QUEST_STEPS.map((s, i) => ({
            stage_num: i + 1,
            title: s.title,
            target_action: s.id,
            target_count: 1,
            current_count: 0,
            completed: false,
          })),
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['advancedModeQuest'] }),
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (stepId) => {
      const newFlags = { ...autoFlags, [stepId]: true };
      const stepsCompleted = [...(quest.initiation_data?.steps_completed || []), stepId];
      await base44.entities.Quest.update(quest.id, {
        current_count: stepsCompleted.length,
        initiation_data: {
          ...quest.initiation_data,
          steps_completed: stepsCompleted,
          choices_made: newFlags,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['advancedModeQuest'] }),
  });

  const unlockAdvancedMutation = useMutation({
    mutationFn: async () => {
      const newFlags = { ...autoFlags, advanced_unlocked: true };
      await base44.entities.Quest.update(quest.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        current_count: QUEST_STEPS.length,
        initiation_data: {
          ...quest.initiation_data,
          steps_completed: QUEST_STEPS.map(s => s.id),
          choices_made: newFlags,
        },
      });
      // Save advanced mode on profile
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, {
          command_deck_layout: {
            ...(profile.command_deck_layout || {}),
            view_mode: 'standard',
          },
        });
      }
    },
    onSuccess: () => {
      setCelebrating(true);
      queryClient.invalidateQueries({ queryKey: ['advancedModeQuest'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      setTimeout(() => setCelebrating(false), 4000);
    },
  });

  if (isLoading) return null;

  // Quest not started yet — show intro card
  if (!quest) {
    return (
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-amber-50/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shrink-0">
              <Rocket className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900">Unlock Advanced Mode</h3>
                <Badge className="bg-amber-100 text-amber-700 text-[10px]">Epic Quest</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                You're in Simple Mode. Ready to discover the full power of the platform? 
                This guided quest walks you through every major feature — from matching and messaging 
                to missions, marketplace, and earning GGG. Complete all steps to unlock Advanced Mode 
                with expanded tools and features.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {QUEST_STEPS.length} steps</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> 1.0 GGG</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-violet-500" /> 50 RP</span>
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Badge</span>
              </div>
              <Button onClick={() => startQuestMutation.mutate()} disabled={startQuestMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Rocket className="w-4 h-4" />
                {startQuestMutation.isPending ? 'Starting...' : 'Begin the Quest'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quest complete — celebration
  if (isFullyComplete) {
    return (
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 overflow-hidden">
        <CardContent className="p-6 text-center">
          <AnimatePresence>
            {celebrating && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <div className="text-6xl">🎉</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="inline-flex p-3 rounded-full bg-emerald-100 mb-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-emerald-800 mb-1">Advanced Mode Unlocked!</h3>
          <p className="text-sm text-slate-600 mb-2">You've completed all steps and unlocked the full platform experience. Enjoy expanded tools, features, and capabilities.</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <Badge className="bg-amber-100 text-amber-700"><Zap className="w-3 h-3 mr-1" />+1.0 GGG</Badge>
            <Badge className="bg-violet-100 text-violet-700"><Star className="w-3 h-3 mr-1" />+50 RP</Badge>
            <Badge className="bg-emerald-100 text-emerald-700"><Shield className="w-3 h-3 mr-1" />Advanced Explorer</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quest in progress — show steps
  return (
    <Card className="border-violet-200/50 overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Unlock Advanced Mode</h3>
              <p className="text-[11px] text-slate-500">{completedSteps.length} of {QUEST_STEPS.length} steps complete</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-violet-600">{progressPct}%</p>
          </div>
        </div>

        <Progress value={progressPct} className="h-2 mb-5" />

        {/* Steps */}
        <div className="space-y-3">
          {QUEST_STEPS.map((step, i) => {
            const done = completedSteps.includes(step);
            const isCurrent = i === currentStepIndex;
            const locked = i > currentStepIndex;

            return (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                isCompleted={done}
                isCurrent={isCurrent}
                isLocked={locked}
                onMarkComplete={(id) => markCompleteMutation.mutate(id)}
              />
            );
          })}
        </div>

        {/* Final unlock button */}
        {allPreFinalDone && !isFullyComplete && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <Button
              onClick={() => unlockAdvancedMutation.mutate()}
              disabled={unlockAdvancedMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2 h-12 text-base"
            >
              <Gift className="w-5 h-5" />
              {unlockAdvancedMutation.isPending ? 'Unlocking...' : 'Unlock Advanced Mode & Claim Rewards'}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}