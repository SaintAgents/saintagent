import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw,
  Download,
  Search,
  Clock,
  Users,
  Target,
  Calendar,
  MessageSquare,
  Star,
  Zap,
  Award,
  UserPlus
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO, subDays } from 'date-fns';

const ACTION_ICONS = {
  meeting_completed: Calendar,
  booking_completed: Calendar,
  event_attended: Calendar,
  mission_completed: Target,
  referral_activated: Users,
  testimonial_given: Star,
  post_created: MessageSquare,
  profile_completed: UserPlus,
  profile_view: Users,
  post_view: MessageSquare,
  like_react: Star,
  comment: MessageSquare,
  share: Users,
  follow: Users,
  profile_update: UserPlus,
  daily_checkin: Award,
  mission_onboarding: Target,
  mbti_completion: Award,
};

export default function GGGTotalsTab() {
  const [dateRange, setDateRange] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  const { data: gggTransactions = [], isLoading, refetch } = useQuery({
    queryKey: ['adminGGGTotals'],
    queryFn: () => base44.entities.GGGTransaction.list('-created_date', 1000),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['adminProfilesGGG'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
  });

  // Fetch all GGG reward rules to show all action types
  const { data: rewardRules = [] } = useQuery({
    queryKey: ['gggRewardRulesAdmin'],
    queryFn: () => base44.entities.GGGRewardRule.list(),
  });

  // Filter out demo users (emails ending in @demo.sa)
  const isDemoUser = (userId) => userId?.includes('@demo.sa') || userId?.includes('@demo.');
  
  const realUserTransactions = React.useMemo(() => {
    return gggTransactions.filter(tx => !isDemoUser(tx.user_id));
  }, [gggTransactions]);

  const profileMap = React.useMemo(() => {
    const map = {};
    profiles.forEach(p => { map[p.user_id] = p; });
    return map;
  }, [profiles]);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '24h': return subDays(now, 1);
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      case 'all': return new Date(0);
      default: return subDays(now, 30);
    }
  };

  // Group transactions by action/reason_code - exclude demo users
  const actionSummaries = React.useMemo(() => {
    const dateFilter = getDateFilter();
    const actionMap = {};

    // First, initialize all action types from reward rules (so they show even with 0 activity)
    rewardRules.forEach(rule => {
      if (rule.action_type && !actionMap[rule.action_type]) {
        actionMap[rule.action_type] = {
          action_type: rule.action_type,
          total_earned: 0,
          total_spent: 0,
          transaction_count: 0,
          users: {},
          transactions: [],
          ggg_amount: rule.ggg_amount,
          category: rule.category,
        };
      }
    });

    // Then process real user transactions only (filter out demo users)
    realUserTransactions
      .filter(tx => new Date(tx.created_date) >= dateFilter)
      .forEach(tx => {
        const actionType = tx.reason_code || tx.source_type || 'unknown';
        
        if (!actionMap[actionType]) {
          actionMap[actionType] = {
            action_type: actionType,
            total_earned: 0,
            total_spent: 0,
            transaction_count: 0,
            users: {},
            transactions: [],
          };
        }

        actionMap[actionType].transaction_count += 1;
        actionMap[actionType].transactions.push(tx);

        if (tx.delta > 0) {
          actionMap[actionType].total_earned += tx.delta;
        } else {
          actionMap[actionType].total_spent += Math.abs(tx.delta);
        }

        // Track per-user totals
        if (!actionMap[actionType].users[tx.user_id]) {
          const profile = profileMap[tx.user_id];
          actionMap[actionType].users[tx.user_id] = {
            user_id: tx.user_id,
            user_name: profile?.display_name || tx.user_id,
            user_avatar: profile?.avatar_url,
            total: 0,
            count: 0,
          };
        }
        actionMap[actionType].users[tx.user_id].total += tx.delta;
        actionMap[actionType].users[tx.user_id].count += 1;
      });

    const actions = Object.values(actionMap);
    
    // Apply search filter
    const filtered = searchQuery
      ? actions.filter(a => a.action_type.toLowerCase().includes(searchQuery.toLowerCase()))
      : actions;

    return filtered.sort((a, b) => b.total_earned - a.total_earned);
  }, [realUserTransactions, rewardRules, dateRange, searchQuery, profileMap]);

  // Calculate totals - exclude demo users
  const totals = React.useMemo(() => {
    const dateFilter = getDateFilter();
    const filtered = realUserTransactions.filter(tx => new Date(tx.created_date) >= dateFilter);
    
    return {
      totalEarned: filtered.filter(t => t.delta > 0).reduce((s, t) => s + t.delta, 0),
      totalSpent: filtered.filter(t => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0),
      transactionCount: filtered.length,
      uniqueUsers: new Set(filtered.map(t => t.user_id)).size,
    };
  }, [realUserTransactions, dateRange]);

  const formatGGG = (val) => {
    if (val === 0) return '0';
    if (Math.abs(val) < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const exportToCSV = () => {
    const headers = ['Action Type', 'Total Earned', 'Total Spent', 'Net', 'Transaction Count', 'Unique Users'];
    const rows = actionSummaries.map(a => [
      a.action_type,
      formatGGG(a.total_earned),
      formatGGG(a.total_spent),
      formatGGG(a.total_earned - a.total_spent),
      a.transaction_count,
      Object.keys(a.users).length
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ggg-totals-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Total Earned</p>
                <p className="text-2xl font-bold text-emerald-700">{formatGGG(totals.totalEarned)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-rose-700">{formatGGG(totals.totalSpent)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 font-medium">Net GGG</p>
                <p className="text-2xl font-bold text-amber-700">{formatGGG(totals.totalEarned - totals.totalSpent)}</p>
              </div>
              <Coins className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Transactions</p>
                <p className="text-2xl font-bold text-blue-700">{totals.transactionCount}</p>
                <p className="text-xs text-blue-500">{totals.uniqueUsers} users</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              GGG by Action Type
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
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
                placeholder="Search action types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-slate-500 mb-3">
            {actionSummaries.length} action types
          </p>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {actionSummaries.map((action) => {
                const Icon = ACTION_ICONS[action.action_type] || Coins;
                const userCount = Object.keys(action.users).length;

                return (
                  <div
                    key={action.action_type}
                    onClick={() => setSelectedAction(action)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">
                        {action.action_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {action.transaction_count} transactions • {userCount} users
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-500">Earned</p>
                        <p className="font-semibold text-emerald-600">+{formatGGG(action.total_earned)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Spent</p>
                        <p className="font-semibold text-rose-600">-{formatGGG(action.total_spent)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Net</p>
                        <p className={`font-bold ${action.total_earned - action.total_spent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatGGG(action.total_earned - action.total_spent)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                );
              })}

              {actionSummaries.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Detail Modal */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              {selectedAction?.action_type.replace(/_/g, ' ')}
            </DialogTitle>
          </DialogHeader>

          {selectedAction && (
            <div className="flex-1 overflow-hidden">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-center">
                  <p className="text-xs text-emerald-600">Earned</p>
                  <p className="text-lg font-bold text-emerald-700">+{formatGGG(selectedAction.total_earned)}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg text-center">
                  <p className="text-xs text-rose-600">Spent</p>
                  <p className="text-lg font-bold text-rose-700">-{formatGGG(selectedAction.total_spent)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <p className="text-xs text-slate-600">Transactions</p>
                  <p className="text-lg font-bold text-slate-700">{selectedAction.transaction_count}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-blue-600">Users</p>
                  <p className="text-lg font-bold text-blue-700">{Object.keys(selectedAction.users).length}</p>
                </div>
              </div>

              {/* Users breakdown */}
              <p className="text-sm font-medium text-slate-700 mb-2">By User</p>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {Object.values(selectedAction.users)
                    .sort((a, b) => b.total - a.total)
                    .map((user) => (
                      <div
                        key={user.user_id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.user_avatar} />
                          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                            {user.user_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {user.user_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.user_id}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className={`font-bold text-sm ${user.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {user.total > 0 ? '+' : ''}{formatGGG(user.total)} GGG
                          </p>
                          <p className="text-xs text-slate-500">{user.count} tx</p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}