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
      
      // Get blocked users list
      const blockedUsers = enginePrefs?.blocked_users || [];
      
      // Filter out current user and blocked users
      const potentialMatches = allProfiles.filter(p => 
        p.user_id !== profile.user_id && !blockedUsers.includes(p.user_id)
      );
      
      // Fetch historical ratings for learning
      const previousMatches = await base44.entities.Match.filter({ user_id: profile.user_id });
      const ratedMatches = previousMatches.filter(m => m.user_rating);
      const highRatedMatches = ratedMatches.filter(m => m.user_rating >= 4);
      const avgRating = ratedMatches.length > 0 
        ? (ratedMatches.reduce((sum, m) => sum + m.user_rating, 0) / ratedMatches.length).toFixed(1)
        : 0;
      
      // Prepare context for AI with enhanced preferences and spiritual profile
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
          seeking_roles: enginePrefs?.seeking_roles || [],
          offering_roles: enginePrefs?.offering_roles || [],
          distance_preference: enginePrefs?.distance_preference || 'global',
          energy_compatibility: enginePrefs?.energy_compatibility ?? true
        }
      };

      // Get top 15 potential matches with full spiritual profiles
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

      // Call AI to analyze matches with enhanced criteria and learning
      const prompt = `You are an advanced AI synchronicity matching assistant for a conscious spiritual community platform called SaintAgent.

USER PROFILE & PREFERENCES:
${JSON.stringify(userContext, null, 2)}

POTENTIAL MATCHES (${topCandidates.length} candidates):
${JSON.stringify(topCandidates, null, 2)}

LEARNING FROM PAST RATINGS:
- User has rated ${ratedMatches.length} previous matches (avg: ${avgRating}/5 stars)
- ${highRatedMatches.length} highly-rated matches (4-5 stars)
${highRatedMatches.length > 0 ? `
Patterns from highly-rated matches:
${highRatedMatches.slice(0, 2).map(m => `- Values: ${m.shared_values?.join(', ') || 'N/A'}, Spiritual Score: ${m.spiritual_alignment_score || 'N/A'}`).join('\n')}
` : ''}

CRITICAL MATCHING CRITERIA - LEARN AND ADAPT:

1. **Skills Alignment** (30% base weight):
   - Match user's preferences.skills_seeking with candidate skills
   - Match user's preferences.skills_offering with candidate needs
   - Look for teaching/learning opportunities
   - Role complementarity (seeking_roles vs offering_roles)

2. **Spiritual Alignment** (Weight: ${userContext.preferences.spiritual_alignment_importance * 10}%):
   - Compare spiritual_practices arrays for deep overlap
   - Match consciousness_orientation with consciousness_level_preference
   - Lineage/tradition compatibility (same = higher score)
   - Symbolic group resonance (144000, lightworkers, wayshowers)
   - If practices_alignment specified, prioritize those practices
   - If energy_compatibility enabled, evaluate mystical synergies:
     * Astrological compatibility (sun, rising, moon signs)
     * Numerology harmony (life path numbers)
     * Birth card/Sun card resonance
   - Provide spiritual_alignment_score (0-100) and spiritual_synergies array

3. **Value Alignment** (Weight: ${userContext.preferences.value_alignment_importance * 10}%):
   - Deep resonance in core values
   - Similar life intentions and purpose
   - Qualities_seeking vs qualities_providing match

4. **Commitment & Collaboration Style** (15%):
   - Compatible commitment_level
   - Match collaboration_style preferences
   - Time_availability alignment

5. **Geographic & Practical** (10%):
   - Respect distance_preference (${userContext.preferences.distance_preference})
   - Region/timezone for collaboration feasibility

6. **Intent & Purpose Alignment** (20%):
   - Aligned intentions (build, teach, heal, lead)
   - Complementary life goals
   - Mutual growth potential

For the TOP 5 best matches, provide:
- match_score (0-100) - overall weighted score
- spiritual_alignment_score (0-100) - dedicated spiritual compatibility
- intent_alignment (0-100) - purpose alignment
- skill_complementarity (0-100) - skills match
- timing_readiness (0-100) - readiness for collaboration
- ai_reasoning: 2-3 sentences on WHY this is exceptional
- conversation_starters: 3-5 personalized, meaningful openers
- shared_values: Array of common values
- complementary_skills: Specific complementary skills
- spiritual_synergies: Array of spiritual alignments (practices, beliefs, orientations)

ADAPT based on user's rating history to improve matches.

Return ONLY the 5 best matches.`;

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

        if (existing.length > 0) {
          // Update existing match
          return base44.entities.Match.update(existing[0].id, {
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
            explanation: `AI match: ${match.spiritual_alignment_score}% spiritual alignment`
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
            spiritual_alignment_score: match.spiritual_alignment_score || 0,
            intent_alignment: match.intent_alignment || 0,
            skill_complementarity: match.skill_complementarity || 0,
            timing_readiness: match.timing_readiness || 0,
            ai_reasoning: match.ai_reasoning,
            conversation_starters: match.conversation_starters,
            shared_values: match.shared_values,
            complementary_skills: match.complementary_skills,
            spiritual_synergies: match.spiritual_synergies || [],
            explanation: `AI match: ${match.spiritual_alignment_score}% spiritual alignment`,
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
      className="bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white rounded-xl gap-2 transition-all duration-200 dark:from-[#00ff88]/20 dark:to-emerald-900/40 dark:border dark:border-[#00ff88]/50 dark:hover:border-[#00ff88] dark:hover:shadow-[0_0_25px_rgba(0,255,136,0.5)]"
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