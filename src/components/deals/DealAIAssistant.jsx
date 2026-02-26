import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Sparkles, Send, Loader2, FileText, Mail, Lightbulb, 
  TrendingUp, AlertTriangle, CheckCircle2, Copy, RefreshCw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const STAGE_LABELS = {
  prospecting: 'Due Diligence',
  qualification: 'Negotiation', 
  proposal: 'Agreement Drafting',
  negotiation: 'Awaiting Execution',
  closed_won: 'Complete',
  closed_lost: 'Lost'
};

export default function DealAIAssistant({ deal, notes = [], activities = [], onClose }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draftEmail, setDraftEmail] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const notesText = notes.map(n => `- ${n.author_name}: ${n.content}`).join('\n');
      const activitiesText = activities.slice(0, 10).map(a => `- ${a.description} by ${a.actor_name}`).join('\n');
      
      const prompt = `Summarize this deal for a SaintAgent deal manager:

Deal: ${deal.title}
Company: ${deal.company_name || 'Not specified'}
Value: $${deal.amount?.toLocaleString()}
Stage: ${STAGE_LABELS[deal.stage]}
Priority: ${deal.priority}
Expected Close: ${deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d, yyyy') : 'Not set'}
Probability: ${deal.probability || 0}%
Owner: ${deal.owner_name}
Description: ${deal.description || 'No description'}

Recent Notes:
${notesText || 'No notes'}

Recent Activity:
${activitiesText || 'No activity'}

Provide a concise executive summary (3-4 sentences) highlighting key status, risks, and opportunities.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            key_risks: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
            health_score: { type: 'number', description: 'Deal health 1-10' }
          }
        }
      });
      
      setAiResponse(response);
    } catch (error) {
      console.error('AI Summary failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextActions = async () => {
    setIsLoading(true);
    try {
      const daysToClose = deal.expected_close_date 
        ? differenceInDays(new Date(deal.expected_close_date), new Date())
        : null;

      const prompt = `As a deal management AI, suggest the next best actions for this deal:

Deal: ${deal.title}
Stage: ${STAGE_LABELS[deal.stage]}
Value: $${deal.amount?.toLocaleString()}
Priority: ${deal.priority}
Days to Expected Close: ${daysToClose !== null ? daysToClose : 'Not set'}
Company: ${deal.company_name}
Contact: ${deal.contact_name} (${deal.contact_email})
Notes Count: ${notes.length}
Last Activity: ${activities[0]?.description || 'None'}

Based on the current stage and deal context, provide 3-5 specific, actionable next steps the SaintAgent should take. Consider urgency, stage-appropriate activities, and best practices for deal progression.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  timeframe: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }
            },
            stage_recommendation: { type: 'string' },
            risk_alert: { type: 'string' }
          }
        }
      });
      
      setSuggestions(response);
    } catch (error) {
      console.error('AI Suggestions failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmail = async (emailType) => {
    setIsLoading(true);
    try {
      const typePrompts = {
        followup: 'a professional follow-up email to check on progress and next steps',
        proposal: 'an email presenting our proposal and value proposition',
        closing: 'an email to move the deal towards closing, addressing any final concerns',
        introduction: 'an introduction email to establish rapport and understand their needs'
      };

      const prompt = `Draft ${typePrompts[emailType]} for this deal:

Deal: ${deal.title}
Company: ${deal.company_name}
Contact Name: ${deal.contact_name}
Contact Email: ${deal.contact_email}
Value: $${deal.amount?.toLocaleString()}
Stage: ${STAGE_LABELS[deal.stage]}
Description: ${deal.description || 'No description provided'}

Recent context from notes: ${notes.slice(0, 3).map(n => n.content).join(' | ') || 'None'}

Create a professional, warm email that reflects the SaintAgent ethos of positive change and collaboration. Include a clear call to action.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            body: { type: 'string' },
            call_to_action: { type: 'string' }
          }
        }
      });
      
      setDraftEmail(response);
    } catch (error) {
      console.error('Email generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim()) return;
    setIsLoading(true);
    try {
      const prompt = `Context about this deal:
Deal: ${deal.title}
Company: ${deal.company_name}
Value: $${deal.amount?.toLocaleString()}
Stage: ${STAGE_LABELS[deal.stage]}
Contact: ${deal.contact_name}

User Question: ${customPrompt}

Provide a helpful, specific response.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setAiResponse({ custom_response: response });
    } catch (error) {
      console.error('Custom prompt failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-violet-500" />
          AI Deal Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
            <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
            <TabsTrigger value="ask" className="text-xs">Ask AI</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            {!aiResponse ? (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500 mb-4">Generate an AI-powered summary of this deal</p>
                <Button onClick={generateSummary} disabled={isLoading} className="gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Summary
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Health Score: {aiResponse.health_score}/10
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={generateSummary} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm">{aiResponse.summary}</p>
                </div>

                {aiResponse.key_risks?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Key Risks
                    </p>
                    <ul className="space-y-1">
                      {aiResponse.key_risks.map((risk, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-red-400">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResponse.opportunities?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Opportunities
                    </p>
                    <ul className="space-y-1">
                      {aiResponse.opportunities.map((opp, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <span className="text-emerald-400">•</span> {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            {!suggestions ? (
              <div className="text-center py-6">
                <Lightbulb className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500 mb-4">Get AI-powered suggestions for next best actions</p>
                <Button onClick={generateNextActions} disabled={isLoading} className="gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Suggestions
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {suggestions.risk_alert && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3 h-3" /> Risk Alert
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300">{suggestions.risk_alert}</p>
                    </div>
                  )}

                  {suggestions.stage_recommendation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300">{suggestions.stage_recommendation}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {suggestions.actions?.map((action, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium">{action.action}</p>
                          <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">⏱️ {action.timeframe}</p>
                        <p className="text-xs text-slate-600">{action.rationale}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="ghost" size="sm" onClick={generateNextActions} disabled={isLoading} className="w-full">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Suggestions
                  </Button>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            {!draftEmail ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 text-center mb-4">Generate a professional email for this deal</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => generateEmail('introduction')} disabled={isLoading} className="text-xs">
                    Introduction
                  </Button>
                  <Button variant="outline" onClick={() => generateEmail('followup')} disabled={isLoading} className="text-xs">
                    Follow-up
                  </Button>
                  <Button variant="outline" onClick={() => generateEmail('proposal')} disabled={isLoading} className="text-xs">
                    Proposal
                  </Button>
                  <Button variant="outline" onClick={() => generateEmail('closing')} disabled={isLoading} className="text-xs">
                    Closing
                  </Button>
                </div>
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Draft Email</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`Subject: ${draftEmail.subject}\n\n${draftEmail.body}`)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDraftEmail(null)}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">Subject:</p>
                  <p className="text-sm font-medium mb-3">{draftEmail.subject}</p>
                  <p className="text-xs font-medium text-slate-500 mb-1">Body:</p>
                  <p className="text-sm whitespace-pre-wrap">{draftEmail.body}</p>
                </div>

                {deal.contact_email && (
                  <Button 
                    className="w-full gap-2"
                    onClick={() => window.open(`mailto:${deal.contact_email}?subject=${encodeURIComponent(draftEmail.subject)}&body=${encodeURIComponent(draftEmail.body)}`)}
                  >
                    <Mail className="w-4 h-4" />
                    Open in Email Client
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Ask AI Tab */}
          <TabsContent value="ask">
            <div className="space-y-3">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask anything about this deal..."
                rows={3}
              />
              <Button onClick={handleCustomPrompt} disabled={isLoading || !customPrompt.trim()} className="w-full gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Ask AI
              </Button>

              {aiResponse?.custom_response && (
                <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{aiResponse.custom_response}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}