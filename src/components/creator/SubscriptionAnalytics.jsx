import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Users, TrendingUp, TrendingDown, DollarSign, Calendar,
  Crown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, parseISO, isWithinInterval, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function StatCard({ title, value, change, icon: Icon, color = 'violet', subtitle }) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{change}%</span>
              </div>
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionAnalytics({ profile }) {
  const userId = profile?.user_id;

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['allCreatorSubscriptions', userId],
    queryFn: () => base44.entities.Subscription.filter({ creator_id: userId }, '-created_date', 1000),
    enabled: !!userId
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ['creatorTiers', userId],
    queryFn: () => base44.entities.CreatorTier.filter({ creator_id: userId }),
    enabled: !!userId
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    // Current active subscribers
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled');

    // New subscribers in last 30 days
    const newSubscribers = activeSubscriptions.filter(s => 
      s.created_date && isWithinInterval(parseISO(s.created_date), { start: thirtyDaysAgo, end: now })
    );

    // Previous period for comparison
    const prevNewSubscribers = subscriptions.filter(s =>
      s.created_date && isWithinInterval(parseISO(s.created_date), { start: sixtyDaysAgo, end: thirtyDaysAgo })
    );

    const subscriberChange = prevNewSubscribers.length > 0
      ? Math.round(((newSubscribers.length - prevNewSubscribers.length) / prevNewSubscribers.length) * 100)
      : 0;

    // Monthly Recurring Revenue
    const mrr = activeSubscriptions.reduce((sum, s) => {
      if (s.billing_cycle === 'monthly') return sum + (s.price_paid_ggg || 0);
      return sum + ((s.price_paid_ggg || 0) / 12);
    }, 0);

    // Churn rate (cancelled in last 30 days / active at start of period)
    const cancelledRecent = cancelledSubscriptions.filter(s =>
      s.cancelled_date && isWithinInterval(parseISO(s.cancelled_date), { start: thirtyDaysAgo, end: now })
    );
    const churnRate = activeSubscriptions.length > 0
      ? ((cancelledRecent.length / (activeSubscriptions.length + cancelledRecent.length)) * 100).toFixed(1)
      : 0;

    // Lifetime value (average total paid)
    const ltv = subscriptions.length > 0
      ? subscriptions.reduce((sum, s) => sum + (s.total_paid_ggg || 0), 0) / subscriptions.length
      : 0;

    // Average subscription duration
    const avgMonths = subscriptions.length > 0
      ? subscriptions.reduce((sum, s) => sum + (s.months_active || 0), 0) / subscriptions.length
      : 0;

    return {
      totalSubscribers: activeSubscriptions.length,
      newSubscribers: newSubscribers.length,
      subscriberChange,
      mrr,
      churnRate,
      ltv,
      avgMonths,
      cancelledCount: cancelledSubscriptions.length
    };
  }, [subscriptions]);

  // Subscriber growth over time
  const growthChartData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date()
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = startOfMonth(subMonths(monthStart, -1));
      
      const newSubs = subscriptions.filter(s =>
        s.created_date && isWithinInterval(parseISO(s.created_date), { start: monthStart, end: monthEnd })
      ).length;

      const cancelled = subscriptions.filter(s =>
        s.cancelled_date && isWithinInterval(parseISO(s.cancelled_date), { start: monthStart, end: monthEnd })
      ).length;

      return {
        month: format(month, 'MMM'),
        new: newSubs,
        cancelled,
        net: newSubs - cancelled
      };
    });
  }, [subscriptions]);

  // Revenue by tier
  const tierRevenueData = useMemo(() => {
    const tierRevenue = {};
    subscriptions.filter(s => s.status === 'active').forEach(s => {
      const tierName = s.tier_name || 'Unknown';
      if (!tierRevenue[tierName]) {
        tierRevenue[tierName] = { name: tierName, revenue: 0, count: 0 };
      }
      tierRevenue[tierName].revenue += s.billing_cycle === 'monthly' 
        ? (s.price_paid_ggg || 0) 
        : ((s.price_paid_ggg || 0) / 12);
      tierRevenue[tierName].count++;
    });
    return Object.values(tierRevenue);
  }, [subscriptions]);

  // Billing cycle distribution
  const billingDistribution = useMemo(() => {
    const monthly = subscriptions.filter(s => s.status === 'active' && s.billing_cycle === 'monthly').length;
    const annual = subscriptions.filter(s => s.status === 'active' && s.billing_cycle === 'annual').length;
    return [
      { name: 'Monthly', value: monthly },
      { name: 'Annual', value: annual }
    ].filter(d => d.value > 0);
  }, [subscriptions]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Subscriber Analytics</h3>
        <p className="text-sm text-slate-500">Track your subscription performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscribers"
          value={metrics.totalSubscribers}
          change={metrics.subscriberChange}
          icon={Users}
          color="violet"
          subtitle={`+${metrics.newSubscribers} this month`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`${metrics.mrr.toFixed(1)} GGG`}
          icon={DollarSign}
          color="emerald"
          subtitle="Recurring revenue"
        />
        <StatCard
          title="Churn Rate"
          value={`${metrics.churnRate}%`}
          icon={TrendingDown}
          color="rose"
          subtitle="Last 30 days"
        />
        <StatCard
          title="Avg. Lifetime Value"
          value={`${metrics.ltv.toFixed(1)} GGG`}
          icon={Crown}
          color="amber"
          subtitle={`~${metrics.avgMonths.toFixed(1)} months avg`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriber Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriber Growth</CardTitle>
            <CardDescription>New vs cancelled subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new" fill="#10b981" name="New" />
                  <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Tier</CardTitle>
            <CardDescription>Monthly contribution per tier</CardDescription>
          </CardHeader>
          <CardContent>
            {tierRevenueData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierRevenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {tierRevenueData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v.toFixed(1)} GGG/mo`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No subscription data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscriber List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" />
            Active Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.filter(s => s.status === 'active').length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {subscriptions.filter(s => s.status === 'active').slice(0, 10).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {sub.subscriber_avatar ? (
                      <img src={sub.subscriber_avatar} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-violet-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{sub.subscriber_name || 'Subscriber'}</p>
                      <p className="text-xs text-slate-500">{sub.tier_name} • {sub.billing_cycle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-medium">
                      {sub.price_paid_ggg} GGG/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">
                      Since {sub.started_date && format(new Date(sub.started_date), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">No active subscribers yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}