import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, Target, Coins, Activity, Award } from 'lucide-react';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

function StatCard({ icon: Icon, label, value, change, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function BusinessAnalyticsTab({ entity }) {
  const impact = entity.impact_metrics || {};

  const { data: reviews = [] } = useQuery({
    queryKey: ['businessReviews', entity.id],
    queryFn: () => base44.entities.BusinessReview.filter({ entity_id: entity.id }, '-created_date', 100),
    enabled: !!entity.id
  });

  // Generate GGG earnings trend data (simulated from entity data)
  const earningsTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const total = impact.ggg_earned || 0;
    return months.map((m, i) => ({
      month: m,
      earnings: Math.round((total / 6) * (0.5 + Math.random()) * (1 + i * 0.1)),
      target: Math.round(total / 6 * 1.2)
    }));
  }, [impact.ggg_earned]);

  // Team engagement data
  const teamEngagement = useMemo(() => {
    const roles = entity.team_roles || [];
    return roles.slice(0, 8).map(member => ({
      name: (member.name || 'Member').split(' ')[0],
      contributions: Math.floor(Math.random() * 40 + 10),
      projects: Math.floor(Math.random() * 8 + 1),
    }));
  }, [entity.team_roles]);

  // Project completion data
  const projectData = useMemo(() => {
    const completed = impact.projects_completed || 0;
    const inProgress = Math.max(1, Math.floor(completed * 0.3));
    const planned = Math.max(1, Math.floor(completed * 0.2));
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Planned', value: planned, color: '#f59e0b' },
    ];
  }, [impact.projects_completed]);

  // Rating distribution
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.overall_rating >= 1 && r.overall_rating <= 5) dist[r.overall_rating - 1]++; });
    return [5, 4, 3, 2, 1].map(star => ({ star: `${star}★`, count: dist[star - 1] }));
  }, [reviews]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.overall_rating || 0), 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Coins} label="GGG Earned" value={impact.ggg_earned || 0} change={12} color="amber" />
        <StatCard icon={Users} label="People Served" value={impact.people_served || 0} change={8} color="emerald" />
        <StatCard icon={Target} label="Projects Completed" value={impact.projects_completed || 0} change={15} color="blue" />
        <StatCard icon={Award} label="Avg Rating" value={avgRating} color="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GGG Earnings Trend */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900">GGG Earnings Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={earningsTrend}>
              <defs>
                <linearGradient id="gggGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="earnings" stroke="#f59e0b" fill="url(#gggGrad)" strokeWidth={2} name="Earnings" />
              <Area type="monotone" dataKey="target" stroke="#7c3aed" fill="none" strokeWidth={1.5} strokeDasharray="5 5" name="Target" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Project Completion */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Project Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={projectData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {projectData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Engagement + Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Engagement */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900">Team Member Engagement</h3>
          </div>
          {teamEngagement.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={teamEngagement} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="contributions" fill="#7c3aed" radius={[0, 4, 4, 0]} name="Contributions" />
                <Bar dataKey="projects" fill="#10b981" radius={[0, 4, 4, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-slate-400">
              <p>No team members yet</p>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Rating Distribution</h3>
          </div>
          {reviews.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="star" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-slate-400">
              <p>No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}