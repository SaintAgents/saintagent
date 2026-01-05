import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target,
  Users,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  Share2,
  Settings
} from "lucide-react";

import AITeamBuilder from '@/components/ai/AITeamBuilder';
import AIMissionBrief from '@/components/ai/AIMissionBrief';
import AIDiscussionAssistant from '@/components/ai/AIDiscussionAssistant';
import Breadcrumb from '@/components/hud/Breadcrumb';

export default function MissionDetail() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get mission ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const missionId = urlParams.get('id');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: currentUser.email });
    },
    enabled: !!user
  });
  const profile = profiles?.[0];

  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const missions = await base44.entities.Mission.list();
      return missions.find(m => m.id === missionId);
    },
    enabled: !!missionId
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['missionParticipants', mission?.participant_ids],
    queryFn: async () => {
      if (!mission?.participant_ids?.length) return [];
      const allProfiles = await base44.entities.UserProfile.list();
      return allProfiles.filter(p => mission.participant_ids.includes(p.user_id));
    },
    enabled: !!mission?.participant_ids?.length
  });

  const joinMissionMutation = useMutation({
    mutationFn: async () => {
      const newParticipants = [...(mission.participant_ids || []), profile.user_id];
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionParticipants'] });
    }
  });

  const leaveMissionMutation = useMutation({
    mutationFn: async () => {
      const newParticipants = (mission.participant_ids || []).filter(id => id !== profile.user_id);
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionParticipants'] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
        <div className="text-center">
          <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Mission not found</h2>
          <Button onClick={() => window.location.href = createPageUrl('Missions')}>
            Back to Missions
          </Button>
        </div>
      </div>
    );
  }

  const isParticipant = mission.participant_ids?.includes(profile?.user_id);
  const completedTasks = mission.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = mission.tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Default mission images by type (fallback)
  const MISSION_IMAGES = {
    platform: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    circle: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    region: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    leader: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    personal: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    default: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80'
  };

  const heroImage = mission.image_url || MISSION_IMAGES[mission.mission_type] || MISSION_IMAGES.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero Header with Mission Image */}
      <div className="relative border-b border-slate-200 overflow-hidden">
        {/* Background Image at 50% opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            opacity: 0.5
          }}
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white" />
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <Breadcrumb items={[
            { label: 'Missions', page: 'Missions' },
            { label: mission?.title || 'Mission Details' }
          ]} />
          
          <div className="flex items-start justify-between mt-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={cn(
                  mission.mission_type === 'platform' && 'bg-violet-100 text-violet-700',
                  mission.mission_type === 'circle' && 'bg-blue-100 text-blue-700',
                  mission.mission_type === 'region' && 'bg-emerald-100 text-emerald-700',
                  mission.mission_type === 'leader' && 'bg-amber-100 text-amber-700'
                )}>
                  {mission.mission_type}
                </Badge>
                <Badge variant="outline" className={cn(
                  mission.status === 'active' && 'border-emerald-300 text-emerald-700 bg-white/80',
                  mission.status === 'completed' && 'border-blue-300 text-blue-700 bg-white/80'
                )}>
                  {mission.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 drop-shadow-sm">{mission.title}</h1>
              <p className="text-slate-700 max-w-2xl drop-shadow-sm">{mission.objective}</p>
            </div>

            <div className="flex items-center gap-3">
              {isParticipant ? (
                <Button 
                  variant="outline" 
                  onClick={() => leaveMissionMutation.mutate()}
                  disabled={leaveMissionMutation.isPending}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  Leave Mission
                </Button>
              ) : (
                <Button 
                  onClick={() => joinMissionMutation.mutate()}
                  disabled={joinMissionMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700 shadow-lg"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Mission
                </Button>
              )}
              <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4 bg-white rounded-xl border">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-brief">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Brief
                </TabsTrigger>
                <TabsTrigger value="team-builder">
                  <Users className="w-4 h-4 mr-2" />
                  Team AI
                </TabsTrigger>
                <TabsTrigger value="discussion">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discussion AI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Progress */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Mission Progress</h3>
                      <span className="text-sm text-slate-500">{completedTasks}/{totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-violet-600 to-purple-600 h-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {mission.description || mission.objective}
                    </p>
                  </CardContent>
                </Card>

                {/* Tasks */}
                {mission.tasks?.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-4">Tasks</h3>
                      <div className="space-y-2">
                        {mission.tasks.map((task, i) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                            <span className={cn(
                              "text-sm flex-1",
                              task.completed ? "text-slate-500 line-through" : "text-slate-900"
                            )}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Roles Needed */}
                {mission.roles_needed?.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-3">Roles Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {mission.roles_needed.map((role, i) => (
                          <Badge key={i} variant="outline" className="text-sm">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="ai-brief" className="mt-6">
                <AIMissionBrief mission={mission} />
              </TabsContent>

              <TabsContent value="team-builder" className="mt-6">
                <AITeamBuilder mission={mission} currentProfile={profile} />
              </TabsContent>

              <TabsContent value="discussion" className="mt-6">
                <AIDiscussionAssistant missionId={mission.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Rewards</h3>
                <div className="space-y-3">
                  {mission.reward_ggg > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                      <span className="text-sm text-slate-700">GGG Reward</span>
                      <span className="font-bold text-amber-600">{mission.reward_ggg}</span>
                    </div>
                  )}
                  {mission.reward_rank_points > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50">
                      <span className="text-sm text-slate-700">Rank Points</span>
                      <span className="font-bold text-violet-600">{mission.reward_rank_points}</span>
                    </div>
                  )}
                  {mission.reward_boost > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                      <span className="text-sm text-slate-700">Boost Multiplier</span>
                      <span className="font-bold text-blue-600">{mission.reward_boost}x</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {(mission.start_time || mission.end_time) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Timeline</h3>
                  <div className="space-y-3">
                    {mission.start_time && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Start</p>
                          <p className="text-sm text-slate-900">
                            {new Date(mission.start_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {mission.end_time && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">End</p>
                          <p className="text-sm text-slate-900">
                            {new Date(mission.end_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Team Members</h3>
                  <span className="text-sm text-slate-500">
                    {mission.participant_count || 0}
                    {mission.max_participants && `/${mission.max_participants}`}
                  </span>
                </div>
                <ScrollArea className="max-h-80">
                  <div className="space-y-3">
                    {participants.map(participant => (
                      <div 
                        key={participant.id} 
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                        data-user-id={participant.user_id}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar_url} />
                          <AvatarFallback className="text-sm">
                            {participant.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {participant.display_name}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {participant.rank_code || 'seeker'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Creator */}
            {mission.creator_name && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Created By</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm">
                        {mission.creator_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-slate-900">
                        {mission.creator_name}
                      </p>
                      <p className="text-xs text-slate-500">Mission Leader</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}