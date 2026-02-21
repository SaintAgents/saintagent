import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Users, 
  Target, ShoppingBag, Zap, Calendar, Clock, Globe, 
  Sparkles, Award, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { format, subDays, startOfWeek, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function StatCard({ title, value, change, icon: Icon, color = 'violet', trend }) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{change}%</span>
                <span className="text-slate-400 text-xs">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentPerformanceCard({ item, type }) {
  const icon = type === 'post' ? MessageSquare : type === 'mission' ? Target : ShoppingBag;
  const Icon = icon;
  
  return (
    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      {item.image_url ? (
        <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-violet-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{item.title || item.content?.slice(0, 50) || 'Untitled'}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {item.views || item.view_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {item.likes_count || item.interested_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {item.comments_count || 0}
          </span>
        </div>
      </div>
      <Badge variant="secondary" className="shrink-0 capitalize">{type}</Badge>
    </div>
  );
}

export default function CreatorAnalyticsDashboard({ profile }) {
  const [timeRange, setTimeRange] = useState('30');
  const userId = profile?.user_id;

  // Fetch user's content
  const { data: posts = [] } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => base44.entities.Post.filter({ author_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['userMissions', userId],
    queryFn: () => base44.entities.Mission.filter({ creator_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => base44.entities.Listing.filter({ owner_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['userVideos', userId],
    queryFn: () => base44.entities.Video.filter({ uploader_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => base44.entities.Follow.filter({ following_id: userId }, '-created_date', 500),
    enabled: !!userId
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1000),
    enabled: !!userId
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const rangeStart = subDays(now, parseInt(timeRange));
    
    // Filter content by time range
    const filterByDate = (items) => items.filter(item => {
      const date = parseISO(item.created_date);
      return isWithinInterval(date, { start: rangeStart, end: now });
    });

    const recentPosts = filterByDate(posts);
    const recentMissions = filterByDate(missions);
    const recentListings = filterByDate(listings);
    const recentFollowers = filterByDate(followers);

    // Total views
    const totalViews = posts.reduce((sum, p) => sum + (p.views || p.view_count || 0), 0)
      + videos.reduce((sum, v) => sum + (v.views || 0), 0)
      + listings.reduce((sum, l) => sum + (l.view_count || 0), 0);

    // Total engagement (likes + comments)
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)
      + videos.reduce((sum, v) => sum + (v.likes || 0), 0)
      + missions.reduce((sum, m) => sum + (m.interested_count || 0), 0);
    
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);

    // Engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) : 0;

    // Content count
    const totalContent = posts.length + missions.length + listings.length + videos.length;
    const recentContent = recentPosts.length + recentMissions.length + recentListings.length;

    return {
      totalViews,
      totalLikes,
      totalComments,
      engagementRate,
      totalContent,
      recentContent,
      recentFollowers: recentFollowers.length,
      totalFollowers: followers.length,
      postsCount: posts.length,
      missionsCount: missions.length,
      listingsCount: listings.length,
      videosCount: videos.length
    };
  }, [posts, missions, listings, videos, followers, timeRange]);

  // Audience demographics from followers
  const audienceData = useMemo(() => {
    const followerIds = followers.map(f => f.follower_id);
    const followerProfiles = allProfiles.filter(p => followerIds.includes(p.user_id));

    // Region distribution
    const regions = {};
    followerProfiles.forEach(p => {
      const region = p.region || 'Unknown';
      regions[region] = (regions[region] || 0) + 1;
    });
    const regionData = Object.entries(regions)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Engagement level distribution (based on activity)
    const engagementLevels = {
      'Highly Active': 0,
      'Active': 0,
      'Casual': 0,
      'New': 0
    };
    
    followerProfiles.forEach(p => {
      const daysSinceJoin = Math.floor((Date.now() - new Date(p.created_date).getTime()) / (1000 * 60 * 60 * 24));
      const meetingsCompleted = p.meetings_completed || 0;
      
      if (daysSinceJoin < 30) {
        engagementLevels['New']++;
      } else if (meetingsCompleted > 10) {
        engagementLevels['Highly Active']++;
      } else if (meetingsCompleted > 3) {
        engagementLevels['Active']++;
      } else {
        engagementLevels['Casual']++;
      }
    });

    const engagementData = Object.entries(engagementLevels)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);

    return { regionData, engagementData, totalFollowerProfiles: followerProfiles.length };
  }, [followers, allProfiles]);

  // Activity over time chart data
  const activityChartData = useMemo(() => {
    const days = parseInt(timeRange);
    const now = new Date();
    const interval = eachDayOfInterval({ start: subDays(now, days), end: now });
    
    return interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayPosts = posts.filter(p => p.created_date?.startsWith(dateStr)).length;
      const dayMissions = missions.filter(m => m.created_date?.startsWith(dateStr)).length;
      const dayListings = listings.filter(l => l.created_date?.startsWith(dateStr)).length;
      const dayFollowers = followers.filter(f => f.created_date?.startsWith(dateStr)).length;
      
      return {
        date: format(date, 'MMM d'),
        posts: dayPosts,
        missions: dayMissions,
        listings: dayListings,
        followers: dayFollowers,
        total: dayPosts + dayMissions + dayListings
      };
    });
  }, [posts, missions, listings, followers, timeRange]);

  // Top performing content
  const topContent = useMemo(() => {
    const allContent = [
      ...posts.map(p => ({ ...p, type: 'post', score: (p.likes_count || 0) + (p.comments_count || 0) * 2 })),
      ...missions.map(m => ({ ...m, type: 'mission', score: (m.participant_count || 0) * 3 + (m.interested_count || 0) })),
      ...listings.map(l => ({ ...l, type: 'listing', score: (l.view_count || 0) + (l.inquiry_count || 0) * 5 })),
      ...videos.map(v => ({ ...v, type: 'video', score: (v.views || 0) + (v.likes || 0) * 2 }))
    ];
    
    return allContent.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [posts, missions, listings, videos]);

  // Content type distribution
  const contentDistribution = [
    { name: 'Posts', value: posts.length, color: '#8b5cf6' },
    { name: 'Missions', value: missions.length, color: '#06b6d4' },
    { name: 'Listings', value: listings.length, color: '#10b981' },
    { name: 'Videos', value: videos.length, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-600" />
            Creator Analytics
          </h2>
          <p className="text-slate-500 mt-1">Insights into your content performance and audience</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Views" 
          value={metrics.totalViews.toLocaleString()} 
          icon={Eye}
          color="blue"
        />
        <StatCard 
          title="Engagement Rate" 
          value={`${metrics.engagementRate}%`} 
          icon={Heart}
          color="rose"
        />
        <StatCard 
          title="Total Followers" 
          value={metrics.totalFollowers.toLocaleString()}
          change={metrics.recentFollowers > 0 ? Math.round((metrics.recentFollowers / Math.max(metrics.totalFollowers - metrics.recentFollowers, 1)) * 100) : 0}
          icon={Users}
          color="violet"
        />
        <StatCard 
          title="Content Created" 
          value={metrics.totalContent}
          icon={Sparkles}
          color="amber"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="audience" className="gap-2">
            <Users className="w-4 h-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <PieIcon className="w-4 h-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Activity Over Time</CardTitle>
                <CardDescription>Content creation and follower growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="posts" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Posts" />
                      <Area type="monotone" dataKey="missions" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Missions" />
                      <Area type="monotone" dataKey="listings" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Listings" />
                      <Line type="monotone" dataKey="followers" stroke="#f59e0b" strokeWidth={2} dot={false} name="New Followers" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Likes</span>
                  <span className="font-medium">{metrics.totalLikes.toLocaleString()}</span>
                </div>
                <Progress value={metrics.totalLikes > 0 ? Math.min((metrics.totalLikes / (metrics.totalLikes + metrics.totalComments)) * 100, 100) : 0} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Comments</span>
                  <span className="font-medium">{metrics.totalComments.toLocaleString()}</span>
                </div>
                <Progress value={metrics.totalComments > 0 ? Math.min((metrics.totalComments / (metrics.totalLikes + metrics.totalComments)) * 100, 100) : 0} className="h-2" />

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Posts</span>
                    <span className="font-medium">{metrics.postsCount}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Missions</span>
                    <span className="font-medium">{metrics.missionsCount}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Listings</span>
                    <span className="font-medium">{metrics.listingsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Videos</span>
                    <span className="font-medium">{metrics.videosCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Performing Content
              </CardTitle>
              <CardDescription>Your best content based on engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {topContent.length > 0 ? (
                <div className="space-y-3">
                  {topContent.map((item, idx) => (
                    <ContentPerformanceCard key={item.id || idx} item={item} type={item.type} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No content yet. Start creating to see analytics!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Region Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Audience by Region
                </CardTitle>
                <CardDescription>Where your followers are located</CardDescription>
              </CardHeader>
              <CardContent>
                {audienceData.regionData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={audienceData.regionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-slate-400">Not enough data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Engagement Levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Audience Engagement Levels
                </CardTitle>
                <CardDescription>How engaged your followers are</CardDescription>
              </CardHeader>
              <CardContent>
                {audienceData.engagementData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={audienceData.engagementData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {audienceData.engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-slate-400">Not enough data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follower Growth */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-500" />
                  Follower Growth
                </CardTitle>
                <CardDescription>New followers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="New Followers" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Distribution</CardTitle>
                <CardDescription>Breakdown by content type</CardDescription>
              </CardHeader>
              <CardContent>
                {contentDistribution.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {contentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-slate-400">No content created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-violet-700">Posts</span>
                    <Badge className="bg-violet-100 text-violet-700">{posts.length}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-violet-600">
                    <span>{posts.reduce((s, p) => s + (p.likes_count || 0), 0)} likes</span>
                    <span>{posts.reduce((s, p) => s + (p.comments_count || 0), 0)} comments</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-cyan-700">Missions</span>
                    <Badge className="bg-cyan-100 text-cyan-700">{missions.length}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-cyan-600">
                    <span>{missions.reduce((s, m) => s + (m.participant_count || 0), 0)} participants</span>
                    <span>{missions.filter(m => m.status === 'completed').length} completed</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">Listings</span>
                    <Badge className="bg-emerald-100 text-emerald-700">{listings.length}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-emerald-600">
                    <span>{listings.reduce((s, l) => s + (l.view_count || 0), 0)} views</span>
                    <span>{listings.filter(l => l.status === 'active').length} active</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-700">Videos</span>
                    <Badge className="bg-amber-100 text-amber-700">{videos.length}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-amber-600">
                    <span>{videos.reduce((s, v) => s + (v.views || 0), 0)} views</span>
                    <span>{videos.reduce((s, v) => s + (v.likes || 0), 0)} likes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}