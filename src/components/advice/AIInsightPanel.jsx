import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Brain, Heart, Compass, Target, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const INSIGHT_SECTIONS = [
  { key: 'core_issue', label: 'Core Issue Identified', icon: Brain, color: 'text-indigo-600' },
  { key: 'emotional_layer', label: 'Emotional Layer', icon: Heart, color: 'text-pink-600' },
  { key: 'practical_advice', label: 'Practical Advice', icon: Compass, color: 'text-emerald-600' },
  { key: 'strategic_view', label: 'Strategic View', icon: Target, color: 'text-blue-600' },
  { key: 'long_term_consideration', label: 'Long-Term Consideration', icon: Clock, color: 'text-purple-600' },
  { key: 'caution_factors', label: 'Caution & Risk Factors', icon: AlertTriangle, color: 'text-amber-600' }
];

export default function AIInsightPanel({ question, canRegenerate = false }) {
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();
  const aiResponse = question?.ai_response;

  const generateMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are SaintAgent AI, a wise and balanced advisor. Analyze this question and provide structured guidance.

Question Title: ${question.title}
Category: ${question.category}
Description: ${question.description}

Provide a response in the following JSON format with these exact keys:
{
  "core_issue": "Identify the fundamental issue or question being asked",
  "emotional_layer": "Address the emotional aspects and underlying feelings",
  "practical_advice": "Provide actionable, practical steps",
  "strategic_view": "Offer a broader strategic perspective",
  "long_term_consideration": "What should be considered for the long term",
  "caution_factors": "Any risks, warnings, or things to be careful about",
  "confidence_score": 0.85
}

Be wise, balanced, neutral, and non-preachy. Provide genuine insight.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            core_issue: { type: "string" },
            emotional_layer: { type: "string" },
            practical_advice: { type: "string" },
            strategic_view: { type: "string" },
            long_term_consideration: { type: "string" },
            caution_factors: { type: "string" },
            confidence_score: { type: "number" }
          }
        }
      });

      await base44.entities.AdviceQuestion.update(question.id, {
        ai_response: {
          ...response,
          generated_at: new Date().toISOString()
        }
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceQuestion', question.id] });
    }
  });

  if (!aiResponse && !question?.request_ai_insight) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-500" />
            SaintAgent AI Insight
          </CardTitle>
          <div className="flex items-center gap-2">
            {aiResponse?.confidence_score && (
              <Badge variant="outline" className="bg-white text-amber-700 border-amber-300">
                {Math.round(aiResponse.confidence_score * 100)}% confidence
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-4", !expanded && "hidden")}>
        {!aiResponse ? (
          <div className="text-center py-6">
            {generateMutation.isPending ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-amber-700">Generating AI insight...</p>
              </div>
            ) : (
              <>
                <p className="text-amber-700 mb-4">AI insight has been requested but not yet generated.</p>
                <Button
                  onClick={() => generateMutation.mutate()}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Insight
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {INSIGHT_SECTIONS.map(({ key, label, icon: Icon, color }) => (
              aiResponse[key] && (
                <div key={key} className="bg-white/70 rounded-lg p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-4 h-4", color)} />
                    <h4 className="font-semibold text-slate-900">{label}</h4>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{aiResponse[key]}</p>
                </div>
              )
            ))}

            {canRegenerate && (
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", generateMutation.isPending && "animate-spin")} />
                  Regenerate Insight
                </Button>
              </div>
            )}

            <p className="text-xs text-amber-600/80 italic pt-2">
              Disclaimer: Advice provided here does not constitute legal, medical, or financial professional counsel.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}