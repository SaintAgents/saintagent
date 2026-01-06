import React, { useState, useRef, useEffect } from 'react';
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
  MessageCircle,
  Star,
  Lightbulb,
  Eye,
  ChevronRight,
  Zap,
  X,
  GripHorizontal,
  Heart } from
'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import { DEMO_AVATARS_MALE, DEMO_AVATARS_FEMALE } from '@/components/demoAvatars';

// Demo names for candidates without real names
const DEMO_NAMES_FEMALE = ['Sophia', 'Maya', 'Luna', 'Aurora', 'Elena', 'Aria', 'Serena', 'Willow', 'Iris', 'Nova'];
const DEMO_NAMES_MALE = ['Marcus', 'Ethan', 'Leo', 'Kai', 'Julian', 'Adrian', 'Ezra', 'Felix', 'Orion', 'Silas'];

export default function AIDiscoverMatches({ profile, compact = false }) {
  const queryClient = useQueryClient();
  const [discoveries, setDiscoveries] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Draggable state for expanded view
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  
  // Initialize position when expanded
  useEffect(() => {
    if (isExpanded) {
      const width = 400;
      const height = 500;
      setPosition({
        x: Math.max(8, (window.innerWidth - width) / 2),
        y: Math.max(8, (window.innerHeight - height) / 2)
      });
    }
  }, [isExpanded]);
  
  // Handle drag
  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current) return;
      const width = containerRef.current?.offsetWidth || 400;
      const height = containerRef.current?.offsetHeight || 500;
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;
      newX = Math.min(Math.max(8, newX), window.innerWidth - width - 8);
      newY = Math.min(Math.max(8, newY), window.innerHeight - height - 8);
      setPosition({ x: newX, y: newY });
    };
    const onMouseUp = () => { draggingRef.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  
  const startDrag = (e) => {
    draggingRef.current = true;
    dragOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

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
      // Apply gender preference filter
      const myInterestedIn = myDP?.interested_in || [];
      const genderToInterest = { 'man': 'men', 'woman': 'women', 'non_binary': 'non_binary' };
      
      const candidates = allDatingProfiles
        .filter((p) => {
          if (p.user_id === currentUser?.email) return false;
          // Apply gender filter
          if (myInterestedIn.length > 0 && !myInterestedIn.includes('all')) {
            const candidateGender = p.gender;
            if (!candidateGender) return false;
            const candidateInterestKey = genderToInterest[candidateGender];
            if (!candidateInterestKey || !myInterestedIn.includes(candidateInterestKey)) {
              return false;
            }
          }
          return true;
        })
        .slice(0, 15);

      if (candidates.length === 0) {
        return { discoveries: [] };
      }

      // Build rich context
      const candidateProfiles = candidates.map((c) => {
        const up = userProfiles.find((u) => u.user_id === c.user_id);
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
        recentTopics: userPosts.slice(0, 5).map((p) => p.content?.slice(0, 100)),
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

      // Enrich with profile data and assign unique demo avatars and names
      const usedMaleIdx = new Set();
      const usedFemaleIdx = new Set();
      const usedMaleNameIdx = new Set();
      const usedFemaleNameIdx = new Set();

      const enriched = (response.discoveries || []).map((d, idx) => {
        const dp = allDatingProfiles.find((p) => p.user_id === d.user_id);
        const up = userProfiles.find((u) => u.user_id === d.user_id);
        const isDemo = dp?.is_demo === true;
        
        // Determine gender for avatar/name assignment
        const candidateGender = dp?.gender;
        const isFemale = candidateGender === 'woman';
        const isMale = candidateGender === 'man';
        // Default to alternating if gender not set
        const defaultFemale = idx % 2 === 1;

        // Get display name - use real name or assign a demo name
        let displayName = up?.display_name;
        if (!displayName || displayName.includes('anonymous') || displayName.includes('demo')) {
          if (isFemale || (!isMale && defaultFemale)) {
            for (let i = 0; i < DEMO_NAMES_FEMALE.length; i++) {
              if (!usedFemaleNameIdx.has(i)) {
                usedFemaleNameIdx.add(i);
                displayName = DEMO_NAMES_FEMALE[i];
                break;
              }
            }
          } else {
            for (let i = 0; i < DEMO_NAMES_MALE.length; i++) {
              if (!usedMaleNameIdx.has(i)) {
                usedMaleNameIdx.add(i);
                displayName = DEMO_NAMES_MALE[i];
                break;
              }
            }
          }
          displayName = displayName || 'User';
        }

        // Assign unique demo avatar if no real avatar
        let avatar = up?.avatar_url;
        if (!avatar) {
          if (isFemale || (!isMale && defaultFemale)) {
            for (let i = 0; i < DEMO_AVATARS_FEMALE.length; i++) {
              if (!usedFemaleIdx.has(i)) {
                usedFemaleIdx.add(i);
                avatar = DEMO_AVATARS_FEMALE[i];
                break;
              }
            }
          } else {
            for (let i = 0; i < DEMO_AVATARS_MALE.length; i++) {
              if (!usedMaleIdx.has(i)) {
                usedMaleIdx.add(i);
                avatar = DEMO_AVATARS_MALE[i];
                break;
              }
            }
          }
        }

        return {
          ...d,
          display_name: displayName,
          avatar,
          values: dp?.core_values_ranked || [],
          intent: dp?.relationship_intent,
          isDemo
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
              className="h-7 px-2">

              {discoverMutation.isPending ?
              <Loader2 className="w-3 h-3 animate-spin" /> :

              <RefreshCw className="w-3 h-3" />
              }
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {discoveries?.length > 0 ?
          <div className="space-y-2">
              {discoveries.slice(0, 2).map((d, idx) => {
              const config = discoveryTypeConfig[d.discovery_type] || discoveryTypeConfig.shared_depth;
              const Icon = config.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white border cursor-pointer hover:border-violet-300 transition-colors"
                  onClick={() => openChat(d.user_id, d.display_name, d.avatar)}>

                    <Avatar className="w-8 h-8">
                      <AvatarImage src={d.avatar} />
                      <AvatarFallback>{d.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.display_name}</p>
                      <p className="text-xs text-slate-500 truncate">{d.headline}</p>
                    </div>
                    <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
                  </div>);

            })}
              <Link to={createPageUrl('Matches') + '?tab=dating'}>
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div> :

          <Button
            variant="outline"
            size="sm"
            onClick={() => discoverMutation.mutate()}
            disabled={discoverMutation.isPending}
            className="w-full gap-2">

              {discoverMutation.isPending ?
            <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Discovering...
                </> :

            <>
                  <Sparkles className="w-3 h-3" />
                  Find Hidden Matches
                </>
            }
            </Button>
          }
        </CardContent>
      </Card>);

  }

  // Floating expanded view
  if (isExpanded && discoveries?.length > 0) {
    return (
      <>
        {/* Collapsed card trigger */}
        <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-900/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Lightbulb className="w-5 h-5 text-violet-500" />
                AI Discover
                <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsExpanded(false)}>
                  Show Inline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => discoverMutation.mutate()}
                  disabled={discoverMutation.isPending}
                  className="bg-lime-400 text-slate-50 gap-2"
                >
                  {discoverMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Refresh
                </Button>
              </div>
            </div>
            <p className="text-sm text-slate-500">{discoveries.length} discoveries found - viewing in floating panel</p>
          </CardHeader>
        </Card>
        
        {/* Floating draggable panel */}
        <div
          ref={containerRef}
          className="fixed bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 rounded-2xl shadow-2xl z-[100] w-[400px] max-h-[80vh] overflow-hidden flex flex-col"
          style={{ left: position.x, top: position.y }}
        >
          {/* Drag handle */}
          <div
            onMouseDown={startDrag}
            className="h-10 bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2 text-white">
              <GripHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">AI Discoveries</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsExpanded(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {discoveries.map((d, idx) => {
                const config = discoveryTypeConfig[d.discovery_type] || discoveryTypeConfig.shared_depth;
                const Icon = config.icon;
                return (
                  <Card key={idx} className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={d.avatar} />
                          <AvatarFallback>{d.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{d.display_name}</p>
                          <Badge className={cn("text-xs", config.bg, config.color, "border-0")}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{d.headline}</p>
                      {d.conversation_starter && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 italic">💬 "{d.conversation_starter}"</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-1 bg-violet-600 hover:bg-violet-700" onClick={() => openChat(d.user_id, d.display_name, d.avatar)}>
                          <MessageCircle className="w-3 h-3" /> Connect
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: d.user_id } }))}>
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </>
    );
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-slate-800/80 dark:to-slate-900/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Lightbulb className="w-5 h-5 text-violet-500" />
            AI Discover
            <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {discoveries?.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setIsExpanded(true)}>
                Float
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending} className="bg-lime-400 text-slate-50 px-3 text-xs font-medium rounded-lg inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8 gap-2">
              {discoverMutation.isPending ?
              <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </> :
              <>
                  <Sparkles className="w-4 h-4" />
                  Discover Matches
                </>
              }
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI finds hidden compatibilities you might overlook
        </p>
      </CardHeader>
      <CardContent>
        {discoveries?.length > 0 ?
        <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {discoveries.map((d, idx) => {
              const config = discoveryTypeConfig[d.discovery_type] || discoveryTypeConfig.shared_depth;
              const Icon = config.icon;
              return (
                <Card
                  key={idx}
                  className="w-72 shrink-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 dark:hover:border-violet-500 transition-all hover:shadow-md cursor-pointer">

                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-700 shadow">
                          <AvatarImage src={d.avatar} />
                          <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                            {d.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{d.display_name}</p>
                          <Badge className={cn("text-xs", config.bg, config.color, "border-0")}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 border dark:border-slate-600">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{d.headline}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{d.insight}</p>
                      </div>

                      {d.conversation_starter &&
                    <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">💬 Try asking:</p>
                          <p className="text-sm text-violet-700 dark:text-violet-300 italic">"{d.conversation_starter}"</p>
                        </div>
                    }

                      <div className="flex gap-2">
                        <Button
                        size="sm"
                        className="flex-1 gap-1 rounded-lg bg-violet-600 hover:bg-violet-700"
                        onClick={() => openChat(d.user_id, d.display_name, d.avatar)}>

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
                        }}>

                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>);

            })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea> :

        <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              Let AI analyze profiles to find surprising connections
            </p>
            <Button
            onClick={() => discoverMutation.mutate()}
            disabled={discoverMutation.isPending}
            className="gap-2 bg-violet-600 hover:bg-violet-700">

              {discoverMutation.isPending ?
            <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing profiles...
                </> :

            <>
                  <Sparkles className="w-4 h-4" />
                  Start Discovery
                </>
            }
            </Button>
          </div>
        }
      </CardContent>
    </Card>);

}