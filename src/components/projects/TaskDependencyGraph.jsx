import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Circle, ArrowRight, Lock, Clock } from 'lucide-react';

const TASK_STATUS_COLORS = {
  todo: 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600',
  in_progress: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
  review: 'bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700',
  completed: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
  blocked: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
};

const DEPENDENCY_TYPE_COLORS = {
  FS: 'border-blue-400 bg-blue-50 text-blue-700',
  SS: 'border-green-400 bg-green-50 text-green-700',
  FF: 'border-purple-400 bg-purple-50 text-purple-700',
  SF: 'border-amber-400 bg-amber-50 text-amber-700'
};

const DEPENDENCY_TYPE_LABELS = {
  FS: 'Finish→Start',
  SS: 'Start→Start',
  FF: 'Finish→Finish',
  SF: 'Start→Finish'
};

export default function TaskDependencyGraph({ tasks }) {
  // Check for dependencies (new format or legacy)
  const tasksWithDeps = tasks.filter(t => 
    (t.dependencies && t.dependencies.length > 0) || 
    (t.depends_on && t.depends_on.length > 0)
  );
  
  if (tasksWithDeps.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <p className="text-sm">No task dependencies defined yet.</p>
        <p className="text-xs mt-1">Click the link icon on any task to add dependencies.</p>
      </div>
    );
  }

  // Helper to get dependency task IDs (handles both new and legacy format)
  const getDepTaskIds = (task) => {
    if (task.dependencies && task.dependencies.length > 0) {
      return task.dependencies.map(d => d.task_id);
    }
    return task.depends_on || [];
  };

  // Helper to get dependency info (type, lag)
  const getDepInfo = (task, depTaskId) => {
    if (task.dependencies && task.dependencies.length > 0) {
      const dep = task.dependencies.find(d => d.task_id === depTaskId);
      return dep || { type: 'FS', lag_days: 0 };
    }
    return { type: 'FS', lag_days: 0 };
  };

  // Group tasks by their dependency level
  const getLeveledTasks = () => {
    const levels = [];
    const assigned = new Set();
    
    // Level 0: Tasks with no dependencies
    const level0 = tasks.filter(t => {
      const depIds = getDepTaskIds(t);
      return depIds.length === 0;
    });
    levels.push(level0);
    level0.forEach(t => assigned.add(t.id));
    
    // Build subsequent levels
    let remaining = tasks.filter(t => !assigned.has(t.id));
    while (remaining.length > 0) {
      const nextLevel = remaining.filter(t => {
        const depIds = getDepTaskIds(t);
        return depIds.every(depId => assigned.has(depId));
      });
      
      if (nextLevel.length === 0) {
        levels.push(remaining);
        break;
      }
      
      levels.push(nextLevel);
      nextLevel.forEach(t => assigned.add(t.id));
      remaining = remaining.filter(t => !assigned.has(t.id));
    }
    
    return levels;
  };

  const levels = getLeveledTasks();

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="w-3 h-3 text-green-600" />;
    if (status === 'blocked') return <Lock className="w-3 h-3 text-red-500" />;
    return <Circle className="w-3 h-3 text-slate-400" />;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Dependency Flow
        </div>
        
        <div className="flex items-start gap-2 overflow-x-auto pb-4">
          {levels.map((levelTasks, levelIdx) => (
            <React.Fragment key={levelIdx}>
              <div className="flex flex-col gap-2 min-w-[160px]">
                <div className="text-[10px] text-slate-500 uppercase tracking-wide text-center mb-1">
                  {levelIdx === 0 ? 'Independent' : `Level ${levelIdx}`}
                </div>
                {levelTasks.map((task) => {
                  const depIds = getDepTaskIds(task);
                  const hasDeps = depIds.length > 0;
                  const depTasks = hasDeps 
                    ? depIds.map(id => tasks.find(t => t.id === id)).filter(Boolean)
                    : [];
                  
                  return (
                    <div
                      key={task.id}
                      className={`p-2 rounded-lg border text-xs ${TASK_STATUS_COLORS[task.status]}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {getStatusIcon(task.status)}
                        <span className="font-medium truncate text-slate-900 dark:text-white">{task.title}</span>
                      </div>
                      {hasDeps && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {depTasks.map(dep => {
                            const depInfo = getDepInfo(task, dep.id);
                            const typeColor = DEPENDENCY_TYPE_COLORS[depInfo.type] || DEPENDENCY_TYPE_COLORS.FS;
                            const typeLabel = DEPENDENCY_TYPE_LABELS[depInfo.type] || 'FS';
                            
                            return (
                              <Tooltip key={dep.id}>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[9px] px-1 py-0 cursor-help ${
                                      dep.status === 'completed' 
                                        ? 'border-green-400 text-green-700 dark:text-green-400' 
                                        : typeColor
                                    }`}
                                  >
                                    <span className="mr-0.5">{dep.status === 'completed' ? '✓' : depInfo.type}</span>
                                    {dep.title.slice(0, 8)}...
                                    {depInfo.lag_days !== 0 && (
                                      <span className="ml-0.5 flex items-center">
                                        <Clock className="w-2 h-2" />
                                        {depInfo.lag_days > 0 ? `+${depInfo.lag_days}` : depInfo.lag_days}
                                      </span>
                                    )}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="text-xs">
                                    <p className="font-medium">{dep.title}</p>
                                    <p className="text-slate-500">{typeLabel}</p>
                                    {depInfo.lag_days !== 0 && (
                                      <p className="text-slate-500">
                                        {depInfo.lag_days > 0 ? `+${depInfo.lag_days} days lag` : `${depInfo.lag_days} days lead`}
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {levelIdx < levels.length - 1 && (
                <div className="flex items-center justify-center min-w-[24px] pt-8">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 border-t pt-3">
          <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> Pending</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> Completed</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-red-500" /> Blocked</span>
          <span className="border-l border-slate-300 pl-3">
            <Badge className="text-[9px] bg-blue-50 text-blue-700 border-blue-400">FS</Badge> Finish→Start
          </span>
          <span>
            <Badge className="text-[9px] bg-green-50 text-green-700 border-green-400">SS</Badge> Start→Start
          </span>
          <span>
            <Badge className="text-[9px] bg-purple-50 text-purple-700 border-purple-400">FF</Badge> Finish→Finish
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}