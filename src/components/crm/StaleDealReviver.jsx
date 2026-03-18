import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, Loader2, Sparkles, Send, Clock, Copy, Check, Ghost
} from 'lucide-react';

export default function StaleDealReviver({ contacts = [], currentUserId }) {
  const [generating, setGenerating] = useState(null);
  const [generatedEmails, setGeneratedEmails] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  // Find stale contacts (30+ days no contact)
  const staleContacts = contacts
    .filter(c => {
      if (c.lead_status === 'won' || c.lead_status === 'lost') return false;
      if (!c.last_contact_date) return true;
      const daysSince = Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / 86400000);
      return daysSince > 30;
    })
    .map(c => ({
      ...c,
      days_stale: c.last_contact_date
        ? Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / 86400000)
        : 999
    }))
    .sort((a, b) => b.days_stale - a.days_stale);

  const generateRevival = async (contact) => {
    setGenerating(contact.id);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a low-friction re-engagement email for a business contact who has gone quiet for ${contact.days_stale} days:

Name: ${contact.name}
Company: ${contact.company || 'Unknown'}
Role: ${contact.role || 'Unknown'}
Industry: ${contact.domain || 'Unknown'}
Last Contact: ${contact.last_contact_date || 'Unknown'}
Previous Notes: ${contact.notes || 'No previous context'}
Lead Status: ${contact.lead_status}

Write a SHORT (under 100 words), natural re-engagement email. Don't sound desperate. Reference something relevant to them or their industry. Provide a low-commitment next step (e.g., share an article, ask a simple question).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
          hook: { type: 'string', description: 'The specific hook or angle used' },
          strategy: { type: 'string', description: 'Why this approach was chosen' }
        }
      }
    });

    setGeneratedEmails(prev => ({ ...prev, [contact.id]: result }));

    // Save the revival suggestion on the contact
    await base44.entities.Contact.update(contact.id, {
      revive_suggestion: result.strategy,
      stale_days: contact.days_stale
    });

    setGenerating(null);
    queryClient.invalidateQueries({ queryKey: ['myContacts'] });
  };

  const generateBulkMutation = useMutation({
    mutationFn: async () => {
      const batch = staleContacts.slice(0, 5);
      for (const contact of batch) {
        await generateRevival(contact);
      }
    }
  });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            Stale Deal Reviver
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            AI generates personalized re-engagement emails for contacts who've gone quiet
          </p>
        </div>
        {staleContacts.length > 0 && (
          <Button
            onClick={() => generateBulkMutation.mutate()}
            disabled={generateBulkMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            {generateBulkMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generate Top 5
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {staleContacts.length === 0 ? (
          <div className="text-center py-10">
            <Ghost className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No stale contacts! Your pipeline is actively maintained.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {staleContacts.map(contact => (
              <div key={contact.id} className="p-4 border rounded-lg hover:border-emerald-200 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{contact.name}</h4>
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {contact.days_stale === 999 ? 'Never contacted' : `${contact.days_stale}d stale`}
                      </Badge>
                      {contact.lead_status && (
                        <Badge variant="outline" className="text-xs">{contact.lead_status}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {contact.role}{contact.company ? ` · ${contact.company}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateRevival(contact)}
                    disabled={generating === contact.id}
                    className="gap-1 text-xs"
                  >
                    {generating === contact.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Generate Revival
                  </Button>
                </div>

                {/* Existing revival suggestion */}
                {contact.revive_suggestion && !generatedEmails[contact.id] && (
                  <p className="text-xs text-emerald-600 italic mt-1">Strategy: {contact.revive_suggestion}</p>
                )}

                {/* Generated email */}
                {generatedEmails[contact.id] && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        Hook: {generatedEmails[contact.id].hook}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleCopy(contact.id, `Subject: ${generatedEmails[contact.id].subject}\n\n${generatedEmails[contact.id].body}`)}
                      >
                        {copiedId === contact.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === contact.id ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-xs font-medium text-slate-700 mb-1">
                      Subject: {generatedEmails[contact.id].subject}
                    </p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {generatedEmails[contact.id].body}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 italic">
                      Strategy: {generatedEmails[contact.id].strategy}
                    </p>
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