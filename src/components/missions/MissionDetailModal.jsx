import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Target,
  Clock,
  Users,
  Sparkles,
  Coins,
  TrendingUp,
  Zap,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Share2
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { createPageUrl } from '@/utils';
import { GGG_TO_USD } from '@/components/earnings/gggMatrix';
import MiniProfile from '@/components/profile/MiniProfile';

const MISSION_IMAGES = {
  platform: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
  circle: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  region: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  leader: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  personal: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80'
};

export default function MissionDetailModal({ mission, open, onClose }) {
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

  const { data: participants = [] } = useQuery({
    queryKey: ['missionParticipants', mission?.participant_ids],
    queryFn: async () => {
      if (!mission?.participant_ids?.length) return [];
      const allProfiles = await base44.entities.UserProfile.list();
      return allProfiles.filter(p => mission.participant_ids.includes(p.user_id));
    },
    enabled: !!mission?.participant_ids?.length && open
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
      queryClient.invalidateQueries({ queryKey: ['missions'] });
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
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    }
  });

  if (!mission) return null;

  const isParticipant = mission.participant_ids?.includes(profile?.user_id);
  const completedTasks = mission.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = mission.tasks?.length || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const missionImage = mission.image_url || MISSION_IMAGES[mission.mission_type] || MISSION_IMAGES.default;
  const timeLeft = mission.end_time ? formatDistanceToNow(parseISO(mission.end_time), { addSuffix: true }) : null;

  const typeColors = {
    platform: "bg-violet-100 text-violet-700",
    circle: "bg-blue-100 text-blue-700",
    region: "bg-emerald-100 text-emerald-700",
    leader: "bg-amber-100 text-amber-700",
    personal: "bg-rose-100 text-rose-700"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header Image */}
        <div className="relative h-48 bg-gradient-to-br from-violet-500 to-purple-600">
          <img
            src={missionImage}
            alt={mission.title}
            data-no-filter="true"
            className="w-full h-full object-cover mission-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <Badge className={cn("absolute top-4 left-4", typeColors[mission.mission_type])}>
            {mission.mission_type}
          </Badge>
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-1">{mission.title}</h2>
            <p className="text-white/80 text-sm line-clamp-2">{mission.objective}</p>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-12rem)]">
          <div className="p-6 space-y-6">
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-slate-600">
              {timeLeft && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Ends {timeLeft}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{mission.participant_count || 0} joined</span>
              </div>
              {mission.start_time && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Started {new Date(mission.start_time).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium text-slate-700">{completedTasks}/{totalTasks} tasks</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Description */}
            {mission.description && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {mission.description}
                </p>
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div className="flex-1">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Rewards</p>
                <div className="flex items-center gap-4 mt-1 flex-wrap">
                  {mission.reward_ggg > 0 && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                      <Coins className="w-4 h-4" />
                      {(() => {
                        const raw = Number(mission.reward_ggg) || 0;
                        const usd = raw * GGG_TO_USD;
                        const usdCap = Math.min(55, usd);
                        const gggCap = usdCap / GGG_TO_USD;
                        return `${gggCap.toFixed(2)} GGG • $${usdCap.toFixed(2)}`;
                      })()}
                    </span>
                  )}
                  {mission.reward_rank_points > 0 && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                      <TrendingUp className="w-4 h-4" />
                      {mission.reward_rank_points} RP
                    </span>
                  )}
                  {mission.reward_boost > 0 && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                      <Zap className="w-4 h-4" />
                      {mission.reward_boost}x Boost
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks */}
            {mission.tasks?.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Tasks</h3>
                <div className="space-y-2">
                  {mission.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
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
              </div>
            )}

            {/* Roles Needed */}
            {mission.roles_needed?.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Roles Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {mission.roles_needed.map((role, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            {participants.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Team Members ({participants.length})</h3>
                <div className="flex flex-wrap gap-3">
                  {participants.slice(0, 8).map(participant => (
                    <MiniProfile
                      key={participant.id}
                      userId={participant.user_id}
                      name={participant.display_name}
                      avatar={participant.avatar_url}
                      size={40}
                      showRankBadge={false}
                    />
                  ))}
                  {participants.length > 8 && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                      +{participants.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Creator */}
            {mission.creator_name && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Created by</p>
                <MiniProfile
                  userId={mission.creator_id}
                  name={mission.creator_name}
                  size={36}
                  showRankBadge={false}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
          {isParticipant ? (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => leaveMissionMutation.mutate()}
              disabled={leaveMissionMutation.isPending}
            >
              Leave Mission
            </Button>
          ) : (
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              onClick={() => joinMissionMutation.mutate()}
              disabled={joinMissionMutation.isPending}
            >
              <Users className="w-4 h-4 mr-2" />
              Join Mission
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.href = createPageUrl('MissionDetail') + '?id=' + mission.id}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Page
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}