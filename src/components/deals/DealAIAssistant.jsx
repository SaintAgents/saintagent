import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Bot, Sparkles, Mail, ListChecks, FileText, 
  Loader2, Copy, Check, Send, RefreshCw,
  TrendingUp, AlertTriangle, Clock, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

const STAGE_LABELS = {
  prospecting: 'Due Diligence',
  qualification: 'Negotiation',
  proposal: 'Agreement Drafting',
  negotiation: 'Awaiting Execution',
  closed_won: 'Complete',
  closed_lost: 'Lost'
};

export default function DealAIAssistant({ deal, notes = [], activities = [], currentUser, profile, onClose }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [actions, setActions] = useState(null);
  const [emailDraft, setEmailDraft] = useState(null);
  const [emailContext, setEmailContext] = useState('');
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const notesText = notes.map(n => `- ${n.author_name}: ${n.content}`).join('\n');
      const activitiesText = activities.slice(0, 10).map(a => `- ${a.description} (${a.actor_name})`).join('\n');
      
      const prompt = `Analyze this deal and provide a comprehensive summary:

Deal: ${deal.title}
Company: ${deal.company_name || 'N/A'}
Amount: ${formatCurrency(deal.amount)}
Stage: ${STAGE_LABELS[deal.stage]}
Priority: ${deal.priority}
Expected Close: ${deal.expected_close_date || 'Not set'}
Probability: ${deal.probability || 0}%
Owner: ${deal.owner_name}
Contact: ${deal.contact_name || 'N/A'} (${deal.contact_email || 'No email'})
Description: ${deal.description || 'No description'}

Recent Notes:
${notesText || 'No notes'}

Recent Activity:
${activitiesText || 'No activity'}

Provide:
1. Executive Summary (2-3 sentences)
2. Key Highlights
3. Potential Risks or Concerns
4. Deal Health Score (1-10) with explanation`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            risks: { type: "array", items: { type: "string" } },
            health_score: { type: "number" },
            health_explanation: { type: "string" }
          }
        }
      });
      
      setSummary(result);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestActions = async () => {
    setIsLoading(true);
    try {
      const prompt = `Based on this deal's current state, suggest the next best actions:

Deal: ${deal.title}
Stage: ${STAGE_LABELS[deal.stage]}
Amount: ${formatCurrency(deal.amount)}
Expected Close: ${deal.expected_close_date || 'Not set'}
Days in current stage: ${deal.updated_date ? Math.floor((Date.now() - new Date(deal.updated_date).getTime()) / (1000 * 60 * 60 * 24)) : 'Unknown'}
Priority: ${deal.priority}
Last activity: ${activities[0]?.description || 'None'}

For stage "${STAGE_LABELS[deal.stage]}", suggest:
1. Immediate actions (next 24-48 hours)
2. Short-term actions (this week)
3. Preparation for next stage
4. Potential blockers to address`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            immediate_actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string" }, reason: { type: "string" } } } },
            short_term_actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, timeline: { type: "string" } } } },
            next_stage_prep: { type: "array", items: { type: "string" } },
            blockers: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setActions(result);
    } catch (error) {
      console.error('Failed to suggest actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const draftEmail = async () => {
    setIsLoading(true);
    try {
      const prompt = `Draft a professional follow-up email for this deal:

Deal: ${deal.title}
Company: ${deal.company_name || 'the client'}
Contact: ${deal.contact_name || 'the contact'}
Stage: ${STAGE_LABELS[deal.stage]}
Amount: ${formatCurrency(deal.amount)}
My Name: ${profile?.display_name || currentUser?.full_name}

Additional context from user: ${emailContext || 'Standard follow-up'}

Generate an appropriate email based on the deal stage:
- Prospecting: Interest and discovery
- Qualification: Value proposition
- Proposal: Proposal follow-up
- Negotiation: Address concerns
- Closed: Thank you and next steps`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
            tone: { type: "string" },
            key_points: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setEmailDraft(result);
    } catch (error) {
      console.error('Failed to draft email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!deal.contact_email || !emailDraft) return;
    
    try {
      await base44.integrations.Core.SendEmail({
        to: deal.contact_email,
        subject: emailDraft.subject,
        body: emailDraft.body
      });
      
      // Log activity
      await base44.entities.DealActivity.create({
        deal_id: deal.id,
        activity_type: 'email_sent',
        description: `Sent email: "${emailDraft.subject}"`,
        actor_id: currentUser.email,
        actor_name: profile?.display_name || currentUser.full_name
      });
      
      queryClient.invalidateQueries({ queryKey: ['dealActivities', deal.id] });
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
            <Bot className="w-5 h-5" />
            AI Deal Assistant
          </CardTitle>
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 bg-violet-100/50 dark:bg-violet-900/30">
            <TabsTrigger value="summary" className="gap-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <FileText className="w-3 h-3" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <ListChecks className="w-3 h-3" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Mail className="w-3 h-3" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            {!summary ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-violet-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Get an AI-powered analysis of this deal
                </p>
                <Button 
                  onClick={generateSummary} 
                  disabled={isLoading}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Summary
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {/* Health Score */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-800 border">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      summary.health_score >= 7 ? 'bg-emerald-500' : 
                      summary.health_score >= 5 ? 'bg-amber-500' : 'bg-red-500'
                    }`}>
                      {summary.health_score}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Deal Health Score</p>
                      <p className="text-sm text-slate-500">{summary.health_explanation}</p>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Executive Summary</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{summary.executive_summary}</p>
                  </div>

                  {/* Highlights */}
                  {summary.highlights?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Key Highlights
                      </h4>
                      <ul className="space-y-1">
                        {summary.highlights.map((h, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-500">✓</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risks */}
                  {summary.risks?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Potential Risks
                      </h4>
                      <ul className="space-y-1">
                        {summary.risks.map((r, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-amber-500">⚠</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={generateSummary} className="mt-2">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            {!actions ? (
              <div className="text-center py-8">
                <ListChecks className="w-12 h-12 mx-auto mb-4 text-violet-400" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Get AI-suggested next steps for this deal
                </p>
                <Button 
                  onClick={suggestActions} 
                  disabled={isLoading}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Suggest Actions
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {/* Immediate Actions */}
                  {actions.immediate_actions?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        Immediate Actions (24-48h)
                      </h4>
                      <div className="space-y-2">
                        {actions.immediate_actions.map((a, i) => (
                          <div key={i} className="p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{a.action}</p>
                            <p className="text-xs text-slate-500">{a.reason}</p>
                            <Badge className="mt-1 text-xs" variant="outline">{a.priority}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Short-term Actions */}
                  {actions.short_term_actions?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">This Week</h4>
                      <ul className="space-y-1">
                        {actions.short_term_actions.map((a, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-violet-500">→</span>
                            {a.action}
                            <Badge variant="outline" className="text-xs ml-auto">{a.timeline}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Stage Prep */}
                  {actions.next_stage_prep?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">Prepare for Next Stage</h4>
                      <ul className="space-y-1">
                        {actions.next_stage_prep.map((p, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Blockers */}
                  {actions.blockers?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Blockers to Address
                      </h4>
                      <ul className="space-y-1">
                        {actions.blockers.map((b, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400">⚠ {b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={suggestActions} className="mt-2">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            {!emailDraft ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Additional Context (optional)
                  </label>
                  <Textarea
                    value={emailContext}
                    onChange={(e) => setEmailContext(e.target.value)}
                    placeholder="E.g., Follow up on pricing discussion, Schedule next meeting..."
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={draftEmail} 
                  disabled={isLoading}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                  Draft Follow-up Email
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500">Subject</p>
                    <Badge variant="outline" className="text-xs">{emailDraft.tone}</Badge>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{emailDraft.subject}</p>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border">
                  <p className="text-xs text-slate-500 mb-2">Body</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{emailDraft.body}</p>
                </div>

                {emailDraft.key_points?.length > 0 && (
                  <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                    <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-1">Key Points Covered</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-400">
                      {emailDraft.key_points.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`)}
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  {deal.contact_email && (
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={sendEmail}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Send to {deal.contact_name || 'Contact'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setEmailDraft(null)}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    New Draft
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}