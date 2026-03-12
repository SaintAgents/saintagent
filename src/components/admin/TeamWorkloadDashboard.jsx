import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Users, CheckCircle, Clock, Zap, Search, BarChart3, Flame, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WORKLOAD_THRESHOLDS = { low: 3, medium: 6, high: 10 };

function getWorkloadLevel(activeTasks) {
  if (activeTasks <= WORKLOAD_THRESHOLDS.low) return { level: 'low', color: 'text-emerald-600 bg-emerald-50', bar: '#10b981', label: 'Light' };
  if (activeTasks <= WORKLOAD_THRESHOLDS.medium) return { level: 'medium', color: 'text-amber-600 bg-amber-50', bar: '#f59e0b', label: 'Moderate' };
  if (activeTasks <= WORKLOAD_THRESHOLDS.high) return { level: 'high', color: 'text-orange-600 bg-orange-50', bar: '#f97316', label: 'Heavy' };
  return { level: 'overloaded', color: 'text-red-600 bg-red-50', bar: '#ef4444', label: 'Overloaded' };
}

function WorkloadSummaryCards({ members }) {
  const overloaded = members.filter(m => m.workload.level === 'overloaded').length;
  const heavy = members.filter(m => m.workload.level === 'high').length;
  const totalActive = members.reduce((sum, m) => sum + m.activeTasks, 0);
  const avgLoad = members.length ? (totalActive / members.length).toFixed(1) : 0;

  const cards = [
    { label: 'Total Members', value: members.length, icon: Users, color: 'text-violet-600 bg-violet-50' },
    { label: 'Avg Tasks/Person', value: avgLoad, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
    { label: 'Heavy Load', value: heavy, icon: Flame, color: 'text-orange-600 bg-orange-50' },
    { label: 'Overloaded', value: overloaded, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
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

function WorkloadChart({ members }) {
  const chartData = members.slice(0, 20).map(m => ({
    name: m.name?.split(' ')[0] || 'Unknown',
    tasks: m.activeTasks,
    color: m.workload.bar,
  }));

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">Active Tasks by Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`${val} tasks`, 'Active']} />
              <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberRow({ member }) {
  const { name, avatar, activeTasks, completedTasks, blockedTasks, urgentTasks, projects, estimatedHours, workload } = member;
  const maxTasks = WORKLOAD_THRESHOLDS.high + 2;
  const progressPct = Math.min((activeTasks / maxTasks) * 100, 100);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs bg-violet-100 text-violet-700">{name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{name || 'Unassigned'}</p>
          <Badge className={`text-[10px] px-1.5 py-0 ${workload.color}`}>{workload.label}</Badge>
        </div>
        <Progress value={progressPct} className="h-1.5" />
        <div className="flex gap-3 mt-1.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activeTasks} active</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" />{completedTasks} done</span>
          {blockedTasks > 0 && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3" />{blockedTasks} blocked</span>}
          {urgentTasks > 0 && <span className="flex items-center gap-1 text-orange-500"><Zap className="w-3 h-3" />{urgentTasks} urgent</span>}
          {estimatedHours > 0 && <span>~{estimatedHours}h est.</span>}
        </div>
      </div>

      <div className="text-right shrink-0 hidden md:block">
        <p className="text-xs text-slate-400 mb-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
          {projects.slice(0, 3).map((p, i) => (
            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 truncate max-w-[90px]">{p}</Badge>
          ))}
          {projects.length > 3 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{projects.length - 3}</Badge>}
        </div>
      </div>
    </div>
  );
}

export default function TeamWorkloadDashboard() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('tasks_desc');

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-all-tasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 500),
    staleTime: 60000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['admin-all-projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
    staleTime: 60000,
  });

  const projectMap = useMemo(() => {
    const m = {};
    projects.forEach(p => { m[p.id] = p.title; });
    return m;
  }, [projects]);

  const members = useMemo(() => {
    const byAssignee = {};
    tasks.forEach(t => {
      const id = t.assignee_id;
      if (!id) return;
      if (!byAssignee[id]) {
        byAssignee[id] = {
          id, name: t.assignee_name || id, avatar: t.assignee_avatar || '',
          activeTasks: 0, completedTasks: 0, blockedTasks: 0, urgentTasks: 0,
          estimatedHours: 0, projectIds: new Set(),
        };
      }
      const m = byAssignee[id];
      if (t.project_id) m.projectIds.add(t.project_id);
      if (t.status === 'completed') { m.completedTasks++; }
      else {
        m.activeTasks++;
        if (t.status === 'blocked') m.blockedTasks++;
        if (t.priority === 'urgent') m.urgentTasks++;
        if (t.estimated_hours) m.estimatedHours += t.estimated_hours;
      }
    });

    return Object.values(byAssignee).map(m => ({
      ...m,
      projects: Array.from(m.projectIds).map(pid => projectMap[pid] || 'Unknown'),
      workload: getWorkloadLevel(m.activeTasks),
    }));
  }, [tasks, projectMap]);

  const filtered = useMemo(() => {
    let list = members;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    if (filterLevel !== 'all') {
      list = list.filter(m => m.workload.level === filterLevel);
    }
    list.sort((a, b) => {
      if (sortBy === 'tasks_desc') return b.activeTasks - a.activeTasks;
      if (sortBy === 'tasks_asc') return a.activeTasks - b.activeTasks;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [members, search, filterLevel, sortBy]);

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Team Workload Dashboard</h2>
          <p className="text-sm text-slate-500">Visualize and balance task assignments across projects</p>
        </div>
      </div>

      <WorkloadSummaryCards members={members} />
      <WorkloadChart members={filtered} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Workload" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="low">Light</SelectItem>
            <SelectItem value="medium">Moderate</SelectItem>
            <SelectItem value="high">Heavy</SelectItem>
            <SelectItem value="overloaded">Overloaded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tasks_desc">Most Tasks</SelectItem>
            <SelectItem value="tasks_asc">Fewest Tasks</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Member List */}
      <Card>
        <CardContent className="p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No team members found with assigned tasks</p>
            </div>
          ) : (
            filtered.map(m => <MemberRow key={m.id} member={m} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}