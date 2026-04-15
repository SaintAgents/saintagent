import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Target, CheckCircle, Play, Coins, Users, Trophy,
  Clock, TrendingUp, BarChart3
} from "lucide-react";

function StatTile({ label, value, subValue, icon: Icon, color, accent }) {
  const bg = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-600',
    rose: 'from-rose-500 to-pink-600',
    slate: 'from-slate-600 to-slate-700',
  };
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bg[color] || bg.violet} p-4 text-white`}>
      <div className="absolute top-2 right-2 opacity-20">
        <Icon className="w-10 h-10" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/80 mt-0.5">{label}</p>
      {subValue && <p className="text-[10px] text-white/60 mt-1">{subValue}</p>}
    </div>
  );
}

export default function MissionAnalyticsBar({ stats }) {
  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Active Missions" value={stats.active} icon={Play} color="emerald" />
        <StatTile label="Completed" value={stats.completed} icon={CheckCircle} color="blue" />
        <StatTile label="You Created" value={stats.created} icon={Target} color="violet" />
        <StatTile label="GGG Earned" value={`${stats.totalGGG.toFixed(0)}`} icon={Coins} color="amber" subValue="from completed missions" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-600">Completion Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-slate-900">{completionRate}%</span>
              <Progress value={completionRate} className="h-1.5 flex-1 mb-1.5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-slate-600">Tasks Done</span>
            </div>
            <span className="text-xl font-bold text-slate-900">{stats.completedTasks}<span className="text-sm font-normal text-slate-400">/{stats.totalTasks}</span></span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-slate-600">Total Teammates</span>
            </div>
            <span className="text-xl font-bold text-slate-900">{stats.totalParticipants}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium text-slate-600">Pending Approval</span>
            </div>
            <span className="text-xl font-bold text-slate-900">{stats.pending}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}