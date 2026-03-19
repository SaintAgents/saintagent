import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle2, Search, ArrowLeft, BarChart3, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import ProjectBurnCard from '@/components/projects/forecast/ProjectBurnCard';
import {
  calculateProjectForecast,
  generateWeeklyBurnData,
  calculatePortfolioSummary,
} from '@/components/projects/forecast/ForecastUtils';
import BudgetDelayAlerts from '@/components/projects/forecast/BudgetDelayAlerts';
import BackButton from '@/components/hud/BackButton';

function SummaryTile({ icon: Icon, label, value, sub, color }) {
  return (
    <Card className="border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
          {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BudgetForecast() {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('variance');

  // Fetch all data
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['forecast_projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 500),
  });

  const { data: allTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['forecast_tasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 5000),
  });

  const { data: allTimeEntries = [], isLoading: loadingTime } = useQuery({
    queryKey: ['forecast_time'],
    queryFn: () => base44.entities.TaskTimeEntry.list('-created_date', 5000),
  });

  const isLoading = loadingProjects || loadingTasks || loadingTime;

  // Only projects with tasks or budget
  const activeProjects = useMemo(() =>
    projects.filter(p =>
      (p.project_status === 'in_progress' || p.project_status === 'planned' || p.status === 'funded' || p.status === 'in_progress') &&
      (allTasks.some(t => t.project_id === p.id) || p.budget > 0)
    ), [projects, allTasks]);

  // Calculate forecasts
  const projectForecasts = useMemo(() => {
    return activeProjects.map(project => {
      const tasks = allTasks.filter(t => t.project_id === project.id);
      const entries = allTimeEntries.filter(e => e.project_id === project.id);
      const forecast = calculateProjectForecast(project, tasks, entries);
      const weeklyData = generateWeeklyBurnData(tasks, entries);
      return { project, forecast, weeklyData };
    });
  }, [activeProjects, allTasks, allTimeEntries]);

  // Portfolio summary
  const portfolio = useMemo(() =>
    calculatePortfolioSummary(projectForecasts.map(pf => pf.forecast)),
    [projectForecasts]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = [...projectForecasts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(pf => pf.project.title?.toLowerCase().includes(q));
    }
    if (healthFilter !== 'all') {
      list = list.filter(pf => pf.forecast.health === healthFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'variance') return a.forecast.costVariance - b.forecast.costVariance; // worst first
      if (sortBy === 'budget') return b.forecast.budget - a.forecast.budget;
      if (sortBy === 'cpi') return a.forecast.cpi - b.forecast.cpi; // worst first
      if (sortBy === 'hours') return b.forecast.totalActualHours - a.forecast.totalActualHours;
      return 0;
    });

    return list;
  }, [projectForecasts, search, healthFilter, sortBy]);

  // Variance chart data (top 10 by abs variance)
  const varianceChartData = useMemo(() => {
    return [...projectForecasts]
      .sort((a, b) => Math.abs(b.forecast.costVariance) - Math.abs(a.forecast.costVariance))
      .slice(0, 10)
      .map(pf => ({
        name: pf.project.title?.length > 20 ? pf.project.title.substring(0, 18) + '…' : pf.project.title,
        variance: Math.round(pf.forecast.costVariance),
        health: pf.forecast.health,
      }));
  }, [projectForecasts]);

  const fmtK = (v) => {
    if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
    return `$${Math.round(v)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-violet-600" />
              Budget Forecast
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track actual vs. estimated hours, cost variance, and predicted final spend
            </p>
          </div>
          <Link to="/Projects">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Projects
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading forecast data...
          </div>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <SummaryTile
                icon={DollarSign}
                label="Total Budget"
                value={fmtK(portfolio.totalBudget)}
                sub={`${portfolio.projectCount} projects`}
                color="bg-violet-100 text-violet-600"
              />
              <SummaryTile
                icon={Clock}
                label="Hours Logged"
                value={`${Math.round(portfolio.totalActualHours)}h`}
                sub={`of ${Math.round(portfolio.totalEstimatedHours)}h estimated`}
                color="bg-cyan-100 text-cyan-600"
              />
              <SummaryTile
                icon={TrendingUp}
                label="Cost Variance"
                value={fmtK(Math.abs(portfolio.totalCostVariance))}
                sub={portfolio.totalCostVariance >= 0 ? 'Under budget' : 'Over budget'}
                color={portfolio.totalCostVariance >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
              />
              <SummaryTile
                icon={AlertTriangle}
                label="At Risk"
                value={`${portfolio.atRiskCount + portfolio.criticalCount}`}
                sub={`${portfolio.criticalCount} critical, ${portfolio.atRiskCount} at risk`}
                color={portfolio.criticalCount > 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}
              />
            </div>

            {/* Budget & Delay Alerts */}
            <BudgetDelayAlerts projectForecasts={projectForecasts} />

            {/* Variance Chart */}
            {varianceChartData.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-violet-500" />
                    Cost Variance by Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={varianceChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => v >= 1000 ? `$${v/1000}k` : `$${v}`} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        formatter={(v) => [fmtK(v), 'Variance']}
                      />
                      <Bar dataKey="variance" radius={[4, 4, 0, 0]}>
                        {varianceChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.variance >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9"
                />
              </div>
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Health" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="variance">Cost Variance</SelectItem>
                  <SelectItem value="budget">Budget Size</SelectItem>
                  <SelectItem value="cpi">CPI (Worst)</SelectItem>
                  <SelectItem value="hours">Hours Logged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-slate-400 mb-3">
              {filtered.length} of {projectForecasts.length} projects
            </div>

            {/* Project Cards */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No projects with budget or task data found</p>
                </div>
              ) : (
                filtered.map(({ project, forecast, weeklyData }) => (
                  <ProjectBurnCard
                    key={project.id}
                    project={project}
                    forecast={forecast}
                    weeklyData={weeklyData}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}