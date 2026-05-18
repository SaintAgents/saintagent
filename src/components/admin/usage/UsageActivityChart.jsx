import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function UsageActivityChart({ data, timeRange }) {
  if (!data || data.length === 0) return null;

  // For 24h, show single day summary instead of chart
  if (timeRange === '24h') {
    const day = data[0] || {};
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-600" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Posts', value: day.posts || 0, color: 'text-blue-600' },
              { label: 'Messages', value: day.messages || 0, color: 'text-emerald-600' },
              { label: 'Meetings', value: day.meetings || 0, color: 'text-amber-600' },
              { label: 'Journals', value: day.journals || 0, color: 'text-pink-600' },
            ].map(item => (
              <div key={item.label}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-600" />
          Daily Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={1}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={timeRange === '90d' ? 6 : timeRange === '30d' ? 3 : 0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="posts" name="Posts" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="messages" name="Messages" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="meetings" name="Meetings" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="journals" name="Journals" fill="#ec4899" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}