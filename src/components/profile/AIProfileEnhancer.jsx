import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  Loader2, 
  Check, 
  Plus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Heart,
  Target,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIProfileEnhancer({ userProfile, datingProfile, onUpdate }) {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user activity data for context
  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', userProfile?.user_id],
    queryFn: () => base44.entities.Post.filter({ author_id: userProfile?.user_id }, '-created_date', 20),
    enabled: !!userProfile?.user_id
  });

  const { data: userSkills = [] } = useQuery({
    queryKey: ['userSkills', userProfile?.user_id],
    queryFn: () => base44.entities.Skill.filter({ user_id: userProfile?.user_id }),
    enabled: !!userProfile?.user_id
  });

  const { data: userMissions = [] } = useQuery({
    queryKey: ['userMissions', userProfile?.user_id],
    queryFn: () => base44.entities.Mission.filter({ participant_ids: userProfile?.user_id }, '-created_date', 10),
    enabled: !!userProfile?.user_id
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const context = {
        // Core profile data
        displayName: userProfile?.display_name,
        bio: userProfile?.bio,
        currentSkills: userProfile?.skills || [],
        intentions: userProfile?.intentions || [],
        values: userProfile?.values_tags || [],
        spiritualPractices: userProfile?.spiritual_practices || [],
        consciousnessOrientation: userProfile?.consciousness_orientation || [],
        location: userProfile?.location,
        
        // Dating profile data
        datingBio: datingProfile?.bio,
        seeking: datingProfile?.seeking,
        coreValues: datingProfile?.core_values_ranked || [],
        lifePriorities: datingProfile?.life_priorities || [],
        synchronicityNote: datingProfile?.synchronicity_note,
        relationshipIntent: datingProfile?.relationship_intent,
        growthOrientation: datingProfile?.growth_orientation,
        commDepth: datingProfile?.comm_depth,
        dailyRhythm: datingProfile?.daily_rhythm,
        
        // Activity context
        recentPosts: userPosts.slice(0, 5).map(p => p.content?.slice(0, 200)),
        existingSkills: userSkills.map(s => s.skill_name),
        missionParticipation: userMissions.slice(0, 3).map(m => m.title)
      };

      const prompt = `You are an AI assistant helping users enhance their profiles on a conscious community platform focused on spiritual growth, collaboration, and meaningful connections.

Analyze this user's profile data and activity to suggest improvements:

CURRENT PROFILE:
- Display Name: ${context.displayName || 'Not set'}
- Bio: ${context.bio || 'Not set'}
- Skills: ${context.currentSkills.join(', ') || 'None listed'}
- Values: ${context.values.join(', ') || 'None listed'}
- Intentions: ${context.intentions.join(', ') || 'None listed'}
- Spiritual Practices: ${context.spiritualPractices.join(', ') || 'None listed'}
- Consciousness Orientation: ${context.consciousnessOrientation.join(', ') || 'None listed'}

DATING PROFILE:
- Dating Bio: ${context.datingBio || 'Not set'}
- Seeking: ${context.seeking || 'Not set'}
- Core Values Ranked: ${context.coreValues.join(', ') || 'None listed'}
- Life Priorities: ${context.lifePriorities.join(', ') || 'None listed'}
- Synchronicity Note: ${context.synchronicityNote || 'Not set'}
- Relationship Intent: ${context.relationshipIntent || 'Not set'}
- Growth Orientation: ${context.growthOrientation || 'Not set'}
- Communication Depth: ${context.commDepth || 'Not set'}
- Daily Rhythm: ${context.dailyRhythm || 'Not set'}

USER ACTIVITY:
- Recent Posts: ${context.recentPosts.join(' | ') || 'No recent posts'}
- Existing Skills: ${context.existingSkills.join(', ') || 'None'}
- Mission Participation: ${context.missionParticipation.join(', ') || 'None'}

Based on this information, provide personalized suggestions to enhance their profile. Be specific and reference their existing data. Focus on:
1. Bio improvements (make it more engaging and authentic)
2. Skills they might have based on their activity
3. Core values suggestions based on their posts and interests
4. Life priorities suggestions
5. A meaningful synchronicity note that captures their spiritual journey
6. Interests or qualities they might want to highlight

Keep suggestions authentic to their apparent personality and interests. Don't be generic.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            profile_suggestions: {
              type: "object",
              properties: {
                bio_improvement: { type: "string" },
                bio_reasoning: { type: "string" },
                suggested_skills: { 
                  type: "array", 
                  items: { 
                    type: "object",
                    properties: {
                      skill: { type: "string" },
                      reason: { type: "string" }
                    }
                  }
                },
                suggested_interests: { type: "array", items: { type: "string" } }
              }
            },
            dating_suggestions: {
              type: "object",
              properties: {
                core_values: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      value: { type: "string" },
                      reason: { type: "string" }
                    }
                  }
                },
                life_priorities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      priority: { type: "string" },
                      reason: { type: "string" }
                    }
                  }
                },
                synchronicity_note: { type: "string" },
                synchronicity_reasoning: { type: "string" },
                seeking_improvement: { type: "string" },
                dating_bio_improvement: { type: "string" }
              }
            },
            overall_profile_strength: { type: "number" },
            top_enhancement_priority: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      setAppliedSuggestions(new Set());
    }
  });

  const applySuggestion = async (type, value) => {
    try {
      if (type === 'bio' && userProfile?.id) {
        await base44.entities.UserProfile.update(userProfile.id, { bio: value });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      } else if (type === 'skill' && userProfile?.user_id) {
        await base44.entities.Skill.create({
          user_id: userProfile.user_id,
          skill_name: value,
          type: 'offer',
          proficiency: 3
        });
        queryClient.invalidateQueries({ queryKey: ['userSkills'] });
      } else if (type === 'core_value' && datingProfile?.id) {
        const current = datingProfile.core_values_ranked || [];
        await base44.entities.DatingProfile.update(datingProfile.id, {
          core_values_ranked: [...current, value]
        });
        queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      } else if (type === 'life_priority' && datingProfile?.id) {
        const current = datingProfile.life_priorities || [];
        await base44.entities.DatingProfile.update(datingProfile.id, {
          life_priorities: [...current, value]
        });
        queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      } else if (type === 'synchronicity_note' && datingProfile?.id) {
        await base44.entities.DatingProfile.update(datingProfile.id, {
          synchronicity_note: value
        });
        queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      } else if (type === 'dating_bio' && datingProfile?.id) {
        await base44.entities.DatingProfile.update(datingProfile.id, {
          bio: value
        });
        queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      }
      
      setAppliedSuggestions(prev => new Set([...prev, `${type}-${value}`]));
      onUpdate?.();
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const isApplied = (type, value) => appliedSuggestions.has(`${type}-${value}`);

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            AI Profile Enhancer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="rounded-lg gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : suggestions ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get Suggestions
                </>
              )}
            </Button>
            {suggestions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="rounded-lg"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI analyzes your profile and activity to suggest personalized improvements
        </p>
      </CardHeader>

      {suggestions && expanded && (
        <CardContent className="space-y-6">
          {/* Profile Strength Indicator */}
          {suggestions.overall_profile_strength && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Strength</p>
                <p className="text-xs text-slate-500">{suggestions.top_enhancement_priority}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${suggestions.overall_profile_strength}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-violet-600">{suggestions.overall_profile_strength}%</span>
              </div>
            </div>
          )}

          {/* Core Profile Suggestions */}
          {suggestions.profile_suggestions && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Profile Suggestions
              </h4>

              {/* Bio Improvement */}
              {suggestions.profile_suggestions.bio_improvement && (
                <SuggestionCard
                  title="Bio Enhancement"
                  icon={MessageCircle}
                  iconColor="text-blue-500"
                  value={suggestions.profile_suggestions.bio_improvement}
                  reasoning={suggestions.profile_suggestions.bio_reasoning}
                  onApply={() => applySuggestion('bio', suggestions.profile_suggestions.bio_improvement)}
                  isApplied={isApplied('bio', suggestions.profile_suggestions.bio_improvement)}
                />
              )}

              {/* Suggested Skills */}
              {suggestions.profile_suggestions.suggested_skills?.length > 0 && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Suggested Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.profile_suggestions.suggested_skills.map((item, idx) => (
                      <div key={idx} className="group relative">
                        <Badge
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all",
                            isApplied('skill', item.skill)
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "hover:bg-violet-100 hover:border-violet-300"
                          )}
                          onClick={() => !isApplied('skill', item.skill) && applySuggestion('skill', item.skill)}
                        >
                          {isApplied('skill', item.skill) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1" />
                          )}
                          {item.skill}
                        </Badge>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dating Profile Suggestions */}
          {suggestions.dating_suggestions && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Dating Profile Suggestions
              </h4>

              {/* Core Values */}
              {suggestions.dating_suggestions.core_values?.length > 0 && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Suggested Core Values</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.dating_suggestions.core_values.map((item, idx) => (
                      <div key={idx} className="group relative">
                        <Badge
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all",
                            isApplied('core_value', item.value)
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "hover:bg-rose-100 hover:border-rose-300"
                          )}
                          onClick={() => !isApplied('core_value', item.value) && applySuggestion('core_value', item.value)}
                        >
                          {isApplied('core_value', item.value) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1" />
                          )}
                          {item.value}
                        </Badge>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none max-w-xs text-center">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Life Priorities */}
              {suggestions.dating_suggestions.life_priorities?.length > 0 && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Suggested Life Priorities</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.dating_suggestions.life_priorities.map((item, idx) => (
                      <div key={idx} className="group relative">
                        <Badge
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all",
                            isApplied('life_priority', item.priority)
                              ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                              : "hover:bg-amber-100 hover:border-amber-300"
                          )}
                          onClick={() => !isApplied('life_priority', item.priority) && applySuggestion('life_priority', item.priority)}
                        >
                          {isApplied('life_priority', item.priority) ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1" />
                          )}
                          {item.priority}
                        </Badge>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none max-w-xs text-center">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synchronicity Note */}
              {suggestions.dating_suggestions.synchronicity_note && (
                <SuggestionCard
                  title="Synchronicity Note"
                  icon={Target}
                  iconColor="text-purple-500"
                  value={suggestions.dating_suggestions.synchronicity_note}
                  reasoning={suggestions.dating_suggestions.synchronicity_reasoning}
                  onApply={() => applySuggestion('synchronicity_note', suggestions.dating_suggestions.synchronicity_note)}
                  isApplied={isApplied('synchronicity_note', suggestions.dating_suggestions.synchronicity_note)}
                />
              )}

              {/* Dating Bio */}
              {suggestions.dating_suggestions.dating_bio_improvement && (
                <SuggestionCard
                  title="Dating Bio Enhancement"
                  icon={Heart}
                  iconColor="text-rose-500"
                  value={suggestions.dating_suggestions.dating_bio_improvement}
                  onApply={() => applySuggestion('dating_bio', suggestions.dating_suggestions.dating_bio_improvement)}
                  isApplied={isApplied('dating_bio', suggestions.dating_suggestions.dating_bio_improvement)}
                />
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function SuggestionCard({ title, icon: Icon, iconColor, value, reasoning, onApply, isApplied }) {
  const [showFull, setShowFull] = useState(false);
  
  return (
    <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon className={cn("w-4 h-4", iconColor)} />
          {title}
        </p>
        <Button
          variant={isApplied ? "outline" : "default"}
          size="sm"
          onClick={onApply}
          disabled={isApplied}
          className={cn(
            "rounded-lg gap-1 text-xs",
            isApplied && "bg-emerald-100 border-emerald-300 text-emerald-700"
          )}
        >
          {isApplied ? (
            <>
              <Check className="w-3 h-3" />
              Applied
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Apply
            </>
          )}
        </Button>
      </div>
      <div 
        className="p-2 rounded bg-slate-50 dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
        onClick={() => setShowFull(!showFull)}
      >
        {showFull ? value : value.slice(0, 150) + (value.length > 150 ? '...' : '')}
      </div>
      {reasoning && (
        <p className="text-xs text-slate-500 italic">
          💡 {reasoning}
        </p>
      )}
    </div>
  );
}