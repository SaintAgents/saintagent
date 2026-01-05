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
  Maximize2,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Glitch animation keyframes for hacker theme
const glitchStyles = `
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
@keyframes glitchBorder {
  0% { box-shadow: 0 0 8px #00ff00, inset 0 0 4px #00ff00; }
  25% { box-shadow: 2px 0 8px #00ff00, inset -2px 0 4px #00ff00; }
  50% { box-shadow: -2px 0 8px #00ff00, inset 2px 0 4px #00ff00; }
  75% { box-shadow: 0 2px 8px #00ff00, inset 0 -2px 4px #00ff00; }
  100% { box-shadow: 0 0 8px #00ff00, inset 0 0 4px #00ff00; }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px #00ff00, 0 0 16px rgba(0, 255, 0, 0.4); }
  50% { box-shadow: 0 0 16px #00ff00, 0 0 32px rgba(0, 255, 0, 0.6); }
}
.hacker-glitch {
  animation: glitch 0.3s ease-in-out infinite;
}
.hacker-glitch-border {
  animation: glitchBorder 2s ease-in-out infinite;
}
.hacker-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
`;

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

  return (
    <>
      {/* Inject glitch animation styles */}
      <style>{glitchStyles}</style>
      
      {/* Half-circle button on right side when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed right-0 z-50 h-16 w-8 transition-all duration-300 group",
            "rounded-l-full shadow-lg hover:shadow-xl hover:w-10",
            "bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
            "flex items-center justify-center",
            "dark:bg-[#0a0a0a] dark:from-[#0a0a0a] dark:to-[#050505]",
            "dark:border-l dark:border-t dark:border-b dark:border-[rgba(0,255,136,0.5)]",
            "dark:shadow-[0_0_12px_rgba(0,255,136,0.3)]",
            "dark:hover:shadow-[0_0_20px_rgba(0,255,136,0.5)]"
          )}
          style={{ top: 'calc(50% + 4rem)' }}
          title="Help & Support"
        >
          <HelpCircle className={cn(
            "w-5 h-5 text-white transition-all",
            "dark:text-[#00ff88] dark:drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]",
            "group-hover:scale-110"
          )} />
        </button>
      )}

      {/* Chat panel when open */}
      {isOpen && (
    <div 
      className={cn(
        "fixed z-50 rounded-2xl shadow-2xl border transition-all duration-300 flex flex-col",
        "bg-white/95 backdrop-blur-xl border-slate-200",
        "dark:bg-[#050505]/95 dark:backdrop-blur-xl dark:border-[#00ff88]",
        "dark:shadow-[0_0_30px_rgba(0,255,136,0.25),_0_0_60px_rgba(0,255,136,0.1)]",
        "[data-theme='hacker']_&:bg-[#050505]/95 [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:hacker-glitch-border",
        isMinimized 
          ? "bottom-6 right-6 w-72" 
          : "bottom-6 right-6 w-[26rem]"
      )}
      style={{ 
        height: isMinimized ? '3.5rem' : 'auto',
        maxHeight: isMinimized ? '3.5rem' : 'calc(100vh - 6rem)'
      }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b rounded-t-2xl shrink-0",
        "border-slate-200 bg-gradient-to-r from-violet-500 to-purple-600",
        "dark:from-[#0a0a0a] dark:to-[#050505] dark:border-[#00ff88]/40",
        "[data-theme='hacker']_&:bg-[#050505] [data-theme='hacker']_&:from-[#050505] [data-theme='hacker']_&:to-[#001a00] [data-theme='hacker']_&:border-[#00ff00]"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/20",
            "[data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_8px_#00ff00]"
          )}>
            <div className="[data-theme='hacker']_&:hacker-glitch">
              <Shield className="w-4 h-4 text-white [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:drop-shadow-[0_0_4px_#00ff00]" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:drop-shadow-[0_0_4px_#00ff00]">Saint Support</h3>
            {!isMinimized && (
              <p className="text-xs text-white/70 [data-theme='hacker']_&:text-[#00cc00]">Here to help</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20 [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:hover:bg-[#001a00] [data-theme='hacker']_&:hover:text-[#00ff00]"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20 [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:hover:bg-[#001a00] [data-theme='hacker']_&:hover:text-[#00ff00]"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0 p-4 dark:bg-transparent [data-theme='hacker']_&:bg-transparent" ref={scrollRef}>
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
                    <Avatar className="w-7 h-7 shrink-0 [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00]">
                      <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs [data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:text-[#00ff00]">
                        <Shield className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      msg.role === 'user' 
                        ? "bg-violet-600 text-white rounded-br-sm [data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:text-[#00ff00]" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm [data-theme='hacker']_&:bg-[#0f0f0f] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00]/50 [data-theme='hacker']_&:text-[#00ff00]"
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [data-theme='hacker']_&:text-[#00ff00]"
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold text-violet-700 dark:text-violet-400 [data-theme='hacker']_&:text-[#00ffff]">{children}</strong>,
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
                  <Avatar className="w-7 h-7 shrink-0 [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00]">
                    <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs [data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:text-[#00ff00]">
                      <Shield className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 [data-theme='hacker']_&:bg-[#0f0f0f] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00]/50">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500 [data-theme='hacker']_&:text-[#00ff00]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions - show only at start */}
            {messages.length <= 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium [data-theme='hacker']_&:text-[#00cc00]">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q.question)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors",
                        "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50",
                        "[data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00]/50",
                        "[data-theme='hacker']_&:hover:bg-[#002200] [data-theme='hacker']_&:hover:border-[#00ff00] [data-theme='hacker']_&:hover:shadow-[0_0_8px_#00ff00]"
                      )}
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
          <form onSubmit={handleSubmit} className={cn(
            "p-3 border-t rounded-b-2xl shrink-0",
            "border-slate-200 bg-white/80 backdrop-blur-sm",
            "dark:border-[#00ff88]/40 dark:bg-[#050505]/80",
            "[data-theme='hacker']_&:bg-[#050505]/80 [data-theme='hacker']_&:border-[#00ff00]"
          )}>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className={cn(
                  "flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                  "[data-theme='hacker']_&:bg-[#0f0f0f] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:placeholder:text-[#006600]"
                )}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                className={cn(
                  "rounded-xl bg-violet-600 hover:bg-violet-700 shrink-0",
                  "[data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:hover:bg-[#002200] [data-theme='hacker']_&:hover:shadow-[0_0_8px_#00ff00]"
                )}
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4 [data-theme='hacker']_&:text-[#00ff00]" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
      )}
    </>
  );
}