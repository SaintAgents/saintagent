import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, ArrowUpCircle, AlertTriangle, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  todo: { icon: Circle, color: 'text-slate-400', label: 'To Do' },
  in_progress: { icon: ArrowUpCircle, color: 'text-blue-500', label: 'In Progress' },
  review: { icon: AlertTriangle, color: 'text-amber-500', label: 'Review' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Done' },
  blocked: { icon: AlertTriangle, color: 'text-red-500', label: 'Blocked' },
};

const priorityColors = {
  urgent: 'border-red-200 text-red-700 bg-red-50',
  high: 'border-orange-200 text-orange-700 bg-orange-50',
  medium: 'border-blue-200 text-blue-700 bg-blue-50',
  low: 'border-slate-200 text-slate-500',
};

export default function MyTasksSummary({ tasks, projects }) {
  const projectMap = {};
  projects.forEach(p => { projectMap[p.id] = p; });

  const activeTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
    });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-violet-600" />
          My Tasks
          <Badge variant="secondary" className="ml-auto text-xs">{activeTasks.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[340px] px-6 pb-4">
          {activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTasks.slice(0, 15).map(task => {
                const cfg = statusConfig[task.status] || statusConfig.todo;
                const Icon = cfg.icon;
                const proj = projectMap[task.project_id];
                return (
                  <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {proj?.title || 'Project'}
                        {task.due_date && ` • Due ${task.due_date}`}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] shrink-0", priorityColors[task.priority])}>
                      {task.priority || 'medium'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}