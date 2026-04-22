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
  ListTodo, Lock
} from "lucide-react";
import BlockerIndicator from './BlockerIndicator';
import TaskDependencyPicker from './TaskDependencyPicker';

const STATUS_CONFIG = {
  todo: { label: 'To Do', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-100', border: 'border-slate-200' },
  in_progress: { label: 'In Progress', icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

// Build a flat map of taskId -> task object across all milestones
function buildTaskMap(mission) {
  const map = {};
  (mission?.milestones || []).forEach(m => {
    (m.tasks || []).forEach(t => {
      if (t.id) map[t.id] = t;
    });
  });
  (mission?.tasks || []).forEach(t => {
    if (t.id) map[t.id] = t;
  });
  return map;
}

// Check if a task is blocked (has incomplete dependencies)
function getIncompleteBlockers(task, taskMap) {
  const deps = task.depends_on || [];
  if (deps.length === 0) return [];
  return deps
    .map(id => taskMap[id])
    .filter(Boolean)
    .filter(t => (t.status || (t.completed ? 'completed' : 'todo')) !== 'completed');
}

function TaskStatusButton({ task, onStatusChange, disabled, isBlocked }) {
  const status = task.status || (task.completed ? 'completed' : 'todo');
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const effectiveDisabled = disabled || isBlocked;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={effectiveDisabled} className="focus:outline-none">
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium cursor-pointer transition-all hover:shadow-sm",
          isBlocked ? "bg-amber-50 border-amber-200 text-amber-500" : cn(config.bg, config.border, config.color),
          effectiveDisabled && "opacity-50 cursor-not-allowed"
        )}>
          {isBlocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Icon className={cn("w-3.5 h-3.5", status === 'in_progress' && "animate-spin")} />
          )}
          {isBlocked ? 'Blocked' : config.label}
          {!isBlocked && <ChevronDown className="w-3 h-3 opacity-60" />}
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

function MilestoneSection({ milestone, milestoneIndex, onTaskStatusChange, onDepsChange, disabled, taskMap, allMilestoneTasks }) {
  const tasks = milestone.tasks || [];
  const completedCount = tasks.filter(t => (t.status || (t.completed ? 'completed' : 'todo')) === 'completed').length;
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
            const incompleteBlockers = getIncompleteBlockers(task, taskMap);
            const isBlocked = incompleteBlockers.length > 0;

            return (
              <div 
                key={task.id || taskIndex} 
                className={cn(
                  "px-4 py-3 transition-colors",
                  isBlocked && status !== 'completed' && "bg-amber-50/30 border-l-2 border-l-amber-300",
                  !isBlocked && status === 'completed' && "bg-emerald-50/30",
                  !isBlocked && status === 'in_progress' && "bg-blue-50/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <TaskStatusButton
                    task={task}
                    onStatusChange={(newStatus) => onTaskStatusChange(milestoneIndex, taskIndex, newStatus)}
                    disabled={disabled}
                    isBlocked={isBlocked && status !== 'completed'}
                  />
                  <span className={cn(
                    "text-sm flex-1",
                    status === 'completed' && "text-slate-400 line-through",
                    status === 'in_progress' && !isBlocked && "text-blue-700 font-medium",
                    status === 'todo' && !isBlocked && "text-slate-700",
                    isBlocked && status !== 'completed' && "text-amber-700"
                  )}>
                    {task.title}
                  </span>
                  <BlockerIndicator blockerTasks={incompleteBlockers} />
                </div>

                {/* Dependency picker row — only for editors */}
                {disabled ? (
                  // Read-only: show dependency badges if any
                  (task.depends_on?.length > 0 && (
                    <div className="mt-1.5 ml-[72px] flex flex-wrap gap-1">
                      {task.depends_on.map(depId => {
                        const depTask = taskMap[depId];
                        if (!depTask) return null;
                        const depStatus = depTask.status || (depTask.completed ? 'completed' : 'todo');
                        return (
                          <Badge 
                            key={depId} 
                            variant="outline" 
                            className={cn(
                              "text-[10px] gap-1",
                              depStatus === 'completed' 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                                : "bg-amber-50 border-amber-200 text-amber-600"
                            )}
                          >
                            {depStatus === 'completed' ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <Lock className="w-2.5 h-2.5" />
                            )}
                            {depTask.title?.length > 25 ? depTask.title.slice(0, 25) + '…' : depTask.title}
                          </Badge>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="mt-1.5 ml-[72px]">
                    <TaskDependencyPicker
                      currentTaskId={task.id}
                      currentDeps={task.depends_on || []}
                      allTasks={allMilestoneTasks}
                      onChange={(newDeps) => onDepsChange(milestoneIndex, taskIndex, newDeps)}
                    />
                  </div>
                )}
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

  (mission?.milestones || []).forEach(m => {
    (m.tasks || []).forEach(t => {
      totalCount++;
      const status = t.status || (t.completed ? 'completed' : 'todo');
      if (status === 'completed') completedCount++;
    });
  });

  (mission?.tasks || []).forEach(t => {
    totalCount++;
    const status = t.status || (t.completed ? 'completed' : 'todo');
    if (status === 'completed') completedCount++;
  });

  return { completedCount, totalCount, percent: totalCount > 0 ? (completedCount / totalCount) * 100 : 0 };
}

export default function MissionTaskTracker({ mission, canEdit }) {
  const queryClient = useQueryClient();
  const taskMap = buildTaskMap(mission);

  // Flat list of all tasks across all milestones (for dependency picker)
  const allMilestoneTasks = (mission?.milestones || []).flatMap(m => m.tasks || []);

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
      const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.status === 'completed' || t.completed);
      return { ...m, tasks: updatedTasks, completed: allDone };
    });
    updateMutation.mutate(updatedMilestones);

    if (newStatus === 'completed' && oldStatus !== 'completed') {
      base44.functions.invoke('missionNotificationEngine', {
        action: 'task_completed',
        mission_id: mission.id,
        task_index: taskIndex,
        milestone_index: milestoneIndex,
      }).catch(e => console.warn('Notification send failed:', e));
    }
  };

  const handleDepsChange = (milestoneIndex, taskIndex, newDeps) => {
    const updatedMilestones = (mission.milestones || []).map((m, mi) => {
      if (mi !== milestoneIndex) return m;
      const updatedTasks = (m.tasks || []).map((t, ti) => {
        if (ti !== taskIndex) return t;
        return { ...t, depends_on: newDeps };
      });
      return { ...m, tasks: updatedTasks };
    });
    updateMutation.mutate(updatedMilestones);
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
            onDepsChange={handleDepsChange}
            disabled={!canEdit || updateMutation.isPending}
            taskMap={taskMap}
            allMilestoneTasks={allMilestoneTasks}
          />
        ))}
    </div>
  );
}