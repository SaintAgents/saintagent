import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Users,
  Globe,
  GripHorizontal
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: 16, y: null }); // x from left, y from bottom
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Initialize position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('globalChatPosition');
      if (saved) {
        setPosition(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Save position to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('globalChatPosition', JSON.stringify(position));
    } catch {}
  }, [position]);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: position.x,
      startPosY: position.y ?? (window.innerHeight - 60)
    };
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    const newX = Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.startPosX + dx));
    const newY = Math.max(60, Math.min(window.innerHeight - 60, dragRef.current.startPosY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfileForChat', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  // Global chat uses a special circle_id = 'global'
  const { data: messages = [] } = useQuery({
    queryKey: ['globalChatMessages'],
    queryFn: () => base44.entities.CircleMessage.filter({ circle_id: 'global' }, '-created_date', 50),
    enabled: isOpen,
    refetchInterval: isOpen ? 3000 : false
  });

  // Count online users
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['onlineUsersGlobalChat'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('-last_seen_at', 100);
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      return profiles.filter(p => p.last_seen_at && new Date(p.last_seen_at) > fiveMinAgo);
    },
    enabled: isOpen,
    refetchInterval: 10000
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.CircleMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalChatMessages'] });
      setMessage('');
    }
  });

  const handleSend = () => {
    if (!message.trim() || !user) return;
    sendMutation.mutate({
      circle_id: 'global',
      author_id: user.email,
      author_name: userProfile?.display_name || user.full_name,
      author_avatar: userProfile?.avatar_url,
      content: message.trim(),
      message_type: 'text'
    });
  };

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  const bottomPos = position.y ? `${window.innerHeight - position.y}px` : '16px';

  // Floating button when closed
  if (!isOpen) {
    return (
      <div
        className="fixed z-50"
        style={{ left: position.x, top: position.y ?? undefined, bottom: position.y ? undefined : 16 }}
      >
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className={cn(
            "flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg transition-all",
            isDragging ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-105"
          )}
        >
          <GripHorizontal className="w-4 h-4 opacity-60" />
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium">Global Chat</span>
            {onlineUsers.length > 0 && (
              <Badge className="bg-emerald-500 text-white text-xs px-1.5">
                {onlineUsers.length}
              </Badge>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col",
        isExpanded 
          ? "inset-4 top-20" 
          : "w-80 h-96"
      )}
      style={isExpanded ? {} : { left: position.x, top: position.y ?? undefined, bottom: position.y ? undefined : 16 }}
    >
      {/* Header - Draggable */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-white/60" />
          <Globe className="w-5 h-5 text-white" />
          <div>
            <h3 className="font-medium text-white text-sm">Global Chat</h3>
            <p className="text-xs text-white/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {onlineUsers.length} online
            </p>
          </div>
        </div>
        <div className="flex gap-1" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 text-white hover:bg-white/20"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Online Users Bar */}
      <div className="px-3 py-2 border-b bg-slate-50 flex items-center gap-2 overflow-x-auto">
        <Users className="w-4 h-4 text-slate-400 shrink-0" />
        {onlineUsers.slice(0, 10).map(u => (
          <div key={u.id} className="relative shrink-0" data-user-id={u.user_id}>
            <Avatar className="w-6 h-6 cursor-pointer">
              <AvatarImage src={u.avatar_url} />
              <AvatarFallback className="text-xs">{u.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
          </div>
        ))}
        {onlineUsers.length > 10 && (
          <span className="text-xs text-slate-500">+{onlineUsers.length - 10}</span>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {sortedMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            sortedMessages.map((msg, idx) => {
              const isOwn = msg.author_id === user?.email;
              const showAvatar = idx === 0 || sortedMessages[idx - 1]?.author_id !== msg.author_id;
              
              return (
                <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                  {showAvatar ? (
                    <Avatar className="w-7 h-7 shrink-0 cursor-pointer" data-user-id={msg.author_id}>
                      <AvatarImage src={msg.author_avatar} />
                      <AvatarFallback className="text-xs">{msg.author_name?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-7 shrink-0" />
                  )}
                  <div className={cn("max-w-[70%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                    {showAvatar && !isOwn && (
                      <span className="text-xs text-slate-500 mb-0.5 cursor-pointer hover:text-blue-600" data-user-id={msg.author_id}>
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
            placeholder="Say something..."
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