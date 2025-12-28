import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Clock,
  MessageCircle,
  Calendar,
  Heart,
  Zap,
  RefreshCw,
  Loader2,
  Settings,
  MoreVertical,
  Ban
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
import SynchronicitySettings from './SynchronicitySettings';

export default function SynchronicityFeed({ profile, compact = false }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['enginePreferences', profile?.user_id],
    queryFn: async () => {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: profile.user_id });
      return prefs[0] || null;
    },
    enabled: !!profile?.user_id
  });

  const { data: allMatches = [], refetch } = useQuery({
    queryKey: ['synchronicityMatches', profile?.user_id],
    queryFn: () => base44.entities.Match.filter(
      { user_id: profile.user_id },
      '-match_score',
      50
    ),
    enabled: !!profile?.user_id
  });

  // Filter matches based on preferences
  const matches = React.useMemo(() => {
    if (!preferences) return allMatches.filter(m => m.status === 'active');
    
    return allMatches.filter(m => {
      // Exclude blocked matches
      if (m.status === 'blocked') return false;
      
      // Only show active matches
      if (m.status !== 'active') return false;
      
      // Apply minimum score threshold
      if (m.match_score < (preferences.minimum_match_score || 70)) return false;
      
      // Filter by match types if specified
      if (preferences.match_types_enabled?.length > 0) {
        const matchType = m.target_type; // Could map this to match_type field
        // For now, we'll allow all since target_type doesn't map directly
      }
      
      return true;
    });
  }, [allMatches, preferences]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['agentConversations', 'synchronicity_engine'],
    queryFn: () => base44.agents.listConversations({ agent_name: 'synchronicity_engine' }),
    enabled: !!profile?.user_id
  });

  const blockUserMutation = useMutation({
    mutationFn: (matchId) => base44.entities.Match.update(matchId, { status: 'blocked' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synchronicityMatches'] });
      toast.success('User blocked from feed');
    }
  });

  const handleGenerateMatches = async () => {
    // Check if engine is enabled
    if (preferences && !preferences.synchronicity_engine_enabled) {
      toast.error('Synchronicity Engine is disabled. Enable it in settings.');
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Create or get existing conversation
      let conversation;
      if (conversations.length > 0) {
        conversation = conversations[0];
      } else {
        conversation = await base44.agents.createConversation({
          agent_name: 'synchronicity_engine',
          metadata: {
            name: 'Synchronicity Scan',
            user_id: profile.user_id
          }
        });
      }

      // Build prompt based on preferences
      let prompt = `Scan for deep synchronicity matches for user ${profile.user_id}. `;
      
      if (preferences?.match_types_enabled?.length > 0) {
        prompt += `Focus on these match types: ${preferences.match_types_enabled.join(', ')}. `;
      }
      
      if (preferences?.minimum_match_score) {
        prompt += `Only create matches with score ${preferences.minimum_match_score}+. `;
      }
      
      if (preferences?.mystical_matching) {
        prompt += `Include mystical/astrological alignment analysis. `;
      }
      
      if (preferences?.location_sharing) {
        prompt += `Prioritize nearby users and location synchronicities. `;
      }
      
      prompt += `Analyze all users and create Match records for high-resonance connections. Consider values, spiritual alignment, mystical identifiers, intentions, desires, and mission overlap. Focus on meaningful synchronicities with detailed explanations.`;

      // Send request to agent
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: prompt
      });

      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refetch matches
      await refetch();
      toast.success('Synchronicity scan complete! New matches detected.');
    } catch (error) {
      console.error('Match generation error:', error);
      toast.error('Failed to generate matches');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBlockUser = (matchId) => {
    blockUserMutation.mutate(matchId);
  };

  const getMatchTypeIcon = (type) => {
    const icons = {
      person: Sparkles,
      offer: Zap,
      mission: Calendar,
      romantic: Heart
    };
    return icons[type] || Sparkles;
  };

  const getMatchTypeColor = (type) => {
    const colors = {
      person: 'bg-violet-100 text-violet-700',
      offer: 'bg-amber-100 text-amber-700',
      mission: 'bg-blue-100 text-blue-700',
      romantic: 'bg-rose-100 text-rose-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Synchronicity Feed
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleGenerateMatches}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {matches.slice(0, 3).map((match) => {
            const Icon = getMatchTypeIcon(match.target_type);
            return (
              <div key={match.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <Avatar className="w-8 h-8" data-user-id={match.target_id}>
                  <AvatarImage src={match.target_avatar} />
                  <AvatarFallback className="text-xs">{match.target_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{match.target_name}</p>
                  <p className="text-xs text-slate-500 truncate">{match.explanation}</p>
                </div>
                <div className="shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {match.match_score}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Synchronicity Feed
          </h3>
          <p className="text-sm text-slate-500">
            Deep resonance matches detected by AI
            {preferences && !preferences.synchronicity_engine_enabled && (
              <span className="text-amber-600 ml-2">(Engine Disabled)</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateMatches}
            disabled={isGenerating}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan
              </>
            )}
          </Button>
          <Button 
            onClick={() => setSettingsOpen(true)}
            variant="outline"
            size="icon"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No synchronicities detected yet</p>
                <p className="text-sm text-slate-400 mt-1">Click "Scan for Matches" to find your resonant connections</p>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => {
              const Icon = getMatchTypeIcon(match.target_type);
              return (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4 mb-3">
                      <Avatar className="w-12 h-12" data-user-id={match.target_id}>
                        <AvatarImage src={match.target_avatar} />
                        <AvatarFallback>{match.target_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{match.target_name}</h4>
                          <Badge className={getMatchTypeColor(match.target_type)}>
                            {match.match_score}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{match.target_subtitle}</p>
                        
                        {match.timing_window && (
                          <div className="flex items-center gap-1.5 text-xs text-violet-600 mb-2">
                            <Clock className="w-3 h-3" />
                            {match.timing_window}
                            </div>
                            )}
                            </div>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBlockUser(match.id)} className="text-rose-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Block from feed
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            </div>

                    {/* Synchronicity Explanation */}
                    <div className="mb-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
                      <p className="text-xs font-medium text-violet-900 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Synchronicity Detected
                      </p>
                      <p className="text-sm text-violet-700">{match.explanation}</p>
                    </div>

                    {/* AI Reasoning */}
                    {match.ai_reasoning && (
                      <div className="mb-3 p-3 rounded-lg bg-slate-50">
                        <p className="text-xs font-medium text-slate-700 mb-1">Why This Match</p>
                        <p className="text-xs text-slate-600">{match.ai_reasoning}</p>
                      </div>
                    )}

                    {/* Shared Elements */}
                    {(match.shared_values?.length > 0 || match.complementary_skills?.length > 0) && (
                      <div className="mb-3 space-y-2">
                        {match.shared_values?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-700 mb-1">Shared Values</p>
                            <div className="flex flex-wrap gap-1">
                              {match.shared_values.map((value, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {match.complementary_skills?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-slate-700 mb-1">Complementary Skills</p>
                            <div className="flex flex-wrap gap-1">
                              {match.complementary_skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-blue-50">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conversation Starters */}
                    {match.conversation_starters?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-slate-700 mb-2">Conversation Starters</p>
                        <div className="space-y-1">
                          {match.conversation_starters.slice(0, 2).map((starter, i) => (
                            <p key={i} className="text-xs text-slate-600 italic">"{starter}"</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700">
                        <MessageCircle className="w-3 h-3 mr-1.5" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        Book Meeting
                      </Button>
                    </div>

                    {/* Timestamp */}
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      Detected {formatDistanceToNow(parseISO(match.created_date), { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      <SynchronicitySettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
      />
    </div>
  );
}