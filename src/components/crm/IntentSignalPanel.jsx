import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, Loader2, Sparkles, ArrowUpRight, Target, Send, TrendingUp
} from 'lucide-react';

export default function IntentSignalPanel({ contacts = [], currentUserId }) {
  const [scanning, setScanning] = useState(false);
  const [draftingFor, setDraftingFor] = useState(null);
  const [draftedEmail, setDraftedEmail] = useState(null);
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: async () => {
      setScanning(true);
      // Analyze top 15 contacts for intent signals
      const toAnalyze = contacts
        .filter(c => c.lead_status !== 'won' && c.lead_status !== 'lost')
        .slice(0, 15);

      for (const contact of toAnalyze) {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this business contact for intent signals that suggest they may be ready to buy, engage, or need attention:

Name: ${contact.name}
Company: ${contact.company || 'Unknown'}
Role: ${contact.role || 'Unknown'}
Industry: ${contact.domain || 'Unknown'}
Lead Status: ${contact.lead_status || 'new'}
Last Contact: ${contact.last_contact_date || 'Never'}
Notes: ${contact.notes || 'None'}
Tags: ${(contact.tags || []).join(', ') || 'None'}
Relationship Strength: ${contact.relationship_strength || 3}/5

Identify any signals and recommend priority.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              intent_signals: { type: 'array', items: { type: 'string' } },
              priority_tier: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              recommended_action: { type: 'string' },
              should_escalate: { type: 'boolean' }
            }
          }
        });

        const updates = {
          intent_signals: result.intent_signals || [],
          priority_tier: result.priority_tier || 'medium'
        };

        // Auto-escalate critical contacts
        if (result.should_escalate && result.priority_tier === 'critical') {
          await base44.entities.Notification.create({
            user_id: currentUserId,
            type: 'system',
            title: `🔥 High-Intent Signal: ${contact.name}`,
            message: result.recommended_action || 'This contact shows strong buying signals - act now.',
            priority: 'urgent',
            action_url: '/CRM'
          });
        }

        await base44.entities.Contact.update(contact.id, updates);
      }

      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
    },
    onSettled: () => setScanning(false)
  });

  const handleDraftEmail = async (contact) => {
    setDraftingFor(contact.id);
    setDraftedEmail(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Draft a short, contextual outreach email for this contact based on their intent signals:

Name: ${contact.name}
Company: ${contact.company || ''}
Role: ${contact.role || ''}
Intent Signals: ${(contact.intent_signals || []).join('; ')}
Priority: ${contact.priority_tier}
Notes: ${contact.notes || ''}

The email should acknowledge something specific about them or their company. Keep it under 120 words, warm but professional.`,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' }
        }
      }
    });
    setDraftedEmail({ contactId: contact.id, ...result });
    setDraftingFor(null);
  };

  const signalContacts = contacts
    .filter(c => c.intent_signals?.length > 0)
    .sort((a, b) => {
      const tierOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (tierOrder[a.priority_tier] || 3) - (tierOrder[b.priority_tier] || 3);
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-amber-500" />
            Intent Signal Monitor
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            AI scans contacts for buying signals, engagement patterns, and timing opportunities
          </p>
        </div>
        <Button
          onClick={() => scanMutation.mutate()}
          disabled={scanning}
          className="bg-amber-600 hover:bg-amber-700 gap-2"
        >
          {scanning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Scan Pipeline</>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {signalContacts.length === 0 ? (
          <div className="text-center py-10">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No intent signals detected yet. Run a scan to analyze your pipeline.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signalContacts.map(contact => (
              <div key={contact.id} className="p-4 border rounded-lg hover:border-amber-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{contact.name}</h4>
                      <PriorityBadge tier={contact.priority_tier} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {contact.role}{contact.company ? ` · ${contact.company}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDraftEmail(contact)}
                    disabled={draftingFor === contact.id}
                    className="gap-1 text-xs"
                  >
                    {draftingFor === contact.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    Draft Email
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {contact.intent_signals?.map((signal, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {signal}
                    </Badge>
                  ))}
                </div>

                {/* Show drafted email */}
                {draftedEmail?.contactId === contact.id && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border">
                    <p className="text-xs font-medium text-slate-500 mb-1">Subject: {draftedEmail.subject}</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{draftedEmail.body}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(`Subject: ${draftedEmail.subject}\n\n${draftedEmail.body}`);
                      }}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ tier }) {
  const config = {
    critical: { label: 'Critical', className: 'bg-red-100 text-red-700 animate-pulse' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
    medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
    low: { label: 'Low', className: 'bg-slate-100 text-slate-600' }
  };
  const c = config[tier] || config.medium;
  return <Badge className={`text-xs ${c.className}`}>{c.label}</Badge>;
}