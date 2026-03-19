import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  in_progress: 'border-blue-200 text-blue-700 bg-blue-50',
  planned: 'border-slate-200 text-slate-600',
  completed: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  on_hold: 'border-amber-200 text-amber-700 bg-amber-50',
};

export default function PortalProjectCard({ project, onClick, isSelected }) {
  const progress = project.progress_percent || 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-violet-500 shadow-md"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{project.title}</span>
          </CardTitle>
          <Badge variant="outline" className={cn("text-[10px] shrink-0", statusColors[project.project_status])}>
            {project.project_status?.replace('_', ' ') || 'active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-slate-600">{progress}%</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {project.end_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {project.end_date}
            </span>
          )}
          {project.team_size > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {project.team_size}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
        )}
      </CardContent>
    </Card>
  );
}