import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, TrendingUp, ArrowUpRight } from 'lucide-react';
import moment from 'moment';

export default function GGGEarningsTimeline({ transactions = [] }) {
  const { chartData, totalEarned, totalSpent, balance } = useMemo(() => {
    const earned = transactions.filter(t => t.delta > 0);
    const spent = transactions.filter(t => t.delta < 0);
    const totalE = earned.reduce((s, t) => s + t.delta, 0);
    const totalS = spent.reduce((s, t) => s + Math.abs(t.delta), 0);

    // Group by day for the chart
    const dayMap = {};
    let runningTotal = 0;
    const sorted = [...transactions].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    sorted.forEach(t => {
      const day = moment(t.created_date).format('MMM D');
      runningTotal += t.delta;
      dayMap[day] = { day, balance: Math.max(0, runningTotal), earned: (dayMap[day]?.earned || 0) + (t.delta > 0 ? t.delta : 0) };
    });

    return {
      chartData: Object.values(dayMap),
      totalEarned: totalE,
      totalSpent: totalS,
      balance: totalE - totalS,
    };
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-medium text-emerald-600">Total Earned</span>
          </div>
          <p className="text-lg font-bold text-emerald-700">{totalEarned.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Coins className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-medium text-red-500">Total Spent</span>
          </div>
          <p className="text-lg font-bold text-red-600">{totalSpent.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] font-medium text-amber-600">Balance</span>
          </div>
          <p className="text-lg font-bold text-amber-700">{balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gggGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                formatter={(val) => [`${val.toFixed(2)} GGG`]}
              />
              <Area type="monotone" dataKey="balance" stroke="#f59e0b" fill="url(#gggGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-sm text-slate-400">
          <Coins className="w-5 h-5 mr-2" />
          No GGG transactions yet
        </div>
      )}
    </div>
  );
}