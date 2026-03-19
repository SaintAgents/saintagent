import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SOURCE_COLORS = {
  mission: '#8b5cf6',
  meeting: '#3b82f6',
  booking: '#06b6d4',
  event: '#10b981',
  reward: '#f59e0b',
  referral: '#ec4899',
  testimonial: '#f97316',
  boost: '#a855f7',
  purchase: '#ef4444',
  deal_commission: '#14b8a6',
};

const SOURCE_LABELS = {
  mission: 'Missions',
  meeting: 'Meetings',
  booking: 'Bookings',
  event: 'Events',
  reward: 'Rewards',
  referral: 'Referrals',
  testimonial: 'Testimonials',
  boost: 'Boosts',
  purchase: 'Purchases',
  deal_commission: 'Commissions',
};

export default function GGGEarningsChart({ transactions }) {
  const data = useMemo(() => {
    const bySource = {};
    (transactions || []).forEach(tx => {
      if (tx.delta <= 0) return;
      const src = tx.source_type || 'reward';
      bySource[src] = (bySource[src] || 0) + tx.delta;
    });

    return Object.entries(bySource)
      .map(([key, value]) => ({
        name: SOURCE_LABELS[key] || key,
        value: Math.round(value * 100) / 100,
        color: SOURCE_COLORS[key] || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">GGG Earnings by Source</h3>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No earnings yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">GGG Earnings by Source</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value) => [value.toFixed(2) + ' GGG', 'Earned']}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}