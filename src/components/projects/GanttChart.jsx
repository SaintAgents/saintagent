import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { addDays, differenceInDays, format, parseISO, startOfDay, isValid, max, min } from 'date-fns';

const STATUS_COLORS = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  completed: '#10b981',
  blocked: '#ef4444',
};

const PRIORITY_BORDER = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#94a3b8',
};

const DAY_WIDTH = 36;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 240;
const HEADER_HEIGHT = 52;

function safeParseDate(d) {
  if (!d) return null;
  const p = parseISO(d);
  return isValid(p) ? startOfDay(p) : null;
}

export default function GanttChart({ tasks, projectStartDate, projectEndDate }) {
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [dragState, setDragState] = useState(null); // {taskId, type: 'move'|'resize-end', startX, origStart, origEnd}

  // Compute date range
  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    const allDates = [];
    tasks.forEach(t => {
      const s = safeParseDate(t.start_date);
      const e = safeParseDate(t.due_date);
      if (s) allDates.push(s);
      if (e) allDates.push(e);
    });
    if (projectStartDate) { const d = safeParseDate(projectStartDate); if (d) allDates.push(d); }
    if (projectEndDate) { const d = safeParseDate(projectEndDate); if (d) allDates.push(d); }

    if (allDates.length === 0) {
      const today = startOfDay(new Date());
      return { rangeStart: today, rangeEnd: addDays(today, 30), totalDays: 30 };
    }
    const earliest = addDays(min(allDates), -3);
    const latest = addDays(max(allDates), 7);
    return { rangeStart: earliest, rangeEnd: latest, totalDays: Math.max(differenceInDays(latest, earliest), 14) };
  }, [tasks, projectStartDate, projectEndDate]);

  // Build dependency map
  const depEdges = useMemo(() => {
    const edges = [];
    tasks.forEach(t => {
      const deps = t.dependencies || [];
      deps.forEach(d => {
        if (d.task_id) edges.push({ from: d.task_id, to: t.id, type: d.type || 'FS' });
      });
      (t.depends_on || []).forEach(depId => {
        if (!deps.find(d => d.task_id === depId)) {
          edges.push({ from: depId, to: t.id, type: 'FS' });
        }
      });
    });
    return edges;
  }, [tasks]);

  const taskIndex = useMemo(() => {
    const m = {};
    tasks.forEach((t, i) => { m[t.id] = i; });
    return m;
  }, [tasks]);

  // Save mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, start_date, due_date }) =>
      base44.entities.ProjectTask.update(taskId, { start_date, due_date }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectTasks'] }),
  });

  // Drag handlers
  const handleMouseDown = useCallback((e, task, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      taskId: task.id,
      type,
      startX: e.clientX,
      origStart: task.start_date,
      origEnd: task.due_date,
    });
  }, []);

  useEffect(() => {
    if (!dragState) return;
    const handleMouseMove = (e) => {
      const dx = e.clientX - dragState.startX;
      const daysDelta = Math.round(dx / DAY_WIDTH);
      if (daysDelta === 0) return;

      const origStart = safeParseDate(dragState.origStart);
      const origEnd = safeParseDate(dragState.origEnd);
      if (!origStart || !origEnd) return;

      setDragState(prev => ({ ...prev, daysDelta }));
    };

    const handleMouseUp = () => {
      const dd = dragState.daysDelta || 0;
      if (dd !== 0) {
        const origStart = safeParseDate(dragState.origStart);
        const origEnd = safeParseDate(dragState.origEnd);
        if (origStart && origEnd) {
          let newStart, newEnd;
          if (dragState.type === 'move') {
            newStart = addDays(origStart, dd);
            newEnd = addDays(origEnd, dd);
          } else {
            newStart = origStart;
            newEnd = addDays(origEnd, dd);
            if (newEnd <= newStart) newEnd = addDays(newStart, 1);
          }
          updateTaskMutation.mutate({
            taskId: dragState.taskId,
            start_date: format(newStart, 'yyyy-MM-dd'),
            due_date: format(newEnd, 'yyyy-MM-dd'),
          });
        }
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, updateTaskMutation]);

  // Compute bar positions
  const getBarProps = useCallback((task) => {
    let s = safeParseDate(task.start_date);
    let e = safeParseDate(task.due_date);
    if (!s && !e) return null;
    if (!s) s = addDays(e, -3);
    if (!e) e = addDays(s, 3);

    // Apply drag delta
    if (dragState?.taskId === task.id) {
      const dd = dragState.daysDelta || 0;
      if (dragState.type === 'move') {
        s = addDays(s, dd);
        e = addDays(e, dd);
      } else {
        e = addDays(e, dd);
        if (e <= s) e = addDays(s, 1);
      }
    }

    const left = differenceInDays(s, rangeStart) * DAY_WIDTH;
    const width = Math.max(differenceInDays(e, s), 1) * DAY_WIDTH;
    return { left, width, start: s, end: e };
  }, [rangeStart, dragState]);

  // Generate day headers
  const dayHeaders = useMemo(() => {
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(rangeStart, i);
      days.push(d);
    }
    return days;
  }, [rangeStart, totalDays]);

  const today = startOfDay(new Date());
  const todayOffset = differenceInDays(today, rangeStart) * DAY_WIDTH;

  // No tasks with dates
  const tasksWithDates = tasks.filter(t => t.start_date || t.due_date);
  if (tasksWithDates.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">No tasks have start/due dates set. Add dates to tasks to see the Gantt chart.</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden select-none">
        <div className="flex">
          {/* Left labels */}
          <div className="shrink-0 border-r border-slate-200 dark:border-slate-700" style={{ width: LABEL_WIDTH }}>
            <div className="h-[52px] border-b border-slate-200 dark:border-slate-700 px-3 flex items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Task</span>
            </div>
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 px-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/50" style={{ height: ROW_HEIGHT }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[task.status] || '#94a3b8' }} />
                <span className="text-xs font-medium truncate flex-1">{task.title}</span>
                {task.assignee_avatar && (
                  <Avatar className="w-5 h-5 shrink-0">
                    <AvatarImage src={task.assignee_avatar} />
                    <AvatarFallback className="text-[8px]">{task.assignee_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>

          {/* Right scrollable gantt area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
            <div style={{ width: totalDays * DAY_WIDTH, minHeight: HEADER_HEIGHT + tasks.length * ROW_HEIGHT }} className="relative">
              {/* Day headers */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 bg-white dark:bg-slate-800" style={{ height: HEADER_HEIGHT }}>
                {dayHeaders.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = differenceInDays(d, today) === 0;
                  return (
                    <div
                      key={i}
                      className={`shrink-0 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-700/30 text-[10px] ${
                        isToday ? 'bg-violet-50 dark:bg-violet-900/20 font-bold text-violet-600' :
                        isWeekend ? 'bg-slate-50 dark:bg-slate-700/20 text-slate-400' : 'text-slate-500'
                      }`}
                      style={{ width: DAY_WIDTH }}
                    >
                      <span>{format(d, 'EEE')}</span>
                      <span className="font-medium">{format(d, 'd')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grid rows */}
              {tasks.map((task, rowIdx) => (
                <div
                  key={task.id}
                  className="absolute w-full border-b border-slate-50 dark:border-slate-700/30"
                  style={{ top: HEADER_HEIGHT + rowIdx * ROW_HEIGHT, height: ROW_HEIGHT }}
                >
                  {/* Weekend shading */}
                  {dayHeaders.map((d, i) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    if (!isWeekend) return null;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 bg-slate-50/50 dark:bg-slate-700/10"
                        style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                      />
                    );
                  })}
                </div>
              ))}

              {/* Today line */}
              {todayOffset >= 0 && todayOffset <= totalDays * DAY_WIDTH && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-violet-500 z-20 pointer-events-none"
                  style={{ left: todayOffset + DAY_WIDTH / 2 }}
                >
                  <div className="absolute -top-0 -translate-x-1/2 bg-violet-500 text-white text-[9px] px-1.5 py-0.5 rounded-b font-medium">
                    Today
                  </div>
                </div>
              )}

              {/* Dependency arrows */}
              <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: totalDays * DAY_WIDTH, height: HEADER_HEIGHT + tasks.length * ROW_HEIGHT }}>
                {depEdges.map((edge, ei) => {
                  const fromIdx = taskIndex[edge.from];
                  const toIdx = taskIndex[edge.to];
                  if (fromIdx === undefined || toIdx === undefined) return null;
                  const fromTask = tasks[fromIdx];
                  const toTask = tasks[toIdx];
                  const fromBar = getBarProps(fromTask);
                  const toBar = getBarProps(toTask);
                  if (!fromBar || !toBar) return null;

                  const fromX = fromBar.left + fromBar.width;
                  const fromY = HEADER_HEIGHT + fromIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
                  const toX = toBar.left;
                  const toY = HEADER_HEIGHT + toIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
                  const midX = fromX + 12;

                  return (
                    <g key={ei}>
                      <path
                        d={`M${fromX},${fromY} L${midX},${fromY} L${midX},${toY} L${toX},${toY}`}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="1.5"
                        strokeDasharray="4,3"
                        opacity="0.7"
                      />
                      <polygon
                        points={`${toX},${toY} ${toX - 5},${toY - 3} ${toX - 5},${toY + 3}`}
                        fill="#a78bfa"
                        opacity="0.8"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Task bars */}
              {tasks.map((task, rowIdx) => {
                const bar = getBarProps(task);
                if (!bar) return null;
                const isDragging = dragState?.taskId === task.id;
                const color = STATUS_COLORS[task.status] || '#94a3b8';
                const borderColor = PRIORITY_BORDER[task.priority] || '#94a3b8';

                return (
                  <Tooltip key={task.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute rounded-md flex items-center gap-1.5 px-2 overflow-hidden transition-shadow ${
                          isDragging ? 'shadow-lg ring-2 ring-violet-400 z-30 opacity-90' : 'shadow-sm hover:shadow-md z-20 cursor-grab'
                        }`}
                        style={{
                          left: bar.left,
                          top: HEADER_HEIGHT + rowIdx * ROW_HEIGHT + 6,
                          width: bar.width,
                          height: ROW_HEIGHT - 12,
                          backgroundColor: color + '22',
                          borderLeft: `3px solid ${borderColor}`,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                      >
                        <span className="text-[10px] font-medium truncate" style={{ color }}>{task.title}</span>

                        {/* Resize handle */}
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r"
                          onMouseDown={(e) => handleMouseDown(e, task, 'resize-end')}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[200px]">
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-slate-400">
                        {bar.start ? format(bar.start, 'MMM d') : '?'} → {bar.end ? format(bar.end, 'MMM d') : '?'}
                      </p>
                      <p className="capitalize">{task.status?.replace('_', ' ')} · {task.priority}</p>
                      {task.assignee_name && <p>Assigned: {task.assignee_name}</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}