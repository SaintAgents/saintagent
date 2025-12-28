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
      
      // Fetch historical ratings for learning
      const previousMatches = await base44.entities.Match.filter({ 
        user_id: profile.user_id 
      });
      const ratedMatches = previousMatches.filter(m => m.user_rating);
      const avgRating = ratedMatches.length > 0 
        ? ratedMatches.reduce((sum, m) => sum + m.user_rating, 0) / ratedMatches.length 
        : 0;
      const highRatedMatches = ratedMatches.filter(m => m.user_rating >= 4);

      // Prepare context for AI with enhanced preferences
      const userContext = {
        display_name: profile.display_name,
        bio: profile.bio,
        values: profile.values_tags || [],
        intentions: profile.intentions || [],
        skills: profile.skills || [],
        spiritual_practices: profile.spiritual_practices || [],
        consciousness_orientation: profile.consciousness_orientation || [],
        lineage_tradition: profile.lineage_tradition,
        symbolic_groups: profile.symbolic_groups || [],
        qualities_seeking: profile.qualities_seeking || [],
        qualities_providing: profile.qualities_providing || [],
        relationship_status: profile.relationship_status,
        region: profile.region,
        mystical_profile: {
          astrological_sign: profile.astrological_sign,
          rising_sign: profile.rising_sign,
          moon_sign: profile.moon_sign,
          numerology_life_path: profile.numerology_life_path,
          birth_card: profile.birth_card,
          sun_card: profile.sun_card
        },
        preferences: {
          skills_seeking: enginePrefs?.skills_seeking || [],
          skills_offering: enginePrefs?.skills_offering || [],
          commitment_level: enginePrefs?.commitment_level || 'contributor',
          time_availability: enginePrefs?.time_availability,
          spiritual_alignment_importance: enginePrefs?.spiritual_alignment_importance || 5,
          value_alignment_importance: enginePrefs?.value_alignment_importance || 7,
          practices_alignment: enginePrefs?.practices_alignment || [],
          consciousness_level_preference: enginePrefs?.consciousness_level_preference || ['any'],
          collaboration_style: enginePrefs?.collaboration_style || [],
          distance_preference: enginePrefs?.distance_preference || 'global',
          energy_compatibility: enginePrefs?.energy_compatibility ?? true
        }
      };

      // Get top 15 potential matches with full spiritual context
      const topCandidates = potentialMatches.slice(0, 15).map(p => ({
        id: p.user_id,
        name: p.display_name,
        bio: p.bio,
        values: p.values_tags || [],
        intentions: p.intentions || [],
        skills: p.skills || [],
        spiritual_practices: p.spiritual_practices || [],
        consciousness_orientation: p.consciousness_orientation || [],
        lineage_tradition: p.lineage_tradition,
        symbolic_groups: p.symbolic_groups || [],
        qualities_providing: p.qualities_providing || [],
        region: p.region,
        mystical_profile: {
          astrological_sign: p.astrological_sign,
          numerology_life_path: p.numerology_life_path
        }
      }));

      // Call AI to analyze matches with enhanced spiritual criteria and learning
      const prompt = `You are an advanced AI synchronicity matching assistant for a conscious spiritual community platform called SaintAgent.

USER PROFILE WITH DETAILED PREFERENCES:
${JSON.stringify(userContext, null, 2)}

POTENTIAL MATCHES (${topCandidates.length} candidates):
${JSON.stringify(topCandidates, null, 2)}

LEARNING FROM PAST RATINGS:
- User has rated ${ratedMatches.length} previous matches (avg: ${avgRating.toFixed(1)}/5 stars)
- ${highRatedMatches.length} matches were rated highly (4-5 stars)
${highRatedMatches.length > 0 ? `
High-rated match patterns observed:
${highRatedMatches.slice(0, 2).map(m => `- Match score: ${m.match_score}, Values: ${m.shared_values?.join(', ') || 'N/A'}, Spiritual: ${m.spiritual_alignment_score || 'N/A'}`).join('\n')}
` : ''}

CRITICAL MATCHING INSTRUCTIONS - LEARN FROM FEEDBACK:

Analyze and return the TOP 5 BEST MATCHES. Use past ratings to refine your approach:

1. **Skills Alignment** (HIGHEST PRIORITY - 30%):
   - Match user's preferences.skills_seeking with candidates' skills
   - Match user's preferences.skills_offering with potential needs
   - Direct skill complementarity and teaching opportunities

2. **Spiritual Alignment** (Weight: ${userContext.preferences.spiritual_alignment_importance * 10}%):
   - DEEP analysis of spiritual_practices overlap
   - Match consciousness_orientation with consciousness_level_preference
   - Lineage/tradition compatibility (same tradition = strong resonance)
   - Symbolic group alignment (144000, lightworkers, wayshowers, etc.)
   - If energy_compatibility enabled, evaluate mystical synergies:
     * Astrological compatibility (sun/moon/rising signs)
     * Numerology harmony (life path numbers)
     * Birth card/Sun card resonance
   - Provide spiritual_alignment_score (0-100) and spiritual_synergies array

3. **Value & Purpose Alignment** (Weight: ${userContext.preferences.value_alignment_importance * 10}%):
   - Deep resonance in shared core values
   - Similar life intentions and purpose
   - Qualities_seeking vs qualities_providing alignment

4. **Commitment & Collaboration** (15%):
   - Commitment_level compatibility
   - Collaboration_style match (structured, flexible, spontaneous)
   - Time_availability alignment

5. **Geographic & Practical** (10%):
   - Respect distance_preference (${userContext.preferences.distance_preference})
   - Consider region/timezone

For EACH of the TOP 5 matches, provide:
- match_score (0-100) - overall weighted score
- spiritual_alignment_score (0-100) - dedicated spiritual compatibility
- intent_alignment (0-100) - purpose and intention alignment
- skill_complementarity (0-100) - how well skills match
- timing_readiness (0-100) - readiness for collaboration
- ai_reasoning: 2-3 sentences explaining WHY this match is exceptional
- conversation_starters: 3-5 highly personalized, meaningful openers
- shared_values: Array of common values
- complementary_skills: Specific skills that complement
- spiritual_synergies: Array of spiritual alignments (practices, beliefs, orientations)

ADAPT based on user's ${ratedMatches.length} previous ratings to improve future matches.

Return ONLY the 5 best matches that align with preferences and past feedback.`;

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
                  spiritual_alignment_score: { type: "number" },
                  intent_alignment: { type: "number" },
                  skill_complementarity: { type: "number" },
                  timing_readiness: { type: "number" },
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
                  spiritual_synergies: {
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

        const matchData = {
          match_score: match.match_score,
          spiritual_alignment_score: match.spiritual_alignment_score || 0,
          intent_alignment: match.intent_alignment || 0,
          skill_complementarity: match.skill_complementarity || 0,
          timing_readiness: match.timing_readiness || 0,
          ai_reasoning: match.ai_reasoning,
          conversation_starters: match.conversation_starters,
          shared_values: match.shared_values,
          complementary_skills: match.complementary_skills,
          spiritual_synergies: match.spiritual_synergies || [],
          explanation: `AI match: ${match.spiritual_alignment_score || 0}% spiritual alignment`
        };

        if (existing.length > 0) {
          // Update existing match (preserve rating if exists)
          return base44.entities.Match.update(existing[0].id, matchData);
        } else {
          // Create new match
          return base44.entities.Match.create({
            user_id: profile.user_id,
            target_type: 'person',
            target_id: match.target_id,
            target_name: targetProfile.display_name,
            target_avatar: targetProfile.avatar_url,
            target_subtitle: targetProfile.bio?.substring(0, 60),
            ...matchData,
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