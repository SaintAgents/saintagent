import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  X,
  Users,
  MessageSquare,
  MonitorUp,
  PhoneOff,
  Maximize2,
  Minimize2,
  Send,
  Wifi,
  Globe,
  Sparkles,
  Radio
} from "lucide-react";

export default function TownHallCall({ 
  user, 
  onClose, 
  isFullscreen = false,
  onToggleFullscreen 
}) {
  const [micOn, setMicOn] = useState(false); // Muted by default for Town Hall
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const queryClient = useQueryClient();

  // Fetch online users as "participants"
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['townHallParticipants'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('-last_seen_at', 50);
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      return profiles.filter(p => p.last_seen_at && new Date(p.last_seen_at) > fiveMinAgo);
    },
    refetchInterval: 10000
  });

  // Global chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['globalChatMessages'],
    queryFn: () => base44.entities.CircleMessage.filter({ circle_id: 'global' }, '-created_date', 50),
    refetchInterval: 3000
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfileForTownHall', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.CircleMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalChatMessages'] });
      setChatMessage('');
    }
  });

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => setConnectionStatus('connected'), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (connectionStatus !== 'connected') return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !user) return;
    sendMutation.mutate({
      circle_id: 'global',
      author_id: user.email,
      author_name: userProfile?.display_name || user.full_name,
      author_avatar: userProfile?.avatar_url,
      content: chatMessage.trim(),
      message_type: 'text'
    });
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  ).slice(-30);

  // Show first 6 participants in grid
  const gridParticipants = onlineUsers.slice(0, 6);

  return (
    <div className={cn(
      "bg-slate-950 flex flex-col",
      isFullscreen ? "fixed inset-0 z-50" : "rounded-2xl overflow-hidden"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full",
            connectionStatus === 'connected' ? "bg-red-500 animate-pulse" : "bg-amber-500"
          )} />
          <Globe className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              Ultranet Town Hall
              <Badge className="bg-red-600/20 text-red-400 border-red-500/30 text-xs">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              {connectionStatus === 'connected' 
                ? `${formatDuration(callDuration)} • ${onlineUsers.length} nodes connected`
                : 'Synchronizing global mesh...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
            <Users className="w-3 h-3 mr-1" />
            {onlineUsers.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className={cn(
            "grid gap-3 h-full",
            gridParticipants.length <= 1 ? "grid-cols-1" :
            gridParticipants.length <= 2 ? "grid-cols-2" :
            gridParticipants.length <= 4 ? "grid-cols-2 grid-rows-2" :
            "grid-cols-3 grid-rows-2"
          )}>
            {/* Self view */}
            <div className={cn(
              "relative rounded-xl overflow-hidden",
              videoOn ? "bg-gradient-to-br from-blue-900 to-slate-900" : "bg-slate-800"
            )}>
              {videoOn ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-2 ring-4 ring-blue-500/50">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="text-2xl bg-blue-600 text-white">
                        {user?.full_name?.charAt(0) || 'Y'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white text-sm">{userProfile?.display_name || 'You'}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoOff className="w-10 h-10 text-slate-600" />
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                  You {!micOn && <MicOff className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
            </div>

            {/* Other participants */}
            {gridParticipants.filter(p => p.user_id !== user?.email).slice(0, 5).map((participant, idx) => (
              <div 
                key={participant.id || idx}
                className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback className="text-xl bg-slate-700 text-white">
                        {participant.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white text-sm">{participant.display_name}</p>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                    {participant.display_name?.split(' ')[0]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        {(showChat || showParticipants) && (
          <div className="w-72 border-l border-slate-800 flex flex-col bg-slate-900/50">
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => { setShowChat(true); setShowParticipants(false); }}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  showChat ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
                )}
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Chat
              </button>
              <button
                onClick={() => { setShowParticipants(true); setShowChat(false); }}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium transition-colors",
                  showParticipants ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
                )}
              >
                <Users className="w-4 h-4 inline mr-1" />
                {onlineUsers.length}
              </button>
            </div>

            {showChat && (
              <>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {sortedMessages.map(msg => {
                      const isOwn = msg.author_id === user?.email;
                      return (
                        <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                          <Avatar className="w-6 h-6 shrink-0">
                            <AvatarImage src={msg.author_avatar} />
                            <AvatarFallback className="text-xs">{msg.author_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={cn("max-w-[80%]", isOwn ? "items-end" : "items-start", "flex flex-col")}>
                            {!isOwn && (
                              <span className="text-xs text-slate-500 mb-0.5">{msg.author_name?.split(' ')[0]}</span>
                            )}
                            <div className={cn(
                              "px-3 py-2 rounded-lg text-sm",
                              isOwn 
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-slate-700 text-white rounded-bl-sm"
                            )}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800">
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Say something..."
                      className="flex-1 bg-slate-800 border-slate-700 text-white text-sm"
                    />
                    <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {showParticipants && (
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {onlineUsers.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 cursor-pointer" data-user-id={p.user_id}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback className="text-xs bg-slate-700">{p.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{p.display_name}</p>
                        <p className="text-xs text-emerald-500">In Town Hall</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMicOn(!micOn)}
            className={cn(
              "w-12 h-12 rounded-full",
              micOn 
                ? "bg-slate-800 text-white hover:bg-slate-700" 
                : "bg-red-600 text-white hover:bg-red-700"
            )}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVideoOn(!videoOn)}
            className={cn(
              "w-12 h-12 rounded-full",
              videoOn 
                ? "bg-slate-800 text-white hover:bg-slate-700" 
                : "bg-red-600 text-white hover:bg-red-700"
            )}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScreenSharing(!screenSharing)}
            className={cn(
              "w-12 h-12 rounded-full",
              screenSharing 
                ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            <MonitorUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowChat(!showChat && !showParticipants);
              setShowParticipants(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full",
              showChat 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowParticipants(!showParticipants && !showChat);
              setShowChat(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full",
              showParticipants 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            <Users className="w-5 h-5" />
          </Button>
          <div className="w-px h-8 bg-slate-700 mx-2" />
          <Button
            onClick={onClose}
            className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}