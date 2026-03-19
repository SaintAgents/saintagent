import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Target, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

function MissionRow({ mission }) {
  const totalTasks = (mission.milestones || []).reduce((sum, m) => sum + (m.tasks?.length || 0), 0);
  const doneTasks = (mission.milestones || []).reduce(
    (sum, m) => sum + (m.tasks?.filter(t => t.completed || t.status === 'completed').length || 0), 0
  );
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium text-slate-900 truncate flex-1 mr-2">{mission.title}</p>
        <Badge variant="outline" className={cn("text-[10px] shrink-0",
          mission.status === 'active' ? 'border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-500'
        )}>
          {mission.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="text-xs text-slate-500 shrink-0">{progress}%</span>
      </div>
    </div>
  );
}

function ProjectRow({ project }) {
  const progress = project.progress_percent || 0;
  return (
    <div className="p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium text-slate-900 truncate flex-1 mr-2">{project.title}</p>
        <Badge variant="outline" className={cn("text-[10px] shrink-0",
          project.project_status === 'in_progress' ? 'border-blue-200 text-blue-700' : 'border-slate-200 text-slate-500'
        )}>
          {project.project_status?.replace('_', ' ') || project.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="text-xs text-slate-500 shrink-0">{progress}%</span>
      </div>
    </div>
  );
}

export default function MissionProjectSummary({ missions, projects }) {
  const myMissions = missions.filter(m => m.status === 'active' || m.status === 'pending_approval').slice(0, 5);
  const myProjects = projects.filter(p => p.project_status === 'in_progress' || p.project_status === 'planned').slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-600" />
            My Missions
            <Badge variant="secondary" className="ml-auto text-xs">{myMissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px]">
            {myMissions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No active missions</p>
            ) : (
              <div className="space-y-1">{myMissions.map(m => <MissionRow key={m.id} mission={m} />)}</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            My Projects
            <Badge variant="secondary" className="ml-auto text-xs">{myProjects.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px]">
            {myProjects.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No active projects</p>
            ) : (
              <div className="space-y-1">{myProjects.map(p => <ProjectRow key={p.id} project={p} />)}</div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}