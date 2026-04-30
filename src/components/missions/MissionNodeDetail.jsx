import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { X, Target, Users, Calendar, Coins, Clock, ExternalLink } from "lucide-react";
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

const STATUS_BADGES = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-violet-100 text-violet-700',
  draft: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
  pending_approval: 'bg-amber-100 text-amber-700',
};

export default function MissionNodeDetail({ mission, profileMap, onClose }) {
  const participants = (mission.participant_ids || []).map(pid => profileMap[pid]).filter(Boolean);
  const creator = profileMap[mission.creator_id];

  const milestones = mission.milestones || [];
  const completedMilestones = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <Card className="w-80 shrink-0 max-h-[calc(100vh-280px)] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base leading-snug pr-2">{mission.title}</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge className={STATUS_BADGES[mission.status] || STATUS_BADGES.draft}>
            {mission.status?.replace('_', ' ')}
          </Badge>
          {mission.mission_type && (
            <Badge variant="outline" className="capitalize text-xs">
              {mission.mission_type}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {mission.description && (
          <p className="text-sm text-slate-600 line-clamp-4">{mission.description}</p>
        )}

        {/* Objective */}
        {mission.objective && (
          <div className="p-3 bg-violet-50 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-violet-700 mb-1">
              <Target className="w-3.5 h-3.5" />
              Objective
            </div>
            <p className="text-sm text-slate-700">{mission.objective}</p>
          </div>
        )}

        {/* Progress */}
        {milestones.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Milestones</span>
              <span className="font-medium text-slate-700">{completedMilestones}/{milestones.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {mission.reward_ggg > 0 && (
            <div className="flex items-center gap-2 text-amber-700">
              <Coins className="w-4 h-4" />
              <span>{mission.reward_ggg} GGG</span>
            </div>
          )}
          {mission.start_time && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(mission.start_time), 'MMM d')}</span>
            </div>
          )}
          {mission.end_time && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(mission.end_time), 'MMM d')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4" />
            <span>{mission.participant_count || 0} joined</span>
          </div>
        </div>

        {/* Creator */}
        {creator && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Creator</p>
            <div className="flex items-center gap-2 cursor-pointer" data-user-id={creator.user_id}>
              <Avatar className="h-7 w-7">
                <AvatarImage src={creator.avatar_url} />
                <AvatarFallback className="text-xs">{creator.display_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">{creator.display_name}</span>
            </div>
          </div>
        )}

        {/* Participants */}
        {participants.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Participants ({participants.length})</p>
            <div className="flex flex-wrap gap-2">
              {participants.slice(0, 8).map(p => (
                <div key={p.id} className="cursor-pointer" data-user-id={p.user_id} title={p.display_name}>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback className="text-[10px]">{p.display_name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              ))}
              {participants.length > 8 && (
                <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                  +{participants.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link to detail */}
        <Button
          variant="outline"
          className="w-full gap-2 text-sm"
          onClick={() => { window.location.href = createPageUrl('MissionDetail') + `?id=${mission.id}`; }}
        >
          <ExternalLink className="w-4 h-4" />
          View Full Mission
        </Button>
      </CardContent>
    </Card>
  );
}