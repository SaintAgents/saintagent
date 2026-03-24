import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, Loader2, ChevronDown, ChevronUp, RotateCcw,
  Brain, Lightbulb, MessageCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  { label: 'Dig deeper', prompt: 'Can you dig deeper into the core issue and help me understand it better?' },
  { label: 'Practical steps', prompt: 'What specific, actionable steps can I take right now to address this?' },
  { label: 'Different perspective', prompt: 'Can you offer a completely different perspective on this situation?' },
  { label: 'Emotional guidance', prompt: 'How should I manage my emotions around this situation?' },
  { label: 'Worst case', prompt: 'What\'s the worst-case scenario and how do I prepare for it?' },
  { label: 'Long-term plan', prompt: 'Help me create a long-term plan to resolve this permanently.' },
];

function ChatBubble({ message, isUser }) {
  return (
    <div className={cn('flex gap-2.5 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-indigo-600 text-white rounded-br-md'
          : 'bg-white border border-amber-200 text-slate-700 rounded-bl-md shadow-sm'
      )}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5"
            components={{
              strong: ({ children }) => <strong className="text-amber-700 font-semibold">{children}</strong>,
              a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">{children}</a>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-amber-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function SaintAgentChat({ question }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Build context from question + AI response
  const buildSystemContext = () => {
    const aiResponse = question?.ai_response;
    let context = `You are SaintAgent AI, a wise, balanced, and insightful advisor in the Wisdom Exchange community. You are having an interactive dialogue with a user about their question.

**Question:** ${question.title}
**Category:** ${question.category}
**Description:** ${question.description}
`;

    if (aiResponse) {
      context += `
**Your initial structured analysis was:**
- Core Issue: ${aiResponse.core_issue || 'N/A'}
- Emotional Layer: ${aiResponse.emotional_layer || 'N/A'}
- Practical Advice: ${aiResponse.practical_advice || 'N/A'}
- Strategic View: ${aiResponse.strategic_view || 'N/A'}
- Long-Term Consideration: ${aiResponse.long_term_consideration || 'N/A'}
- Caution Factors: ${aiResponse.caution_factors || 'N/A'}
`;
    }

    context += `
**Guidelines for your responses:**
- Be warm, empathetic, and genuinely helpful
- Provide specific, actionable advice when appropriate
- Ask clarifying questions when the user's situation needs more context
- Reference your initial analysis when relevant
- Use markdown formatting (bold, lists, etc.) for readability
- Keep responses focused and conversational (not overly long)
- Never claim to be a licensed professional — remind users to seek professional help for medical, legal, or financial matters when appropriate
- Speak with wisdom and compassion, not judgment`;

    return context;
  };

  // Initialize welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const hasInsight = !!question?.ai_response;
      const welcome = hasInsight
        ? `I've already shared my initial analysis on your question about **"${question.title}"**. I'm here to dive deeper — feel free to ask follow-up questions, challenge my perspective, or explore specific aspects in more detail.`
        : `I'm ready to help you explore your question about **"${question.title}"**. Ask me anything — I can help you think through different angles, identify practical steps, or just talk things through.`;
      setMessages([{ role: 'assistant', content: welcome }]);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const userMsg = { role: 'user', content: content.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    // Build conversation history for context
    const conversationHistory = updatedMessages.map(m => 
      `${m.role === 'user' ? 'User' : 'SaintAgent AI'}: ${m.content}`
    ).join('\n\n');

    const prompt = `${buildSystemContext()}

**Conversation so far:**
${conversationHistory}

Now respond to the user's latest message. Be conversational and helpful.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setIsOpen(false);
    setTimeout(() => setIsOpen(true), 50);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-amber-900 text-sm">Chat with SaintAgent AI</p>
          <p className="text-xs text-amber-700">Have an interactive dialogue about this question</p>
        </div>
        <Sparkles className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <Card className="border-amber-200 overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-amber-900">SaintAgent AI</CardTitle>
              <p className="text-[10px] text-amber-600">Interactive Wisdom Dialogue</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              onClick={handleReset}
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              onClick={() => setIsOpen(false)}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto p-4 bg-gradient-to-b from-amber-50/30 to-white"
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} isUser={msg.role === 'user'} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Suggested prompts */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-medium">Suggested questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.prompt)}
                className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-amber-100 bg-white">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Ask a follow-up question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[100px] resize-none text-sm border-amber-200 focus-visible:ring-amber-400"
            rows={1}
          />
          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="bg-amber-500 hover:bg-amber-600 shrink-0 h-10 w-10 p-0"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          AI guidance is not a substitute for professional advice
        </p>
      </div>
    </Card>
  );
}