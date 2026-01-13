import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Compass, Brain, Star, Zap, ChevronRight,
  RefreshCw, Loader2, Target, Crown, Heart, Users, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Archetype to quest category mapping
const ARCHETYPE_QUEST_CATEGORIES = {
  healer: { categories: ['healing', 'mentorship', 'service'], icon: Heart, color: 'pink' },
  builder: { categories: ['creation', 'technology', 'innovation'], icon: Target, color: 'blue' },
  teacher: { categories: ['knowledge', 'guidance', 'content'], icon: BookOpen, color: 'amber' },
  seeker: { categories: ['exploration', 'spiritual', 'discovery'], icon: Compass, color: 'violet' },
  guardian: { categories: ['protection', 'leadership', 'stewardship'], icon: Crown, color: 'emerald' },
  visionary: { categories: ['prophecy', 'future', 'inspiration'], icon: Sparkles, color: 'orange' },
  connector: { categories: ['networking', 'collaboration', 'harmony'], icon: Users, color: 'cyan' }
};

export default function QuestSuggestionEngine({ userId, profile, badges = [], completedQuests = [] }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [suggestedQuests, setSuggestedQuests] = useState([]);

  // Analyze user's archetypes from badges
  const getUserArchetypes = () => {
    const archetypeBadges = badges.filter(b => 
      b.category === 'identity' || b.code?.includes('archetype')
    );
    
    const archetypes = [];
    archetypeBadges.forEach(badge => {
      Object.keys(ARCHETYPE_QUEST_CATEGORIES).forEach(archetype => {
        if (badge.code?.toLowerCase().includes(archetype) || 
            badge.title?.toLowerCase().includes(archetype)) {
          archetypes.push(archetype);
        }
      });
    });

    // Default to seeker if no archetypes found
    return archetypes.length > 0 ? [...new Set(archetypes)] : ['seeker'];
  };

  // Get user's progress patterns
  const analyzeProgress = () => {
    const categories = {};
    const completedTypes = {};
    
    completedQuests.forEach(quest => {
      if (quest.category) {
        categories[quest.category] = (categories[quest.category] || 0) + 1;
      }
      if (quest.quest_type) {
        completedTypes[quest.quest_type] = (completedTypes[quest.quest_type] || 0) + 1;
      }
    });

    return {
      preferredCategories: Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k),
      preferredTypes: Object.entries(completedTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k),
      totalCompleted: completedQuests.length,
      streakBonus: completedQuests.length >= 7 ? 1.5 : completedQuests.length >= 3 ? 1.2 : 1
    };
  };

  const archetypes = getUserArchetypes();
  const progressData = analyzeProgress();

  // Generate AI-powered quest suggestions
  const generateSuggestions = useMutation({
    mutationFn: async () => {
      setGenerating(true);

      const prompt = `Generate 5 personalized quest suggestions for a user with these characteristics:

Identity Archetypes: ${archetypes.join(', ')}
Preferred Quest Categories: ${progressData.preferredCategories.join(', ') || 'None yet'}
Quests Completed: ${progressData.totalCompleted}
Badges Earned: ${badges.map(b => b.title || b.code).slice(0, 5).join(', ') || 'None yet'}
Rank: ${profile?.rp_rank_code || 'seeker'}

Create quests that:
1. Align with their archetype(s) and preferred categories
2. Build on their current progress and achievements
3. Introduce variety while staying relevant
4. Include both achievable short-term and aspirational long-term quests
5. Connect to their earned badges for continuity

For each quest, explain WHY it's suggested for this user.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  quest_type: { type: "string" },
                  category: { type: "string" },
                  target_action: { type: "string" },
                  target_count: { type: "number" },
                  reward_rp: { type: "number" },
                  reward_ggg: { type: "number" },
                  rarity: { type: "string" },
                  suggestion_reason: { type: "string" },
                  archetype_connection: { type: "string" },
                  badge_connection: { type: "string" },
                  relevance_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      return response.suggestions || [];
    },
    onSuccess: (suggestions) => {
      setSuggestedQuests(suggestions);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  // Accept a suggested quest
  const acceptQuest = useMutation({
    mutationFn: async (suggestion) => {
      const quest = await base44.entities.Quest.create({
        user_id: userId,
        title: suggestion.title,
        description: suggestion.description,
        quest_type: suggestion.quest_type || 'discovery',
        category: suggestion.category || 'ai_generated',
        target_action: suggestion.target_action,
        target_count: suggestion.target_count || 1,
        current_count: 0,
        reward_rp: Math.round(suggestion.reward_rp * progressData.streakBonus),
        reward_ggg: Math.round(suggestion.reward_ggg * progressData.streakBonus),
        rarity: suggestion.rarity || 'uncommon',
        status: 'active',
        visibility: 'suggested',
        ai_generated: {
          is_ai_generated: true,
          generation_context: 'suggestion_engine',
          personalization_factors: archetypes
        },
        suggestion_data: {
          suggestion_reason: suggestion.suggestion_reason,
          relevance_score: suggestion.relevance_score,
          based_on_badges: badges.slice(0, 3).map(b => b.code),
          based_on_archetypes: archetypes
        },
        started_at: new Date().toISOString()
      });
      return quest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      queryClient.invalidateQueries({ queryKey: ['timelineQuests'] });
    }
  });

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" />
            <CardTitle className="text-lg text-slate-900">Quest Suggestions</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateSuggestions.mutate()}
            disabled={generating}
            className="text-violet-600 hover:text-violet-700"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          Personalized based on your archetypes and progress
        </p>
      </CardHeader>
      <CardContent>
        {/* User's Archetypes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {archetypes.map(archetype => {
            const config = ARCHETYPE_QUEST_CATEGORIES[archetype];
            const Icon = config?.icon || Compass;
            return (
              <Badge 
                key={archetype} 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1",
                  config?.color === 'pink' && "border-pink-300 text-pink-700",
                  config?.color === 'blue' && "border-blue-300 text-blue-700",
                  config?.color === 'amber' && "border-amber-300 text-amber-700",
                  config?.color === 'violet' && "border-violet-300 text-violet-700",
                  config?.color === 'emerald' && "border-emerald-300 text-emerald-700",
                  config?.color === 'orange' && "border-orange-300 text-orange-700",
                  config?.color === 'cyan' && "border-cyan-300 text-cyan-700"
                )}
              >
                <Icon className="w-3 h-3" />
                {archetype.charAt(0).toUpperCase() + archetype.slice(1)}
              </Badge>
            );
          })}
        </div>

        {/* Generate Button */}
        {suggestedQuests.length === 0 && !generating && (
          <Button
            onClick={() => generateSuggestions.mutate()}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Personalized Quests
          </Button>
        )}

        {/* Loading State */}
        {generating && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-violet-600 mx-auto animate-spin mb-3" />
            <p className="text-sm text-slate-600">Analyzing your journey...</p>
          </div>
        )}

        {/* Suggested Quests */}
        {suggestedQuests.length > 0 && (
          <ScrollArea className="h-80">
            <div className="space-y-3 pr-4">
              {suggestedQuests.map((suggestion, idx) => (
                <SuggestedQuestCard
                  key={idx}
                  suggestion={suggestion}
                  onAccept={() => acceptQuest.mutate(suggestion)}
                  isAccepting={acceptQuest.isPending}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function SuggestedQuestCard({ suggestion, onAccept, isAccepting }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="p-3 rounded-xl border border-violet-200 bg-white hover:shadow-md transition-all"
    >
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm">{suggestion.title}</h4>
          <p className="text-xs text-slate-500 line-clamp-1">{suggestion.description}</p>
        </div>
        <ChevronRight className={cn(
          "w-4 h-4 text-slate-400 transition-transform shrink-0",
          expanded && "rotate-90"
        )} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-slate-100">
              {/* Why this quest */}
              <div className="p-2 rounded-lg bg-violet-50 mb-3">
                <p className="text-xs text-violet-700">
                  <strong>Why this quest:</strong> {suggestion.suggestion_reason}
                </p>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span className="text-slate-600">+{suggestion.reward_rp} RP</span>
                </div>
                {suggestion.reward_ggg > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span className="text-slate-600">+{suggestion.reward_ggg} GGG</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs ml-auto">
                  {suggestion.rarity}
                </Badge>
              </div>

              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
                disabled={isAccepting}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isAccepting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Accept Quest
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}