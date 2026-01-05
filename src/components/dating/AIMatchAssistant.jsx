import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Heart, MessageCircle, Bookmark, X, Loader2, RefreshCw, Zap, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Star, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIMatchAssistant({ profile, datingProfile }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(null);
  const queryClient = useQueryClient();

  // Fetch past feedback to improve suggestions
  const { data: pastFeedback = [] } = useQuery({
    queryKey: ['matchFeedback', profile?.user_id],
    queryFn: () => base44.entities.Match.filter({ 
      user_id: profile?.user_id,
      target_type: 'person'
    }, '-updated_date', 100),
    enabled: !!profile?.user_id
  });

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

      // Build feedback context for AI learning
      const feedbackContext = pastFeedback
        .filter(f => f.user_rating || f.user_feedback)
        .map(f => ({
          target_id: f.target_id,
          rating: f.user_rating,
          feedback: f.user_feedback,
          wasGoodMatch: f.user_rating >= 4
        }));

      const likedTraits = feedbackContext
        .filter(f => f.wasGoodMatch)
        .map(f => {
          const match = candidateData.find(c => c.user_id === f.target_id);
          return match ? { values: match.values, intent: match.intent, rhythm: match.rhythm } : null;
        })
        .filter(Boolean);

      const dislikedTraits = feedbackContext
        .filter(f => !f.wasGoodMatch && f.rating)
        .map(f => {
          const match = candidateData.find(c => c.user_id === f.target_id);
          return match ? { values: match.values, intent: match.intent, rhythm: match.rhythm } : null;
        })
        .filter(Boolean);

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

USER FEEDBACK HISTORY (use this to personalize suggestions):
${likedTraits.length > 0 ? `Previously LIKED matches had these traits: ${JSON.stringify(likedTraits.slice(0, 5))}` : 'No positive feedback yet.'}
${dislikedTraits.length > 0 ? `Previously DISLIKED matches had these traits: ${JSON.stringify(dislikedTraits.slice(0, 5))}` : 'No negative feedback yet.'}
${feedbackContext.filter(f => f.feedback).slice(0, 3).map(f => `User feedback: "${f.feedback}" (Rating: ${f.rating}/5)`).join('\n')}

Analyze compatibility based on:
1. Value alignment (shared core values)
2. Communication compatibility (depth, frequency preferences)
3. Growth orientation match
4. Relationship intent alignment
5. Energy/rhythm compatibility
6. Synchronicity signals

For each match, provide:
- A compatibility score (0-100)
- A compelling headline summarizing the connection
- WHY they're compatible (reference specific values, priorities, synchronicity notes)
- Shared values between both profiles
- Complementary traits that balance each other
- IMPORTANT: Identify 2-3 specific potential friction points or challenges based on differences in their profiles (e.g., different communication frequencies, growth orientations, daily rhythms, or intent misalignment)
- For each friction point, provide a conscious navigation tip - practical advice on how they might work through this difference mindfully
- A conversation starter
- A synchronicity insight connecting their journeys

Be honest about challenges - users appreciate authenticity over false positivity. Frame challenges as growth opportunities.`;

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
                  friction_points: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        challenge: { type: "string" },
                        navigation_tip: { type: "string" }
                      }
                    } 
                  },
                  overall_challenge_level: { type: "string", enum: ["low", "moderate", "significant"] },
                  growth_opportunity: { type: "string" },
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
      queryClient.invalidateQueries({ queryKey: ['matchFeedback'] });
    } else if (action === 'dismiss') {
      setSuggestions(prev => prev.filter(s => s.user_id !== suggestion.user_id));
    }
  };

  const handleFeedback = async (suggestion, rating) => {
    setFeedbackRating(rating);
    setFeedbackId(suggestion.user_id);
  };

  const submitFeedback = async (suggestion) => {
    if (!feedbackRating) return;

    // Check if match record exists
    const existingMatches = await base44.entities.Match.filter({
      user_id: profile.user_id,
      target_id: suggestion.user_id,
      target_type: 'person'
    });

    if (existingMatches?.length > 0) {
      // Update existing match with feedback
      await base44.entities.Match.update(existingMatches[0].id, {
        user_rating: feedbackRating,
        user_feedback: feedbackText || null
      });
    } else {
      // Create new match record with feedback
      await base44.entities.Match.create({
        user_id: profile.user_id,
        target_type: 'person',
        target_id: suggestion.user_id,
        target_name: suggestion.name,
        target_avatar: suggestion.avatar,
        match_score: suggestion.compatibility_score,
        status: feedbackRating >= 4 ? 'active' : 'declined',
        user_rating: feedbackRating,
        user_feedback: feedbackText || null,
        ai_reasoning: suggestion.why_compatible
      });
    }

    // Update local state to show feedback was submitted
    setSuggestions(prev => prev.map(s => 
      s.user_id === suggestion.user_id 
        ? { ...s, userRating: feedbackRating, userFeedback: feedbackText }
        : s
    ));

    // Reset feedback form
    setFeedbackId(null);
    setFeedbackText('');
    setFeedbackRating(null);

    queryClient.invalidateQueries({ queryKey: ['matchFeedback'] });
    queryClient.invalidateQueries({ queryKey: ['matches'] });
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

                      {suggestion.friction_points?.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-700 dark:text-slate-300">Potential Friction Points:</p>
                            {suggestion.overall_challenge_level && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs",
                                  suggestion.overall_challenge_level === 'low' && "border-emerald-300 text-emerald-600",
                                  suggestion.overall_challenge_level === 'moderate' && "border-amber-300 text-amber-600",
                                  suggestion.overall_challenge_level === 'significant' && "border-rose-300 text-rose-600"
                                )}
                              >
                                {suggestion.overall_challenge_level} challenge
                              </Badge>
                            )}
                          </div>
                          {suggestion.friction_points.map((fp, i) => (
                            <div key={i} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                              <p className="text-amber-800 dark:text-amber-300 text-xs font-medium mb-1">⚡ {fp.challenge}</p>
                              <p className="text-amber-700 dark:text-amber-400 text-xs">
                                <span className="font-medium">Navigate consciously:</span> {fp.navigation_tip}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {suggestion.growth_opportunity && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                            🌱 Growth Opportunity
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-300 text-xs">{suggestion.growth_opportunity}</p>
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

                  {/* Feedback Section */}
                  {feedbackId === suggestion.user_id ? (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate this suggestion:</p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className={cn(
                              "p-1 rounded transition-colors",
                              feedbackRating >= star 
                                ? "text-amber-500" 
                                : "text-slate-300 hover:text-amber-400"
                            )}
                          >
                            <Star className={cn("w-6 h-6", feedbackRating >= star && "fill-current")} />
                          </button>
                        ))}
                        <span className="text-xs text-slate-500 ml-2">
                          {feedbackRating === 1 && 'Not a match'}
                          {feedbackRating === 2 && 'Poor match'}
                          {feedbackRating === 3 && 'Okay match'}
                          {feedbackRating === 4 && 'Good match'}
                          {feedbackRating === 5 && 'Excellent match!'}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Optional: Tell us why (helps improve future suggestions)..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="text-sm h-16 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg gap-1"
                          onClick={() => submitFeedback(suggestion)}
                          disabled={!feedbackRating}
                        >
                          <Send className="w-3 h-3" /> Submit Feedback
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => { setFeedbackId(null); setFeedbackRating(null); setFeedbackText(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : suggestion.userRating ? (
                    <div className="mt-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={cn(
                              "w-4 h-4",
                              suggestion.userRating >= star ? "text-amber-500 fill-current" : "text-slate-300"
                            )} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">Feedback submitted — thanks!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => handleFeedback(suggestion, 4)}
                      >
                        <ThumbsUp className="w-3 h-3" /> Good Match
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg gap-1 text-rose-600 border-rose-300 hover:bg-rose-50"
                        onClick={() => handleFeedback(suggestion, 2)}
                      >
                        <ThumbsDown className="w-3 h-3" /> Not Interested
                      </Button>
                      <Button
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                        onClick={() => handleAction('save', suggestion)}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}