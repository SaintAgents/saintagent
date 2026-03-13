import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, Line } from 'recharts';

export default function OrgCapacityChart({ weeks, orgData }) {
  const chartData = weeks.map((w, i) => ({
    week: w.label,
    demand: Math.round(orgData.weeklyDemand[i]),
    supply: Math.round(orgData.weeklySupply[i]),
    gap: Math.round(orgData.weeklyGap[i]),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(val, name) => [`${val}h`, name === 'demand' ? 'Demand' : name === 'supply' ? 'Supply' : 'Gap']}
          />
          <Bar dataKey="demand" fill="#818cf8" radius={[3, 3, 0, 0]} name="demand" />
          <Line dataKey="supply" stroke="#10b981" strokeWidth={2} strokeDasharray="6 3" dot={false} name="supply" />
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={0.5} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}