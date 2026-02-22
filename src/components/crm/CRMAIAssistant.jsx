import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles, Send, Loader2, Mail, UserPlus, TrendingUp, 
  MessageSquare, Target, Lightbulb, Copy, Check
} from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'compose', label: 'Compose Email', icon: Mail, prompt: 'Help me write a professional email to' },
  { id: 'followup', label: 'Follow-Up Ideas', icon: MessageSquare, prompt: 'Suggest follow-up strategies for' },
  { id: 'qualify', label: 'Qualify Lead', icon: Target, prompt: 'Help me qualify this lead:' },
  { id: 'outreach', label: 'Outreach Strategy', icon: TrendingUp, prompt: 'Create an outreach strategy for' },
  { id: 'intro', label: 'Introduction Script', icon: UserPlus, prompt: 'Write an introduction message for' }
];

export default function CRMAIAssistant({ contacts = [], selectedContact = null }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleQuickAction = (action) => {
    if (selectedContact) {
      setInput(`${action.prompt} ${selectedContact.name}${selectedContact.company ? ` from ${selectedContact.company}` : ''}. ${selectedContact.notes ? `Context: ${selectedContact.notes}` : ''}`);
    } else {
      setInput(`${action.prompt} `);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const contactContext = selectedContact 
        ? `\n\nSelected Contact Info:
- Name: ${selectedContact.name}
- Company: ${selectedContact.company || 'N/A'}
- Role: ${selectedContact.role || 'N/A'}
- Domain: ${selectedContact.domain || 'N/A'}
- Lead Status: ${selectedContact.lead_status || 'N/A'}
- Last Contact: ${selectedContact.last_contact_date || 'Never'}
- Notes: ${selectedContact.notes || 'None'}
- Tags: ${(selectedContact.tags || []).join(', ') || 'None'}`
        : '';

      const networkSummary = contacts.length > 0 
        ? `\n\nCRM Network Summary: ${contacts.length} total contacts, ${contacts.filter(c => c.lead_status === 'qualified').length} qualified leads, ${contacts.filter(c => c.lead_status === 'new').length} new leads.`
        : '';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful CRM assistant. Help with the following request:

${input}
${contactContext}
${networkSummary}

Provide practical, actionable advice. If composing an email or message, make it ready to use. Be concise but thorough.`,
        response_json_schema: {
          type: 'object',
          properties: {
            response: { type: 'string', description: 'Main response text' },
            suggestions: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Additional actionable suggestions (2-3 items)'
            },
            email_draft: {
              type: 'object',
              properties: {
                subject: { type: 'string' },
                body: { type: 'string' }
              },
              description: 'If an email was requested, include the draft here'
            }
          }
        }
      });

      setResponse(result);
    } catch (error) {
      console.error('AI Assistant error:', error);
      setResponse({ response: 'Sorry, I encountered an error. Please try again.' });
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-violet-500" />
          AI Assistant
        </CardTitle>
        {selectedContact && (
          <Badge variant="outline" className="w-fit">
            Context: {selectedContact.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(action => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="gap-1.5 text-xs"
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your contacts, email drafts, follow-up strategies..."
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Ask AI
              </>
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <ScrollArea className="flex-1 border rounded-lg p-4 bg-slate-50">
            <div className="space-y-4">
              {/* Main Response */}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-slate-700">{response.response}</p>
              </div>

              {/* Email Draft */}
              {response.email_draft?.subject && (
                <div className="bg-white border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-violet-100 text-violet-700">Email Draft</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`Subject: ${response.email_draft.subject}\n\n${response.email_draft.body}`)}
                      className="gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm font-medium">Subject: {response.email_draft.subject}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{response.email_draft.body}</p>
                </div>
              )}

              {/* Suggestions */}
              {response.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Suggestions
                  </p>
                  <ul className="space-y-1">
                    {response.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-violet-500">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}