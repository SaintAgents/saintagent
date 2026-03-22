import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, subDays, startOfDay, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Users, Coins, Activity, Award, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'violet' }) {
  const colorMap = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-yellow-600',
    blue: 'from-blue-500 to-indigo-600',
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[color]} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}% vs last period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { data: gggTx = [], isLoading: loadingGGG } = useQuery({
    queryKey: ['analytics-ggg'],
    queryFn: () => base44.entities.GGGTransaction.list('-created_date', 500),
    staleTime: 300000,
  });

  const { data: rpEvents = [], isLoading: loadingRP } = useQuery({
    queryKey: ['analytics-rp'],
    queryFn: () => base44.entities.ReputationEvent.list('-created_date', 500),
    staleTime: 300000,
  });

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['analytics-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    staleTime: 300000,
  });

  const isLoading = loadingGGG || loadingRP || loadingProfiles;

  // Daily GGG volume over last 30 days
  const dailyGGG = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTxs = gggTx.filter(tx => tx.created_date?.startsWith(dayStr));
      const earned = dayTxs.filter(t => (t.delta || 0) > 0).reduce((s, t) => s + (t.delta || 0), 0);
      const spent = dayTxs.filter(t => (t.delta || 0) < 0).reduce((s, t) => s + Math.abs(t.delta || 0), 0);
      return { date: format(day, 'MMM d'), earned: Math.round(earned * 100) / 100, spent: Math.round(spent * 100) / 100, net: Math.round((earned - spent) * 100) / 100, count: dayTxs.length };
    });
  }, [gggTx]);

  // Weekly RP events over last 12 weeks
  const weeklyRP = useMemo(() => {
    const now = new Date();
    const weeks = eachWeekOfInterval({ start: subDays(now, 83), end: now });
    return weeks.map(weekStart => {
      const wEnd = endOfWeek(weekStart);
      const weekEvents = rpEvents.filter(ev => {
        const d = new Date(ev.created_date);
        return d >= weekStart && d <= wEnd;
      });
      const totalDelta = weekEvents.reduce((s, e) => s + (e.delta || 0), 0);
      return { week: format(weekStart, 'MMM d'), events: weekEvents.length, totalRP: totalDelta };
    });
  }, [rpEvents]);

  // User growth over time
  const userGrowth = useMemo(() => {
    const sorted = [...profiles].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const now = new Date();
    const days = eachDayOfInterval({ start: subDays(now, 29), end: now });
    let cumulative = sorted.filter(p => new Date(p.created_date) < subDays(now, 29)).length;
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const newUsers = sorted.filter(p => p.created_date?.startsWith(dayStr)).length;
      cumulative += newUsers;
      return { date: format(day, 'MMM d'), newUsers, total: cumulative };
    });
  }, [profiles]);

  // GGG distribution by reason
  const gggByReason = useMemo(() => {
    const map = {};
    gggTx.forEach(tx => {
      const reason = tx.reason_code || 'other';
      if (!map[reason]) map[reason] = { earned: 0, spent: 0 };
      if ((tx.delta || 0) > 0) map[reason].earned += tx.delta;
      else map[reason].spent += Math.abs(tx.delta || 0);
    });
    return Object.entries(map)
      .map(([name, vals]) => ({ name: name.replace(/_/g, ' '), earned: Math.round(vals.earned), spent: Math.round(vals.spent) }))
      .sort((a, b) => (b.earned + b.spent) - (a.earned + a.spent))
      .slice(0, 8);
  }, [gggTx]);

  // RP by source type
  const rpBySource = useMemo(() => {
    const map = {};
    rpEvents.forEach(ev => {
      const src = ev.source_type || ev.reason_code || 'other';
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [rpEvents]);

  // Top stats
  const stats = useMemo(() => {
    const totalGGGEarned = gggTx.filter(t => (t.delta || 0) > 0).reduce((s, t) => s + (t.delta || 0), 0);
    const totalRPAwarded = rpEvents.reduce((s, e) => s + Math.max(0, e.delta || 0), 0);
    const uniqueUsers = new Set([...gggTx.map(t => t.user_id), ...rpEvents.map(e => e.user_id)]).size;
    const last7 = subDays(new Date(), 7);
    const last14 = subDays(new Date(), 14);
    const recentGGG = gggTx.filter(t => new Date(t.created_date) >= last7 && (t.delta || 0) > 0).reduce((s, t) => s + t.delta, 0);
    const prevGGG = gggTx.filter(t => { const d = new Date(t.created_date); return d >= last14 && d < last7 && (t.delta || 0) > 0; }).reduce((s, t) => s + t.delta, 0);
    const gggTrend = prevGGG > 0 ? ((recentGGG - prevGGG) / prevGGG) * 100 : 0;
    const recentRP = rpEvents.filter(e => new Date(e.created_date) >= last7).length;
    const prevRP = rpEvents.filter(e => { const d = new Date(e.created_date); return d >= last14 && d < last7; }).length;
    const rpTrend = prevRP > 0 ? ((recentRP - prevRP) / prevRP) * 100 : 0;
    const newUsers7d = profiles.filter(p => new Date(p.created_date) >= last7).length;
    const newUsers14d = profiles.filter(p => { const d = new Date(p.created_date); return d >= last14 && d < last7; }).length;
    const userTrend = newUsers14d > 0 ? ((newUsers7d - newUsers14d) / newUsers14d) * 100 : 0;

    return {
      totalGGGEarned: Math.round(totalGGGEarned),
      totalRPAwarded: Math.round(totalRPAwarded),
      uniqueUsers,
      totalProfiles: profiles.length,
      gggTrend,
      rpTrend,
      userTrend,
      totalTransactions: gggTx.length,
    };
  }, [gggTx, rpEvents, profiles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 p-4 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Platform Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Activity trends and engagement metrics</p>
          </div>
          <div className="p-2 rounded-lg bg-violet-100">
            <Activity className="w-6 h-6 text-violet-600" />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalProfiles} icon={Users} trend={stats.userTrend} color="violet" />
          <StatCard title="GGG Earned" value={stats.totalGGGEarned.toLocaleString()} icon={Coins} trend={stats.gggTrend} color="amber" />
          <StatCard title="RP Awarded" value={stats.totalRPAwarded.toLocaleString()} icon={Award} trend={stats.rpTrend} color="emerald" />
          <StatCard title="Active Users" value={stats.uniqueUsers} subtitle={`${stats.totalTransactions} transactions`} icon={Zap} color="blue" />
        </div>

        {/* Charts */}
        <Tabs defaultValue="ggg" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ggg">GGG Activity</TabsTrigger>
            <TabsTrigger value="rp">Reputation</TabsTrigger>
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="ggg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Daily GGG Volume (30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyGGG}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="earned" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Earned" />
                      <Area type="monotone" dataKey="spent" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Spent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Daily Net GGG</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyGGG}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="net" name="Net GGG" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rp">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Weekly RP Events (12 weeks)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyRP}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="events" name="Events" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Weekly RP Awarded</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyRP}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="totalRP" name="Total RP" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="growth">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Cumulative User Growth (30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} name="Total Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">New Signups per Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="newUsers" name="New Users" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">GGG by Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={gggByReason} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="earned" name="Earned" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">RP Events by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={rpBySource} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }}>
                        {rpBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transaction Activity Heatmap - simplified as daily counts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Daily Transaction Count (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyGGG}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Transactions" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}