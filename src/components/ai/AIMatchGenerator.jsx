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

  const generateMatchesMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Fetch user preferences
      const preferencesData = await base44.entities.EnginePreference.filter({ user_id: profile.user_id });
      const preferences = preferencesData[0] || {};
      
      // Filter out current user and get potential matches
      const potentialMatches = allProfiles.filter(p => p.user_id !== profile.user_id);
      
      // Prepare enhanced context for AI with preferences
      const userContext = {
        display_name: profile.display_name,
        bio: profile.bio,
        values: profile.values_tags || [],
        intentions: profile.intentions || [],
        skills: profile.skills || [],
        spiritual_practices: profile.spiritual_practices || [],
        consciousness_orientation: profile.consciousness_orientation || [],
        qualities_seeking: profile.qualities_seeking || [],
        qualities_providing: profile.qualities_providing || [],
        relationship_status: profile.relationship_status,
        region: profile.region,
        mystical_profile: {
          astrological_sign: profile.astrological_sign,
          numerology_life_path: profile.numerology_life_path,
          birth_card: profile.birth_card
        },
        preferences: {
          skills_seeking: preferences.skills_seeking || [],
          skills_offering: preferences.skills_offering || [],
          commitment_level: preferences.commitment_level || 'contributor',
          time_availability: preferences.time_availability,
          spiritual_alignment_importance: preferences.spiritual_alignment_importance || 5,
          value_alignment_importance: preferences.value_alignment_importance || 7,
          practices_alignment: preferences.practices_alignment || [],
          consciousness_level_preference: preferences.consciousness_level_preference || ['any'],
          collaboration_style: preferences.collaboration_style || [],
          seeking_roles: preferences.seeking_roles || [],
          offering_roles: preferences.offering_roles || [],
          energy_compatibility: preferences.energy_compatibility !== false,
          distance_preference: preferences.distance_preference || 'global'
        }
      };

      // Get top 15 potential matches with more context
      const topCandidates = potentialMatches.slice(0, 15).map(p => ({
        id: p.user_id,
        name: p.display_name,
        bio: p.bio,
        values: p.values_tags || [],
        intentions: p.intentions || [],
        skills: p.skills || [],
        spiritual_practices: p.spiritual_practices || [],
        consciousness_orientation: p.consciousness_orientation || [],
        qualities_providing: p.qualities_providing || [],
        region: p.region,
        mystical_profile: {
          astrological_sign: p.astrological_sign,
          numerology_life_path: p.numerology_life_path
        }
      }));

      // Enhanced AI prompt with preference weighting
      const prompt = `You are an advanced AI synchronicity matching assistant for a conscious community platform.

USER PROFILE WITH DETAILED PREFERENCES:
${JSON.stringify(userContext, null, 2)}

POTENTIAL MATCHES (${topCandidates.length} candidates):
${JSON.stringify(topCandidates, null, 2)}

CRITICAL MATCHING INSTRUCTIONS:

Analyze and return the TOP 5 BEST MATCHES based on the user's EXPLICIT PREFERENCES:

1. **Skills Alignment** (HIGHEST PRIORITY):
   - Match user's preferences.skills_seeking with candidates' skills
   - Match user's preferences.skills_offering with potential needs
   - Look for direct skill complementarity

2. **Spiritual Alignment** (Weight: ${preferences.spiritual_alignment_importance || 5}/10):
   - Compare spiritual_practices arrays for overlap
   - Match consciousness_orientation with consciousness_level_preference
   - Consider mystical compatibility if energy_compatibility enabled

3. **Value Alignment** (Weight: ${preferences.value_alignment_importance || 7}/10):
   - Deep resonance in shared values
   - Similar life intentions and philosophies

4. **Commitment & Style**:
   - Consider commitment_level compatibility
   - Match collaboration_style preferences
   - Align on time_availability

5. **Role Complementarity**:
   - User's seeking_roles vs candidate capabilities
   - User's offering_roles vs candidate needs

6. **Geographic Preference** (${preferences.distance_preference || 'global'}):
   - Respect distance_preference setting

7. **Qualities Match**:
   - User's qualities_seeking vs candidate's qualities_providing

For EACH of the TOP 5 matches, provide:
- match_score (0-100) - weighted heavily by preference alignment
- ai_reasoning: Detailed explanation focusing on HOW preferences align
- conversation_starters: 3-5 personalized, specific openers
- shared_values: Array of common values
- complementary_skills: Skills that specifically complement based on seeking/offering

Return ONLY the 5 best matches that align with user's stated preferences.`;

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
                  }
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
            explanation: `AI-generated match based on values, skills, and intentions`
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
            explanation: `AI-generated match based on values, skills, and intentions`,
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