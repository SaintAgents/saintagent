import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, FolderOpen, CheckCircle2, Clock } from "lucide-react";

export default function DashboardStatsBar({ missions, projects, tasks, timeLoggedMinutes }) {
  const activeMissions = missions.filter(m => m.status === 'active').length;
  const activeProjects = projects.filter(p => p.project_status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const hours = Math.round(timeLoggedMinutes / 60 * 10) / 10;

  const stats = [
    { label: 'Active Missions', value: activeMissions, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Active Projects', value: activeProjects, icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Hours Logged (7d)', value: hours, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 truncate">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}