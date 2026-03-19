import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ContributionTimeline({ gggData, missionData, questData }) {
  // Merge all data by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    last6Months.push({
      month: months[d.getMonth()],
      key,
      ggg: 0,
      missions: 0,
      quests: 0,
    });
  }

  // Aggregate GGG earned per month
  (gggData || []).forEach(tx => {
    if (tx.delta <= 0) return;
    const d = new Date(tx.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = last6Months.find(m => m.key === key);
    if (entry) entry.ggg += tx.delta;
  });

  // Aggregate missions joined per month
  (missionData || []).forEach(m => {
    const d = new Date(m.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = last6Months.find(e => e.key === key);
    if (entry) entry.missions += 1;
  });

  // Aggregate quests completed per month
  (questData || []).forEach(q => {
    const d = new Date(q.updated_date || q.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = last6Months.find(e => e.key === key);
    if (entry) entry.quests += 1;
  });

  // Round GGG values
  last6Months.forEach(m => { m.ggg = Math.round(m.ggg * 100) / 100; });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Contribution Timeline (Last 6 Months)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last6Months} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gggGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="missionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="questGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value, name) => [name === 'ggg' ? value.toFixed(2) : value, name === 'ggg' ? 'GGG Earned' : name === 'missions' ? 'Missions' : 'Quests']}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => v === 'ggg' ? 'GGG Earned' : v === 'missions' ? 'Missions' : 'Quests'} />
            <Area type="monotone" dataKey="ggg" stroke="#f59e0b" fill="url(#gggGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="missions" stroke="#8b5cf6" fill="url(#missionGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="quests" stroke="#10b981" fill="url(#questGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}