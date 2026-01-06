import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, Send, MessageCircle, Lightbulb, Target, 
  Heart, TrendingUp, AlertCircle, ChevronRight, X,
  RefreshCw, User, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import RankedAvatar from '@/components/reputation/RankedAvatar';

const suggestedQuestions = [
  { icon: Target, text: "Why am I not getting high compatibility matches?", category: "matches" },
  { icon: Heart, text: "How can I improve my chances with someone who values honesty?", category: "tips" },
  { icon: TrendingUp, text: "What should I add to my profile to attract better matches?", category: "profile" },
  { icon: AlertCircle, text: "Why did my match score drop with a specific person?", category: "analysis" },
  { icon: Lightbulb, text: "What conversation starters work best for my personality type?", category: "tips" },
  { icon: User, text: "What attachment styles am I most compatible with?", category: "compatibility" }
];

export default function AIMatchAssistant({ 
  isOpen, 
  onClose, 
  selectedMatch = null,
  className 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['myProfile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.email }),
    enabled: !!user?.email
  });
  const myProfile = myProfiles?.[0];

  const { data: myDatingProfiles = [] } = useQuery({
    queryKey: ['myDatingProfile', user?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: user?.email }),
    enabled: !!user?.email
  });
  const myDatingProfile = myDatingProfiles?.[0];

  const buildContext = () => {
    let context = `You are an AI dating assistant helping users understand their compatibility scores and improve their matches on a spiritual/conscious dating platform.

USER PROFILE:
- Name: ${myProfile?.display_name || 'Unknown'}
- Attachment Style: ${myDatingProfile?.attachment_style || myDatingProfile?.regulation_style || 'Not set'}
- Conflict Style: ${myDatingProfile?.conflict_response || 'Not set'}
- Core Values: ${(myDatingProfile?.core_values_ranked || myProfile?.values_tags || []).join(', ') || 'Not set'}
- Dealbreakers: ${(myDatingProfile?.dealbreakers || []).join(', ') || 'None specified'}
- Seeking: ${(myProfile?.relationship_type_seeking || []).join(', ') || 'Not specified'}
- Communication Preference: ${myDatingProfile?.comm_frequency || 'daily'} check-ins, ${myDatingProfile?.comm_depth || 'balanced'} depth
- Growth Orientation: ${myDatingProfile?.growth_orientation || 'steady'}
- Location Flexibility: ${myDatingProfile?.location_mobility || 'flexible'}
`;

    if (selectedMatch) {
      context += `
SELECTED MATCH TO ANALYZE:
- Name: ${selectedMatch.target_name || 'Unknown'}
- Overall Score: ${selectedMatch.match_score || 0}%
- Spiritual Alignment: ${selectedMatch.spiritual_alignment_score || 'N/A'}%
- Shared Values: ${(selectedMatch.shared_values || []).join(', ') || 'Unknown'}
- AI Reasoning: ${selectedMatch.ai_reasoning || selectedMatch.explanation || 'No analysis available'}
- Conversation Starters: ${(selectedMatch.conversation_starters || []).join('; ') || 'None generated'}
`;
    }

    context += `
COMPATIBILITY DOMAINS (how we calculate match scores):
1. Identity & Values (30%): Core values alignment, life priorities, ethical boundaries
2. Emotional Style (25%): Attachment style compatibility, conflict resolution, stress tolerance
3. Communication (20%): Depth preference, frequency needs, feedback receptivity
4. Growth Orientation (15%): Personal development focus, learning mindset, long-term vision
5. Lifestyle (10%): Location flexibility, daily rhythm, work-life balance

INSTRUCTIONS:
- Be warm, supportive, and insightful
- Give specific, actionable advice
- Reference their actual profile data when relevant
- Explain compatibility concepts in accessible terms
- If asked about a specific match, analyze the compatibility factors
- Suggest profile improvements that align with their authentic self
- Never suggest being inauthentic to get matches
- Keep responses concise but helpful (2-3 paragraphs max)
`;

    return context;
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContext();
      const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}

CONVERSATION HISTORY:
${conversationHistory}

User: ${text}

Provide a helpful, warm response:`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggestions: { 
              type: "array", 
              items: { type: "string" },
              description: "2-3 follow-up questions or actions the user might want to take"
            },
            profile_tips: {
              type: "array",
              items: { type: "string" },
              description: "Specific profile improvements if relevant, otherwise empty"
            }
          }
        }
      });

      const assistantMessage = { 
        role: 'assistant', 
        content: response.response,
        suggestions: response.suggestions || [],
        profile_tips: response.profile_tips || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an issue processing your question. Please try again.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    handleSend(question);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
      className
    )}>
      <Card className="w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-rose-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Match Assistant</CardTitle>
                <p className="text-sm text-slate-500">Get insights on your compatibility</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {selectedMatch && (
            <div className="mt-3 p-3 rounded-lg bg-white/80 border border-slate-200 flex items-center gap-3">
              <RankedAvatar 
                src={selectedMatch.target_avatar} 
                name={selectedMatch.target_name} 
                size={40}
                userId={selectedMatch.target_id}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{selectedMatch.target_name}</p>
                <p className="text-xs text-slate-500">Analyzing this match</p>
              </div>
              <Badge className="bg-violet-100 text-violet-700">{selectedMatch.match_score}% match</Badge>
            </div>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">How can I help?</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Ask me anything about your compatibility, matches, or how to improve your dating profile.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide px-1">
                  Suggested questions
                </p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="w-full p-3 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left flex items-center gap-3 group"
                  >
                    <q.icon className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
                    <span className="text-sm text-slate-700 flex-1">{q.text}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === 'user' 
                      ? "bg-violet-600 text-white" 
                      : msg.isError 
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-slate-100 text-slate-800"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.suggestions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                        <p className="text-xs font-medium text-slate-500">Follow-up:</p>
                        {msg.suggestions.map((s, j) => (
                          <button
                            key={j}
                            onClick={() => handleSend(s)}
                            className="block w-full text-left text-xs p-2 rounded bg-white hover:bg-violet-50 border border-slate-200 text-slate-700"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {msg.profile_tips?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-medium text-emerald-700 mb-1.5 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Profile Tips:
                        </p>
                        <ul className="text-xs space-y-1">
                          {msg.profile_tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span className="text-slate-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-violet-600 animate-spin" />
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about your matches or compatibility..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}