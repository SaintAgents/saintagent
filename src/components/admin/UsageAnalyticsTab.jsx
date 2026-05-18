import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, MessageSquare, Target, Calendar, Star, FileText, 
  TrendingUp, Clock, Search, ArrowUpDown, Activity
} from 'lucide-react';
import { format, differenceInDays, differenceInHours, parseISO } from 'date-fns';

import UsageStatsCards from './usage/UsageStatsCards';
import UsageActivityChart from './usage/UsageActivityChart';
import UsageUserTable from './usage/UsageUserTable';

export default function UsageAnalyticsTab() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [timeRange, setTimeRange] = useState('7d');

  const now = new Date();
  const rangeStart = useMemo(() => {
    const d = new Date();
    if (timeRange === '24h') d.setHours(d.getHours() - 24);
    else if (timeRange === '7d') d.setDate(d.getDate() - 7);
    else if (timeRange === '30d') d.setDate(d.getDate() - 30);
    else d.setDate(d.getDate() - 90);
    return d.toISOString();
  }, [timeRange]);

  // Fetch all key data in parallel
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['admin-usage-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
    staleTime: 120000,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-usage-posts', timeRange],
    queryFn: () => base44.entities.Post.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['admin-usage-meetings', timeRange],
    queryFn: () => base44.entities.Meeting.list('-created_date', 300),
    staleTime: 120000,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['admin-usage-missions', timeRange],
    queryFn: () => base44.entities.Mission.list('-created_date', 200),
    staleTime: 120000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-usage-messages', timeRange],
    queryFn: () => base44.entities.Message.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['admin-usage-journals', timeRange],
    queryFn: () => base44.entities.JournalEntry.list('-created_date', 300),
    staleTime: 120000,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['admin-usage-badges', timeRange],
    queryFn: () => base44.entities.Badge.list('-created_date', 500),
    staleTime: 120000,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-usage-bookings', timeRange],
    queryFn: () => base44.entities.Booking.list('-created_date', 300),
    staleTime: 120000,
  });

  // Filter by time range
  const inRange = (dateStr) => {
    if (!dateStr) return false;
    return dateStr >= rangeStart;
  };

  const filteredPosts = posts.filter(p => inRange(p.created_date));
  const filteredMeetings = meetings.filter(m => inRange(m.created_date));
  const filteredMissions = missions.filter(m => inRange(m.created_date));
  const filteredMessages = messages.filter(m => inRange(m.created_date));
  const filteredJournals = journalEntries.filter(j => inRange(j.created_date));
  const filteredBadges = badges.filter(b => inRange(b.created_date));
  const filteredBookings = bookings.filter(b => inRange(b.created_date));

  // Build per-user usage map
  const userUsageMap = useMemo(() => {
    const map = {};

    const ensure = (uid) => {
      if (!uid || uid.includes('demo_')) return null;
      if (!map[uid]) map[uid] = { posts: 0, messages_sent: 0, meetings: 0, missions_joined: 0, journals: 0, badges_earned: 0, bookings: 0, last_active: null };
      return map[uid];
    };

    const trackDate = (entry, date) => {
      if (!entry || !date) return;
      if (!entry.last_active || date > entry.last_active) entry.last_active = date;
    };

    filteredPosts.forEach(p => { const e = ensure(p.author_id || p.created_by); if (e) { e.posts++; trackDate(e, p.created_date); } });
    filteredMessages.forEach(m => { const e = ensure(m.from_user_id || m.created_by); if (e) { e.messages_sent++; trackDate(e, m.created_date); } });
    filteredMeetings.forEach(m => {
      [m.host_id, m.guest_id].forEach(uid => { const e = ensure(uid); if (e) { e.meetings++; trackDate(e, m.created_date); } });
    });
    filteredMissions.forEach(m => {
      (m.participant_ids || []).forEach(uid => { const e = ensure(uid); if (e) { e.missions_joined++; trackDate(e, m.created_date); } });
      const c = ensure(m.creator_id || m.created_by); if (c) { c.missions_joined++; trackDate(c, m.created_date); }
    });
    filteredJournals.forEach(j => { const e = ensure(j.user_id || j.created_by); if (e) { e.journals++; trackDate(e, j.created_date); } });
    filteredBadges.forEach(b => { const e = ensure(b.user_id); if (e) { e.badges_earned++; trackDate(e, b.created_date); } });
    filteredBookings.forEach(b => {
      const e = ensure(b.created_by); if (e) { e.bookings++; trackDate(e, b.created_date); }
    });

    return map;
  }, [filteredPosts, filteredMessages, filteredMeetings, filteredMissions, filteredJournals, filteredBadges, filteredBookings]);

  // Merge profiles with usage
  const userRows = useMemo(() => {
    return profiles
      .filter(p => !p.user_id?.includes('demo_'))
      .map(p => {
        const usage = userUsageMap[p.user_id] || { posts: 0, messages_sent: 0, meetings: 0, missions_joined: 0, journals: 0, badges_earned: 0, bookings: 0, last_active: null };
        const totalActions = usage.posts + usage.messages_sent + usage.meetings + usage.missions_joined + usage.journals + usage.bookings;
        const lastActive = usage.last_active || p.updated_date || p.created_date;
        return { ...p, usage, totalActions, lastActive };
      })
      .filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (r.display_name || '').toLowerCase().includes(q) || (r.user_id || '').toLowerCase().includes(q) || (r.handle || '').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return (b.lastActive || '') > (a.lastActive || '') ? 1 : -1;
        if (sortBy === 'most_active') return b.totalActions - a.totalActions;
        if (sortBy === 'posts') return b.usage.posts - a.usage.posts;
        if (sortBy === 'messages') return b.usage.messages_sent - a.usage.messages_sent;
        if (sortBy === 'name') return (a.display_name || '').localeCompare(b.display_name || '');
        return 0;
      });
  }, [profiles, userUsageMap, search, sortBy]);

  // Daily activity chart data
  const dailyActivity = useMemo(() => {
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = format(d, 'MMM dd');
      buckets[key] = { date: key, posts: 0, messages: 0, meetings: 0, journals: 0 };
    }
    const addToBucket = (dateStr, field) => {
      if (!dateStr) return;
      const key = format(parseISO(dateStr), 'MMM dd');
      if (buckets[key]) buckets[key][field]++;
    };
    filteredPosts.forEach(p => addToBucket(p.created_date, 'posts'));
    filteredMessages.forEach(m => addToBucket(m.created_date, 'messages'));
    filteredMeetings.forEach(m => addToBucket(m.created_date, 'meetings'));
    filteredJournals.forEach(j => addToBucket(j.created_date, 'journals'));
    return Object.values(buckets).reverse();
  }, [filteredPosts, filteredMessages, filteredMeetings, filteredJournals, timeRange]);

  // Active users (had any action in range)
  const activeUserCount = Object.keys(userUsageMap).length;
  const totalProfiles = profiles.filter(p => !p.user_id?.includes('demo_')).length;

  if (loadingProfiles) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-600" />
          Usage Analytics
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <UsageStatsCards
        activeUsers={activeUserCount}
        totalUsers={totalProfiles}
        posts={filteredPosts.length}
        messages={filteredMessages.length}
        meetings={filteredMeetings.length}
        missions={filteredMissions.length}
        journals={filteredJournals.length}
        bookings={filteredBookings.length}
        badgesEarned={filteredBadges.length}
      />

      {/* Activity Chart */}
      <UsageActivityChart data={dailyActivity} timeRange={timeRange} />

      {/* User Table */}
      <UsageUserTable
        users={userRows}
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </div>
  );
}