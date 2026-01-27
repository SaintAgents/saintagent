import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Mail, Send, Eye, MousePointer, UserMinus, TrendingUp, TrendingDown,
  Calendar, BarChart3, PieChart as PieChartIcon, Activity, Users,
  CheckCircle, AlertCircle, Loader2, RefreshCw, Clock
} from 'lucide-react';
import { format, subDays, parseISO, startOfWeek, endOfWeek, formatDistanceToNow } from 'date-fns';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function NewsletterAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch newsletter campaigns with polling
  const { data: campaigns = [], isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['newsletterCampaigns'],
    queryFn: () => base44.entities.NewsletterCampaign.list('-sent_at', 100),
    refetchInterval: autoRefresh ? 30000 : false, // Poll every 30 seconds when enabled
    refetchIntervalInBackground: false
  });

  // Update lastUpdated when data changes
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['newsletterCampaigns'] });
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate overview stats
  const stats = React.useMemo(() => {
    const now = new Date();
    const cutoff = subDays(now, parseInt(timeRange));
    const filtered = campaigns.filter(c => c.sent_at && new Date(c.sent_at) >= cutoff);
    
    const totalSent = filtered.reduce((sum, c) => sum + (c.total_sent || 0), 0);
    const totalOpened = filtered.reduce((sum, c) => sum + (c.total_opened || 0), 0);
    const totalClicked = filtered.reduce((sum, c) => sum + (c.total_clicked || 0), 0);
    const totalUnsubscribed = filtered.reduce((sum, c) => sum + (c.total_unsubscribed || 0), 0);
    const totalBounced = filtered.reduce((sum, c) => sum + (c.total_bounced || 0), 0);
    
    return {
      totalCampaigns: filtered.length,
      totalSent,
      totalOpened,
      totalClicked,
      totalUnsubscribed,
      totalBounced,
      openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0,
      clickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0,
      unsubscribeRate: totalSent > 0 ? ((totalUnsubscribed / totalSent) * 100).toFixed(2) : 0,
      bounceRate: totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(2) : 0
    };
  }, [campaigns, timeRange]);

  // Prepare chart data - engagement over time
  const engagementData = React.useMemo(() => {
    const now = new Date();
    const cutoff = subDays(now, parseInt(timeRange));
    
    return campaigns
      .filter(c => c.sent_at && new Date(c.sent_at) >= cutoff)
      .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
      .map(c => ({
        date: format(new Date(c.sent_at), 'MMM d'),
        subject: c.subject?.substring(0, 20) + '...',
        sent: c.total_sent || 0,
        opened: c.total_opened || 0,
        clicked: c.total_clicked || 0,
        openRate: c.total_sent > 0 ? ((c.total_opened / c.total_sent) * 100).toFixed(1) : 0,
        clickRate: c.total_opened > 0 ? ((c.total_clicked / c.total_opened) * 100).toFixed(1) : 0
      }));
  }, [campaigns, timeRange]);

  // Pie chart data for overall distribution
  const distributionData = React.useMemo(() => {
    const opened = stats.totalOpened;
    const notOpened = stats.totalSent - stats.totalOpened;
    const clicked = stats.totalClicked;
    
    return [
      { name: 'Opened (no click)', value: Math.max(0, opened - clicked) },
      { name: 'Clicked', value: clicked },
      { name: 'Not Opened', value: Math.max(0, notOpened) }
    ].filter(d => d.value > 0);
  }, [stats]);

  // Weekly trend data
  const weeklyTrend = React.useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(subDays(new Date(), i * 7));
      
      const weekCampaigns = campaigns.filter(c => {
        if (!c.sent_at) return false;
        const sentDate = new Date(c.sent_at);
        return sentDate >= weekStart && sentDate <= weekEnd;
      });
      
      const sent = weekCampaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
      const opened = weekCampaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0);
      
      weeks.push({
        week: format(weekStart, 'MMM d'),
        campaigns: weekCampaigns.length,
        sent,
        opened,
        openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : 0
      });
    }
    return weeks;
  }, [campaigns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Filter and Auto-Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Newsletter Analytics</h2>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <p className="text-xs text-slate-500">
              Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
            {autoRefresh && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Auto-refresh</span>
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          {/* Manual refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* Time range selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Sent</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-slate-400">{stats.totalCampaigns} campaigns</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Open Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.openRate}%</p>
                <p className="text-xs text-slate-400">{stats.totalOpened.toLocaleString()} opened</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Click Rate</p>
                <p className="text-2xl font-bold text-blue-600">{stats.clickRate}%</p>
                <p className="text-xs text-slate-400">{stats.totalClicked.toLocaleString()} clicks</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Unsubscribe Rate</p>
                <p className="text-2xl font-bold text-rose-600">{stats.unsubscribeRate}%</p>
                <p className="text-xs text-slate-400">{stats.totalUnsubscribed} unsubscribed</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <UserMinus className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList>
          <TabsTrigger value="engagement" className="gap-2">
            <Activity className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Mail className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
        </TabsList>

        {/* Engagement Over Time */}
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Engagement Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementData.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No campaign data available for this period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="sent" name="Sent" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="opened" name="Opened" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="clicked" name="Clicked" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Pie Chart */}
        <TabsContent value="distribution">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Engagement Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {distributionData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      <span className="text-sm">Delivered</span>
                    </div>
                    <span className="font-semibold">{(stats.totalSent - stats.totalBounced).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm">Opened</span>
                    </div>
                    <span className="font-semibold">{stats.totalOpened.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Clicked</span>
                    </div>
                    <span className="font-semibold">{stats.totalClicked.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm">Bounced</span>
                    </div>
                    <span className="font-semibold">{stats.totalBounced.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-sm">Unsubscribed</span>
                    </div>
                    <span className="font-semibold">{stats.totalUnsubscribed.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weekly Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Open Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(value, name) => [name === 'openRate' ? `${value}%` : value, name === 'openRate' ? 'Open Rate' : name]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="openRate" 
                    name="Open Rate" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                {weeklyTrend.map((week, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs text-slate-500">{week.week}</p>
                    <p className="text-lg font-bold text-slate-900">{week.openRate}%</p>
                    <p className="text-xs text-slate-400">{week.campaigns} campaigns</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign List */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Campaign Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No campaigns sent yet</p>
                  <p className="text-sm">Send your first newsletter to see analytics here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 15).map((campaign) => {
                    const openRate = campaign.total_sent > 0 
                      ? ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1) 
                      : 0;
                    const clickRate = campaign.total_opened > 0 
                      ? ((campaign.total_clicked / campaign.total_opened) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <div 
                        key={campaign.id}
                        className="flex items-center justify-between p-4 rounded-xl border hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 truncate">{campaign.subject}</p>
                            <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            {campaign.sent_at ? format(new Date(campaign.sent_at), 'MMM d, yyyy h:mm a') : 'Not sent'}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-slate-500">Sent</p>
                            <p className="font-semibold">{campaign.total_sent || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Open Rate</p>
                            <p className="font-semibold text-emerald-600">{openRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Click Rate</p>
                            <p className="font-semibold text-blue-600">{clickRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Unsubs</p>
                            <p className="font-semibold text-rose-600">{campaign.total_unsubscribed || 0}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}