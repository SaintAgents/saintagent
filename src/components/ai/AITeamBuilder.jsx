import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Loader2, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AITeamBuilder({ mission, currentProfile }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 50)
  });

  const { data: allSkills = [] } = useQuery({
    queryKey: ['allSkills'],
    queryFn: () => base44.entities.Skill.list('-created_date', 200)
  });

  const generateTeamMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      // Filter out already joined members
      const existingMembers = mission.participant_ids || [];
      const availableProfiles = allProfiles.filter(p => !existingMembers.includes(p.user_id));

      // Build skills map
      const skillsMap = {};
      allSkills.forEach(skill => {
        if (!skillsMap[skill.user_id]) skillsMap[skill.user_id] = [];
        skillsMap[skill.user_id].push({
          name: skill.skill_name,
          proficiency: skill.proficiency,
          type: skill.type
        });
      });

      // Prepare mission context
      const missionContext = {
        title: mission.title,
        objective: mission.objective,
        description: mission.description,
        mission_type: mission.mission_type,
        roles_needed: mission.roles_needed || [],
        required_skills: mission.skills_required || []
      };

      // Prepare candidate pool
      const candidates = availableProfiles.slice(0, 20).map(p => ({
        user_id: p.user_id,
        name: p.display_name,
        bio: p.bio,
        skills: skillsMap[p.user_id] || [],
        intentions: p.intentions || [],
        values: p.values_tags || [],
        commitment_level: p.commitment_level,
        region: p.region,
        spiritual_practices: p.spiritual_practices || [],
        consciousness_orientation: p.consciousness_orientation || []
      }));

      const prompt = `You are an AI team formation assistant for a conscious collaboration platform.

MISSION DETAILS:
${JSON.stringify(missionContext, null, 2)}

AVAILABLE CANDIDATES (${candidates.length} people):
${JSON.stringify(candidates, null, 2)}

TASK: Suggest the OPTIMAL TEAM of 3-5 people for this mission.

Evaluate candidates based on:
1. **Skills Match** (40%): Do they have the required skills and proficiency?
2. **Role Fit** (25%): Can they fill needed roles?
3. **Collaboration Style** (15%): Do they work well together based on consciousness orientation and values?
4. **Commitment & Availability** (10%): Are they likely to commit?
5. **Diversity & Balance** (10%): Complementary skills, perspectives, backgrounds

For each recommended team member, provide:
- match_score (0-100): Overall fit
- role_in_mission: Primary role they'd fulfill
- key_strengths: 2-3 specific strengths they bring
- synergy_notes: Why they'd work well with this specific mission/team
- skills_contribution: Specific skills they contribute

Return 3-5 recommendations ranked by fit.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            team_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  match_score: { type: "number" },
                  role_in_mission: { type: "string" },
                  key_strengths: {
                    type: "array",
                    items: { type: "string" }
                  },
                  synergy_notes: { type: "string" },
                  skills_contribution: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            team_analysis: { type: "string" }
          }
        }
      });

      // Enrich with profile data
      const enrichedTeam = response.team_recommendations.map(rec => {
        const profile = allProfiles.find(p => p.user_id === rec.user_id);
        return {
          ...rec,
          profile
        };
      });

      setSuggestions({
        team: enrichedTeam,
        analysis: response.team_analysis
      });
      setIsGenerating(false);
    }
  });

  const handleInvite = async (userId) => {
    // Create a notification to invite the user
    await base44.entities.Notification.create({
      user_id: userId,
      type: 'mission',
      title: `Mission Invitation: ${mission.title}`,
      message: `You've been AI-matched to join ${mission.title}. Your skills are a great fit!`,
      action_url: `/missions/${mission.id}`,
      action_label: 'View Mission',
      priority: 'normal'
    });
  };

  return (
    <div className="space-y-4">
      {!suggestions ? (
        <Button
          onClick={() => generateTeamMutation.mutate()}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Building Optimal Team...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI-Generate Dream Team
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Team Analysis */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
            <h4 className="font-semibold text-violet-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Team Analysis
            </h4>
            <p className="text-sm text-violet-800">{suggestions.analysis}</p>
          </div>

          {/* Recommended Team Members */}
          <div className="space-y-3">
            {suggestions.team.map((member, idx) => (
              <Card key={member.user_id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.profile?.avatar_url} />
                        <AvatarFallback className="text-sm">
                          {member.profile?.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {member.profile?.display_name}
                          </h4>
                          <p className="text-xs text-slate-500">{member.role_in_mission}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-violet-100 text-violet-700">
                            {member.match_score}% match
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-3">{member.synergy_notes}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {member.key_strengths.map((strength, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            {strength}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {member.skills_contribution.map((skill, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-700 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleInvite(member.user_id)}
                        className="rounded-lg bg-violet-600 hover:bg-violet-700"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => setSuggestions(null)}
          >
            Generate New Suggestions
          </Button>
        </div>
      )}
    </div>
  );
}