import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  ArrowUpCircle, ArrowDownCircle, History, TrendingUp, 
  ChevronDown, ChevronUp, Coins, Target, MessageSquare, 
  Star, Users, BookOpen, Shield, Zap, Award, FileText,
  ThumbsUp, Eye, Share2, UserPlus, CheckCircle, Loader2,
  Calendar, Download
} from "lucide-react";

const ACTION_ICONS = {
  meeting_completed: Users,
  booking_completed: Calendar,
  event_attended: Calendar,
  mission_completed: Target,
  mission_participation: Target,
  mission_onboarding: Target,
  mission_lead: Target,
  referral_activated: UserPlus,
  testimonial_given: Star,
  post_created: FileText,
  post_update: FileText,
  forum_post: MessageSquare,
  profile_completed: CheckCircle,
  profile_view: Eye,
  profile_update: CheckCircle,
  post_view: Eye,
  like_react: ThumbsUp,
  comment: MessageSquare,
  comment_helpful: ThumbsUp,
  share: Share2,
  follow: UserPlus,
  daily_checkin: Zap,
  thread_summary: FileText,
  how_to: BookOpen,
  template: FileText,
  weekly_recap: FileText,
  quest_completion: Award,
  team_collaboration: Users,
  task_confirmed: CheckCircle,
  milestone: Award,
  impact_unlock: TrendingUp,
  lead_sprint: Shield,
  security_review: Shield,
  cross_mission: Target,
  agent_publish: Zap,
  agent_flagship: Zap,
  lesson_micro: BookOpen,
  module_complete: BookOpen,
  class_final: BookOpen,
  security_trained: Shield,
  mentor_ta: Users,
  mbti_completion: Star,
  feedback_submit: MessageSquare,
  feedback_resolved: CheckCircle,
};

const ACTION_LABELS = {
  meeting_completed: 'Meeting Completed',
  booking_completed: 'Booking Completed',
  event_attended: 'Event Attended',
  mission_completed: 'Mission Completed',
  mission_participation: 'Mission Participation',
  mission_onboarding: 'Mission Onboarding',
  mission_lead: 'Mission Lead',
  referral_activated: 'Referral Activated',
  testimonial_given: 'Testimonial Given',
  post_created: 'Post Created',
  post_update: 'Post Updated',
  forum_post: 'Forum Post',
  profile_completed: 'Profile Completed',
  profile_view: 'Profile View',
  profile_update: 'Profile Update',
  post_view: 'Post View',
  like_react: 'Like/React',
  comment: 'Comment',
  comment_helpful: 'Helpful Comment',
  share: 'Share',
  follow: 'Follow',
  daily_checkin: 'Daily Check-in',
  thread_summary: 'Thread Summary',
  how_to: 'How-To Guide',
  template: 'Template Created',
  weekly_recap: 'Weekly Recap',
  quest_completion: 'Quest Completed',
  team_collaboration: 'Team Collaboration',
  task_confirmed: 'Task Confirmed',
  milestone: 'Milestone Reached',
  impact_unlock: 'Impact Unlock',
  lead_sprint: 'Lead Sprint',
  security_review: 'Security Review',
  cross_mission: 'Cross-Mission',
  agent_publish: 'Agent Published',
  agent_flagship: 'Agent Flagship',
  lesson_micro: 'Micro Lesson',
  module_complete: 'Module Complete',
  class_final: 'Class Final',
  security_trained: 'Security Trained',
  mentor_ta: 'Mentor/TA',
  mbti_completion: 'MBTI Complete',
  feedback_submit: 'Feedback Submitted',
  feedback_resolved: 'Feedback Resolved',
};

const TX_TYPE_COLORS = {
  EARN_MISSION: 'bg-violet-100 text-violet-700 border-violet-200',
  EARN_MARKET_SALE: 'bg-blue-100 text-blue-700 border-blue-200',
  EARN_REWARD: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SPEND_PURCHASE: 'bg-orange-100 text-orange-700 border-orange-200',
  SPEND_FEE: 'bg-rose-100 text-rose-700 border-rose-200',
  TRANSFER_OUT: 'bg-rose-100 text-rose-700 border-rose-200',
  TRANSFER_IN: 'bg-sky-100 text-sky-700 border-sky-200',
  ADJUSTMENT_CREDIT: 'bg-amber-100 text-amber-700 border-amber-200',
  ADJUSTMENT_DEBIT: 'bg-red-100 text-red-700 border-red-200',
  REFUND: 'bg-slate-100 text-slate-700 border-slate-200',
  LOCK_FUNDS: 'bg-slate-100 text-slate-700 border-slate-200',
  RELEASE_FUNDS: 'bg-teal-100 text-teal-700 border-teal-200',
};

const CATEGORY_COLORS = {
  engagement: 'bg-blue-500',
  content: 'bg-purple-500',
  mission: 'bg-violet-500',
  leadership: 'bg-amber-500',
  learning: 'bg-emerald-500',
  agent: 'bg-cyan-500',
  profile: 'bg-pink-500',
};

export default function GGGEarningsHistory({ userId }) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'summary'

  // Fetch WalletTransactions (modern ledger)
  const { data: walletTxs = [], isLoading: loadingWallet } = useQuery({
    queryKey: ['walletTxHistory', userId],
    queryFn: () => base44.entities.WalletTransaction.filter(
      { actor_user_id: userId }, '-timestamp', 500
    ),
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch legacy GGGTransactions
  const { data: legacyTxs = [], isLoading: loadingLegacy } = useQuery({
    queryKey: ['legacyGGGHistory', userId],
    queryFn: () => base44.entities.GGGTransaction.filter(
      { user_id: userId }, '-created_date', 500
    ),
    enabled: !!userId,
    staleTime: 30000,
  });

  // Fetch active GGG reward rules for context
  const { data: rewardRules = [] } = useQuery({
    queryKey: ['gggRules'],
    queryFn: () => base44.entities.GGGRewardRule.filter({ is_active: true }),
    staleTime: 300000,
  });

  const isLoading = loadingWallet || loadingLegacy;

  // Build combined + deduplicated timeline
  // WalletTransactions are authoritative; legacy fills gaps
  const walletEventIds = new Set(walletTxs.map(tx => tx.event_id).filter(Boolean));
  
  const allTransactions = [
    ...walletTxs.map(tx => ({
      id: tx.id,
      source: 'wallet',
      date: tx.timestamp || tx.created_date,
      type: tx.tx_type,
      direction: tx.direction,
      amount: tx.amount_ggg,
      memo: tx.memo,
      actionType: tx.related_object_type || tx.metadata?.action_type,
      relatedId: tx.related_object_id,
      status: tx.status,
      eventId: tx.event_id,
    })),
    ...legacyTxs
      .filter(tx => {
        // Skip if already represented in WalletTransactions
        const possibleEventId = `earn_${tx.reason_code}_${userId}_`;
        return !walletTxs.some(wt => 
          wt.event_id?.startsWith(possibleEventId) && 
          Math.abs(wt.amount_ggg - Math.abs(tx.delta)) < 0.0001
        );
      })
      .map(tx => ({
        id: tx.id,
        source: 'legacy',
        date: tx.created_date,
        type: tx.delta >= 0 ? 'EARN_REWARD' : 'SPEND_PURCHASE',
        direction: tx.delta >= 0 ? 'CREDIT' : 'DEBIT',
        amount: Math.abs(tx.delta),
        memo: tx.description,
        actionType: tx.reason_code,
        relatedId: tx.source_id,
        status: 'COMPLETED',
        balanceAfter: tx.balance_after,
      })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Summary stats
  const totalEarned = allTransactions
    .filter(tx => tx.direction === 'CREDIT')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = allTransactions
    .filter(tx => tx.direction === 'DEBIT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Group by action type for summary
  const actionSummary = {};
  allTransactions.forEach(tx => {
    if (tx.direction !== 'CREDIT') return;
    const key = tx.actionType || tx.type;
    if (!actionSummary[key]) {
      actionSummary[key] = { count: 0, total: 0 };
    }
    actionSummary[key].count++;
    actionSummary[key].total += tx.amount;
  });

  // Group by category using reward rules
  const rulesByAction = {};
  rewardRules.forEach(r => { rulesByAction[r.action_type] = r; });

  const categorySummary = {};
  Object.entries(actionSummary).forEach(([action, data]) => {
    const rule = rulesByAction[action];
    const cat = rule?.category || 'engagement';
    if (!categorySummary[cat]) categorySummary[cat] = { count: 0, total: 0 };
    categorySummary[cat].count += data.count;
    categorySummary[cat].total += data.total;
  });

  const displayTxs = showAll ? allTransactions : allTransactions.slice(0, 25);

  const handleExportCSV = () => {
    const escape = (v) => { const s = String(v || ''); return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const header = 'Date,Type,Action,Direction,Amount,Memo,Status,Source';
    const rows = allTransactions.map(tx => [
      new Date(tx.date).toISOString(),
      escape(tx.type),
      escape(tx.actionType || ''),
      tx.direction,
      tx.amount.toFixed(7),
      escape(tx.memo),
      tx.status,
      tx.source,
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ggg_history_${userId}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading earnings history...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-violet-600" />
          GGG Earnings History
        </h3>
        <Button size="sm" variant="ghost" onClick={handleExportCSV} className="gap-1 text-xs h-7">
          <Download className="w-3 h-3" />
          CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-700">Total Earned</p>
          </div>
          <p className="text-lg font-bold text-emerald-800">{totalEarned.toFixed(4)}</p>
          <p className="text-xs text-emerald-600">{allTransactions.filter(t => t.direction === 'CREDIT').length} transactions</p>
        </div>
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600" />
            <p className="text-xs font-medium text-rose-700">Total Spent</p>
          </div>
          <p className="text-lg font-bold text-rose-800">{totalSpent.toFixed(4)}</p>
          <p className="text-xs text-rose-600">{allTransactions.filter(t => t.direction === 'DEBIT').length} transactions</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Coins className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-xs font-medium text-blue-700">Net</p>
          </div>
          <p className="text-lg font-bold text-blue-800">{(totalEarned - totalSpent).toFixed(4)}</p>
          <p className="text-xs text-blue-600">{allTransactions.length} total txs</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
            activeTab === 'transactions' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Transaction Log ({allTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={cn(
            "flex-1 text-xs font-medium py-1.5 rounded-md transition-colors",
            activeTab === 'summary' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Earnings Breakdown
        </button>
      </div>

      {activeTab === 'transactions' && (
        <div>
          {allTransactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No GGG transactions found for this user.
            </div>
          ) : (
            <>
              <ScrollArea className="h-[360px]">
                <div className="space-y-1.5">
                  {displayTxs.map((tx) => {
                    const IconComp = ACTION_ICONS[tx.actionType] || Coins;
                    const isCredit = tx.direction === 'CREDIT';
                    return (
                      <div key={tx.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isCredit ? "bg-emerald-100" : "bg-rose-100"
                        )}>
                          <IconComp className={cn("w-4 h-4", isCredit ? "text-emerald-600" : "text-rose-600")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {ACTION_LABELS[tx.actionType] || tx.memo || tx.type}
                            </p>
                            {tx.source === 'legacy' && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 border-slate-300 text-slate-400">legacy</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={cn("text-[10px] h-4 px-1.5", TX_TYPE_COLORS[tx.type] || 'bg-slate-100 text-slate-600')}>
                              {tx.type}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                              {' '}
                              {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {tx.memo && tx.memo !== (ACTION_LABELS[tx.actionType] || '') && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tx.memo}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "text-sm font-bold",
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {isCredit ? '+' : '-'}{tx.amount.toFixed(4)}
                          </p>
                          <p className="text-[10px] text-slate-400">GGG</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              {allTransactions.length > 25 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-2 text-xs gap-1"
                >
                  {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAll ? 'Show less' : `Show all ${allTransactions.length} transactions`}
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* By Category */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">By Category</p>
            <div className="space-y-1.5">
              {Object.entries(categorySummary)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([cat, data]) => (
                  <div key={cat} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", CATEGORY_COLORS[cat] || 'bg-slate-400')} />
                    <p className="text-sm font-medium text-slate-700 capitalize flex-1">{cat}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">+{data.total.toFixed(4)}</p>
                      <p className="text-[10px] text-slate-400">{data.count} actions</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* By Action Type */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">By Action Type</p>
            <ScrollArea className="h-[260px]">
              <div className="space-y-1">
                {Object.entries(actionSummary)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([action, data]) => {
                    const IconComp = ACTION_ICONS[action] || Coins;
                    const rule = rulesByAction[action];
                    return (
                      <div key={action} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <IconComp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {ACTION_LABELS[action] || action}
                          </p>
                          {rule && (
                            <p className="text-[10px] text-slate-400">
                              {rule.ggg_amount.toFixed(4)} GGG/action
                              {rule.category && ` · ${rule.category}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-emerald-600">+{data.total.toFixed(4)}</p>
                          <p className="text-[10px] text-slate-400">{data.count}×</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}