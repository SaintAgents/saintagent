import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, MessageSquare, CheckSquare, AlertCircle, Users, Calendar } from "lucide-react";

export default function AIDiscussionAssistant({ missionId, discussionThread = [] }) {
  const [customInput, setCustomInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDiscussionMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);

      // Prepare discussion content
      const discussionText = customInput || discussionThread.map(msg => 
        `${msg.author_name}: ${msg.content}`
      ).join('\n\n');

      const prompt = `You are an AI collaboration assistant analyzing team discussions to extract insights and action items.

DISCUSSION CONTENT:
${discussionText}

TASK: Analyze this discussion and provide:

1. **Summary** (2-3 sentences):
   - Main topics covered
   - Overall sentiment and energy

2. **Key Decisions Made** (list):
   - Clear decisions that were agreed upon
   - Who committed to what

3. **Action Items** (structured list):
   - Task description
   - Suggested assignee (if mentioned)
   - Estimated urgency (high/medium/low)
   - Deadline or timeframe (if mentioned)

4. **Open Questions** (list):
   - Unresolved questions that need answers
   - Blockers or concerns raised

5. **Follow-up Suggestions** (3-5 suggestions):
   - What should happen next
   - Recommended next meeting topics
   - Who should connect with whom

6. **Sentiment Analysis**:
   - Overall team morale (positive/neutral/concerned)
   - Energy level (high/medium/low)
   - Any tensions or conflicts detected

Extract concrete, actionable insights that help the team move forward.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_decisions: {
              type: "array",
              items: { type: "string" }
            },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  assignee: { type: "string" },
                  urgency: { 
                    type: "string",
                    enum: ["high", "medium", "low"]
                  },
                  deadline: { type: "string" }
                }
              }
            },
            open_questions: {
              type: "array",
              items: { type: "string" }
            },
            follow_up_suggestions: {
              type: "array",
              items: { type: "string" }
            },
            sentiment: {
              type: "object",
              properties: {
                morale: { type: "string" },
                energy: { type: "string" },
                concerns: { type: "string" }
              }
            }
          }
        }
      });

      setAnalysis(response);
      setIsAnalyzing(false);
    }
  });

  const urgencyColors = {
    high: "bg-rose-100 text-rose-700 border-rose-300",
    medium: "bg-amber-100 text-amber-700 border-amber-300",
    low: "bg-blue-100 text-blue-700 border-blue-300"
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900">AI Discussion Assistant</h3>
          </div>

          <Textarea
            placeholder="Paste team discussion, meeting notes, or chat transcript here for AI analysis..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="min-h-32 mb-4"
          />

          <Button
            onClick={() => analyzeDiscussionMutation.mutate()}
            disabled={isAnalyzing || (!customInput && discussionThread.length === 0)}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Discussion...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze & Extract Action Items
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Discussion Summary
              </h4>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Sentiment */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-slate-900 mb-3">Team Pulse</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50">
                  <p className="text-xs text-slate-500 mb-1">Morale</p>
                  <p className="font-semibold text-emerald-700 capitalize">{analysis.sentiment.morale}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-xs text-slate-500 mb-1">Energy</p>
                  <p className="font-semibold text-blue-700 capitalize">{analysis.sentiment.energy}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-xs text-slate-500 mb-1">Concerns</p>
                  <p className="font-semibold text-amber-700 text-xs">{analysis.sentiment.concerns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Decisions */}
          {analysis.key_decisions?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Decisions Made
                </h4>
                <div className="space-y-2">
                  {analysis.key_decisions.map((decision, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <p className="text-sm text-slate-700">{decision}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {analysis.action_items?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-violet-600" />
                  Action Items
                </h4>
                <div className="space-y-3">
                  {analysis.action_items.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg border border-slate-200 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-slate-900">{item.task}</p>
                        <Badge className={urgencyColors[item.urgency]}>
                          {item.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {item.assignee && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.assignee}
                          </span>
                        )}
                        {item.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Open Questions */}
          {analysis.open_questions?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Open Questions
                </h4>
                <div className="space-y-2">
                  {analysis.open_questions.map((question, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50">
                      <span className="text-amber-600 font-bold shrink-0">?</span>
                      <p className="text-sm text-slate-700">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Suggestions */}
          {analysis.follow_up_suggestions?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  Next Steps
                </h4>
                <div className="space-y-2">
                  {analysis.follow_up_suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-violet-50">
                      <span className="text-violet-600 font-bold shrink-0">→</span>
                      <p className="text-sm text-slate-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => setAnalysis(null)}
          >
            Analyze New Discussion
          </Button>
        </div>
      )}
    </div>
  );
}