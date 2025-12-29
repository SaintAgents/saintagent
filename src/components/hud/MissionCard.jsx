import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Target,
  Clock,
  Users,
  Sparkles,
  Coins,
  TrendingUp,
  Zap,
  ChevronRight,
  Share2 } from
"lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { createPageUrl } from '@/utils';
import { GGG_TO_USD } from '@/components/earnings/gggMatrix';

export default function MissionCard({ mission, onAction, variant = "default" }) {
  const completedTasks = mission.tasks?.filter((t) => t.completed)?.length || 0;
  const totalTasks = mission.tasks?.length || 0;
  const progressPercent = totalTasks > 0 ? completedTasks / totalTasks * 100 : 0;

  const typeColors = {
    platform: "bg-violet-100 text-violet-700",
    circle: "bg-blue-100 text-blue-700",
    region: "bg-emerald-100 text-emerald-700",
    leader: "bg-amber-100 text-amber-700",
    personal: "bg-rose-100 text-rose-700"
  };

  const timeLeft = mission.end_time ?
  formatDistanceToNow(parseISO(mission.end_time), { addSuffix: true }) :
  null;

  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 hover:border-violet-200 cursor-pointer transition-all"
        onClick={() => window.location.href = createPageUrl('MissionDetail') + '?id=' + mission.id}>

        <div className="p-2 rounded-lg bg-violet-100">
          <Target className="w-4 h-4 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-yellow-400 text-sm font-medium truncate">{mission.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            <span className="text-xs text-slate-500">{completedTasks}/{totalTasks}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>);

  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all duration-300">
      {mission.image_url &&
      <div className="relative h-32 bg-gradient-to-br from-violet-500 to-purple-600">
          <img
          src={mission.image_url}
          alt={mission.title}
          className="w-full h-full object-cover opacity-80" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <Badge className={cn("absolute top-3 left-3", typeColors[mission.mission_type])}>
            {mission.mission_type}
          </Badge>
        </div>
      }
      
      <div className="p-4">
        {!mission.image_url &&
        <Badge className={cn("mb-2", typeColors[mission.mission_type])}>
            {mission.mission_type}
          </Badge>
        }
        
        <h4 className="font-semibold text-slate-900 mb-1">{mission.title}</h4>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{mission.objective}</p>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          {timeLeft &&
          <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Ends {timeLeft}</span>
            </div>
          }
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{mission.participant_count || 0} joined</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Progress</span>
            <span className="font-medium text-slate-700">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {mission.roles_needed?.length > 0 &&
        <div className="flex flex-wrap gap-1.5 mb-4">
            {mission.roles_needed.map((role, i) =>
          <Badge key={i} variant="outline" className="bg-purple-100 text-foreground px-2.5 py-0.5 text-xs font-semibold rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                {role}
              </Badge>
          )}
          </div>
        }

        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-xs text-amber-600 font-medium">Rewards</p>
            <div className="flex items-center gap-3 mt-0.5">
              {mission.reward_ggg > 0 && (
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                  <Coins className="w-3.5 h-3.5" />
                  {(() => {
                    const raw = Number(mission.reward_ggg) || 0;
                    const usd = raw * GGG_TO_USD;
                    const usdCap = Math.min(55, usd);
                    const gggCap = usdCap / GGG_TO_USD;
                    return `${gggCap.toFixed(2)} GGG • $${usdCap.toFixed(2)}`;
                  })()}
                </span>
              )}
              {mission.reward_rank_points > 0 &&
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {mission.reward_rank_points} RP
                </span>
              }
              {mission.reward_boost > 0 &&
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-700">
                  <Zap className="w-3.5 h-3.5" />
                  {mission.reward_boost}x Boost
                </span>
              }
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-lg"
            onClick={() => window.location.href = createPageUrl('MissionDetail') + '?id=' + mission.id}>

            <Target className="w-4 h-4 mr-1.5" />
            View Mission
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => onAction?.('share', mission)}>

            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>);

}