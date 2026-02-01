import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Activity,
  Coins,
  Users,
  Target,
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  ShoppingBag,
  Heart,
  Award,
  Zap,
  Clock,
  ChevronRight,
  X
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO, subDays } from 'date-fns';

const EVENT_TYPES = {
  ggg_earned: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'GGG Earned' },
  ggg_spent: { icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-100', label: 'GGG Spent' },
  user_joined: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100', label: 'New User' },
  mission_created: { icon: Target, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Mission Created' },
  mission_joined: { icon: Target, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Mission Joined' },
  meeting_scheduled: { icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-100', label: 'Meeting Scheduled' },
  meeting_completed: { icon: Calendar, color: 'text-green-600', bg: 'bg-green-100', label: 'Meeting Completed' },
  listing_created: { icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Listing Created' },
  booking_made: { icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Booking Made' },
  message_sent: { icon: MessageSquare, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Message Sent' },
  testimonial_given: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Testimonial' },
  profile_updated: { icon: Edit, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Profile Updated' },
  boost_activated: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Boost Activated' },
  referral: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Referral' },
  badge_earned: { icon: Award, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Badge Earned' },
  admin_action: { icon: Activity, color: 'text-red-600', bg: 'bg-red-100', label: 'Admin Action' },
};

export default function MasterActivityLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch GGG Transactions
  const { data: gggTransactions = [], isLoading: loadingGGG, refetch: refetchGGG } = useQuery({
    queryKey: ['adminGGGTransactions'],
    queryFn: () => base44.entities.GGGTransaction.list('-created_date', 500),
  });

  // Fetch User Profiles for context
  const { data: profiles = [] } = useQuery({
    queryKey: ['adminProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
  });

  // Fetch Meetings
  const { data: meetings = [], refetch: refetchMeetings } = useQuery({
    queryKey: ['adminMeetings'],
    queryFn: () => base44.entities.Meeting.list('-created_date', 200),
  });

  // Fetch Missions
  const { data: missions = [], refetch: refetchMissions } = useQuery({
    queryKey: ['adminMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 200),
  });

  // Fetch Bookings
  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 200),
  });

  // Fetch Messages (count only)
  const { data: messages = [] } = useQuery({
    queryKey: ['adminMessages'],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
  });

  // Fetch Audit Log
  const { data: auditLogs = [], refetch: refetchAudit } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => base44.entities.UserAuditLog.list('-created_date', 200),
  });

  // Fetch Testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date', 100),
  });

  // Fetch Boosts
  const { data: boosts = [] } = useQuery({
    queryKey: ['adminBoosts'],
    queryFn: () => base44.entities.Boost.list('-created_date', 100),
  });

  // Create profile lookup map
  const profileMap = React.useMemo(() => {
    const map = {};
    profiles.forEach(p => { map[p.user_id] = p; });
    return map;
  }, [profiles]);

  // Calculate date filter
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '24h': return subDays(now, 1);
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      default: return subDays(now, 7);
    }
  };

  // Build unified activity feed
  const activityFeed = React.useMemo(() => {
    const activities = [];
    const dateFilter = getDateFilter();

    // GGG Transactions
    gggTransactions.forEach(tx => {
      const profile = profileMap[tx.user_id];
      activities.push({
        id: `ggg-${tx.id}`,
        type: tx.delta > 0 ? 'ggg_earned' : 'ggg_spent',
        user_id: tx.user_id,
        user_name: profile?.display_name || tx.user_id,
        user_avatar: profile?.avatar_url,
        description: tx.description || tx.reason_code,
        amount: tx.delta,
        balance_after: tx.balance_after,
        created_date: tx.created_date,
        source_type: tx.source_type,
      });
    });

    // Meetings
    meetings.forEach(m => {
      const hostProfile = profileMap[m.host_id];
      const guestProfile = profileMap[m.guest_id];
      activities.push({
        id: `meeting-${m.id}`,
        type: m.status === 'completed' ? 'meeting_completed' : 'meeting_scheduled',
        user_id: m.host_id,
        user_name: m.host_name || hostProfile?.display_name || m.host_id,
        user_avatar: m.host_avatar || hostProfile?.avatar_url,
        description: `${m.title} with ${m.guest_name || guestProfile?.display_name || 'Guest'}`,
        created_date: m.created_date,
        status: m.status,
        meeting_type: m.meeting_type,
      });
    });

    // Missions
    missions.forEach(m => {
      const profile = profileMap[m.creator_id];
      activities.push({
        id: `mission-${m.id}`,
        type: 'mission_created',
        user_id: m.creator_id,
        user_name: m.creator_name || profile?.display_name || m.creator_id,
        user_avatar: profile?.avatar_url,
        description: m.title,
        created_date: m.created_date,
        reward_ggg: m.reward_ggg,
        participant_count: m.participant_count,
      });
    });

    // Bookings
    bookings.forEach(b => {
      const buyerProfile = profileMap[b.buyer_id];
      activities.push({
        id: `booking-${b.id}`,
        type: 'booking_made',
        user_id: b.buyer_id,
        user_name: b.buyer_name || buyerProfile?.display_name || b.buyer_id,
        user_avatar: buyerProfile?.avatar_url,
        description: `Booking with ${b.seller_name} - ${b.status}`,
        created_date: b.created_date,
        amount: b.amount,
        status: b.status,
      });
    });

    // New user registrations (from profiles created)
    profiles.forEach(p => {
      activities.push({
        id: `user-${p.id}`,
        type: 'user_joined',
        user_id: p.user_id,
        user_name: p.display_name || p.user_id,
        user_avatar: p.avatar_url,
        description: `New user joined: @${p.handle || 'unknown'}`,
        created_date: p.created_date,
      });
    });

    // Audit Logs
    auditLogs.forEach(log => {
      const profile = profileMap[log.user_id];
      activities.push({
        id: `audit-${log.id}`,
        type: 'admin_action',
        user_id: log.user_id,
        user_name: log.user_name || profile?.display_name || log.user_id,
        user_avatar: profile?.avatar_url,
        description: log.description || `${log.action} on ${log.entity_type}`,
        created_date: log.created_date,
        action: log.action,
        entity_type: log.entity_type,
      });
    });

    // Testimonials
    testimonials.forEach(t => {
      activities.push({
        id: `testimonial-${t.id}`,
        type: 'testimonial_given',
        user_id: t.from_user_id,
        user_name: t.from_name || t.from_user_id,
        user_avatar: t.from_avatar,
        description: `Gave ${t.rating}★ testimonial`,
        created_date: t.created_date,
        rating: t.rating,
      });
    });

    // Boosts
    boosts.forEach(b => {
      const profile = profileMap[b.user_id];
      activities.push({
        id: `boost-${b.id}`,
        type: 'boost_activated',
        user_id: b.user_id,
        user_name: profile?.display_name || b.user_id,
        user_avatar: profile?.avatar_url,
        description: `${b.boost_type} boost activated - ${b.budget_ggg} GGG`,
        created_date: b.created_date,
        amount: -b.budget_ggg,
        boost_type: b.boost_type,
      });
    });

    // Filter by date
    const filtered = activities.filter(a => {
      if (!a.created_date) return false;
      return new Date(a.created_date) >= dateFilter;
    });

    // Filter by search
    const searched = searchQuery
      ? filtered.filter(a => 
          a.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filtered;

    // Filter by type
    const typed = filterType === 'all' 
      ? searched 
      : searched.filter(a => a.type === filterType);

    // Sort by date descending
    return typed.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [gggTransactions, meetings, missions, bookings, profiles, auditLogs, testimonials, boosts, dateRange, searchQuery, filterType, profileMap]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const now = new Date();
    const today = subDays(now, 1);
    const week = subDays(now, 7);

    const todayGGGEarned = gggTransactions
      .filter(t => t.delta > 0 && new Date(t.created_date) >= today)
      .reduce((sum, t) => sum + t.delta, 0);

    const todayGGGSpent = gggTransactions
      .filter(t => t.delta < 0 && new Date(t.created_date) >= today)
      .reduce((sum, t) => sum + Math.abs(t.delta), 0);

    const weekGGGEarned = gggTransactions
      .filter(t => t.delta > 0 && new Date(t.created_date) >= week)
      .reduce((sum, t) => sum + t.delta, 0);

    const weekGGGSpent = gggTransactions
      .filter(t => t.delta < 0 && new Date(t.created_date) >= week)
      .reduce((sum, t) => sum + Math.abs(t.delta), 0);

    const newUsersToday = profiles.filter(p => new Date(p.created_date) >= today).length;
    const newUsersWeek = profiles.filter(p => new Date(p.created_date) >= week).length;

    const meetingsToday = meetings.filter(m => new Date(m.created_date) >= today).length;
    const messagesWeek = messages.filter(m => new Date(m.created_date) >= week).length;

    return {
      todayGGGEarned,
      todayGGGSpent,
      weekGGGEarned,
      weekGGGSpent,
      newUsersToday,
      newUsersWeek,
      meetingsToday,
      messagesWeek,
      totalTransactions: gggTransactions.length,
    };
  }, [gggTransactions, profiles, meetings, messages]);

  const handleRefresh = () => {
    refetchGGG();
    refetchMeetings();
    refetchMissions();
    refetchBookings();
    refetchAudit();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'User', 'Description', 'Amount'];
    const rows = activityFeed.map(a => [
      a.created_date ? format(parseISO(a.created_date), 'yyyy-MM-dd HH:mm') : '',
      EVENT_TYPES[a.type]?.label || a.type,
      a.user_name,
      a.description,
      a.amount || ''
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 font-medium">GGG Earned (7d)</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.weekGGGEarned < 1 ? stats.weekGGGEarned.toFixed(4) : stats.weekGGGEarned.toLocaleString()}</p>
                <p className="text-xs text-emerald-500">Today: +{stats.todayGGGEarned < 1 ? stats.todayGGGEarned.toFixed(4) : stats.todayGGGEarned}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 font-medium">GGG Spent (7d)</p>
                <p className="text-2xl font-bold text-rose-700">{stats.weekGGGSpent < 1 ? stats.weekGGGSpent.toFixed(4) : stats.weekGGGSpent.toLocaleString()}</p>
                <p className="text-xs text-rose-500">Today: -{stats.todayGGGSpent < 1 ? stats.todayGGGSpent.toFixed(4) : stats.todayGGGSpent}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">New Users (7d)</p>
                <p className="text-2xl font-bold text-blue-700">{stats.newUsersWeek}</p>
                <p className="text-xs text-blue-500">Today: +{stats.newUsersToday}</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-600 font-medium">Messages (7d)</p>
                <p className="text-2xl font-bold text-violet-700">{stats.messagesWeek}</p>
                <p className="text-xs text-violet-500">Meetings today: {stats.meetingsToday}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              Master Activity Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by user, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="ggg_earned">GGG Earned</SelectItem>
                <SelectItem value="ggg_spent">GGG Spent</SelectItem>
                <SelectItem value="user_joined">New Users</SelectItem>
                <SelectItem value="mission_created">Missions</SelectItem>
                <SelectItem value="meeting_scheduled">Meetings</SelectItem>
                <SelectItem value="booking_made">Bookings</SelectItem>
                <SelectItem value="testimonial_given">Testimonials</SelectItem>
                <SelectItem value="admin_action">Admin Actions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-slate-500 mb-3">
            Showing {activityFeed.length} activities
          </p>

          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {activityFeed.map((activity) => {
                const config = EVENT_TYPES[activity.type] || EVENT_TYPES.admin_action;
                const Icon = config.icon;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={activity.user_avatar} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                        {activity.user_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900 text-sm">
                          {activity.user_name}
                        </span>
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activity.created_date && formatDistanceToNow(parseISO(activity.created_date), { addSuffix: true })}
                      </p>
                    </div>

                    {activity.amount !== undefined && activity.amount !== null && (
                      <div className={`text-right shrink-0 ${activity.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <p className="font-bold text-sm">
                          {activity.amount > 0 ? '+' : ''}{activity.amount < 1 ? activity.amount.toFixed(4) : activity.amount.toLocaleString()} GGG
                        </p>
                        {activity.balance_after !== undefined && (
                          <p className="text-xs text-slate-400">
                            Balance: {activity.balance_after < 1 ? activity.balance_after.toFixed(4) : activity.balance_after.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {activityFeed.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}