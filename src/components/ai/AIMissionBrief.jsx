import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Target, AlertTriangle, Lightbulb, Map } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function AIMissionBrief({ mission }) {
  const [brief, setBrief] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBriefMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      const prompt = `You are an AI mission strategist for a conscious collaboration platform.

MISSION:
Title: ${mission.title}
Objective: ${mission.objective}
Description: ${mission.description || 'N/A'}
Type: ${mission.mission_type}
Roles Needed: ${mission.roles_needed?.join(', ') || 'None specified'}
Participants: ${mission.participant_count || 0} people
Timeline: ${mission.start_time} to ${mission.end_time}

TASK: Generate a comprehensive mission brief that will set this team up for success.

Provide:

1. **Mission Overview** (2-3 sentences):
   - Clear summary of what this mission aims to achieve
   - Why it matters in the bigger picture

2. **Key Objectives** (3-5 specific goals):
   - Concrete, measurable objectives
   - Prioritized by importance

3. **Potential Challenges** (3-5 challenges):
   - Realistic obstacles the team might face
   - Technical, interpersonal, or logistical challenges

4. **Recommended Strategies** (4-6 strategies):
   - Actionable approaches to success
   - Best practices for this type of mission
   - How to leverage team strengths

5. **Success Metrics** (3-4 metrics):
   - How to measure if the mission is succeeding
   - Key performance indicators

6. **Timeline Breakdown** (suggested phases):
   - 3-4 key phases or milestones
   - Suggested timeline for each

7. **Communication Tips**:
   - How should the team communicate?
   - Meeting cadence suggestions
   - Collaboration tools recommendations

Return as structured JSON for easy rendering.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            objectives: {
              type: "array",
              items: { type: "string" }
            },
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            strategies: {
              type: "array",
              items: { type: "string" }
            },
            success_metrics: {
              type: "array",
              items: { type: "string" }
            },
            timeline_phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration: { type: "string" },
                  key_activities: { type: "string" }
                }
              }
            },
            communication_tips: { type: "string" }
          }
        }
      });

      setBrief(response);
      setIsGenerating(false);
    }
  });

  return (
    <div className="space-y-4">
      {!brief ? (
        <Button
          onClick={() => generateBriefMutation.mutate()}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Mission Brief...
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Generate AI Mission Brief
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">Mission Overview</h3>
              </div>
              <p className="text-slate-700 leading-relaxed">{brief.overview}</p>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-900">Key Objectives</h3>
              </div>
              <div className="space-y-2">
                {brief.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
                    <Badge className="bg-emerald-600 text-white shrink-0 mt-0.5">
                      {i + 1}
                    </Badge>
                    <p className="text-sm text-slate-700">{obj}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-lg text-slate-900">Potential Challenges</h3>
              </div>
              <div className="space-y-3">
                {brief.challenges.map((ch, i) => (
                  <div key={i} className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="font-medium text-amber-900 mb-2">⚠️ {ch.challenge}</p>
                    <p className="text-sm text-amber-800">💡 Mitigation: {ch.mitigation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategies */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-violet-600" />
                <h3 className="font-bold text-lg text-slate-900">Recommended Strategies</h3>
              </div>
              <div className="space-y-2">
                {brief.strategies.map((strategy, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-violet-50">
                    <span className="text-violet-600 font-bold shrink-0">✓</span>
                    <p className="text-sm text-slate-700">{strategy}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-900">Success Metrics</h3>
              </div>
              <div className="grid gap-2">
                {brief.success_metrics.map((metric, i) => (
                  <div key={i} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-900">📊 {metric}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-lg text-slate-900">Timeline Breakdown</h3>
              </div>
              <div className="space-y-3">
                {brief.timeline_phases.map((phase, i) => (
                  <div key={i} className="relative pl-6 pb-3 border-l-2 border-rose-200 last:border-0">
                    <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-rose-600 -translate-x-[7px]" />
                    <div className="p-4 rounded-lg bg-rose-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-rose-900">{phase.phase}</h4>
                        <Badge variant="outline" className="text-rose-700 border-rose-300">
                          {phase.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-rose-800">{phase.key_activities}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Communication Tips */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💬</span>
                <h3 className="font-bold text-lg text-slate-900">Communication Guidelines</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{brief.communication_tips}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => setBrief(null)}
          >
            Regenerate Brief
          </Button>
        </div>
      )}
    </div>
  );
}