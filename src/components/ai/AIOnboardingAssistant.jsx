import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIOnboardingAssistant({ currentStep, stepTitle, userGoals = [] }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome! I'm your AI guide. I'm here to help you get the most out of SaintAgent based on your goals. What brings you to the platform today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Provide contextual guidance when step changes
  useEffect(() => {
    if (currentStep > 0 && messages.length === 1) {
      const contextualHelp = getStepGuidance(currentStep, stepTitle, userGoals);
      if (contextualHelp) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: contextualHelp
        }]);
      }
    }
  }, [currentStep]);

  const getStepGuidance = (step, title, goals) => {
    const guidanceMap = {
      1: "Great! Let's set up your identity. Choose a display name that reflects how you want to be known in the community. Your handle will be your unique identifier.",
      2: "Time to add your mystical profile! This helps us find deeper connections based on spiritual alignment. Don't worry—this is optional and can be updated anytime.",
      3: "Where are you based? This helps connect you with local circles and regional events.",
      4: "Values are your compass. Select what matters most to you—this powers our matching algorithm.",
      5: "What skills do you bring? And which are you seeking to develop? This creates powerful collaboration opportunities.",
      6: "What are your current desires and goals on the platform? Be specific—this shapes your entire experience.",
      7: "What do you hope to achieve in the next 30-90 days? Your hopes guide the missions and opportunities we surface."
    };
    return guidanceMap[step] || `Let me know if you need help with ${title || 'this step'}!`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
      
      const prompt = `You are an AI onboarding assistant for SaintAgent, a conscious collaboration platform.

Current onboarding step: ${currentStep} - ${stepTitle}
User's stated goals: ${userGoals.join(', ') || 'Not specified yet'}

Conversation so far:
${conversationHistory}
user: ${userMessage}

Provide helpful, concise guidance (2-3 sentences max) about:
- How to complete the current step effectively
- Why this information matters for their experience
- Quick tips relevant to their goals

Keep it friendly, supportive, and specific to SaintAgent's features.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI assistant error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. But don't worry—you can always reach out to support or explore the Help section!" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group hover:scale-110"
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 shadow-2xl border-violet-200">
      <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-t-lg pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-white">AI Guide</CardTitle>
              <p className="text-xs text-violet-100">Here to help you</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 h-7 w-7 p-0"
          >
            <span className="text-lg">−</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-2",
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-violet-600" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-900'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-violet-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-200 bg-white rounded-b-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">
            AI-powered guidance tailored to your goals
          </p>
        </div>
      </CardContent>
    </Card>
  );
}