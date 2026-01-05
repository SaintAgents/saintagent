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
  MessageSquare,
  MonitorUp,
  PhoneOff,
  Maximize2,
  Minimize2,
  Send,
  Wifi,
  WifiOff,
  Sparkles
} from "lucide-react";

export default function DirectVideoCall({ 
  recipientId,
  recipientName,
  recipientAvatar,
  user,
  onClose,
  isFullscreen = false,
  onToggleFullscreen
}) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const queryClient = useQueryClient();

  // Fetch existing messages for this conversation
  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 100),
    refetchInterval: 3000
  });

  const conversationMessages = allMessages
    .filter(m => 
      (m.from_user_id === user?.email && m.to_user_id === recipientId) ||
      (m.from_user_id === recipientId && m.to_user_id === user?.email)
    )
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .slice(-20);

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setChatMessage('');
    }
  });

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => setConnectionStatus('connected'), 1500);
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
    if (!chatMessage.trim()) return;
    sendMutation.mutate({
      from_user_id: user.email,
      to_user_id: recipientId,
      from_name: user.full_name,
      to_name: recipientName,
      content: chatMessage
    });
  };

  const handleEndCall = async () => {
    // Create a notification that call ended
    try {
      await base44.entities.Notification.create({
        user_id: recipientId,
        type: 'meeting',
        title: 'Video call ended',
        message: `Your call with ${user.full_name} has ended (${formatDuration(callDuration)})`,
      });
    } catch (e) {}
    onClose();
  };

  return (
    <div className={cn(
      "bg-slate-950 flex flex-col",
      isFullscreen ? "fixed inset-0 z-50" : "rounded-2xl overflow-hidden"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            connectionStatus === 'connected' ? "bg-emerald-500" : "bg-amber-500"
          )} />
          <Avatar className="w-8 h-8">
            <AvatarImage src={recipientAvatar} />
            <AvatarFallback>{recipientName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              {recipientName}
              <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Direct Link
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              {connectionStatus === 'connected' 
                ? `${formatDuration(callDuration)} • Encrypted channel`
                : 'Establishing secure connection...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <Wifi className="w-4 h-4 text-emerald-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-500 animate-pulse" />
          )}
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
            onClick={handleEndCall}
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
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* Self view */}
            <div className={cn(
              "relative rounded-xl overflow-hidden",
              videoOn ? "bg-gradient-to-br from-violet-900 to-slate-900" : "bg-slate-800"
            )}>
              {videoOn ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-3 ring-4 ring-violet-500/50">
                      <AvatarFallback className="text-3xl bg-violet-600 text-white">
                        {user?.full_name?.charAt(0) || 'Y'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white font-medium">You</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                  You {!micOn && <MicOff className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
            </div>

            {/* Remote participant */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 ring-2 ring-emerald-500/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-3">
                    <AvatarImage src={recipientAvatar} />
                    <AvatarFallback className="text-3xl bg-slate-700 text-white">
                      {recipientName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-medium">{recipientName}</p>
                </div>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                  {recipientName?.split(' ')[0]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Side Chat */}
        {showChat && (
          <div className="w-72 border-l border-slate-800 flex flex-col bg-slate-900/50">
            <div className="px-4 py-2 border-b border-slate-800">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </h4>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {conversationMessages.map(msg => {
                  const isOwn = msg.from_user_id === user?.email;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarImage src={isOwn ? undefined : recipientAvatar} />
                        <AvatarFallback className="text-xs">
                          {isOwn ? user?.full_name?.charAt(0) : recipientName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "max-w-[80%] px-3 py-2 rounded-lg text-sm",
                        isOwn 
                          ? "bg-violet-600 text-white rounded-br-sm"
                          : "bg-slate-700 text-white rounded-bl-sm"
                      )}>
                        {msg.content}
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
                  placeholder="Message..."
                  className="flex-1 bg-slate-800 border-slate-700 text-white text-sm"
                />
                <Button type="submit" size="icon" className="bg-violet-600 hover:bg-violet-700 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
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
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "w-12 h-12 rounded-full",
              showChat 
                ? "bg-violet-600 text-white hover:bg-violet-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <div className="w-px h-8 bg-slate-700 mx-2" />
          <Button
            onClick={handleEndCall}
            className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            End
          </Button>
        </div>
      </div>
    </div>
  );
}