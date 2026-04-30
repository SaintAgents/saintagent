import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Inbox, Crown, Wallet, MessageSquare, AlertTriangle, Folder, 
  Users, Clock, ArrowRight, ChevronRight, TrendingUp, 
  UserPlus, Bug, ShieldAlert, CircleDollarSign, Flag, Trash2
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

function AttentionCard({ icon: Icon, title, count, color, items, onViewAll, renderItem }) {
  if (count === 0) return null;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-bold">{count}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="space-y-2 mt-1">
          {items.slice(0, 3).map(renderItem)}
        </div>
        {count > 3 && (
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs gap-1" onClick={onViewAll}>
            View all {count} <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
}

export default function AdminOverviewDashboard({ onNavigateTab }) {
  const queryClient = useQueryClient();

  const dismissFeedback = async (e, fb) => {
    e.stopPropagation();
    await base44.entities.BetaFeedback.update(fb.id, { status: 'resolved' });
    queryClient.invalidateQueries({ queryKey: ['admin-overview-feedback'] });
  };

  // Fetch all attention-needed data in parallel
  const { data: adminRequests = [] } = useQuery({
    queryKey: ['admin-overview-requests'],
    queryFn: () => base44.entities.AdminRequest.filter({ status: 'pending' }, '-created_date', 20),
    staleTime: 60000,
  });

  const { data: leaderApps = [] } = useQuery({
    queryKey: ['admin-overview-leaders'],
    queryFn: () => base44.entities.LeaderApplication.filter({ status: 'pending' }, '-created_date', 10),
    staleTime: 60000,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['admin-overview-withdrawals'],
    queryFn: () => base44.entities.WithdrawalRequest.filter({ status: 'pending' }, '-created_date', 10),
    staleTime: 60000,
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['admin-overview-feedback'],
    queryFn: () => base44.entities.BetaFeedback.filter({ status: 'pending' }, '-created_date', 50),
    staleTime: 5000,
    refetchOnMount: 'always',
  });

  const { data: forumReports = [] } = useQuery({
    queryKey: ['admin-overview-reports'],
    queryFn: () => base44.entities.ForumReport.filter({ status: 'pending' }, '-created_date', 50),
    staleTime: 5000,
    refetchOnMount: 'always',
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['admin-overview-payouts'],
    queryFn: () => base44.entities.AffiliatePayout.filter({ status: 'pending' }, '-created_date', 10),
    staleTime: 60000,
  });

  const { data: missionJoins = [] } = useQuery({
    queryKey: ['admin-overview-mission-joins'],
    queryFn: () => base44.entities.MissionJoinRequest.filter({ status: 'pending' }, '-created_date', 10),
    staleTime: 60000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-overview-users'],
    queryFn: () => base44.entities.User.list('-created_date', 5),
    staleTime: 120000,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['admin-overview-projects-claimed'],
    queryFn: () => base44.entities.Project.filter({ claim_status: 'pending_review' }, '-created_date', 10),
    staleTime: 60000,
  });

  const totalPending = adminRequests.length + leaderApps.length + withdrawals.length + 
    feedback.length + forumReports.length + payouts.length + missionJoins.length + projects.length;

  const urgentRequests = adminRequests.filter(r => r.priority === 'urgent' || r.priority === 'high');
  const bugFeedback = feedback.filter(f => f.feedback_type === 'bug');
  const criticalBugs = feedback.filter(f => f.severity === 'critical' || f.severity === 'high');

  const nav = (tab) => () => onNavigateTab?.(tab);

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className={`rounded-xl p-5 ${totalPending > 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${totalPending > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
              {totalPending > 0 ? <Clock className="w-6 h-6 text-amber-600" /> : <TrendingUp className="w-6 h-6 text-emerald-600" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {totalPending > 0 ? `${totalPending} items need your attention` : 'All caught up!'}
              </h2>
              <p className="text-sm text-slate-600">
                {totalPending > 0 
                  ? `${urgentRequests.length > 0 ? `${urgentRequests.length} urgent · ` : ''}${criticalBugs.length > 0 ? `${criticalBugs.length} critical bugs · ` : ''}Updated just now`
                  : 'No pending items require action right now.'
                }
              </p>
            </div>
          </div>
          {totalPending > 0 && (
            <Badge className="bg-amber-600 text-white text-sm px-3 py-1">{totalPending} Pending</Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={Inbox} label="Admin Requests" value={adminRequests.length} color="bg-violet-500" />
        <StatTile icon={Folder} label="Project Claims" value={projects.length} color="bg-blue-500" />
        <StatTile icon={Wallet} label="Withdrawals" value={withdrawals.length} color="bg-emerald-500" />
        <StatTile icon={AlertTriangle} label="Reports & Bugs" value={forumReports.length + bugFeedback.length} color="bg-red-500" />
      </div>

      {/* Attention Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Admin Requests */}
        <AttentionCard
          icon={Inbox}
          title="Admin Requests"
          count={adminRequests.length}
          color="bg-violet-500"
          items={adminRequests}
          onViewAll={nav('requests')}
          renderItem={(req) => (
            <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('requests')}>
              <div className="flex items-center gap-2 min-w-0">
                {req.priority === 'urgent' && <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{req.title}</p>
                  <p className="text-[10px] text-slate-500">{req.requester_name} · {timeAgo(req.created_date)}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{req.request_type?.replace(/_/g, ' ')}</Badge>
            </div>
          )}
        />

        {/* Project Claims */}
        <AttentionCard
          icon={Folder}
          title="Project Claims"
          count={projects.length}
          color="bg-blue-500"
          items={projects}
          onViewAll={nav('projects')}
          renderItem={(proj) => (
            <div key={proj.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('projects')}>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{proj.title}</p>
                <p className="text-[10px] text-slate-500">{timeAgo(proj.created_date)}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}
        />

        {/* Withdrawal Requests */}
        <AttentionCard
          icon={CircleDollarSign}
          title="Withdrawal Requests"
          count={withdrawals.length}
          color="bg-emerald-500"
          items={withdrawals}
          onViewAll={nav('requests')}
          renderItem={(w) => (
            <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('requests')}>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{w.amount_ggg} GGG → {w.network}</p>
                <p className="text-[10px] text-slate-500">{timeAgo(w.created_date)}</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0">${w.amount_usd?.toFixed(2) || '—'}</Badge>
            </div>
          )}
        />

        {/* Leader Applications */}
        <AttentionCard
          icon={Crown}
          title="Leader Applications"
          count={leaderApps.length}
          color="bg-amber-500"
          items={leaderApps}
          onViewAll={nav('leaders')}
          renderItem={(app) => (
            <div key={app.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('leaders')}>
              <div className="flex items-center gap-2 min-w-0">
                <img src={app.applicant_avatar} className="w-5 h-5 rounded-full" alt="" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{app.applicant_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{app.reason?.slice(0, 50)}</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}
        />

        {/* Beta Feedback (Critical/High) */}
        <AttentionCard
          icon={Bug}
          title="Pending Feedback"
          count={feedback.length}
          color="bg-red-500"
          items={feedback}
          onViewAll={nav('feedback')}
          renderItem={(fb) => (
            <div key={fb.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('feedback')}>
              <div className="flex items-center gap-2 min-w-0">
                {(fb.severity === 'critical' || fb.severity === 'high') && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{fb.description?.slice(0, 60)}</p>
                  <p className="text-[10px] text-slate-500">{fb.reporter_name} · {timeAgo(fb.created_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <Badge variant="outline" className={`text-[10px] ${fb.severity === 'critical' ? 'border-red-300 text-red-600' : ''}`}>{fb.severity}</Badge>
                <button
                  onClick={(e) => dismissFeedback(e, fb)}
                  className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                  title="Mark as resolved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        />

        {/* Forum Reports */}
        <AttentionCard
          icon={Flag}
          title="Forum Reports"
          count={forumReports.length}
          color="bg-orange-500"
          items={forumReports}
          onViewAll={nav('moderation')}
          renderItem={(rpt) => (
            <div key={rpt.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('moderation')}>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{rpt.reason?.replace(/_/g, ' ')} — {rpt.target_type}</p>
                <p className="text-[10px] text-slate-500">{rpt.reporter_name} · {timeAgo(rpt.created_date)}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}
        />

        {/* Affiliate Payouts */}
        <AttentionCard
          icon={Wallet}
          title="Affiliate Payouts"
          count={payouts.length}
          color="bg-teal-500"
          items={payouts}
          onViewAll={nav('affiliate-payouts')}
          renderItem={(p) => (
            <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('affiliate-payouts')}>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{p.affiliate_name} — {p.amount_ggg} GGG</p>
                <p className="text-[10px] text-slate-500">{p.payout_type} · {timeAgo(p.created_date)}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}
        />

        {/* Mission Join Requests */}
        <AttentionCard
          icon={UserPlus}
          title="Mission Join Requests"
          count={missionJoins.length}
          color="bg-indigo-500"
          items={missionJoins}
          onViewAll={nav('projects')}
          renderItem={(mj) => (
            <div key={mj.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors" onClick={nav('projects')}>
              <div className="flex items-center gap-2 min-w-0">
                {mj.user_avatar && <img src={mj.user_avatar} className="w-5 h-5 rounded-full" alt="" />}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{mj.user_name}</p>
                  <p className="text-[10px] text-slate-500">{mj.role_applied || 'Member'} · {timeAgo(mj.created_date)}</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          )}
        />
      </div>

      {/* Recent New Users */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-700">
                <Users className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold">Recent New Users</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={nav('users')}>
              View all <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {allUsers.slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    data-user-id={u.email} 
                    className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all"
                  >
                    {u.full_name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{u.full_name || u.email}</p>
                    <p className="text-[10px] text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                  <span className="text-[10px] text-slate-400">{timeAgo(u.created_date)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}