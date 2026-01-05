import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  HelpCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  MessageCircle,
  Target,
  Heart,
  Coins,
  TrendingUp,
  Users,
  ChevronRight,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

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

export default function HelpSupportAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Saint Support, your guide to the SaintAgent platform. How can I help you today? 🌟"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}

CONVERSATION HISTORY:
${conversationHistory}

User: ${text}

Respond helpfully and concisely. Use markdown formatting when helpful (bullet points, bold for emphasis). Keep responses under 200 words unless the topic requires more detail.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment, or check out the FAQ page for common questions." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Help & Support"
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300",
        isMinimized 
          ? "bottom-6 right-6 w-72 h-14" 
          : "bottom-6 right-6 w-96 h-[32rem]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Saint Support</h3>
            {!isMinimized && (
              <p className="text-xs text-white/70">Here to help</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[calc(100%-8rem)] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex gap-2",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs">
                        <Sparkles className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      msg.role === 'user' 
                        ? "bg-violet-600 text-white rounded-br-sm" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold text-violet-700 dark:text-violet-400">{children}</strong>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs">
                      <Sparkles className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions - show only at start */}
            {messages.length <= 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q.question)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
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
          <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-xl bg-violet-600 hover:bg-violet-700 shrink-0"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}