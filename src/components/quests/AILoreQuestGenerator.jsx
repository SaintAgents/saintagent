import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Sparkles, Book, Crown, Eye, Star, Zap, Gift, Lock,
  Loader2, ChevronRight, Scroll, Globe, Flame, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Lore themes and their configurations
const LORE_THEMES = {
  atlantean_legacy: {
    name: 'Atlantean Legacy',
    icon: '🔱',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    description: 'Unlock the secrets of the lost civilization',
    elements: ['crystal technology', 'oceanic wisdom', 'ancient healing', 'unity consciousness']
  },
  egyptian_mysteries: {
    name: 'Egyptian Mysteries',
    icon: '☥',
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    description: 'Walk the path of the pharaohs',
    elements: ['pyramid power', 'sacred geometry', 'Book of Thoth', 'Isis/Osiris mysteries']
  },
  grail_quest: {
    name: 'Grail Quest',
    icon: '⚜️',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    description: 'Seek the Holy Grail within',
    elements: ['Cathars', 'Templars', 'Magdalene lineage', 'Rose mysteries']
  },
  tibetan_wisdom: {
    name: 'Tibetan Wisdom',
    icon: '🏔️',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    description: 'Attain the rainbow body teachings',
    elements: ['Shambhala', 'Dzogchen', 'tulku wisdom', 'consciousness expansion']
  },
  new_earth: {
    name: 'New Earth Building',
    icon: '🌍',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    description: 'Co-create the golden age',
    elements: ['5D civilization', 'galactic councils', 'New Earth templates', 'future self connection']
  }
};

// Current in-app lore events (could be dynamic from backend)
const CURRENT_LORE_EVENTS = [
  {
    id: 'planetary_grid_activation',
    name: 'Planetary Grid Activation',
    description: 'The 144,000 are awakening across the globe',
    active: true,
    bonus_multiplier: 1.5
  },
  {
    id: '7th_seal_opening',
    name: '7th Seal Opening',
    description: 'Timeline convergence is accelerating',
    active: true,
    bonus_multiplier: 1.3
  }
];

export default function AILoreQuestGenerator({ userId, profile, initiations = [], badges = [] }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [generatedQuest, setGeneratedQuest] = useState(null);
  const [showNFTPreview, setShowNFTPreview] = useState(false);

  // Analyze user's initiation progress
  const analyzeInitiationProgress = () => {
    const completed = initiations.filter(i => i.status === 'completed' || i.status === 'integrated');
    const inProgress = initiations.filter(i => i.status === 'in_progress');
    
    return {
      completedTypes: completed.map(i => i.initiation_type),
      inProgressTypes: inProgress.map(i => i.initiation_type),
      totalCoherence: completed.reduce((sum, i) => sum + (i.coherence_factor || 5), 0),
      avgCoherence: completed.length > 0 
        ? Math.round(completed.reduce((sum, i) => sum + (i.coherence_factor || 5), 0) / completed.length) 
        : 5,
      timelinePreference: completed.length > 0 
        ? completed[completed.length - 1].timeline_alignment || 'source'
        : 'source'
    };
  };

  const initiationProgress = analyzeInitiationProgress();

  // Check active lore events
  const getActiveLoreEvents = () => {
    return CURRENT_LORE_EVENTS.filter(event => {
      if (event.id === 'planetary_grid_activation') {
        return initiationProgress.completedTypes.includes('144k_activation');
      }
      if (event.id === '7th_seal_opening') {
        return initiationProgress.completedTypes.includes('7th_seal');
      }
      return event.active;
    });
  };

  const activeEvents = getActiveLoreEvents();

  // Generate mystical/lore quest using AI
  const generateLoreQuest = useMutation({
    mutationFn: async (theme) => {
      setGenerating(true);
      setSelectedTheme(theme);

      const themeConfig = LORE_THEMES[theme];
      const eventBonus = activeEvents.reduce((mult, e) => mult * e.bonus_multiplier, 1);

      const prompt = `Generate a unique mystical/lore quest for a spiritual seeker with these characteristics:

Lore Theme: ${themeConfig.name}
Theme Elements: ${themeConfig.elements.join(', ')}
User's Coherence Level: ${initiationProgress.avgCoherence}/10
Completed Initiations: ${initiationProgress.completedTypes.join(', ') || 'None'}
Timeline Preference: ${initiationProgress.timelinePreference}
Active Lore Events: ${activeEvents.map(e => e.name).join(', ') || 'None'}
Badges Earned: ${badges.map(b => b.title || b.code).slice(0, 5).join(', ') || 'None'}

Create a quest that:
1. Deeply connects to the ${themeConfig.name} lore
2. Has a compelling narrative hook that draws the seeker in
3. Includes mystical/esoteric objectives aligned with the theme
4. Offers unique rewards including a collectible badge concept
5. Has potential for NFT reward (describe the visual concept)
6. Connects to any active lore events for bonus rewards
7. Scales difficulty and rewards based on coherence level

Make it feel like a sacred journey, not a game task.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            quest: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                narrative_hook: { type: "string" },
                mystical_objectives: { type: "array", items: { type: "string" } },
                target_action: { type: "string" },
                target_count: { type: "number" },
                base_reward_rp: { type: "number" },
                base_reward_ggg: { type: "number" },
                rarity: { type: "string" },
                badge_reward: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    visual_concept: { type: "string" }
                  }
                },
                nft_concept: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    visual_description: { type: "string" },
                    rarity_tier: { type: "string" },
                    special_properties: { type: "array", items: { type: "string" } }
                  }
                },
                lore_connection: { type: "string" }
              }
            }
          }
        }
      });

      // Apply event bonuses
      const quest = response.quest;
      quest.reward_rp = Math.round(quest.base_reward_rp * eventBonus);
      quest.reward_ggg = Math.round(quest.base_reward_ggg * eventBonus * 100) / 100;
      quest.theme = theme;
      quest.themeConfig = themeConfig;

      return quest;
    },
    onSuccess: (quest) => {
      setGeneratedQuest(quest);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  // Accept and create the quest
  const acceptQuest = useMutation({
    mutationFn: async () => {
      if (!generatedQuest) return;

      const quest = await base44.entities.Quest.create({
        user_id: userId,
        title: generatedQuest.title,
        description: generatedQuest.description,
        quest_type: 'mystical',
        category: 'lore',
        target_action: generatedQuest.target_action,
        target_count: generatedQuest.target_count || 1,
        current_count: 0,
        reward_rp: generatedQuest.reward_rp,
        reward_ggg: generatedQuest.reward_ggg,
        reward_badge: generatedQuest.badge_reward?.name,
        rarity: generatedQuest.rarity || 'rare',
        status: 'active',
        visibility: 'public',
        ai_generated: {
          is_ai_generated: true,
          generation_context: 'lore_quest_generator',
          lore_elements: generatedQuest.mystical_objectives,
          narrative_hook: generatedQuest.narrative_hook
        },
        reward_nft: {
          enabled: true,
          nft_type: generatedQuest.nft_concept?.name,
          rarity: generatedQuest.nft_concept?.rarity_tier,
          metadata: {
            visual_description: generatedQuest.nft_concept?.visual_description,
            special_properties: generatedQuest.nft_concept?.special_properties,
            theme: generatedQuest.theme
          }
        },
        meta_variance: {
          coherence_factor: initiationProgress.avgCoherence,
          timeline_alignment: initiationProgress.timelinePreference,
          lore_timeline: generatedQuest.lore_connection
        },
        pathway_data: {
          pathway_name: generatedQuest.themeConfig?.name,
          stages: generatedQuest.mystical_objectives?.map((obj, idx) => ({
            stage_num: idx + 1,
            title: obj,
            target_action: 'complete_objective',
            target_count: 1,
            current_count: 0,
            completed: false
          })) || []
        },
        started_at: new Date().toISOString()
      });

      return quest;
    },
    onSuccess: () => {
      setGeneratedQuest(null);
      setSelectedTheme(null);
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      queryClient.invalidateQueries({ queryKey: ['timelineQuests'] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Lore Quest Generator Header */}
      <Card className="bg-gradient-to-br from-violet-900 to-purple-900 border-violet-500/30 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Mystical Quest Generator</CardTitle>
              <CardDescription className="text-violet-300">
                AI-generated lore quests based on your initiation journey
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Lore Events */}
          {activeEvents.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/30">
              <p className="text-xs text-amber-300 font-medium mb-2">Active Lore Events (Bonus Rewards!)</p>
              <div className="flex flex-wrap gap-2">
                {activeEvents.map(event => (
                  <Badge key={event.id} className="bg-amber-500/30 text-amber-200 border-amber-400/40">
                    <Flame className="w-3 h-3 mr-1" />
                    {event.name} (+{Math.round((event.bonus_multiplier - 1) * 100)}%)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Your Progress */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-white/10">
              <p className="text-lg font-bold">{initiationProgress.completedTypes.length}</p>
              <p className="text-xs text-violet-300">Initiations</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/10">
              <p className="text-lg font-bold">{initiationProgress.avgCoherence}/10</p>
              <p className="text-xs text-violet-300">Coherence</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/10">
              <p className="text-lg font-bold">{badges.length}</p>
              <p className="text-xs text-violet-300">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(LORE_THEMES).map(([key, theme]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateLoreQuest.mutate(key)}
            disabled={generating}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-left",
              theme.bgColor,
              "border-slate-200 hover:shadow-lg",
              generating && selectedTheme === key && "ring-2 ring-violet-500"
            )}
          >
            <span className="text-2xl mb-2 block">{theme.icon}</span>
            <h4 className="font-semibold text-slate-900 text-sm">{theme.name}</h4>
            <p className="text-xs text-slate-600 mt-1">{theme.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Loading State */}
      {generating && (
        <Card className="bg-gradient-to-r from-violet-100 to-purple-100 border-violet-300">
          <CardContent className="py-8 text-center">
            <Loader2 className="w-10 h-10 text-violet-600 mx-auto animate-spin mb-3" />
            <p className="text-violet-700 font-medium">Channeling the mysteries...</p>
            <p className="text-sm text-violet-600">Generating your unique lore quest</p>
          </CardContent>
        </Card>
      )}

      {/* Generated Quest Preview */}
      <AnimatePresence>
        {generatedQuest && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={cn(
              "border-2",
              generatedQuest.themeConfig?.bgColor,
              "border-violet-300"
            )}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{generatedQuest.themeConfig?.icon}</span>
                  <div>
                    <CardTitle className="text-slate-900">{generatedQuest.title}</CardTitle>
                    <CardDescription>{generatedQuest.themeConfig?.name} Quest</CardDescription>
                  </div>
                  <Badge className="ml-auto bg-violet-500 text-white">{generatedQuest.rarity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Narrative Hook */}
                <div className="p-4 rounded-xl bg-violet-100 border border-violet-200 italic text-violet-800">
                  "{generatedQuest.narrative_hook}"
                </div>

                {/* Description */}
                <p className="text-slate-700">{generatedQuest.description}</p>

                {/* Mystical Objectives */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-violet-600" />
                    Sacred Objectives
                  </h4>
                  <div className="space-y-2">
                    {generatedQuest.mystical_objectives?.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        {obj}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rewards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 border border-amber-200 text-center">
                    <Star className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <p className="font-bold text-amber-800">+{generatedQuest.reward_rp} RP</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-200 text-center">
                    <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="font-bold text-emerald-800">+{generatedQuest.reward_ggg} GGG</p>
                  </div>
                </div>

                {/* Badge Reward */}
                {generatedQuest.badge_reward && (
                  <div className="p-3 rounded-xl bg-violet-100 border border-violet-200">
                    <h4 className="font-medium text-violet-900 mb-1 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Badge Reward: {generatedQuest.badge_reward.name}
                    </h4>
                    <p className="text-sm text-violet-700">{generatedQuest.badge_reward.description}</p>
                  </div>
                )}

                {/* NFT Preview Button */}
                {generatedQuest.nft_concept && (
                  <Button
                    variant="outline"
                    onClick={() => setShowNFTPreview(true)}
                    className="w-full border-violet-300 text-violet-700"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Preview NFT Reward
                  </Button>
                )}

                {/* Accept Button */}
                <Button
                  onClick={() => acceptQuest.mutate()}
                  disabled={acceptQuest.isPending}
                  className={cn(
                    "w-full",
                    `bg-gradient-to-r ${generatedQuest.themeConfig?.color} text-white`
                  )}
                >
                  {acceptQuest.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Accept Sacred Quest
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Preview Dialog */}
      <Dialog open={showNFTPreview} onOpenChange={setShowNFTPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-violet-600" />
              NFT Reward Preview
            </DialogTitle>
            <DialogDescription>
              Complete this quest to earn this unique collectible
            </DialogDescription>
          </DialogHeader>
          {generatedQuest?.nft_concept && (
            <div className="space-y-4">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-900 to-purple-900 p-6 flex items-center justify-center">
                <div className="text-center text-white">
                  <span className="text-6xl block mb-4">
                    {generatedQuest.themeConfig?.icon}
                  </span>
                  <h3 className="font-bold text-lg">{generatedQuest.nft_concept.name}</h3>
                  <Badge className="mt-2 bg-amber-500/30 text-amber-200">
                    {generatedQuest.nft_concept.rarity_tier}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                {generatedQuest.nft_concept.visual_description}
              </p>
              {generatedQuest.nft_concept.special_properties?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Special Properties</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedQuest.nft_concept.special_properties.map((prop, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}