import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle, X, Send, Loader2, Shield, Smile, Target, Coins, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';

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

  // Hover timeout refs for smooth interactions
  const helpTimeoutRef = useRef(null);

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

  const showHelpPanel = helpOpen || helpHovered;

  return (
    <>
      <BetaFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      
      {/* Help Tab */}
      <div 
        className="fixed right-0 z-[60] transition-all duration-300 ease-out"
        style={{ bottom: '120px' }}
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
            "absolute right-0 bottom-0 w-[380px] bg-white dark:bg-[#050505] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] shadow-2xl rounded-l-xl overflow-hidden transition-all duration-300 ease-out",
            showHelpPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          )}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
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


    </>
  );
}