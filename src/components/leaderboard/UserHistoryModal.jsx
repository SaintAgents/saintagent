import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Target, Coins, Users, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import moment from 'moment';

export default function UserHistoryModal({ open, onClose, userId, profile }) {
  // Fetch GGG transactions for historical data
  const { data: transactions = [] } = useQuery({
    queryKey: ['userTransactions', userId],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: userId }, '-created_date', 100),
    enabled: open && !!userId
  });

  // Fetch meetings history
  const { data: meetings = [] } = useQuery({
    queryKey: ['userMeetings', userId],
    queryFn: () => base44.entities.Meeting.filter({ 
      $or: [{ host_id: userId }, { guest_id: userId }],
      status: 'completed'
    }, '-created_date', 50),
    enabled: open && !!userId
  });

  // Fetch mission participation
  const { data: missions = [] } = useQuery({
    queryKey: ['userMissions', userId],
    queryFn: () => base44.entities.Mission.filter({ status: 'completed' }, '-created_date', 100),
    enabled: open && !!userId
  });

  const userMissions = missions.filter(m => m.participant_ids?.includes(userId) || m.creator_id === userId);

  // Build chart data from transactions (last 30 days)
  const chartData = React.useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const dayTransactions = transactions.filter(t => 
        moment(t.created_date).format('YYYY-MM-DD') === date
      );
      const earned = dayTransactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
      last30Days.push({
        date: moment(date).format('MMM D'),
        earned,
        cumulative: 0
      });
    }
    // Calculate cumulative
    let running = profile?.ggg_balance || 0;
    for (let i = last30Days.length - 1; i >= 0; i--) {
      last30Days[i].cumulative = running;
      running -= last30Days[i].earned;
    }
    return last30Days;
  }, [transactions, profile?.ggg_balance]);

  // Activity timeline
  const activityTimeline = React.useMemo(() => {
    const items = [];
    
    transactions.slice(0, 10).forEach(t => {
      items.push({
        type: 'ggg',
        date: t.created_date,
        description: t.description || t.reason_code,
        value: t.delta,
        icon: Coins
      });
    });

    meetings.slice(0, 5).forEach(m => {
      items.push({
        type: 'meeting',
        date: m.created_date,
        description: `Meeting: ${m.title}`,
        value: null,
        icon: Calendar
      });
    });

    userMissions.slice(0, 5).forEach(m => {
      items.push({
        type: 'mission',
        date: m.created_date,
        description: `Mission: ${m.title}`,
        value: m.reward_ggg,
        icon: Target
      });
    });

    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  }, [transactions, meetings, userMissions]);

  // Calculate rank change (simulated based on recent activity)
  const recentEarnings = transactions
    .filter(t => moment(t.created_date).isAfter(moment().subtract(7, 'days')))
    .reduce((sum, t) => sum + (t.delta > 0 ? t.delta : 0), 0);

  const rankTrend = recentEarnings > 100 ? 'up' : recentEarnings > 0 ? 'stable' : 'down';

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            Performance History
          </DialogTitle>
        </DialogHeader>

        {/* User Header */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
          <Avatar className="w-16 h-16 border-2 border-violet-200">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-lg">{profile.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">{profile.display_name}</h3>
            <p className="text-sm text-slate-500">@{profile.handle}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {profile.rp_rank_code || 'Seeker'}
              </Badge>
              {profile.leader_tier === 'verified144k' && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Verified 144k</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {rankTrend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {rankTrend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
              {rankTrend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
              <span className={cn(
                "text-sm font-medium",
                rankTrend === 'up' ? "text-emerald-600" : rankTrend === 'down' ? "text-rose-600" : "text-slate-500"
              )}>
                {rankTrend === 'up' ? 'Rising' : rankTrend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">7-day trend</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Card className="p-3 text-center">
            <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">{(profile.ggg_balance || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500">GGG Balance</p>
          </Card>
          <Card className="p-3 text-center">
            <Star className="w-5 h-5 text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">{(profile.rp_points || 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500">RP Points</p>
          </Card>
          <Card className="p-3 text-center">
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">{meetings.length}</p>
            <p className="text-xs text-slate-500">Meetings</p>
          </Card>
          <Card className="p-3 text-center">
            <Target className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-900">{userMissions.length}</p>
            <p className="text-xs text-slate-500">Missions</p>
          </Card>
        </div>

        {/* GGG Chart */}
        <Card className="p-4 mt-4">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            GGG Balance (30 Days)
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gggGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value) => [`${value.toLocaleString()} GGG`, 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#f59e0b" 
                  fill="url(#gggGradient)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-4 mt-4">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Recent Activity
          </h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activityTimeline.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              activityTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    item.type === 'ggg' ? "bg-amber-100" : item.type === 'meeting' ? "bg-blue-100" : "bg-emerald-100"
                  )}>
                    <item.icon className={cn(
                      "w-4 h-4",
                      item.type === 'ggg' ? "text-amber-600" : item.type === 'meeting' ? "text-blue-600" : "text-emerald-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">{item.description}</p>
                    <p className="text-xs text-slate-400">{moment(item.date).fromNow()}</p>
                  </div>
                  {item.value !== null && (
                    <span className={cn(
                      "text-sm font-semibold",
                      item.value > 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {item.value > 0 ? '+' : ''}{item.value}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}