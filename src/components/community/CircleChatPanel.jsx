import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, X, Maximize2, Minimize2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function CircleChatPanel({ circle, user, onClose, expanded = false, onToggleExpand }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch circle messages with polling for real-time feel
  const { data: messages = [] } = useQuery({
    queryKey: ['circleMessages', circle?.id],
    queryFn: () => base44.entities.CircleMessage.filter({ circle_id: circle.id }, '-created_date', 100),
    enabled: !!circle?.id,
    refetchInterval: 3000 // Poll every 3 seconds for new messages
  });

  // Fetch member profiles
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['circleMemberProfiles', circle?.id],
    queryFn: async () => {
      if (!circle?.member_ids?.length) return [];
      const profiles = await base44.entities.UserProfile.list('-updated_date', 200);
      return profiles.filter(p => circle.member_ids.includes(p.user_id));
    },
    enabled: !!circle?.member_ids?.length
  });

  // Online members (active in last 5 min)
  const onlineMembers = memberProfiles.filter(p => {
    if (!p.last_seen_at) return false;
    return new Date(p.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.CircleMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circleMessages', circle?.id] });
      setMessage('');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({
      circle_id: circle.id,
      author_id: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: message.trim(),
      message_type: 'text'
    });
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  return (
    <div className={cn(
      "flex flex-col bg-white rounded-lg border shadow-lg",
      expanded ? "fixed inset-4 z-50" : "h-[400px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">{circle?.name}</h3>
            <p className="text-xs text-white/70">{onlineMembers.length} online • {circle?.member_count} members</p>
          </div>
        </div>
        <div className="flex gap-1">
          {onToggleExpand && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleExpand}
              className="h-7 w-7 text-white hover:bg-white/20"
            >
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Online Members Bar */}
      {onlineMembers.length > 0 && (
        <div className="px-3 py-2 border-b bg-slate-50 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 shrink-0">Online:</span>
          {onlineMembers.slice(0, 8).map(member => (
            <div key={member.id} className="flex items-center gap-1 shrink-0">
              <div className="relative">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="text-xs">{member.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              </div>
            </div>
          ))}
          {onlineMembers.length > 8 && (
            <span className="text-xs text-slate-500">+{onlineMembers.length - 8}</span>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {sortedMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            sortedMessages.map((msg, idx) => {
              const isOwn = msg.author_id === user?.email;
              const showAvatar = idx === 0 || sortedMessages[idx - 1]?.author_id !== msg.author_id;
              
              return (
                <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                  {showAvatar ? (
                    <Avatar className="w-8 h-8 shrink-0 cursor-pointer" data-user-id={msg.author_id}>
                      <AvatarImage src={msg.author_avatar} />
                      <AvatarFallback className="text-xs">{msg.author_name?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                  <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                    {showAvatar && !isOwn && (
                      <span className="text-xs text-slate-500 mb-0.5 cursor-pointer hover:text-violet-600" data-user-id={msg.author_id}>
                        {msg.author_name}
                      </span>
                    )}
                    <div className={cn(
                      "px-3 py-2 rounded-lg text-sm",
                      isOwn
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-900 rounded-bl-sm"
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
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-9"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            className="h-9 w-9 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}