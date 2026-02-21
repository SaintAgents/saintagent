import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Eye, Heart, MessageSquare, Target, ShoppingBag, 
  Users, Calendar, Award, Zap, DollarSign, MapPin, Clock, 
  FileText, Sparkles, ArrowUp, ArrowDown, Minus, Activity
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

function MetricCard({ label, value, change, icon: Icon, trend }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && <ArrowUp className="w-3 h-3 text-emerald-500" />}
                {trend === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 text-slate-400" />}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-emerald-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-slate-500'
                }`}>
                  {change > 0 ? '+' : ''}{change}% vs last period
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg bg-violet-100">
            <Icon className="w-6 h-6 text-violet-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreatorAnalyticsDashboard({ userId }) {
  const [timeRange, setTimeRange] = useState('30d');
  const [contentType, setContentType] = useState('all');

  // Fetch user's content
  const { data: posts = [] } = useQuery({
    queryKey: ['creatorPosts', userId],
    queryFn: () => base44.entities.Post.filter({ author_id: userId }, '-created_date', 500)
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['creatorMissions', userId],
    queryFn: () => base44.entities.Mission.filter({ creator_id: userId }, '-created_date', 200)
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['creatorListings', userId],
    queryFn: () => base44.entities.Listing.filter({ owner_id: userId }, '-created_date', 200)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['creatorEvents', userId],
    queryFn: () => base44.entities.Event.filter({ creator_id: userId }, '-created_date', 200)
  });

  const { data: broadcasts = [] } = useQuery({
    queryKey: ['creatorBroadcasts', userId],
    queryFn: () => base44.entities.Broadcast.filter({ host_id: userId }, '-scheduled_time', 200)
  });

  // Calculate date range
  const getDaysAgo = () => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 30;
    }
  };

  const startDate = startOfDay(subDays(new Date(), getDaysAgo()));

  // Filter content by date and type
  const filteredContent = useMemo(() => {
    const filterByDate = (items) => items.filter(item => 
      new Date(item.created_date || item.scheduled_time) >= startDate
    );

    switch (contentType) {
      case 'posts': return filterByDate(posts);
      case 'missions': return filterByDate(missions);
      case 'listings': return filterByDate(listings);
      case 'events': return filterByDate(events);
      case 'broadcasts': return filterByDate(broadcasts);
      default: 
        return [
          ...filterByDate(posts),
          ...filterByDate(missions),
          ...filterByDate(listings),
          ...filterByDate(events),
          ...filterByDate(broadcasts)
        ];
    }
  }, [contentType, posts, missions, listings, events, broadcasts, startDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0) +
                       missions.reduce((sum, m) => sum + (m.view_count || 0), 0) +
                       listings.reduce((sum, l) => sum + (l.view_count || 0), 0);

    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0) +
                       broadcasts.reduce((sum, b) => sum + (b.going_count || 0), 0);

    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);

    const totalEngagement = totalLikes + totalComments;

    const missionParticipants = missions.reduce((sum, m) => sum + (m.participant_count || 0), 0);

    const listingInterest = listings.reduce((sum, l) => sum + (l.interest_count || 0), 0);

    const broadcastAttendees = broadcasts.reduce((sum, b) => sum + (b.going_count || 0), 0);

    const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : 0;

    return {
      totalContent: posts.length + missions.length + listings.length + events.length + broadcasts.length,
      totalViews,
      totalLikes,
      totalComments,
      totalEngagement,
      engagementRate,
      missionParticipants,
      listingInterest,
      broadcastAttendees
    };
  }, [posts, missions, listings, events, broadcasts]);

  // Daily activity chart data
  const activityData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: new Date() });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayPosts = posts.filter(p => 
        format(new Date(p.created_date), 'yyyy-MM-dd') === dayStr
      );
      const dayMissions = missions.filter(m => 
        format(new Date(m.created_date), 'yyyy-MM-dd') === dayStr
      );
      
      return {
        date: format(day, 'MMM d'),
        posts: dayPosts.length,
        missions: dayMissions.length,
        engagement: dayPosts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0)
      };
    });
  }, [posts, missions, startDate]);

  // Content type breakdown
  const contentTypeData = [
    { name: 'Posts', value: posts.length, color: COLORS[0] },
    { name: 'Missions', value: missions.length, color: COLORS[1] },
    { name: 'Listings', value: listings.length, color: COLORS[2] },
    { name: 'Events', value: events.length, color: COLORS[3] },
    { name: 'Broadcasts', value: broadcasts.length, color: COLORS[4] },
  ].filter(d => d.value > 0);

  // Top performing content
  const topContent = useMemo(() => {
    const allContent = [
      ...posts.map(p => ({ 
        type: 'post', 
        title: p.content?.substring(0, 50) || 'Untitled',
        engagement: (p.likes_count || 0) + (p.comments_count || 0),
        views: p.view_count || 0,
        date: p.created_date
      })),
      ...missions.map(m => ({ 
        type: 'mission', 
        title: m.title,
        engagement: m.participant_count || 0,
        views: m.view_count || 0,
        date: m.created_date
      })),
      ...listings.map(l => ({ 
        type: 'listing', 
        title: l.title,
        engagement: l.interest_count || 0,
        views: l.view_count || 0,
        date: l.created_date
      }))
    ];

    return allContent
      .filter(c => new Date(c.date) >= startDate)
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);
  }, [posts, missions, listings, startDate]);

  // Audience demographics - regions
  const regionData = useMemo(() => {
    const regions = {};
    
    // Get regions from mission participants (simplified - would need to join with UserProfile)
    missions.forEach(m => {
      const region = m.region || 'Unknown';
      regions[region] = (regions[region] || 0) + (m.participant_count || 0);
    });

    return Object.entries(regions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [missions]);

  // Engagement patterns by day of week
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    
    filteredContent.forEach(item => {
      const date = new Date(item.created_date || item.scheduled_time);
      const day = date.getDay();
      counts[day]++;
    });

    return days.map((day, idx) => ({ day, posts: counts[idx] }));
  }, [filteredContent]);

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-violet-600" />
            Creator Analytics
          </h2>
          <p className="text-slate-500 mt-1">Track your content performance and audience insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="posts">Posts Only</SelectItem>
              <SelectItem value="missions">Missions Only</SelectItem>
              <SelectItem value="listings">Listings Only</SelectItem>
              <SelectItem value="events">Events Only</SelectItem>
              <SelectItem value="broadcasts">Broadcasts Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Views"
          value={metrics.totalViews.toLocaleString()}
          icon={Eye}
          change={12}
          trend="up"
        />
        <MetricCard
          label="Engagement Rate"
          value={`${metrics.engagementRate}%`}
          icon={Heart}
          change={5}
          trend="up"
        />
        <MetricCard
          label="Total Content"
          value={metrics.totalContent}
          icon={FileText}
          change={8}
          trend="up"
        />
        <MetricCard
          label="Total Engagement"
          value={metrics.totalEngagement.toLocaleString()}
          icon={Sparkles}
          change={-3}
          trend="down"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="top-content">Top Content</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Activity Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Over Time</CardTitle>
              <CardDescription>Daily content creation and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend fontSize={12} />
                  <Area 
                    type="monotone" 
                    dataKey="posts" 
                    stackId="1"
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                    name="Posts"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="missions" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.6}
                    name="Missions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    name="Engagement"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Distribution</CardTitle>
                <CardDescription>Breakdown by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Posting Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Posting Patterns</CardTitle>
                <CardDescription>Activity by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance by Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-violet-50 border-violet-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-violet-600" />
                    <p className="font-medium text-violet-900">Posts</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-medium">{posts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avg Likes:</span>
                      <span className="font-medium">
                        {posts.length > 0 ? (posts.reduce((s, p) => s + (p.likes_count || 0), 0) / posts.length).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avg Comments:</span>
                      <span className="font-medium">
                        {posts.length > 0 ? (posts.reduce((s, p) => s + (p.comments_count || 0), 0) / posts.length).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-amber-600" />
                    <p className="font-medium text-amber-900">Missions</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-medium">{missions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Joins:</span>
                      <span className="font-medium">{missionParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avg per Mission:</span>
                      <span className="font-medium">
                        {missions.length > 0 ? (missionParticipants / missions.length).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <p className="font-medium text-emerald-900">Listings</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-medium">{listings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Interest:</span>
                      <span className="font-medium">{listingInterest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Avg Interest:</span>
                      <span className="font-medium">
                        {listings.length > 0 ? (listingInterest / listings.length).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Audience by Region
                </CardTitle>
                <CardDescription>Where your participants are from</CardDescription>
              </CardHeader>
              <CardContent>
                {regionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={regionData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">
                    Not enough data yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Engagement by Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  Best Posting Days
                </CardTitle>
                <CardDescription>When your content gets the most traction</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Audience Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audience Engagement Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-slate-50">
                  <Users className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{metrics.missionParticipants}</p>
                  <p className="text-xs text-slate-500">Mission Participants</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50">
                  <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalLikes}</p>
                  <p className="text-xs text-slate-500">Total Likes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50">
                  <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{metrics.totalComments}</p>
                  <p className="text-xs text-slate-500">Total Comments</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50">
                  <Calendar className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{metrics.broadcastAttendees}</p>
                  <p className="text-xs text-slate-500">Broadcast Attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Content Tab */}
        <TabsContent value="top-content" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                Top Performing Content
              </CardTitle>
              <CardDescription>Your most engaging content ranked by interaction</CardDescription>
            </CardHeader>
            <CardContent>
              {topContent.length > 0 ? (
                <div className="space-y-3">
                  {topContent.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-4 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-2xl font-bold text-slate-300 w-8 text-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(item.date), 'MMM d')}
                          </span>
                        </div>
                        <p className="font-medium text-slate-900 truncate">{item.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-violet-600 font-medium">
                          <Sparkles className="w-4 h-4" />
                          {item.engagement}
                        </div>
                        <p className="text-xs text-slate-500">{item.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">
                  No content in the selected time range
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-violet-200 bg-violet-50/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">
                    {posts.filter(p => new Date(p.created_date) >= startDate).length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Posts Created</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {posts.length > 0 ? (
                      posts.filter(p => new Date(p.created_date) >= startDate).reduce((s, p) => s + (p.likes_count || 0), 0) / posts.filter(p => new Date(p.created_date) >= startDate).length
                    ).toFixed(1) : 0} avg likes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">
                    {missions.filter(m => new Date(m.created_date) >= startDate).length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Missions Created</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {missions.filter(m => new Date(m.created_date) >= startDate).reduce((s, m) => s + (m.participant_count || 0), 0)} total participants
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <ShoppingBag className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-slate-900">
                    {listings.filter(l => new Date(l.created_date) >= startDate).length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Listings Created</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {listings.filter(l => new Date(l.created_date) >= startDate).reduce((s, l) => s + (l.interest_count || 0), 0)} total interest
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}