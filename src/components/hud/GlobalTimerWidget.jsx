import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Timer,
  Play,
  Square,
  Sparkles,
  Search,
  Loader2,
  FolderOpen,
  Clock,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function GlobalTimerWidget({ currentUser, currentPageName }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [genericLabel, setGenericLabel] = useState('');
  const intervalRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch user's assigned tasks
  const { data: myTasks = [] } = useQuery({
    queryKey: ['globalTimerTasks', currentUser?.email],
    queryFn: () => base44.entities.ProjectTask.filter({ assignee_id: currentUser.email }, '-updated_date', 100),
    enabled: !!currentUser?.email,
    staleTime: 60000,
  });

  // Fetch projects for task context
  const { data: projects = [] } = useQuery({
    queryKey: ['globalTimerProjects'],
    queryFn: () => base44.entities.Project.list('-updated_date', 100),
    staleTime: 120000,
  });

  // Find running timer
  const { data: runningEntries = [] } = useQuery({
    queryKey: ['runningTimer', currentUser?.email],
    queryFn: () => base44.entities.TaskTimeEntry.filter({ user_id: currentUser.email, is_running: true }, '-created_date', 1),
    enabled: !!currentUser?.email,
    staleTime: 5000,
    refetchInterval: 30000,
  });

  const runningEntry = runningEntries[0] || null;
  const runningTask = runningEntry?.task_id ? myTasks.find(t => t.id === runningEntry.task_id) : null;
  const isGenericTimer = runningEntry && !runningEntry.task_id;

  // Tick the timer
  useEffect(() => {
    if (runningEntry?.start_time) {
      const tick = () => {
        const start = new Date(runningEntry.start_time).getTime();
        setElapsed(Math.floor((Date.now() - start) / 1000));
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
      return () => clearInterval(intervalRef.current);
    } else {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [runningEntry?.id, runningEntry?.start_time]);

  const projectMap = {};
  projects.forEach(p => { projectMap[p.id] = p; });

  // Stop any running timer helper
  const stopRunning = async () => {
    if (!runningEntry) return;
    const dur = Math.floor((Date.now() - new Date(runningEntry.start_time).getTime()) / 60000);
    await base44.entities.TaskTimeEntry.update(runningEntry.id, {
      is_running: false,
      end_time: new Date().toISOString(),
      duration_minutes: Math.max(dur, 1),
    });
  };

  // Start timer on a task
  const startMutation = useMutation({
    mutationFn: async (task) => {
      await stopRunning();
      return base44.entities.TaskTimeEntry.create({
        task_id: task.id,
        project_id: task.project_id || '',
        user_id: currentUser.email,
        user_name: currentUser.full_name,
        start_time: new Date().toISOString(),
        is_running: true,
        description: '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTimer'] });
      setOpen(false);
    },
  });

  // Start generic timer
  const startGenericMutation = useMutation({
    mutationFn: async (label) => {
      await stopRunning();
      return base44.entities.TaskTimeEntry.create({
        task_id: '',
        project_id: '',
        user_id: currentUser.email,
        user_name: currentUser.full_name,
        start_time: new Date().toISOString(),
        is_running: true,
        description: label || 'Time block',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTimer'] });
      setGenericLabel('');
      setOpen(false);
    },
  });

  // Stop timer
  const stopMutation = useMutation({
    mutationFn: stopRunning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTimer'] });
    },
  });

  // AI suggestion
  const suggestTask = useCallback(async () => {
    if (aiLoading) return;
    const activeTasks = myTasks.filter(t => t.status !== 'completed');
    if (activeTasks.length === 0) {
      setAiSuggestion({ task_id: '', reason: 'No active tasks found. Try the generic timer!' });
      return;
    }
    setAiLoading(true);
    setAiSuggestion(null);

    const taskList = activeTasks.slice(0, 20).map(t => {
      const proj = projectMap[t.project_id];
      return `- ID:${t.id} | "${t.title}" | Project: "${proj?.title || 'Unknown'}" | Status: ${t.status} | Priority: ${t.priority}`;
    }).join('\n');

    const prompt = `The user is currently on the "${currentPageName}" page of a project management platform. Based on this page context, suggest which task they are most likely working on right now.

Their active tasks:
${taskList}

Page context hints:
- "Projects" or "ProjectTrack" → likely working on project tasks
- "Missions" or "MissionDetail" → mission-related tasks
- "CRM" or "Deals" → sales/CRM tasks
- "Studio" or "ContentStudio" → content/creative tasks
- "CommandDeck" → general high-priority tasks
- Other pages → suggest their highest priority incomplete task

Return JSON: {"task_id": "...", "reason": "brief 1-sentence reason"}`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            task_id: { type: "string" },
            reason: { type: "string" },
          },
        },
      });
      setAiSuggestion(res);
    } catch (err) {
      console.error('AI suggest failed:', err);
      setAiSuggestion({ task_id: '', reason: 'Could not generate suggestion. Try selecting a task manually.' });
    } finally {
      setAiLoading(false);
    }
  }, [currentPageName, myTasks, projectMap, aiLoading]);

  // Filter tasks
  const activeTasks = myTasks.filter(t => t.status !== 'completed');
  const filtered = search
    ? activeTasks.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) || projectMap[t.project_id]?.title?.toLowerCase().includes(search.toLowerCase()))
    : activeTasks;

  const suggestedTask = aiSuggestion?.task_id ? activeTasks.find(t => t.id === aiSuggestion.task_id) : null;
  const isRunning = !!runningEntry;

  const runningLabel = isGenericTimer
    ? (runningEntry.description || 'Time block')
    : (runningTask?.title || 'Task');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-xl relative group w-8 h-8 md:w-9 md:h-9",
            isRunning && "bg-emerald-50 hover:bg-emerald-100"
          )}
          title={isRunning ? `Tracking: ${runningLabel}` : "Time Tracker"}
        >
          {isRunning ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-medium text-emerald-700 hidden md:inline">
                {formatElapsed(elapsed)}
              </span>
            </div>
          ) : (
            <Timer className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
          )}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
            {isRunning ? 'Timer Running' : 'Time Tracker'}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[calc(100vw-1rem)] md:w-96 max-w-96 p-0"
        style={{ zIndex: 10002 }}
      >
        {/* Running Timer Banner */}
        {isRunning && (
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs text-emerald-600 font-medium">Currently tracking</p>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {runningLabel}
                </p>
                {!isGenericTimer && runningEntry.project_id && (
                  <p className="text-xs text-slate-500 truncate">
                    {projectMap[runningEntry.project_id]?.title || 'Project'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg font-mono font-bold text-emerald-700">
                  {formatElapsed(elapsed)}
                </span>
                <Button
                  size="icon"
                  variant="destructive"
                  className="w-8 h-8 rounded-full"
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Timer Section */}
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">Quick Timer</p>
          <div className="flex gap-2">
            <Input
              placeholder="What are you working on?"
              value={genericLabel}
              onChange={(e) => setGenericLabel(e.target.value)}
              className="h-8 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  startGenericMutation.mutate(genericLabel);
                }
              }}
            />
            <Button
              size="sm"
              className="h-8 bg-emerald-600 hover:bg-emerald-700 gap-1 px-3 shrink-0"
              onClick={() => startGenericMutation.mutate(genericLabel)}
              disabled={startGenericMutation.isPending}
            >
              <Play className="w-3 h-3" />
              Start
            </Button>
          </div>
        </div>

        {/* Task Header with AI + Search */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-violet-600" />
              {isRunning ? 'Switch to Task' : 'Start on Task'}
            </h3>
            {activeTasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={suggestTask}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-violet-600" />
                )}
                AI Suggest
              </Button>
            )}
          </div>
          {activeTasks.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          )}
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div
            className={cn(
              "px-4 py-2.5 bg-violet-50 border-b border-violet-100 transition-colors",
              suggestedTask && "cursor-pointer hover:bg-violet-100"
            )}
            onClick={() => suggestedTask && startMutation.mutate(suggestedTask)}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-medium text-violet-700">AI Suggestion</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                {suggestedTask ? (
                  <>
                    <p className="text-sm font-medium text-slate-900 truncate">{suggestedTask.title}</p>
                    <p className="text-xs text-slate-500 truncate">{aiSuggestion.reason}</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-600">{aiSuggestion.reason}</p>
                )}
              </div>
              {suggestedTask && <Play className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>
          </div>
        )}

        {/* Task List */}
        <ScrollArea className="h-52">
          {activeTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <FolderOpen className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No assigned tasks</p>
              <p className="text-xs mt-1">Use the quick timer above</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Search className="w-6 h-6 mb-2 opacity-50" />
              <p className="text-sm">No tasks match "{search}"</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.slice(0, 20).map(task => {
                const proj = projectMap[task.project_id];
                const isActive = runningEntry?.task_id === task.id;
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors",
                      isActive && "bg-emerald-50"
                    )}
                    onClick={() => {
                      if (isActive) {
                        stopMutation.mutate();
                      } else {
                        startMutation.mutate(task);
                      }
                    }}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                      isActive ? "bg-red-100" : "bg-emerald-100"
                    )}>
                      {isActive ? (
                        <Square className="w-3 h-3 text-red-600 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 text-emerald-600 ml-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {proj?.title || 'Project'} • {task.priority || 'medium'}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] shrink-0",
                        task.status === 'in_progress' ? "border-blue-200 text-blue-700" :
                        task.status === 'review' ? "border-amber-200 text-amber-700" :
                        "border-slate-200 text-slate-500"
                      )}
                    >
                      {task.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}