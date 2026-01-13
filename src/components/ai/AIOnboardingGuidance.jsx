import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Compass, Brain, Star, Zap, ChevronRight,
  Loader2, MessageSquare, Target, Crown, Heart, BookOpen,
  Eye, Flame, Shield, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Pathway definitions based on user archetypes and intentions
const PATHWAYS = {
  healer: {
    name: 'Path of the Healer',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    description: 'Develop your healing gifts and serve others',
    stages: ['Foundation', 'Practice', 'Mastery', 'Teaching']
  },
  builder: {
    name: 'Path of the Builder',
    icon: Target,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    description: 'Create systems and structures for the new world',
    stages: ['Vision', 'Blueprint', 'Construction', 'Legacy']
  },
  teacher: {
    name: 'Path of the Teacher',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    description: 'Share wisdom and guide others on their journey',
    stages: ['Learning', 'Synthesis', 'Transmission', 'Lineage']
  },
  seeker: {
    name: 'Path of the Seeker',
    icon: Compass,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    description: 'Explore the mysteries and expand consciousness',
    stages: ['Awakening', 'Exploration', 'Integration', 'Illumination']
  },
  guardian: {
    name: 'Path of the Guardian',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    description: 'Protect and nurture community growth',
    stages: ['Training', 'Service', 'Leadership', 'Stewardship']
  }
};

// Initiation recommendations based on coherence level
const INITIATION_RECOMMENDATIONS = {
  low: ['144k_activation'], // 1-4 coherence
  medium: ['144k_activation', '7th_seal'], // 5-7 coherence
  high: ['7th_seal', 'high_priesthood'], // 8-10 coherence
};

export default function AIOnboardingGuidance({ userId, profile }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [transmission, setTransmission] = useState(null);
  const [showTransmission, setShowTransmission] = useState(false);

  // Fetch user's quests and initiations
  const { data: quests = [] } = useQuery({
    queryKey: ['userQuests', userId],
    queryFn: () => base44.entities.Quest.filter({ user_id: userId }),
    enabled: !!userId
  });

  const { data: initiations = [] } = useQuery({
    queryKey: ['userInitiations', userId],
    queryFn: () => base44.entities.Initiation.filter({ user_id: userId }),
    enabled: !!userId
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', userId],
    queryFn: () => base44.entities.Badge.filter({ user_id: userId }),
    enabled: !!userId
  });

  // Analyze user's current state
  const analyzeUserState = () => {
    const completedQuests = quests.filter(q => q.status === 'completed' || q.status === 'claimed');
    const completedInitiations = initiations.filter(i => i.status === 'completed' || i.status === 'integrated');
    
    // Determine dominant archetype from intentions
    let dominantArchetype = 'seeker';
    const intentions = profile?.intentions || [];
    
    if (intentions.includes('teach_mentor') || intentions.includes('host_events')) {
      dominantArchetype = 'teacher';
    } else if (intentions.includes('build_project') || intentions.includes('grow_influence')) {
      dominantArchetype = 'builder';
    } else if (intentions.includes('find_collaborators') || intentions.includes('join_missions')) {
      dominantArchetype = 'guardian';
    } else if (intentions.includes('spiritual_growth') || intentions.includes('learn_skills')) {
      dominantArchetype = 'seeker';
    }

    // Calculate average coherence
    const avgCoherence = completedInitiations.length > 0
      ? Math.round(completedInitiations.reduce((sum, i) => sum + (i.coherence_factor || 5), 0) / completedInitiations.length)
      : 5;

    // Determine coherence level
    let coherenceLevel = 'low';
    if (avgCoherence >= 8) coherenceLevel = 'high';
    else if (avgCoherence >= 5) coherenceLevel = 'medium';

    return {
      dominantArchetype,
      avgCoherence,
      coherenceLevel,
      completedQuests: completedQuests.length,
      completedInitiations: completedInitiations.length,
      totalBadges: badges.length,
      isNewUser: completedQuests.length < 3 && completedInitiations.length === 0
    };
  };

  const userState = analyzeUserState();
  const recommendedPathway = PATHWAYS[userState.dominantArchetype] || PATHWAYS.seeker;
  const recommendedInitiations = INITIATION_RECOMMENDATIONS[userState.coherenceLevel] || [];

  // Generate AI guidance transmission
  const generateTransmission = useMutation({
    mutationFn: async () => {
      setGenerating(true);

      const prompt = `Generate a personalized guidance transmission for a spiritual seeker with these characteristics:

Current State:
- Dominant Archetype: ${userState.dominantArchetype}
- Coherence Level: ${userState.avgCoherence}/10
- Quests Completed: ${userState.completedQuests}
- Initiations Completed: ${userState.completedInitiations}
- Is New User: ${userState.isNewUser}

Profile Data:
- Intentions: ${profile?.intentions?.join(', ') || 'Not set'}
- Values: ${profile?.values_tags?.join(', ') || 'Not set'}
- Spiritual Practices: ${profile?.spiritual_practices?.join(', ') || 'Not set'}
- Seeking Support In: ${profile?.seeking_support_in?.join(', ') || 'Not set'}

Recommended Pathway: ${recommendedPathway.name}

Create a personalized guidance transmission that:
1. Speaks directly to their current level of development
2. Acknowledges their archetype and intentions
3. Provides specific next steps for their journey
4. Adapts language complexity to their coherence level (simpler for lower coherence, more esoteric for higher)
5. Includes a mystical/inspirational element appropriate to their path
6. Recommends specific actions they can take today

The transmission should feel like wisdom from a loving guide, not a generic message.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            transmission: {
              type: "object",
              properties: {
                greeting: { type: "string" },
                acknowledgment: { type: "string" },
                current_phase: { type: "string" },
                guidance: { type: "string" },
                next_steps: { type: "array", items: { type: "string" } },
                mystical_insight: { type: "string" },
                closing: { type: "string" }
              }
            }
          }
        }
      });

      return response.transmission;
    },
    onSuccess: (data) => {
      setTransmission(data);
      setShowTransmission(true);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  // Calculate pathway progress
  const getPathwayProgress = () => {
    const totalActions = userState.completedQuests + userState.completedInitiations + userState.totalBadges;
    const stageThresholds = [0, 5, 15, 30, 50];
    let currentStage = 0;
    
    for (let i = 0; i < stageThresholds.length; i++) {
      if (totalActions >= stageThresholds[i]) currentStage = i;
    }

    const nextThreshold = stageThresholds[Math.min(currentStage + 1, stageThresholds.length - 1)];
    const progress = Math.min(100, (totalActions / nextThreshold) * 100);

    return { currentStage, progress, totalActions };
  };

  const pathwayProgress = getPathwayProgress();

  return (
    <div className="space-y-6">
      {/* Current Pathway Card */}
      <Card className={cn("border-2", recommendedPathway.bgColor, "border-slate-200")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                recommendedPathway.color
              )}>
                <recommendedPathway.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-900">{recommendedPathway.name}</CardTitle>
                <CardDescription>{recommendedPathway.description}</CardDescription>
              </div>
            </div>
            <Badge className={cn("bg-gradient-to-r text-white", recommendedPathway.color)}>
              Stage {pathwayProgress.currentStage + 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pathway Stages */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {recommendedPathway.stages.map((stage, idx) => (
              <div 
                key={idx}
                className={cn(
                  "text-center p-2 rounded-lg text-xs font-medium",
                  idx <= pathwayProgress.currentStage
                    ? cn("bg-gradient-to-r text-white", recommendedPathway.color)
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {stage}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress to next stage</span>
              <span>{Math.round(pathwayProgress.progress)}%</span>
            </div>
            <Progress value={pathwayProgress.progress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-white/60">
              <p className="text-lg font-bold text-slate-900">{userState.completedQuests}</p>
              <p className="text-xs text-slate-600">Quests</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/60">
              <p className="text-lg font-bold text-slate-900">{userState.completedInitiations}</p>
              <p className="text-xs text-slate-600">Initiations</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/60">
              <p className="text-lg font-bold text-slate-900">{userState.avgCoherence}/10</p>
              <p className="text-xs text-slate-600">Coherence</p>
            </div>
          </div>

          {/* Generate Guidance Button */}
          <Button
            onClick={() => generateTransmission.mutate()}
            disabled={generating}
            className={cn("w-full bg-gradient-to-r text-white", recommendedPathway.color)}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Receive Guidance Transmission
          </Button>
        </CardContent>
      </Card>

      {/* Recommended Initiations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-violet-600" />
            <CardTitle className="text-lg">Recommended Initiations</CardTitle>
          </div>
          <CardDescription>
            Based on your coherence level ({userState.avgCoherence}/10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedInitiations.map(initType => (
              <InitiationRecommendation 
                key={initType} 
                initType={initType}
                completed={initiations.some(i => 
                  i.initiation_type === initType && 
                  (i.status === 'completed' || i.status === 'integrated')
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guidance Transmission Modal */}
      <AnimatePresence>
        {showTransmission && transmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowTransmission(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl",
                "bg-gradient-to-br from-violet-900 to-purple-900 text-white"
              )}
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-white/10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                >
                  <Flame className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-xl font-bold text-amber-400">Guidance Transmission</h2>
                <p className="text-violet-300 text-sm mt-1">{recommendedPathway.name}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Greeting */}
                <p className="text-lg text-amber-300 italic">{transmission.greeting}</p>

                {/* Acknowledgment */}
                <p className="text-violet-200">{transmission.acknowledgment}</p>

                {/* Current Phase */}
                <div className="p-3 rounded-xl bg-white/10">
                  <p className="text-xs text-violet-400 font-medium mb-1">Current Phase</p>
                  <p className="text-white">{transmission.current_phase}</p>
                </div>

                {/* Guidance */}
                <p className="text-violet-100">{transmission.guidance}</p>

                {/* Next Steps */}
                {transmission.next_steps?.length > 0 && (
                  <div>
                    <p className="text-xs text-violet-400 font-medium mb-2">Next Steps</p>
                    <ul className="space-y-2">
                      {transmission.next_steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-violet-200">
                          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mystical Insight */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30">
                  <p className="text-xs text-amber-400 font-medium mb-1">✨ Mystical Insight</p>
                  <p className="text-amber-200 italic">"{transmission.mystical_insight}"</p>
                </div>

                {/* Closing */}
                <p className="text-violet-300 text-center">{transmission.closing}</p>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <Button
                  onClick={() => setShowTransmission(false)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  Close Transmission
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InitiationRecommendation({ initType, completed }) {
  const initiationConfig = {
    '144k_activation': {
      title: '144K Activation',
      description: 'Activate your node in the planetary grid',
      icon: '🌍',
      color: 'amber'
    },
    '7th_seal': {
      title: '7th Seal Initiation',
      description: 'Open the seal of timeline convergence',
      icon: '👁️',
      color: 'violet'
    },
    'high_priesthood': {
      title: 'High Priesthood',
      description: 'Remember your lineage across ages',
      icon: '👑',
      color: 'purple'
    }
  };

  const config = initiationConfig[initType] || {};

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      completed 
        ? "bg-emerald-50 border-emerald-200" 
        : "bg-slate-50 border-slate-200 hover:border-violet-300"
    )}>
      <span className="text-2xl">{config.icon}</span>
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 text-sm">{config.title}</h4>
        <p className="text-xs text-slate-500">{config.description}</p>
      </div>
      {completed ? (
        <Badge className="bg-emerald-500 text-white">✓ Completed</Badge>
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-400" />
      )}
    </div>
  );
}