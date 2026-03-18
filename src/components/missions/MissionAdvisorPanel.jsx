import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { 
  BrainCircuit, Send, Loader2, Lightbulb, AlertTriangle, 
  ArrowRight, RefreshCcw, Zap
} from 'lucide-react';
import { computeMissionProgress } from './MissionTaskTracker';

function buildMissionContext(mission) {
  const { completedCount, totalCount, percent } = computeMissionProgress(mission);
  
  let ctx = `## Mission: ${mission.title}\n`;
  ctx += `**Objective:** ${mission.objective}\n`;
  if (mission.description) ctx += `**Description:** ${mission.description.slice(0, 800)}\n`;
  ctx += `**Status:** ${mission.status} | **Progress:** ${completedCount}/${totalCount} tasks (${Math.round(percent)}%)\n`;
  ctx += `**Type:** ${mission.mission_type} | **Participants:** ${mission.participant_count || 0}\n\n`;

  if (mission.milestones?.length > 0) {
    ctx += `## Milestones\n`;
    mission.milestones
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((m, i) => {
        const tasks = m.tasks || [];
        const done = tasks.filter(t => (t.status === 'completed') || t.completed).length;
        ctx += `\n### ${i + 1}. ${m.title || 'Untitled Milestone'} ${m.completed ? '✅' : `(${done}/${tasks.length} tasks done)`}\n`;
        if (m.description) ctx += `${m.description}\n`;
        if (m.due_date) ctx += `Due: ${m.due_date}\n`;
        tasks.forEach(t => {
          const status = t.status || (t.completed ? 'completed' : 'todo');
          const icon = status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '⬜';
          ctx += `  ${icon} ${t.title} [${status}]\n`;
        });
      });
  }

  if (mission.tasks?.length > 0) {
    ctx += `\n## Top-Level Tasks\n`;
    mission.tasks.forEach(t => {
      const status = t.status || (t.completed ? 'completed' : 'todo');
      const icon = status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '⬜';
      ctx += `${icon} ${t.title} [${status}]\n`;
    });
  }

  if (mission.roles_needed?.length > 0) {
    ctx += `\n**Roles Needed:** ${mission.roles_needed.join(', ')}\n`;
  }

  return ctx;
}

const QUICK_PROMPTS = [
  { label: 'Next Steps', icon: ArrowRight, prompt: 'What should I focus on next? Suggest the top 3 most impactful next steps.' },
  { label: 'Blockers', icon: AlertTriangle, prompt: 'Are there any potential blockers or risks I should watch out for? What tasks might be stalled?' },
  { label: 'Dependencies', icon: Zap, prompt: 'Analyze the task dependencies. Which tasks need to be done before others? Are any out of order?' },
  { label: 'Full Review', icon: Lightbulb, prompt: 'Give me a full progress review: what\'s going well, what needs attention, and a prioritized action plan.' },
];

export default function MissionAdvisorPanel({ mission }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const scrollRef = useRef(null);

  // Initialize or reset conversation when mission changes
  useEffect(() => {
    setMessages([]);
    setConversation(null);
  }, [mission?.id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const missionContext = buildMissionContext(mission);
    const fullPrompt = `Here is the current mission state:\n\n${missionContext}\n\n---\n\nUser question: ${text}`;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let conv = conversation;
    if (!conv) {
      conv = await base44.agents.createConversation({
        agent_name: 'mission_advisor',
        metadata: { name: `Advisor: ${mission.title}` }
      });
      setConversation(conv);
    }

    // Subscribe to streaming updates
    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      const agentMsgs = (data.messages || []).filter(m => m.role === 'assistant');
      if (agentMsgs.length > 0) {
        const latest = agentMsgs[agentMsgs.length - 1];
        setMessages(prev => {
          const withoutStreaming = prev.filter(m => m._streaming !== true);
          return [...withoutStreaming, { role: 'assistant', content: latest.content, tool_calls: latest.tool_calls }];
        });
      }
    });

    // Show streaming placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', _streaming: true }]);

    await base44.agents.addMessage(conv, { role: 'user', content: fullPrompt });

    // Give a moment for final response then unsubscribe
    setTimeout(() => {
      unsubscribe();
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const handleReset = () => {
    setMessages([]);
    setConversation(null);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-violet-50 to-purple-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-sm text-slate-900">Mission Advisor</h3>
          <Badge variant="outline" className="text-[10px] bg-white">AI Agent</Badge>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1">
            <RefreshCcw className="w-3 h-3" /> Reset
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <BrainCircuit className="w-12 h-12 text-violet-300 mb-3" />
            <h4 className="font-semibold text-slate-700 mb-1">Mission Advisor</h4>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">
              I analyze your mission progress and suggest next steps, dependencies, and blockers.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_PROMPTS.map((qp) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={qp.label}
                    onClick={() => handleQuickPrompt(qp.prompt)}
                    disabled={loading}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-all",
                      "bg-white hover:bg-violet-50 hover:border-violet-300 text-slate-700",
                      "disabled:opacity-50"
                    )}
                  >
                    <Icon className="w-4 h-4 text-violet-500 shrink-0" />
                    {qp.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.filter(m => !m._streaming || m.content).map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5",
                  msg.role === 'user' 
                    ? "bg-violet-600 text-white" 
                    : "bg-white border border-slate-200"
                )}>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : msg.content ? (
                    <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                      <span className="text-sm text-slate-500">Analyzing mission...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && !messages.some(m => m._streaming) && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Quick prompts when in conversation */}
      {messages.length > 0 && !loading && (
        <div className="px-4 py-2 border-t bg-slate-50 flex gap-1.5 overflow-x-auto shrink-0">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => handleQuickPrompt(qp.prompt)}
              className="px-2.5 py-1 rounded-full border bg-white text-[10px] font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-all whitespace-nowrap shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t bg-white shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about next steps, blockers, priorities..."
            disabled={loading}
            className="flex-1 text-sm"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-700 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </Card>
  );
}