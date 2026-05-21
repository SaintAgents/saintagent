import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, LogIn, Clock, Users, UserCheck, UserX } from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';

function getRecencyBadge(dateStr) {
  if (!dateStr) return { label: 'Never', color: 'bg-slate-100 text-slate-500' };
  const hours = differenceInHours(new Date(), new Date(dateStr));
  if (hours < 1) return { label: 'Just now', color: 'bg-emerald-100 text-emerald-700' };
  if (hours < 24) return { label: 'Today', color: 'bg-emerald-100 text-emerald-700' };
  const days = differenceInDays(new Date(), new Date(dateStr));
  if (days < 3) return { label: `${days}d ago`, color: 'bg-blue-100 text-blue-700' };
  if (days < 7) return { label: `${days}d ago`, color: 'bg-amber-100 text-amber-700' };
  if (days < 30) return { label: `${days}d ago`, color: 'bg-orange-100 text-orange-700' };
  return { label: `${days}d ago`, color: 'bg-red-100 text-red-700' };
}

export default function SignInsTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('recent'); // all, recent, inactive

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-signins-users'],
    queryFn: () => base44.entities.User.list('-updated_date', 500),
    staleTime: 60000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-signins-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 500),
    staleTime: 60000,
  });

  // Build profile lookup by user_id (email)
  const profileMap = useMemo(() => {
    const map = {};
    profiles.forEach(p => {
      if (!map[p.user_id]) map[p.user_id] = p;
    });
    return map;
  }, [profiles]);

  // Merge users with profile info, sort by most recent activity
  const rows = useMemo(() => {
    return users
      .filter(u => !u.email?.includes('demo_'))
      .map(u => {
        const profile = profileMap[u.email] || {};
        const lastSeen = profile.updated_date || u.updated_date || u.created_date;
        return {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          created_date: u.created_date,
          updated_date: u.updated_date,
          last_seen: lastSeen,
          avatar_url: profile.avatar_url,
          handle: profile.handle,
          display_name: profile.display_name || u.full_name,
        };
      })
      .filter(r => {
        if (search) {
          const q = search.toLowerCase();
          if (!(r.display_name || '').toLowerCase().includes(q) &&
              !(r.email || '').toLowerCase().includes(q) &&
              !(r.handle || '').toLowerCase().includes(q)) return false;
        }
        if (filter === 'recent') {
          return r.last_seen && differenceInDays(new Date(), new Date(r.last_seen)) <= 7;
        }
        if (filter === 'inactive') {
          return !r.last_seen || differenceInDays(new Date(), new Date(r.last_seen)) > 30;
        }
        return true;
      })
      .sort((a, b) => {
        const da = a.last_seen || '1970';
        const db = b.last_seen || '1970';
        return db > da ? 1 : -1;
      });
  }, [users, profileMap, search, filter]);

  // Stats
  const totalUsers = users.filter(u => !u.email?.includes('demo_')).length;
  const activeToday = users.filter(u => {
    const p = profileMap[u.email];
    const last = p?.updated_date || u.updated_date;
    return last && differenceInHours(new Date(), new Date(last)) < 24;
  }).length;
  const activeWeek = users.filter(u => {
    const p = profileMap[u.email];
    const last = p?.updated_date || u.updated_date;
    return last && differenceInDays(new Date(), new Date(last)) <= 7;
  }).length;
  const dormant = totalUsers - activeWeek;

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <LogIn className="w-5 h-5 text-violet-600" />
        Sign-Ins & Activity
      </h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100"><Users className="w-5 h-5 text-violet-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{totalUsers}</p><p className="text-xs text-slate-500">Total Users</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100"><UserCheck className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold text-emerald-600">{activeToday}</p><p className="text-xs text-slate-500">Active Today</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Clock className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-blue-600">{activeWeek}</p><p className="text-xs text-slate-500">Active This Week</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><UserX className="w-5 h-5 text-red-500" /></div>
            <div><p className="text-2xl font-bold text-red-500">{dormant}</p><p className="text-xs text-slate-500">Dormant (7d+)</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">All Users ({rows.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-9" />
              </div>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                {[['all', 'All'], ['recent', 'Recent'], ['inactive', 'Inactive']].map(([val, label]) => (
                  <button key={val} onClick={() => setFilter(val)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === val ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-center p-3 font-medium">Role</th>
                  <th className="text-center p-3 font-medium">Joined</th>
                  <th className="text-center p-3 font-medium">Last Seen</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map(row => {
                  const recency = getRecencyBadge(row.last_seen);
                  return (
                    <tr key={row.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2" data-user-id={row.email}>
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={row.avatar_url} />
                            <AvatarFallback className="text-xs bg-violet-100 text-violet-600">
                              {(row.display_name || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-xs truncate cursor-pointer hover:text-violet-600">{row.display_name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${row.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                          {row.role || 'user'}
                        </Badge>
                      </td>
                      <td className="text-center p-3 text-xs text-slate-600">
                        {row.created_date ? format(new Date(row.created_date), 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="text-center p-3 text-xs text-slate-600">
                        {row.last_seen ? (
                          <span title={format(new Date(row.last_seen), 'PPpp')}>
                            {formatDistanceToNow(new Date(row.last_seen), { addSuffix: true })}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="text-center p-3">
                        <Badge className={`text-[10px] px-1.5 py-0.5 ${recency.color}`}>{recency.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}