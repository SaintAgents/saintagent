import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { addDays, differenceInDays, format, parseISO, startOfDay, isValid, max, min } from 'date-fns';
import { GripVertical, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAY_WIDTH = 40;
const ROW_HEIGHT = 52;
const LABEL_WIDTH = 260;
const HEADER_HEIGHT = 56;

const STATUS_COLORS = {
  todo: { bg: '#94a3b833', border: '#94a3b8', text: '#64748b' },
  in_progress: { bg: '#3b82f622', border: '#3b82f6', text: '#2563eb' },
  completed: { bg: '#10b98122', border: '#10b981', text: '#059669' },
};

function safeDate(d) {
  if (!d) return null;
  const p = typeof d === 'string' ? parseISO(d) : d;
  return isValid(p) ? startOfDay(p) : null;
}

function buildRows(mission) {
  const rows = [];
  const milestones = (mission.milestones || []).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Add mission-level row
  rows.push({
    id: '__mission__',
    type: 'mission',
    label: mission.title,
    start: safeDate(mission.start_time),
    end: safeDate(mission.end_time),
    status: mission.status,
    isMission: true,
  });

  milestones.forEach((m, mi) => {
    const tasks = m.tasks || [];
    const doneCount = tasks.filter(t => t.status === 'completed' || t.completed).length;
    rows.push({
      id: m.id || `ms-${mi}`,
      type: 'milestone',
      label: m.title || `Milestone ${mi + 1}`,
      start: safeDate(m.due_date) ? addDays(safeDate(m.due_date), -7) : null,
      end: safeDate(m.due_date),
      dueDate: m.due_date,
      completed: m.completed,
      status: m.completed ? 'completed' : doneCount > 0 ? 'in_progress' : 'todo',
      milestoneIndex: mi,
      taskCount: tasks.length,
      doneCount,
    });

    tasks.forEach((t, ti) => {
      const status = t.status || (t.completed ? 'completed' : 'todo');
      rows.push({
        id: t.id || `ms-${mi}-t-${ti}`,
        type: 'task',
        label: t.title,
        status,
        milestoneIndex: mi,
        taskIndex: ti,
        start: null,
        end: null,
      });
    });
  });

  // Top-level tasks
  (mission.tasks || []).forEach((t, ti) => {
    const status = t.status || (t.completed ? 'completed' : 'todo');
    rows.push({
      id: t.id || `task-${ti}`,
      type: 'task',
      label: t.title,
      status,
      start: null,
      end: null,
    });
  });

  return rows;
}

export default function MissionGanttChart({ mission, onUpdateMission, isSaving }) {
  const scrollRef = useRef(null);
  const [dragState, setDragState] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  const rows = useMemo(() => buildRows(mission), [mission]);

  // Merge pending changes into rows for display
  const displayRows = useMemo(() => {
    return rows.map(r => {
      const change = pendingChanges[r.id];
      if (!change) return r;
      return { ...r, start: change.start ?? r.start, end: change.end ?? r.end };
    });
  }, [rows, pendingChanges]);

  // Compute date range from all rows
  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    const dates = [];
    displayRows.forEach(r => {
      if (r.start) dates.push(r.start);
      if (r.end) dates.push(r.end);
    });
    if (dates.length === 0) {
      const today = startOfDay(new Date());
      return { rangeStart: addDays(today, -7), rangeEnd: addDays(today, 60), totalDays: 67 };
    }
    const earliest = addDays(min(dates), -5);
    const latest = addDays(max(dates), 10);
    const total = Math.max(differenceInDays(latest, earliest), 30);
    return { rangeStart: earliest, rangeEnd: latest, totalDays: total };
  }, [displayRows]);

  const dayHeaders = useMemo(() => {
    const days = [];
    for (let i = 0; i < totalDays; i++) days.push(addDays(rangeStart, i));
    return days;
  }, [rangeStart, totalDays]);

  const today = startOfDay(new Date());
  const todayOffset = differenceInDays(today, rangeStart) * DAY_WIDTH;

  // Bar position calculator
  const getBarProps = useCallback((row) => {
    let s = row.start;
    let e = row.end;
    if (!s && !e) return null;
    if (!s) s = addDays(e, -7);
    if (!e) e = addDays(s, 7);

    // Apply live drag delta
    if (dragState?.rowId === row.id) {
      const dd = dragState.daysDelta || 0;
      if (dragState.type === 'move') {
        s = addDays(s, dd);
        e = addDays(e, dd);
      } else if (dragState.type === 'resize-start') {
        s = addDays(s, dd);
        if (s >= e) s = addDays(e, -1);
      } else {
        e = addDays(e, dd);
        if (e <= s) e = addDays(s, 1);
      }
    }

    const left = differenceInDays(s, rangeStart) * DAY_WIDTH;
    const width = Math.max(differenceInDays(e, s), 1) * DAY_WIDTH;
    return { left, width, start: s, end: e };
  }, [rangeStart, dragState]);

  // Drag handlers
  const handleMouseDown = useCallback((e, row, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!row.start && !row.end) return;
    setDragState({
      rowId: row.id,
      type,
      startX: e.clientX,
      origStart: row.start,
      origEnd: row.end,
      daysDelta: 0,
    });
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (e) => {
      const dx = e.clientX - dragState.startX;
      const dd = Math.round(dx / DAY_WIDTH);
      setDragState(prev => ({ ...prev, daysDelta: dd }));
    };

    const handleUp = () => {
      const dd = dragState.daysDelta || 0;
      if (dd !== 0) {
        let s = dragState.origStart;
        let e = dragState.origEnd;
        if (!s) s = addDays(e, -7);
        if (!e) e = addDays(s, 7);

        if (dragState.type === 'move') {
          s = addDays(s, dd);
          e = addDays(e, dd);
        } else if (dragState.type === 'resize-start') {
          s = addDays(s, dd);
          if (s >= e) s = addDays(e, -1);
        } else {
          e = addDays(e, dd);
          if (e <= s) e = addDays(s, 1);
        }

        setPendingChanges(prev => ({
          ...prev,
          [dragState.rowId]: { start: s, end: e },
        }));
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState]);

  // Save all pending changes
  const handleSave = () => {
    const updatedMilestones = [...(mission.milestones || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const update = {};

    Object.entries(pendingChanges).forEach(([rowId, change]) => {
      if (rowId === '__mission__') {
        if (change.start) update.start_time = change.start.toISOString();
        if (change.end) update.end_time = change.end.toISOString();
      } else {
        // Find milestone by id
        const row = rows.find(r => r.id === rowId);
        if (row?.type === 'milestone' && row.milestoneIndex !== undefined) {
          const ms = updatedMilestones[row.milestoneIndex];
          if (ms && change.end) {
            ms.due_date = format(change.end, 'yyyy-MM-dd');
          }
        }
      }
    });

    // Always send milestones if any milestone was changed
    const hasMilestoneChange = Object.keys(pendingChanges).some(id => {
      const r = rows.find(row => row.id === id);
      return r?.type === 'milestone';
    });
    if (hasMilestoneChange) update.milestones = updatedMilestones;

    if (Object.keys(update).length > 0) {
      onUpdateMission(update);
    }
    setPendingChanges({});
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden select-none">
        {/* Toolbar */}
        {hasPending && (
          <div className="px-4 py-2 bg-violet-50 border-b flex items-center justify-between">
            <span className="text-sm text-violet-700 font-medium">
              {Object.keys(pendingChanges).length} unsaved change(s)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPendingChanges({})}>Discard</Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 gap-1.5">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Left labels */}
          <div className="shrink-0 border-r border-slate-200" style={{ width: LABEL_WIDTH }}>
            <div className="border-b border-slate-200 px-3 flex items-center" style={{ height: HEADER_HEIGHT }}>
              <span className="text-xs font-semibold text-slate-500 uppercase">Item</span>
            </div>
            {displayRows.map((row) => {
              const statusColor = STATUS_COLORS[row.status] || STATUS_COLORS.todo;
              return (
                <div
                  key={row.id}
                  className={cn(
                    "flex items-center gap-2 px-3 border-b border-slate-50 hover:bg-slate-50/50",
                    row.type === 'mission' && "bg-violet-50/50",
                    row.type === 'task' && "pl-10"
                  )}
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className={cn(
                    "shrink-0 rounded-full",
                    row.type === 'mission' ? "w-3 h-3" : row.type === 'milestone' ? "w-2.5 h-2.5 rotate-45" : "w-2 h-2"
                  )} style={{ backgroundColor: statusColor.border }} />
                  <span className={cn(
                    "text-xs font-medium truncate flex-1",
                    row.type === 'mission' && "font-bold text-slate-900",
                    row.type === 'milestone' && "font-semibold text-slate-800",
                    row.type === 'task' && "text-slate-600"
                  )}>
                    {row.label}
                  </span>
                  {row.type === 'milestone' && row.taskCount > 0 && (
                    <Badge variant="outline" className="text-[9px] shrink-0">
                      {row.doneCount}/{row.taskCount}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scrollable timeline */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
            <div
              className="relative"
              style={{ width: totalDays * DAY_WIDTH, minHeight: HEADER_HEIGHT + displayRows.length * ROW_HEIGHT }}
            >
              {/* Day headers */}
              <div className="flex border-b border-slate-200 sticky top-0 z-10 bg-white" style={{ height: HEADER_HEIGHT }}>
                {dayHeaders.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = differenceInDays(d, today) === 0;
                  const isFirst = d.getDate() === 1;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "shrink-0 flex flex-col items-center justify-center border-r border-slate-100 text-[10px]",
                        isToday && "bg-violet-50 font-bold text-violet-600",
                        !isToday && isWeekend && "bg-slate-50/50 text-slate-400",
                        !isToday && !isWeekend && "text-slate-500"
                      )}
                      style={{ width: DAY_WIDTH }}
                    >
                      {isFirst && <span className="text-[9px] font-semibold text-violet-500">{format(d, 'MMM')}</span>}
                      <span>{format(d, 'EEE')}</span>
                      <span className="font-medium">{format(d, 'd')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Grid rows bg */}
              {displayRows.map((row, idx) => (
                <div
                  key={row.id}
                  className={cn(
                    "absolute w-full border-b border-slate-50",
                    row.type === 'mission' && "bg-violet-50/30"
                  )}
                  style={{ top: HEADER_HEIGHT + idx * ROW_HEIGHT, height: ROW_HEIGHT }}
                >
                  {dayHeaders.map((d, i) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    if (!isWeekend) return null;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 bg-slate-50/40"
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
                  <div className="absolute top-0 -translate-x-1/2 bg-violet-500 text-white text-[9px] px-1.5 py-0.5 rounded-b font-medium">
                    Today
                  </div>
                </div>
              )}

              {/* Bars */}
              {displayRows.map((row, idx) => {
                const bar = getBarProps(row);
                if (!bar) {
                  // For tasks without dates, show a status dot
                  if (row.type === 'task') return null;
                  return null;
                }
                const isDragging = dragState?.rowId === row.id;
                const canDrag = row.type === 'mission' || row.type === 'milestone';
                const statusColor = STATUS_COLORS[row.status] || STATUS_COLORS.todo;

                const barHeight = row.type === 'mission' ? ROW_HEIGHT - 14 : row.type === 'milestone' ? ROW_HEIGHT - 16 : ROW_HEIGHT - 20;
                const barTop = HEADER_HEIGHT + idx * ROW_HEIGHT + (ROW_HEIGHT - barHeight) / 2;

                return (
                  <Tooltip key={row.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "absolute rounded-md flex items-center gap-1.5 px-2 overflow-hidden transition-shadow",
                          isDragging && "shadow-lg ring-2 ring-violet-400 z-30 opacity-90",
                          !isDragging && canDrag && "shadow-sm hover:shadow-md z-20 cursor-grab",
                          !canDrag && "z-10"
                        )}
                        style={{
                          left: bar.left,
                          top: barTop,
                          width: bar.width,
                          height: barHeight,
                          backgroundColor: row.type === 'mission' ? '#7c3aed22' : statusColor.bg,
                          borderLeft: `3px solid ${row.type === 'mission' ? '#7c3aed' : statusColor.border}`,
                        }}
                        onMouseDown={canDrag ? (e) => handleMouseDown(e, row, 'move') : undefined}
                      >
                        {canDrag && <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />}
                        <span
                          className="text-[10px] font-medium truncate"
                          style={{ color: row.type === 'mission' ? '#7c3aed' : statusColor.text }}
                        >
                          {row.label}
                        </span>
                        {row.type === 'milestone' && row.dueDate && (
                          <span className="text-[9px] text-slate-400 shrink-0 ml-auto">{format(safeDate(row.dueDate) || new Date(), 'MMM d')}</span>
                        )}

                        {/* Resize handles */}
                        {canDrag && (
                          <>
                            <div
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l"
                              onMouseDown={(e) => handleMouseDown(e, row, 'resize-start')}
                            />
                            <div
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r"
                              onMouseDown={(e) => handleMouseDown(e, row, 'resize-end')}
                            />
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[220px]">
                      <p className="font-semibold">{row.label}</p>
                      {bar.start && bar.end && (
                        <p className="text-slate-400">{format(bar.start, 'MMM d, yyyy')} → {format(bar.end, 'MMM d, yyyy')}</p>
                      )}
                      <p className="capitalize">{row.status?.replace('_', ' ')}</p>
                      {canDrag && <p className="text-violet-500 mt-1">Drag to reschedule</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 border-t bg-slate-50/50 flex items-center gap-4 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Legend:</span>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color.border }} />
              <span className="text-[10px] text-slate-500 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#7c3aed' }} />
            <span className="text-[10px] text-slate-500">Mission</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}