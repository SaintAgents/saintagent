import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Calendar, 
  Settings,
  Heart,
  Crown,
  MapPin,
  Globe,
  Video
} from "lucide-react";
import GroupForum from './GroupForum';
import GroupMemberDirectory from './GroupMemberDirectory';
import GroupEvents from './GroupEvents';
import CircleChatPanel from '@/components/community/CircleChatPanel';
import VideoCallRoom from '@/components/video/VideoCallRoom';

export default function GroupDetailPage({ circle, user, onBack }) {
  const [activeTab, setActiveTab] = useState('forum');
  const [showChat, setShowChat] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const queryClient = useQueryClient();

  const isMember = circle?.member_ids?.includes(user?.email);
  const isOwner = circle?.owner_id === user?.email;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const newMembers = [...(circle.member_ids || []), user.email];
      return base44.entities.Circle.update(circle.id, {
        member_ids: newMembers,
        member_count: newMembers.length
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] })
  });

  const categoryColors = {
    spiritual: 'bg-purple-100 text-purple-700',
    creative: 'bg-pink-100 text-pink-700',
    business: 'bg-blue-100 text-blue-700',
    wellness: 'bg-emerald-100 text-emerald-700',
    learning: 'bg-amber-100 text-amber-700',
    social: 'bg-cyan-100 text-cyan-700',
    activism: 'bg-rose-100 text-rose-700',
    other: 'bg-slate-100 text-slate-700'
  };

  if (!circle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Header */}
      <div className="relative">
        <div className={cn(
          "h-48",
          circle.image_url ? "" : "bg-gradient-to-r from-violet-500 to-indigo-600"
        )}>
          {circle.image_url && (
            <img src={circle.image_url} alt={circle.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="absolute top-4 left-4">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {circle.category && (
                  <Badge className={cn("text-xs", categoryColors[circle.category])}>
                    {circle.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                  {circle.visibility}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">{circle.name}</h1>
              {circle.purpose && (
                <p className="text-white/80 text-sm">{circle.purpose}</p>
              )}
            </div>
            <div className="flex gap-2">
              {isMember && (
                <Button 
                  onClick={() => setShowVideoCall(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Video className="w-4 h-4" />
                  Start Video Call
                </Button>
              )}
              {isMember && circle.chat_enabled && (
                <Button 
                  onClick={() => setShowChat(true)}
                  className="bg-white/20 hover:bg-white/30 text-white gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </Button>
              )}
              {!isMember && (
                <Button 
                  onClick={() => joinMutation.mutate()}
                  disabled={joinMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Join Group
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Users className="w-4 h-4" />
            {circle.member_count || 0} members
          </span>
          {circle.values?.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              {circle.values.slice(0, 2).map((v, i) => (
                <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
              ))}
            </div>
          )}
          {circle.meeting_frequency && circle.meeting_frequency !== 'as_needed' && (
            <span className="text-slate-500 capitalize">Meets {circle.meeting_frequency}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {isMember ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white border">
              <TabsTrigger value="forum" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Forum
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="forum">
              <GroupForum circle={circle} user={user} />
            </TabsContent>

            <TabsContent value="members">
              <GroupMemberDirectory circle={circle} user={user} />
            </TabsContent>

            <TabsContent value="events">
              <GroupEvents circle={circle} user={user} />
            </TabsContent>

            {isOwner && (
              <TabsContent value="settings">
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Group Settings</h3>
                  <p className="text-slate-500 text-sm">Use the Manage button from the groups list to edit settings.</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Join to Access</h3>
            <p className="text-slate-500 mb-6">Join this group to access forums, member directory, and events.</p>
            <Button 
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Join Group
            </Button>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <CircleChatPanel 
            circle={circle}
            user={user}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      {/* Video Call Room */}
      {showVideoCall && (
        <div className={cn(
          "fixed z-50",
          videoFullscreen ? "inset-0" : "bottom-4 right-4 w-[800px] h-[600px]"
        )}>
          <VideoCallRoom 
            circle={circle}
            user={user}
            onClose={() => setShowVideoCall(false)}
            isFullscreen={videoFullscreen}
            onToggleFullscreen={() => setVideoFullscreen(!videoFullscreen)}
          />
        </div>
      )}
    </div>
  );
}