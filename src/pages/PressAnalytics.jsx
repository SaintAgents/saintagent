import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Eye, MousePointer, Newspaper, Send, CheckCircle2, XCircle, Clock,
  TrendingUp, FileText, Calendar, Filter, ArrowLeft
} from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const DATE_RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' }
];

export default function PressAnalytics() {
  const [dateRange, setDateRange] = useState('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { data: pressReleases = [], isLoading } = useQuery({
    queryKey: ['pressReleases'],
    queryFn: () => base44.entities.PressRelease.list('-created_date', 200)
  });

  // Filter releases by date range
  const filteredReleases = useMemo(() => {
    if (!pressReleases.length) return [];
    
    let startDate, endDate;
    
    if (dateRange === 'custom' && customStart && customEnd) {
      startDate = startOfDay(parseISO(customStart));
      endDate = endOfDay(parseISO(customEnd));
    } else {
      const days = parseInt(dateRange) || 30;
      startDate = startOfDay(subDays(new Date(), days));
      endDate = endOfDay(new Date());
    }

    return pressReleases.filter(pr => {
      const prDate = parseISO(pr.created_date);
      return isWithinInterval(prDate, { start: startDate, end: endDate });
    });
  }, [pressReleases, dateRange, customStart, customEnd]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredReleases.length;
    const published = filteredReleases.filter(pr => pr.status === 'published').length;
    const scheduled = filteredReleases.filter(pr => pr.status === 'scheduled').length;
    const drafts = filteredReleases.filter(pr => pr.status === 'draft').length;

    // Distribution status counts
    let totalSent = 0;
    let totalFailed = 0;
    let totalPending = 0;
    
    filteredReleases.forEach(pr => {
      pr.distribution_status?.forEach(ds => {
        if (ds.status === 'sent') totalSent++;
        else if (ds.status === 'failed') totalFailed++;
        else totalPending++;
      });
    });

    // Channels used
    const channelCounts = {};
    filteredReleases.forEach(pr => {
      pr.distribution_channels?.forEach(ch => {
        channelCounts[ch] = (channelCounts[ch] || 0) + 1;
      });
    });

    // Category breakdown
    const categoryCounts = {};
    filteredReleases.forEach(pr => {
      const cat = pr.category || 'uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return {
      total,
      published,
      scheduled,
      drafts,
      totalSent,
      totalFailed,
      totalPending,
      channelCounts,
      categoryCounts
    };
  }, [filteredReleases]);

  // Timeline data for chart
  const timelineData = useMemo(() => {
    const days = dateRange === 'custom' ? 30 : parseInt(dateRange) || 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayReleases = filteredReleases.filter(pr => 
        format(parseISO(pr.created_date), 'yyyy-MM-dd') === dateStr
      );
      
      let sent = 0;
      let failed = 0;
      dayReleases.forEach(pr => {
        pr.distribution_status?.forEach(ds => {
          if (ds.status === 'sent') sent++;
          else if (ds.status === 'failed') failed++;
        });
      });

      data.push({
        date: format(date, 'MMM d'),
        releases: dayReleases.length,
        published: dayReleases.filter(pr => pr.status === 'published').length,
        sent,
        failed
      });
    }
    
    return data;
  }, [filteredReleases, dateRange]);

  // Pie chart data for categories
  const categoryPieData = useMemo(() => {
    return Object.entries(metrics.categoryCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value
    }));
  }, [metrics.categoryCounts]);

  // Channel bar data
  const channelBarData = useMemo(() => {
    return Object.entries(metrics.channelCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value
    }));
  }, [metrics.channelCounts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Admin')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Press Release Analytics</h1>
              <p className="text-slate-600 mt-1">Track distribution and performance metrics</p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <Label className="text-sm font-medium">Date Range:</Label>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-slate-500">to</span>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-40"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
                  <p className="text-sm text-slate-500">Total Releases</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalSent}</p>
                  <p className="text-sm text-slate-500">Sent Successfully</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalFailed}</p>
                  <p className="text-sm text-slate-500">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalPending}</p>
                  <p className="text-sm text-slate-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{metrics.published}</p>
              <p className="text-sm text-green-600">Published</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{metrics.scheduled}</p>
              <p className="text-sm text-blue-600">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-slate-700">{metrics.drafts}</p>
              <p className="text-sm text-slate-600">Drafts</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Distribution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="releases" stroke="#8b5cf6" name="Releases" strokeWidth={2} />
                  <Line type="monotone" dataKey="sent" stroke="#10b981" name="Sent" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-violet-600" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Channels Bar Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" />
                Distribution Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {channelBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={channelBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  No channels configured yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Releases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Press Releases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Title</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Category</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Channels</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Distribution</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReleases.slice(0, 10).map(pr => {
                    const sent = pr.distribution_status?.filter(s => s.status === 'sent').length || 0;
                    const failed = pr.distribution_status?.filter(s => s.status === 'failed').length || 0;
                    const total = pr.distribution_channels?.length || 0;
                    
                    return (
                      <tr key={pr.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-2 font-medium text-slate-900 max-w-xs truncate">
                          {pr.title}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={
                            pr.status === 'published' ? 'bg-green-100 text-green-700' :
                            pr.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {pr.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-slate-600 capitalize">
                          {pr.category?.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-2 text-slate-600">
                          {total} channels
                        </td>
                        <td className="py-3 px-2">
                          {total > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">{sent} sent</span>
                              {failed > 0 && <span className="text-red-600">{failed} failed</span>}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-500">
                          {format(parseISO(pr.created_date), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredReleases.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No press releases found in this date range
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}