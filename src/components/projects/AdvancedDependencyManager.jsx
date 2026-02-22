import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Link2, Unlink, AlertTriangle, CheckCircle2, Lock, Plus, Trash2, ArrowRight, Clock } from 'lucide-react';

// Dependency type descriptions
const DEPENDENCY_TYPES = {
  FS: { label: 'Finish-to-Start', desc: 'Successor starts after predecessor finishes', color: 'bg-blue-100 text-blue-700' },
  SS: { label: 'Start-to-Start', desc: 'Both tasks start together', color: 'bg-green-100 text-green-700' },
  FF: { label: 'Finish-to-Finish', desc: 'Both tasks finish together', color: 'bg-purple-100 text-purple-700' },
  SF: { label: 'Start-to-Finish', desc: 'Successor finishes when predecessor starts', color: 'bg-amber-100 text-amber-700' }
};

export default function AdvancedDependencyManager({ 
  task, 
  allTasks, 
  onSave, 
  onClose 
}) {
  // Convert legacy depends_on to new format if needed
  const initialDeps = (task.dependencies && task.dependencies.length > 0) 
    ? task.dependencies 
    : (task.depends_on || []).map(id => ({ task_id: id, type: 'FS', lag_days: 0 }));
  
  const [dependencies, setDependencies] = useState(initialDeps);
  
  // Filter out the current task and tasks that would create circular deps
  const availableTasks = allTasks.filter(t => {
    if (t.id === task.id) return false;
    if (wouldCreateCircularDep(t, task.id, allTasks)) return false;
    // Also filter out tasks already in dependencies
    if (dependencies.some(d => d.task_id === t.id)) return false;
    return true;
  });

  const addDependency = (taskId) => {
    if (!taskId) return;
    setDependencies(prev => [...prev, { task_id: taskId, type: 'FS', lag_days: 0 }]);
  };

  const updateDependency = (index, field, value) => {
    setDependencies(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeDependency = (index) => {
    setDependencies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Also update legacy depends_on for backward compatibility
    const legacyDeps = dependencies.map(d => d.task_id);
    onSave({ dependencies, depends_on: legacyDeps });
    onClose();
  };

  // Check if adding this dependency would create a circular reference
  function wouldCreateCircularDep(sourceTask, targetId, allTasks, visited = new Set()) {
    if (visited.has(sourceTask.id)) return false;
    visited.add(sourceTask.id);
    
    const deps = sourceTask.dependencies?.map(d => d.task_id) || sourceTask.depends_on || [];
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
    return { icon: null, color: 'text-slate-500', label: t.status?.replace('_', ' ') };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Manage Dependencies
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Define which tasks must be completed (or started) before <strong className="text-slate-900 dark:text-white">"{task.title}"</strong>:
          </div>

          {/* Current Dependencies */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-slate-500">Current Dependencies</Label>
            {dependencies.length === 0 ? (
              <div className="text-center py-4 text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Unlink className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-sm">No dependencies defined</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dependencies.map((dep, index) => {
                  const depTask = allTasks.find(t => t.id === dep.task_id);
                  if (!depTask) return null;
                  const status = getTaskStatus(depTask);
                  const typeInfo = DEPENDENCY_TYPES[dep.type] || DEPENDENCY_TYPES.FS;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {status.icon && <status.icon className={`w-3.5 h-3.5 ${status.color}`} />}
                          <span className="font-medium text-sm truncate text-slate-900 dark:text-white">
                            {depTask.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select 
                            value={dep.type} 
                            onValueChange={(v) => updateDependency(index, 'type', v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(DEPENDENCY_TYPES).map(([key, info]) => (
                                <SelectItem key={key} value={key} className="text-xs">
                                  <div>
                                    <div className="font-medium">{info.label}</div>
                                    <div className="text-[10px] text-slate-500">{info.desc}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <Input
                              type="number"
                              value={dep.lag_days}
                              onChange={(e) => updateDependency(index, 'lag_days', parseInt(e.target.value) || 0)}
                              className="h-7 w-16 text-xs text-center"
                            />
                            <span className="text-xs text-slate-500">days</span>
                          </div>
                          
                          <Badge className={`text-[10px] ${typeInfo.color}`}>
                            {dep.lag_days > 0 ? `+${dep.lag_days}d lag` : dep.lag_days < 0 ? `${dep.lag_days}d lead` : 'No lag'}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeDependency(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Dependency */}
          <div className="border-t pt-4">
            <Label className="text-xs uppercase tracking-wide text-slate-500 mb-2 block">Add Dependency</Label>
            {availableTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">No more tasks available to add as dependencies</p>
            ) : (
              <ScrollArea className="h-40 border rounded-lg p-2">
                <div className="space-y-1">
                  {availableTasks.map((t) => {
                    const status = getTaskStatus(t);
                    return (
                      <div 
                        key={t.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => addDependency(t.id)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {status.icon && <status.icon className={`w-3.5 h-3.5 ${status.color}`} />}
                          <span className="text-sm truncate text-slate-900 dark:text-white">{t.title}</span>
                          <span className={`text-xs ${status.color}`}>({status.label})</span>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Dependency Type Legend */}
          <div className="border-t pt-3">
            <Label className="text-xs uppercase tracking-wide text-slate-500 mb-2 block">Dependency Types</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(DEPENDENCY_TYPES).map(([key, info]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge className={`${info.color} text-[10px]`}>{key}</Badge>
                  <span className="text-slate-600 dark:text-slate-400">{info.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              <strong>Lag:</strong> Positive = delay after, Negative = overlap (lead time)
            </p>
          </div>
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
export function isTaskBlockedAdvanced(task, allTasks) {
  const deps = task.dependencies || [];
  if (deps.length === 0) {
    // Fall back to legacy
    if (!task.depends_on || task.depends_on.length === 0) return false;
    return task.depends_on.some(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask && depTask.status !== 'completed';
    });
  }
  
  return deps.some(dep => {
    const depTask = allTasks.find(t => t.id === dep.task_id);
    if (!depTask) return false;
    
    switch (dep.type) {
      case 'FS': // Finish-to-Start: predecessor must be completed
        return depTask.status !== 'completed';
      case 'SS': // Start-to-Start: predecessor must have started
        return depTask.status === 'todo';
      case 'FF': // Finish-to-Finish: both finish together (can start independently)
        return false; // No blocking on start
      case 'SF': // Start-to-Finish: predecessor must have started for this to finish
        return false; // No blocking on start
      default:
        return depTask.status !== 'completed';
    }
  });
}

// Get incomplete dependencies for a task
export function getBlockingTasksAdvanced(task, allTasks) {
  const deps = task.dependencies || [];
  if (deps.length === 0) {
    // Fall back to legacy
    if (!task.depends_on || task.depends_on.length === 0) return [];
    return task.depends_on
      .map(depId => allTasks.find(t => t.id === depId))
      .filter(t => t && t.status !== 'completed');
  }
  
  return deps
    .map(dep => {
      const depTask = allTasks.find(t => t.id === dep.task_id);
      if (!depTask) return null;
      
      let isBlocking = false;
      switch (dep.type) {
        case 'FS':
          isBlocking = depTask.status !== 'completed';
          break;
        case 'SS':
          isBlocking = depTask.status === 'todo';
          break;
        default:
          isBlocking = false;
      }
      
      return isBlocking ? { ...depTask, depType: dep.type, lagDays: dep.lag_days } : null;
    })
    .filter(Boolean);
}

// Calculate earliest start date based on dependencies
export function calculateEarliestStart(task, allTasks) {
  const deps = task.dependencies || [];
  if (deps.length === 0) return task.start_date ? new Date(task.start_date) : null;
  
  let earliestStart = null;
  
  deps.forEach(dep => {
    const depTask = allTasks.find(t => t.id === dep.task_id);
    if (!depTask) return;
    
    let depDate = null;
    
    switch (dep.type) {
      case 'FS': // Can start after predecessor finishes
        if (depTask.due_date) {
          depDate = new Date(depTask.due_date);
          depDate.setDate(depDate.getDate() + 1 + (dep.lag_days || 0));
        }
        break;
      case 'SS': // Can start when predecessor starts
        if (depTask.start_date) {
          depDate = new Date(depTask.start_date);
          depDate.setDate(depDate.getDate() + (dep.lag_days || 0));
        }
        break;
      case 'FF': // Must finish when predecessor finishes
      case 'SF': // Finishes when predecessor starts
        // These don't directly constrain start date
        break;
    }
    
    if (depDate && (!earliestStart || depDate > earliestStart)) {
      earliestStart = depDate;
    }
  });
  
  return earliestStart;
}