import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Zap, BarChart3, Settings, Bot } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/hud/BackButton';

import WAStatsBar from '@/components/whatsapp/WAStatsBar';
import WAConversationList from '@/components/whatsapp/WAConversationList';
import WAMessageThread from '@/components/whatsapp/WAMessageThread';
import WAContactDetail from '@/components/whatsapp/WAContactDetail';
import WAAutoReplyRules from '@/components/whatsapp/WAAutoReplyRules';
import WASettings from '@/components/whatsapp/WASettings';
import WAAnalytics from '@/components/whatsapp/WAAnalytics';

export default function WhatsAppDashboard() {
  const [tab, setTab] = useState('inbox');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactDetail, setShowContactDetail] = useState(false);
  const queryClient = useQueryClient();

  // Data fetching
  const { data: contacts = [] } = useQuery({
    queryKey: ['waContacts'],
    queryFn: () => base44.entities.WAContact.list('-updated_date', 200),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['waMessages'],
    queryFn: () => base44.entities.WAMessage.list('-created_date', 500),
  });

  const { data: rules = [] } = useQuery({
    queryKey: ['waRules'],
    queryFn: () => base44.entities.WAAutoReplyRule.list('-priority', 100),
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['waConfig'],
    queryFn: () => base44.entities.WAConfig.list('-updated_date', 1),
  });
  const config = configs?.[0] || {};

  const selectedContact = contacts.find(c => c.phone === selectedPhone);
  const threadMessages = messages.filter(m => m.contact_phone === selectedPhone);

  // Send message (creates entity record — will be sent via webhook when connected)
  const sendMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.WAMessage.create({
        contact_phone: selectedPhone,
        direction: 'outbound',
        content,
        media_type: 'text',
        status: 'sent',
        ai_generated: false,
        thread_id: selectedPhone,
      });
      // Update contact last message time
      if (selectedContact?.id) {
        await base44.entities.WAContact.update(selectedContact.id, {
          last_message_at: new Date().toISOString(),
          total_messages: (selectedContact.total_messages || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waMessages'] });
      queryClient.invalidateQueries({ queryKey: ['waContacts'] });
    }
  });

  // Generate AI draft for a message
  const generateAIDraft = async (contact) => {
    const recentMsgs = messages
      .filter(m => m.contact_phone === contact.phone)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .reverse();

    const conversationHistory = recentMsgs.map(m => 
      `${m.direction === 'inbound' ? 'Customer' : 'Agent'}: ${m.content}`
    ).join('\n');

    const personality = config.ai_personality || 'You are a helpful, professional assistant.';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${personality}\n\nBusiness: ${config.business_name || 'Our Business'}\n\nConversation history:\n${conversationHistory}\n\nGenerate a helpful, concise reply to the customer's last message. Keep it under 200 characters for WhatsApp.`,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          confidence: { type: 'number' },
          detected_intent: { type: 'string' },
          detected_sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative', 'urgent'] }
        }
      }
    });

    // Create as pending review message
    await base44.entities.WAMessage.create({
      contact_phone: contact.phone,
      direction: 'outbound',
      content: '',
      ai_draft: result.reply,
      ai_confidence: result.confidence,
      ai_generated: true,
      status: 'pending_review',
      intent: result.detected_intent,
      sentiment: result.detected_sentiment,
      thread_id: contact.phone,
      media_type: 'text',
    });

    queryClient.invalidateQueries({ queryKey: ['waMessages'] });
    toast.success('AI draft generated — review before sending');
  };

  // Approve AI draft
  const approveDraft = async (msg) => {
    await base44.entities.WAMessage.update(msg.id, {
      content: msg.ai_draft,
      status: 'sent',
      reviewed_by: 'admin',
    });
    queryClient.invalidateQueries({ queryKey: ['waMessages'] });
    toast.success('Reply approved and sent!');
  };

  // Reject AI draft
  const rejectDraft = async (msg) => {
    await base44.entities.WAMessage.delete(msg.id);
    queryClient.invalidateQueries({ queryKey: ['waMessages'] });
    toast.info('Draft rejected');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">WhatsApp Command Center</h1>
              <p className="text-sm text-slate-500">AI-powered messaging, auto-replies & analytics</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <WAStatsBar messages={messages} contacts={contacts} />
        </div>

        {/* Main Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white border mb-4">
            <TabsTrigger value="inbox" className="gap-1.5"><MessageSquare className="w-4 h-4" /> Inbox</TabsTrigger>
            <TabsTrigger value="rules" className="gap-1.5"><Zap className="w-4 h-4" /> Auto-Reply</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox">
            <div className="bg-white rounded-xl border overflow-hidden" style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}>
              <div className="flex h-full">
                {/* Conversation List */}
                <div className="w-80 border-r shrink-0 h-full overflow-hidden">
                  <WAConversationList
                    contacts={contacts}
                    messages={messages}
                    selectedPhone={selectedPhone}
                    onSelect={(phone) => { setSelectedPhone(phone); setShowContactDetail(false); }}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>

                {/* Message Thread */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <WAMessageThread
                    contact={selectedContact}
                    messages={threadMessages}
                    onSendMessage={(content) => sendMutation.mutate(content)}
                    onApproveDraft={approveDraft}
                    onRejectDraft={rejectDraft}
                    onGenerateAI={generateAIDraft}
                  />
                </div>

                {/* Contact Detail Sidebar */}
                {selectedContact && (
                  <div className="w-72 border-l shrink-0 h-full overflow-y-auto hidden lg:block">
                    <WAContactDetail contact={selectedContact} messages={messages} />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Auto-Reply Rules Tab */}
          <TabsContent value="rules">
            <WAAutoReplyRules rules={rules} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <WAAnalytics messages={messages} contacts={contacts} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <WASettings config={config} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}