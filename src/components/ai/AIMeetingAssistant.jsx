import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  ListChecks, 
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Target,
  Users,
  Clock,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIMeetingAssistant({ 
  meetingTitle, 
  participants = [], 
  onSaveSummary,
  onSaveActionItems,
  className 
}) {
  const [discussionNotes, setDiscussionNotes] = useState('');
  const [summary, setSummary] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [insights, setInsights] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

  // Generate summary from notes
  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const prompt = `You are an AI meeting assistant for SaintAgent, a conscious spiritual community platform.

MEETING: ${meetingTitle || 'Team Discussion'}
PARTICIPANTS: ${participants.map(p => p.name || p.display_name || p).join(', ') || 'Team members'}

DISCUSSION NOTES:
${discussionNotes}

Analyze these meeting notes and provide:

1. **Summary**: A concise 2-3 paragraph summary of key discussion points
2. **Key Decisions**: List any decisions that were made
3. **Action Items**: Extract specific tasks with:
   - Task description
   - Suggested assignee (based on context)
   - Priority (high/medium/low)
   - Suggested deadline
4. **Insights**: 2-3 strategic insights or recommendations based on the discussion
5. **Follow-up Questions**: Questions that might need addressing in future meetings

Make the summary clear, actionable, and aligned with collaborative spiritual growth principles.`;

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
                  priority: { type: "string" },
                  deadline: { type: "string" }
                }
              }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            },
            follow_up_questions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setSummary(response);
      setActionItems(response.action_items || []);
      setInsights(response.insights || []);
      return response;
    }
  });

  // Quick summarize a short snippet
  const quickSummarizeMutation = useMutation({
    mutationFn: async (snippet) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this discussion point in one clear sentence: "${snippet}"`,
      });
      return response;
    }
  });

  const handleCopyAll = () => {
    if (!summary) return;
    const text = `
# Meeting Summary: ${meetingTitle || 'Team Discussion'}
Date: ${new Date().toLocaleDateString()}
Participants: ${participants.map(p => p.name || p.display_name || p).join(', ')}

## Summary
${summary.summary}

## Key Decisions
${summary.key_decisions?.map(d => `• ${d}`).join('\n') || 'None recorded'}

## Action Items
${actionItems.map((item, i) => `${i + 1}. ${item.task} - ${item.assignee} (${item.priority}) - Due: ${item.deadline}`).join('\n')}

## Insights
${insights.map(i => `• ${i}`).join('\n')}

## Follow-up Questions
${summary.follow_up_questions?.map(q => `• ${q}`).join('\n') || 'None'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleActionItem = (idx) => {
    setActionItems(prev => prev.map((item, i) => 
      i === idx ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <Card className={cn("border-blue-200 dark:border-blue-800", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI Meeting Assistant
          </span>
          {summary && (
            <Button size="sm" variant="outline" onClick={handleCopyAll}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'notes' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Notes
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'summary' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'actions' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <ListChecks className="w-4 h-4 inline mr-1" />
            Actions
            {actionItems.length > 0 && (
              <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">
                {actionItems.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'insights' 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Insights
          </button>
        </div>

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <Textarea
              value={discussionNotes}
              onChange={(e) => setDiscussionNotes(e.target.value)}
              placeholder="Type or paste discussion notes here...

Example:
- John suggested we focus on community engagement this month
- Sarah mentioned the meditation challenge had great participation
- Need to decide on next month's mission theme
- Action: Mike to create the event page by Friday"
              className="min-h-[200px] text-sm"
            />
            <Button
              onClick={() => summarizeMutation.mutate()}
              disabled={!discussionNotes.trim() || summarizeMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {summarizeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Discussion...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Summary & Action Items
                </>
              )}
            </Button>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <ScrollArea className="max-h-[300px]">
            {summary ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Summary
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {summary.summary}
                  </p>
                </div>

                {summary.key_decisions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Key Decisions
                    </h4>
                    <ul className="space-y-1">
                      {summary.key_decisions.map((decision, idx) => (
                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.follow_up_questions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Follow-up Questions
                    </h4>
                    <ul className="space-y-1">
                      {summary.follow_up_questions.map((q, idx) => (
                        <li key={idx} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                          <span>❓</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {onSaveSummary && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSaveSummary(summary)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Save Summary
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Add notes and click "Generate Summary" to get started</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <ScrollArea className="max-h-[300px]">
            {actionItems.length > 0 ? (
              <div className="space-y-2">
                {actionItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer",
                      item.completed 
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                    )}
                    onClick={() => toggleActionItem(idx)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                        item.completed 
                          ? "bg-emerald-500 border-emerald-500" 
                          : "border-slate-300"
                      )}>
                        {item.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          item.completed && "line-through text-slate-500"
                        )}>
                          {item.task}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.deadline}
                          </span>
                          <Badge 
                            className={cn(
                              "text-xs",
                              item.priority === 'high' && "bg-red-100 text-red-700",
                              item.priority === 'medium' && "bg-amber-100 text-amber-700",
                              item.priority === 'low' && "bg-green-100 text-green-700"
                            )}
                          >
                            {item.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {onSaveActionItems && (
                  <Button 
                    size="sm" 
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onSaveActionItems(actionItems)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Save Action Items
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No action items yet. Generate from your notes!</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <ScrollArea className="max-h-[300px]">
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-violet-800 dark:text-violet-200">
                        {insight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>AI insights will appear here after analysis</p>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}