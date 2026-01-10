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

/* Hacker theme help button styling */
[data-theme='hacker'] .hacker-help-btn {
  background: #000 !important;
  background-image: none !important;
  border-left: 2px solid #00ff00 !important;
  border-top: 2px solid #00ff00 !important;
  border-bottom: 2px solid #00ff00 !important;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(0, 255, 0, 0.1) !important;
}
[data-theme='hacker'] .hacker-help-btn:hover {
  box-shadow: 0 0 25px rgba(0, 255, 0, 0.8), inset 0 0 15px rgba(0, 255, 0, 0.2) !important;
}
[data-theme='hacker'] .hacker-help-icon {
  color: #00ff00 !important;
  filter: drop-shadow(0 0 8px #00ff00);
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
  
  // Dragging state - start docked on right by default
  const [position, setPosition] = useState({ x: null, y: 200 });
  const [dockedSide, setDockedSide] = useState('right'); // 'left' | 'right' | null - default docked right
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const isDraggingRef = useRef(false);
  
  // Initialize position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('helpSupportPosition');
      if (saved) {
        const pos = JSON.parse(saved);
        setPosition({ x: pos.x, y: pos.y ?? 200 });
        setDockedSide(pos.dockedSide ?? 'right');
      }
    } catch {}
  }, []);
  
  // Save position when it changes
  useEffect(() => {
    if (position.x !== null && position.y !== null) {
      try {
        localStorage.setItem('helpSupportPosition', JSON.stringify({ ...position, dockedSide }));
      } catch {}
    }
  }, [position, dockedSide]);
  
  // Use refs for drag handlers to avoid stale closures
  const positionRef = useRef(position);
  positionRef.current = position;
  
  const onDragStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const rect = e.currentTarget.closest('[data-help-panel]')?.getBoundingClientRect();
    const startX = positionRef.current.x ?? (rect?.left ?? window.innerWidth - 440);
    const startY = positionRef.current.y ?? (rect?.top ?? window.innerHeight - 500);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: startX,
      startPosY: startY
    };
    // If position not set, initialize it from current element position
    if (positionRef.current.x === null) {
      setPosition({ x: startX, y: startY });
    }
    setDockedSide(null); // Undock when starting to drag
    
    const handleMove = (moveE) => {
      if (!isDraggingRef.current) return;
      const dx = moveE.clientX - dragRef.current.startX;
      const dy = moveE.clientY - dragRef.current.startY;
      const newX = Math.max(0, Math.min(window.innerWidth - 420, dragRef.current.startPosX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPosY + dy));
      setPosition({ x: newX, y: newY });
      positionRef.current = { x: newX, y: newY };
    };
    
    const handleUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      // Check if should dock to side
      const DOCK_THRESHOLD = 50;
      const panelWidth = 416;
      const currentX = positionRef.current.x;
      if (currentX !== null) {
        if (currentX < DOCK_THRESHOLD) {
          setDockedSide('left');
        } else if (currentX > window.innerWidth - panelWidth - DOCK_THRESHOLD) {
          setDockedSide('right');
        } else {
          setDockedSide(null);
        }
      }
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  // Button drag handlers (when closed)
  const onButtonDragStart = (e) => {
    e.preventDefault();
    buttonDraggingRef.current = true;
    buttonDraggedRef.current = false;
    const startX = position.x ?? 16;
    const startY = position.y ?? (window.innerHeight - 80);
    buttonDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: startX,
      startPosY: startY
    };
    
    const handleMove = (moveE) => {
      if (!buttonDraggingRef.current) return;
      const dx = moveE.clientX - buttonDragRef.current.startX;
      const dy = moveE.clientY - buttonDragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        buttonDraggedRef.current = true;
      }
      const newX = Math.max(0, Math.min(window.innerWidth - 100, buttonDragRef.current.startPosX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, buttonDragRef.current.startPosY + dy));
      setPosition({ x: newX, y: newY });
    };
    
    const handleUp = () => {
      buttonDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      // Reset dragged flag after a short delay to allow click to be ignored
      setTimeout(() => { buttonDraggedRef.current = false; }, 50);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

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
      
      {/* Docked help tab on right side when closed */}
      {!isOpen && (
        <div
          className="fixed z-50"
          style={{ 
            right: dockedSide === 'right' ? 0 : 'auto',
            left: dockedSide === 'left' ? 0 : (dockedSide === null ? position.x : 'auto'),
            top: position.y ?? 200
          }}
        >
          <div
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg transition-all cursor-pointer hover:scale-105 hacker-help-btn",
              dockedSide === 'right' ? "rounded-l-full pr-4" : dockedSide === 'left' ? "rounded-r-full pl-4" : "rounded-full"
            )}
          >
            <HelpCircle className="w-4 h-4 hacker-help-icon" />
            <span className="text-xs font-medium">Help</span>
          </div>
        </div>
      )}

      {/* Chat panel when open */}
      {isOpen && (
    <div 
      data-help-panel
      className={cn(
        "fixed z-[70] shadow-2xl border transition-all duration-300",
        "bg-white/95 backdrop-blur-md border-slate-200",
        "dark:bg-[#050505]/95 dark:backdrop-blur-md dark:border-[rgba(0,255,136,0.4)]",
        "dark:shadow-[0_0_30px_rgba(0,255,136,0.15),_inset_0_0_60px_rgba(0,255,136,0.03)]",
        "[data-theme='hacker']_&:bg-[#050505]/95 [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:hacker-glitch-border",
        isMinimized 
          ? "w-72 h-14" 
          : "w-[26rem] max-h-[75vh]",
        dockedSide === 'left' ? "rounded-r-2xl rounded-l-none" : dockedSide === 'right' ? "rounded-l-2xl rounded-r-none" : "rounded-2xl"
      )}
      style={{ 
        height: isMinimized ? '3.5rem' : 'auto',
        ...(dockedSide === 'left'
          ? { left: 0, top: position.y ?? 100, right: 'auto', bottom: 'auto' }
          : dockedSide === 'right'
          ? { right: 0, left: 'auto', top: position.y ?? 100, bottom: 'auto' }
          : position.x !== null && position.y !== null 
          ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
          : { bottom: 24, right: 24 }
        )
      }}
    >
      {/* Header - draggable */}
      <div 
        onMouseDown={onDragStart}
        className={cn(
        "flex items-center justify-between px-4 py-3 border-b rounded-t-2xl cursor-move select-none",
        "border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600",
        "[data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:from-[#0a0a0a] [data-theme='hacker']_&:to-[#001a00] [data-theme='hacker']_&:border-[#00ff00]"
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
          <ScrollArea className="h-[50vh] p-4 dark:bg-transparent [data-theme='hacker']_&:bg-transparent" ref={scrollRef}>
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
            "p-3 border-t rounded-b-2xl",
            "border-slate-200 bg-white/80 backdrop-blur-sm",
            "dark:border-[rgba(0,255,136,0.3)] dark:bg-[#050505]/80",
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