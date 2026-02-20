import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Pause, Clock } from 'lucide-react';

export default function TaskTimeTracker({ 
  task, 
  projectId, 
  currentUser, 
  profile,
  timeEntries = [],
  onTimeUpdate 
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeEntry, setActiveEntry] = useState(null);
  const queryClient = useQueryClient();

  // Check for existing running entry on mount
  useEffect(() => {
    const runningEntry = timeEntries.find(
      te => te.task_id === task.id && te.user_id === currentUser?.email && te.is_running
    );
    if (runningEntry) {
      setActiveEntry(runningEntry);
      setIsRunning(true);
      const startTime = new Date(runningEntry.start_time);
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }
  }, [task.id, timeEntries, currentUser?.email]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskTimeEntry.create(data),
    onSuccess: (newEntry) => {
      setActiveEntry(newEntry);
      queryClient.invalidateQueries({ queryKey: ['projectTimeEntries', projectId] });
      onTimeUpdate?.();
    }
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TaskTimeEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTimeEntries', projectId] });
      onTimeUpdate?.();
    }
  });

  const startTimer = async () => {
    setIsRunning(true);
    setElapsedSeconds(0);
    
    createEntryMutation.mutate({
      task_id: task.id,
      project_id: projectId,
      user_id: currentUser?.email,
      user_name: profile?.display_name || currentUser?.full_name,
      start_time: new Date().toISOString(),
      is_running: true,
      duration_minutes: 0
    });
  };

  const stopTimer = async () => {
    if (!activeEntry) return;
    
    setIsRunning(false);
    const durationMinutes = Math.round(elapsedSeconds / 60);
    
    await updateEntryMutation.mutateAsync({
      id: activeEntry.id,
      data: {
        end_time: new Date().toISOString(),
        duration_minutes: durationMinutes,
        is_running: false
      }
    });
    
    setActiveEntry(null);
    setElapsedSeconds(0);
  };

  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total time for this task
  const totalMinutes = timeEntries
    .filter(te => te.task_id === task.id && !te.is_running)
    .reduce((sum, te) => sum + (te.duration_minutes || 0), 0);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={isRunning ? "default" : "outline"}
              className={`h-7 px-2 ${isRunning ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
              onClick={toggleTimer}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  {formatTime(elapsedSeconds)}
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRunning ? 'Stop timer' : 'Start time tracking'}
          </TooltipContent>
        </Tooltip>

        {totalMinutes > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              Total time logged for this task
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Summary component to show time per task/project
export function TimeTrackingSummary({ timeEntries, tasks, groupBy = 'task' }) {
  const grouped = {};
  
  timeEntries.forEach(entry => {
    if (entry.is_running) return;
    
    const key = groupBy === 'task' ? entry.task_id : entry.user_id;
    if (!grouped[key]) {
      grouped[key] = { minutes: 0, entries: [] };
    }
    grouped[key].minutes += entry.duration_minutes || 0;
    grouped[key].entries.push(entry);
  });

  const formatMinutes = (mins) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([key, data]) => {
        const task = tasks?.find(t => t.id === key);
        const label = groupBy === 'task' 
          ? (task?.title || 'Unknown Task')
          : (data.entries[0]?.user_name || 'Unknown User');
        
        return (
          <div key={key} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-sm truncate flex-1">{label}</span>
            <Badge variant="secondary" className="ml-2">
              {formatMinutes(data.minutes)}
            </Badge>
          </div>
        );
      })}
      
      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          No time entries yet
        </div>
      )}
    </div>
  );
}