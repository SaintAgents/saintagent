import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Target, Users, MessageSquare, Calendar, Star, 
  TrendingUp, Activity, Zap, Award, Clock, BarChart3, Flame
} from 'lucide-react';
import { format, subDays, isAfter, parseISO, startOfWeek, differenceInDays } from 'date-fns';

function StatCard({ icon: Icon, label, value, subtext, color = 'violet', trend }) {
  const colorClasses = {
    violet: 'bg-violet-100 text-violet-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    pink: 'bg-pink-100 text-pink-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <Badge variant="outline" className={trend >= 0 ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300'}>
            {trend >= 0 ? '+' : ''}{trend}%
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

function ActivityHeatmap({ data }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0.1, 0.3, 0.5, 0.7, 1].map((opacity, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(139, 92, 246, ${opacity})` }} />
          ))}
        </div>
        <span>More</span>
      </div>
      <div className="flex gap-1">
        {data.map((day, i) => (
          <div key={i} className="flex flex-col gap-1 items-center">
            <div 
              className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: day.count === 0 ? '#f1f5f9' : `rgba(139, 92, 246, ${Math.max(0.2, day.count / maxCount)})`,
                color: day.count / maxCount > 0.5 ? 'white' : '#64748b'
              }}
              title={`${day.label}: ${day.count} activities`}
            >
              {day.count}
            </div>
            <span className="text-[10px] text-slate-400">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityList({ activities }) {
  if (!activities?.length) {
    return <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {activities.slice(0, 5).map((activity, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 truncate">{activity.title || activity.type}</p>
            <p className="text-xs text-slate-400">
              {activity.created_date ? format(new Date(activity.created_date), 'MMM d, h:mm a') : 'Recently'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserActivityDashboard({ userId, userEmail }) {
  // Fetch user's posts
  const { data: posts = [] } = useQuery({
    queryKey: ['userPosts', userEmail],
    queryFn: () => base44.entities.Post.filter({ created_by: userEmail }, '-created_date', 100),
    enabled: !!userEmail
  });

  // Fetch missions user joined
  const { data: missions = [] } = useQuery({
    queryKey: ['userMissions', userEmail],
    queryFn: () => base44.entities.Mission.list('-created_date', 200),
    enabled: !!userEmail
  });

  // Fetch circles
  const { data: circles = [] } = useQuery({
    queryKey: ['userCircles'],
    queryFn: () => base44.entities.Circle.list('-created_date', 100),
    enabled: !!userEmail
  });

  // Fetch meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ['userMeetings', userEmail],
    queryFn: () => base44.entities.Meeting.filter({ created_by: userEmail }, '-scheduled_time', 50),
    enabled: !!userEmail
  });

  // Fetch testimonials given
  const { data: testimonials = [] } = useQuery({
    queryKey: ['userTestimonials', userEmail],
    queryFn: () => base44.entities.Testimonial.filter({ author_id: userEmail }, '-created_date', 50),
    enabled: !!userEmail
  });

  // Fetch follows
  const { data: follows = [] } = useQuery({
    queryKey: ['userFollows', userEmail],
    queryFn: () => base44.entities.Follow.filter({ follower_id: userEmail }, '-created_date', 100),
    enabled: !!userEmail
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    // Posts metrics
    const totalPosts = posts.length;
    const postsThisWeek = posts.filter(p => p.created_date && isAfter(new Date(p.created_date), weekAgo)).length;
    const postsThisMonth = posts.filter(p => p.created_date && isAfter(new Date(p.created_date), monthAgo)).length;

    // Missions joined (check participant_user_ids)
    const joinedMissions = missions.filter(m => 
      m.participant_user_ids?.includes(userEmail) || m.created_by === userEmail
    );
    const missionsThisMonth = joinedMissions.filter(m => 
      m.created_date && isAfter(new Date(m.created_date), monthAgo)
    ).length;

    // Circle interactions
    const circleInteractions = circles.filter(c => 
      c.member_ids?.includes(userEmail) || c.created_by === userEmail
    );

    // Meetings scheduled
    const totalMeetings = meetings.length;
    const meetingsThisWeek = meetings.filter(m => 
      m.scheduled_time && isAfter(new Date(m.scheduled_time), weekAgo)
    ).length;

    // Testimonials given
    const totalTestimonials = testimonials.length;

    // Following count
    const followingCount = follows.length;

    // Weekly activity heatmap data
    const weekStart = startOfWeek(now);
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));
      
      const count = [
        ...posts.filter(p => {
          if (!p.created_date) return false;
          const d = new Date(p.created_date);
          return d >= dayStart && d <= dayEnd;
        }),
        ...testimonials.filter(t => {
          if (!t.created_date) return false;
          const d = new Date(t.created_date);
          return d >= dayStart && d <= dayEnd;
        })
      ].length;
      
      return { label: format(day, 'EEE'), count };
    });

    // Recent activities combined
    const recentActivities = [
      ...posts.map(p => ({ ...p, type: 'Post', title: p.content?.substring(0, 50) || 'New post' })),
      ...testimonials.map(t => ({ ...t, type: 'Testimonial', title: `Testimonial for ${t.target_name || 'someone'}` })),
    ].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)).slice(0, 10);

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.round(
      (postsThisMonth * 5) + 
      (joinedMissions.length * 10) + 
      (circleInteractions.length * 8) + 
      (meetingsThisWeek * 15) + 
      (totalTestimonials * 3) +
      (followingCount * 0.5)
    ));

    // Streak calculation (consecutive days with activity)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(now, i);
      const hasActivity = posts.some(p => {
        if (!p.created_date) return false;
        const pDate = new Date(p.created_date);
        return differenceInDays(day, pDate) === 0;
      });
      if (hasActivity) streak++;
      else if (i > 0) break;
    }

    return {
      totalPosts,
      postsThisWeek,
      postsThisMonth,
      joinedMissions: joinedMissions.length,
      missionsThisMonth,
      circleInteractions: circleInteractions.length,
      totalMeetings,
      meetingsThisWeek,
      totalTestimonials,
      followingCount,
      weeklyActivity,
      recentActivities,
      engagementScore,
      streak
    };
  }, [posts, missions, circles, meetings, testimonials, follows, userEmail]);

  return (
    <div className="bg-white border border-slate-200 mb-8">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Your Activity Dashboard</h2>
              <p className="text-sm text-slate-500">Track your engagement and activity patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {metrics.streak > 0 && (
              <Badge className="bg-orange-100 text-orange-700 gap-1">
                <Flame className="w-3 h-3" />
                {metrics.streak} day streak
              </Badge>
            )}
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-600">{metrics.engagementScore}</p>
              <p className="text-xs text-slate-500">Engagement Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard icon={FileText} label="Total Posts" value={metrics.totalPosts} subtext={`${metrics.postsThisWeek} this week`} color="pink" />
          <StatCard icon={Target} label="Missions" value={metrics.joinedMissions} subtext={`${metrics.missionsThisMonth} this month`} color="amber" />
          <StatCard icon={Users} label="Circles" value={metrics.circleInteractions} color="blue" />
          <StatCard icon={Calendar} label="Meetings" value={metrics.totalMeetings} subtext={`${metrics.meetingsThisWeek} upcoming`} color="cyan" />
          <StatCard icon={Star} label="Testimonials" value={metrics.totalTestimonials} subtext="Given" color="emerald" />
          <StatCard icon={MessageSquare} label="Following" value={metrics.followingCount} color="violet" />
        </div>

        {/* Activity Pattern & Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly Heatmap */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-700">Weekly Activity Pattern</h3>
            </div>
            <ActivityHeatmap data={metrics.weeklyActivity} />
          </div>

          {/* Recent Activity */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="font-medium text-slate-700">Recent Activity</h3>
            </div>
            <RecentActivityList activities={metrics.recentActivities} />
          </div>
        </div>

        {/* Engagement Progress */}
        <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-slate-700">Engagement Level</span>
            </div>
            <span className="text-sm text-violet-600 font-medium">
              {metrics.engagementScore < 25 ? 'Getting Started' : 
               metrics.engagementScore < 50 ? 'Active Member' :
               metrics.engagementScore < 75 ? 'Power User' : 'Community Champion'}
            </span>
          </div>
          <Progress value={metrics.engagementScore} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">
            Keep posting, joining missions, and connecting with others to increase your engagement score!
          </p>
        </div>
      </div>
    </div>
  );
}