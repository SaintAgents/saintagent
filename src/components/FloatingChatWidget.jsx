import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Minimize2, Circle, Video, Sparkles, Check, CheckCheck, Paperclip } from "lucide-react";
import DirectVideoCall from "@/components/video/DirectVideoCall";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import IcebreakerPrompts from '@/components/messages/IcebreakerPrompts';

export default function FloatingChatWidget({ recipientId, recipientName, recipientAvatar, onClose }) {
  const [message, setMessage] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Poll for new messages every 2s for real-time feel
  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
    refetchInterval: 2000
  });

  // Check if recipient is online
  const { data: recipientStatus } = useQuery({
    queryKey: ['recipientStatus', recipientId],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: recipientId });
      return profiles?.[0];
    },
    enabled: !!recipientId,
    refetchInterval: 10000
  });

  const isRecipientOnline = recipientStatus?.last_seen_at && 
    new Date(recipientStatus.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessage('');
    }
  });

  const conversationMessages = allMessages
    .filter(m => 
      (m.from_user_id === user?.email && m.to_user_id === recipientId) ||
      (m.from_user_id === recipientId && m.to_user_id === user?.email)
    )
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationMessages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMutation.mutate({
      from_user_id: user.email,
      to_user_id: recipientId,
      from_name: user.full_name,
      to_name: recipientName,
      from_avatar: user.avatar_url,
      to_avatar: recipientAvatar,
      content: message
    });
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg"
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback>{recipientName?.[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{recipientName}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-violet-600 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName?.[0]}</AvatarFallback>
            </Avatar>
            <span className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-violet-600",
              isRecipientOnline ? "bg-emerald-500" : "bg-slate-400"
            )} />
          </div>
          <div>
            <span className="font-medium text-white text-sm">{recipientName}</span>
            <p className="text-xs text-white/70">
              {isRecipientOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setVideoCallOpen(true)}
            className="h-7 w-7 text-white hover:bg-violet-700"
            title="Start video call"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMinimized(true)}
            className="h-7 w-7 text-white hover:bg-violet-700"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 text-white hover:bg-violet-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {conversationMessages.map((msg) => {
            const isOwn = msg.from_user_id === user?.email;
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarImage src={isOwn ? msg.from_avatar : msg.from_avatar} />
                  <AvatarFallback>{msg.from_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-3 py-2 rounded-lg text-sm ${
                    isOwn 
                      ? 'bg-violet-600 text-white rounded-br-sm' 
                      : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-400 mt-1">
                    {format(parseISO(msg.created_date), 'h:mm a')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-9"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="h-9 w-9 bg-violet-600 hover:bg-violet-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Call Overlay */}
      {videoCallOpen && (
        <div className={cn(
          "fixed z-[60]",
          videoFullscreen ? "inset-0" : "bottom-4 right-4 w-[600px] h-[450px]"
        )}>
          <DirectVideoCall
            recipientId={recipientId}
            recipientName={recipientName}
            recipientAvatar={recipientAvatar}
            user={user}
            onClose={() => setVideoCallOpen(false)}
            isFullscreen={videoFullscreen}
            onToggleFullscreen={() => setVideoFullscreen(!videoFullscreen)}
          />
        </div>
      )}
    </div>
  );
}