import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Users, Zap, Star, Heart, Target, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIMissionCollaboratorSuggester({ mission, currentUserId, onInvite }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfilesForMission'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200)
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Filter out already participating users
      const existingParticipants = mission?.participant_ids || [];
      const potentialCollaborators = allProfiles.filter(p => 
        p.user_id !== currentUserId && 
        p.user_id !== mission?.creator_id &&
        !existingParticipants.includes(p.user_id)
      );

      // Build mission context
      const missionContext = {
        title: mission?.title,
        objective: mission?.objective,
        description: mission?.description,
        roles_needed: mission?.roles_needed || [],
        mission_type: mission?.mission_type,
        reward_ggg: mission?.reward_ggg,
        reward_rank_points: mission?.reward_rank_points
      };

      // Build candidate profiles with aura/spiritual data
      const candidates = potentialCollaborators.slice(0, 30).map(p => ({
        user_id: p.user_id,
        display_name: p.display_name,
        bio: p.bio,
        skills: p.skills || [],
        values: p.values_tags || [],
        intentions: p.intentions || [],
        spiritual_practices: p.spiritual_practices || [],
        consciousness_orientation: p.consciousness_orientation || [],
        lineage_tradition: p.lineage_tradition,
        symbolic_groups: p.symbolic_groups || [],
        qualities_providing: p.qualities_providing || [],
        rank_code: p.rp_rank_code,
        trust_score: p.trust_score || 0,
        mystical: {
          astrological_sign: p.astrological_sign,
          numerology_life_path: p.numerology_life_path,
          human_design_type: p.human_design_type,
          enneagram_type: p.enneagram_type
        }
      }));

      const prompt = `You are the SaintAgent Synchronicity Engine, an AI that matches users to missions based on skills AND spiritual/energetic compatibility (aura matching).

MISSION DETAILS:
${JSON.stringify(missionContext, null, 2)}

POTENTIAL COLLABORATORS (${candidates.length}):
${JSON.stringify(candidates, null, 2)}

MATCHING CRITERIA - SKILLS + AURA:

1. **Skills Match (40%)**:
   - Direct skill match with roles_needed
   - Complementary abilities for mission objective
   - Experience level (rank_code, trust_score)

2. **Aura/Energy Compatibility (30%)**:
   - Spiritual practice alignment
   - Consciousness orientation match
   - Mystical compatibility (astrology, numerology, human design)
   - Symbolic group resonance (144000, lightworkers, builders)
   - Lineage/tradition harmony

3. **Values & Intent Alignment (20%)**:
   - Shared values relevant to mission
   - Compatible intentions
   - Qualities they provide vs mission needs

4. **Trust & Reliability (10%)**:
   - Trust score
   - Rank/experience level

For each TOP 6 candidate, provide:
- overall_score (0-100)
- skills_score (0-100)
- aura_score (0-100) - spiritual/energetic compatibility
- why_perfect: 2-3 sentence explanation
- role_fit: what role they'd best fill
- aura_insights: specific spiritual/energetic synergies
- potential_contribution: what they uniquely bring`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  overall_score: { type: "number" },
                  skills_score: { type: "number" },
                  aura_score: { type: "number" },
                  why_perfect: { type: "string" },
                  role_fit: { type: "string" },
                  aura_insights: { type: "string" },
                  potential_contribution: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich with profile data
      const enrichedSuggestions = response.suggestions.map(s => {
        const profile = allProfiles.find(p => p.user_id === s.user_id);
        return { ...s, profile };
      }).filter(s => s.profile);

      setSuggestions(enrichedSuggestions);
      setIsGenerating(false);
      return enrichedSuggestions;
    }
  });

  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-violet-500" />
            AI Collaborator Suggestions
          </span>
          <Button
            size="sm"
            onClick={() => generateSuggestionsMutation.mutate()}
            disabled={isGenerating}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Find Matches
              </>
            )}
          </Button>
        </CardTitle>
        <p className="text-sm text-slate-500">
          AI-powered matching based on skills and aura compatibility
        </p>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !isGenerating ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Click "Find Matches" to discover compatible collaborators</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={suggestion.user_id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12" data-user-id={suggestion.user_id}>
                      <AvatarImage src={suggestion.profile?.avatar_url} />
                      <AvatarFallback className="bg-violet-100 text-violet-700">
                        {suggestion.profile?.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {suggestion.profile?.display_name}
                        </span>
                        <Badge className="bg-violet-100 text-violet-700 text-xs">
                          {suggestion.overall_score}% match
                        </Badge>
                        {idx === 0 && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Top Pick
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2 text-xs">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Target className="w-3 h-3" />
                          Skills: {suggestion.skills_score}%
                        </span>
                        <span className="flex items-center gap-1 text-purple-600">
                          <Heart className="w-3 h-3" />
                          Aura: {suggestion.aura_score}%
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                        {suggestion.why_perfect}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                          {suggestion.role_fit}
                        </Badge>
                      </div>

                      <p className="text-xs text-purple-600 dark:text-purple-400 italic">
                        ✨ {suggestion.aura_insights}
                      </p>
                    </div>
                    
                    {onInvite && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onInvite(suggestion.user_id, suggestion.profile)}
                        className="shrink-0"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Invite
                      </Button>
                    )}
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