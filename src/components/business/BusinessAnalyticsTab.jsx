import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, Coins, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateTrendData(baseValue, months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const monthIdx = (now.getMonth() - months + 1 + i + 12) % 12;
    const variance = 0.7 + Math.random() * 0.6;
    return {
      month: MONTHS[monthIdx],
      value: Math.round(baseValue * variance * (1 + i * 0.08)),
    };
  });
}

function generateProjectData(completed) {
  const total = Math.max(completed + Math.floor(Math.random() * 5) + 2, completed + 1);
  const inProgress = total - completed;
  return [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: Math.max(1, Math.floor(inProgress * 0.6)), color: '#6366f1' },
    { name: 'Planned', value: Math.max(1, Math.ceil(inProgress * 0.4)), color: '#f59e0b' },
  ];
}

function generateEngagementData(teamSize) {
  return Array.from({ length: Math.min(teamSize, 8) }, (_, i) => ({
    name: `Member ${i + 1}`,
    tasks: Math.floor(Math.random() * 20) + 5,
    hours: Math.floor(Math.random() * 40) + 10,
  }));
}

export default function BusinessAnalyticsTab({ entity }) {
  const [period, setPeriod] = useState('6m');
  const impact = entity.impact_metrics || {};
  const gggBase = impact.ggg_earned || 50;
  const teamSize = entity.team_member_ids?.length || 3;
  const projectsCompleted = impact.projects_completed || 5;

  const gggTrend = generateTrendData(gggBase / 6, period === '3m' ? 3 : period === '12m' ? 12 : 6);
  const projectData = generateProjectData(projectsCompleted);
  const engagementData = generateEngagementData(teamSize);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-600" /> Analytics Dashboard
        </h3>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {[{ label: '3M', value: '3m' }, { label: '6M', value: '6m' }, { label: '12M', value: '12m' }].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p.value ? 'bg-white shadow text-violet-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* GGG Earnings Trend */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" /> GGG Earnings Trend
          </h4>
          <span className="text-sm font-bold text-emerald-600">{gggBase} GGG total</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={gggTrend}>
            <defs>
              <linearGradient id="gggGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#gggGrad)" name="GGG Earned" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Completion */}
        <div className="bg-white rounded-2xl border p-6">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-indigo-600" /> Project Status
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {projectData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {projectData.map(d => (
              <div key={d.name} className="text-center">
                <p className="text-lg font-bold" style={{ color: d.color }}>{d.value}</p>
                <p className="text-xs text-slate-500">{d.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Engagement */}
        <div className="bg-white rounded-2xl border p-6">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-600" /> Team Engagement
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={engagementData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tasks" />
              <Bar dataKey="hours" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Summary */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-6">
        <h4 className="font-semibold text-violet-900 flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" /> Growth Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GrowthMetric label="Follower Growth" value="+12%" positive />
          <GrowthMetric label="Engagement Rate" value="78%" positive />
          <GrowthMetric label="Avg Response Time" value="2.4h" />
          <GrowthMetric label="Satisfaction Score" value={`${(impact.community_rating || 4.2).toFixed(1)}/5`} positive />
        </div>
      </div>
    </div>
  );
}

function GrowthMetric({ label, value, positive }) {
  return (
    <div className="bg-white/80 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${positive ? 'text-emerald-600' : 'text-slate-700'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}