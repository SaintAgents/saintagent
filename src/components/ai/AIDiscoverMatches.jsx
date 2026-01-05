import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Heart,
  MessageCircle,
  Star,
  Lightbulb,
  Eye,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIDiscoverMatches({ profile, compact = false }) {
  const queryClient = useQueryClient();
  const [discoveries, setDiscoveries] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch dating profile
  const { data: datingProfiles = [] } = useQuery({
    queryKey: ['datingProfile', currentUser?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });
  const myDP = datingProfiles?.[0];

  // Fetch all profiles for matching
  const { data: allDatingProfiles = [] } = useQuery({
    queryKey: ['allDatingProfiles'],
    queryFn: () => base44.entities.DatingProfile.filter({ opt_in: true }),
    enabled: !!currentUser?.email
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['discoverUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200)
  });

  // Fetch user activity for context
  const { data: userPosts = [] } = useQuery({
    queryKey: ['userPosts', currentUser?.email],
    queryFn: () => base44.entities.Post.filter({ author_id: currentUser?.email }, '-created_date', 10),
    enabled: !!currentUser?.email
  });

  const { data: userMeetings = [] } = useQuery({
    queryKey: ['userMeetings', currentUser?.email],
    queryFn: () => base44.entities.Meeting.filter({ host_id: currentUser?.email }, '-created_date', 10),
    enabled: !!currentUser?.email
  });

  const { data: existingMatches = [] } = useQuery({
    queryKey: ['existingMatches', currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });

  const discoverMutation = useMutation({
    mutationFn: async () => {
      const candidates = allDatingProfiles
        .filter(p => p.user_id !== currentUser?.email)
        .slice(0, 15);

      if (candidates.length === 0) {
        return { discoveries: [] };
      }

      // Build rich context
      const candidateProfiles = candidates.map(c => {
        const up = userProfiles.find(u => u.user_id === c.user_id);
        return {
          id: c.user_id,
          name: up?.display_name || c.user_id?.split('@')[0],
          bio: c.bio || up?.bio,
          values: c.core_values_ranked || [],
          priorities: c.life_priorities || [],
          intent: c.relationship_intent,
          growth: c.growth_orientation,
          commDepth: c.comm_depth,
          rhythm: c.daily_rhythm,
          practices: up?.spiritual_practices || [],
          skills: up?.skills || [],
          synchronicityNote: c.synchronicity_note
        };
      });

      const myContext = {
        name: profile?.display_name,
        bio: myDP?.bio || profile?.bio,
        values: myDP?.core_values_ranked || [],
        priorities: myDP?.life_priorities || [],
        intent: myDP?.relationship_intent,
        growth: myDP?.growth_orientation,
        commDepth: myDP?.comm_depth,
        rhythm: myDP?.daily_rhythm,
        practices: profile?.spiritual_practices || [],
        skills: profile?.skills || [],
        recentTopics: userPosts.slice(0, 5).map(p => p.content?.slice(0, 100)),
        meetingHistory: userMeetings.length
      };

      const prompt = `You are an AI matchmaker for a conscious community platform. Your task is to identify HIDDEN and NUANCED compatibilities that users might overlook.

MY PROFILE:
${JSON.stringify(myContext, null, 2)}

CANDIDATE PROFILES:
${JSON.stringify(candidateProfiles, null, 2)}

Analyze each candidate for:
1. UNEXPECTED SYNERGIES - complementary traits that create balance (e.g., introvert + extrovert can balance each other)
2. SHARED DEPTH - subtle value alignments not obvious from surface data
3. GROWTH POTENTIAL - how they could help each other evolve
4. TIMING ALIGNMENT - readiness signals from their profiles
5. CONVERSATION CHEMISTRY - topics they'd naturally connect on

Select the TOP 4 most interesting matches, prioritizing SURPRISING discoveries over obvious matches.
For each, explain the UNIQUE insight that makes them special - something the user wouldn't have noticed.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            discoveries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  discovery_type: { 
                    type: "string",
                    enum: ["unexpected_synergy", "shared_depth", "growth_catalyst", "timing_match", "conversation_spark"]
                  },
                  headline: { type: "string" },
                  insight: { type: "string" },
                  conversation_starter: { type: "string" },
                  compatibility_angle: { type: "string" },
                  confidence_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Enrich with profile data
      const enriched = (response.discoveries || []).map(d => {
        const dp = allDatingProfiles.find(p => p.user_id === d.user_id);
        const up = userProfiles.find(u => u.user_id === d.user_id);
        return {
          ...d,
          display_name: up?.display_name || d.user_id?.split('@')[0],
          avatar: up?.avatar_url,
          values: dp?.core_values_ranked || [],
          intent: dp?.relationship_intent
        };
      });

      return { discoveries: enriched };
    },
    onSuccess: (data) => {
      setDiscoveries(data.discoveries);
    }
  });

  const openChat = (userId, name, avatar) => {
    const event = new CustomEvent('openFloatingChat', {
      detail: { recipientId: userId, recipientName: name, recipientAvatar: avatar }
    });
    document.dispatchEvent(event);
  };

  const discoveryTypeConfig = {
    unexpected_synergy: { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Unexpected Synergy' },
    shared_depth: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Shared Depth' },
    growth_catalyst: { icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Growth Catalyst' },
    timing_match: { icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Perfect Timing' },
    conversation_spark: { icon: MessageCircle, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Conversation Spark' }
  };

  if (compact) {
    return (
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/80 to-purple-50/80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-violet-500" />
              AI Discoveries
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              className="h-7 px-2"
            >
              {discoverMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {discoveries?.length > 0 ? (
            <div className="space-y-2">
              {discoveries.slice(0, 2).map((d, idx) => {
                const config = discoveryTypeConfig[d.discovery_type] || discoveryTypeConfig.shared_depth;
                const Icon = config.icon;
                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer hover:border-violet-300 transition-colors"
                    onClick={() => openChat(d.user_id, d.display_name, d.avatar)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={d.avatar} />
                      <AvatarFallback>{d.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.display_name}</p>
                      <p className="text-xs text-slate-500 truncate">{d.headline}</p>
                    </div>
                    <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
                  </div>
                );
              })}
              <Link to={createPageUrl('Matches') + '?tab=dating'}>
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              className="w-full gap-2"
            >
              {discoverMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Find Hidden Matches
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-purple-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-violet-500" />
            AI Discover
            <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => discoverMutation.mutate()}
            disabled={discoverMutation.isPending}
            className="gap-2 rounded-lg"
          >
            {discoverMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Discover Matches
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          AI finds hidden compatibilities you might overlook
        </p>
      </CardHeader>
      <CardContent>
        {discoveries?.length > 0 ? (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {discoveries.map((d, idx) => {
                const config = discoveryTypeConfig[d.discovery_type] || discoveryTypeConfig.shared_depth;
                const Icon = config.icon;
                return (
                  <Card 
                    key={idx}
                    className="w-72 shrink-0 border-slate-200 hover:border-violet-300 transition-all hover:shadow-md cursor-pointer"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border-2 border-white shadow">
                          <AvatarImage src={d.avatar} />
                          <AvatarFallback className="bg-violet-100 text-violet-700">
                            {d.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{d.display_name}</p>
                          <Badge className={cn("text-xs", config.bg, config.color, "border-0")}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border">
                        <p className="text-sm font-medium text-slate-800">{d.headline}</p>
                        <p className="text-xs text-slate-600 mt-1">{d.insight}</p>
                      </div>

                      {d.conversation_starter && (
                        <div className="p-2 rounded-lg bg-violet-50 border border-violet-100">
                          <p className="text-xs text-slate-500 mb-1">💬 Try asking:</p>
                          <p className="text-sm text-violet-700 italic">"{d.conversation_starter}"</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-1 rounded-lg bg-violet-600 hover:bg-violet-700"
                          onClick={() => openChat(d.user_id, d.display_name, d.avatar)}
                        >
                          <MessageCircle className="w-3 h-3" />
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => {
                            const event = new CustomEvent('openProfile', { detail: { userId: d.user_id } });
                            document.dispatchEvent(event);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              Let AI analyze profiles to find surprising connections
            </p>
            <Button
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              className="gap-2 bg-violet-600 hover:bg-violet-700"
            >
              {discoverMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing profiles...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start Discovery
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}