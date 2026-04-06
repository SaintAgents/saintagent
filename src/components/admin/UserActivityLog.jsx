import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Clock, Search, ArrowUpDown, TrendingUp, 
  UserCheck, Calendar, ChevronDown, ChevronUp,
  Zap, MessageSquare, Target, Star, X, ArrowRight,
  Coins, MapPin, Hash, Eye
} from 'lucide-react';
import { cn } from "@/lib/utils";
import moment from 'moment';
import UserDrilldownPanel from './UserDrilldownPanel';

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserRow({ profile, posts, missions, transactions, isOnline, isRecent, onDrilldown }) {
  const lastActive = profile.updated_date || profile.created_date;

  return (
    <div 
      className="flex items-center gap-3 py-3 px-4 hover:bg-violet-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
      onClick={() => onDrilldown(profile)}
    >
      <div className="relative">
        <Avatar className="w-9 h-9">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
            {(profile.display_name || '?')[0]}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-slate-900 truncate">{profile.display_name || 'Unknown'}</span>
          {profile.sa_number && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">SA#{profile.sa_number}</Badge>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{profile.user_id}</p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-xs text-slate-500">{moment(lastActive).fromNow()}</p>
        <Badge className={cn("text-[10px] mt-0.5",
          isOnline ? "bg-green-100 text-green-700" :
          isRecent ? "bg-blue-100 text-blue-700" :
          "bg-slate-100 text-slate-500"
        )}>
          {isOnline ? 'Online' : isRecent ? 'Today' : moment(lastActive).format('MMM D')}
        </Badge>
      </div>
      <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
        <span title="Posts">{posts} posts</span>
        <span title="Missions">{missions} missions</span>
        <span title="GGG">{(profile.ggg_balance || 0).toFixed(1)} GGG</span>
      </div>
      <div className="text-xs font-medium text-violet-600 hidden lg:block w-20 text-center">
        {profile.rank_code || 'seeker'}
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300" />
    </div>
  );
}

export default function UserActivityLog() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['adminProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 500),
  });

  // Fetch LiveStatus to determine who is actually online
  const { data: liveStatuses = [] } = useQuery({
    queryKey: ['adminLiveStatuses'],
    queryFn: () => base44.entities.LiveStatus.list('-updated_date', 500),
    refetchInterval: 30000, // refresh every 30s
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['adminPostCounts'],
    queryFn: () => base44.entities.Post.list('-created_date', 1000),
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['adminMissionParticipants'],
    queryFn: () => base44.entities.Mission.list('-created_date', 500),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['adminGGGTransactions'],
    queryFn: () => base44.entities.GGGTransaction.list('-created_date', 1000),
  });

  // Build online user set from LiveStatus (heartbeat within 10 min OR status not offline + updated recently)
  const onlineUserIds = useMemo(() => {
    const set = new Set();
    const cutoff = moment().subtract(10, 'minutes');
    liveStatuses.forEach(ls => {
      const heartbeat = ls.last_heartbeat ? moment(ls.last_heartbeat) : moment(ls.updated_date);
      const isActive = heartbeat.isAfter(cutoff);
      const notOffline = ls.status && ls.status !== 'offline';
      if (isActive || notOffline) {
        set.add(ls.user_id);
      }
    });
    return set;
  }, [liveStatuses]);

  // Build per-user activity counts
  const userStats = useMemo(() => {
    const stats = {};
    profiles.forEach(p => {
      stats[p.user_id] = { posts: 0, missions: 0, transactions: 0 };
    });
    posts.forEach(p => {
      if (stats[p.author_id]) stats[p.author_id].posts++;
    });
    missions.forEach(m => {
      if (m.participant_ids?.length) {
        m.participant_ids.forEach(pid => {
          if (stats[pid]) stats[pid].missions++;
        });
      }
      if (stats[m.creator_id]) stats[m.creator_id].missions++;
    });
    transactions.forEach(t => {
      if (stats[t.user_id]) stats[t.user_id].transactions++;
    });
    return stats;
  }, [profiles, posts, missions, transactions]);

  // Check if user is "recently active" (profile updated in last 24h OR has LiveStatus heartbeat in 24h)
  const recentUserIds = useMemo(() => {
    const set = new Set();
    const cutoff24h = moment().subtract(24, 'hours');
    profiles.forEach(p => {
      if (moment(p.updated_date || p.created_date).isAfter(cutoff24h)) set.add(p.user_id);
    });
    liveStatuses.forEach(ls => {
      const hb = ls.last_heartbeat ? moment(ls.last_heartbeat) : moment(ls.updated_date);
      if (hb.isAfter(cutoff24h)) set.add(ls.user_id);
    });
    return set;
  }, [profiles, liveStatuses]);

  // Time-based filtering using combined signals
  const now = moment();
  const filteredByTime = useMemo(() => {
    return profiles.filter(p => {
      // Get the most recent activity timestamp for this user
      const profileDate = moment(p.updated_date || p.created_date);
      const ls = liveStatuses.find(l => l.user_id === p.user_id);
      const lsDate = ls ? moment(ls.last_heartbeat || ls.updated_date) : null;
      const lastActive = lsDate && lsDate.isAfter(profileDate) ? lsDate : profileDate;

      if (timeFilter === 'day') return now.diff(lastActive, 'hours') < 24;
      if (timeFilter === 'week') return now.diff(lastActive, 'days') < 7;
      if (timeFilter === 'month') return now.diff(lastActive, 'days') < 30;
      return true;
    });
  }, [profiles, liveStatuses, timeFilter]);

  // Search + sort
  const displayProfiles = useMemo(() => {
    let list = filteredByTime.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (p.display_name || '').toLowerCase().includes(q) ||
        (p.user_id || '').toLowerCase().includes(q) ||
        (p.handle || '').toLowerCase().includes(q) ||
        (p.sa_number || '').toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date);
      }
      if (sortBy === 'ggg') return (b.ggg_balance || 0) - (a.ggg_balance || 0);
      if (sortBy === 'rank') return (b.rank_points || 0) - (a.rank_points || 0);
      if (sortBy === 'posts') {
        return (userStats[b.user_id]?.posts || 0) - (userStats[a.user_id]?.posts || 0);
      }
      if (sortBy === 'joined') {
        return new Date(a.created_date) - new Date(b.created_date);
      }
      return 0;
    });

    return list;
  }, [filteredByTime, search, sortBy, userStats]);

  // Summary stats using combined signals
  const onlineNow = onlineUserIds.size;
  const activeDay = new Set([...recentUserIds]).size;
  const activeWeek = profiles.filter(p => {
    const profileDate = moment(p.updated_date || p.created_date);
    const ls = liveStatuses.find(l => l.user_id === p.user_id);
    const lsDate = ls ? moment(ls.last_heartbeat || ls.updated_date) : null;
    const lastActive = lsDate && lsDate.isAfter(profileDate) ? lsDate : profileDate;
    return now.diff(lastActive, 'days') < 7;
  }).length;
  const activeMonth = profiles.filter(p => {
    const profileDate = moment(p.updated_date || p.created_date);
    const ls = liveStatuses.find(l => l.user_id === p.user_id);
    const lsDate = ls ? moment(ls.last_heartbeat || ls.updated_date) : null;
    const lastActive = lsDate && lsDate.isAfter(profileDate) ? lsDate : profileDate;
    return now.diff(lastActive, 'days') < 30;
  }).length;

  // Top users by activity
  const topByPosts = [...profiles].sort((a, b) => (userStats[b.user_id]?.posts || 0) - (userStats[a.user_id]?.posts || 0)).slice(0, 5);
  const topByGGG = [...profiles].sort((a, b) => (b.ggg_balance || 0) - (a.ggg_balance || 0)).slice(0, 5);
  const topByRP = [...profiles].sort((a, b) => (b.rank_points || 0) - (a.rank_points || 0)).slice(0, 5);

  if (loadingProfiles) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Online Now" value={onlineNow} subtitle="Active < 10 min" icon={Zap} color="bg-green-100 text-green-600" />
        <StatCard title="Last 24 Hours" value={activeDay} subtitle={`${profiles.length > 0 ? ((activeDay / profiles.length) * 100).toFixed(0) : 0}% of users`} icon={Clock} color="bg-blue-100 text-blue-600" />
        <StatCard title="Last 7 Days" value={activeWeek} subtitle={`${profiles.length > 0 ? ((activeWeek / profiles.length) * 100).toFixed(0) : 0}% of users`} icon={Calendar} color="bg-violet-100 text-violet-600" />
        <StatCard title="Last 30 Days" value={activeMonth} subtitle={`${profiles.length > 0 ? ((activeMonth / profiles.length) * 100).toFixed(0) : 0}% of users`} icon={Users} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Top Activity Leaderboards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Top Posters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topByPosts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-lg p-1 -mx-1" onClick={() => setSelectedUser(p)}>
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={p.avatar_url} />
                  <AvatarFallback className="text-[10px]">{(p.display_name || '?')[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium flex-1 truncate">{p.display_name}</span>
                <Badge variant="outline" className="text-[10px]">{userStats[p.user_id]?.posts || 0}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Top GGG Holders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topByGGG.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-lg p-1 -mx-1" onClick={() => setSelectedUser(p)}>
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={p.avatar_url} />
                  <AvatarFallback className="text-[10px]">{(p.display_name || '?')[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium flex-1 truncate">{p.display_name}</span>
                <Badge variant="outline" className="text-[10px]">{(p.ggg_balance || 0).toFixed(1)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" /> Top Rank Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topByRP.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded-lg p-1 -mx-1" onClick={() => setSelectedUser(p)}>
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={p.avatar_url} />
                  <AvatarFallback className="text-[10px]">{(p.display_name || '?')[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium flex-1 truncate">{p.display_name}</span>
                <Badge variant="outline" className="text-[10px]">{p.rank_points || 0}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* User List + Drilldown */}
      <div className={cn("grid gap-4", selectedUser ? "md:grid-cols-2" : "md:grid-cols-1")}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-violet-500" />
                  User Activity Log
                </CardTitle>
                <CardDescription>{displayProfiles.length} users shown / {profiles.length} total</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 h-8 w-48 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'day', label: 'Last 24h' },
                { key: 'week', label: 'Last 7d' },
                { key: 'month', label: 'Last 30d' },
              ].map(f => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={timeFilter === f.key ? 'default' : 'outline'}
                  onClick={() => setTimeFilter(f.key)}
                  className="h-7 text-xs"
                >
                  {f.label}
                </Button>
              ))}
              <div className="border-l mx-1" />
              {[
                { key: 'recent', label: 'Recent' },
                { key: 'posts', label: 'Posts' },
                { key: 'ggg', label: 'GGG' },
                { key: 'rank', label: 'Rank' },
                { key: 'joined', label: 'Oldest' },
              ].map(s => (
                <Button
                  key={s.key}
                  size="sm"
                  variant={sortBy === s.key ? 'secondary' : 'ghost'}
                  onClick={() => setSortBy(s.key)}
                  className="h-7 text-xs"
                >
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  {s.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {displayProfiles.map(p => (
                <UserRow
                  key={p.id}
                  profile={p}
                  posts={userStats[p.user_id]?.posts || 0}
                  missions={userStats[p.user_id]?.missions || 0}
                  transactions={userStats[p.user_id]?.transactions || 0}
                  isOnline={onlineUserIds.has(p.user_id)}
                  isRecent={recentUserIds.has(p.user_id)}
                  onDrilldown={setSelectedUser}
                />
              ))}
              {displayProfiles.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Drilldown Panel */}
        {selectedUser && (
          <UserDrilldownPanel
            profile={selectedUser}
            isOnline={onlineUserIds.has(selectedUser.user_id)}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </div>
  );
}