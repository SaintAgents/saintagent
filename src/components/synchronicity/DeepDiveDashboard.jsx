import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles, Heart, Target, Users, Zap, TrendingUp, Bell, BellOff,
  ChevronRight, Star, Compass, Lightbulb, HandHeart, Clock, History,
  Brain, RefreshCw, Loader2, MessageSquare, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

// Match DNA Categories
const MATCH_DNA_CATEGORIES = {
  values: { label: 'Values Alignment', icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  aspirations: { label: 'Shared Aspirations', icon: Star, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  resources: { label: 'Resource Synergy', icon: Zap, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  mission: { label: 'Mission Alignment', icon: Target, color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  skills: { label: 'Skill Complement', icon: Lightbulb, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  timing: { label: 'Timing Readiness', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
};

function MatchDNABreakdown({ match }) {
  // Simulate DNA breakdown from match data
  const dnaScores = {
    values: match.intent_alignment || Math.floor(Math.random() * 30) + 70,
    aspirations: Math.floor((match.match_score || 75) * 0.9 + Math.random() * 10),
    resources: match.skill_complementarity || Math.floor(Math.random() * 25) + 65,
    mission: Math.floor((match.match_score || 75) * 0.95 + Math.random() * 5),
    skills: match.skill_complementarity || Math.floor(Math.random() * 20) + 75,
    timing: match.timing_readiness || Math.floor(Math.random() * 20) + 70,
  };

  return (
    <div className="space-y-3">
      {Object.entries(MATCH_DNA_CATEGORIES).map(([key, config]) => {
        const score = dnaScores[key];
        const Icon = config.icon;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${config.bgColor}`}>
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>
                <span className="text-xs text-slate-300">{config.label}</span>
              </div>
              <span className={`text-xs font-semibold ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-slate-400'}`}>
                {score}%
              </span>
            </div>
            <Progress value={score} className="h-1.5 bg-slate-700" />
          </div>
        );
      })}
    </div>
  );
}

function MatchHistoryItem({ entry }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
      <div className={`p-1.5 rounded-full ${entry.change > 0 ? 'bg-emerald-500/20' : entry.change < 0 ? 'bg-rose-500/20' : 'bg-slate-500/20'}`}>
        <TrendingUp className={`w-3 h-3 ${entry.change > 0 ? 'text-emerald-400' : entry.change < 0 ? 'text-rose-400 rotate-180' : 'text-slate-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-300 truncate">{entry.event}</p>
        <p className="text-[10px] text-slate-500">{formatDistanceToNow(new Date(entry.date), { addSuffix: true })}</p>
      </div>
      <span className={`text-xs font-mono ${entry.change > 0 ? 'text-emerald-400' : entry.change < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
        {entry.change > 0 ? '+' : ''}{entry.change}%
      </span>
    </div>
  );
}

function NotificationSettings({ preferences, onUpdate }) {
  const [settings, setSettings] = useState(preferences || {
    high_score_matches: true,
    dating_matches: true,
    mission_collaborators: true,
    threshold: 90
  });

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    onUpdate?.(updated);
  };

  return (
    <Card className="bg-slate-900/80 border-violet-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" />
          Match Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">High-Score Matches (90%+)</span>
          </div>
          <Switch 
            checked={settings.high_score_matches} 
            onCheckedChange={() => handleToggle('high_score_matches')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-slate-300">Dating Matches</span>
          </div>
          <Switch 
            checked={settings.dating_matches} 
            onCheckedChange={() => handleToggle('dating_matches')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-300">Mission Collaborators</span>
          </div>
          <Switch 
            checked={settings.mission_collaborators} 
            onCheckedChange={() => handleToggle('mission_collaborators')}
          />
        </div>
        
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Push notification threshold</p>
          <div className="flex gap-2">
            {[85, 90, 95].map(t => (
              <Button
                key={t}
                size="sm"
                variant={settings.threshold === t ? "default" : "outline"}
                className={settings.threshold === t ? "bg-violet-600" : "border-slate-700 text-slate-400"}
                onClick={() => {
                  const updated = { ...settings, threshold: t };
                  setSettings(updated);
                  onUpdate?.(updated);
                }}
              >
                {t}%+
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchDetailModal({ match, open, onClose, matchHistory }) {
  if (!match) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-violet-500/30 max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-violet-500/50">
              <AvatarImage src={match.target_avatar} />
              <AvatarFallback className="bg-violet-900 text-violet-200">
                {match.target_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{match.target_name}</p>
              <p className="text-sm text-slate-400 font-normal">{match.target_subtitle}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 mt-4">
            {/* Overall Score */}
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <div className="text-4xl font-bold text-white mb-1">{match.match_score}%</div>
              <p className="text-violet-300 text-sm">Overall Compatibility</p>
            </div>
            
            {/* Match DNA Breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-violet-400" />
                Match DNA Breakdown
              </h3>
              <MatchDNABreakdown match={match} />
            </div>
            
            {/* AI Reasoning */}
            {match.ai_reasoning && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  AI Insight
                </h3>
                <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                  {match.ai_reasoning}
                </p>
              </div>
            )}
            
            {/* Shared Values */}
            {match.shared_values?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Shared Values</h3>
                <div className="flex flex-wrap gap-2">
                  {match.shared_values.map((v, i) => (
                    <Badge key={i} className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Conversation Starters */}
            {match.conversation_starters?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <HandHeart className="w-4 h-4 text-emerald-400" />
                  Conversation Starters
                </h3>
                <div className="space-y-2">
                  {match.conversation_starters.slice(0, 3).map((starter, i) => (
                    <p key={i} className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg italic">
                      "{starter}"
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Match History */}
            {matchHistory?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  Connection History
                </h3>
                <div className="space-y-2">
                  {matchHistory.map((entry, i) => (
                    <MatchHistoryItem key={i} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-violet-600 hover:bg-violet-500">
            Connect
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HighScoreMatchCard({ match, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/50 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-amber-500/50">
            <AvatarImage src={match.target_avatar} />
            <AvatarFallback className="bg-amber-900 text-amber-200">
              {match.target_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{match.target_name}</p>
          <p className="text-xs text-slate-400 truncate">{match.target_subtitle}</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{match.match_score}%</div>
          <p className="text-[10px] text-amber-400/70">ELITE MATCH</p>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        {match.shared_values?.slice(0, 2).map((v, i) => (
          <Badge key={i} className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            {v}
          </Badge>
        ))}
        {match.shared_values?.length > 2 && (
          <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-xs">
            +{match.shared_values.length - 2} more
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

export default function DeepDiveDashboard({ userId }) {
  const queryClient = useQueryClient();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [scoreFilter, setScoreFilter] = useState([5, 100]);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });
  
  const { data: matches = [], refetch: refetchMatches } = useQuery({
    queryKey: ['myMatches', currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_id: currentUser.email, status: 'active' }, '-match_score', 100),
    enabled: !!currentUser?.email
  });
  
  const { data: synchronicities = [] } = useQuery({
    queryKey: ['userSynchs', currentUser?.email],
    queryFn: () => base44.entities.Synchronicity.filter({ user_id: currentUser.email }, '-created_date', 20),
    enabled: !!currentUser?.email
  });
  
  const { data: communityPosts = [] } = useQuery({
    queryKey: ['communityFeed'],
    queryFn: () => base44.entities.Post.filter({}, '-created_date', 30)
  });
  
  const { data: forumPosts = [] } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.filter({}, '-created_date', 20)
  });
  
  const { data: preferences } = useQuery({
    queryKey: ['enginePrefs', currentUser?.email],
    queryFn: async () => {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: currentUser.email });
      return prefs?.[0];
    },
    enabled: !!currentUser?.email
  });
  
  const updatePrefsMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        await base44.entities.EnginePreference.update(preferences.id, data);
      } else {
        await base44.entities.EnginePreference.create({ user_id: currentUser.email, ...data });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enginePrefs'] })
  });
  
  // Run AI Deep Analysis
  const runAIAnalysis = async () => {
    setIsRunningAI(true);
    const userContext = {
      profile_summary: profile ? `${profile.display_name || 'User'} - ${profile.bio || 'No bio'}. Values: ${profile.values_tags?.join(', ') || 'Not set'}. Skills: ${profile.skills?.join(', ') || 'Not set'}. Practices: ${profile.spiritual_practices?.join(', ') || 'Not set'}.` : 'User profile not available',
      synchronicities: synchronicities.slice(0, 10).map(s => `${s.category}: ${s.title} - ${s.description}`).join('; '),
      community_activity: communityPosts.slice(0, 5).map(p => p.content?.slice(0, 100)).join('; '),
      forum_activity: forumPosts.slice(0, 5).map(p => `${p.title}: ${p.content?.slice(0, 50)}`).join('; '),
      matches_summary: matches.slice(0, 10).map(m => `${m.target_name} (${m.match_score}%): ${m.explanation || 'No explanation'}`).join('; ')
    };
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Synchronicity Engine AI analyzing patterns for a user on a spiritual/community platform. Based on the following data, provide deep insights:

USER PROFILE:
${userContext.profile_summary}

RECENT SYNCHRONICITIES LOGGED:
${userContext.synchronicities || 'None logged yet'}

COMMUNITY FEED ACTIVITY:
${userContext.community_activity || 'No recent activity'}

FORUM DISCUSSIONS:
${userContext.forum_activity || 'No forum activity'}

CURRENT MATCHES:
${userContext.matches_summary || 'No matches yet'}

Analyze this data and provide:
1. KEY PATTERNS: What recurring themes, symbols, or synchronicities do you see across their experiences?
2. DEEPER CONNECTIONS: What hidden connections exist between their synchronicities and community interactions?
3. PERSONALIZED GUIDANCE: Based on their profile and experiences, what spiritual/personal growth guidance would you offer?
4. RELATED SYNCHRONICITIES: What types of synchronicities should they watch for based on their patterns?
5. COMMUNITY CONNECTIONS: Who in the community (based on posts/forum) might be experiencing similar patterns?

Be specific, insightful, and spiritually-aware in your analysis.`,
      response_json_schema: {
        type: 'object',
        properties: {
          key_patterns: { type: 'array', items: { type: 'string' } },
          deeper_connections: { type: 'string' },
          personalized_guidance: { type: 'string' },
          watch_for: { type: 'array', items: { type: 'string' } },
          community_connections: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, reason: { type: 'string' } } } }
        }
      }
    });
    
    setAiInsights(result);
    setIsRunningAI(false);
  };
  
  // Filter matches by score range
  const filteredMatches = matches.filter(m => 
    m.match_score >= scoreFilter[0] && m.match_score <= scoreFilter[1]
  );
  
  // High score matches (90%+)
  const highScoreMatches = filteredMatches.filter(m => m.match_score >= 90);
  
  // Group by type
  const missionMatches = filteredMatches.filter(m => m.target_type === 'mission' || m.target_type === 'person');
  const datingMatches = filteredMatches.filter(m => m.target_type === 'person');
  
  // Simulated match history for selected match
  const matchHistory = selectedMatch ? [
    { event: 'Initial match discovered', date: selectedMatch.created_date || new Date().toISOString(), change: selectedMatch.match_score },
    { event: 'Shared interest in meditation', date: new Date(Date.now() - 86400000 * 2).toISOString(), change: 3 },
    { event: 'Both joined Mission: Light Grid', date: new Date(Date.now() - 86400000 * 5).toISOString(), change: 5 },
  ] : [];
  
  return (
    <div className="space-y-6">
      {/* Run Deep Dive Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          onClick={runAIAnalysis}
          disabled={isRunningAI}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white gap-2"
        >
          {isRunningAI ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Deep Analysis...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Run Synchro Deep Dive Now
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={async () => {
            await base44.functions.invoke('computeMatches', {});
            refetchMatches();
          }}
          className="gap-2 border-violet-500/30 text-violet-300"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Matches
        </Button>
      </div>
      
      {/* AI Insights Panel */}
      {aiInsights && (
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              AI Deep Dive Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Patterns */}
            {aiInsights.key_patterns?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-violet-300 mb-2 flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Key Patterns Detected
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.key_patterns.map((p, i) => (
                    <Badge key={i} className="bg-violet-500/20 text-violet-200 border-violet-500/30">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Deeper Connections */}
            {aiInsights.deeper_connections && (
              <div>
                <h4 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  Deeper Connections
                </h4>
                <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                  {aiInsights.deeper_connections}
                </p>
              </div>
            )}
            
            {/* Personalized Guidance */}
            {aiInsights.personalized_guidance && (
              <div>
                <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Personalized Guidance
                </h4>
                <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                  {aiInsights.personalized_guidance}
                </p>
              </div>
            )}
            
            {/* Watch For */}
            {aiInsights.watch_for?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Synchronicities to Watch For
                </h4>
                <ul className="space-y-1">
                  {aiInsights.watch_for.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Community Connections */}
            {aiInsights.community_connections?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-rose-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Potential Community Connections
                </h4>
                <div className="space-y-2">
                  {aiInsights.community_connections.map((c, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* High Score Alerts */}
      {highScoreMatches.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Elite Matches ({highScoreMatches.length})
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 ml-2">
                90%+ Compatibility
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-3">
                {highScoreMatches.map(match => (
                  <HighScoreMatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="mission" className="data-[state=active]:bg-violet-600">
            Mission Matches
          </TabsTrigger>
          <TabsTrigger value="dating" className="data-[state=active]:bg-violet-600">
            Dating Matches
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-violet-600">
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Match Stats */}
            <Card className="bg-slate-900/80 border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Match Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className="text-2xl font-bold text-violet-400">{matches.length}</div>
                    <p className="text-xs text-slate-400">Active Matches</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className="text-2xl font-bold text-amber-400">{highScoreMatches.length}</div>
                    <p className="text-xs text-slate-400">Elite (90%+)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {matches.length > 0 ? Math.round(matches.reduce((a, m) => a + m.match_score, 0) / matches.length) : 0}%
                    </div>
                    <p className="text-xs text-slate-400">Avg Score</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {matches.filter(m => m.status === 'converted').length}
                    </div>
                    <p className="text-xs text-slate-400">Connections Made</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <NotificationSettings 
              preferences={preferences}
              onUpdate={(data) => updatePrefsMutation.mutate(data)}
            />
          </div>
          
          {/* Recent Matches */}
          <Card className="bg-slate-900/80 border-violet-500/20 mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white flex items-center justify-between">
                <span>Recent Matches</span>
                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-72">
                <div className="space-y-3">
                  {matches.slice(0, 5).map(match => (
                    <div 
                      key={match.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <Avatar className="w-10 h-10 border border-violet-500/30">
                        <AvatarImage src={match.target_avatar} />
                        <AvatarFallback className="bg-violet-900 text-violet-200 text-sm">
                          {match.target_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{match.target_name}</p>
                        <p className="text-xs text-slate-400 truncate">{match.explanation}</p>
                      </div>
                      <div className={`text-lg font-bold ${match.match_score >= 90 ? 'text-amber-400' : match.match_score >= 80 ? 'text-emerald-400' : 'text-violet-400'}`}>
                        {match.match_score}%
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mission" className="mt-4">
          <Card className="bg-slate-900/80 border-violet-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                Mission Collaborator Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {missionMatches.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No mission matches yet</p>
                  ) : (
                    missionMatches.map(match => (
                      <div 
                        key={match.id}
                        className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-12 h-12 border border-violet-500/30">
                            <AvatarImage src={match.target_avatar} />
                            <AvatarFallback className="bg-violet-900 text-violet-200">
                              {match.target_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-white">{match.target_name}</p>
                            <p className="text-xs text-slate-400">{match.target_subtitle}</p>
                          </div>
                          <div className="text-xl font-bold text-violet-400">{match.match_score}%</div>
                        </div>
                        <MatchDNABreakdown match={match} />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dating" className="mt-4">
          <Card className="bg-slate-900/80 border-rose-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                Dating Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {datingMatches.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No dating matches yet</p>
                  ) : (
                    datingMatches.map(match => (
                      <div 
                        key={match.id}
                        className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-12 h-12 border-2 border-rose-500/30">
                            <AvatarImage src={match.target_avatar} />
                            <AvatarFallback className="bg-rose-900 text-rose-200">
                              {match.target_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-white">{match.target_name}</p>
                            <p className="text-xs text-slate-400">{match.target_subtitle}</p>
                          </div>
                          <div className="text-xl font-bold text-rose-400">{match.match_score}%</div>
                        </div>
                        <MatchDNABreakdown match={match} />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-4">
          <NotificationSettings 
            preferences={preferences}
            onUpdate={(data) => updatePrefsMutation.mutate(data)}
          />
        </TabsContent>
      </Tabs>
      
      {/* Match Detail Modal */}
      <MatchDetailModal 
        match={selectedMatch}
        open={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        matchHistory={matchHistory}
      />
    </div>
  );
}