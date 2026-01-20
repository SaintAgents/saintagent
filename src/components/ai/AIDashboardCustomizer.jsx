import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Wand2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const CARD_DEFINITIONS = {
  news: { title: 'News & Updates', category: 'content' },
  quickActions: { title: 'Quick Actions', category: 'productivity' },
  quickStart: { title: 'Quick Start Checklist', category: 'onboarding' },
  challenges: { title: 'Challenges & Rewards', category: 'gamification' },
  inbox: { title: 'Inbox & Signals', category: 'communication' },
  collaborators: { title: 'Potential Collaborators', category: 'networking' },
  communityFeed: { title: 'Community Feed', category: 'social' },
  circles: { title: 'Circles & Regions', category: 'community' },
  leaderboard: { title: 'Leaderboard', category: 'gamification' },
  affirmations: { title: 'Affirmations', category: 'spiritual' },
  leaderPathway: { title: 'Leader Pathway', category: 'growth' },
  aiDiscover: { title: 'AI Discover', category: 'matching' },
  syncEngine: { title: 'Synchronicity Engine', category: 'matching' },
  meetings: { title: 'Meetings & Momentum', category: 'collaboration' },
  missions: { title: 'Missions', category: 'projects' },
  projects: { title: 'Projects', category: 'projects' },
  market: { title: 'Marketplace', category: 'economy' },
  influence: { title: 'Influence & Reach', category: 'social' },
  leader: { title: '144K Leader Channel', category: 'leadership' },
  dailyops: { title: 'Daily Ops', category: 'productivity' }
};

export default function AIDashboardCustomizer({ profile, currentCards, onApplySuggestions }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDashboard = async () => {
    setIsAnalyzing(true);
    try {
      const userContext = {
        profile: {
          skills: profile?.skills || [],
          values: profile?.values_tags || [],
          intentions: profile?.intentions || [],
          current_focus_areas: profile?.current_focus_areas || [],
          spiritual_practices: profile?.spiritual_practices || [],
          collaboration_preferences: profile?.collaboration_preferences || {},
          seeking_support_in: profile?.seeking_support_in || [],
          can_offer_support_in: profile?.can_offer_support_in || []
        },
        activity: {
          meetings_completed: profile?.meetings_completed || 0,
          ggg_balance: profile?.ggg_balance || 0,
          rp_points: profile?.rp_points || 0,
          follower_count: profile?.follower_count || 0,
          leader_tier: profile?.leader_tier || 'none'
        },
        currentDashboard: currentCards
      };

      const prompt = `Analyze this user's profile and activity to suggest optimal dashboard widgets:

User Profile: ${JSON.stringify(userContext.profile)}
Activity Stats: ${JSON.stringify(userContext.activity)}
Current Dashboard Cards: ${JSON.stringify(currentCards)}

Available Widgets: ${Object.keys(CARD_DEFINITIONS).join(', ')}

Based on their focus areas, activity patterns, and goals, recommend:
1. 5 HIGH priority widgets they should have visible
2. 3 MEDIUM priority widgets for occasional use
3. 3 LOW priority widgets they can hide
4. Brief reasoning for each category

Return JSON with this structure:
{
  "high_priority": ["cardId1", "cardId2", ...],
  "medium_priority": ["cardId3", ...],
  "low_priority": ["cardId4", ...],
  "reasoning": {
    "high": "why these cards are essential",
    "medium": "why these are helpful",
    "low": "why these can be hidden"
  }
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            high_priority: { type: 'array', items: { type: 'string' } },
            medium_priority: { type: 'array', items: { type: 'string' } },
            low_priority: { type: 'array', items: { type: 'string' } },
            reasoning: { 
              type: 'object',
              properties: {
                high: { type: 'string' },
                medium: { type: 'string' },
                low: { type: 'string' }
              }
            }
          }
        }
      });

      setSuggestions(result);
    } catch (error) {
      console.error('Dashboard analysis failed:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestions = () => {
    if (suggestions && onApplySuggestions) {
      onApplySuggestions(suggestions);
      toast.success('Dashboard layout optimized');
    }
  };

  return (
    <Card className="border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-violet-600" />
            AI Dashboard Optimizer
          </span>
          <Button
            size="sm"
            onClick={analyzeDashboard}
            disabled={isAnalyzing}
            variant="outline"
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!suggestions ? (
          <div className="text-center py-6">
            <Wand2 className="w-10 h-10 text-violet-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              AI will analyze your profile and activity to suggest the best dashboard layout for your goals.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* High Priority */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-emerald-500 text-white">HIGH PRIORITY</Badge>
                <Eye className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {suggestions.high_priority?.map((cardId) => (
                  <div
                    key={cardId}
                    className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-900">
                      {CARD_DEFINITIONS[cardId]?.title || cardId}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">{suggestions.reasoning?.high}</p>
            </div>

            {/* Medium Priority */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-amber-500 text-white">MEDIUM</Badge>
                <Eye className="w-4 h-4 text-amber-600" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {suggestions.medium_priority?.map((cardId) => (
                  <div
                    key={cardId}
                    className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-sm font-medium text-slate-900">
                      {CARD_DEFINITIONS[cardId]?.title || cardId}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">{suggestions.reasoning?.medium}</p>
            </div>

            {/* Low Priority */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-slate-400 text-white">LOW PRIORITY</Badge>
                <EyeOff className="w-4 h-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {suggestions.low_priority?.map((cardId) => (
                  <div
                    key={cardId}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-500">
                      {CARD_DEFINITIONS[cardId]?.title || cardId}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 italic">{suggestions.reasoning?.low}</p>
            </div>

            {/* Apply Button */}
            <Button
              onClick={applySuggestions}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Apply AI Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}