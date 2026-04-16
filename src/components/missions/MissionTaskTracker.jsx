import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, Circle, Loader2, ChevronDown, Calendar, 
  ListTodo 
} from "lucide-react";

const STATUS_CONFIG = {
  todo: { label: 'To Do', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200' },
  in_progress: { label: 'In Progress', icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

function TaskStatusButton({ task, onStatusChange, disabled }) {
  const status = task.status || (task.completed ? 'completed' : 'todo');
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled} className="focus:outline-none">
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium cursor-pointer transition-all hover:shadow-sm",
          config.bg, config.border, config.color,
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <Icon className={cn("w-3.5 h-3.5", status === 'in_progress' && "animate-spin")} />
          {config.label}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const ItemIcon = cfg.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onStatusChange(key)}
              className={cn("gap-2", key === status && "bg-slate-100")}
            >
              <ItemIcon className={cn("w-4 h-4", cfg.color)} />
              {cfg.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MilestoneSection({ milestone, milestoneIndex, onTaskStatusChange, disabled }) {
  const tasks = milestone.tasks || [];
  const completedCount = tasks.filter(t => (t.status || (t.completed ? 'completed' : 'todo')) === 'completed').length;
  const inProgressCount = tasks.filter(t => (t.status || 'todo') === 'in_progress').length;
  const totalTasks = tasks.length;
  const milestoneProgress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* Milestone Header */}
      <div className="px-4 py-3 bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-violet-600" />
            <h4 className="font-semibold text-sm text-slate-900">
              {milestone.title || `Milestone ${milestoneIndex + 1}`}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {milestone.due_date && (
              <Badge variant="outline" className="text-xs gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(milestone.due_date).toLocaleDateString()}
              </Badge>
            )}
            <span className="text-xs text-slate-500">{completedCount}/{totalTasks}</span>
          </div>
        </div>
        {milestone.description && (
          <p className="text-xs text-slate-500 mt-1">{milestone.description}</p>
        )}
        {totalTasks > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <Progress value={milestoneProgress} className="h-1.5 flex-1" />
            <span className="text-xs font-medium text-slate-600">{Math.round(milestoneProgress)}%</span>
          </div>
        )}
      </div>

      {/* Tasks */}
      {tasks.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {tasks.map((task, taskIndex) => {
            const status = task.status || (task.completed ? 'completed' : 'todo');
            return (
              <div 
                key={task.id || taskIndex} 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors",
                  status === 'completed' && "bg-emerald-50/30",
                  status === 'in_progress' && "bg-blue-50/30"
                )}
              >
                <TaskStatusButton
                  task={task}
                  onStatusChange={(newStatus) => onTaskStatusChange(milestoneIndex, taskIndex, newStatus)}
                  disabled={disabled}
                />
                <span className={cn(
                  "text-sm flex-1",
                  status === 'completed' && "text-slate-400 line-through",
                  status === 'in_progress' && "text-blue-700 font-medium",
                  status === 'todo' && "text-slate-700"
                )}>
                  {task.title}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-slate-400">
          No tasks in this milestone
        </div>
      )}
    </div>
  );
}

export function computeMissionProgress(mission) {
  let completedCount = 0;
  let totalCount = 0;

  // Count from milestones
  (mission?.milestones || []).forEach(m => {
    (m.tasks || []).forEach(t => {
      totalCount++;
      const status = t.status || (t.completed ? 'completed' : 'todo');
      if (status === 'completed') completedCount++;
    });
  });

  // Count from top-level tasks
  (mission?.tasks || []).forEach(t => {
    totalCount++;
    const status = t.status || (t.completed ? 'completed' : 'todo');
    if (status === 'completed') completedCount++;
  });

  return { completedCount, totalCount, percent: totalCount > 0 ? (completedCount / totalCount) * 100 : 0 };
}

export default function MissionTaskTracker({ mission, canEdit }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updatedMilestones) => {
      await base44.entities.Mission.update(mission.id, { milestones: updatedMilestones });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    }
  });

  const handleTaskStatusChange = (milestoneIndex, taskIndex, newStatus) => {
    const oldTask = mission.milestones?.[milestoneIndex]?.tasks?.[taskIndex];
    const oldStatus = oldTask?.status || (oldTask?.completed ? 'completed' : 'todo');
    
    const updatedMilestones = (mission.milestones || []).map((m, mi) => {
      if (mi !== milestoneIndex) return m;
      const updatedTasks = (m.tasks || []).map((t, ti) => {
        if (ti !== taskIndex) return t;
        return { ...t, status: newStatus, completed: newStatus === 'completed' };
      });
      // Auto-mark milestone as completed if all tasks are done
      const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.status === 'completed' || t.completed);
      return { ...m, tasks: updatedTasks, completed: allDone };
    });
    updateMutation.mutate(updatedMilestones);

    // Send notifications when a task is marked completed (and wasn't already)
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      base44.functions.invoke('missionNotificationEngine', {
        action: 'task_completed',
        mission_id: mission.id,
        task_index: taskIndex,
        milestone_index: milestoneIndex,
      }).catch(e => console.warn('Notification send failed:', e));
    }
  };

  const milestones = mission?.milestones || [];
  if (milestones.length === 0) return null;

  return (
    <div className="space-y-4">
      {milestones
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((milestone, index) => (
          <MilestoneSection
            key={milestone.id || index}
            milestone={milestone}
            milestoneIndex={index}
            onTaskStatusChange={handleTaskStatusChange}
            disabled={!canEdit || updateMutation.isPending}
          />
        ))}
    </div>
  );
}