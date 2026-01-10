import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Target, Wand2, Copy, Check, Rocket, Users, Coins, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIMissionProposalGenerator({ onMissionGenerated, profile }) {
  const [userInput, setUserInput] = useState('');
  const [missionType, setMissionType] = useState('platform');
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are a mission design assistant for SaintAgent, a conscious spiritual community platform.

USER'S IDEA/INPUT:
"${userInput}"

USER PROFILE CONTEXT:
- Name: ${profile?.display_name || 'Unknown'}
- Skills: ${(profile?.skills || []).join(', ') || 'Not specified'}
- Values: ${(profile?.values_tags || []).join(', ') || 'Not specified'}
- Intentions: ${(profile?.intentions || []).join(', ') || 'Not specified'}

MISSION TYPE: ${missionType}
- platform: Community-wide missions for all users
- circle: Circle-specific collaborative missions
- region: Location-based regional missions
- leader: Leadership-initiated high-impact missions
- personal: Individual growth missions

Create a compelling, actionable mission proposal with:

1. **Title**: Inspiring, action-oriented (max 60 chars)
2. **Objective**: Clear, measurable goal (1-2 sentences)
3. **Description**: Detailed explanation with context and impact (2-3 paragraphs)
4. **Tasks**: 3-5 specific actionable tasks with clear deliverables
5. **Roles Needed**: 3-5 roles with required skills
6. **Success Criteria**: How we'll know mission is complete
7. **Rewards**: Suggested GGG tokens (50-500) and Rank Points (10-100) based on difficulty
8. **Duration**: Suggested timeframe
9. **Impact Statement**: Why this matters to the community

Make it inspiring, aligned with spiritual growth principles, and practically achievable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            objective: { type: "string" },
            description: { type: "string" },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            roles_needed: {
              type: "array",
              items: { type: "string" }
            },
            success_criteria: {
              type: "array",
              items: { type: "string" }
            },
            suggested_ggg: { type: "number" },
            suggested_rank_points: { type: "number" },
            duration_days: { type: "number" },
            impact_statement: { type: "string" }
          }
        }
      });

      setGeneratedProposal(response);
      return response;
    }
  });

  const handleCopyToClipboard = () => {
    if (!generatedProposal) return;
    const text = `
Mission: ${generatedProposal.title}

Objective: ${generatedProposal.objective}

${generatedProposal.description}

Tasks:
${generatedProposal.tasks.map((t, i) => `${i + 1}. ${t.title}: ${t.description}`).join('\n')}

Roles Needed: ${generatedProposal.roles_needed.join(', ')}

Success Criteria:
${generatedProposal.success_criteria.map(c => `• ${c}`).join('\n')}

Rewards: ${generatedProposal.suggested_ggg} GGG, ${generatedProposal.suggested_rank_points} RP
Duration: ${generatedProposal.duration_days} days

Impact: ${generatedProposal.impact_statement}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseMission = () => {
    if (generatedProposal && onMissionGenerated) {
      onMissionGenerated({
        title: generatedProposal.title,
        objective: generatedProposal.objective,
        description: generatedProposal.description,
        tasks: generatedProposal.tasks.map((t, i) => ({
          id: `task_${i}`,
          title: t.title,
          completed: false
        })),
        roles_needed: generatedProposal.roles_needed,
        reward_ggg: generatedProposal.suggested_ggg,
        reward_rank_points: generatedProposal.suggested_rank_points,
        mission_type: missionType
      });
    }
  };

  return (
    <Card className="border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-emerald-500" />
          AI Mission Proposal Generator
        </CardTitle>
        <CardDescription>
          Describe your mission idea and let AI craft a complete proposal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Mission Type
            </label>
            <Select value={missionType} onValueChange={setMissionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">🌍 Platform-wide Mission</SelectItem>
                <SelectItem value="circle">⭕ Circle Mission</SelectItem>
                <SelectItem value="region">📍 Regional Mission</SelectItem>
                <SelectItem value="leader">👑 Leader Mission</SelectItem>
                <SelectItem value="personal">🧘 Personal Mission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Your Mission Idea
            </label>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Describe your mission idea... e.g., 'Create a community meditation challenge to help members establish daily practice habits'"
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!userInput.trim() || generateMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Proposal...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Mission Proposal
              </>
            )}
          </Button>
        </div>

        {generatedProposal && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  {generatedProposal.title}
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                  {generatedProposal.objective}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyToClipboard}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-line">
              {generatedProposal.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-medium">Rewards</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {generatedProposal.suggested_ggg} GGG
                </p>
                <p className="text-sm text-slate-500">
                  +{generatedProposal.suggested_rank_points} RP
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {generatedProposal.duration_days} days
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tasks</h4>
              <div className="space-y-2">
                {generatedProposal.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">{task.title}</span>
                      <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Roles Needed</h4>
              <div className="flex flex-wrap gap-2">
                {generatedProposal.roles_needed.map((role, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white/60">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-violet-100/60 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">Impact</span>
              </div>
              <p className="text-sm text-violet-800 dark:text-violet-200">
                {generatedProposal.impact_statement}
              </p>
            </div>

            {onMissionGenerated && (
              <Button
                onClick={handleUseMission}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Use This Mission
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}