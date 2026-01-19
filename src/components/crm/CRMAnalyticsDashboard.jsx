import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, UserPlus, Mail, Phone, Calendar,
  Globe, Building, Briefcase, Target, Activity, Download, Filter,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  ArrowUpRight, ArrowDownRight, Sparkles, Clock, Star, Zap
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO, isWithinInterval } from 'date-fns';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const DOMAIN_COLORS = {
  tech: '#3b82f6',
  finance: '#10b981',
  health: '#ef4444',
  education: '#f59e0b',
  media: '#ec4899',
  legal: '#6366f1',
  spiritual: '#8b5cf6',
  creative: '#14b8a6',
  nonprofit: '#06b6d4',
  governance: '#84cc16',
  other: '#94a3b8'
};

export default function CRMAnalyticsDashboard({ contacts = [], contributions = [], interactions = [] }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [reportTab, setReportTab] = useState('overview');

  // Calculate date range
  const dateRange = useMemo(() => {
    const end = new Date();
    let start;
    switch (timeRange) {
      case '7d': start = subDays(end, 7); break;
      case '30d': start = subDays(end, 30); break;
      case '90d': start = subDays(end, 90); break;
      case '12m': start = subMonths(end, 12); break;
      default: start = subDays(end, 30);
    }
    return { start, end };
  }, [timeRange]);

  // Filter contacts by date range
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (!c.created_date) return true;
      const created = parseISO(c.created_date);
      return isWithinInterval(created, dateRange);
    });
  }, [contacts, dateRange]);

  // Network Growth Data
  const networkGrowthData = useMemo(() => {
    const interval = timeRange === '12m' 
      ? eachMonthOfInterval(dateRange)
      : eachDayOfInterval(dateRange);
    
    let cumulative = contacts.filter(c => {
      if (!c.created_date) return false;
      return parseISO(c.created_date) < dateRange.start;
    }).length;

    return interval.map(date => {
      const dayContacts = contacts.filter(c => {
        if (!c.created_date) return false;
        const created = parseISO(c.created_date);
        if (timeRange === '12m') {
          return format(created, 'yyyy-MM') === format(date, 'yyyy-MM');
        }
        return format(created, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      cumulative += dayContacts.length;
      return {
        date: timeRange === '12m' ? format(date, 'MMM yyyy') : format(date, 'MMM d'),
        added: dayContacts.length,
        total: cumulative
      };
    });
  }, [contacts, dateRange, timeRange]);

  // Lead Source Analysis
  const leadSourceData = useMemo(() => {
    const sources = {};
    contacts.forEach(c => {
      const source = c.source || 'Direct';
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [contacts]);

  // Domain Distribution
  const domainData = useMemo(() => {
    const domains = {};
    contacts.forEach(c => {
      const domain = c.domain || 'other';
      domains[domain] = (domains[domain] || 0) + 1;
    });
    return Object.entries(domains)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value,
        color: DOMAIN_COLORS[name] || DOMAIN_COLORS.other
      }))
      .sort((a, b) => b.value - a.value);
  }, [contacts]);

  // Quality Score Distribution
  const qualityData = useMemo(() => {
    const ranges = [
      { name: 'Excellent (80-100)', min: 80, max: 100, count: 0 },
      { name: 'Good (60-79)', min: 60, max: 79, count: 0 },
      { name: 'Fair (40-59)', min: 40, max: 59, count: 0 },
      { name: 'Needs Work (0-39)', min: 0, max: 39, count: 0 }
    ];
    contacts.forEach(c => {
      const score = c.quality_score || 0;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [contacts]);

  // Engagement Metrics
  const engagementMetrics = useMemo(() => {
    const withEmail = contacts.filter(c => c.email).length;
    const withPhone = contacts.filter(c => c.phone).length;
    const withCompany = contacts.filter(c => c.company).length;
    const federated = contacts.filter(c => c.is_federated).length;
    const highQuality = contacts.filter(c => (c.quality_score || 0) >= 70).length;
    const withNotes = contacts.filter(c => c.notes).length;
    
    return {
      withEmail,
      withPhone,
      withCompany,
      federated,
      highQuality,
      withNotes,
      emailRate: contacts.length ? Math.round((withEmail / contacts.length) * 100) : 0,
      phoneRate: contacts.length ? Math.round((withPhone / contacts.length) * 100) : 0,
      companyRate: contacts.length ? Math.round((withCompany / contacts.length) * 100) : 0,
      federatedRate: contacts.length ? Math.round((federated / contacts.length) * 100) : 0
    };
  }, [contacts]);

  // Recent Activity
  const recentActivity = useMemo(() => {
    return contacts
      .filter(c => c.created_date)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        action: 'added',
        date: c.created_date,
        domain: c.domain
      }));
  }, [contacts]);

  // Growth stats
  const growthStats = useMemo(() => {
    const now = new Date();
    const thisMonth = contacts.filter(c => {
      if (!c.created_date) return false;
      const created = parseISO(c.created_date);
      return isWithinInterval(created, { start: startOfMonth(now), end: now });
    }).length;

    const lastMonth = contacts.filter(c => {
      if (!c.created_date) return false;
      const created = parseISO(c.created_date);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      return isWithinInterval(created, { start: lastMonthStart, end: lastMonthEnd });
    }).length;

    const growthRate = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : thisMonth > 0 ? 100 : 0;

    return { thisMonth, lastMonth, growthRate };
  }, [contacts]);

  // Export report as CSV
  const handleExportReport = () => {
    const headers = ['Name', 'Email', 'Company', 'Domain', 'Quality Score', 'Source', 'Created Date', 'Federated'];
    const rows = contacts.map(c => [
      c.name || '',
      c.email || '',
      c.company || '',
      c.domain || '',
      c.quality_score || 0,
      c.source || '',
      c.created_date || '',
      c.is_federated ? 'Yes' : 'No'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-sm text-slate-500">Track engagement, growth, and network effectiveness</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium">Total Contacts</p>
                <p className="text-2xl font-bold text-violet-900">{contacts.length}</p>
              </div>
              <div className="p-2 bg-violet-100 rounded-lg">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {growthStats.growthRate >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs font-medium ${growthStats.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Math.abs(growthStats.growthRate)}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">This Month</p>
                <p className="text-2xl font-bold text-cyan-900">+{growthStats.thisMonth}</p>
              </div>
              <div className="p-2 bg-cyan-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <p className="text-xs text-cyan-600 mt-2">
              {growthStats.lastMonth} added last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">High Quality</p>
                <p className="text-2xl font-bold text-emerald-900">{engagementMetrics.highQuality}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-2">
              {contacts.length ? Math.round((engagementMetrics.highQuality / contacts.length) * 100) : 0}% of contacts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Federated</p>
                <p className="text-2xl font-bold text-amber-900">{engagementMetrics.federated}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              {engagementMetrics.federatedRate}% shared to network
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={reportTab} onValueChange={setReportTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-2">
            <Activity className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <Target className="w-4 h-4" />
            Lead Sources
          </TabsTrigger>
          <TabsTrigger value="growth" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Network Growth
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-violet-500" />
                  Domain Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={domainData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {domainData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} contacts`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quality Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Quality Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{activity.name}</p>
                          <p className="text-xs text-slate-500">Contact added</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activity.domain && (
                          <Badge variant="outline" className="text-xs">
                            {activity.domain}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400">
                          {format(parseISO(activity.date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{engagementMetrics.emailRate}%</p>
                    <p className="text-xs text-slate-500">Have Email</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${engagementMetrics.emailRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{engagementMetrics.phoneRate}%</p>
                    <p className="text-xs text-slate-500">Have Phone</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${engagementMetrics.phoneRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{engagementMetrics.companyRate}%</p>
                    <p className="text-xs text-slate-500">Have Company</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${engagementMetrics.companyRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Globe className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{engagementMetrics.federatedRate}%</p>
                    <p className="text-xs text-slate-500">Federated</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${engagementMetrics.federatedRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Completeness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Contact Data Completeness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Email Address', value: engagementMetrics.withEmail, total: contacts.length, color: 'bg-blue-500' },
                  { label: 'Phone Number', value: engagementMetrics.withPhone, total: contacts.length, color: 'bg-green-500' },
                  { label: 'Company', value: engagementMetrics.withCompany, total: contacts.length, color: 'bg-purple-500' },
                  { label: 'Notes Added', value: engagementMetrics.withNotes, total: contacts.length, color: 'bg-cyan-500' }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900">
                        {item.value} / {item.total} ({item.total ? Math.round((item.value / item.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  Lead Sources Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadSourceData.slice(0, 6).map((source, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-slate-700">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{source.value}</span>
                        <Badge variant="outline" className="text-xs">
                          {contacts.length ? Math.round((source.value / contacts.length) * 100) : 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Network Growth Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={networkGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      interval={timeRange === '7d' ? 0 : 'preserveStartEnd'}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Contacts"
                      stroke="#8b5cf6" 
                      fill="#8b5cf680"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="added" 
                      name="Added"
                      stroke="#10b981" 
                      fill="#10b98180"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Growth Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-700">Growth Rate</span>
                </div>
                <p className="text-2xl font-bold text-violet-900">
                  {growthStats.growthRate >= 0 ? '+' : ''}{growthStats.growthRate}%
                </p>
                <p className="text-xs text-violet-600 mt-1">
                  Month over month change
                </p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Avg. Per Week</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">
                  {networkGrowthData.length ? Math.round(filteredContacts.length / Math.max(1, Math.ceil(networkGrowthData.length / 7))) : 0}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  Contacts added weekly
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Best Day</span>
                </div>
                <p className="text-2xl font-bold text-amber-900">
                  {networkGrowthData.reduce((max, day) => day.added > max.added ? day : max, { added: 0, date: 'N/A' }).date}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Most contacts added
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}