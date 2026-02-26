import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, Target,
  Download, FileText, Calendar, ArrowUpRight,
  BarChart3, PieChart as PieChartIcon, Activity, Award, Filter
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const STAGE_LABELS = {
  prospecting: 'Due Diligence',
  qualification: 'Negotiation',
  proposal: 'Agreement Drafting',
  negotiation: 'Awaiting Execution',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost'
};

const STAGE_COLORS = {
  prospecting: '#06b6d4',
  qualification: '#f59e0b',
  proposal: '#10b981',
  negotiation: '#8b5cf6',
  closed_won: '#22c55e',
  closed_lost: '#ef4444'
};

const CATEGORY_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

export default function DealAnalyticsTab({ deals = [] }) {
  const [timeRange, setTimeRange] = useState('90d');
  const [chartView, setChartView] = useState('overview');

  // Filter deals by time range
  const filteredDeals = useMemo(() => {
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '30d': startDate = subDays(now, 30); break;
      case '90d': startDate = subDays(now, 90); break;
      case '6m': startDate = subMonths(now, 6); break;
      case '1y': startDate = subMonths(now, 12); break;
      default: startDate = subDays(now, 90);
    }
    return deals.filter(d => new Date(d.created_date) >= startDate);
  }, [deals, timeRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeDeals = filteredDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const closedWon = filteredDeals.filter(d => d.stage === 'closed_won');
    const closedLost = filteredDeals.filter(d => d.stage === 'closed_lost');
    const totalClosed = closedWon.length + closedLost.length;
    
    const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonValue = closedWon.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgDealSize = filteredDeals.length > 0 
      ? filteredDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / filteredDeals.length 
      : 0;
    const winRate = totalClosed > 0 ? (closedWon.length / totalClosed) * 100 : 0;

    return {
      totalDeals: filteredDeals.length,
      activeDeals: activeDeals.length,
      closedWon: closedWon.length,
      closedLost: closedLost.length,
      pipelineValue,
      wonValue,
      avgDealSize,
      winRate
    };
  }, [filteredDeals]);

  // Stage funnel data
  const funnelData = useMemo(() => {
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];
    return stages.map(stage => ({
      name: STAGE_LABELS[stage],
      value: filteredDeals.filter(d => d.stage === stage).length,
      fill: STAGE_COLORS[stage]
    }));
  }, [filteredDeals]);

  // Stage distribution for pie chart
  const stageDistribution = useMemo(() => {
    return Object.entries(STAGE_LABELS).map(([stage, label]) => ({
      name: label,
      value: filteredDeals.filter(d => d.stage === stage).length,
      fill: STAGE_COLORS[stage]
    })).filter(d => d.value > 0);
  }, [filteredDeals]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const cats = {};
    filteredDeals.forEach(deal => {
      (deal.tags || []).forEach(tag => {
        const lowerTag = tag.toLowerCase();
        cats[lowerTag] = (cats[lowerTag] || 0) + 1;
      });
    });
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
      }));
  }, [filteredDeals]);

  // Pipeline trend over time
  const pipelineTrend = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthDeals = deals.filter(d => {
        const created = new Date(d.created_date);
        return created >= monthStart && created <= monthEnd;
      });
      
      const wonDeals = monthDeals.filter(d => d.stage === 'closed_won');
      
      return {
        month: format(month, 'MMM'),
        pipeline: monthDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
        won: wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
        count: monthDeals.length
      };
    });
  }, [deals]);

  // Agent performance
  const agentPerformance = useMemo(() => {
    const byOwner = {};
    filteredDeals.forEach(deal => {
      if (!deal.owner_id) return;
      if (!byOwner[deal.owner_id]) {
        byOwner[deal.owner_id] = {
          id: deal.owner_id,
          name: deal.owner_name,
          avatar: deal.owner_avatar,
          totalDeals: 0,
          wonDeals: 0,
          lostDeals: 0,
          pipelineValue: 0,
          wonValue: 0
        };
      }
      byOwner[deal.owner_id].totalDeals++;
      byOwner[deal.owner_id].pipelineValue += deal.amount || 0;
      if (deal.stage === 'closed_won') {
        byOwner[deal.owner_id].wonDeals++;
        byOwner[deal.owner_id].wonValue += deal.amount || 0;
      } else if (deal.stage === 'closed_lost') {
        byOwner[deal.owner_id].lostDeals++;
      }
    });

    return Object.values(byOwner)
      .map(agent => ({
        ...agent,
        winRate: (agent.wonDeals + agent.lostDeals) > 0 
          ? (agent.wonDeals / (agent.wonDeals + agent.lostDeals)) * 100 
          : 0
      }))
      .sort((a, b) => b.wonValue - a.wonValue);
  }, [filteredDeals]);

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount?.toLocaleString() || 0}`;
  };

  // Export functions
  const exportCSV = () => {
    const headers = ['Title', 'Company', 'Amount', 'Stage', 'Owner', 'Created Date', 'Expected Close', 'Priority'];
    const rows = filteredDeals.map(d => [
      d.title,
      d.company_name || '',
      d.amount || 0,
      STAGE_LABELS[d.stage],
      d.owner_name || '',
      d.created_date,
      d.expected_close_date || '',
      d.priority || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartView} onValueChange={setChartView}>
            <SelectTrigger className="w-36">
              <BarChart3 className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="funnel">Funnel</SelectItem>
              <SelectItem value="agents">Agents</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCSV} size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <DollarSign className="w-6 h-6 opacity-80" />
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold mt-1">{formatCurrency(metrics.pipelineValue)}</p>
            <p className="text-cyan-100 text-xs">Pipeline Value</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-6 h-6 opacity-80" />
              <span className="text-sm font-bold">{metrics.winRate.toFixed(0)}%</span>
            </div>
            <p className="text-xl font-bold mt-1">{formatCurrency(metrics.wonValue)}</p>
            <p className="text-emerald-100 text-xs">Won Value</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Target className="w-6 h-6 opacity-80" />
              <Badge className="bg-white/20 text-white text-xs">{metrics.activeDeals} active</Badge>
            </div>
            <p className="text-xl font-bold mt-1">{metrics.totalDeals}</p>
            <p className="text-violet-100 text-xs">Total Deals</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-3">
            <Activity className="w-6 h-6 opacity-80" />
            <p className="text-xl font-bold mt-1">{formatCurrency(metrics.avgDealSize)}</p>
            <p className="text-amber-100 text-xs">Avg Deal Size</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stage Distribution */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <PieChartIcon className="w-4 h-4 text-violet-500" />
                Stage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stageDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {stageDistribution.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} />
                    <span className="text-slate-600 dark:text-slate-400">{s.name}: {s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-cyan-500" />
                Deals by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {chartView === 'funnel' && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-emerald-500" />
              Sales Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage) => {
                const maxValue = Math.max(...funnelData.map(s => s.value));
                const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                return (
                  <div key={stage.name} className="flex items-center gap-3">
                    <div className="w-28 text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                      {stage.name}
                    </div>
                    <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full flex items-center justify-end px-2 transition-all duration-500"
                        style={{ width: `${Math.max(width, 5)}%`, backgroundColor: stage.fill }}
                      >
                        <span className="text-white text-xs font-bold">{stage.value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {chartView === 'agents' && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-amber-500" />
              Agent Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {agentPerformance.slice(0, 10).map((agent, i) => (
                  <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold">
                      {i + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback className="text-xs">{agent.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{agent.name}</p>
                      <p className="text-xs text-slate-500">{agent.totalDeals} deals • {agent.wonDeals} won</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(agent.wonValue)}</p>
                      <p className={`text-xs ${agent.winRate >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {agent.winRate.toFixed(0)}% win
                      </p>
                    </div>
                  </div>
                ))}
                {agentPerformance.length === 0 && (
                  <p className="text-center text-slate-500 py-8">No agent data available</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {chartView === 'trends' && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-500" />
              Pipeline Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={pipelineTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="pipeline" 
                  name="Pipeline"
                  stroke="#06b6d4" 
                  fill="#06b6d4" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="won" 
                  name="Won"
                  stroke="#22c55e" 
                  fill="#22c55e" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}