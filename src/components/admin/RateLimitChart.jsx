import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RateLimitChart({ snapshots, monitoring }) {
  const chartData = useMemo(() => {
    if (!snapshots.length) return [];
    const startTs = snapshots[0].ts;
    return snapshots.map(s => ({
      time: Math.round((s.ts - startTs) / 1000),
      'API Calls/min': s.apiCalls,
      'Concurrent Fetches': s.fetching,
      'Rate Limits': s.rateLimits,
      'Errors': s.errored,
      'Stale Queries': s.stale,
    }));
  }, [snapshots]);

  if (chartData.length < 2) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Collecting data... ({chartData.length} samples)</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Performance Timeline
          {monitoring && (
            <Badge className="bg-red-100 text-red-700 text-xs ml-2">Live</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }} 
                label={{ value: 'Seconds', position: 'insideBottom', offset: -2, fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                labelFormatter={(v) => `${v}s`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area 
                type="monotone" dataKey="API Calls/min" 
                stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2}
              />
              <Area 
                type="monotone" dataKey="Concurrent Fetches" 
                stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2}
              />
              <Area 
                type="monotone" dataKey="Rate Limits" 
                stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2}
              />
              <Area 
                type="monotone" dataKey="Errors" 
                stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}