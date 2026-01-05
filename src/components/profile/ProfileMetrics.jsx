import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Star, 
  Award,
  Calendar,
  Target,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

export default function ProfileMetrics({ profile }) {
  const userId = profile?.user_id;

  // Fetch various activity data
  const { data: posts = [] } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => base44.entities.Post.filter({ author_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const { data: endorsements = [] } = useQuery({
    queryKey: ['userEndorsements', userId],
    queryFn: () => base44.entities.SkillEndorsement.filter({ endorsed_user_id: userId }),
    enabled: !!userId
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['userMeetings', userId],
    queryFn: () => base44.entities.Meeting.filter({ host_id: userId }),
    enabled: !!userId
  });

  const { data: guestMeetings = [] } = useQuery({
    queryKey: ['userGuestMeetings', userId],
    queryFn: () => base44.entities.Meeting.filter({ guest_id: userId }),
    enabled: !!userId
  });

  const { data: circles = [] } = useQuery({
    queryKey: ['allCircles'],
    queryFn: () => base44.entities.Circle.list('-created_date', 200),
    enabled: !!userId
  });

  const { data: groupPosts = [] } = useQuery({
    queryKey: ['userGroupPosts', userId],
    queryFn: () => base44.entities.GroupPost.filter({ author_id: userId }),
    enabled: !!userId
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['receivedTestimonials', userId],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId }),
    enabled: !!userId
  });

  const { data: rpEvents = [] } = useQuery({
    queryKey: ['rpEventsMetrics', userId],
    queryFn: () => base44.entities.ReputationEvent.filter({ user_id: userId }, '-created_date', 50),
    enabled: !!userId
  });

  // Calculate metrics
  const activeGroups = circles.filter(c => c.member_ids?.includes(userId));
  const allMeetings = [...meetings, ...guestMeetings];
  const completedMeetings = allMeetings.filter(m => m.status === 'completed');
  const totalContributions = posts.length + groupPosts.length;
  const acceptedEndorsements = endorsements.length;
  const avgTestimonialRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : 0;

  // Generate trend data for the last 7 days
  const generateTrendData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayPosts = posts.filter(p => p.created_date?.startsWith(dateStr)).length;
      const dayGroupPosts = groupPosts.filter(p => p.created_date?.startsWith(dateStr)).length;
      data.push({
        date: format(date, 'EEE'),
        contributions: dayPosts + dayGroupPosts,
        engagement: Math.floor(Math.random() * 20) + (dayPosts * 5) // Simulated engagement
      });
    }
    return data;
  };

  const trendData = generateTrendData();

  // RP history for chart
  const rpChartData = rpEvents.slice(0, 10).reverse().map((ev, i) => ({
    idx: i,
    rp: ev.rp_after || 0
  }));

  // Score changes (simulated week-over-week)
  const influenceChange = 12;
  const expertiseChange = -3;
  const trustChange = 8;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={MessageSquare}
          label="Total Contributions"
          value={totalContributions}
          subtext={`${posts.length} posts, ${groupPosts.length} group posts`}
          color="violet"
        />
        <MetricCard
          icon={Award}
          label="Endorsements"
          value={acceptedEndorsements}
          subtext="Skills endorsed by others"
          color="amber"
        />
        <MetricCard
          icon={Users}
          label="Active Groups"
          value={activeGroups.length}
          subtext={`${circles.filter(c => c.owner_id === userId).length} owned`}
          color="blue"
        />
        <MetricCard
          icon={Calendar}
          label="Meetings"
          value={completedMeetings.length}
          subtext={`${allMeetings.length} total scheduled`}
          color="emerald"
        />
      </div>

      {/* Activity Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            Activity Trend (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorContrib)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            {trendData.map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scores Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard
          label="Influence Score"
          value={profile?.influence_score || 0}
          max={100}
          change={influenceChange}
          color="violet"
        />
        <ScoreCard
          label="Expertise Score"
          value={profile?.expertise_score || 0}
          max={100}
          change={expertiseChange}
          color="blue"
        />
        <ScoreCard
          label="Trust Score"
          value={profile?.trust_score || 0}
          max={100}
          change={trustChange}
          color="emerald"
        />
      </div>

      {/* RP Progress */}
      {rpChartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Reputation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rpChartData}>
                    <Line 
                      type="monotone" 
                      dataKey="rp" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value} RP`, 'Reputation']}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{profile?.rp_points || 0}</p>
                <p className="text-xs text-slate-500">Current RP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            Engagement Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BreakdownRow 
            label="Community Posts" 
            value={posts.length} 
            max={50}
            color="violet"
          />
          <BreakdownRow 
            label="Group Discussions" 
            value={groupPosts.length} 
            max={30}
            color="blue"
          />
          <BreakdownRow 
            label="Testimonials Received" 
            value={testimonials.length} 
            max={20}
            color="amber"
          />
          <BreakdownRow 
            label="Meetings Completed" 
            value={completedMeetings.length} 
            max={25}
            color="emerald"
          />
          <BreakdownRow 
            label="Groups Joined" 
            value={activeGroups.length} 
            max={15}
            color="rose"
          />
        </CardContent>
      </Card>

      {/* Rating Summary */}
      {testimonials.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Rating Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{avgTestimonialRating}</p>
                <div className="flex justify-center mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i <= Math.round(avgTestimonialRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">{testimonials.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(rating => {
                  const count = testimonials.filter(t => Math.round(t.rating) === rating).length;
                  const pct = testimonials.length > 0 ? (count / testimonials.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{rating}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    violet: 'bg-violet-100 text-violet-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    rose: 'bg-rose-100 text-rose-600'
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs font-medium text-slate-600">{label}</p>
            {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ label, value, max, change, color }) {
  const colors = {
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500'
  };
  const pct = Math.min(100, (value / max) * 100);
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <div className={`flex items-center gap-0.5 text-xs ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mb-2">{Math.round(value)}</p>
        <Progress value={pct} className="h-2" />
      </CardContent>
    </Card>
  );
}

function BreakdownRow({ label, value, max, color }) {
  const colors = {
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-medium text-slate-900">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colors[color]}`} 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}