import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  X,
  Users,
  MessageSquare,
  MonitorUp,
  Settings,
  PhoneOff,
  Maximize2,
  Minimize2,
  Circle,
  Send,
  Sparkles,
  Wifi,
  WifiOff,
  FileText,
  BrainCircuit
} from "lucide-react";
import AIMeetingAssistant from '@/components/ai/AIMeetingAssistant';

export default function VideoCallRoom({ 
  circle, 
  user, 
  onClose, 
  isFullscreen = false,
  onToggleFullscreen 
}) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', content: 'Video call started. Welcome to the Ultranet node sync.', time: new Date() }
  ]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const queryClient = useQueryClient();

  // Fetch member profiles
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['circleMembers', circle?.id],
    queryFn: async () => {
      if (!circle?.member_ids?.length) return [];
      const profiles = await base44.entities.UserProfile.list('-updated_date', 100);
      return profiles.filter(p => circle.member_ids.includes(p.user_id));
    },
    enabled: !!circle?.member_ids?.length
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
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      user: user?.full_name || 'You',
      content: chatMessage,
      time: new Date()
    }]);
    setChatMessage('');
  };

  const handleEndCall = () => {
    // Could log call to meeting history
    onClose();
  };

  // Simulated active participants (in real app, this would come from WebRTC)
  const activeParticipants = memberProfiles.slice(0, 4).map((p, idx) => ({
    ...p,
    isActive: idx < 2, // First 2 are "active" in call
    isSpeaking: idx === 0,
    hasVideo: idx !== 2,
    hasMic: true
  }));

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
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              {circle?.name}
              <Badge className="bg-violet-600/20 text-violet-400 border-violet-500/30 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Ultranet Sync
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              {connectionStatus === 'connected' 
                ? `${formatDuration(callDuration)} • Field coherence active`
                : 'Synchronizing nodes...'}
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
          <div className={cn(
            "grid gap-3 h-full",
            activeParticipants.filter(p => p.isActive).length <= 1 ? "grid-cols-1" :
            activeParticipants.filter(p => p.isActive).length <= 2 ? "grid-cols-2" :
            "grid-cols-2 grid-rows-2"
          )}>
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
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                  You {!micOn && <MicOff className="w-3 h-3 ml-1" />}
                </Badge>
              </div>
              {/* Speaking indicator */}
              <div className="absolute inset-0 pointer-events-none border-4 border-transparent rounded-xl" />
            </div>

            {/* Other participants */}
            {activeParticipants.filter(p => p.isActive && p.user_id !== user?.email).slice(0, 3).map((participant, idx) => (
              <div 
                key={participant.id || idx}
                className={cn(
                  "relative rounded-xl overflow-hidden",
                  participant.hasVideo ? "bg-gradient-to-br from-slate-800 to-slate-900" : "bg-slate-800",
                  participant.isSpeaking && "ring-2 ring-emerald-500"
                )}
              >
                {participant.hasVideo ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-2">
                        <AvatarImage src={participant.avatar_url} />
                        <AvatarFallback className="text-2xl bg-slate-700 text-white">
                          {participant.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-white text-sm">{participant.display_name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="w-10 h-10 text-slate-600" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <Badge className="bg-slate-900/80 text-white border-0 text-xs">
                    {participant.display_name?.split(' ')[0]}
                    {participant.isSpeaking && <Circle className="w-2 h-2 ml-1 fill-emerald-500 text-emerald-500" />}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel - Participants, Chat, or AI Assistant */}
        {(showParticipants || showChat || showAIAssistant) && (
          <div className={cn(
            "border-l border-slate-800 flex flex-col bg-slate-900/50",
            showAIAssistant ? "w-96" : "w-72"
          )}>
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => { setShowParticipants(true); setShowChat(false); setShowAIAssistant(false); }}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  showParticipants ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
                )}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Team
              </button>
              <button
                onClick={() => { setShowChat(true); setShowParticipants(false); setShowAIAssistant(false); }}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  showChat ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
                )}
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Chat
              </button>
              <button
                onClick={() => { setShowAIAssistant(true); setShowParticipants(false); setShowChat(false); }}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                  showAIAssistant ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
                )}
              >
                <BrainCircuit className="w-4 h-4 inline mr-1" />
                AI
              </button>
            </div>

            {showParticipants && (
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {activeParticipants.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={p.avatar_url} />
                        <AvatarFallback className="text-xs bg-slate-700">{p.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{p.display_name}</p>
                        <p className="text-xs text-slate-500">
                          {p.isActive ? 'In call' : 'Available'}
                        </p>
                      </div>
                      {p.isSpeaking && (
                        <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {showChat && (
              <>
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="text-sm">
                        <span className="text-violet-400 font-medium">{msg.user}: </span>
                        <span className="text-slate-300">{msg.content}</span>
                      </div>
                    ))}
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
              </>
            )}

            {showAIAssistant && (
              <div className="flex-1 overflow-hidden">
                <AIMeetingAssistant
                  meetingTitle={circle?.name || 'Team Meeting'}
                  participants={activeParticipants.map(p => ({ name: p.display_name, ...p }))}
                  className="h-full border-0 rounded-none bg-transparent"
                  onSaveSummary={(summary) => {
                    setChatMessages(prev => [...prev, {
                      id: Date.now(),
                      user: 'AI Assistant',
                      content: `📝 Meeting summary saved. Key points: ${summary.summary?.substring(0, 100)}...`,
                      time: new Date()
                    }]);
                  }}
                  onSaveActionItems={(items) => {
                    setChatMessages(prev => [...prev, {
                      id: Date.now(),
                      user: 'AI Assistant',
                      content: `✅ ${items.length} action items captured and ready for follow-up.`,
                      time: new Date()
                    }]);
                  }}
                />
              </div>
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
              setShowParticipants(!showParticipants && !showChat && !showAIAssistant);
              setShowChat(false);
              setShowAIAssistant(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full",
              showParticipants 
                ? "bg-violet-600 text-white hover:bg-violet-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowChat(!showChat && !showParticipants && !showAIAssistant);
              setShowParticipants(false);
              setShowAIAssistant(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full",
              showChat 
                ? "bg-violet-600 text-white hover:bg-violet-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowAIAssistant(!showAIAssistant && !showParticipants && !showChat);
              setShowParticipants(false);
              setShowChat(false);
            }}
            className={cn(
              "w-12 h-12 rounded-full",
              showAIAssistant 
                ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                : "bg-slate-800 text-white hover:bg-slate-700"
            )}
            title="AI Meeting Assistant"
          >
            <BrainCircuit className="w-5 h-5" />
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