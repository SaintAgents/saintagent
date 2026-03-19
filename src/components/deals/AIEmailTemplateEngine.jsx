import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail, Send, Sparkles, Loader2, CheckCircle, AlertCircle,
  FileText, Clock, Brain, Target, Lightbulb, Zap,
  ChevronRight, Eye, Copy, RefreshCw, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SMART_TEMPLATES = [
  { id: 'pain_point', name: 'Address Pain Point', icon: Target, color: 'text-red-500',
    description: 'Directly addresses the contact\'s identified pain points' },
  { id: 'value_prop', name: 'Value Proposition', icon: Lightbulb, color: 'text-amber-500',
    description: 'Leads with your specific value proposition for this contact' },
  { id: 'warm_followup', name: 'Warm Follow-Up', icon: RefreshCw, color: 'text-blue-500',
    description: 'Personalized follow-up referencing past interactions' },
  { id: 'meeting_request', name: 'Meeting Pitch', icon: Zap, color: 'text-violet-500',
    description: 'Compelling meeting request with talking points' },
];

function InsightCard({ label, value, icon: Icon, color }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-400 uppercase">{label}</p>
        <p className="text-xs text-slate-700 line-clamp-2">{value}</p>
      </div>
    </div>
  );
}

export default function AIEmailTemplateEngine({ open, onClose, contact, deal, currentUser }) {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [tab, setTab] = useState('compose');
  const queryClient = useQueryClient();

  const recipientEmail = contact?.email;
  const dossier = contact?.ai_dossier || {};

  // Build AI context from contact data
  const aiContext = useMemo(() => {
    if (!contact) return {};
    return {
      name: contact.name,
      firstName: contact.name?.split(' ')[0] || 'there',
      company: contact.company || '',
      role: contact.role || '',
      domain: contact.domain || '',
      painPoint: dossier.pain_point || '',
      recentWin: dossier.recent_win || '',
      valueProp: dossier.value_prop || '',
      talkingPoints: dossier.talking_points || [],
      companyIntel: dossier.company_intel || '',
      recommendedApproach: dossier.recommended_approach || '',
      sentimentLabel: contact.sentiment_label || 'neutral',
      intentSignals: contact.intent_signals || [],
      leadStatus: contact.lead_status || '',
      lastContact: contact.last_contact_date || '',
      notes: contact.notes || '',
      tags: contact.tags || [],
    };
  }, [contact, dossier]);

  const generateAIEmail = async (templateType) => {
    setIsGenerating(true);
    setActiveTemplate(templateType);

    const templateInstructions = {
      pain_point: `Focus the email on directly addressing the contact's pain point: "${aiContext.painPoint}". Show empathy, then present how you can solve this specific problem. Use the value proposition: "${aiContext.valueProp}".`,
      value_prop: `Lead with the specific value proposition for this contact: "${aiContext.valueProp}". Reference their company intel: "${aiContext.companyIntel}". Make it clear why this matters to their role as ${aiContext.role}.`,
      warm_followup: `Write a warm follow-up that references the recommended approach: "${aiContext.recommendedApproach}". Mention their recent win if available: "${aiContext.recentWin}". Tone should match their sentiment: ${aiContext.sentimentLabel}.`,
      meeting_request: `Craft a compelling meeting request. Use these talking points: ${aiContext.talkingPoints?.join(', ') || 'general discussion'}. Reference their pain point "${aiContext.painPoint}" as the reason to meet. Make it time-bound and specific.`,
    };

    const dealContext = deal ? `\nDeal Context: "${deal.title}" worth ${deal.amount ? '$' + deal.amount.toLocaleString() : 'TBD'}, currently in ${deal.stage} stage.` : '';

    const prompt = `Generate a highly personalized sales email for the following contact.

CONTACT PROFILE:
- Name: ${aiContext.name}
- Role: ${aiContext.role} at ${aiContext.company}
- Industry/Domain: ${aiContext.domain}
- Sentiment: ${aiContext.sentimentLabel}
- Lead Status: ${aiContext.leadStatus}
- Intent Signals: ${aiContext.intentSignals.join(', ') || 'none detected'}
- Last Contact: ${aiContext.lastContact || 'never'}
- Notes: ${aiContext.notes || 'none'}

AI INSIGHTS (from CRM dossier):
- Pain Point: ${aiContext.painPoint || 'unknown'}
- Value Proposition: ${aiContext.valueProp || 'general partnership'}
- Recent Win: ${aiContext.recentWin || 'unknown'}
- Company Intel: ${aiContext.companyIntel || 'none'}
- Recommended Approach: ${aiContext.recommendedApproach || 'standard outreach'}
- Talking Points: ${aiContext.talkingPoints?.join('; ') || 'none'}
${dealContext}

TEMPLATE INSTRUCTIONS:
${templateInstructions[templateType] || 'Write a professional personalized outreach email.'}

SENDER: ${currentUser?.full_name || 'A professional'}

RULES:
1. Must be highly personalized - reference specific details from the AI insights
2. Subject line should be compelling and reference something specific to this contact
3. Keep body under 150 words
4. Include a clear, specific call to action
5. Tone should be professional but warm
6. Do NOT use generic phrases like "I hope this finds you well"

Return as JSON.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      if (result.subject && result.body) {
        setSubject(result.subject);
        setBody(result.body);
      }
    } catch (err) {
      console.error('AI email generation failed:', err);
    }
    setIsGenerating(false);
  };

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject,
        body
      });
      
      await base44.entities.Contact.update(contact.id, {
        email_outreach_count: (contact.email_outreach_count || 0) + 1,
        last_email_date: new Date().toISOString(),
        last_contact_date: format(new Date(), 'yyyy-MM-dd')
      });

      await base44.entities.EmailCampaign.create({
        owner_id: currentUser?.email,
        contact_id: contact.id,
        contact_name: contact.name,
        contact_email: recipientEmail,
        subject,
        body,
        template_used: activeTemplate || 'ai_personalized',
        status: 'sent',
        sent_at: new Date().toISOString(),
        lead_source: contact.lead_source,
        lead_status: contact.lead_status,
        domain: contact.domain,
        deal_value: deal?.amount || 0
      });

      // If deal linked, create a deal activity
      if (deal?.id) {
        await base44.entities.DealActivity.create({
          deal_id: deal.id,
          activity_type: 'note_added',
          description: `Email sent to ${contact.name}: "${subject}"`,
          actor_id: currentUser?.email,
          actor_name: currentUser?.full_name
        });
      }
    },
    onSuccess: () => {
      setSendStatus('success');
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setTimeout(() => {
        handleClose();
      }, 2000);
    },
    onError: () => setSendStatus('error')
  });

  const handleClose = () => {
    onClose();
    setSendStatus(null);
    setSubject('');
    setBody('');
    setActiveTemplate(null);
    setPreviewMode(false);
    setTab('compose');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
  };

  if (!contact) return null;

  const hasInsights = dossier.pain_point || dossier.value_prop || dossier.company_intel || dossier.recommended_approach;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-600" />
            AI Email Engine
            {deal && <Badge variant="outline" className="text-xs ml-2">{deal.title}</Badge>}
          </DialogTitle>
        </DialogHeader>

        {sendStatus === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Sent!</h3>
            <p className="text-slate-500">Personalized email sent to {recipientEmail}</p>
          </div>
        ) : sendStatus === 'error' ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Send Failed</h3>
            <Button onClick={() => setSendStatus(null)} className="mt-2">Try Again</Button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs value={tab} onValueChange={setTab} className="h-full flex flex-col">
              <TabsList className="mb-3">
                <TabsTrigger value="compose" className="gap-1"><FileText className="w-3 h-3" /> Compose</TabsTrigger>
                <TabsTrigger value="insights" className="gap-1"><Brain className="w-3 h-3" /> Contact Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="flex-1 overflow-auto">
                <div className="space-y-3">
                  {/* Contact Header */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar_url} />
                      <AvatarFallback className="bg-violet-100 text-violet-600">{contact.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{contact.name}</p>
                      <p className="text-xs text-slate-500">{contact.role} at {contact.company}</p>
                    </div>
                    {contact.sentiment_label && (
                      <Badge variant="outline" className="ml-auto text-xs capitalize">{contact.sentiment_label}</Badge>
                    )}
                  </div>

                  {hasInsights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <InsightCard label="Pain Point" value={dossier.pain_point} icon={Target} color="text-red-500" />
                      <InsightCard label="Value Proposition" value={dossier.value_prop} icon={Lightbulb} color="text-amber-500" />
                      <InsightCard label="Company Intel" value={dossier.company_intel} icon={Brain} color="text-blue-500" />
                      <InsightCard label="Recommended Approach" value={dossier.recommended_approach} icon={ChevronRight} color="text-emerald-500" />
                      <InsightCard label="Recent Win" value={dossier.recent_win} icon={CheckCircle} color="text-green-500" />
                      {dossier.talking_points?.length > 0 && (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 col-span-full">
                          <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">Talking Points</p>
                          <ul className="space-y-1">
                            {dossier.talking_points.map((tp, i) => (
                              <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                                <span className="text-violet-400 mt-0.5">•</span> {tp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No AI insights available yet for this contact.</p>
                        <p className="text-xs text-slate-400 mt-1">Run the Contact Enrichment tool to generate insights.</p>
                      </CardContent>
                    </Card>
                  )}

                  {contact.intent_signals?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {contact.intent_signals.map((sig, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{sig}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="compose" className="flex-1 overflow-auto">
                <div className="space-y-4">
                  {/* Recipient */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{contact.name}</span>
                    {recipientEmail ? (
                      <span className="text-xs text-slate-400">&lt;{recipientEmail}&gt;</span>
                    ) : (
                      <span className="text-xs text-rose-500">No email address</span>
                    )}
                  </div>

                  {/* Smart AI Templates */}
                  <div>
                    <Label className="mb-2 block text-xs font-medium">AI-Powered Templates (uses CRM insights)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SMART_TEMPLATES.map(tmpl => {
                        const Icon = tmpl.icon;
                        return (
                          <button
                            key={tmpl.id}
                            onClick={() => generateAIEmail(tmpl.id)}
                            disabled={isGenerating || !recipientEmail}
                            className={cn(
                              "flex items-start gap-2 p-3 rounded-lg border text-left transition-all hover:border-violet-300 hover:bg-violet-50",
                              activeTemplate === tmpl.id && "border-violet-400 bg-violet-50",
                              isGenerating && "opacity-50 cursor-wait"
                            )}
                          >
                            {isGenerating && activeTemplate === tmpl.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-violet-500 shrink-0 mt-0.5" />
                            ) : (
                              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${tmpl.color}`} />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-800">{tmpl.name}</p>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{tmpl.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="ai-subject" className="text-xs">Subject</Label>
                    <Input
                      id="ai-subject"
                      placeholder="Email subject..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="ai-body" className="text-xs">Message</Label>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={copyToClipboard} disabled={!body}>
                          <Copy className="w-3 h-3" /> Copy
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setPreviewMode(!previewMode)}>
                          <Eye className="w-3 h-3" /> {previewMode ? 'Edit' : 'Preview'}
                        </Button>
                      </div>
                    </div>
                    {previewMode ? (
                      <div className="mt-1 p-4 rounded-lg border bg-white min-h-[200px] text-sm text-slate-800 whitespace-pre-wrap">
                        {body || <span className="text-slate-400 italic">No content yet. Select a template above.</span>}
                      </div>
                    ) : (
                      <Textarea
                        id="ai-body"
                        placeholder="Select an AI template or write your message..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="mt-1 min-h-[200px]"
                      />
                    )}
                  </div>

                  {/* Insight chips used */}
                  {body && hasInsights && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Personalized with AI insights from CRM dossier</span>
                    </div>
                  )}

                  {contact.last_email_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      Last emailed: {format(new Date(contact.last_email_date), 'MMM d, yyyy')}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                      onClick={() => sendEmailMutation.mutate()}
                      disabled={!subject.trim() || !body.trim() || !recipientEmail || sendEmailMutation.isPending}
                      className="bg-violet-600 hover:bg-violet-700 gap-2"
                    >
                      {sendEmailMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                      <span className="text-white">Send Email</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}