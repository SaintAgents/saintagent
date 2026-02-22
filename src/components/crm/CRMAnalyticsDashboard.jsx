import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, UserPlus, Mail, Phone, Calendar,
  Globe, Building, Briefcase, Target, Activity, Download, Filter,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  ArrowUpRight, ArrowDownRight, Sparkles, Clock, Star, Zap, DollarSign,
  MousePointer, Eye, Reply, Send
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO, isWithinInterval } from 'date-fns';
import EmailCampaignHistory from './EmailCampaignHistory';
import AIDealPrediction from './AIDealPrediction';

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

const LEAD_SOURCE_LABELS = {
  referral: 'Referral',
  website: 'Website',
  social_media: 'Social Media',
  event: 'Event',
  cold_outreach: 'Cold Outreach',
  inbound: 'Inbound',
  partner: 'Partner',
  advertisement: 'Advertisement',
  content: 'Content',
  other: 'Other'
};

const LEAD_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  nurturing: 'Nurturing'
};

export default function CRMAnalyticsDashboard({ contacts = [], contributions = [], interactions = [], currentUserId, deals = [] }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [reportTab, setReportTab] = useState('overview');

  // Fetch email campaigns for this user
  const { data: emailCampaigns = [] } = useQuery({
    queryKey: ['emailCampaigns', currentUserId],
    queryFn: () => base44.entities.EmailCampaign.filter({ owner_id: currentUserId }, '-sent_at', 500),
    enabled: !!currentUserId
  });

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

  // Lead Source Analysis with effectiveness metrics
  const leadSourceData = useMemo(() => {
    const sources = {};
    contacts.forEach(c => {
      const source = c.lead_source || 'other';
      if (!sources[source]) {
        sources[source] = { total: 0, won: 0, contacted: 0, qualified: 0, revenue: 0 };
      }
      sources[source].total++;
      if (c.lead_status === 'won') sources[source].won++;
      if (c.lead_status === 'contacted' || c.lead_status === 'qualified' || c.lead_status === 'proposal' || c.lead_status === 'negotiation' || c.lead_status === 'won') {
        sources[source].contacted++;
      }
      if (c.lead_status === 'qualified' || c.lead_status === 'proposal' || c.lead_status === 'negotiation' || c.lead_status === 'won') {
        sources[source].qualified++;
      }
    });

    // Add deal values
    deals.forEach(d => {
      const contact = contacts.find(c => c.email === d.contact_email || c.name === d.contact_name);
      if (contact && contact.lead_source && sources[contact.lead_source]) {
        if (d.stage === 'closed_won') {
          sources[contact.lead_source].revenue += d.amount || 0;
        }
      }
    });

    return Object.entries(sources)
      .map(([name, data]) => ({ 
        name: LEAD_SOURCE_LABELS[name] || name, 
        sourceKey: name,
        value: data.total,
        won: data.won,
        contacted: data.contacted,
        qualified: data.qualified,
        revenue: data.revenue,
        conversionRate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
        contactRate: data.total > 0 ? Math.round((data.contacted / data.total) * 100) : 0,
        qualifyRate: data.contacted > 0 ? Math.round((data.qualified / data.contacted) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [contacts, deals]);

  // Lead Status Conversion Funnel
  const leadStatusFunnel = useMemo(() => {
    const statuses = {
      new: 0,
      contacted: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
      nurturing: 0
    };
    contacts.forEach(c => {
      const status = c.lead_status || 'new';
      if (statuses[status] !== undefined) statuses[status]++;
    });

    const funnelData = [
      { name: 'New', value: statuses.new, fill: '#3b82f6' },
      { name: 'Contacted', value: statuses.contacted, fill: '#06b6d4' },
      { name: 'Qualified', value: statuses.qualified, fill: '#10b981' },
      { name: 'Proposal', value: statuses.proposal, fill: '#f59e0b' },
      { name: 'Negotiation', value: statuses.negotiation, fill: '#f97316' },
      { name: 'Won', value: statuses.won, fill: '#22c55e' }
    ];

    const total = contacts.length || 1;
    return funnelData.map((item, idx) => ({
      ...item,
      percentage: Math.round((item.value / total) * 100),
      conversionFromPrev: idx > 0 && funnelData[idx - 1].value > 0 
        ? Math.round((item.value / funnelData[idx - 1].value) * 100) 
        : 100
    }));
  }, [contacts]);

  // AOV (Average Order Value) by Domain
  const aovByDomain = useMemo(() => {
    const domainStats = {};
    
    contacts.forEach(c => {
      const domain = c.domain || 'other';
      if (!domainStats[domain]) {
        domainStats[domain] = { count: 0, totalRevenue: 0, wonDeals: 0 };
      }
      domainStats[domain].count++;
    });

    deals.forEach(d => {
      if (d.stage === 'closed_won') {
        const contact = contacts.find(c => c.email === d.contact_email || c.name === d.contact_name);
        const domain = contact?.domain || 'other';
        if (domainStats[domain]) {
          domainStats[domain].totalRevenue += d.amount || 0;
          domainStats[domain].wonDeals++;
        }
      }
    });

    return Object.entries(domainStats)
      .map(([domain, stats]) => ({
        domain: domain.charAt(0).toUpperCase() + domain.slice(1),
        contacts: stats.count,
        revenue: stats.totalRevenue,
        deals: stats.wonDeals,
        aov: stats.wonDeals > 0 ? Math.round(stats.totalRevenue / stats.wonDeals) : 0,
        color: DOMAIN_COLORS[domain] || DOMAIN_COLORS.other
      }))
      .filter(d => d.contacts > 0)
      .sort((a, b) => b.aov - a.aov);
  }, [contacts, deals]);

  // Email campaign metrics
  const emailMetrics = useMemo(() => {
    if (!emailCampaigns.length) return { total: 0, opened: 0, clicked: 0, replied: 0, openRate: 0, clickRate: 0, replyRate: 0 };
    
    const total = emailCampaigns.length;
    const opened = emailCampaigns.filter(c => ['opened', 'clicked', 'replied'].includes(c.status)).length;
    const clicked = emailCampaigns.filter(c => ['clicked', 'replied'].includes(c.status)).length;
    const replied = emailCampaigns.filter(c => c.status === 'replied').length;
    
    return {
      total,
      opened,
      clicked,
      replied,
      openRate: Math.round((opened / total) * 100),
      clickRate: Math.round((clicked / total) * 100),
      replyRate: Math.round((replied / total) * 100)
    };
  }, [emailCampaigns]);

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
        <TabsList className="mb-4 flex-wrap">
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
          <TabsTrigger value="conversion" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Conversion
          </TabsTrigger>
          <TabsTrigger value="aov" className="gap-2">
            <DollarSign className="w-4 h-4" />
            AOV by Domain
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="growth" className="gap-2">
            <LineChartIcon className="w-4 h-4" />
            Growth
          </TabsTrigger>
          <TabsTrigger value="ai-prediction" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Predictions
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

        {/* Lead Sources Tab - Enhanced */}
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
                <CardTitle className="text-base">Source Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadSourceData.slice(0, 6).map((source, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="font-medium text-slate-900">{source.name}</span>
                        </div>
                        <span className="text-sm font-bold">{source.value} contacts</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-1 bg-white rounded">
                          <p className="font-semibold text-blue-600">{source.contactRate}%</p>
                          <p className="text-slate-500">Contact Rate</p>
                        </div>
                        <div className="text-center p-1 bg-white rounded">
                          <p className="font-semibold text-emerald-600">{source.qualifyRate}%</p>
                          <p className="text-slate-500">Qualify Rate</p>
                        </div>
                        <div className="text-center p-1 bg-white rounded">
                          <p className="font-semibold text-violet-600">{source.conversionRate}%</p>
                          <p className="text-slate-500">Win Rate</p>
                        </div>
                      </div>
                      {source.revenue > 0 && (
                        <p className="text-xs text-emerald-600 mt-2 font-medium">
                          Revenue: ${source.revenue.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                Conversion Rates by Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadSourceData.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="contactRate" name="Contact Rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="qualifyRate" name="Qualify Rate" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="conversionRate" name="Win Rate" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Funnel Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Lead Status Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leadStatusFunnel.map((stage, idx) => (
                    <div key={stage.name} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{stage.value}</span>
                          <Badge variant="outline" className="text-xs">
                            {stage.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full rounded-lg transition-all flex items-center justify-center"
                          style={{ 
                            width: `${Math.max(stage.percentage, 5)}%`,
                            backgroundColor: stage.fill 
                          }}
                        >
                          {stage.percentage > 15 && (
                            <span className="text-xs font-medium text-white">{stage.value}</span>
                          )}
                        </div>
                      </div>
                      {idx > 0 && (
                        <div className="absolute -top-1 right-20 text-xs text-slate-500">
                          ↓ {stage.conversionFromPrev}% conversion
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stage Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadStatusFunnel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Contacts">
                        {leadStatusFunnel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'New → Contacted', value: leadStatusFunnel[1]?.conversionFromPrev || 0, color: 'blue' },
              { label: 'Contacted → Qualified', value: leadStatusFunnel[2]?.conversionFromPrev || 0, color: 'cyan' },
              { label: 'Qualified → Proposal', value: leadStatusFunnel[3]?.conversionFromPrev || 0, color: 'emerald' },
              { label: 'Overall Win Rate', value: leadStatusFunnel[5]?.percentage || 0, color: 'violet' }
            ].map((metric, i) => (
              <Card key={i} className={`bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 border-${metric.color}-200`}>
                <CardContent className="pt-4">
                  <p className={`text-sm text-${metric.color}-600 font-medium`}>{metric.label}</p>
                  <p className={`text-2xl font-bold text-${metric.color}-900`}>{metric.value}%</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AOV by Domain Tab */}
        <TabsContent value="aov" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Average Order Value by Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aovByDomain}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${v >= 1000 ? `${v/1000}k` : v}`} />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="aov" name="AOV">
                        {aovByDomain.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Domain Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {aovByDomain.map((domain, i) => (
                    <div key={i} className="p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: domain.color }}
                          />
                          <span className="font-medium text-slate-900">{domain.domain}</span>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">
                          AOV: ${domain.aov.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-slate-500">Contacts</p>
                          <p className="font-semibold">{domain.contacts}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Won Deals</p>
                          <p className="font-semibold">{domain.deals}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Revenue</p>
                          <p className="font-semibold text-emerald-600">${domain.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {aovByDomain.length === 0 && (
                    <p className="text-center text-slate-400 py-8">No deal data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-emerald-900">
                  ${aovByDomain.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Total Deals Won</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {aovByDomain.reduce((sum, d) => sum + d.deals, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-medium text-violet-700">Overall AOV</span>
                </div>
                <p className="text-2xl font-bold text-violet-900">
                  ${aovByDomain.reduce((sum, d) => sum + d.deals, 0) > 0 
                    ? Math.round(aovByDomain.reduce((sum, d) => sum + d.revenue, 0) / aovByDomain.reduce((sum, d) => sum + d.deals, 0)).toLocaleString()
                    : 0}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="email" className="space-y-6">
          <EmailCampaignHistory currentUserId={currentUserId} contacts={contacts} />
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="ai-prediction" className="space-y-6">
          <AIDealPrediction 
            deals={deals}
            contacts={contacts}
            currentUserId={currentUserId}
          />
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