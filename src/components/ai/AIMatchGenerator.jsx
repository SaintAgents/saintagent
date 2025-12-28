import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Zap } from "lucide-react";

export default function AIMatchGenerator({ profile }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['allMissions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 50)
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['allListings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 50)
  });

  const { data: enginePrefs } = useQuery({
    queryKey: ['enginePreferences', profile?.user_id],
    queryFn: async () => {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: profile.user_id });
      return prefs[0] || null;
    },
    enabled: !!profile?.user_id
  });

  const generateMatchesMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Filter out current user and get potential matches
      const potentialMatches = allProfiles.filter(p => p.user_id !== profile.user_id);
      
      // Prepare context for AI with enhanced preferences
      const userContext = {
        display_name: profile.display_name,
        bio: profile.bio,
        values: profile.values_tags || [],
        intentions: profile.intentions || [],
        skills: profile.skills || [],
        spiritual_practices: profile.spiritual_practices || [],
        qualities_seeking: profile.qualities_seeking || [],
        qualities_providing: profile.qualities_providing || [],
        relationship_status: profile.relationship_status,
        region: profile.region,
        preferences: {
          skills_seeking: enginePrefs?.skills_seeking || [],
          skills_offering: enginePrefs?.skills_offering || [],
          commitment_level: enginePrefs?.commitment_level || 'contributor',
          time_availability: enginePrefs?.time_availability,
          spiritual_alignment_importance: enginePrefs?.spiritual_alignment_importance || 5,
          value_alignment_importance: enginePrefs?.value_alignment_importance || 7,
          consciousness_level_preference: enginePrefs?.consciousness_level_preference || ['any'],
          collaboration_style: enginePrefs?.collaboration_style || [],
          distance_preference: enginePrefs?.distance_preference || 'global',
          energy_compatibility: enginePrefs?.energy_compatibility ?? true
        }
      };

      // Get top 10 potential matches
      const topCandidates = potentialMatches.slice(0, 10).map(p => ({
        id: p.user_id,
        name: p.display_name,
        bio: p.bio,
        values: p.values_tags || [],
        intentions: p.intentions || [],
        skills: p.skills || [],
        qualities_providing: p.qualities_providing || [],
        region: p.region
      }));

      // Call AI to analyze matches with enhanced criteria
      const prompt = `You are an advanced AI matchmaking assistant for a spiritual growth and collaboration platform called SaintAgent.

USER PROFILE & PREFERENCES:
${JSON.stringify(userContext, null, 2)}

POTENTIAL MATCHES:
${JSON.stringify(topCandidates, null, 2)}

Analyze each potential match using these weighted criteria:

1. SKILLS ALIGNMENT (30%):
   - Does the candidate have skills the user is seeking?
   - Are the user's offered skills valuable to the candidate?
   - Skill complementarity for collaboration

2. VALUES & SPIRITUAL ALIGNMENT (${userContext.preferences.value_alignment_importance * 10}%):
   - Shared core values
   - Compatible spiritual practices
   - Consciousness orientation match

3. COMMITMENT & AVAILABILITY (15%):
   - Compatible commitment levels
   - Similar time availability
   - Collaboration style alignment

4. GEOGRAPHIC COMPATIBILITY (10%):
   - Distance preference consideration
   - Regional synergies

5. ENERGY & MYSTICAL COMPATIBILITY (${userContext.preferences.spiritual_alignment_importance * 5}%):
   ${userContext.preferences.energy_compatibility ? '- Astrological and energetic resonance' : '- Basic personality compatibility'}
   - Consciousness orientation match

6. INTENTIONS & PURPOSE (20%):
   - Aligned life intentions
   - Complementary goals
   - Mutual growth potential

For the TOP 5 best matches, provide:
1. Match score (0-100) based on weighted criteria
2. Detailed reasoning with specific examples
3. 3 personalized conversation starters based on shared interests
4. List of shared values
5. List of complementary skills
6. Intent alignment score (0-100)
7. Skill complementarity score (0-100)
8. Timing readiness (how ready both are for collaboration)

Return ONLY the top 5 matches, prioritizing quality over quantity.`;

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
                  target_id: { type: "string" },
                  match_score: { type: "number" },
                  ai_reasoning: { type: "string" },
                  conversation_starters: {
                    type: "array",
                    items: { type: "string" }
                  },
                  shared_values: {
                    type: "array",
                    items: { type: "string" }
                  },
                  complementary_skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  intent_alignment: { type: "number" },
                  skill_complementarity: { type: "number" },
                  timing_readiness: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Create match records
      const matchPromises = response.matches.map(async (match) => {
        const targetProfile = allProfiles.find(p => p.user_id === match.target_id);
        if (!targetProfile) return;

        // Check if match already exists
        const existing = await base44.entities.Match.filter({
          user_id: profile.user_id,
          target_id: match.target_id,
          target_type: 'person'
        });

        if (existing.length > 0) {
          // Update existing match
          return base44.entities.Match.update(existing[0].id, {
            match_score: match.match_score,
            ai_reasoning: match.ai_reasoning,
            conversation_starters: match.conversation_starters,
            shared_values: match.shared_values,
            complementary_skills: match.complementary_skills,
            intent_alignment: match.intent_alignment || 0,
            skill_complementarity: match.skill_complementarity || 0,
            timing_readiness: match.timing_readiness || 0,
            explanation: `AI-generated match based on enhanced criteria including skills, values, commitment level, and spiritual alignment`
          });
        } else {
          // Create new match
          return base44.entities.Match.create({
            user_id: profile.user_id,
            target_type: 'person',
            target_id: match.target_id,
            target_name: targetProfile.display_name,
            target_avatar: targetProfile.avatar_url,
            target_subtitle: targetProfile.bio?.substring(0, 60),
            match_score: match.match_score,
            ai_reasoning: match.ai_reasoning,
            conversation_starters: match.conversation_starters,
            shared_values: match.shared_values,
            complementary_skills: match.complementary_skills,
            intent_alignment: match.intent_alignment || 0,
            skill_complementarity: match.skill_complementarity || 0,
            timing_readiness: match.timing_readiness || 0,
            explanation: `AI-generated match based on enhanced criteria including skills, values, commitment level, and spiritual alignment`,
            status: 'active'
          });
        }
      });

      await Promise.all(matchPromises);
      setIsGenerating(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });

  return (
    <Button
      onClick={() => generateMatchesMutation.mutate()}
      disabled={isGenerating || generateMatchesMutation.isPending}
      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing Profiles...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate AI Matches
        </>
      )}
    </Button>
  );
}