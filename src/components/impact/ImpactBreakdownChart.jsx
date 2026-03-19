import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORIES = [
  { key: 'missions', label: 'Missions', color: '#8b5cf6' },
  { key: 'quests', label: 'Quests', color: '#10b981' },
  { key: 'meetings', label: 'Meetings', color: '#3b82f6' },
  { key: 'posts', label: 'Posts', color: '#f59e0b' },
  { key: 'referrals', label: 'Referrals', color: '#ec4899' },
  { key: 'reviews', label: 'Reviews', color: '#06b6d4' },
];

export default function ImpactBreakdownChart({ counts }) {
  const data = CATEGORIES.map(cat => ({
    name: cat.label,
    count: counts[cat.key] || 0,
    color: cat.color,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Contribution Breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value) => [value, 'Count']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}