import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, Coins, TrendingUp, ListTodo, Milestone } from "lucide-react";
import { computeMissionProgress } from '@/components/missions/MissionTaskTracker';
import MissionTaskTracker from '@/components/missions/MissionTaskTracker';

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    rose: 'bg-rose-100 text-rose-600',
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color] || colors.violet}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MissionManageOverview({ mission }) {
  const { completedCount, totalCount, percent } = computeMissionProgress(mission);
  const completedMilestones = mission.milestones?.filter(m => m.completed)?.length || 0;
  const totalMilestones = mission.milestones?.length || 0;
  const participantCount = mission.participant_count || (mission.participant_ids?.length || 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Team Members" value={participantCount} icon={Users} color="violet" />
        <StatCard label="Tasks Done" value={`${completedCount}/${totalCount}`} icon={CheckCircle} color="emerald" />
        <StatCard label="Milestones" value={`${completedMilestones}/${totalMilestones}`} icon={Milestone} color="blue" />
        <StatCard label="GGG Reward" value={mission.reward_ggg || 0} icon={Coins} color="amber" />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Overall Progress</h3>
            <span className="text-sm font-medium text-slate-600">{Math.round(percent)}%</span>
          </div>
          <Progress value={percent} className="h-3" />
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
            {mission.description || mission.objective || 'No description provided.'}
          </p>
        </CardContent>
      </Card>

      {/* Roles */}
      {mission.roles_needed?.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Roles Needed</h3>
            <div className="flex flex-wrap gap-2">
              {mission.roles_needed.map((role, i) => (
                <Badge key={i} variant="outline">{role}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones & Tasks */}
      {(mission.milestones?.length > 0 || mission.tasks?.length > 0) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Milestones & Tasks</h3>
            <MissionTaskTracker mission={mission} canEdit={true} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}