import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Users, MessageSquare, 
  Calendar, Flame, Trophy, Plus, CheckCircle, Clock,
  BarChart3, Activity, Zap, Heart, Edit2, Trash2, Star
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, parseISO, isWithinInterval, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function StatCard({ title, value, change, icon: Icon, color = 'violet', subtitle }) {
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
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalCard({ goal, onUpdate, onDelete, autoProgress }) {
  const currentValue = autoProgress !== undefined ? autoProgress : goal.current;
  const progress = goal.target > 0 ? Math.min((currentValue / goal.target) * 100, 100) : 0;
  const isComplete = progress >= 100;
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isComplete;
  const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isComplete ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-300' : 
      isOverdue ? 'bg-red-50 border-red-200' :
      'bg-slate-50 border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div className="relative">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <Trophy className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
            </div>
          ) : isOverdue ? (
            <Clock className="w-5 h-5 text-red-500" />
          ) : (
            <Target className="w-5 h-5 text-violet-600" />
          )}
          <h4 className="font-medium text-slate-900">{goal.title}</h4>
        </div>
        <div className="flex items-center gap-1">
          {autoProgress !== undefined && (
            <Badge variant="secondary" className="text-[10px]">Auto-tracked</Badge>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(goal.id)}>
            <Trash2 className="w-3 h-3 text-slate-400" />
          </Button>
        </div>
      </div>
      {goal.description && <p className="text-sm text-slate-500 mb-3">{goal.description}</p>}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">{currentValue.toFixed(goal.unit === 'GGG' ? 2 : 0)} / {goal.target} {goal.unit}</span>
          <span className={isComplete ? 'text-emerald-600 font-medium' : 'text-slate-500'}>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className={`h-2 ${isComplete ? '[&>div]:bg-emerald-500' : isOverdue ? '[&>div]:bg-red-500' : ''}`} />
      </div>
      <div className="flex items-center justify-between mt-2">
        {goal.deadline && (
          <p className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <Clock className="w-3 h-3" />
            {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Due today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
          </p>
        )}
        {isComplete && (
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed!
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function PersonalAnalyticsDashboard({ profile }) {
  const [timeRange, setTimeRange] = useState('30');
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target: '', unit: 'tasks', deadline: '' });
  const queryClient = useQueryClient();
  const userId = profile?.user_id;

  // Fetch activity data
  const { data: challenges = [] } = useQuery({
    queryKey: ['userChallenges', userId],
    queryFn: () => base44.entities.Challenge.filter({ user_id: userId }, '-created_date', 200),
    enabled: !!userId
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['userMeetingsAnalytics', userId],
    queryFn: () => base44.entities.Meeting.filter({ guest_id: userId }, '-created_date', 200),
    enabled: !!userId
  });

  const { data: hostMeetings = [] } = useQuery({
    queryKey: ['hostMeetingsAnalytics', userId],
    queryFn: () => base44.entities.Meeting.filter({ host_id: userId }, '-created_date', 200),
    enabled: !!userId
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['userMessagesAnalytics', userId],
    queryFn: () => base44.entities.Message.filter({ from_user_id: userId }, '-created_date', 500),
    enabled: !!userId
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['followersAnalytics', userId],
    queryFn: () => base44.entities.Follow.filter({ following_id: userId }, '-created_date', 500),
    enabled: !!userId
  });

  const { data: following = [] } = useQuery({
    queryKey: ['followingAnalytics', userId],
    queryFn: () => base44.entities.Follow.filter({ follower_id: userId }, '-created_date', 500),
    enabled: !!userId
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['gggTransactionsAnalytics', userId],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: userId }, '-created_date', 500),
    enabled: !!userId
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonialsAnalytics', userId],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  // Personal goals stored on profile
  const personalGoals = profile?.personal_goals || [];

  // Auto-calculate goal progress based on unit type
  const getAutoProgress = (goal) => {
    const now = new Date();
    const goalCreated = goal.created_at ? new Date(goal.created_at) : subDays(now, 30);
    
    const filterSinceGoalCreated = (items) => items.filter(item => {
      const date = parseISO(item.created_date);
      return date >= goalCreated;
    });

    switch (goal.unit) {
      case 'challenges':
        return filterSinceGoalCreated(challenges).filter(c => c.status === 'claimed').length;
      case 'meetings':
        return filterSinceGoalCreated([...meetings, ...hostMeetings]).filter(m => m.status === 'completed').length;
      case 'messages':
        return filterSinceGoalCreated(messages).length;
      case 'followers':
        return filterSinceGoalCreated(followers).length;
      case 'GGG':
        return filterSinceGoalCreated(transactions).filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      case 'days': {
        // Calculate streak since goal creation
        const activityDates = new Set();
        transactions.forEach(txn => {
          if (new Date(txn.created_date) >= goalCreated) {
            activityDates.add(txn.created_date?.slice(0, 10));
          }
        });
        return activityDates.size;
      }
      default:
        return undefined; // Manual tracking
    }
  };

  // Check for newly completed goals and show notification
  const [notifiedGoals, setNotifiedGoals] = useState(new Set());

  // Save goal mutation
  const updateGoalsMutation = useMutation({
    mutationFn: async (goals) => {
      return base44.entities.UserProfile.update(profile.id, { personal_goals: goals });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) return;
    const goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      target: parseInt(newGoal.target),
      current: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline || null,
      created_at: new Date().toISOString()
    };
    const updatedGoals = [...personalGoals, goal];
    updateGoalsMutation.mutate(updatedGoals);
    setNewGoal({ title: '', description: '', target: '', unit: 'tasks', deadline: '' });
    setGoalDialogOpen(false);
  };

  const handleDeleteGoal = (goalId) => {
    const updatedGoals = personalGoals.filter(g => g.id !== goalId);
    updateGoalsMutation.mutate(updatedGoals);
  };

  const handleUpdateGoalProgress = (goalId, newCurrent) => {
    const updatedGoals = personalGoals.map(g => 
      g.id === goalId ? { ...g, current: newCurrent } : g
    );
    updateGoalsMutation.mutate(updatedGoals);
  };

  // Calculate productivity metrics
  const productivityMetrics = useMemo(() => {
    const now = new Date();
    const rangeStart = subDays(now, parseInt(timeRange));
    const prevRangeStart = subDays(rangeStart, parseInt(timeRange));
    
    const filterByDateRange = (items, start, end) => items.filter(item => {
      const date = parseISO(item.created_date);
      return isWithinInterval(date, { start, end });
    });

    // Current period
    const currentChallenges = filterByDateRange(challenges, rangeStart, now);
    const completedChallenges = currentChallenges.filter(c => c.status === 'claimed');
    const currentMeetings = filterByDateRange([...meetings, ...hostMeetings], rangeStart, now);
    const completedMeetings = currentMeetings.filter(m => m.status === 'completed');

    // Previous period for comparison
    const prevChallenges = filterByDateRange(challenges, prevRangeStart, rangeStart);
    const prevCompletedChallenges = prevChallenges.filter(c => c.status === 'claimed');
    const prevMeetings = filterByDateRange([...meetings, ...hostMeetings], prevRangeStart, rangeStart);
    const prevCompletedMeetings = prevMeetings.filter(m => m.status === 'completed');

    // Challenge completion rate
    const currentCompletionRate = currentChallenges.length > 0 
      ? (completedChallenges.length / currentChallenges.length * 100) : 0;
    const prevCompletionRate = prevChallenges.length > 0 
      ? (prevCompletedChallenges.length / prevChallenges.length * 100) : 0;
    const completionRateChange = prevCompletionRate > 0 
      ? Math.round(((currentCompletionRate - prevCompletionRate) / prevCompletionRate) * 100) : 0;

    // Meeting completion rate
    const meetingCompletionRate = currentMeetings.length > 0
      ? (completedMeetings.length / currentMeetings.length * 100) : 0;
    const prevMeetingRate = prevMeetings.length > 0
      ? (prevCompletedMeetings.length / prevMeetings.length * 100) : 0;
    const meetingRateChange = prevMeetingRate > 0
      ? Math.round(((meetingCompletionRate - prevMeetingRate) / prevMeetingRate) * 100) : 0;

    // Calculate streak from transactions
    const activityDates = new Set();
    transactions.forEach(txn => {
      activityDates.add(txn.created_date?.slice(0, 10));
    });
    const sortedDates = [...activityDates].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().slice(0, 10);
      if (sortedDates.includes(expectedDateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      totalChallenges: currentChallenges.length,
      completedChallenges: completedChallenges.length,
      challengeCompletionRate: Math.round(currentCompletionRate),
      completionRateChange,
      totalMeetings: currentMeetings.length,
      completedMeetings: completedMeetings.length,
      meetingCompletionRate: Math.round(meetingCompletionRate),
      meetingRateChange,
      streak,
      gggEarned: transactions.filter(t => t.amount > 0 && isWithinInterval(parseISO(t.created_date), { start: rangeStart, end: now }))
        .reduce((sum, t) => sum + t.amount, 0)
    };
  }, [challenges, meetings, hostMeetings, transactions, timeRange]);

  // Social engagement metrics
  const socialMetrics = useMemo(() => {
    const now = new Date();
    const rangeStart = subDays(now, parseInt(timeRange));
    const prevRangeStart = subDays(rangeStart, parseInt(timeRange));
    
    const filterByDateRange = (items, start, end) => items.filter(item => {
      const date = parseISO(item.created_date);
      return isWithinInterval(date, { start, end });
    });

    const currentMessages = filterByDateRange(messages, rangeStart, now);
    const prevMessages = filterByDateRange(messages, prevRangeStart, rangeStart);
    const messagesChange = prevMessages.length > 0 
      ? Math.round(((currentMessages.length - prevMessages.length) / prevMessages.length) * 100) : 0;

    const currentFollowers = filterByDateRange(followers, rangeStart, now);
    const prevFollowers = filterByDateRange(followers, prevRangeStart, rangeStart);
    const followersChange = prevFollowers.length > 0
      ? Math.round(((currentFollowers.length - prevFollowers.length) / prevFollowers.length) * 100) : 0;

    return {
      totalFollowers: followers.length,
      newFollowers: currentFollowers.length,
      followersChange,
      totalFollowing: following.length,
      messagesSent: currentMessages.length,
      messagesChange,
      totalMessages: messages.length,
      testimonials: testimonials.length,
      avgRating: testimonials.length > 0 
        ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1) : 0
    };
  }, [messages, followers, following, testimonials, timeRange]);

  // Activity over time chart data
  const activityChartData = useMemo(() => {
    const days = parseInt(timeRange);
    const now = new Date();
    const interval = eachDayOfInterval({ start: subDays(now, days), end: now });
    
    return interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayChallenges = challenges.filter(c => c.created_date?.startsWith(dateStr) && c.status === 'claimed').length;
      const dayMeetings = [...meetings, ...hostMeetings].filter(m => m.created_date?.startsWith(dateStr) && m.status === 'completed').length;
      const dayMessages = messages.filter(m => m.created_date?.startsWith(dateStr)).length;
      const dayGGG = transactions.filter(t => t.created_date?.startsWith(dateStr) && t.amount > 0).reduce((s, t) => s + t.amount, 0);
      
      return {
        date: format(date, 'MMM d'),
        challenges: dayChallenges,
        meetings: dayMeetings,
        messages: dayMessages,
        ggg: Math.round(dayGGG * 100) / 100
      };
    });
  }, [challenges, meetings, hostMeetings, messages, transactions, timeRange]);

  // Challenge categories breakdown
  const challengeCategories = useMemo(() => {
    const cats = {};
    challenges.forEach(c => {
      const cat = c.category || 'general';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [challenges]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-600" />
            Personal Analytics
          </h2>
          <p className="text-slate-500 mt-1">Track your productivity, engagement, and goals</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="productivity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="productivity" className="gap-2">
            <Activity className="w-4 h-4" />
            Productivity
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="w-4 h-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        {/* Productivity Tab */}
        <TabsContent value="productivity" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Challenge Completion" 
              value={`${productivityMetrics.challengeCompletionRate}%`}
              change={productivityMetrics.completionRateChange}
              icon={Target}
              color="violet"
              subtitle={`${productivityMetrics.completedChallenges}/${productivityMetrics.totalChallenges} completed`}
            />
            <StatCard 
              title="Meeting Completion" 
              value={`${productivityMetrics.meetingCompletionRate}%`}
              change={productivityMetrics.meetingRateChange}
              icon={Calendar}
              color="blue"
              subtitle={`${productivityMetrics.completedMeetings}/${productivityMetrics.totalMeetings} completed`}
            />
            <StatCard 
              title="Activity Streak" 
              value={`${productivityMetrics.streak} days`}
              icon={Flame}
              color="amber"
              subtitle="Consecutive active days"
            />
            <StatCard 
              title="GGG Earned" 
              value={productivityMetrics.gggEarned.toFixed(2)}
              icon={Zap}
              color="emerald"
              subtitle="This period"
            />
          </div>

          {/* Activity Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Activity Over Time</CardTitle>
                <CardDescription>Your daily productivity metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="challenges" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Challenges" />
                      <Area type="monotone" dataKey="meetings" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} name="Meetings" />
                      <Area type="monotone" dataKey="messages" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Messages" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Challenge Categories</CardTitle>
                <CardDescription>Breakdown by type</CardDescription>
              </CardHeader>
              <CardContent>
                {challengeCategories.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={challengeCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {challengeCategories.map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400">
                    No challenge data yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Followers" 
              value={socialMetrics.totalFollowers}
              icon={Users}
              color="violet"
              subtitle={`+${socialMetrics.newFollowers} new`}
            />
            <StatCard 
              title="Following" 
              value={socialMetrics.totalFollowing}
              icon={Heart}
              color="rose"
            />
            <StatCard 
              title="Messages Sent" 
              value={socialMetrics.messagesSent}
              change={socialMetrics.messagesChange}
              icon={MessageSquare}
              color="blue"
              subtitle="This period"
            />
            <StatCard 
              title="Avg Rating" 
              value={socialMetrics.avgRating}
              icon={Star}
              color="amber"
              subtitle={`${socialMetrics.testimonials} testimonials`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follower Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-500" />
                  Engagement Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} name="Messages" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Social Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-violet-600" />
                    <span className="text-sm font-medium">Network Size</span>
                  </div>
                  <span className="font-bold text-violet-700">{socialMetrics.totalFollowers + socialMetrics.totalFollowing}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Total Messages</span>
                  </div>
                  <span className="font-bold text-blue-700">{socialMetrics.totalMessages}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium">Testimonials</span>
                  </div>
                  <span className="font-bold text-amber-700">{socialMetrics.testimonials}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium">Average Rating</span>
                  </div>
                  <span className="font-bold text-emerald-700">{socialMetrics.avgRating} / 5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          {/* Goals Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Active Goals" 
              value={personalGoals.filter(g => {
                const auto = getAutoProgress(g);
                const current = auto !== undefined ? auto : g.current;
                return current < g.target;
              }).length}
              icon={Target}
              color="violet"
            />
            <StatCard 
              title="Completed" 
              value={personalGoals.filter(g => {
                const auto = getAutoProgress(g);
                const current = auto !== undefined ? auto : g.current;
                return current >= g.target;
              }).length}
              icon={Trophy}
              color="emerald"
            />
            <StatCard 
              title="Completion Rate" 
              value={personalGoals.length > 0 
                ? `${Math.round((personalGoals.filter(g => {
                    const auto = getAutoProgress(g);
                    const current = auto !== undefined ? auto : g.current;
                    return current >= g.target;
                  }).length / personalGoals.length) * 100)}%`
                : '0%'}
              icon={Activity}
              color="blue"
            />
            <StatCard 
              title="Avg Progress" 
              value={personalGoals.length > 0
                ? `${Math.round(personalGoals.reduce((sum, g) => {
                    const auto = getAutoProgress(g);
                    const current = auto !== undefined ? auto : g.current;
                    return sum + Math.min((current / g.target) * 100, 100);
                  }, 0) / personalGoals.length)}%`
                : '0%'}
              icon={BarChart3}
              color="amber"
            />
          </div>

          {/* Goals Progress Chart */}
          {personalGoals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Goals Progress Overview</CardTitle>
                <CardDescription>Visual breakdown of all your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={personalGoals.map(g => {
                        const auto = getAutoProgress(g);
                        const current = auto !== undefined ? auto : g.current;
                        return {
                          name: g.title.length > 20 ? g.title.slice(0, 20) + '...' : g.title,
                          progress: Math.min((current / g.target) * 100, 100),
                          remaining: Math.max(100 - (current / g.target) * 100, 0),
                          current,
                          target: g.target,
                          unit: g.unit
                        };
                      })}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${props.payload.current} / ${props.payload.target} ${props.payload.unit}`,
                          'Progress'
                        ]}
                      />
                      <Bar dataKey="progress" stackId="a" fill="#10b981" name="Progress" />
                      <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" name="Remaining" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Personal Goals</h3>
              <p className="text-sm text-slate-500">Set and track your personal objectives</p>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Goal Title</Label>
                    <Input 
                      placeholder="e.g., Complete 10 challenges"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Input 
                      placeholder="What's this goal about?"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target</Label>
                      <Input 
                        type="number"
                        placeholder="e.g., 10"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select value={newGoal.unit} onValueChange={(v) => setNewGoal({ ...newGoal, unit: v })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tasks">tasks</SelectItem>
                          <SelectItem value="meetings">meetings</SelectItem>
                          <SelectItem value="challenges">challenges</SelectItem>
                          <SelectItem value="messages">messages</SelectItem>
                          <SelectItem value="followers">followers</SelectItem>
                          <SelectItem value="GGG">GGG</SelectItem>
                          <SelectItem value="hours">hours</SelectItem>
                          <SelectItem value="days">days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Deadline (optional)</Label>
                    <Input 
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleAddGoal} className="w-full" disabled={!newGoal.title || !newGoal.target}>
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {personalGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalGoals.map((goal) => {
                const autoProgress = getAutoProgress(goal);
                const currentValue = autoProgress !== undefined ? autoProgress : goal.current;
                const isComplete = currentValue >= goal.target;
                
                // Check for completion notification
                if (isComplete && !notifiedGoals.has(goal.id)) {
                  setTimeout(() => {
                    toast.success(`🎉 Goal Completed: ${goal.title}`, {
                      description: `You've reached your target of ${goal.target} ${goal.unit}!`,
                      duration: 5000
                    });
                    setNotifiedGoals(prev => new Set([...prev, goal.id]));
                  }, 100);
                }
                
                return (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    autoProgress={autoProgress}
                    onUpdate={handleUpdateGoalProgress}
                    onDelete={handleDeleteGoal}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h3>
              <p className="text-slate-500 mb-4">Create personal goals to track your progress</p>
              <Button onClick={() => setGoalDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Goal
              </Button>
            </Card>
          )}

          {/* Quick Goal Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suggested Goals</CardTitle>
              <CardDescription>Quick-add popular goals (auto-tracked where possible)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { title: 'Complete 10 challenges', target: 10, unit: 'challenges', icon: Target, color: 'violet', autoTracked: true },
                  { title: 'Attend 5 meetings', target: 5, unit: 'meetings', icon: Calendar, color: 'blue', autoTracked: true },
                  { title: 'Earn 100 GGG', target: 100, unit: 'GGG', icon: Zap, color: 'emerald', autoTracked: true },
                  { title: '7-day activity streak', target: 7, unit: 'days', icon: Flame, color: 'amber', autoTracked: true },
                  { title: 'Gain 20 followers', target: 20, unit: 'followers', icon: Users, color: 'rose', autoTracked: true },
                  { title: 'Send 50 messages', target: 50, unit: 'messages', icon: MessageSquare, color: 'cyan', autoTracked: true },
                  { title: 'Complete 25 challenges', target: 25, unit: 'challenges', icon: Trophy, color: 'violet', autoTracked: true },
                  { title: 'Earn 500 GGG', target: 500, unit: 'GGG', icon: Star, color: 'amber', autoTracked: true },
                  { title: '30-day streak', target: 30, unit: 'days', icon: Flame, color: 'orange', autoTracked: true }
                ].map((suggestion, idx) => {
                  const Icon = suggestion.icon;
                  const alreadyExists = personalGoals.some(g => g.title === suggestion.title);
                  
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        alreadyExists 
                          ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed' 
                          : `hover:bg-${suggestion.color}-50 hover:border-${suggestion.color}-200 border-slate-200`
                      }`}
                      onClick={() => {
                        if (alreadyExists) return;
                        const goal = {
                          id: Date.now().toString(),
                          title: suggestion.title,
                          description: suggestion.autoTracked ? 'Progress is automatically tracked' : '',
                          target: suggestion.target,
                          current: 0,
                          unit: suggestion.unit,
                          deadline: null,
                          created_at: new Date().toISOString()
                        };
                        updateGoalsMutation.mutate([...personalGoals, goal]);
                        toast.success(`Goal added: ${suggestion.title}`);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded bg-${suggestion.color}-100`}>
                          <Icon className={`w-3.5 h-3.5 text-${suggestion.color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{suggestion.title}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-8">
                        {suggestion.autoTracked && (
                          <Badge variant="secondary" className="text-[10px]">Auto-tracked</Badge>
                        )}
                        {alreadyExists && (
                          <Badge className="bg-slate-200 text-slate-600 text-[10px]">Already added</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Manual Goal Progress Update */}
          {personalGoals.some(g => getAutoProgress(g) === undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Manual Goals</CardTitle>
                <CardDescription>Update progress for goals that aren't auto-tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalGoals
                    .filter(g => getAutoProgress(g) === undefined)
                    .map(goal => (
                      <div key={goal.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{goal.title}</p>
                          <p className="text-xs text-slate-500">{goal.current} / {goal.target} {goal.unit}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            value={goal.current}
                            onChange={(e) => handleUpdateGoalProgress(goal.id, parseInt(e.target.value) || 0)}
                          />
                          <span className="text-xs text-slate-500">{goal.unit}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}