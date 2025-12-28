import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Wand2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function MissionDesignAssistant({ onApplySuggestions }) {
  const [keywords, setKeywords] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const generateMutation = useMutation({
    mutationFn: async (keywords) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a mission design expert for a spiritual leadership platform. Based on these keywords/theme: "${keywords}", design a high-impact leader mission.

Provide your response in valid JSON format with this structure:
{
  "titles": ["title option 1", "title option 2", "title option 3"],
  "objective": "detailed mission objective (2-3 sentences)",
  "complexity": "low" | "medium" | "high",
  "impact": "local" | "regional" | "global",
  "suggested_ggg_reward": number (0.5-5.0),
  "suggested_rank_points": number (10-100),
  "ideal_participant_count": number (3-50),
  "required_skills": ["skill1", "skill2", "skill3"],
  "structure_guidance": "detailed guidance on how to structure this mission (3-4 sentences)",
  "potential_challenges": ["challenge 1", "challenge 2", "challenge 3"],
  "success_metrics": ["metric 1", "metric 2"]
}

Consider:
- Mission complexity (simple tasks vs complex coordination)
- Community impact (local gathering vs global movement)
- Leadership requirements (facilitator vs visionary)
- Time commitment (days vs months)

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            titles: { type: "array", items: { type: "string" } },
            objective: { type: "string" },
            complexity: { type: "string", enum: ["low", "medium", "high"] },
            impact: { type: "string", enum: ["local", "regional", "global"] },
            suggested_ggg_reward: { type: "number" },
            suggested_rank_points: { type: "number" },
            ideal_participant_count: { type: "number" },
            required_skills: { type: "array", items: { type: "string" } },
            structure_guidance: { type: "string" },
            potential_challenges: { type: "array", items: { type: "string" } },
            success_metrics: { type: "array", items: { type: "string" } }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      toast.success('Mission design generated!');
    },
    onError: () => {
      toast.error('Failed to generate suggestions');
    }
  });

  const handleGenerate = () => {
    if (!keywords.trim()) {
      toast.error('Please enter keywords or theme');
      return;
    }
    generateMutation.mutate(keywords);
  };

  const handleApply = (titleIndex = 0) => {
    if (!suggestions) return;
    
    onApplySuggestions({
      title: suggestions.titles[titleIndex],
      objective: suggestions.objective,
      reward_ggg: suggestions.suggested_ggg_reward,
      reward_rank_points: suggestions.suggested_rank_points,
      max_participants: suggestions.ideal_participant_count,
      ai_suggestions: suggestions
    });
    
    toast.success('AI suggestions applied!');
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-5 h-5 text-violet-600" />
          <h4 className="font-semibold text-slate-900">AI Mission Designer</h4>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Describe your mission theme or enter keywords, and I'll help you design it
        </p>
        <div className="flex gap-2">
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., global meditation network, climate action, conscious community..."
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 shrink-0"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Designing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Design Mission
              </>
            )}
          </Button>
        </div>
      </div>

      {suggestions && (
        <Card className="border-violet-200">
          <CardContent className="p-4 space-y-4">
            {/* Title Options */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Suggested Titles</p>
              <div className="space-y-2">
                {suggestions.titles.map((title, i) => (
                  <button
                    key={i}
                    onClick={() => handleApply(i)}
                    className="w-full text-left p-3 rounded-lg border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{title}</span>
                      <CheckCircle className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Objective */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1">Objective</p>
              <p className="text-sm text-slate-600 p-3 rounded-lg bg-slate-50">{suggestions.objective}</p>
            </div>

            {/* Complexity & Impact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">Complexity</p>
                <Badge className="capitalize">{suggestions.complexity}</Badge>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">Impact</p>
                <Badge className="capitalize">{suggestions.impact}</Badge>
              </div>
            </div>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 mb-1">Suggested GGG</p>
                <p className="text-lg font-bold text-amber-900">{suggestions.suggested_ggg_reward}</p>
              </div>
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                <p className="text-xs text-violet-700 mb-1">Rank Points</p>
                <p className="text-lg font-bold text-violet-900">{suggestions.suggested_rank_points}</p>
              </div>
            </div>

            {/* Participants & Skills */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Ideal Setup</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500 mb-1">Participants</p>
                  <p className="text-sm font-semibold text-slate-900">{suggestions.ideal_participant_count} people</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500 mb-1">Required Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestions.required_skills.slice(0, 2).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Structure Guidance */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-1">Structure Guidance</p>
              <p className="text-sm text-slate-600 p-3 rounded-lg bg-blue-50 border border-blue-200">
                {suggestions.structure_guidance}
              </p>
            </div>

            {/* Challenges */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Potential Challenges</p>
              <ul className="space-y-1">
                {suggestions.potential_challenges.map((challenge, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">⚠</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            {/* Success Metrics */}
            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Success Metrics</p>
              <ul className="space-y-1">
                {suggestions.success_metrics.map((metric, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              onClick={() => handleApply(0)}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply These Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}