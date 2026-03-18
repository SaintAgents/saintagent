import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import {
  Bot, Send, Loader2, Sparkles, User, Zap
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: 'Enrich a contact', prompt: 'Research and enrich the contact named ' },
  { label: 'Draft outreach email', prompt: 'Draft a personalized outreach email for ' },
  { label: 'Analyze my pipeline', prompt: 'Analyze my current pipeline and suggest which contacts to prioritize and why.' },
  { label: 'Revival strategy', prompt: 'Suggest a re-engagement strategy for my stale contacts that haven\'t been contacted in 30+ days.' },
  { label: 'Sentiment check', prompt: 'Analyze the sentiment of my recent interactions. Here is the latest exchange: ' },
  { label: 'Qualify a lead', prompt: 'Help me qualify this lead based on the following info: ' }
];

export default function CRMResponseAgentChat({ contacts = [], selectedContact = null }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Create or load conversation
  useEffect(() => {
    const init = async () => {
      try {
        const convos = await base44.agents.listConversations({ agent_name: 'crm_response_agent' });
        if (convos?.length > 0) {
          const latest = convos[0];
          setConversationId(latest.id);
          const full = await base44.agents.getConversation(latest.id);
          setMessages(full.messages || []);
        }
      } catch (err) {
        // Agent might not exist yet, that's ok
        console.log('CRM agent not initialized yet');
      }
    };
    init();
  }, []);

  // Subscribe to updates
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
    });
    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    try {
      let convo;
      if (!conversationId) {
        convo = await base44.agents.createConversation({
          agent_name: 'crm_response_agent',
          metadata: { name: 'CRM Assistant Session' }
        });
        setConversationId(convo.id);
      } else {
        convo = await base44.agents.getConversation(conversationId);
      }

      // Add contact context if selected
      let messageContent = input;
      if (selectedContact) {
        messageContent += `\n\n[Context - Selected Contact: ${selectedContact.name}, ${selectedContact.role || ''} at ${selectedContact.company || ''}, Status: ${selectedContact.lead_status || 'new'}, Notes: ${selectedContact.notes || 'None'}]`;
      }

      // Add pipeline summary
      const pipelineSummary = `\n[Pipeline: ${contacts.length} total, ${contacts.filter(c => c.lead_status === 'qualified').length} qualified, ${contacts.filter(c => c.lead_status === 'new').length} new, ${contacts.filter(c => c.sentiment_label === 'hot').length} hot]`;
      messageContent += pipelineSummary;

      await base44.agents.addMessage(convo, {
        role: 'user',
        content: messageContent
      });
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setSending(false);
  };

  const handleQuickPrompt = (prompt) => {
    if (selectedContact) {
      setInput(prompt + selectedContact.name + (selectedContact.company ? ` from ${selectedContact.company}` : ''));
    } else {
      setInput(prompt);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-5 h-5 text-violet-500" />
          CRM Response Agent
        </CardTitle>
        {selectedContact && (
          <Badge variant="outline" className="w-fit text-xs">
            <User className="w-3 h-3 mr-1" />
            Context: {selectedContact.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1.5 flex-shrink-0">
          {QUICK_PROMPTS.map((qp, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(qp.prompt)}
              className="text-xs gap-1 h-7"
            >
              <Zap className="w-3 h-3" />
              {qp.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-3 bg-slate-50" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Ask me to research contacts, draft emails, analyze sentiment, or strategize your pipeline.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content?.replace(/\[Context.*?\]/gs, '').replace(/\[Pipeline.*?\]/gs, '').trim()}</p>
                  ) : (
                    <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content || ''}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                </div>
                <div className="bg-white border rounded-xl px-3 py-2">
                  <p className="text-sm text-slate-400">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask the CRM agent..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}