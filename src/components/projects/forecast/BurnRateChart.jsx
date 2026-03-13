import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function BurnRateChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-slate-400">
        No time data to chart
      </div>
    );
  }

  return (
    <div>
      {title && <h4 className="text-xs font-semibold text-slate-600 mb-2">{title}</h4>}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradEstimated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" unit="h" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(value, name) => [`${value}h`, name === 'cumActual' ? 'Actual (Cum.)' : 'Estimated (Cum.)']}
          />
          <Legend
            wrapperStyle={{ fontSize: 10 }}
            formatter={(v) => v === 'cumActual' ? 'Actual Hours' : 'Estimated Hours'}
          />
          <Area
            type="monotone"
            dataKey="cumEstimated"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradEstimated)"
            strokeDasharray="5 3"
          />
          <Area
            type="monotone"
            dataKey="cumActual"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradActual)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}