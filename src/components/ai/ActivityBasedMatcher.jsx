import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, TrendingUp, MessageSquare, Calendar, Target, RefreshCw, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActivityBasedMatcher({ profile, compact = false }) {
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  // Fetch user's recent activity
  const { data: recentMeetings = [] } = useQuery({
    queryKey: ['recentMeetings', profile?.user_id],
    queryFn: () => base44.entities.Meeting.filter({ 
      host_id: profile.user_id 
    }, '-created_date', 10),
    enabled: !!profile?.user_id
  });

  const { data: recentPosts = [] } = useQuery({
    queryKey: ['recentPosts', profile?.user_id],
    queryFn: () => base44.entities.Post.filter({ 
      author_id: profile.user_id 
    }, '-created_date', 10),
    enabled: !!profile?.user_id
  });

  const { data: joinedMissions = [] } = useQuery({
    queryKey: ['joinedMissions', profile?.user_id],
    queryFn: async () => {
      const missions = await base44.entities.Mission.filter({ status: 'active' }, '-created_date', 50);
      return missions.filter(m => m.participant_ids?.includes(profile.user_id));
    },
    enabled: !!profile?.user_id
  });

  const { data: enginePrefs } = useQuery({
    queryKey: ['enginePreferences', profile?.user_id],
    queryFn: async () => {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: profile.user_id });
      return prefs[0] || null;
    },
    enabled: !!profile?.user_id
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  const analyzeActivityMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      
      // Build activity context
      const activityContext = {
        recent_meetings: recentMeetings.slice(0, 5).map(m => ({
          type: m.meeting_type,
          with: m.guest_name || m.host_name,
          status: m.status
        })),
        recent_posts: recentPosts.slice(0, 5).map(p => ({
          content_preview: p.content?.substring(0, 100),
          likes: p.like_count || 0,
          topic_tags: p.tags || []
        })),
        active_missions: joinedMissions.slice(0, 3).map(m => ({
          title: m.title,
          type: m.mission_type,
          objective: m.objective?.substring(0, 100)
        })),
        current_focus: profile.current_focus_areas || [],
        seeking_support_in: profile.seeking_support_in || [],
        can_offer_support_in: profile.can_offer_support_in || []
      };

      // User preferences from TuneEngine
      const preferences = {
        skills_seeking: enginePrefs?.skills_seeking || [],
        skills_offering: enginePrefs?.skills_offering || [],
        interests: enginePrefs?.deep_match_preferences?.shared_values_filter || [],
        goals: enginePrefs?.deep_match_preferences?.mission_interests_filter || [],
        collaboration_style: enginePrefs?.collaboration_style || [],
        serendipity_level: enginePrefs?.deep_match_preferences?.serendipity_level || 'balanced',
        spiritual_weight: enginePrefs?.spiritual_alignment_importance || 5,
        skill_weight: enginePrefs?.deep_match_preferences?.skill_complement_weight || 5
      };

      // Filter candidates (exclude self and blocked)
      const blockedUsers = enginePrefs?.blocked_users || [];
      const candidates = allProfiles
        .filter(p => p.user_id !== profile.user_id && !blockedUsers.includes(p.user_id))
        .slice(0, 20)
        .map(p => ({
          id: p.user_id,
          name: p.display_name,
          bio: p.bio?.substring(0, 150),
          skills: p.skills || [],
          values: p.values_tags || [],
          intentions: p.intentions || [],
          current_focus: p.current_focus_areas || [],
          can_offer_support_in: p.can_offer_support_in || [],
          seeking_support_in: p.seeking_support_in || [],
          region: p.region,
          rank: p.rp_rank_code
        }));

      const prompt = `You are an AI matchmaker for SaintAgent, a conscious community platform. Analyze the user's CURRENT ACTIVITY and suggest highly relevant matches.

USER PROFILE:
Name: ${profile.display_name}
Bio: ${profile.bio || 'N/A'}
Skills: ${profile.skills?.join(', ') || 'Not specified'}
Values: ${profile.values_tags?.join(', ') || 'Not specified'}

USER'S RECENT ACTIVITY:
${JSON.stringify(activityContext, null, 2)}

USER'S MATCHING PREFERENCES:
${JSON.stringify(preferences, null, 2)}

POTENTIAL MATCHES (${candidates.length} candidates):
${JSON.stringify(candidates, null, 2)}

TASK: Based on the user's CURRENT ACTIVITY and preferences, suggest the TOP 3 most relevant matches RIGHT NOW.

Consider:
1. What the user is ACTIVELY working on (missions, posts, meetings)
2. Skills they're seeking vs what candidates offer
3. Current focus areas alignment
4. Support they need vs what candidates can provide
5. Serendipity level: ${preferences.serendipity_level} (conservative=safe matches, adventurous=surprising connections)

For each match, explain WHY this person is relevant to the user's CURRENT activity and goals.

Provide:
- activity_relevance: Why this match is timely based on current activity
- immediate_value: What value they can exchange RIGHT NOW
- suggested_action: Specific first step to connect
- match_score: 0-100 based on current relevance`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_summary: { type: "string" },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  target_id: { type: "string" },
                  match_score: { type: "number" },
                  activity_relevance: { type: "string" },
                  immediate_value: { type: "string" },
                  suggested_action: { type: "string" },
                  shared_focus: { type: "array", items: { type: "string" } },
                  complementary_skills: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Enrich suggestions with profile data
      const enrichedSuggestions = response.suggestions.map(s => {
        const targetProfile = allProfiles.find(p => p.user_id === s.target_id);
        return {
          ...s,
          target_name: targetProfile?.display_name,
          target_avatar: targetProfile?.avatar_url,
          target_bio: targetProfile?.bio?.substring(0, 80),
          target_rank: targetProfile?.rp_rank_code
        };
      });

      setSuggestions({
        summary: response.analysis_summary,
        matches: enrichedSuggestions
      });
      
      setIsAnalyzing(false);
      return response;
    }
  });

  const handleConnect = (suggestion) => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: suggestion.target_id,
        recipientName: suggestion.target_name,
        recipientAvatar: suggestion.target_avatar
      }
    }));
  };

  const handleViewProfile = (userId) => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">Activity-Based Matches</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => analyzeActivityMutation.mutate()}
            disabled={isAnalyzing}
            className="h-7"
          >
            {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
        </div>
        
        {suggestions?.matches?.slice(0, 2).map((s, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => handleViewProfile(s.target_id)}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={s.target_avatar} />
              <AvatarFallback>{s.target_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.target_name}</p>
              <p className="text-xs text-slate-500 truncate">{s.activity_relevance}</p>
            </div>
            <Badge variant="secondary" className="text-xs">{s.match_score}%</Badge>
          </div>
        ))}
        
        {!suggestions && !isAnalyzing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => analyzeActivityMutation.mutate()}
            className="w-full"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Analyze My Activity
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Activity-Based Suggestions</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => analyzeActivityMutation.mutate()}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              {suggestions.summary}
            </p>
            
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3">
                {suggestions.matches.map((s, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar 
                        className="w-12 h-12 cursor-pointer ring-2 ring-violet-200 dark:ring-violet-800"
                        onClick={() => handleViewProfile(s.target_id)}
                      >
                        <AvatarImage src={s.target_avatar} />
                        <AvatarFallback>{s.target_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-semibold cursor-pointer hover:text-violet-600"
                            onClick={() => handleViewProfile(s.target_id)}
                          >
                            {s.target_name}
                          </span>
                          <Badge className={cn(
                            "text-xs",
                            s.match_score >= 85 ? "bg-emerald-500" :
                            s.match_score >= 70 ? "bg-violet-500" : "bg-slate-500"
                          )}>
                            {s.match_score}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{s.target_bio}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm"><strong>Why now:</strong> {s.activity_relevance}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm"><strong>Value:</strong> {s.immediate_value}</p>
                      </div>
                    </div>
                    
                    {s.shared_focus?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {s.shared_focus.map((f, j) => (
                          <Badge key={j} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                        💡 {s.suggested_action}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewProfile(s.target_id)}>
                          View
                        </Button>
                        <Button size="sm" onClick={() => handleConnect(s)}>
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-violet-300 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Get AI-powered suggestions based on your current activity, meetings, posts, and missions.
            </p>
            <Button onClick={() => analyzeActivityMutation.mutate()} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Activity...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze My Activity
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}