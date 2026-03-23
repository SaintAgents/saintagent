import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function WAAnalytics({ messages = [], contacts = [] }) {
  // Messages per day (last 14 days)
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayMsgs = messages.filter(m => m.created_date?.startsWith(dateStr));
    return {
      date: format(date, 'MMM d'),
      inbound: dayMsgs.filter(m => m.direction === 'inbound').length,
      outbound: dayMsgs.filter(m => m.direction === 'outbound').length,
      ai: dayMsgs.filter(m => m.ai_generated).length,
    };
  });

  // Sentiment breakdown
  const sentimentData = ['positive', 'neutral', 'negative', 'urgent'].map(s => ({
    name: s, value: messages.filter(m => m.sentiment === s).length
  })).filter(d => d.value > 0);

  // Intent breakdown
  const intents = {};
  messages.forEach(m => {
    if (m.intent) intents[m.intent] = (intents[m.intent] || 0) + 1;
  });
  const intentData = Object.entries(intents).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Response time (mock for now since we don't track timestamps precisely)
  const aiReplies = messages.filter(m => m.ai_generated).length;
  const humanReplies = messages.filter(m => m.direction === 'outbound' && !m.ai_generated).length;
  const totalOutbound = aiReplies + humanReplies;

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-violet-600">{messages.length}</p>
          <p className="text-xs text-slate-500">Total Messages</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{contacts.length}</p>
          <p className="text-xs text-slate-500">Total Contacts</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalOutbound > 0 ? Math.round((aiReplies / totalOutbound) * 100) : 0}%</p>
          <p className="text-xs text-slate-500">AI Reply Rate</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{messages.filter(m => m.status === 'pending_review').length}</p>
          <p className="text-xs text-slate-500">Pending Review</p>
        </div>
      </div>

      {/* Message Volume Chart */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Message Volume (14 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={days}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="inbound" fill="#7c3aed" name="Inbound" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outbound" fill="#10b981" name="Outbound" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ai" fill="#f59e0b" name="AI Replies" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sentiment Pie */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Message Sentiment</h3>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {sentimentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No sentiment data yet</p>
          )}
        </div>

        {/* Intent Breakdown */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Detected Intents</h3>
          {intentData.length > 0 ? (
            <div className="space-y-2">
              {intentData.map(({ name, value }) => (
                <div key={name} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs min-w-[80px] justify-center">{name}</Badge>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${(value / intentData[0].value) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No intent data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}