import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { 
  Send, Bot, User, Check, CheckCheck, Clock, AlertTriangle, 
  ThumbsUp, ThumbsDown, Sparkles, RotateCcw
} from 'lucide-react';

export default function WAMessageThread({ 
  contact, messages = [], onSendMessage, onApproveDraft, onRejectDraft, onGenerateAI 
}) {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a contact to view messages</p>
        </div>
      </div>
    );
  }

  const sorted = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const statusIcon = (status) => {
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-slate-400" />;
    if (status === 'sent') return <Check className="w-3 h-3 text-slate-400" />;
    if (status === 'failed') return <AlertTriangle className="w-3 h-3 text-red-500" />;
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
            {(contact.name || contact.phone)?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 text-sm">{contact.name || contact.phone}</p>
          <p className="text-xs text-slate-500">{contact.phone}</p>
        </div>
        <div className="flex gap-2">
          {contact.lead_score > 0 && (
            <Badge className="bg-violet-100 text-violet-700">Score: {contact.lead_score}</Badge>
          )}
          {contact.sentiment && contact.sentiment !== 'unknown' && (
            <Badge variant="outline" className={cn("text-xs",
              contact.sentiment === 'positive' && 'border-emerald-300 text-emerald-600',
              contact.sentiment === 'negative' && 'border-red-300 text-red-600'
            )}>
              {contact.sentiment}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {sorted.map(msg => (
          <div key={msg.id} className={cn("flex", msg.direction === 'outbound' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-2.5 relative",
              msg.direction === 'outbound' 
                ? "bg-emerald-600 text-white rounded-br-md" 
                : "bg-white border rounded-bl-md text-slate-900"
            )}>
              {msg.ai_generated && (
                <div className={cn("flex items-center gap-1 mb-1 text-[10px]",
                  msg.direction === 'outbound' ? 'text-emerald-200' : 'text-violet-500'
                )}>
                  <Bot className="w-3 h-3" /> AI Generated
                  {msg.ai_confidence && <span>({msg.ai_confidence}%)</span>}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.intent && (
                <Badge variant="outline" className={cn("mt-1.5 text-[10px] px-1 py-0",
                  msg.direction === 'outbound' ? 'border-emerald-400 text-emerald-200' : 'border-slate-300'
                )}>
                  {msg.intent}
                </Badge>
              )}
              <div className={cn("flex items-center gap-1 mt-1 text-[10px]",
                msg.direction === 'outbound' ? 'text-emerald-200 justify-end' : 'text-slate-400'
              )}>
                {msg.created_date && format(new Date(msg.created_date), 'HH:mm')}
                {msg.direction === 'outbound' && statusIcon(msg.status)}
              </div>

              {/* Pending Review Actions */}
              {msg.status === 'pending_review' && msg.ai_draft && (
                <div className="mt-2 pt-2 border-t border-amber-300/30">
                  <p className="text-xs text-amber-200 mb-2 font-medium">AI Draft — needs approval:</p>
                  <p className="text-sm bg-amber-500/20 rounded p-2 mb-2">{msg.ai_draft}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onApproveDraft(msg)} className="h-7 text-xs bg-white text-emerald-700 hover:bg-emerald-50 gap-1">
                      <ThumbsUp className="w-3 h-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onRejectDraft(msg)} className="h-7 text-xs border-white/30 text-white hover:bg-white/10 gap-1">
                      <ThumbsDown className="w-3 h-3" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onGenerateAI(contact)}
            title="Generate AI reply"
            className="shrink-0"
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
          </Button>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim()} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}