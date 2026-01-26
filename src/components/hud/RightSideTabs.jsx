import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle, Globe, X, Send, Loader2, Shield, Smile, Target, Coins, TrendingUp, Heart, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';
import TownHallCall from '@/components/video/TownHallCall';
import { format, parseISO } from 'date-fns';

const QUICK_QUESTIONS = [
  { icon: Target, label: 'How do I find matches?', question: 'How does the Synchronicity Engine work and how do I find good matches?' },
  { icon: Coins, label: 'What are GGG rewards?', question: 'What are GGG tokens and how do I earn them?' },
  { icon: TrendingUp, label: 'How do Rank Points work?', question: 'Explain the rank system and how I can level up from Seeker to Guardian.' },
  { icon: Heart, label: 'Dating features', question: 'How do I use the dating and compatibility features?' },
  { icon: Users, label: 'Finding collaborators', question: 'How can I find people to collaborate with on projects or missions?' },
];

const SYSTEM_CONTEXT = `You are Saint Support, the helpful AI assistant for the SaintAgent platform - a conscious community for spiritual seekers, lightworkers, and builders.

PERSONALITY:
- Warm, empathetic, and grounded
- Use encouraging language aligned with the platform's values of connection, growth, and service
- Be concise but thorough
- When appropriate, reference the user's journey toward becoming a "144K Leader"

PLATFORM KNOWLEDGE:

1. SYNCHRONICITY ENGINE (Matches page):
- AI-powered matching based on values, skills, intentions, and spiritual practices
- Match Score (0-100) combines: Intent Alignment, Skill Complementarity, Proximity, Timing Readiness, Trust Score, and Spiritual Alignment
- Users can filter by values, practices, and score range
- Match types: People, Offers, Missions, Events, Teachers, Dating

2. GGG TOKENS:
- Platform currency earned through engagement
- Earn GGG by: completing missions, attending meetings, creating content, referrals, testimonials
- Used for: boosting profiles, marketplace purchases, premium features

3. RANK SYSTEM (Reputation Points - RP):
- Seeker (0-99 RP) → Initiate (100-249) → Adept (250-499) → Practitioner (500-999) → Master (1000-1999) → Sage (2000-3999) → Oracle (4000-6999) → Ascended (7000-9999) → Guardian (10000+)
- RP earned through: meetings completed, missions accomplished, testimonials received, contributions

4. DATING & COMPATIBILITY:
- Opt-in feature in the Dating tab
- 5 compatibility domains: Identity & Values, Emotional Stability, Communication, Growth & Intent, Lifestyle
- Users set domain weights to prioritize what matters most
- Dealbreakers filter out incompatible matches
- Profile Boost increases visibility for 24 hours

5. 144K LEADER PROGRAM:
- Special status for verified community leaders
- Apply through Leader Channel
- Benefits: broadcast to followers, create missions, governance participation

6. KEY FEATURES:
- Circles: Interest-based communities
- Missions: Collaborative quests with GGG rewards
- Marketplace: Offer/request services
- Meetings: Schedule 1:1 connections
- Studio: Content creation tools

Always guide users to explore features and complete their profiles for better matches. Encourage community participation and conscious connection.`;

export default function RightSideTabs() {
  // Help panel state
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpHovered, setHelpHovered] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [helpMessages, setHelpMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Saint Support, your guide to the SaintAgent platform. How can I help you today? 🌟" }
  ]);
  const [helpInput, setHelpInput] = useState('');
  const [helpLoading, setHelpLoading] = useState(false);
  const helpScrollRef = useRef(null);
  const helpInputRef = useRef(null);

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHovered, setChatHovered] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [townHallOpen, setTownHallOpen] = useState(false);
  const [townHallFullscreen, setTownHallFullscreen] = useState(false);
  const chatScrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Hover timeout refs for smooth interactions
  const helpTimeoutRef = useRef(null);
  const chatTimeoutRef = useRef(null);

  // Help panel hover handlers
  const handleHelpMouseEnter = () => {
    clearTimeout(helpTimeoutRef.current);
    setHelpHovered(true);
  };
  const handleHelpMouseLeave = () => {
    helpTimeoutRef.current = setTimeout(() => {
      if (!helpOpen) setHelpHovered(false);
    }, 300);
  };

  // Chat panel hover handlers
  const handleChatMouseEnter = () => {
    clearTimeout(chatTimeoutRef.current);
    setChatHovered(true);
  };
  const handleChatMouseLeave = () => {
    chatTimeoutRef.current = setTimeout(() => {
      if (!chatOpen) setChatHovered(false);
    }, 300);
  };

  // Auto-scroll help messages
  useEffect(() => {
    if (helpScrollRef.current) {
      helpScrollRef.current.scrollTop = helpScrollRef.current.scrollHeight;
    }
  }, [helpMessages]);

  // Focus input when help opens
  useEffect(() => {
    if ((helpOpen || helpHovered) && helpInputRef.current) {
      setTimeout(() => helpInputRef.current?.focus(), 100);
    }
  }, [helpOpen, helpHovered]);

  // Help send message
  const sendHelpMessage = async (text) => {
    if (!text.trim() || helpLoading) return;
    const userMessage = { role: 'user', content: text };
    setHelpMessages(prev => [...prev, userMessage]);
    setHelpInput('');
    setHelpLoading(true);

    try {
      const conversationHistory = helpMessages.slice(-6).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nUser: ${text}\n\nRespond helpfully and concisely. Use markdown formatting when helpful (bullet points, bold for emphasis). Keep responses under 200 words unless the topic requires more detail.`,
      });
      setHelpMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setHelpMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment, or check out the FAQ page for common questions." 
      }]);
    } finally {
      setHelpLoading(false);
    }
  };

  // Chat data fetching
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfileForChat', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['globalChatMessages'],
    queryFn: () => base44.entities.CircleMessage.filter({ circle_id: 'global' }, '-created_date', 50),
    enabled: chatOpen || chatHovered,
    refetchInterval: (chatOpen || chatHovered) ? 3000 : false
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['onlineUsersGlobalChat'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('-last_seen_at', 100);
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      return profiles.filter(p => p.last_seen_at && new Date(p.last_seen_at) > fiveMinAgo);
    },
    enabled: chatOpen || chatHovered,
    refetchInterval: 10000
  });

  const sendChatMutation = useMutation({
    mutationFn: (data) => base44.entities.CircleMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalChatMessages'] });
      setChatMessage('');
    }
  });

  const handleChatSend = () => {
    if (!chatMessage.trim() || !user) return;
    sendChatMutation.mutate({
      circle_id: 'global',
      author_id: user.email,
      author_name: userProfile?.display_name || user.full_name,
      author_avatar: userProfile?.avatar_url,
      content: chatMessage.trim(),
      message_type: 'text'
    });
  };

  useEffect(() => {
    if (chatScrollRef.current && (chatOpen || chatHovered)) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatOpen, chatHovered]);

  const sortedChatMessages = [...chatMessages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  const showHelpPanel = helpOpen || helpHovered;
  const showChatPanel = chatOpen || chatHovered;

  // Listen for mobile tab bar events
  useEffect(() => {
    const handleOpenChat = () => {
      setChatOpen(true);
      setChatHovered(true);
    };
    const handleOpenHelp = () => {
      setHelpOpen(true);
      setHelpHovered(true);
    };
    const handleOpenRightSideTab = (e) => {
      if (e.detail?.tab === 'help') {
        setHelpOpen(true);
        setHelpHovered(true);
      } else if (e.detail?.tab === 'chat') {
        setChatOpen(true);
        setChatHovered(true);
      }
    };
    document.addEventListener('openGlobalChat', handleOpenChat);
    document.addEventListener('openGlobalHelp', handleOpenHelp);
    document.addEventListener('openRightSideTab', handleOpenRightSideTab);
    return () => {
      document.removeEventListener('openGlobalChat', handleOpenChat);
      document.removeEventListener('openGlobalHelp', handleOpenHelp);
      document.removeEventListener('openRightSideTab', handleOpenRightSideTab);
    };
  }, []);

  return (
    <>
      <BetaFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      
      {/* Help Tab */}
      <div 
        className="fixed right-0 z-[60] transition-all duration-300 ease-out hidden md:block"
        style={{ bottom: '52px' }}
        onMouseEnter={handleHelpMouseEnter}
        onMouseLeave={handleHelpMouseLeave}
      >
        {/* Tab Handle */}
        <div 
          className={cn(
            "absolute right-0 top-0 flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-300",
            "bg-gradient-to-l from-violet-600 to-purple-600 text-white shadow-lg",
            "rounded-l-lg border-l border-t border-b border-violet-500",
            showHelpPanel ? "translate-x-0 opacity-0" : "translate-x-0"
          )}
          onClick={() => setHelpOpen(true)}
        >
          <HelpCircle className="w-5 h-5" />
        </div>

        {/* Sliding Panel */}
        <div 
          className={cn(
            "fixed right-0 w-[380px] md:w-[380px] max-w-[calc(100vw-1rem)] bg-white dark:bg-[#050505] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] shadow-2xl rounded-l-xl overflow-hidden transition-all duration-300 ease-out z-[60]",
            showHelpPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          )}
          style={{ maxHeight: 'calc(100vh - 200px)', bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Saint Support</h3>
                <p className="text-xs text-white/70">Here to help</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => { setHelpOpen(false); setHelpHovered(false); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[45vh] p-4" ref={helpScrollRef}>
            <div className="space-y-4">
              {helpMessages.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  {msg.role === 'assistant' && (
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs">
                        <Shield className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === 'user' 
                      ? "bg-violet-600 text-white rounded-br-sm" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                  )}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {helpLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs">
                      <Shield className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {helpMessages.length <= 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendHelpMessage(q.question)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <q.icon className="w-3 h-3" />
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#050505]/80">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <Smile className="w-3.5 h-3.5" />
              Submit Beta Feedback
            </button>
            <form onSubmit={(e) => { e.preventDefault(); sendHelpMessage(helpInput); }} className="flex gap-2">
              <Input
                ref={helpInputRef}
                value={helpInput}
                onChange={(e) => setHelpInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                disabled={helpLoading}
              />
              <Button type="submit" size="icon" className="rounded-xl bg-violet-600 hover:bg-violet-700 shrink-0" disabled={!helpInput.trim() || helpLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Chat Tab */}
      <div 
        className="fixed right-0 z-[60] transition-all duration-300 ease-out hidden md:block"
        style={{ bottom: '100px' }}
        onMouseEnter={handleChatMouseEnter}
        onMouseLeave={handleChatMouseLeave}
      >
        {/* Tab Handle */}
        <div 
          className={cn(
            "absolute right-0 top-0 flex items-center justify-center w-10 h-10 cursor-pointer transition-all duration-300",
            "bg-gradient-to-l from-blue-600 to-indigo-600 text-white shadow-lg",
            "rounded-l-lg border-l border-t border-b border-blue-500",
            showChatPanel ? "translate-x-0 opacity-0" : "translate-x-0"
          )}
          onClick={() => setChatOpen(true)}
        >
          <Globe className="w-5 h-5" />
          {onlineUsers.length > 0 && (
            <span className="absolute -top-1 -left-1 bg-emerald-500 text-white text-[10px] px-1.5 rounded-full h-4 min-w-4 flex items-center justify-center font-medium">
              {onlineUsers.length}
            </span>
          )}
        </div>

        {/* Sliding Panel */}
        <div 
          className={cn(
            "fixed right-0 w-[380px] md:w-[380px] max-w-[calc(100vw-1rem)] bg-white dark:bg-[#050505] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] shadow-2xl rounded-l-xl overflow-hidden transition-all duration-300 ease-out flex flex-col z-[60]",
            showChatPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          )}
          style={{ height: 'calc(100vh - 260px)', maxHeight: '500px', bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-medium text-white text-sm">Global Chat</h3>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineUsers.length} online
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setTownHallOpen(true)} className="h-7 w-7 text-white hover:bg-white/20" title="Join Town Hall Video">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => { setChatOpen(false); setChatHovered(false); }} className="h-7 w-7 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Online Users */}
          <div className="px-3 py-2 border-b bg-slate-50 dark:bg-slate-900 flex items-center gap-2 overflow-x-auto">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            {onlineUsers.slice(0, 8).map(u => (
              <div key={u.id} className="relative shrink-0" data-user-id={u.user_id}>
                <Avatar className="w-6 h-6 cursor-pointer">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="text-xs">{u.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              </div>
            ))}
            {onlineUsers.length > 8 && <span className="text-xs text-slate-500">+{onlineUsers.length - 8}</span>}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3" ref={chatScrollRef}>
            <div className="space-y-3">
              {sortedChatMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                sortedChatMessages.map((msg, idx) => {
                  const isOwn = msg.author_id === user?.email;
                  const showAvatar = idx === 0 || sortedChatMessages[idx - 1]?.author_id !== msg.author_id;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                      {showAvatar ? (
                        <Avatar className="w-7 h-7 shrink-0 cursor-pointer" data-user-id={msg.author_id}>
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className="text-xs">{msg.author_name?.[0]}</AvatarFallback>
                        </Avatar>
                      ) : <div className="w-7 shrink-0" />}
                      <div className={cn("max-w-[70%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                        {showAvatar && !isOwn && (
                          <span className="text-xs text-slate-500 mb-0.5 cursor-pointer hover:text-blue-600" data-user-id={msg.author_id}>
                            {msg.author_name}
                          </span>
                        )}
                        <div className={cn(
                          "px-3 py-2 rounded-lg text-sm",
                          isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {format(parseISO(msg.created_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setTownHallOpen(true)} className="h-9 w-9 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shrink-0" title="Join Community Call">
                <Video className="w-4 h-4 text-emerald-600" />
              </Button>
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                placeholder="Say something..."
                className="flex-1 h-9"
              />
              <Button onClick={handleChatSend} disabled={!chatMessage.trim() || sendChatMutation.isPending} size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Town Hall Video Call */}
      {townHallOpen && (
        <div className={cn("fixed z-[70]", townHallFullscreen ? "inset-0" : "bottom-4 left-4 w-[800px] h-[600px]")}>
          <TownHallCall
            user={user}
            onClose={() => setTownHallOpen(false)}
            isFullscreen={townHallFullscreen}
            onToggleFullscreen={() => setTownHallFullscreen(!townHallFullscreen)}
          />
        </div>
      )}
    </>
  );
}