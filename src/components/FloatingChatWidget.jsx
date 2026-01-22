import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Minimize2, Circle, Video, Sparkles, Check, CheckCheck, Paperclip, Move } from "lucide-react";
import DirectVideoCall from "@/components/video/DirectVideoCall";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import IcebreakerPrompts from '@/components/messages/IcebreakerPrompts';
import EmojiPicker from '@/components/messages/EmojiPicker';

export default function FloatingChatWidget({ recipientId, recipientName, recipientAvatar, onClose }) {
  const [message, setMessage] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const scrollRef = useRef(null);
  const typingRef = useRef({ lastSentAt: 0 });
  const queryClient = useQueryClient();

  // Draggable & Resizable state - start docked on left by default
  const [position, setPosition] = useState({ x: 0, y: window.innerHeight - 420 });
  const [size, setSize] = useState({ width: 320, height: 384 });
  const [dockedSide, setDockedSide] = useState('left'); // 'left' | 'right' | null - default docked left
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef({ isResizing: false, startX: 0, startY: 0, startW: 0, startH: 0, edge: '' });

  // Use refs to avoid stale closures
  const positionRef = useRef(position);
  const sizeRef = useRef(size);
  positionRef.current = position;
  sizeRef.current = size;

  // Drag handlers
  const onDragStart = (e) => {
    e.preventDefault();
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, startPosX: positionRef.current.x, startPosY: positionRef.current.y };
    setDockedSide(null); // Undock when starting to drag
    
    const handleMove = (moveE) => {
      if (!dragRef.current.isDragging) return;
      const dx = moveE.clientX - dragRef.current.startX;
      const dy = moveE.clientY - dragRef.current.startY;
      const newX = Math.max(0, Math.min(window.innerWidth - sizeRef.current.width, dragRef.current.startPosX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, dragRef.current.startPosY + dy));
      setPosition({ x: newX, y: newY });
      positionRef.current = { x: newX, y: newY };
    };
    
    const handleUp = () => {
      dragRef.current.isDragging = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      // Check if should dock to side
      const DOCK_THRESHOLD = 50;
      const currentX = positionRef.current.x;
      if (currentX < DOCK_THRESHOLD) {
        setDockedSide('left');
      } else if (currentX > window.innerWidth - sizeRef.current.width - DOCK_THRESHOLD) {
        setDockedSide('right');
      } else {
        setDockedSide(null);
      }
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  // Resize handlers
  const onResizeStart = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { isResizing: true, startX: e.clientX, startY: e.clientY, startW: size.width, startH: size.height, startPosX: position.x, startPosY: position.y, edge };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
  };
  const onResizeMove = (e) => {
    if (!resizeRef.current.isResizing) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    const edge = resizeRef.current.edge;
    let newW = resizeRef.current.startW;
    let newH = resizeRef.current.startH;
    let newX = position.x;
    let newY = position.y;

    if (edge.includes('e')) newW = Math.max(280, resizeRef.current.startW + dx);
    if (edge.includes('w')) {
      newW = Math.max(280, resizeRef.current.startW - dx);
      newX = resizeRef.current.startPosX + dx;
    }
    if (edge.includes('s')) newH = Math.max(300, resizeRef.current.startH + dy);
    if (edge.includes('n')) {
      newH = Math.max(300, resizeRef.current.startH - dy);
      newY = resizeRef.current.startPosY + dy;
    }

    setSize({ width: newW, height: newH });
    if (edge.includes('w') || edge.includes('n')) {
      setPosition({ x: newX, y: newY });
    }
  };
  const onResizeEnd = () => {
    resizeRef.current.isResizing = false;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
  };

  // Cleanup handled inside handlers now

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

  // Mark messages as read when viewing
  useEffect(() => {
    const unread = conversationMessages.filter(m => 
      m.to_user_id === user?.email && !m.is_read
    );
    unread.forEach(m => {
      base44.entities.Message.update(m.id, { is_read: true, read_at: new Date().toISOString() });
    });
  }, [conversationMessages.length, user?.email]);

  // Typing indicator
  const sendTypingPing = async () => {
    const now = Date.now();
    const convId = [user?.email, recipientId].sort().join('_');
    if (!convId || !user?.email) return;
    if (now - (typingRef.current.lastSentAt || 0) < 1200) return;
    typingRef.current.lastSentAt = now;
    const existing = await base44.entities.TypingStatus.filter({ user_id: user.email, conversation_id: convId });
    if (existing?.[0]) {
      await base44.entities.TypingStatus.update(existing[0].id, { is_typing: true });
    } else {
      await base44.entities.TypingStatus.create({ user_id: user.email, conversation_id: convId, is_typing: true });
    }
    setTimeout(async () => {
      const ex = await base44.entities.TypingStatus.filter({ user_id: user.email, conversation_id: convId });
      if (ex?.[0]) await base44.entities.TypingStatus.update(ex[0].id, { is_typing: false });
    }, 3000);
  };

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
      <div className="fixed bottom-4 right-[400px] z-[150]">
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

  const dockedStyle = dockedSide === 'left' 
    ? { left: 0, top: position.y, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
    : dockedSide === 'right'
    ? { right: 0, left: 'auto', top: position.y, borderTopRightRadius: 0, borderBottomRightRadius: 0 }
    : { left: position.x, top: position.y };

  return (
    <div 
      className={cn(
        "fixed bg-white shadow-2xl border border-slate-200 z-[150] flex flex-col overflow-hidden",
        dockedSide ? "rounded-lg" : "rounded-lg"
      )}
      style={{ ...dockedStyle, width: size.width, height: size.height }}
    >
      {/* Resize handles */}
      <div onMouseDown={(e) => onResizeStart(e, 'n')} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 's')} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 'e')} className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 'w')} className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 'nw')} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 'ne')} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" />
      <div onMouseDown={(e) => onResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" />

      {/* Header - Draggable */}
      <div 
        className="flex items-center justify-between p-3 border-b bg-violet-600 rounded-t-lg cursor-move shrink-0"
        onMouseDown={onDragStart}
      >
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
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMinimized(true)}
            className="h-7 w-7 text-white hover:bg-violet-700"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 text-white hover:bg-violet-700"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          {conversationMessages.length === 0 && (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Start the conversation!</p>
              <p className="text-xs text-slate-400 mt-1">Send an icebreaker to break the ice</p>
            </div>
          )}
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
                    {msg.message_type === 'icebreaker' && (
                      <div className={cn("flex items-center gap-1 text-[10px] mb-1", isOwn ? "text-white/70" : "text-violet-500")}>
                        <Sparkles className="w-3 h-3" />
                        Icebreaker
                      </div>
                    )}
                    {msg.message_type === 'image' && msg.media_url && (
                      <img src={msg.media_url} alt="" className="rounded mb-1 max-w-full" />
                    )}
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-slate-400">
                      {format(parseISO(msg.created_date), 'h:mm a')}
                    </span>
                    {isOwn && (
                      msg.is_read 
                        ? <CheckCheck className="w-3 h-3 text-emerald-500" />
                        : <Check className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2 items-center">
          <IcebreakerPrompts
            recipientName={recipientName}
            onSelect={async (prompt) => {
              sendMutation.mutate({
                from_user_id: user.email,
                to_user_id: recipientId,
                from_name: user.full_name,
                to_name: recipientName,
                from_avatar: user.avatar_url,
                to_avatar: recipientAvatar,
                content: prompt,
                message_type: 'icebreaker',
                icebreaker_prompt: prompt
              });
            }}
          />
          <EmojiPicker onSelect={(emoji) => setMessage((prev) => prev + emoji)} />
          <Input
            value={message}
            onChange={(e) => { setMessage(e.target.value); sendTypingPing(); }}
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