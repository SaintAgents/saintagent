import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from "lucide-react";
import { format, subDays, startOfDay, parseISO } from "date-fns";

export default function TimeLoggedChart({ timeEntries }) {
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      days.push({
        date,
        label: format(date, 'EEE'),
        fullLabel: format(date, 'MMM d'),
        hours: 0,
      });
    }

    timeEntries.forEach(entry => {
      if (!entry.start_time || !entry.duration_minutes) return;
      const entryDate = startOfDay(parseISO(entry.start_time));
      const dayEntry = days.find(d => d.date.getTime() === entryDate.getTime());
      if (dayEntry) {
        dayEntry.hours += entry.duration_minutes / 60;
      }
    });

    return days.map(d => ({
      ...d,
      hours: Math.round(d.hours * 10) / 10,
    }));
  }, [timeEntries]);

  const totalHours = chartData.reduce((sum, d) => sum + d.hours, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          Time Logged (Last 7 Days)
          <span className="ml-auto text-sm font-normal text-slate-500">{Math.round(totalHours * 10) / 10}h total</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip
              formatter={(value) => [`${value}h`, 'Time Logged']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel || ''}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}