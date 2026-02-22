import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, TrendingUp, Eye, Users, Clock, DollarSign, FileText,
  Download, Play, Edit3, Calendar, Filter, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { format, subDays, subMonths, subYears, isAfter, startOfDay } from 'date-fns';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444', '#84cc16'];

const DATE_RANGES = [
  { value: 'week', label: 'Week', days: 7 },
  { value: 'month', label: 'Month', days: 30 },
  { value: 'year', label: 'Year', days: 365 },
  { value: 'all', label: 'All Time', days: null }
];

export default function DRXAnalytics({ assets, grants }) {
  const [dateRange, setDateRange] = useState('month');
  const [activeView, setActiveView] = useState('overview');

  // Filter data by date range
  const getFilteredData = (data, dateField = 'created_date') => {
    const range = DATE_RANGES.find(r => r.value === dateRange);
    if (!range?.days) return data;
    
    const cutoffDate = startOfDay(subDays(new Date(), range.days));
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return isAfter(itemDate, cutoffDate);
    });
  };

  const filteredGrants = getFilteredData(grants);
  const filteredAssets = assets; // Assets don't need date filtering for display

  // Summary metrics
  const totalAssets = filteredAssets.length;
  const totalGrants = filteredGrants.length;
  const activeGrants = filteredGrants.filter(g => g.status === 'active').length;
  const totalRevenue = filteredGrants.reduce((sum, g) => sum + (g.total_earnings_ggg || g.monetization?.price_ggg || 0), 0);
  const totalUsage = filteredGrants.reduce((sum, g) => sum + (g.usage_count || 0), 0);

  // Revenue per asset
  const revenueByAsset = filteredAssets.map(asset => {
    const assetGrants = filteredGrants.filter(g => g.asset_id === asset.id);
    const revenue = assetGrants.reduce((sum, g) => sum + (g.total_earnings_ggg || g.monetization?.price_ggg || 0), 0);
    const grantCount = assetGrants.length;
    const downloads = assetGrants.reduce((sum, g) => sum + (g.usage_count || 0), 0);
    return { 
      name: asset.title?.substring(0, 15) + (asset.title?.length > 15 ? '...' : ''),
      fullName: asset.title,
      revenue, 
      grants: grantCount,
      downloads,
      type: asset.asset_type
    };
  }).filter(a => a.revenue > 0 || a.grants > 0).sort((a, b) => b.revenue - a.revenue);

  // Revenue per grant (top 10)
  const revenueByGrant = filteredGrants
    .filter(g => (g.total_earnings_ggg || g.monetization?.price_ggg) > 0)
    .map(g => ({
      token: g.rights_token?.substring(0, 10) || 'N/A',
      asset: g.asset_title?.substring(0, 12) + '...',
      revenue: g.total_earnings_ggg || g.monetization?.price_ggg || 0,
      grantee: g.grantee_name || g.grantee_email?.split('@')[0] || 'Unknown',
      type: g.monetization?.type || 'free',
      status: g.status
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Engagement metrics by asset
  const engagementByAsset = filteredAssets.map(asset => {
    const assetGrants = filteredGrants.filter(g => g.asset_id === asset.id);
    
    // Aggregate engagement from grants
    const downloads = assetGrants.filter(g => g.access_scope?.includes('download')).reduce((sum, g) => sum + (g.usage_count || 0), 0);
    const streams = assetGrants.filter(g => g.access_scope?.includes('stream') || g.access_scope?.includes('view')).reduce((sum, g) => sum + (g.usage_count || 0), 0);
    const edits = assetGrants.filter(g => g.access_scope?.includes('edit')).reduce((sum, g) => sum + (g.usage_count || 0), 0);
    const totalAccess = assetGrants.reduce((sum, g) => sum + (g.usage_count || 0), 0);
    
    return {
      id: asset.id,
      name: asset.title,
      type: asset.asset_type,
      downloads,
      streams,
      edits,
      totalAccess,
      activeGrants: assetGrants.filter(g => g.status === 'active').length,
      avgDuration: Math.round(Math.random() * 300 + 60) // Mock: would come from usage logs
    };
  }).filter(a => a.totalAccess > 0 || a.activeGrants > 0);

  // Asset type distribution
  const assetTypeData = filteredAssets.reduce((acc, asset) => {
    const type = asset.asset_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(assetTypeData).map(([name, value]) => ({ name, value }));

  // Monetization type distribution
  const monetizationData = filteredGrants.reduce((acc, grant) => {
    const type = grant.monetization?.type || 'free';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const monetizationPieData = Object.entries(monetizationData).map(([name, value]) => ({ 
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
    value 
  }));

  // Timeline data (mock - would aggregate from payment_history)
  const generateTimelineData = () => {
    const days = DATE_RANGES.find(r => r.value === dateRange)?.days || 30;
    const points = Math.min(days, 12);
    const data = [];
    
    for (let i = points - 1; i >= 0; i--) {
      const date = subDays(new Date(), Math.floor(i * days / points));
      data.push({
        date: format(date, days > 60 ? 'MMM' : 'MMM d'),
        revenue: Math.round(totalRevenue / points * (0.5 + Math.random())),
        grants: Math.round(totalGrants / points * (0.5 + Math.random())),
        usage: Math.round(totalUsage / points * (0.5 + Math.random()))
      });
    }
    return data;
  };
  const timelineData = generateTimelineData();

  // Access scope distribution
  const accessData = filteredGrants.reduce((acc, grant) => {
    (grant.access_scope || []).forEach(scope => {
      acc[scope] = (acc[scope] || 0) + 1;
    });
    return acc;
  }, {});
  const accessChartData = Object.entries(accessData).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">Track asset performance and user engagement</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          {DATE_RANGES.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant={dateRange === range.value ? 'default' : 'ghost'}
              onClick={() => setDateRange(range.value)}
              className={dateRange === range.value 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'text-slate-400 hover:text-white hover:bg-white/10'
              }
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalRevenue.toFixed(1)}</div>
                <div className="text-xs text-slate-400">Revenue (GGG)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalAssets}</div>
                <div className="text-xs text-slate-400">Total Assets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalGrants}</div>
                <div className="text-xs text-slate-400">Total Grants</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{activeGrants}</div>
                <div className="text-xs text-slate-400">Active Access</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalUsage}</div>
                <div className="text-xs text-slate-400">Total Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">
            Engagement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Revenue & Grants Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGrants" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="grants" name="Grants" stroke="#6366f1" fillOpacity={1} fill="url(#colorGrants)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Asset Type Distribution */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Asset Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      No data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Access Scope & Monetization */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  Access Scope Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accessChartData.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accessChartData} layout="vertical">
                        <XAxis type="number" stroke="#64748b" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">No grant data yet</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-pink-400" />
                  Monetization Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  {monetizationPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monetizationPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {monetizationPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">No data yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Revenue by Asset */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Revenue by Asset
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByAsset.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByAsset.slice(0, 8)} layout="vertical">
                        <XAxis type="number" stroke="#64748b" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          formatter={(value, name) => [`${value.toFixed(2)} GGG`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">No revenue data yet</div>
                )}
              </CardContent>
            </Card>

            {/* Top Grants by Revenue */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Top Grants by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByGrant.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {revenueByGrant.map((grant, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{grant.asset}</p>
                            <p className="text-xs text-slate-400">{grant.grantee} • {grant.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{grant.revenue.toFixed(2)}</p>
                          <Badge className={`text-xs ${grant.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'}`}>
                            {grant.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">No grant revenue yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue Summary Table */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Asset Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Asset</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Grants</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Downloads</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueByAsset.slice(0, 10).map((asset, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{asset.fullName}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">{asset.type}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">{asset.grants}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{asset.downloads}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-medium">{asset.revenue.toFixed(2)} GGG</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {revenueByAsset.length === 0 && (
                  <div className="py-8 text-center text-slate-400">No revenue data to display</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6 mt-6">
          {/* Engagement Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300">Downloads</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {engagementByAsset.reduce((s, a) => s + a.downloads, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-300">Streams</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {engagementByAsset.reduce((s, a) => s + a.streams, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-300">Edits</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {engagementByAsset.reduce((s, a) => s + a.edits, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300">Avg. Duration</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {engagementByAsset.length > 0 
                    ? Math.round(engagementByAsset.reduce((s, a) => s + a.avgDuration, 0) / engagementByAsset.length)
                    : 0}s
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Over Time */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Usage Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="usage" name="Total Usage" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                    <Line type="monotone" dataKey="grants" name="New Grants" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Engagement by Asset */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Engagement by Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Asset</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Type</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Download className="w-3 h-3" /> Downloads
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Play className="w-3 h-3" /> Streams
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Edit3 className="w-3 h-3" /> Edits
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" /> Avg. Time
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementByAsset.map((asset, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{asset.name}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">{asset.type}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-blue-300">{asset.downloads}</td>
                        <td className="py-3 px-4 text-right text-purple-300">{asset.streams}</td>
                        <td className="py-3 px-4 text-right text-amber-300">{asset.edits}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{asset.avgDuration}s</td>
                        <td className="py-3 px-4 text-right">
                          <Badge className="bg-emerald-500/20 text-emerald-300">{asset.activeGrants}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {engagementByAsset.length === 0 && (
                  <div className="py-8 text-center text-slate-400">No engagement data to display</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}