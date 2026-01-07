import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield, Target, Crown, ChevronRight, Sparkles } from "lucide-react";

const TYPE_CONFIG = {
  guild: { label: 'Guild', color: 'bg-amber-100 text-amber-700', icon: Shield },
  squad: { label: 'Squad', color: 'bg-violet-100 text-violet-700', icon: Users },
  crew: { label: 'Crew', color: 'bg-blue-100 text-blue-700', icon: Target },
  alliance: { label: 'Alliance', color: 'bg-emerald-100 text-emerald-700', icon: Crown }
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  recruiting: { label: 'Recruiting', color: 'bg-violet-100 text-violet-700' },
  full: { label: 'Full', color: 'bg-slate-100 text-slate-600' },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-500' }
};

export default function TeamCard({ team, onView, onJoin, isMember, isLeader }) {
  const typeConfig = TYPE_CONFIG[team.team_type] || TYPE_CONFIG.squad;
  const statusConfig = STATUS_CONFIG[team.status] || STATUS_CONFIG.active;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[rgba(0,255,136,0.3)] overflow-hidden hover:shadow-lg transition-all">
      {team.image_url && (
        <div className="h-32 bg-gradient-to-br from-violet-500 to-purple-600">
          <img src={team.image_url} alt={team.name} className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", typeConfig.color.split(' ')[0])}>
              <TypeIcon className={cn("w-4 h-4", typeConfig.color.split(' ')[1])} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{team.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
          {team.description || 'A collaborative team working on missions together.'}
        </p>

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{team.member_count || 1}/{team.max_members || 20} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span>{team.mission_ids?.length || 0} missions</span>
          </div>
        </div>

        {team.focus_areas?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {team.focus_areas.slice(0, 3).map((area, i) => (
              <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
            ))}
          </div>
        )}

        {/* Leader */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mb-3">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Led by {team.leader_name}</span>
        </div>

        {/* Stats */}
        {(team.total_missions_completed > 0 || team.total_ggg_earned > 0) && (
          <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">{team.total_missions_completed} completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">{team.total_ggg_earned?.toFixed(2)} GGG</span>
              </div>
            </div>
            {team.total_ggg_earned > 0 && (
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ≈ ${((team.total_ggg_earned || 0) * 145).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD earned
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(team)}
          >
            View Team
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          {!isMember && team.status === 'recruiting' && (
            <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              onClick={() => onJoin?.(team)}
            >
              <Users className="w-4 h-4 mr-1.5" />
              Join Team
            </Button>
          )}
          {isMember && !isLeader && (
            <Badge className="bg-emerald-100 text-emerald-700">Member</Badge>
          )}
          {isLeader && (
            <Badge className="bg-amber-100 text-amber-700">Leader</Badge>
          )}
        </div>
      </div>
    </div>
  );
}