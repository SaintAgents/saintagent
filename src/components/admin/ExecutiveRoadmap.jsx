import React, { useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Folder, Milestone, ChevronLeft, ChevronRight, Search, Filter,
  Calendar, Users, TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { addDays, differenceInDays, format, parseISO, startOfDay, isValid, max, min, startOfMonth, endOfMonth, addMonths } from 'date-fns';

const STATUS_COLORS = {
  planned: '#94a3b8', in_progress: '#3b82f6', completed: '#10b981', on_hold: '#f59e0b',
  draft: '#94a3b8', pending_review: '#f59e0b', approved: '#3b82f6', funded: '#10b981',
  cancelled: '#ef4444',
};

const DAY_W = 4;
const ROW_H = 52;
const LABEL_W = 280;
const HEADER_H = 56;
const MILESTONE_H = 28;

function safeDate(d) {
  if (!d) return null;
  const p = parseISO(d);
  return isValid(p) ? startOfDay(p) : null;
}

function ProjectRow({ project, milestones, tasks, rangeStart, totalDays, rowY }) {
  const pStart = safeDate(project.start_date);
  const pEnd = safeDate(project.end_date);
  if (!pStart && !pEnd) return null;

  const s = pStart || addDays(pEnd, -30);
  const e = pEnd || addDays(s, 30);
  const left = differenceInDays(s, rangeStart) * DAY_W;
  const width = Math.max(differenceInDays(e, s), 1) * DAY_W;
  const progress = project.progress_percent || 0;
  const statusColor = STATUS_COLORS[project.project_status || project.status] || '#94a3b8';

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <g>
            {/* Project bar */}
            <rect
              x={left} y={rowY + 8} width={width} height={ROW_H - 16}
              rx={6} fill={statusColor + '18'} stroke={statusColor} strokeWidth={1.5}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            {/* Progress fill */}
            <rect
              x={left} y={rowY + 8} width={width * (progress / 100)} height={ROW_H - 16}
              rx={6} fill={statusColor + '35'}
            />
            {/* Milestones diamonds */}
            {milestones.map(ms => {
              const msDate = safeDate(ms.end_date);
              if (!msDate) return null;
              const mx = differenceInDays(msDate, rangeStart) * DAY_W;
              const my = rowY + ROW_H / 2;
              const isMsDone = ms.status === 'completed';
              return (
                <g key={ms.id}>
                  <polygon
                    points={`${mx},${my - 8} ${mx + 8},${my} ${mx},${my + 8} ${mx - 8},${my}`}
                    fill={isMsDone ? '#10b981' : '#f59e0b'}
                    stroke="white" strokeWidth={1.5}
                  />
                </g>
              );
            })}
            {/* Label on bar */}
            <text
              x={left + 8} y={rowY + ROW_H / 2 + 4}
              fontSize={10} fontWeight={600} fill={statusColor}
              className="pointer-events-none"
            >
              {progress}%
            </text>
          </g>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-[240px]">
          <p className="font-bold">{project.title}</p>
          <p className="text-slate-400">{s ? format(s, 'MMM d, yyyy') : '?'} → {e ? format(e, 'MMM d, yyyy') : '?'}</p>
          <p>Tasks: {completedTasks}/{totalTasks}{blockedTasks > 0 && <span className="text-red-400"> · {blockedTasks} blocked</span>}</p>
          <p>Progress: {progress}%</p>
          {milestones.length > 0 && <p>Milestones: {milestones.filter(m => m.status === 'completed').length}/{milestones.length}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ExecutiveRoadmap() {
  const scrollRef = useRef(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: projects = [] } = useQuery({
    queryKey: ['allProjects'],
    queryFn: () => base44.entities.Project.list('-updated_date', 200),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['allMilestones'],
    queryFn: () => base44.entities.ProjectMilestone.list('-created_date', 500),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['allProjectTasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 1000),
  });

  // Filter projects
  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (!(p.start_date || p.end_date)) return false;
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all') {
        const st = p.project_status || p.status || 'planned';
        if (statusFilter === 'active' && !['in_progress', 'funded', 'approved'].includes(st)) return false;
        if (statusFilter === 'completed' && st !== 'completed') return false;
        if (statusFilter === 'at_risk' && !tasks.some(t => t.project_id === p.id && t.status === 'blocked')) return false;
      }
      return true;
    });
  }, [projects, search, statusFilter, tasks]);

  // Compute timeline range
  const { rangeStart, rangeEnd, totalDays, months } = useMemo(() => {
    const allDates = [];
    filtered.forEach(p => {
      const s = safeDate(p.start_date);
      const e = safeDate(p.end_date);
      if (s) allDates.push(s);
      if (e) allDates.push(e);
    });
    milestones.forEach(m => {
      const d = safeDate(m.end_date);
      if (d) allDates.push(d);
    });
    if (allDates.length === 0) {
      const t = startOfDay(new Date());
      return { rangeStart: addDays(t, -30), rangeEnd: addDays(t, 90), totalDays: 120, months: [] };
    }
    const rs = startOfMonth(addDays(min(allDates), -14));
    const re = endOfMonth(addDays(max(allDates), 14));
    const td = differenceInDays(re, rs);

    const ms = [];
    let cur = rs;
    while (cur < re) {
      const mEnd = endOfMonth(cur);
      ms.push({ start: cur, end: mEnd, label: format(cur, 'MMM yyyy') });
      cur = addMonths(startOfMonth(cur), 1);
    }
    return { rangeStart: rs, rangeEnd: re, totalDays: td, months: ms };
  }, [filtered, milestones]);

  const today = startOfDay(new Date());
  const todayX = differenceInDays(today, rangeStart) * DAY_W;

  // Summary stats
  const activeProjects = projects.filter(p => ['in_progress', 'funded', 'approved'].includes(p.project_status || p.status)).length;
  const completedProjects = projects.filter(p => (p.project_status || p.status) === 'completed').length;
  const atRiskProjects = filtered.filter(p => tasks.some(t => t.project_id === p.id && t.status === 'blocked')).length;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;

  const svgHeight = HEADER_H + filtered.length * ROW_H + 20;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><Folder className="w-4 h-4" /><span className="text-xs">Active</span></div>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><CheckCircle2 className="w-4 h-4" /><span className="text-xs">Completed</span></div>
            <div className="text-2xl font-bold">{completedProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-xs">At Risk</span></div>
            <div className="text-2xl font-bold text-red-600">{atRiskProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><Milestone className="w-4 h-4" /><span className="text-xs">Milestones</span></div>
            <div className="text-2xl font-bold">{completedMilestones}/{totalMilestones}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><TrendingUp className="w-4 h-4" /><span className="text-xs">Avg Progress</span></div>
            <div className="text-2xl font-bold">
              {filtered.length > 0 ? Math.round(filtered.reduce((a, p) => a + (p.progress_percent || 0), 0) / filtered.length) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white">
          <option value="all">All Projects</option>
          <option value="active">Active Only</option>
          <option value="completed">Completed</option>
          <option value="at_risk">At Risk</option>
        </select>
        <Badge variant="outline" className="text-xs">{filtered.length} projects</Badge>
      </div>

      {/* Roadmap Chart */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No projects with dates match your filters.</div>
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="flex">
            {/* Left labels */}
            <div className="shrink-0 border-r border-slate-200 bg-slate-50/50" style={{ width: LABEL_W }}>
              <div className="border-b border-slate-200 px-3 flex items-center" style={{ height: HEADER_H }}>
                <span className="text-xs font-semibold text-slate-500 uppercase">Project</span>
              </div>
              {filtered.map(p => {
                const st = p.project_status || p.status || 'planned';
                const pTasks = tasks.filter(t => t.project_id === p.id);
                const blocked = pTasks.filter(t => t.status === 'blocked').length;
                return (
                  <div key={p.id} className="flex items-center gap-2 px-3 border-b border-slate-100 hover:bg-slate-50/80" style={{ height: ROW_H }}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[st] }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{pTasks.length} tasks</span>
                        {blocked > 0 && <span className="text-red-500">{blocked} blocked</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: STATUS_COLORS[st] }}>
                      {(p.progress_percent || 0)}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Scrollable timeline */}
            <div className="flex-1 overflow-x-auto" ref={scrollRef}>
              <svg width={totalDays * DAY_W} height={svgHeight}>
                {/* Month headers */}
                {months.map((m, i) => {
                  const x = differenceInDays(m.start, rangeStart) * DAY_W;
                  const w = differenceInDays(m.end, m.start) * DAY_W;
                  return (
                    <g key={i}>
                      <rect x={x} y={0} width={w} height={HEADER_H} fill={i % 2 === 0 ? '#f8fafc' : '#ffffff'} />
                      <line x1={x} y1={0} x2={x} y2={svgHeight} stroke="#e2e8f0" strokeWidth={0.5} />
                      <text x={x + w / 2} y={HEADER_H / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="#64748b">
                        {m.label}
                      </text>
                      <line x1={x} y1={HEADER_H} x2={x + w} y2={HEADER_H} stroke="#e2e8f0" />
                    </g>
                  );
                })}

                {/* Row backgrounds */}
                {filtered.map((_, i) => (
                  <rect key={i} x={0} y={HEADER_H + i * ROW_H} width={totalDays * DAY_W} height={ROW_H}
                    fill={i % 2 === 0 ? '#ffffff' : '#fafbfc'} />
                ))}

                {/* Today line */}
                {todayX > 0 && todayX < totalDays * DAY_W && (
                  <g>
                    <line x1={todayX} y1={0} x2={todayX} y2={svgHeight} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4,3" />
                    <rect x={todayX - 18} y={2} width={36} height={16} rx={4} fill="#8b5cf6" />
                    <text x={todayX} y={13} textAnchor="middle" fontSize={9} fontWeight={600} fill="white">Today</text>
                  </g>
                )}

                {/* Project bars */}
                {filtered.map((p, i) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    milestones={milestones.filter(m => m.project_id === p.id)}
                    tasks={tasks.filter(t => t.project_id === p.id)}
                    rangeStart={rangeStart}
                    totalDays={totalDays}
                    rowY={HEADER_H + i * ROW_H}
                  />
                ))}

                {/* Inter-project dependency lines (same owner linkage) */}
                {filtered.map((p, i) => {
                  if (!p.deal_id) return null;
                  const related = filtered.findIndex((pp, j) => j !== i && pp.deal_id === p.deal_id);
                  if (related === -1) return null;
                  const pEnd = safeDate(p.end_date);
                  const rStart = safeDate(filtered[related].start_date);
                  if (!pEnd || !rStart) return null;
                  const x1 = differenceInDays(pEnd, rangeStart) * DAY_W;
                  const y1 = HEADER_H + i * ROW_H + ROW_H / 2;
                  const x2 = differenceInDays(rStart, rangeStart) * DAY_W;
                  const y2 = HEADER_H + related * ROW_H + ROW_H / 2;
                  return (
                    <g key={`dep-${p.id}`}>
                      <path d={`M${x1},${y1} C${x1 + 30},${y1} ${x2 - 30},${y2} ${x2},${y2}`}
                        fill="none" stroke="#a78bfa" strokeWidth={1} strokeDasharray="6,3" opacity={0.5} />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
        <span className="font-medium">Legend:</span>
        {Object.entries({ 'Planned': '#94a3b8', 'In Progress': '#3b82f6', 'Completed': '#10b981', 'On Hold': '#f59e0b' }).map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: c + '30', border: `1.5px solid ${c}` }} />
            {l}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <svg width={12} height={12}><polygon points="6,0 12,6 6,12 0,6" fill="#f59e0b" /></svg>
          Milestone
        </div>
      </div>
    </div>
  );
}