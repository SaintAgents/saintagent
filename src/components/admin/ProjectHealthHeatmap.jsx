import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Activity, TrendingUp, DollarSign, AlertTriangle, Clock, CheckCircle, Flame, BarChart3 } from 'lucide-react';
import { differenceInDays, parseISO, isPast } from 'date-fns';

// ── Health scoring helpers ──

function scoreProgress(project, taskCounts) {
  const { progress_percent = 0, start_date, end_date } = project;
  if (!start_date || !end_date) return { score: progress_percent > 0 ? 70 : 50, label: 'No dates' };
  const total = differenceInDays(parseISO(end_date), parseISO(start_date)) || 1;
  const elapsed = differenceInDays(new Date(), parseISO(start_date));
  const expectedPct = Math.min(Math.max((elapsed / total) * 100, 0), 100);
  const delta = progress_percent - expectedPct;
  if (delta >= -5) return { score: 90, label: 'On track' };
  if (delta >= -20) return { score: 65, label: 'Slightly behind' };
  if (delta >= -40) return { score: 40, label: 'Behind' };
  return { score: 15, label: 'Critical delay' };
}

function scoreBudget(project) {
  const { budget = 0, progress_percent = 0 } = project;
  if (!budget || budget === 0) return { score: 70, label: 'No budget' };
  // Simulated burn: use progress as proxy
  const burnPct = progress_percent;
  const ratio = burnPct > 0 ? progress_percent / burnPct : 1;
  if (ratio >= 0.9) return { score: 85, label: 'Healthy' };
  if (ratio >= 0.7) return { score: 60, label: 'Watch' };
  return { score: 30, label: 'Over budget' };
}

function scoreRisk(project, taskCounts) {
  let risk = 0;
  const { blocked = 0, urgent = 0, total = 0 } = taskCounts;
  if (blocked > 0) risk += 25;
  if (urgent > 2) risk += 20;
  if (project.phase3_risk_grade === 'D' || project.phase3_risk_grade === 'F') risk += 30;
  if (isPast(parseISO(project.end_date || '2099-01-01')) && (project.progress_percent || 0) < 90) risk += 25;
  const score = Math.max(100 - risk, 0);
  if (score >= 75) return { score, label: 'Low risk' };
  if (score >= 50) return { score, label: 'Medium risk' };
  return { score, label: 'High risk' };
}

function scoreTimeline(project) {
  const { start_date, end_date, progress_percent = 0 } = project;
  if (!end_date) return { score: 50, label: 'No deadline' };
  const daysLeft = differenceInDays(parseISO(end_date), new Date());
  if (daysLeft < 0 && progress_percent < 100) return { score: 10, label: 'Overdue' };
  if (daysLeft <= 7 && progress_percent < 80) return { score: 35, label: 'At risk' };
  if (daysLeft <= 14 && progress_percent < 60) return { score: 55, label: 'Tight' };
  return { score: 85, label: 'On schedule' };
}

function getColor(score) {
  if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' };
  if (score >= 60) return { bg: 'bg-amber-400', text: 'text-amber-700', light: 'bg-amber-50' };
  if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50' };
}

function overallScore(scores) {
  return Math.round((scores.progress.score + scores.budget.score + scores.risk.score + scores.timeline.score) / 4);
}

// ── Sub-components ──

function HeatCell({ score, label }) {
  const c = getColor(score);
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-full h-10 rounded ${c.bg} bg-opacity-80 flex items-center justify-center cursor-default transition-transform hover:scale-105`}>
            <span className="text-[11px] font-semibold text-white drop-shadow-sm">{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SummaryCards({ projects }) {
  const healthy = projects.filter(p => p.overall >= 80).length;
  const atRisk = projects.filter(p => p.overall >= 40 && p.overall < 60).length;
  const critical = projects.filter(p => p.overall < 40).length;
  const avgHealth = projects.length ? Math.round(projects.reduce((s, p) => s + p.overall, 0) / projects.length) : 0;

  const cards = [
    { label: 'Avg Health', value: `${avgHealth}%`, icon: Activity, color: 'text-violet-600 bg-violet-50' },
    { label: 'Healthy', value: healthy, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'At Risk', value: atRisk, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Critical', value: critical, icon: Flame, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${c.color}`}><c.icon className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const DIMENSIONS = [
  { key: 'progress', label: 'Progress', icon: TrendingUp },
  { key: 'timeline', label: 'Timeline', icon: Clock },
  { key: 'budget', label: 'Budget', icon: DollarSign },
  { key: 'risk', label: 'Risk', icon: AlertTriangle },
];

// ── Main component ──

export default function ProjectHealthHeatmap() {
  const [search, setSearch] = useState('');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('health_asc');

  const { data: projects = [], isLoading: projLoading } = useQuery({
    queryKey: ['admin-health-projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
    staleTime: 60000,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['admin-health-tasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 500),
    staleTime: 60000,
  });

  const taskCountsByProject = useMemo(() => {
    const m = {};
    tasks.forEach(t => {
      if (!t.project_id) return;
      if (!m[t.project_id]) m[t.project_id] = { total: 0, blocked: 0, urgent: 0, completed: 0 };
      const c = m[t.project_id];
      c.total++;
      if (t.status === 'blocked') c.blocked++;
      if (t.status === 'completed') c.completed++;
      if (t.priority === 'urgent') c.urgent++;
    });
    return m;
  }, [tasks]);

  const activeStatuses = ['in_progress', 'planned', 'on_hold'];
  const scoredProjects = useMemo(() => {
    return projects
      .filter(p => activeStatuses.includes(p.project_status) || (!p.project_status && p.status !== 'declined' && p.status !== 'completed'))
      .map(p => {
        const tc = taskCountsByProject[p.id] || { total: 0, blocked: 0, urgent: 0, completed: 0 };
        const scores = {
          progress: scoreProgress(p, tc),
          budget: scoreBudget(p),
          risk: scoreRisk(p, tc),
          timeline: scoreTimeline(p),
        };
        return { ...p, scores, overall: overallScore(scores), taskCounts: tc };
      });
  }, [projects, taskCountsByProject]);

  const filtered = useMemo(() => {
    let list = scoredProjects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.owner_name?.toLowerCase().includes(q));
    }
    if (filterHealth === 'healthy') list = list.filter(p => p.overall >= 80);
    else if (filterHealth === 'warning') list = list.filter(p => p.overall >= 40 && p.overall < 80);
    else if (filterHealth === 'critical') list = list.filter(p => p.overall < 40);

    list.sort((a, b) => {
      if (sortBy === 'health_asc') return a.overall - b.overall;
      if (sortBy === 'health_desc') return b.overall - a.overall;
      if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
    return list;
  }, [scoredProjects, search, filterHealth, sortBy]);

  if (projLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Project Health Heatmap</h2>
        <p className="text-sm text-slate-500">Color-coded overview of progress, timeline, budget & risk for active projects</p>
      </div>

      <SummaryCards projects={scoredProjects} />

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="font-medium">Score Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> 80-100 Healthy</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> 60-79 Watch</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> 40-59 At Risk</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> 0-39 Critical</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search projects or owners..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterHealth} onValueChange={setFilterHealth}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]"><BarChart3 className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="health_asc">Worst First</SelectItem>
            <SelectItem value="health_desc">Best First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Heatmap Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left p-3 font-medium text-slate-600 min-w-[200px]">Project</th>
                {DIMENSIONS.map(d => (
                  <th key={d.key} className="text-center p-3 font-medium text-slate-600 w-[100px]">
                    <div className="flex items-center justify-center gap-1">
                      <d.icon className="w-3.5 h-3.5" />{d.label}
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 font-medium text-slate-600 w-[90px]">Overall</th>
                <th className="text-center p-3 font-medium text-slate-600 w-[80px]">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>No active projects found</p>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const oc = getColor(p.overall);
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <p className="font-medium truncate max-w-[220px]">{p.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{p.owner_name || 'No owner'} · {p.project_status || p.status || '—'}</p>
                    </td>
                    {DIMENSIONS.map(d => (
                      <td key={d.key} className="p-2">
                        <HeatCell score={p.scores[d.key].score} label={p.scores[d.key].label} />
                      </td>
                    ))}
                    <td className="p-2">
                      <div className={`rounded-lg py-1.5 text-center font-bold text-sm ${oc.light} ${oc.text}`}>
                        {p.overall}%
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-xs text-slate-500">
                        {p.taskCounts.completed}/{p.taskCounts.total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}