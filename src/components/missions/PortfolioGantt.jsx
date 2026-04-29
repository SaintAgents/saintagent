import React, { useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { addDays, differenceInDays, format, parseISO, startOfDay, isValid, max, min } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const DAY_WIDTH = 32;
const ROW_HEIGHT = 40;
const MILESTONE_ROW = 28;
const LABEL_WIDTH = 240;
const HEADER_HEIGHT = 48;

const STATUS_COLORS = {
  draft: { bg: '#94a3b822', border: '#94a3b8', text: '#64748b' },
  pending_approval: { bg: '#f59e0b22', border: '#f59e0b', text: '#d97706' },
  active: { bg: '#3b82f622', border: '#3b82f6', text: '#2563eb' },
  completed: { bg: '#10b98122', border: '#10b981', text: '#059669' },
  cancelled: { bg: '#ef444422', border: '#ef4444', text: '#dc2626' },
};

function safeDate(d) {
  if (!d) return null;
  const p = typeof d === 'string' ? parseISO(d) : d;
  return isValid(p) ? startOfDay(p) : null;
}

function buildRows(missions) {
  const rows = [];
  const today = startOfDay(new Date());

  missions.forEach(m => {
    const start = safeDate(m.start_time) || safeDate(m.created_date) || today;
    const end = safeDate(m.end_time) || addDays(start, 30);
    const milestones = (m.milestones || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    const totalTasks = milestones.reduce((sum, ms) => sum + (ms.tasks?.length || 0), 0) + (m.tasks?.length || 0);
    const doneTasks = milestones.reduce((sum, ms) => sum + (ms.tasks?.filter(t => t.status === 'completed' || t.completed).length || 0), 0) +
      (m.tasks?.filter(t => t.status === 'completed' || t.completed).length || 0);
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    rows.push({
      id: m.id,
      type: 'mission',
      label: m.title,
      start,
      end,
      status: m.status || 'draft',
      missionType: m.mission_type,
      progress,
      totalTasks,
      doneTasks,
      milestoneCount: milestones.length,
      isOverdue: m.status === 'active' && end < today,
    });

    // Add milestones as sub-rows
    milestones.forEach((ms, mi) => {
      const dueDate = safeDate(ms.due_date);
      if (!dueDate) return;
      const tasks = ms.tasks || [];
      const done = tasks.filter(t => t.status === 'completed' || t.completed).length;
      rows.push({
        id: `${m.id}_ms_${mi}`,
        missionId: m.id,
        type: 'milestone',
        label: ms.title || `Milestone ${mi + 1}`,
        date: dueDate,
        completed: ms.completed,
        taskCount: tasks.length,
        doneCount: done,
      });
    });
  });

  return rows;
}

export default function PortfolioGantt({ missions }) {
  const scrollRef = useRef(null);
  const today = startOfDay(new Date());

  const rows = useMemo(() => buildRows(missions), [missions]);

  // Compute date range
  const { rangeStart, totalDays } = useMemo(() => {
    const dates = [today];
    rows.forEach(r => {
      if (r.type === 'mission') {
        if (r.start) dates.push(r.start);
        if (r.end) dates.push(r.end);
      }
      if (r.type === 'milestone' && r.date) dates.push(r.date);
    });
    const earliest = addDays(min(dates), -7);
    const latest = addDays(max(dates), 14);
    const total = Math.max(differenceInDays(latest, earliest), 60);
    return { rangeStart: earliest, totalDays: total };
  }, [rows, today]);

  const dayHeaders = useMemo(() => {
    const days = [];
    for (let i = 0; i < totalDays; i++) days.push(addDays(rangeStart, i));
    return days;
  }, [rangeStart, totalDays]);

  // Month markers
  const monthMarkers = useMemo(() => {
    const markers = [];
    let lastMonth = -1;
    dayHeaders.forEach((d, i) => {
      if (d.getMonth() !== lastMonth) {
        markers.push({ index: i, label: format(d, 'MMM yyyy') });
        lastMonth = d.getMonth();
      }
    });
    return markers;
  }, [dayHeaders]);

  const todayOffset = differenceInDays(today, rangeStart) * DAY_WIDTH;

  // Calculate cumulative top for each row (missions are taller than milestones)
  const rowTops = useMemo(() => {
    const tops = [];
    let y = 0;
    rows.forEach(r => {
      tops.push(y);
      y += r.type === 'milestone' ? MILESTONE_ROW : ROW_HEIGHT;
    });
    return { tops, totalHeight: y };
  }, [rows]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden select-none shadow-sm">
        <div className="flex">
          {/* Left labels */}
          <div className="shrink-0 border-r border-slate-200 overflow-hidden" style={{ width: LABEL_WIDTH }}>
            <div className="border-b border-slate-200 px-3 flex items-center bg-slate-50" style={{ height: HEADER_HEIGHT }}>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Missions & Milestones</span>
            </div>
            <div style={{ height: rowTops.totalHeight }}>
              {rows.map((row, idx) => {
                const h = row.type === 'milestone' ? MILESTONE_ROW : ROW_HEIGHT;
                if (row.type === 'mission') {
                  const sc = STATUS_COLORS[row.status] || STATUS_COLORS.draft;
                  return (
                    <div
                      key={row.id}
                      className="flex items-center gap-2 px-3 border-b border-slate-100 hover:bg-violet-50/30 group"
                      style={{ height: h }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sc.border }} />
                      <Link
                        to={`/MissionDetail?id=${row.id}`}
                        className="text-xs font-semibold text-slate-800 truncate flex-1 hover:text-violet-600 transition-colors"
                      >
                        {row.label}
                      </Link>
                      {row.progress > 0 && (
                        <span className="text-[9px] font-bold text-emerald-600 shrink-0">{row.progress}%</span>
                      )}
                      <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
                    </div>
                  );
                }
                // milestone
                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-1.5 pl-7 pr-3 border-b border-slate-50"
                    style={{ height: h }}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rotate-45 shrink-0",
                      row.completed ? "bg-emerald-500" : "bg-amber-400"
                    )} />
                    <span className="text-[10px] text-slate-500 truncate flex-1">{row.label}</span>
                    {row.taskCount > 0 && (
                      <span className="text-[9px] text-slate-400 shrink-0">{row.doneCount}/{row.taskCount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
            <div className="relative" style={{ width: totalDays * DAY_WIDTH, minHeight: HEADER_HEIGHT + rowTops.totalHeight }}>
              {/* Month headers */}
              <div className="flex border-b border-slate-200 sticky top-0 z-10 bg-white" style={{ height: HEADER_HEIGHT }}>
                {monthMarkers.map((m, i) => {
                  const nextIndex = i < monthMarkers.length - 1 ? monthMarkers[i + 1].index : totalDays;
                  const width = (nextIndex - m.index) * DAY_WIDTH;
                  return (
                    <div
                      key={i}
                      className="shrink-0 flex items-end pb-1.5 pl-2 border-r border-slate-100 text-[10px] font-semibold text-slate-500"
                      style={{ width, position: 'absolute', left: m.index * DAY_WIDTH, height: HEADER_HEIGHT }}
                    >
                      {m.label}
                    </div>
                  );
                })}
                {/* Day ticks */}
                {dayHeaders.map((d, i) => {
                  const isFirst = d.getDate() === 1;
                  const isMon = d.getDay() === 1;
                  if (!isFirst && !isMon) return null;
                  return (
                    <div
                      key={i}
                      className="absolute top-6 text-[8px] text-slate-400"
                      style={{ left: i * DAY_WIDTH + 2 }}
                    >
                      {format(d, 'd')}
                    </div>
                  );
                })}
              </div>

              {/* Row backgrounds */}
              {rows.map((row, idx) => {
                const h = row.type === 'milestone' ? MILESTONE_ROW : ROW_HEIGHT;
                return (
                  <div
                    key={row.id}
                    className={cn(
                      "absolute w-full border-b",
                      row.type === 'mission' ? "border-slate-100" : "border-slate-50"
                    )}
                    style={{ top: HEADER_HEIGHT + rowTops.tops[idx], height: h }}
                  />
                );
              })}

              {/* Weekend columns */}
              {dayHeaders.map((d, i) => {
                if (d.getDay() !== 0 && d.getDay() !== 6) return null;
                return (
                  <div
                    key={`w${i}`}
                    className="absolute bg-slate-50/50"
                    style={{ left: i * DAY_WIDTH, width: DAY_WIDTH, top: HEADER_HEIGHT, bottom: 0, height: rowTops.totalHeight }}
                  />
                );
              })}

              {/* Today line */}
              {todayOffset >= 0 && (
                <div
                  className="absolute w-0.5 bg-violet-500 z-20 pointer-events-none"
                  style={{ left: todayOffset + DAY_WIDTH / 2, top: 0, height: HEADER_HEIGHT + rowTops.totalHeight }}
                >
                  <div className="absolute top-0 -translate-x-1/2 bg-violet-500 text-white text-[8px] px-1 py-0.5 rounded-b font-bold">
                    Today
                  </div>
                </div>
              )}

              {/* Mission bars & milestone diamonds */}
              {rows.map((row, idx) => {
                const top = HEADER_HEIGHT + rowTops.tops[idx];
                const h = row.type === 'milestone' ? MILESTONE_ROW : ROW_HEIGHT;

                if (row.type === 'mission') {
                  const left = differenceInDays(row.start, rangeStart) * DAY_WIDTH;
                  const width = Math.max(differenceInDays(row.end, row.start), 1) * DAY_WIDTH;
                  const sc = STATUS_COLORS[row.status] || STATUS_COLORS.draft;
                  const barH = h - 12;
                  const barTop = top + (h - barH) / 2;

                  return (
                    <Tooltip key={row.id}>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/MissionDetail?id=${row.id}`}
                          className="absolute rounded-md overflow-hidden hover:shadow-md transition-shadow z-10 cursor-pointer group"
                          style={{
                            left,
                            top: barTop,
                            width,
                            height: barH,
                            backgroundColor: sc.bg,
                            borderLeft: `3px solid ${sc.border}`,
                          }}
                        >
                          {/* Progress fill */}
                          {row.progress > 0 && (
                            <div
                              className="absolute top-0 left-0 bottom-0 opacity-20 rounded-r"
                              style={{ width: `${row.progress}%`, backgroundColor: sc.border }}
                            />
                          )}
                          <div className="relative flex items-center h-full px-2 gap-1.5">
                            <span className="text-[10px] font-semibold truncate" style={{ color: sc.text }}>
                              {row.label}
                            </span>
                            {row.isOverdue && (
                              <span className="text-[8px] bg-red-500 text-white px-1 rounded shrink-0 font-bold">LATE</span>
                            )}
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[260px]">
                        <p className="font-bold">{row.label}</p>
                        <p className="text-slate-400">{format(row.start, 'MMM d')} → {format(row.end, 'MMM d, yyyy')}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="capitalize">{row.status}</span>
                          {row.totalTasks > 0 && <span>{row.doneTasks}/{row.totalTasks} tasks</span>}
                          {row.milestoneCount > 0 && <span>{row.milestoneCount} milestones</span>}
                        </div>
                        {row.progress > 0 && (
                          <div className="mt-1">
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.progress}%` }} />
                            </div>
                            <span className="text-emerald-600 font-bold">{row.progress}% complete</span>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                // Milestone diamond
                const dayOff = differenceInDays(row.date, rangeStart) * DAY_WIDTH + DAY_WIDTH / 2;
                return (
                  <Tooltip key={row.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "absolute z-10 cursor-default",
                        )}
                        style={{ left: dayOff - 5, top: top + (h - 10) / 2 }}
                      >
                        <div className={cn(
                          "w-[10px] h-[10px] rotate-45 border-2",
                          row.completed
                            ? "bg-emerald-500 border-emerald-600"
                            : row.date < today
                              ? "bg-red-400 border-red-500"
                              : "bg-amber-400 border-amber-500"
                        )} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-semibold">{row.label}</p>
                      <p className="text-slate-400">Due {format(row.date, 'MMM d, yyyy')}</p>
                      {row.taskCount > 0 && <p>{row.doneCount}/{row.taskCount} tasks done</p>}
                      {row.completed && <p className="text-emerald-600 font-bold">✓ Complete</p>}
                      {!row.completed && row.date < today && <p className="text-red-500 font-bold">Overdue</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 border-t bg-slate-50/50 flex items-center gap-4 flex-wrap">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Legend:</span>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color.border }} />
              <span className="text-[10px] text-slate-500 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rotate-45 bg-amber-400 border border-amber-500" />
            <span className="text-[10px] text-slate-500">Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rotate-45 bg-emerald-500 border border-emerald-600" />
            <span className="text-[10px] text-slate-500">Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rotate-45 bg-red-400 border border-red-500" />
            <span className="text-[10px] text-slate-500">Overdue</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}