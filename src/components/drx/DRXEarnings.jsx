import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, TrendingUp, Calendar, Clock, RefreshCcw, Download,
  ArrowUpRight, ArrowDownRight, Wallet, PieChart, FileText
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DRXEarnings({ grants, assets }) {
  const [period, setPeriod] = useState('month');

  // Calculate total earnings
  const totalEarnings = grants.reduce((sum, g) => sum + (g.total_earnings_ggg || g.monetization?.price_ggg || 0), 0);
  
  // Filter grants by period
  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'week': return { start: subDays(now, 7), end: now };
      case 'month': return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year': return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default: return { start: subDays(now, 30), end: now };
    }
  };

  const dateRange = getDateRange();
  
  const periodGrants = grants.filter(g => {
    const grantDate = new Date(g.created_date);
    return isWithinInterval(grantDate, dateRange);
  });

  const periodEarnings = periodGrants.reduce((sum, g) => sum + (g.total_earnings_ggg || g.monetization?.price_ggg || 0), 0);

  // Subscription earnings
  const subscriptionGrants = grants.filter(g => g.monetization?.type === 'subscription' && g.status === 'active');
  const monthlyRecurring = subscriptionGrants.reduce((sum, g) => {
    const price = g.monetization?.price_ggg || 0;
    const interval = g.monetization?.subscription_interval;
    if (interval === 'weekly') return sum + (price * 4);
    if (interval === 'monthly') return sum + price;
    if (interval === 'quarterly') return sum + (price / 3);
    if (interval === 'yearly') return sum + (price / 12);
    return sum + price;
  }, 0);

  // Revenue share earnings
  const revenueShareGrants = grants.filter(g => g.monetization?.type === 'revenue_share');
  const revenueShareTotal = revenueShareGrants.reduce((sum, g) => sum + (g.total_earnings_ggg || 0), 0);

  // Earnings by asset
  const earningsByAsset = assets.map(asset => {
    const assetGrants = grants.filter(g => g.asset_id === asset.id);
    const earnings = assetGrants.reduce((sum, g) => sum + (g.total_earnings_ggg || g.monetization?.price_ggg || 0), 0);
    return { name: asset.title, earnings, grants: assetGrants.length };
  }).filter(a => a.earnings > 0).sort((a, b) => b.earnings - a.earnings);

  // Earnings by type
  const earningsByType = {
    'One-time': grants.filter(g => g.monetization?.type === 'fixed_fee').reduce((s, g) => s + (g.monetization?.price_ggg || 0), 0),
    'Subscription': subscriptionGrants.reduce((s, g) => s + (g.total_earnings_ggg || 0), 0),
    'Per-use': grants.filter(g => g.monetization?.type === 'per_use').reduce((s, g) => s + (g.total_earnings_ggg || 0), 0),
    'Revenue Share': revenueShareTotal,
    'Tiered': grants.filter(g => g.monetization?.type === 'tiered').reduce((s, g) => s + (g.monetization?.price_ggg || 0), 0)
  };

  // Mock chart data (in production, aggregate from payment_history)
  const chartData = [
    { date: 'Week 1', earnings: Math.round(totalEarnings * 0.15) },
    { date: 'Week 2', earnings: Math.round(totalEarnings * 0.25) },
    { date: 'Week 3', earnings: Math.round(totalEarnings * 0.20) },
    { date: 'Week 4', earnings: Math.round(totalEarnings * 0.40) }
  ];

  // Recent transactions
  const recentTransactions = grants
    .filter(g => g.monetization?.price_ggg > 0 || g.total_earnings_ggg > 0)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10)
    .map(g => ({
      id: g.id,
      date: g.created_date,
      amount: g.total_earnings_ggg || g.monetization?.price_ggg || 0,
      type: g.monetization?.type,
      asset: g.asset_title,
      grantee: g.grantee_name || g.grantee_email
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Earnings Dashboard</h2>
          <p className="text-slate-400">Track your DRX revenue and monetization</p>
        </div>
        <div className="flex items-center gap-2">
          {['week', 'month', 'year', 'all'].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'outline'}
              onClick={() => setPeriod(p)}
              className={period === p ? 'bg-emerald-600' : 'border-white/20 text-white/70 hover:text-white'}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Total</Badge>
            </div>
            <div className="text-3xl font-bold text-white">{totalEarnings.toFixed(2)}</div>
            <div className="text-xs text-emerald-300">GGG Earned (All Time)</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{periodEarnings.toFixed(2)}</div>
            <div className="text-xs text-slate-400">This {period}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <RefreshCcw className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-300 text-xs">MRR</Badge>
            </div>
            <div className="text-3xl font-bold text-white">{monthlyRecurring.toFixed(2)}</div>
            <div className="text-xs text-slate-400">Monthly Recurring</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">{subscriptionGrants.length}</div>
            <div className="text-xs text-slate-400">Active Subscriptions</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Earnings Over Time */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Earnings Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Earnings by Type */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              Earnings by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(earningsByType).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'Subscription' ? 'bg-amber-500' :
                      type === 'One-time' ? 'bg-emerald-500' :
                      type === 'Per-use' ? 'bg-indigo-500' :
                      type === 'Tiered' ? 'bg-pink-500' :
                      'bg-cyan-500'
                    }`} />
                    <span className="text-sm text-slate-300">{type}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{amount.toFixed(2)} GGG</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Earning Assets */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Top Earning Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earningsByAsset.length > 0 ? (
            <div className="space-y-3">
              {earningsByAsset.slice(0, 5).map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{asset.name}</p>
                      <p className="text-xs text-slate-400">{asset.grants} grants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">{asset.earnings.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">GGG</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              No earnings yet. Start monetizing your assets!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Recent Transactions
          </CardTitle>
          <Button variant="outline" size="sm" className="border-white/20 text-white/70 gap-1">
            <Download className="w-3 h-3" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.asset}</p>
                      <p className="text-xs text-slate-400">
                        {tx.grantee} • {tx.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">+{tx.amount.toFixed(2)} GGG</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(tx.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}