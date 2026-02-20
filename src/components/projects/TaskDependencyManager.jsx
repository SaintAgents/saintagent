import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Link2, Unlink, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export default function TaskDependencyManager({ 
  task, 
  allTasks, 
  onSave, 
  onClose 
}) {
  const [selectedDeps, setSelectedDeps] = useState(task.depends_on || []);
  
  // Filter out the current task and tasks that depend on this task (to avoid circular deps)
  const availableTasks = allTasks.filter(t => {
    if (t.id === task.id) return false;
    // Check for circular dependency - if this task is in t's dependency chain
    if (wouldCreateCircularDep(t, task.id, allTasks)) return false;
    return true;
  });

  const toggleDependency = (taskId) => {
    setSelectedDeps(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSave = () => {
    onSave(selectedDeps);
    onClose();
  };

  // Check if adding this dependency would create a circular reference
  function wouldCreateCircularDep(sourceTask, targetId, allTasks, visited = new Set()) {
    if (visited.has(sourceTask.id)) return false;
    visited.add(sourceTask.id);
    
    const deps = sourceTask.depends_on || [];
    if (deps.includes(targetId)) return true;
    
    for (const depId of deps) {
      const depTask = allTasks.find(t => t.id === depId);
      if (depTask && wouldCreateCircularDep(depTask, targetId, allTasks, visited)) {
        return true;
      }
    }
    return false;
  }

  const getTaskStatus = (t) => {
    if (t.status === 'completed') return { icon: CheckCircle2, color: 'text-green-500', label: 'Completed' };
    if (t.status === 'blocked') return { icon: AlertTriangle, color: 'text-red-500', label: 'Blocked' };
    return { icon: null, color: 'text-slate-500', label: t.status };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Manage Dependencies
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Select tasks that must be completed before <strong className="text-slate-900 dark:text-white">"{task.title}"</strong> can begin:
          </div>

          <ScrollArea className="h-64 border rounded-lg p-2">
            {availableTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Unlink className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No other tasks available</p>
              </div>
            ) : (
              <div className="space-y-1">
                {availableTasks.map((t) => {
                  const status = getTaskStatus(t);
                  const isSelected = selectedDeps.includes(t.id);
                  
                  return (
                    <div 
                      key={t.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => toggleDependency(t.id)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleDependency(t.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-slate-900 dark:text-white">
                          {t.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {status.icon && <status.icon className={`w-3 h-3 ${status.color}`} />}
                          <span className={status.color}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {selectedDeps.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedDeps.map(depId => {
                const depTask = allTasks.find(t => t.id === depId);
                return depTask ? (
                  <Badge 
                    key={depId} 
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                    onClick={() => toggleDependency(depId)}
                  >
                    {depTask.title} ×
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white">
            Save Dependencies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to check if a task is blocked by incomplete dependencies
export function isTaskBlocked(task, allTasks) {
  if (!task.depends_on || task.depends_on.length === 0) return false;
  
  return task.depends_on.some(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status !== 'completed';
  });
}

// Get incomplete dependencies for a task
export function getBlockingTasks(task, allTasks) {
  if (!task.depends_on || task.depends_on.length === 0) return [];
  
  return task.depends_on
    .map(depId => allTasks.find(t => t.id === depId))
    .filter(t => t && t.status !== 'completed');
}