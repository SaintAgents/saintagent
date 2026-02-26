import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Funnel, FunnelChart, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Target, Users, Calendar,
  Download, FileText, Filter, RefreshCw, ArrowUpRight, Building2,
  Clock, CheckCircle2, AlertTriangle, Percent
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from 'date-fns';
import BackButton from '@/components/hud/BackButton.jsx';
import jsPDF from 'jspdf';

const STAGE_CONFIG = {
  prospecting: { label: 'Due Diligence', color: '#06b6d4' },
  qualification: { label: 'Negotiation', color: '#f59e0b' },
  proposal: { label: 'Agreement', color: '#10b981' },
  negotiation: { label: 'Execution', color: '#8b5cf6' },
  closed_won: { label: 'Won', color: '#22c55e' },
  closed_lost: { label: 'Lost', color: '#ef4444' }
};

const CATEGORY_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

export default function DealAnalytics() {
  const [dateRange, setDateRange] = useState('90');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['dealsAnalytics'],
    queryFn: () => base44.entities.Deal.list('-created_date', 1000)
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profilesAnalytics'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200)
  });

  // Filter deals by date range
  const filteredDeals = useMemo(() => {
    const cutoff = subDays(new Date(), parseInt(dateRange));
    return deals.filter(d => new Date(d.created_date) >= cutoff);
  }, [deals, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeDeals = filteredDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const closedWon = filteredDeals.filter(d => d.stage === 'closed_won');
    const closedLost = filteredDeals.filter(d => d.stage === 'closed_lost');
    
    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonValue = closedWon.reduce((sum, d) => sum + (d.amount || 0), 0);
    const lostValue = closedLost.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const winRate = closedWon.length + closedLost.length > 0 
      ? (closedWon.length / (closedWon.length + closedLost.length) * 100).toFixed(1)
      : 0;

    const avgDealSize = filteredDeals.length > 0
      ? filteredDeals.reduce((sum, d) => sum + (d.amount || 0), 0) / filteredDeals.length
      : 0;

    const fundedDeals = closedWon.filter(d => d.funding_status === 'funded');
    const totalCommissions = fundedDeals.reduce((sum, d) => sum + (d.commission_amount || 0), 0);

    return {
      totalDeals: filteredDeals.length,
      activeDeals: activeDeals.length,
      closedWon: closedWon.length,
      closedLost: closedLost.length,
      totalPipelineValue,
      wonValue,
      lostValue,
      winRate,
      avgDealSize,
      fundedDeals: fundedDeals.length,
      totalCommissions
    };
  }, [filteredDeals]);

  // Conversion funnel data
  const funnelData = useMemo(() => {
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];
    return stages.map(stage => ({
      name: STAGE_CONFIG[stage].label,
      value: filteredDeals.filter(d => d.stage === stage || 
        stages.indexOf(d.stage) > stages.indexOf(stage)).length,
      fill: STAGE_CONFIG[stage].color
    }));
  }, [filteredDeals]);

  // Stage distribution for pie chart
  const stageDistribution = useMemo(() => {
    return Object.entries(STAGE_CONFIG).map(([stage, config]) => ({
      name: config.label,
      value: filteredDeals.filter(d => d.stage === stage).length,
      color: config.color
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
      .map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
  }, [filteredDeals]);

  // Pipeline trend over time
  const pipelineTrend = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthDeals = deals.filter(d => {
        const created = new Date(d.created_date);
        return created >= monthStart && created <= monthEnd;
      });

      const activeValue = monthDeals
        .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      const wonValue = monthDeals
        .filter(d => d.stage === 'closed_won')
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      return {
        month: format(month, 'MMM yyyy'),
        pipeline: activeValue / 1000000,
        won: wonValue / 1000000,
        deals: monthDeals.length
      };
    });
  }, [deals]);

  // Agent performance
  const agentPerformance = useMemo(() => {
    const agentStats = {};
    filteredDeals.forEach(deal => {
      if (!deal.owner_id) return;
      if (!agentStats[deal.owner_id]) {
        const profile = profiles.find(p => p.user_id === deal.owner_id);
        agentStats[deal.owner_id] = {
          name: deal.owner_name || 'Unknown',
          avatar: deal.owner_avatar || profile?.avatar_url,
          total: 0,
          won: 0,
          lost: 0,
          value: 0,
          wonValue: 0,
          commissions: 0
        };
      }
      agentStats[deal.owner_id].total++;
      agentStats[deal.owner_id].value += deal.amount || 0;
      if (deal.stage === 'closed_won') {
        agentStats[deal.owner_id].won++;
        agentStats[deal.owner_id].wonValue += deal.amount || 0;
        agentStats[deal.owner_id].commissions += deal.commission_amount || 0;
      }
      if (deal.stage === 'closed_lost') {
        agentStats[deal.owner_id].lost++;
      }
    });

    return Object.values(agentStats)
      .map(agent => ({
        ...agent,
        winRate: agent.won + agent.lost > 0 
          ? ((agent.won / (agent.won + agent.lost)) * 100).toFixed(1)
          : 0
      }))
      .sort((a, b) => b.wonValue - a.wonValue);
  }, [filteredDeals, profiles]);

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Title', 'Company', 'Amount', 'Stage', 'Owner', 'Expected Close', 'Created'];
    const rows = filteredDeals.map(d => [
      d.title,
      d.company_name || '',
      d.amount || 0,
      STAGE_CONFIG[d.stage]?.label || d.stage,
      d.owner_name || '',
      d.expected_close_date || '',
      d.created_date ? format(new Date(d.created_date), 'yyyy-MM-dd') : ''
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.text('Deal Analytics Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Period: Last ${dateRange} days`, pageWidth / 2, 34, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Key Metrics', 20, 50);
    
    doc.setFontSize(10);
    const metricsText = [
      `Total Deals: ${metrics.totalDeals}`,
      `Active Deals: ${metrics.activeDeals}`,
      `Deals Won: ${metrics.closedWon}`,
      `Win Rate: ${metrics.winRate}%`,
      `Pipeline Value: $${(metrics.totalPipelineValue / 1000000).toFixed(1)}M`,
      `Won Value: $${(metrics.wonValue / 1000000).toFixed(1)}M`,
      `Avg Deal Size: $${(metrics.avgDealSize / 1000).toFixed(0)}K`,
      `Total Commissions: $${metrics.totalCommissions.toLocaleString()}`
    ];
    
    metricsText.forEach((text, i) => {
      doc.text(text, 20, 60 + i * 7);
    });

    doc.setFontSize(14);
    doc.text('Top Agents by Won Value', 20, 130);
    
    doc.setFontSize(10);
    agentPerformance.slice(0, 5).forEach((agent, i) => {
      doc.text(
        `${i + 1}. ${agent.name}: $${(agent.wonValue / 1000).toFixed(0)}K won, ${agent.winRate}% win rate`,
        20,
        140 + i * 7
      );
    });

    doc.save(`deal-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const MetricCard = ({ icon: Icon, label, value, subValue, color, trend }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== undefined && (
            <Badge variant={trend >= 0 ? 'default' : 'destructive'} className="text-xs">
              {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold mt-3">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      {/* Hero */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-violet-600" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Deal Analytics</h1>
          <p className="text-cyan-200">Advanced reporting & performance insights</p>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button variant="outline" onClick={exportPDF} className="gap-2">
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <MetricCard icon={Target} label="Total Deals" value={metrics.totalDeals} color="bg-blue-600" />
          <MetricCard icon={Building2} label="Active" value={metrics.activeDeals} color="bg-cyan-600" />
          <MetricCard icon={CheckCircle2} label="Won" value={metrics.closedWon} color="bg-emerald-600" />
          <MetricCard icon={Percent} label="Win Rate" value={`${metrics.winRate}%`} color="bg-violet-600" />
          <MetricCard icon={DollarSign} label="Pipeline" value={formatCurrency(metrics.totalPipelineValue)} color="bg-amber-600" />
          <MetricCard icon={TrendingUp} label="Won Value" value={formatCurrency(metrics.wonValue)} color="bg-green-600" />
          <MetricCard icon={DollarSign} label="Avg Deal" value={formatCurrency(metrics.avgDealSize)} color="bg-pink-600" />
          <MetricCard icon={DollarSign} label="Commissions" value={formatCurrency(metrics.totalCommissions)} color="bg-orange-600" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stage Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deals by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stageDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stageDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
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
                  <CardTitle className="text-lg">Deals by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {categoryDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
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
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-5 gap-4 mt-6">
                  {funnelData.map((stage, i) => {
                    const convRate = i < funnelData.length - 1 && funnelData[i].value > 0
                      ? ((funnelData[i + 1].value / funnelData[i].value) * 100).toFixed(1)
                      : null;
                    return (
                      <div key={stage.name} className="text-center">
                        <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: stage.fill }} />
                        <p className="text-xs font-medium">{stage.name}</p>
                        <p className="text-lg font-bold">{stage.value}</p>
                        {convRate && (
                          <p className="text-xs text-slate-500">→ {convRate}%</p>
                        )}
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
                <CardTitle className="text-lg">Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {agentPerformance.map((agent, i) => (
                      <div key={agent.name} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-slate-300 w-8">#{i + 1}</div>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{agent.name}</p>
                          <div className="flex gap-4 text-sm text-slate-500">
                            <span>{agent.total} deals</span>
                            <span className="text-emerald-600">{agent.won} won</span>
                            <span className="text-red-500">{agent.lost} lost</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">{formatCurrency(agent.wonValue)}</p>
                          <p className="text-xs text-slate-500">won value</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={parseFloat(agent.winRate) >= 50 ? 'default' : 'secondary'}>
                            {agent.winRate}% win rate
                          </Badge>
                          {agent.commissions > 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                              {formatCurrency(agent.commissions)} commissions
                            </p>
                          )}
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
                <CardTitle className="text-lg">Pipeline Value Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={pipelineTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `$${v}M`} />
                    <Tooltip formatter={(v) => [`$${v.toFixed(1)}M`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="pipeline" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Active Pipeline" />
                    <Area type="monotone" dataKey="won" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Won Value" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Deal Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pipelineTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deals" stroke="#8b5cf6" strokeWidth={2} name="New Deals" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}