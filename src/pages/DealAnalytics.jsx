import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Target,
  Download, FileText, Calendar, Filter, ArrowUpRight,
  BarChart3, PieChart as PieChartIcon, Activity, Award
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import BackButton from '@/components/hud/BackButton';

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

export default function DealAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('90d');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 1000)
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['dealCommissions'],
    queryFn: () => base44.entities.DealCommission.list('-created_date', 500)
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200)
  });

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
        month: format(month, 'MMM yyyy'),
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

  // Conversion rates by stage
  const conversionRates = useMemo(() => {
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation'];
    return stages.map((stage, i) => {
      const currentCount = filteredDeals.filter(d => d.stage === stage).length;
      const nextStages = stages.slice(i + 1).concat(['closed_won']);
      const progressedCount = filteredDeals.filter(d => nextStages.includes(d.stage) || d.stage === 'closed_won').length;
      
      return {
        stage: STAGE_LABELS[stage],
        rate: currentCount > 0 ? Math.round((progressedCount / (currentCount + progressedCount)) * 100) : 0
      };
    });
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

  const exportPDF = async () => {
    // Use jspdf for PDF generation
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Deal Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 20, 30);
    doc.text(`Time Range: ${timeRange}`, 20, 38);
    
    doc.setFontSize(14);
    doc.text('Summary Metrics', 20, 55);
    doc.setFontSize(10);
    doc.text(`Total Deals: ${metrics.totalDeals}`, 25, 65);
    doc.text(`Pipeline Value: ${formatCurrency(metrics.pipelineValue)}`, 25, 72);
    doc.text(`Won Value: ${formatCurrency(metrics.wonValue)}`, 25, 79);
    doc.text(`Win Rate: ${metrics.winRate.toFixed(1)}%`, 25, 86);
    doc.text(`Avg Deal Size: ${formatCurrency(metrics.avgDealSize)}`, 25, 93);
    
    doc.setFontSize(14);
    doc.text('Top Agents', 20, 110);
    doc.setFontSize(10);
    agentPerformance.slice(0, 5).forEach((agent, i) => {
      doc.text(`${i + 1}. ${agent.name}: ${formatCurrency(agent.wonValue)} won (${agent.winRate.toFixed(0)}% win rate)`, 25, 120 + (i * 7));
    });
    
    doc.save(`deal-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-violet-600 to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-1">Deal Analytics</h1>
          <p className="text-cyan-100">Performance insights and reporting dashboard</p>
        </div>
      </div>

      <div className="p-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
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
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportPDF} className="gap-2">
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="w-8 h-8 opacity-80" />
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.pipelineValue)}</p>
              <p className="text-cyan-100 text-sm">Pipeline Value</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-lg font-bold">{metrics.winRate.toFixed(0)}%</span>
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.wonValue)}</p>
              <p className="text-emerald-100 text-sm">Won Value</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Target className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white">{metrics.activeDeals} active</Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{metrics.totalDeals}</p>
              <p className="text-violet-100 text-sm">Total Deals</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Activity className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.avgDealSize)}</p>
              <p className="text-amber-100 text-sm">Avg Deal Size</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-2">
              <Filter className="w-4 h-4" />
              Funnel
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="w-4 h-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stage Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-violet-500" />
                    Stage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stageDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stageDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-500" />
                    Deals by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
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

              {/* Conversion Rates */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Stage Conversion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={conversionRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Funnel Tab */}
          <TabsContent value="funnel">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((stage, i) => {
                    const maxValue = Math.max(...funnelData.map(s => s.value));
                    const width = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
                    return (
                      <div key={stage.name} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {stage.name}
                        </div>
                        <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                          <div
                            className="h-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: stage.fill }}
                          >
                            <span className="text-white font-bold">{stage.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Agent Performance Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {agentPerformance.map((agent, i) => (
                      <div key={agent.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold">
                          {i + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">{agent.name}</p>
                          <p className="text-sm text-slate-500">{agent.totalDeals} deals • {agent.wonDeals} won</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">{formatCurrency(agent.wonValue)}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <span className={agent.winRate >= 50 ? 'text-emerald-500' : 'text-amber-500'}>
                              {agent.winRate.toFixed(0)}% win rate
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Pipeline Value Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={pipelineTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="pipeline" 
                      name="Pipeline Value"
                      stroke="#06b6d4" 
                      fill="#06b6d4" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="won" 
                      name="Won Value"
                      stroke="#22c55e" 
                      fill="#22c55e" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}