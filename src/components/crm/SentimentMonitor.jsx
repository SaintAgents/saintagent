import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ThermometerSun, Loader2, Sparkles, Flame, Snowflake,
  Sun, CloudSun, AlertTriangle, ArrowRight
} from 'lucide-react';

const SENTIMENT_CONFIG = {
  hot: { icon: Flame, label: 'Hot', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', desc: 'High intent - ready to close' },
  warm: { icon: Sun, label: 'Warm', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Engaged and interested' },
  neutral: { icon: CloudSun, label: 'Neutral', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'No strong signals either way' },
  cold: { icon: Snowflake, label: 'Cold', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', desc: 'Low engagement' },
  frustrated: { icon: AlertTriangle, label: 'Frustrated', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', desc: 'Needs immediate human attention' }
};

export default function SentimentMonitor({ contacts = [], currentUserId }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [interactionText, setInteractionText] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const queryClient = useQueryClient();

  const analyzeBulkMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      const withNotes = contacts.filter(c => c.notes && c.lead_status !== 'won' && c.lead_status !== 'lost').slice(0, 15);

      for (const contact of withNotes) {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze the sentiment and engagement level of this business contact based on their interaction history:

Name: ${contact.name}
Company: ${contact.company || 'Unknown'}
Lead Status: ${contact.lead_status || 'new'}
Last Contact: ${contact.last_contact_date || 'Never'}
Notes/Interactions: ${contact.notes || 'None'}
Email Count: ${contact.email_outreach_count || 0}
Relationship Strength: ${contact.relationship_strength}/5

Rate their sentiment and suggest next action.`,
          response_json_schema: {
            type: 'object',
            properties: {
              sentiment_score: { type: 'number', description: '-1 to 1' },
              sentiment_label: { type: 'string', enum: ['frustrated', 'cold', 'neutral', 'warm', 'hot'] },
              reasoning: { type: 'string' },
              recommended_action: { type: 'string' },
              escalate_to_human: { type: 'boolean' }
            }
          }
        });

        await base44.entities.Contact.update(contact.id, {
          sentiment_score: result.sentiment_score,
          sentiment_label: result.sentiment_label
        });

        if (result.escalate_to_human) {
          await base44.entities.Notification.create({
            user_id: currentUserId,
            type: 'system',
            title: `⚠️ ${result.sentiment_label === 'frustrated' ? 'Frustrated' : 'High-Intent'} Contact: ${contact.name}`,
            message: result.recommended_action || 'This contact needs personal attention.',
            priority: result.sentiment_label === 'frustrated' ? 'urgent' : 'high',
            action_url: '/CRM'
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
    },
    onSettled: () => setAnalyzing(false)
  });

  const analyzeSingleMutation = useMutation({
    mutationFn: async () => {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (!contact) return;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the sentiment from this interaction with a business contact:

Contact: ${contact.name} (${contact.role || 'Unknown'} at ${contact.company || 'Unknown'})
Current Status: ${contact.lead_status || 'new'}

Recent Interaction/Message:
${interactionText}

Analyze the tone, intent, urgency, and recommend next steps.`,
        response_json_schema: {
          type: 'object',
          properties: {
            sentiment_score: { type: 'number' },
            sentiment_label: { type: 'string', enum: ['frustrated', 'cold', 'neutral', 'warm', 'hot'] },
            reasoning: { type: 'string' },
            recommended_action: { type: 'string' },
            escalate_to_human: { type: 'boolean' },
            key_phrases: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      await base44.entities.Contact.update(contact.id, {
        sentiment_score: result.sentiment_score,
        sentiment_label: result.sentiment_label
      });

      setSingleResult(result);
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
    }
  });

  // Group contacts by sentiment
  const sentimentGroups = {};
  contacts.forEach(c => {
    if (c.sentiment_label) {
      if (!sentimentGroups[c.sentiment_label]) sentimentGroups[c.sentiment_label] = [];
      sentimentGroups[c.sentiment_label].push(c);
    }
  });

  const orderedLabels = ['frustrated', 'hot', 'warm', 'neutral', 'cold'];

  return (
    <div className="space-y-4">
      {/* Analyze Interaction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 text-amber-500" />
            Analyze Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="w-full h-9 px-3 rounded-md border text-sm bg-white text-slate-900"
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
          >
            <option value="">Select a contact...</option>
            {contacts.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>
            ))}
          </select>
          <Textarea
            placeholder="Paste an email, message, or interaction notes to analyze sentiment..."
            value={interactionText}
            onChange={(e) => setInteractionText(e.target.value)}
            rows={4}
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => analyzeSingleMutation.mutate()}
              disabled={!selectedContactId || !interactionText.trim() || analyzeSingleMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {analyzeSingleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Analyze Sentiment
            </Button>
            <Button
              variant="outline"
              onClick={() => analyzeBulkMutation.mutate()}
              disabled={analyzing}
              className="gap-2"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThermometerSun className="w-4 h-4" />}
              Bulk Scan All
            </Button>
          </div>

          {singleResult && (
            <div className={`p-4 rounded-lg border ${SENTIMENT_CONFIG[singleResult.sentiment_label]?.bg} ${SENTIMENT_CONFIG[singleResult.sentiment_label]?.border}`}>
              <div className="flex items-center gap-2 mb-2">
                {React.createElement(SENTIMENT_CONFIG[singleResult.sentiment_label]?.icon || CloudSun, {
                  className: `w-5 h-5 ${SENTIMENT_CONFIG[singleResult.sentiment_label]?.color}`
                })}
                <Badge className={`${SENTIMENT_CONFIG[singleResult.sentiment_label]?.bg} ${SENTIMENT_CONFIG[singleResult.sentiment_label]?.color}`}>
                  {singleResult.sentiment_label?.toUpperCase()}
                </Badge>
                {singleResult.escalate_to_human && (
                  <Badge className="bg-red-600 text-white">ESCALATE TO HUMAN</Badge>
                )}
              </div>
              <p className="text-sm text-slate-700 mb-2">{singleResult.reasoning}</p>
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-violet-500" />
                <span className="font-medium text-violet-700">{singleResult.recommended_action}</span>
              </div>
              {singleResult.key_phrases?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {singleResult.key_phrases.map((phrase, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{phrase}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sentiment Overview */}
      {Object.keys(sentimentGroups).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sentiment Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderedLabels.map(label => {
              const group = sentimentGroups[label];
              if (!group?.length) return null;
              const cfg = SENTIMENT_CONFIG[label];
              const Icon = cfg.icon;

              return (
                <div key={label} className={`p-3 rounded-lg border ${cfg.border} ${cfg.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                    <span className={`font-medium text-sm ${cfg.color}`}>{cfg.label}</span>
                    <Badge variant="outline" className="text-xs">{group.length}</Badge>
                    <span className="text-xs text-slate-500 ml-1">{cfg.desc}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.map(c => (
                      <Badge key={c.id} variant="outline" className="text-xs">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}