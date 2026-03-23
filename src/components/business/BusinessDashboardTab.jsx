import React from 'react';
import { TrendingUp, Users, Eye, Heart, Award, Target, Sparkles, BarChart3 } from 'lucide-react';

export default function BusinessDashboardTab({ entity, isOwner }) {
  const impact = entity.impact_metrics || {};

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Views" value={entity.view_count || 0} color="blue" />
        <StatCard icon={Heart} label="Followers" value={entity.follower_count || 0} color="rose" />
        <StatCard icon={Users} label="People Served" value={impact.people_served || 0} color="emerald" />
        <StatCard icon={Award} label="Community Rating" value={impact.community_rating ? `${impact.community_rating}/5` : 'N/A'} color="amber" />
      </div>

      {/* Mission Progress */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" /> Impact Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
            <p className="text-3xl font-bold text-violet-700">{impact.projects_completed || 0}</p>
            <p className="text-sm text-violet-600">Projects Completed</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
            <p className="text-3xl font-bold text-emerald-700">{impact.ggg_earned || 0}</p>
            <p className="text-sm text-emerald-600">GGG Earned</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-3xl font-bold text-amber-700">{entity.testimonials_count || 0}</p>
            <p className="text-sm text-amber-600">Testimonials</p>
          </div>
        </div>
      </div>

      {/* Activity Feed placeholder */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" /> Recent Activity
        </h3>
        <div className="text-center py-8">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Activity feed coming soon</p>
          <p className="text-xs text-slate-400 mt-1">Track engagement, new followers, and project updates here</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };
  
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}