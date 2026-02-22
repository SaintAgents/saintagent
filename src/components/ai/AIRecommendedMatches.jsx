import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  MessageCircle,
  Star,
  Users,
  Target,
  Briefcase,
  Heart,
  Lightbulb,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight,
  Zap,
  Brain,
  Handshake,
  GraduationCap,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RankedAvatar from '@/components/reputation/RankedAvatar';

const MATCH_CATEGORIES = {
  collaborator: { 
    icon: Handshake, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50', 
    label: 'Collaborator',
    description: 'Great for projects & missions'
  },
  mentor: { 
    icon: GraduationCap, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50', 
    label: 'Mentor/Mentee',
    description: 'Learning & growth opportunity'
  },
  skill_complement: { 
    icon: Zap, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50', 
    label: 'Skill Match',
    description: 'Complementary skills'
  },
  value_aligned: { 
    icon: Heart, 
    color: 'text-rose-500', 
    bg: 'bg-rose-50', 
    label: 'Values Aligned',
    description: 'Shared values & beliefs'
  },
  mission_partner: { 
    icon: Target, 
    color: 'text-violet-500', 
    bg: 'bg-violet-50', 
    label: 'Mission Partner',
    description: 'Aligned on goals'
  },
  network_bridge: { 
    icon: Users, 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-50', 
    label: 'Network Bridge',
    description: 'Expands your network'
  }
};

export default function AIRecommendedMatches({ profile, showHeader = true, limit = 6 }) {
  const queryClient = useQueryClient();
  const [recommendations, setRecommendations] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lastGenerated, setLastGenerated] = useState(null);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch all user profiles
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
    staleTime: 60000
  });

  // Fetch user's skills
  const { data: userSkills = [] } = useQuery({
    queryKey: ['userSkills', currentUser?.email],
    queryFn: () => base44.entities.Skill.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });

  // Fetch user's past meetings (interactions)
  const { data: userMeetings = [] } = useQuery({
    queryKey: ['userMeetingsHistory', currentUser?.email],
    queryFn: async () => {
      const asHost = await base44.entities.Meeting.filter({ host_id: currentUser?.email }, '-scheduled_time', 20);
      const asGuest = await base44.entities.Meeting.filter({ guest_id: currentUser?.email }, '-scheduled_time', 20);
      return [...asHost, ...asGuest];
    },
    enabled: !!currentUser?.email
  });

  // Fetch user's messages (interactions)
  const { data: userMessages = [] } = useQuery({
    queryKey: ['userMessagesHistory', currentUser?.email],
    queryFn: () => base44.entities.Message.filter({ from_user_id: currentUser?.email }, '-created_date', 50),
    enabled: !!currentUser?.email
  });

  // Fetch user's mission participation
  const { data: userMissions = [] } = useQuery({
    queryKey: ['userMissions', currentUser?.email],
    queryFn: () => base44.entities.Mission.filter({ creator_id: currentUser?.email }, '-created_date', 10),
    enabled: !!currentUser?.email
  });

  // Fetch user's circles
  const { data: userCircles = [] } = useQuery({
    queryKey: ['userCircles', currentUser?.email],
    queryFn: async () => {
      const circles = await base44.entities.Circle.list('-created_date', 50);
      return circles.filter(c => c.member_ids?.includes(currentUser?.email) || c.owner_id === currentUser?.email);
    },
    enabled: !!currentUser?.email
  });

  // Fetch existing matches to avoid duplicates
  const { data: existingMatches = [] } = useQuery({
    queryKey: ['existingMatches', currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });

  // Fetch engine preferences
  const { data: enginePrefs = [] } = useQuery({
    queryKey: ['enginePrefs', currentUser?.email],
    queryFn: () => base44.entities.EnginePreference.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });
  const prefs = enginePrefs?.[0];

  // Build interaction history
  const getInteractionHistory = () => {
    const interactedUsers = new Set();
    
    // From meetings
    userMeetings.forEach(m => {
      if (m.host_id !== currentUser?.email) interactedUsers.add(m.host_id);
      if (m.guest_id !== currentUser?.email) interactedUsers.add(m.guest_id);
    });
    
    // From messages
    userMessages.forEach(m => {
      if (m.to_user_id !== currentUser?.email) interactedUsers.add(m.to_user_id);
    });
    
    return Array.from(interactedUsers);
  };

  // Generate AI recommendations
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !currentUser) return { recommendations: [] };

      const interactionHistory = getInteractionHistory();
      const existingMatchIds = existingMatches.map(m => m.target_id);
      const blockedUsers = prefs?.blocked_users || [];

      // Filter candidates - exclude self, existing matches, and blocked users
      const candidates = allProfiles.filter(p => 
        p.user_id !== currentUser.email &&
        !existingMatchIds.includes(p.user_id) &&
        !blockedUsers.includes(p.user_id)
      ).slice(0, 30);

      if (candidates.length === 0) {
        return { recommendations: [] };
      }

      // Build rich context for AI
      const myContext = {
        name: profile.display_name,
        bio: profile.bio,
        location: profile.location || profile.region,
        skills: userSkills.map(s => ({ name: s.skill_name, type: s.type, proficiency: s.proficiency })),
        interests: profile.interests || [],
        values: prefs?.skills_offering || [],
        seeking: prefs?.skills_seeking || [],
        practices: profile.spiritual_practices || [],
        rank: profile.rank_code,
        followerCount: profile.follower_count || 0,
        interactionHistory: interactionHistory.slice(0, 10),
        circleCategories: userCircles.map(c => c.category),
        missionTypes: userMissions.map(m => m.mission_type),
        commitmentLevel: prefs?.commitment_level,
        collaborationStyle: prefs?.collaboration_style || []
      };

      const candidateProfiles = candidates.map(c => ({
        id: c.user_id,
        name: c.display_name,
        handle: c.handle,
        bio: c.bio,
        location: c.location || c.region,
        skills: c.skills || [],
        interests: c.interests || [],
        practices: c.spiritual_practices || [],
        rank: c.rank_code,
        followerCount: c.follower_count || 0
      }));

      const prompt = `You are an AI matchmaker for a professional/spiritual community platform. Analyze profiles to find the BEST matches based on complementary skills, shared interests, value alignment, and collaboration potential.

MY PROFILE:
${JSON.stringify(myContext, null, 2)}

CANDIDATE PROFILES:
${JSON.stringify(candidateProfiles, null, 2)}

For each candidate, evaluate:
1. SKILL COMPLEMENTARITY - Do their skills fill gaps I have? Can I offer skills they need?
2. INTEREST OVERLAP - Shared passions and topics
3. VALUE ALIGNMENT - Similar values, practices, life approach
4. COLLABORATION POTENTIAL - Would we work well together on projects?
5. NETWORK VALUE - Would connecting expand my meaningful network?
6. GROWTH OPPORTUNITY - Could we help each other grow?

Select the TOP ${limit} most valuable matches. For each, categorize as:
- "collaborator" - Great for working on projects together
- "mentor" - One can teach the other something valuable
- "skill_complement" - Their skills complement mine perfectly
- "value_aligned" - Deep alignment on values and purpose
- "mission_partner" - Aligned on goals and missions
- "network_bridge" - Would expand network in valuable direction

Provide specific, actionable reasons why each is a great match.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  category: { 
                    type: "string",
                    enum: ["collaborator", "mentor", "skill_complement", "value_aligned", "mission_partner", "network_bridge"]
                  },
                  match_score: { type: "number" },
                  headline: { type: "string" },
                  reason: { type: "string" },
                  shared_interests: { type: "array", items: { type: "string" } },
                  complementary_skills: { type: "array", items: { type: "string" } },
                  conversation_starter: { type: "string" },
                  collaboration_ideas: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Enrich with profile data
      const enriched = (response.recommendations || []).map(rec => {
        const candidateProfile = allProfiles.find(p => p.user_id === rec.user_id);
        return {
          ...rec,
          display_name: candidateProfile?.display_name || rec.user_id?.split('@')[0],
          handle: candidateProfile?.handle,
          avatar: candidateProfile?.avatar_url,
          location: candidateProfile?.location || candidateProfile?.region,
          rank_code: candidateProfile?.rank_code,
          bio: candidateProfile?.bio
        };
      });

      return { recommendations: enriched };
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      setLastGenerated(new Date());
    }
  });

  // Auto-generate on mount if no recommendations
  useEffect(() => {
    if (profile && currentUser && !recommendations && !generateMutation.isPending && allProfiles.length > 0) {
      // Only auto-generate once
      const hasGenerated = localStorage.getItem('aiRecsGenerated');
      if (!hasGenerated) {
        generateMutation.mutate();
        localStorage.setItem('aiRecsGenerated', Date.now().toString());
      }
    }
  }, [profile, currentUser, allProfiles.length]);

  const openChat = (userId, name, avatar) => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: { recipientId: userId, recipientName: name, recipientAvatar: avatar }
    }));
  };

  const openProfile = (userId) => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
  };

  const filteredRecommendations = recommendations?.filter(r => 
    activeCategory === 'all' || r.category === activeCategory
  ) || [];

  const categoryCounts = recommendations?.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-indigo-50/50">
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" />
                AI Recommended Matches
                <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-violet-100 to-indigo-100">
                  Personalized
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Based on your profile, skills, interests & interactions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
          {lastGenerated && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3" />
              Last updated {lastGenerated.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      )}

      <CardContent className={showHeader ? "pt-0" : "pt-4"}>
        {generateMutation.isPending && !recommendations ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-violet-400" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-slate-500 mt-4">Analyzing profiles & finding matches...</p>
            <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
          </div>
        ) : recommendations?.length > 0 ? (
          <>
            {/* Category filter tabs */}
            <div className="mb-4">
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                    className="shrink-0"
                  >
                    All ({recommendations.length})
                  </Button>
                  {Object.entries(MATCH_CATEGORIES).map(([key, config]) => {
                    const count = categoryCounts[key] || 0;
                    if (count === 0) return null;
                    const Icon = config.icon;
                    return (
                      <Button
                        key={key}
                        variant={activeCategory === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(key)}
                        className={cn("shrink-0 gap-1", activeCategory === key && config.bg)}
                      >
                        <Icon className={cn("w-3 h-3", activeCategory !== key && config.color)} />
                        {config.label} ({count})
                      </Button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {/* Recommendations grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommendations.map((rec, idx) => {
                const config = MATCH_CATEGORIES[rec.category] || MATCH_CATEGORIES.collaborator;
                const Icon = config.icon;
                
                return (
                  <Card 
                    key={rec.user_id || idx} 
                    className="group hover:border-violet-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <CardContent className="p-4">
                      {/* Header with avatar and basic info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div 
                          className="cursor-pointer"
                          onClick={() => openProfile(rec.user_id)}
                        >
                          <RankedAvatar
                            src={rec.avatar}
                            name={rec.display_name}
                            rankCode={rec.rank_code}
                            size="md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p 
                            className="font-semibold text-slate-900 truncate cursor-pointer hover:text-violet-600"
                            onClick={() => openProfile(rec.user_id)}
                          >
                            {rec.display_name}
                          </p>
                          {rec.handle && (
                            <p className="text-xs text-slate-500">@{rec.handle}</p>
                          )}
                          {rec.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {rec.location}
                            </p>
                          )}
                        </div>
                        <Badge className={cn("shrink-0 text-xs", config.bg, config.color, "border-0")}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>

                      {/* Match score */}
                      {rec.match_score && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Match Score</span>
                            <span className="font-medium text-violet-600">{rec.match_score}%</span>
                          </div>
                          <Progress value={rec.match_score} className="h-1.5" />
                        </div>
                      )}

                      {/* Headline */}
                      <p className="text-sm font-medium text-slate-800 mb-2">{rec.headline}</p>

                      {/* Reason */}
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{rec.reason}</p>

                      {/* Shared interests / skills */}
                      {(rec.shared_interests?.length > 0 || rec.complementary_skills?.length > 0) && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {rec.shared_interests?.slice(0, 2).map((interest, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {rec.complementary_skills?.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-violet-600">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Conversation starter */}
                      {rec.conversation_starter && (
                        <div className="p-2 rounded-lg bg-violet-50 border border-violet-100 mb-3">
                          <p className="text-xs text-slate-500 mb-0.5">💬 Start with:</p>
                          <p className="text-xs text-violet-700 italic line-clamp-2">
                            "{rec.conversation_starter}"
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-1 bg-violet-600 hover:bg-violet-700"
                          onClick={() => openChat(rec.user_id, rec.display_name, rec.avatar)}
                        >
                          <MessageCircle className="w-3 h-3" />
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openProfile(rec.user_id)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Show more link */}
            {recommendations.length > limit && activeCategory === 'all' && (
              <div className="text-center mt-4">
                <Button variant="ghost" className="gap-1 text-violet-600">
                  View all {recommendations.length} recommendations
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Discover Your Best Matches
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Our AI analyzes your profile, skills, interests, and past interactions to find people you'll truly connect with.
            </p>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="gap-2 bg-violet-600 hover:bg-violet-700"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}