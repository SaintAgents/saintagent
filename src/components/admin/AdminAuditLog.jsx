import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, Search, User, Eye, MessageCircle, Target, Coins, 
  MousePointer, FileText, Clock, Filter, Download, RefreshCw,
  Landmark, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

const ACTION_ICONS = {
  page_view: Eye,
  click: MousePointer,
  create: FileText,
  update: FileText,
  delete: FileText,
  search: Search,
  message: MessageCircle,
  booking: Target,
  mission_join: Target,
  ggg_earned: Coins,
  ggg_spent: Coins,
  profile_view: User,
  login: ArrowUpRight,
  logout: ArrowDownRight,
  bank_deposit: Landmark,
  bank_withdraw: Landmark,
  other: Activity
};

const ACTION_COLORS = {
  page_view: 'bg-blue-100 text-blue-700',
  click: 'bg-slate-100 text-slate-700',
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  search: 'bg-violet-100 text-violet-700',
  message: 'bg-pink-100 text-pink-700',
  booking: 'bg-cyan-100 text-cyan-700',
  mission_join: 'bg-orange-100 text-orange-700',
  ggg_earned: 'bg-green-100 text-green-700',
  ggg_spent: 'bg-rose-100 text-rose-700',
  profile_view: 'bg-indigo-100 text-indigo-700',
  login: 'bg-teal-100 text-teal-700',
  logout: 'bg-gray-100 text-gray-700',
  bank_deposit: 'bg-emerald-100 text-emerald-700',
  bank_withdraw: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-700'
};

export default function AdminAuditLog() {
  const [searchUser, setSearchUser] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [limit, setLimit] = useState(100);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['adminAuditLogs', limit],
    queryFn: () => base44.entities.UserAuditLog.list('-created_date', limit)
  });

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesUser = !searchUser || log.user_id?.toLowerCase().includes(searchUser.toLowerCase());
    const matchesType = filterType === 'all' || log.action_type === filterType;
    return matchesUser && matchesType;
  });

  // Group by session for display
  const sessionGroups = filteredLogs.reduce((acc, log) => {
    const key = log.session_id || 'no-session';
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  // Calculate stats
  const totalGGGEarned = logs.filter(l => l.ggg_delta > 0).reduce((sum, l) => sum + (l.ggg_delta || 0), 0);
  const totalGGGSpent = logs.filter(l => l.ggg_delta < 0).reduce((sum, l) => sum + Math.abs(l.ggg_delta || 0), 0);
  const uniqueUsers = [...new Set(logs.map(l => l.user_id))].length;

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action Type', 'Detail', 'Page', 'GGG Delta', 'Entity Type', 'Entity ID'];
    const rows = filteredLogs.map(log => [
      log.created_date,
      log.user_id,
      log.action_type,
      log.action_detail,
      log.page_name,
      log.ggg_delta || 0,
      log.entity_type || '',
      log.entity_id || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-violet-600" />
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-slate-500">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
                <p className="text-sm text-slate-500">Unique Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">+{totalGGGEarned}</p>
                <p className="text-sm text-slate-500">GGG Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-rose-600" />
              <div>
                <p className="text-2xl font-bold text-rose-600">-{totalGGGSpent}</p>
                <p className="text-sm text-slate-500">GGG Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="page_view">Page Views</SelectItem>
                <SelectItem value="click">Clicks</SelectItem>
                <SelectItem value="create">Creates</SelectItem>
                <SelectItem value="update">Updates</SelectItem>
                <SelectItem value="delete">Deletes</SelectItem>
                <SelectItem value="search">Searches</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="ggg_earned">GGG Earned</SelectItem>
                <SelectItem value="ggg_spent">GGG Spent</SelectItem>
                <SelectItem value="bank_deposit">Bank Deposits</SelectItem>
                <SelectItem value="bank_withdraw">Bank Withdrawals</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="logout">Logouts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 logs</SelectItem>
                <SelectItem value="100">100 logs</SelectItem>
                <SelectItem value="250">250 logs</SelectItem>
                <SelectItem value="500">500 logs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log ({filteredLogs.length} actions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No audit logs found
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredLogs.map((log) => {
                  const Icon = ACTION_ICONS[log.action_type] || Activity;
                  return (
                    <div 
                      key={log.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${ACTION_COLORS[log.action_type] || 'bg-slate-100'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">
                            {log.action_detail}
                          </span>
                          {log.ggg_delta !== 0 && (
                            <Badge className={log.ggg_delta > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                              {log.ggg_delta > 0 ? '+' : ''}{log.ggg_delta} GGG
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.user_id}
                          </span>
                          {log.page_name && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {log.page_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.created_date), 'MMM d, HH:mm:ss')}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {log.action_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}