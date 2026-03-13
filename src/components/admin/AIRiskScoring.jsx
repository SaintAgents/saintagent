import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertTriangle, Shield, TrendingDown, Clock, DollarSign,
  Users, Search, ChevronDown, ChevronUp, Zap, CheckCircle2,
  XCircle, AlertCircle, ArrowRight, Flame
} from 'lucide-react';
import { differenceInDays, parseISO, isValid, format } from 'date-fns';

function computeRiskScore(project, tasks, milestones) {
  const scores = { progress: 0, timeline: 0, budget: 0, dependencies: 0, velocity: 0 };
  const flags = [];
  const now = new Date();

  // 1. Progress Risk (0-25)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const declaredProgress = (project.progress_percent || 0) / 100;

  const endDate = project.end_date ? parseISO(project.end_date) : null;
  const startDate = project.start_date ? parseISO(project.start_date) : null;
  let timeElapsed = 0;
  if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
    const totalDuration = differenceInDays(endDate, startDate);
    const elapsed = differenceInDays(now, startDate);
    timeElapsed = totalDuration > 0 ? Math.min(elapsed / totalDuration, 1) : 0;
  }

  if (timeElapsed > 0 && taskProgress < timeElapsed * 0.6) {
    scores.progress = 22;
    flags.push({ type: 'critical', msg: `Progress (${Math.round(taskProgress * 100)}%) far behind timeline (${Math.round(timeElapsed * 100)}% elapsed)` });
  } else if (timeElapsed > 0 && taskProgress < timeElapsed * 0.8) {
    scores.progress = 14;
    flags.push({ type: 'warning', msg: `Progress slightly behind schedule` });
  } else {
    scores.progress = 4;
  }

  // 2. Timeline Risk (0-25)
  if (endDate && isValid(endDate)) {
    const daysLeft = differenceInDays(endDate, now);
    const remainingTasks = totalTasks - completedTasks;
    if (daysLeft < 0) {
      scores.timeline = 25;
      flags.push({ type: 'critical', msg: `Project is ${Math.abs(daysLeft)} days overdue` });
    } else if (daysLeft < 7 && remainingTasks > 3) {
      scores.timeline = 20;
      flags.push({ type: 'critical', msg: `${remainingTasks} tasks remaining with only ${daysLeft} days left` });
    } else if (daysLeft < 14 && remainingTasks > 5) {
      scores.timeline = 15;
      flags.push({ type: 'warning', msg: `Tight deadline: ${remainingTasks} tasks in ${daysLeft} days` });
    } else {
      scores.timeline = 3;
    }
  }

  // 3. Budget Risk (0-20)
  const budget = project.budget || 0;
  if (budget > 0) {
    const estBurn = taskProgress > 0 ? budget * (timeElapsed / Math.max(taskProgress, 0.01)) : 0;
    if (estBurn > budget * 1.3) {
      scores.budget = 18;
      flags.push({ type: 'critical', msg: `Projected overspend: ~${Math.round((estBurn / budget - 1) * 100)}% over budget` });
    } else if (estBurn > budget * 1.1) {
      scores.budget = 10;
      flags.push({ type: 'warning', msg: `Budget trending ${Math.round((estBurn / budget - 1) * 100)}% over` });
    } else {
      scores.budget = 2;
    }
  }

  // 4. Dependency / Blocked Risk (0-15)
  const blockedTasks = tasks.filter(t => t.status === 'blocked');
  if (blockedTasks.length > 0) {
    const blockedRatio = blockedTasks.length / Math.max(totalTasks, 1);
    if (blockedRatio > 0.3) {
      scores.dependencies = 15;
      flags.push({ type: 'critical', msg: `${blockedTasks.length} tasks blocked (${Math.round(blockedRatio * 100)}%)` });
    } else if (blockedRatio > 0.1) {
      scores.dependencies = 10;
      flags.push({ type: 'warning', msg: `${blockedTasks.length} blocked tasks` });
    } else {
      scores.dependencies = 5;
    }
  }

  // 5. Velocity Risk (0-15)
  const urgentOpen = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  if (urgentOpen.length > 3) {
    scores.velocity = 13;
    flags.push({ type: 'warning', msg: `${urgentOpen.length} urgent tasks still open` });
  } else if (urgentOpen.length > 0) {
    scores.velocity = 6;
  }

  // Milestone check
  const overdueMilestones = milestones.filter(m => {
    if (m.status === 'completed') return false;
    const ed = m.end_date ? parseISO(m.end_date) : null;
    return ed && isValid(ed) && differenceInDays(now, ed) > 0;
  });
  if (overdueMilestones.length > 0) {
    scores.timeline += 5;
    flags.push({ type: 'warning', msg: `${overdueMilestones.length} overdue milestone(s)` });
  }

  const total = Math.min(scores.progress + scores.timeline + scores.budget + scores.dependencies + scores.velocity, 100);
  const grade = total >= 70 ? 'critical' : total >= 45 ? 'high' : total >= 25 ? 'medium' : 'low';

  return { total, scores, grade, flags };
}

function RiskBadge({ grade }) {
  const config = {
    critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Critical' },
    high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle, label: 'High' },
    medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle, label: 'Medium' },
    low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Shield, label: 'Low' },
  }[grade] || { color: 'bg-slate-100 text-slate-700', icon: Shield, label: 'Unknown' };
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} border flex items-center gap-1`}>
      <Icon className="w-3 h-3" /> {config.label}
    </Badge>
  );
}

function RiskBreakdownBar({ scores }) {
  const segments = [
    { key: 'progress', label: 'Progress', max: 25, color: '#3b82f6' },
    { key: 'timeline', label: 'Timeline', max: 30, color: '#f59e0b' },
    { key: 'budget', label: 'Budget', max: 20, color: '#10b981' },
    { key: 'dependencies', label: 'Dependencies', max: 15, color: '#ef4444' },
    { key: 'velocity', label: 'Velocity', max: 15, color: '#8b5cf6' },
  ];
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-slate-100">
        {segments.map(s => (
          <Tooltip key={s.key}>
            <TooltipTrigger asChild>
              <div style={{ width: `${(scores[s.key] / 100) * 100}%`, backgroundColor: s.color, minWidth: scores[s.key] > 0 ? 3 : 0 }} className="h-full" />
            </TooltipTrigger>
            <TooltipContent className="text-xs">{s.label}: {scores[s.key]}/{s.max}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function ProjectRiskRow({ project, risk, isExpanded, onToggle }) {
  const meterColor = risk.total >= 70 ? '#ef4444' : risk.total >= 45 ? '#f97316' : risk.total >= 25 ? '#f59e0b' : '#10b981';
  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 cursor-pointer" onClick={onToggle}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: meterColor + '18', color: meterColor }}>
          {risk.total}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{project.title}</span>
            <RiskBadge grade={risk.grade} />
          </div>
          <RiskBreakdownBar scores={risk.scores} />
        </div>
        <div className="text-xs text-slate-400 shrink-0">
          {risk.flags.length} flag{risk.flags.length !== 1 ? 's' : ''}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {risk.flags.map((f, i) => (
            <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${f.type === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
              {f.type === 'critical' ? <Flame className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
              {f.msg}
            </div>
          ))}
          <div className="grid grid-cols-5 gap-2 pt-2">
            {[
              { label: 'Progress', val: risk.scores.progress, max: 25 },
              { label: 'Timeline', val: risk.scores.timeline, max: 30 },
              { label: 'Budget', val: risk.scores.budget, max: 20 },
              { label: 'Deps', val: risk.scores.dependencies, max: 15 },
              { label: 'Velocity', val: risk.scores.velocity, max: 15 },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[10px] text-slate-500">{s.label}</div>
                <div className="text-sm font-bold">{s.val}<span className="text-[10px] text-slate-400">/{s.max}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIRiskScoring() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('risk_desc');
  const [expandedId, setExpandedId] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['allProjects'],
    queryFn: () => base44.entities.Project.list('-updated_date', 200),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['allProjectTasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 1000),
  });
  const { data: milestones = [] } = useQuery({
    queryKey: ['allMilestones'],
    queryFn: () => base44.entities.ProjectMilestone.list('-created_date', 500),
  });

  const scored = useMemo(() => {
    return projects
      .filter(p => p.start_date || p.end_date)
      .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()))
      .map(p => ({
        project: p,
        risk: computeRiskScore(p, tasks.filter(t => t.project_id === p.id), milestones.filter(m => m.project_id === p.id)),
      }))
      .sort((a, b) => sortBy === 'risk_desc' ? b.risk.total - a.risk.total : a.risk.total - b.risk.total);
  }, [projects, tasks, milestones, search, sortBy]);

  const criticalCount = scored.filter(s => s.risk.grade === 'critical').length;
  const highCount = scored.filter(s => s.risk.grade === 'high').length;
  const avgRisk = scored.length > 0 ? Math.round(scored.reduce((a, s) => a + s.risk.total, 0) / scored.length) : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1"><XCircle className="w-4 h-4" /><span className="text-xs font-medium">Critical</span></div>
            <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1"><AlertTriangle className="w-4 h-4" /><span className="text-xs font-medium">High Risk</span></div>
            <div className="text-2xl font-bold text-orange-700">{highCount}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><Zap className="w-4 h-4" /><span className="text-xs">Monitored</span></div>
            <div className="text-2xl font-bold">{scored.length}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1"><TrendingDown className="w-4 h-4" /><span className="text-xs">Avg Risk</span></div>
            <div className="text-2xl font-bold" style={{ color: avgRisk >= 45 ? '#f97316' : avgRisk >= 25 ? '#f59e0b' : '#10b981' }}>{avgRisk}/100</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white">
          <option value="risk_desc">Highest Risk First</option>
          <option value="risk_asc">Lowest Risk First</option>
        </select>
      </div>

      {/* Risk List */}
      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Project Risk Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {scored.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No projects with dates to analyze.</div>
          ) : (
            scored.map(({ project, risk }) => (
              <ProjectRiskRow
                key={project.id}
                project={project}
                risk={risk}
                isExpanded={expandedId === project.id}
                onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}