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
  GripHorizontal,
  Video,
  Radio
} from "lucide-react";
import TownHallCall from "@/components/video/TownHallCall";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState({ x: null, y: 280 }); // y from top
  const [dockedSide, setDockedSide] = useState('right'); // 'left' | 'right' | null
  const [size, setSize] = useState({ width: 320, height: 384 });
  const [isDragging, setIsDragging] = useState(false);
  const [townHallOpen, setTownHallOpen] = useState(false);
  const [townHallFullscreen, setTownHallFullscreen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const lastMessageCountRef = useRef(0);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef({ isResizing: false, startX: 0, startY: 0, startW: 0, startH: 0, edge: '' });
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  
  // Button dragging refs
  const buttonDragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const buttonDraggingRef = useRef(false);
  const buttonDraggedRef = useRef(false);

  // Initialize position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('globalChatPosition');
      if (saved) {
        const pos = JSON.parse(saved);
        setPosition({ x: pos.x, y: pos.y ?? 280 });
        setDockedSide(pos.dockedSide ?? 'right');
      }
    } catch {}
  }, []);

  // Save position to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('globalChatPosition', JSON.stringify({ ...position, dockedSide }));
    } catch {}
  }, [position, dockedSide]);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDockedSide(null); // Undock when starting to drag
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // Get current element position for initial drag
    const el = e.currentTarget.closest('.fixed');
    const rect = el?.getBoundingClientRect();
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPosX: position.x ?? rect?.left ?? (window.innerWidth - size.width),
      startPosY: position.y ?? rect?.top ?? 280
    };
    // Initialize position if not set
    if (position.x === null) {
      setPosition({ x: dragRef.current.startPosX, y: dragRef.current.startPosY });
    }
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
    const newX = Math.max(0, Math.min(window.innerWidth - 20, dragRef.current.startPosX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 20, dragRef.current.startPosY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
    
    // Check if should dock to side
    const DOCK_THRESHOLD = 50;
    const panelWidth = size.width;
    const currentX = position.x;
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

  // Resize handlers
  const onResizeStart = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { 
      isResizing: true, 
      startX: e.clientX, 
      startY: e.clientY, 
      startW: size.width, 
      startH: size.height,
      startPosX: position.x,
      startPosY: position.y,
      edge 
    };
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
      newY = (resizeRef.current.startPosY ?? (window.innerHeight - 16 - resizeRef.current.startH)) + dy;
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

  // Button drag handlers (when closed)
  const handleButtonDragStart = (e) => {
    e.preventDefault();
    buttonDraggingRef.current = true;
    buttonDraggedRef.current = false;
    setDockedSide(null); // Undock when starting to drag
    const startX = position.x ?? (window.innerWidth - 100);
    const startY = position.y ?? (window.innerHeight - 60);
    buttonDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: startX,
      startPosY: startY
    };
    if (position.x === null) {
      setPosition({ x: startX, y: startY });
    }
    
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
      // Check if should dock
      const DOCK_THRESHOLD = 50;
      const currentX = position.x;
      const currentY = position.y;
      if (currentX !== null && currentY !== null) {
        if (currentX < DOCK_THRESHOLD && currentY > window.innerHeight - 100) {
          setDockedSide('left');
        } else if (currentX > window.innerWidth - 150 && currentY > window.innerHeight - 100) {
          setDockedSide('right');
        }
      }
      setTimeout(() => { buttonDraggedRef.current = false; }, 50);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
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

  // Chat button - starts bottom right, draggable
  if (!isOpen) {
    return (
      <div
        className="fixed z-50"
        style={{ 
          right: dockedSide === 'right' ? 16 : 'auto',
          left: dockedSide === 'left' ? 16 : (dockedSide === null ? position.x : 'auto'),
          bottom: dockedSide ? 16 : 'auto',
          top: dockedSide === null ? position.y : 'auto'
        }}
      >
        <div
          onMouseDown={handleButtonDragStart}
          onClick={() => {
            if (!buttonDraggedRef.current) setIsOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all cursor-pointer hover:scale-105 rounded-full"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">Chat</span>
          {onlineUsers.length > 0 && (
            <Badge className="bg-emerald-500 text-white text-[10px] px-1 py-0 h-4 min-w-4">
              {onlineUsers.length}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed z-50 bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden",
        isExpanded && "inset-4 top-20",
        dockedSide === 'right' ? "rounded-l-lg rounded-r-none" : dockedSide === 'left' ? "rounded-r-lg rounded-l-none" : "rounded-lg"
      )}
      style={isExpanded ? {} : { 
        right: dockedSide === 'right' ? 0 : 'auto',
        left: dockedSide === 'left' ? 0 : (dockedSide === null ? position.x : 'auto'),
        top: position.y ?? 280,
        width: size.width,
        height: size.height
      }}
    >
      {/* Resize handles - only show when not expanded */}
      {!isExpanded && (
        <>
          <div onMouseDown={(e) => onResizeStart(e, 'n')} className="absolute top-0 left-2 right-2 h-1 cursor-n-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 's')} className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 'e')} className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 'w')} className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 'nw')} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 'ne')} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10" />
          <div onMouseDown={(e) => onResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10" />
        </>
      )}
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
            onClick={() => setTownHallOpen(true)}
            className="h-7 w-7 text-white hover:bg-white/20"
            title="Join Town Hall Video"
          >
            <Video className="w-4 h-4" />
          </Button>
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTownHallOpen(true)}
            className="h-9 w-9 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shrink-0"
            title="Join Community Call"
          >
            <Video className="w-4 h-4 text-emerald-600" />
          </Button>
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

      {/* Town Hall Video Call */}
      {townHallOpen && (
        <div className={cn(
          "fixed z-[60]",
          townHallFullscreen ? "inset-0" : "bottom-4 left-4 w-[800px] h-[600px]"
        )}>
          <TownHallCall
            user={user}
            onClose={() => setTownHallOpen(false)}
            isFullscreen={townHallFullscreen}
            onToggleFullscreen={() => setTownHallFullscreen(!townHallFullscreen)}
          />
        </div>
      )}
    </div>
  );
}