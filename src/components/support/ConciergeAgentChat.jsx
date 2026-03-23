import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2, Bot, X, Sparkles, Zap, CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Action';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try { return typeof results === 'string' ? JSON.parse(results) : results; } catch { return results; }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
    running: { icon: Loader2, color: 'text-violet-500', text: 'Working...', spin: true },
    in_progress: { icon: Loader2, color: 'text-violet-500', text: 'Working...', spin: true },
    completed: isError
      ? { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
      : { icon: CheckCircle2, color: 'text-green-600', text: 'Done' },
    success: { icon: CheckCircle2, color: 'text-green-600', text: 'Done' },
    failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-slate-500', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.replace(/\./g, ' › ').replace(/_/g, ' ');

  return (
    <div className="mt-1.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all",
          "hover:bg-slate-50 dark:hover:bg-slate-800",
          expanded ? "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        )}
      >
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-slate-700 dark:text-slate-300 capitalize">{formattedName}</span>
        {statusConfig.text && (
          <span className={cn("text-slate-500", isError && "text-red-600")}>• {statusConfig.text}</span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn("h-3 w-3 text-slate-400 transition-transform ml-auto", expanded && "rotate-90")} />
        )}
      </button>
      {expanded && !statusConfig.spin && parsedResults && (
        <div className="mt-1 ml-3 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
          <pre className="bg-slate-50 dark:bg-slate-800 rounded p-1.5 text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-32 overflow-auto">
            {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
          </pre>
        </div>
      )}
    </div>
  );
}

// Page-specific quick actions and context
const PAGE_QUICK_ACTIONS = {
  Projects: [
    { label: 'Add a new project', icon: '📁' },
    { label: 'Show my active projects', icon: '📊' },
    { label: 'Find team members for a project', icon: '👥' },
    { label: 'Update a project status', icon: '✏️' },
  ],
  Missions: [
    { label: 'Create a new mission', icon: '🎯' },
    { label: 'Show active missions I can join', icon: '🔍' },
    { label: 'Check my mission progress', icon: '📈' },
    { label: 'Find collaborators for a mission', icon: '🤝' },
  ],
  Meetings: [
    { label: 'Schedule a new meeting', icon: '📅' },
    { label: 'Show my upcoming meetings', icon: '🕐' },
    { label: 'Set my availability preferences', icon: '⚙️' },
    { label: 'Cancel a meeting', icon: '❌' },
  ],
  Matches: [
    { label: 'Find new matches for me', icon: '✨' },
    { label: 'Tune my matching preferences', icon: '🎛️' },
    { label: 'Send a connection request', icon: '💬' },
    { label: 'Check my match score details', icon: '📊' },
  ],
  Marketplace: [
    { label: 'Create a marketplace listing', icon: '🏪' },
    { label: 'Search for a service', icon: '🔍' },
    { label: 'Update my listing status', icon: '✏️' },
    { label: 'Book a service', icon: '📅' },
  ],
  Circles: [
    { label: 'Create a new circle', icon: '⭕' },
    { label: 'Find circles to join', icon: '🔍' },
    { label: 'Post in a circle', icon: '💬' },
    { label: 'Invite someone to my circle', icon: '📨' },
  ],
  Events: [
    { label: 'Create a new event', icon: '🎉' },
    { label: 'Show upcoming events', icon: '📅' },
    { label: 'RSVP to an event', icon: '✅' },
    { label: 'Find events near me', icon: '📍' },
  ],
  Messages: [
    { label: 'Start a new conversation', icon: '💬' },
    { label: 'Find unread messages', icon: '📩' },
    { label: 'Create a group chat', icon: '👥' },
    { label: 'Send a quick hello to a match', icon: '👋' },
  ],
  Profile: [
    { label: 'Update my bio', icon: '✏️' },
    { label: 'Add skills to my profile', icon: '🛠️' },
    { label: 'Upload a new avatar', icon: '📷' },
    { label: 'Change my status', icon: '🟢' },
  ],
  CommandDeck: [
    { label: 'Show my upcoming meetings', icon: '📅' },
    { label: 'What missions can I join?', icon: '🎯' },
    { label: 'Check my GGG balance', icon: '💰' },
    { label: 'Find new matches', icon: '✨' },
  ],
  Settings: [
    { label: 'Update my notification preferences', icon: '🔔' },
    { label: 'Change my theme', icon: '🎨' },
    { label: 'Set my availability hours', icon: '🕐' },
    { label: 'Update my privacy settings', icon: '🔒' },
  ],
  Broadcast: [
    { label: 'Schedule a new broadcast', icon: '📡' },
    { label: 'Show upcoming broadcasts', icon: '📅' },
    { label: 'Join a live broadcast', icon: '▶️' },
    { label: 'RSVP to a broadcast', icon: '✅' },
  ],
  CRM: [
    { label: 'Add a new contact', icon: '👤' },
    { label: 'Import contacts', icon: '📥' },
    { label: 'Send a follow-up email', icon: '📧' },
    { label: 'Check my pipeline', icon: '📊' },
  ],
  Deals: [
    { label: 'Create a new deal', icon: '🤝' },
    { label: 'Show my active deals', icon: '📊' },
    { label: 'Log a deal activity', icon: '📝' },
    { label: 'Move a deal to next stage', icon: '➡️' },
  ],
  Forum: [
    { label: 'Start a new discussion', icon: '💬' },
    { label: 'Search forum topics', icon: '🔍' },
    { label: 'Reply to a thread', icon: '↩️' },
    { label: 'Find unanswered questions', icon: '❓' },
  ],
  News: [
    { label: 'Show latest articles', icon: '📰' },
    { label: 'Find announcements', icon: '📢' },
    { label: 'Search news by topic', icon: '🔍' },
    { label: 'Check featured stories', icon: '⭐' },
  ],
};

const PAGE_PLACEHOLDERS = {
  Projects: 'e.g. "Add a project called..."',
  Missions: 'e.g. "Create a mission for..."',
  Meetings: 'e.g. "Schedule a meeting with..."',
  Matches: 'e.g. "Find matches with..."',
  Marketplace: 'e.g. "List my service..."',
  Circles: 'e.g. "Create a circle for..."',
  Events: 'e.g. "Create an event..."',
  Messages: 'e.g. "Message someone about..."',
  Profile: 'e.g. "Update my bio to..."',
  Settings: 'e.g. "Change my notifications..."',
  Broadcast: 'e.g. "Schedule a broadcast..."',
  CRM: 'e.g. "Add a contact..."',
  Deals: 'e.g. "Create a deal for..."',
};

const PAGE_GREETING = {
  Projects: "I can help you add projects, manage teams, update statuses, and more.",
  Missions: "I can help you create missions, join existing ones, track progress, and find collaborators.",
  Meetings: "I can help you schedule meetings, manage availability, and coordinate with others.",
  Matches: "I can help you find matches, tune preferences, and initiate connections.",
  Marketplace: "I can help you create listings, search for services, and manage your offerings.",
  Circles: "I can help you create or join circles, post content, and invite members.",
  Events: "I can help you create events, RSVP, and discover upcoming gatherings.",
  Messages: "I can help you start conversations, manage group chats, and reach out to connections.",
  Profile: "I can help you update your profile, add skills, and customize your presence.",
  CommandDeck: "I can help you navigate your dashboard, check stats, and take quick actions.",
  Settings: "I can help you configure notifications, themes, privacy, and availability.",
  Broadcast: "I can help you schedule broadcasts, join live sessions, and manage RSVPs.",
  CRM: "I can help you manage contacts, track interactions, and send outreach.",
  Deals: "I can help you create deals, track pipeline stages, and log activities.",
  Forum: "I can help you start discussions, find topics, and engage in conversations.",
  News: "I can help you find articles, check announcements, and browse updates.",
};

export default function ConciergeAgentChat({ onClose, currentPage }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Create or load conversation
  useEffect(() => {
    if (!currentUser) return;
    const initConversation = async () => {
      try {
        // Try to find existing conversation
        const convos = await base44.agents.listConversations({ agent_name: 'saint_concierge' });
        if (convos?.length > 0) {
          const latest = convos[0];
          setConversationId(latest.id);
          setMessages(latest.messages || []);
        } else {
          const convo = await base44.agents.createConversation({
            agent_name: 'saint_concierge',
            metadata: { name: 'Concierge Session' }
          });
          setConversationId(convo.id);
          setMessages(convo.messages || []);
        }
      } catch (err) {
        console.error('Failed to init concierge conversation:', err);
      }
    };
    initConversation();
  }, [currentUser]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setIsSending(false);
    });
    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current) {
        const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollRef.current;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isSending || !conversationId) return;
    const text = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const convo = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(convo, { role: 'user', content: text });
    } catch (err) {
      console.error('Failed to send message:', err);
      setIsSending(false);
    }
  };

  const sendQuickAction = async (text) => {
    if (isSending || !conversationId) return;
    setIsSending(true);
    try {
      const convo = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(convo, { role: 'user', content: text });
    } catch (err) {
      console.error('Failed to send message:', err);
      setIsSending(false);
    }
  };

  const QUICK_ACTIONS = [
    { label: 'Show my upcoming meetings', icon: '📅' },
    { label: 'Update my status to online', icon: '🟢' },
    { label: 'What missions can I join?', icon: '🎯' },
    { label: 'Create a marketplace listing', icon: '🏪' },
  ];

  const isStreaming = isSending || messages.some(m => 
    m.role === 'assistant' && m.tool_calls?.some(tc => tc.status === 'running' || tc.status === 'in_progress')
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Saint Concierge</h3>
            <p className="text-xs text-white/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Takes actions for you
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center py-6">
              <Bot className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Hi! I'm your Concierge</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-[260px] mx-auto">
                I can take actions for you — schedule meetings, join missions, update your profile, and more.
              </p>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuickAction(action.label)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-left"
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.filter(m => m.role !== 'system').map((msg, idx) => (
            <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
              {msg.role === 'assistant' && (
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 text-[10px]">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="max-w-[85%]">
                {msg.content && (
                  <div className={cn(
                    "rounded-2xl px-3 py-2 text-sm",
                    msg.role === 'user'
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                  )}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                )}
                {msg.tool_calls?.length > 0 && (
                  <div className="space-y-1">
                    {msg.tool_calls.map((tc, tcIdx) => (
                      <FunctionDisplay key={tcIdx} toolCall={tc} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-2 justify-start">
              <Avatar className="w-6 h-6 shrink-0">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 text-[10px]">
                  <Bot className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what to do..."
            className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shrink-0"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}