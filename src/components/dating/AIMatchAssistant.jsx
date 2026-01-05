import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Heart, MessageCircle, Bookmark, X, Loader2, RefreshCw, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIMatchAssistant({ profile, datingProfile }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all dating profiles
  const { data: allDatingProfiles = [] } = useQuery({
    queryKey: ['allDatingProfiles'],
    queryFn: () => base44.entities.DatingProfile.filter({ opt_in: true, visible: true }, '-updated_date', 100)
  });

  // Fetch user profiles for additional context
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200)
  });

  const generateSuggestions = async () => {
    if (!profile?.user_id || !datingProfile) return;
    setLoading(true);

    try {
      // Filter out current user and get candidates
      const candidates = allDatingProfiles.filter(p => p.user_id !== profile.user_id);
      
      if (candidates.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // Build context for AI
      const myContext = {
        values: datingProfile.core_values_ranked || [],
        priorities: datingProfile.life_priorities || [],
        dealbreakers: datingProfile.dealbreakers || [],
        intent: datingProfile.relationship_intent,
        commStyle: datingProfile.comm_depth,
        growthOrientation: datingProfile.growth_orientation,
        rhythm: datingProfile.daily_rhythm,
        syncNote: datingProfile.synchronicity_note || '',
        bio: profile.bio || ''
      };

      const candidateData = candidates.slice(0, 20).map(c => {
        const up = userProfiles.find(u => u.user_id === c.user_id);
        return {
          user_id: c.user_id,
          name: c.display_name || up?.display_name || 'Unknown',
          avatar: c.avatar_url || up?.avatar_url,
          location: c.location || up?.location,
          bio: c.bio || up?.bio || '',
          values: c.core_values_ranked || [],
          priorities: c.life_priorities || [],
          intent: c.relationship_intent,
          commDepth: c.comm_depth,
          growthOrientation: c.growth_orientation,
          rhythm: c.daily_rhythm,
          syncNote: c.synchronicity_note || '',
          seeking: c.seeking || '',
          isBoosted: c.is_boosted && new Date(c.boost_expires_at) > new Date()
        };
      });

      // Sort boosted profiles first
      candidateData.sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));

      const prompt = `You are a conscious matchmaking assistant for a spiritual community platform. Analyze the user's profile and suggest the best matches from the candidates.

USER PROFILE:
- Core Values: ${myContext.values.join(', ') || 'Not specified'}
- Life Priorities: ${myContext.priorities.join(', ') || 'Not specified'}
- Dealbreakers: ${myContext.dealbreakers.join(', ') || 'None specified'}
- Relationship Intent: ${myContext.intent || 'Not specified'}
- Communication Depth: ${myContext.commStyle || 'balanced'}
- Growth Orientation: ${myContext.growthOrientation || 'steady'}
- Daily Rhythm: ${myContext.rhythm || 'ambivert'}
- Synchronicity Note: ${myContext.syncNote}
- Bio: ${myContext.bio}

CANDIDATES:
${candidateData.map((c, i) => `
${i + 1}. ${c.name} (${c.user_id})${c.isBoosted ? ' [BOOSTED]' : ''}
   Location: ${c.location || 'Unknown'}
   Values: ${c.values.join(', ') || 'Not specified'}
   Priorities: ${c.priorities.join(', ') || 'Not specified'}
   Intent: ${c.intent || 'Not specified'}
   Comm Depth: ${c.commDepth || 'balanced'}
   Growth: ${c.growthOrientation || 'steady'}
   Rhythm: ${c.rhythm || 'ambivert'}
   Sync Note: ${c.syncNote}
   Seeking: ${c.seeking}
   Bio: ${c.bio}
`).join('\n')}

Analyze compatibility based on:
1. Value alignment (shared core values)
2. Communication compatibility (depth, frequency preferences)
3. Growth orientation match
4. Relationship intent alignment
5. Energy/rhythm compatibility
6. Synchronicity signals

Return the top 5 matches with detailed explanations. Be specific about WHY each match is suggested - reference actual values, priorities, and synchronicity notes from both profiles.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  compatibility_score: { type: "number" },
                  headline: { type: "string" },
                  why_compatible: { type: "string" },
                  shared_values: { type: "array", items: { type: "string" } },
                  complementary_traits: { type: "array", items: { type: "string" } },
                  potential_challenges: { type: "string" },
                  conversation_starter: { type: "string" },
                  synchronicity_insight: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich suggestions with profile data
      const enrichedSuggestions = (response.matches || []).map(match => {
        const candidate = candidateData.find(c => c.user_id === match.user_id);
        return {
          ...match,
          name: candidate?.name || 'Unknown',
          avatar: candidate?.avatar,
          location: candidate?.location,
          isBoosted: candidate?.isBoosted
        };
      });

      setSuggestions(enrichedSuggestions);
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, suggestion) => {
    if (action === 'save') {
      await base44.entities.Match.create({
        user_id: profile.user_id,
        target_type: 'person',
        target_id: suggestion.user_id,
        target_name: suggestion.name,
        target_avatar: suggestion.avatar,
        match_score: suggestion.compatibility_score,
        status: 'saved',
        ai_reasoning: suggestion.why_compatible,
        shared_values: suggestion.shared_values,
        conversation_starters: [suggestion.conversation_starter]
      });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    } else if (action === 'dismiss') {
      setSuggestions(prev => prev.filter(s => s.user_id !== suggestion.user_id));
    }
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-violet-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-violet-900 dark:text-violet-300">
            <Sparkles className="w-5 h-5 text-violet-500" />
            AI Match Assistant
          </CardTitle>
          <Button
            onClick={generateSuggestions}
            disabled={loading || !datingProfile?.opt_in}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Find Matches
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          AI-powered suggestions based on your values, intentions, and synchronicity signals
        </p>
      </CardHeader>
      <CardContent>
        {!datingProfile?.opt_in ? (
          <div className="text-center py-8 text-slate-500">
            <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Enable Dating & Compatibility to get AI suggestions</p>
          </div>
        ) : suggestions.length === 0 && !loading ? (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-violet-300" />
            <p>Click "Find Matches" to get personalized suggestions</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.user_id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    suggestion.isBoosted 
                      ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700" 
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-violet-200">
                      <AvatarImage src={suggestion.avatar} />
                      <AvatarFallback>{suggestion.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{suggestion.name}</h4>
                        {suggestion.isBoosted && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 gap-1">
                            <Zap className="w-3 h-3" /> Boosted
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-violet-600 dark:text-violet-400 border-violet-300">
                          {suggestion.compatibility_score}% match
                        </Badge>
                      </div>
                      {suggestion.location && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{suggestion.location}</p>
                      )}
                      <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mt-1">{suggestion.headline}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(expandedId === suggestion.user_id ? null : suggestion.user_id)}
                    className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    {expandedId === suggestion.user_id ? (
                      <>Less details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Why this match? <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>

                  {expandedId === suggestion.user_id && (
                    <div className="mt-3 space-y-3 text-sm border-t pt-3 border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Why You're Compatible:</p>
                        <p className="text-slate-600 dark:text-slate-400">{suggestion.why_compatible}</p>
                      </div>
                      
                      {suggestion.shared_values?.length > 0 && (
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Shared Values:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.shared_values.map((v, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{v}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestion.complementary_traits?.length > 0 && (
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Complementary Traits:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.complementary_traits.map((t, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestion.potential_challenges && (
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Things to Navigate:</p>
                          <p className="text-slate-600 dark:text-slate-400">{suggestion.potential_challenges}</p>
                        </div>
                      )}

                      {suggestion.synchronicity_insight && (
                        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                          <p className="font-medium text-violet-700 dark:text-violet-400 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Synchronicity Insight
                          </p>
                          <p className="text-violet-600 dark:text-violet-300 text-xs">{suggestion.synchronicity_insight}</p>
                        </div>
                      )}

                      {suggestion.conversation_starter && (
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Conversation Starter
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 text-xs italic">"{suggestion.conversation_starter}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg gap-1"
                      onClick={() => handleAction('save', suggestion)}
                    >
                      <Bookmark className="w-3 h-3" /> Save Match
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => handleAction('dismiss', suggestion)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}