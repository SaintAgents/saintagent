import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Send, Video, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import TownHallCall from '@/components/video/TownHallCall';

export default function SidePanelGlobalChat() {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [townHallOpen, setTownHallOpen] = useState(false);
  const [townHallFullscreen, setTownHallFullscreen] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

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

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['globalChatMessages'],
    queryFn: () => base44.entities.CircleMessage.filter({ circle_id: 'global' }, '-created_date', 50),
    enabled: expanded,
    refetchInterval: expanded ? 3000 : false
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

  const sortedMessages = [...chatMessages].sort((a, b) =>
    new Date(a.created_date) - new Date(b.created_date)
  );

  useEffect(() => {
    if (scrollRef.current && expanded) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
      else scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, expanded]);

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-[rgba(0,255,136,0.2)] bg-white dark:bg-[#050505] overflow-hidden">
        {/* Header - clickable to expand/collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Global Chat</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <>
            {/* Messages */}
            <ScrollArea className="h-64 p-3" ref={scrollRef}>
              <div className="space-y-3">
                {sortedMessages.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  sortedMessages.map((msg, idx) => {
                    const isOwn = msg.author_id === user?.email;
                    const showAvatar = idx === 0 || sortedMessages[idx - 1]?.author_id !== msg.author_id;
                    return (
                      <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                        {showAvatar ? (
                          <Avatar className="w-6 h-6 shrink-0 cursor-pointer" data-user-id={msg.author_id}>
                            <AvatarImage src={msg.author_avatar} />
                            <AvatarFallback className="text-[10px]">{msg.author_name?.[0]}</AvatarFallback>
                          </Avatar>
                        ) : <div className="w-6 shrink-0" />}
                        <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                          {showAvatar && !isOwn && (
                            <span className="text-[10px] text-slate-500 mb-0.5 cursor-pointer hover:text-blue-600" data-user-id={msg.author_id}>
                              {msg.author_name}
                            </span>
                          )}
                          <div className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs",
                            isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-sm"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5">
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
            <div className="p-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTownHallOpen(true)}
                  className="h-8 w-8 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shrink-0"
                  title="Join Community Call"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Say something..."
                  className="flex-1 h-8 text-xs"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  size="icon"
                  className="h-8 w-8 bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Town Hall Video Call */}
      {townHallOpen && (
        <div className={cn("fixed z-[70]", townHallFullscreen ? "inset-0" : "bottom-4 left-4 w-[800px] h-[600px]")}>
          <TownHallCall
            user={user}
            onClose={() => setTownHallOpen(false)}
            isFullscreen={townHallFullscreen}
            onToggleFullscreen={() => setTownHallFullscreen(!townHallFullscreen)}
          />
        </div>
      )}
    </>
  );
}