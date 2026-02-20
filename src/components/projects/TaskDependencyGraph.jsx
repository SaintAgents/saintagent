import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, Lock } from 'lucide-react';

const TASK_STATUS_COLORS = {
  todo: 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600',
  in_progress: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
  review: 'bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700',
  completed: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
  blocked: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
};

export default function TaskDependencyGraph({ tasks }) {
  // Build dependency chains for visualization
  const tasksWithDeps = tasks.filter(t => t.depends_on && t.depends_on.length > 0);
  
  if (tasksWithDeps.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <p className="text-sm">No task dependencies defined yet.</p>
        <p className="text-xs mt-1">Click the link icon on any task to add dependencies.</p>
      </div>
    );
  }

  // Group tasks by their dependency level
  const getLeveledTasks = () => {
    const levels = [];
    const assigned = new Set();
    
    // Level 0: Tasks with no dependencies
    const level0 = tasks.filter(t => !t.depends_on || t.depends_on.length === 0);
    levels.push(level0);
    level0.forEach(t => assigned.add(t.id));
    
    // Build subsequent levels
    let remaining = tasks.filter(t => !assigned.has(t.id));
    while (remaining.length > 0) {
      const nextLevel = remaining.filter(t => {
        const deps = t.depends_on || [];
        return deps.every(depId => assigned.has(depId));
      });
      
      if (nextLevel.length === 0) {
        // Remaining tasks have unresolved deps, add them to last level
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
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Dependency Flow
      </div>
      
      <div className="flex items-start gap-2 overflow-x-auto pb-4">
        {levels.map((levelTasks, levelIdx) => (
          <React.Fragment key={levelIdx}>
            <div className="flex flex-col gap-2 min-w-[140px]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide text-center mb-1">
                {levelIdx === 0 ? 'Independent' : `Level ${levelIdx}`}
              </div>
              {levelTasks.map((task) => {
                const hasDeps = task.depends_on && task.depends_on.length > 0;
                const depTasks = hasDeps 
                  ? task.depends_on.map(id => tasks.find(t => t.id === id)).filter(Boolean)
                  : [];
                const isBlocked = depTasks.some(d => d.status !== 'completed');
                
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
                        {depTasks.map(dep => (
                          <Badge 
                            key={dep.id}
                            variant="outline" 
                            className={`text-[9px] px-1 py-0 ${
                              dep.status === 'completed' 
                                ? 'border-green-400 text-green-700 dark:text-green-400' 
                                : 'border-amber-400 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {dep.status === 'completed' ? '✓' : '⏳'} {dep.title.slice(0, 10)}...
                          </Badge>
                        ))}
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
      </div>
    </div>
  );
}