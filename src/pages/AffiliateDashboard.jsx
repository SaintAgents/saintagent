import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users, TrendingUp, DollarSign, Coins, Calendar, Clock,
  ChevronRight, Download, Wallet, ArrowRight, CheckCircle2,
  AlertCircle, UserPlus, Activity, BarChart3, PieChart
} from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import BackButton from '@/components/hud/BackButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

// Activity level thresholds (GGG earned in 90 days)
const ACTIVITY_THRESHOLDS = {
  low: { min: 0, max: 5, label: 'Low Use', color: 'bg-slate-100 text-slate-700' },
  mid: { min: 5.01, max: 50, label: 'Mid Use', color: 'bg-blue-100 text-blue-700' },
  high: { min: 50.01, max: Infinity, label: 'High Use', color: 'bg-emerald-100 text-emerald-700' }
};

function getActivityLevel(gggEarned) {
  if (gggEarned > 50) return 'high';
  if (gggEarned > 5) return 'mid';
  return 'low';
}

export default function AffiliateDashboard() {
  const [dateRange, setDateRange] = useState('90d');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles[0];

  // Fetch affiliate codes
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCodes', currentUser?.email],
    queryFn: () => base44.entities.AffiliateCode.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const primaryCode = affiliateCodes.find(c => !c.campaign_name) || affiliateCodes[0];

  // Fetch referrals
  const { data: referrals = [], isLoading: referralsLoading } = useQuery({
    queryKey: ['affiliateReferrals', currentUser?.email],
    queryFn: () => base44.entities.Referral.filter({ affiliate_user_id: currentUser.email }, '-created_date'),
    enabled: !!currentUser?.email
  });

  // Fetch GGG transactions for referred users to calculate their activity
  const { data: allGGGTransactions = [] } = useQuery({
    queryKey: ['referredUserTransactions'],
    queryFn: () => base44.entities.GGGTransaction.list('-created_date', 2000),
    enabled: referrals.length > 0
  });

  // Fetch payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ['affiliatePayouts', currentUser?.email],
    queryFn: () => base44.entities.AffiliatePayout.filter({ affiliate_user_id: currentUser.email }, '-created_date'),
    enabled: !!currentUser?.email
  });

  // Fetch profiles for referred users
  const { data: referredProfiles = [] } = useQuery({
    queryKey: ['referredProfiles', referrals.map(r => r.referred_user_id).join(',')],
    queryFn: async () => {
      if (referrals.length === 0) return [];
      const userIds = referrals.map(r => r.referred_user_id);
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.filter(p => userIds.includes(p.user_id));
    },
    enabled: referrals.length > 0
  });

  const profileMap = useMemo(() => {
    const map = {};
    referredProfiles.forEach(p => { map[p.user_id] = p; });
    return map;
  }, [referredProfiles]);

  // Calculate date filter
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      case 'all': return new Date(0);
      default: return subDays(now, 90);
    }
  };

  // Calculate referred user earnings within 90 days of their signup
  const referredUserEarnings = useMemo(() => {
    const earnings = {};
    referrals.forEach(ref => {
      const userId = ref.referred_user_id;
      const signupDate = ref.signup_timestamp ? new Date(ref.signup_timestamp) : new Date(ref.created_date);
      const cutoffDate = new Date(signupDate);
      cutoffDate.setDate(cutoffDate.getDate() + 90);

      const userTxs = allGGGTransactions.filter(tx => 
        tx.user_id === userId &&
        tx.delta > 0 &&
        new Date(tx.created_date) <= cutoffDate
      );

      earnings[userId] = {
        total: userTxs.reduce((sum, tx) => sum + tx.delta, 0),
        transactionCount: userTxs.length,
        lastActivity: userTxs[0]?.created_date || null
      };
    });
    return earnings;
  }, [referrals, allGGGTransactions]);

  // Filter referrals by date range
  const filteredReferrals = useMemo(() => {
    const dateFilter = getDateFilter();
    return referrals.filter(r => new Date(r.created_date) >= dateFilter);
  }, [referrals, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const dateFilter = getDateFilter();
    const filtered = referrals.filter(r => new Date(r.created_date) >= dateFilter);
    
    // Activity breakdown
    const activityBreakdown = { low: 0, mid: 0, high: 0 };
    let totalReferredEarnings = 0;
    let totalCommission = 0;
    let totalSignupBonuses = 0;

    filtered.forEach(ref => {
      const userEarnings = referredUserEarnings[ref.referred_user_id]?.total || 0;
      const level = getActivityLevel(userEarnings);
      activityBreakdown[level]++;
      
      totalReferredEarnings += userEarnings;
      totalCommission += ref.total_commission_earned || 0;
      
      if (ref.signup_bonus_paid) {
        totalSignupBonuses += ref.signup_bonus_ggg || 0.25;
      }
    });

    // Payout totals
    const completedPayouts = payouts.filter(p => p.status === 'completed');
    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount_ggg, 0);
    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount_ggg, 0);

    // Available balance = total earned - total paid out
    const totalEarned = totalCommission + totalSignupBonuses;
    const availableBalance = totalEarned - totalPaidOut;

    return {
      totalReferrals: filtered.length,
      activatedReferrals: filtered.filter(r => r.status === 'activated' || r.status === 'earning').length,
      pendingReferrals: filtered.filter(r => r.status === 'pending').length,
      activityBreakdown,
      totalSignupBonuses,
      totalCommission,
      totalEarned,
      totalPaidOut,
      pendingAmount,
      availableBalance,
      avgCommissionPerReferral: filtered.length > 0 ? totalCommission / filtered.length : 0
    };
  }, [referrals, referredUserEarnings, payouts, dateRange]);

  // Detailed referral data with earnings
  const detailedReferrals = useMemo(() => {
    return filteredReferrals.map(ref => {
      const userEarnings = referredUserEarnings[ref.referred_user_id] || { total: 0, transactionCount: 0 };
      const profile = profileMap[ref.referred_user_id];
      const activityLevel = getActivityLevel(userEarnings.total);
      
      return {
        ...ref,
        profile,
        earnings: userEarnings.total,
        transactionCount: userEarnings.transactionCount,
        lastActivity: userEarnings.lastActivity,
        activityLevel,
        commission: ref.total_commission_earned || (userEarnings.total * (ref.commission_percent || 10) / 100)
      };
    }).sort((a, b) => b.earnings - a.earnings);
  }, [filteredReferrals, referredUserEarnings, profileMap]);

  const formatGGG = (val) => {
    if (val === 0) return '0';
    if (Math.abs(val) < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const exportToCSV = () => {
    const headers = ['Referred User', 'Signup Date', 'Status', 'Activity Level', 'GGG Earned', 'Commission Earned'];
    const rows = detailedReferrals.map(r => [
      r.referred_user_id,
      format(new Date(r.created_date), 'yyyy-MM-dd'),
      r.status,
      ACTIVITY_THRESHOLDS[r.activityLevel].label,
      formatGGG(r.earnings),
      formatGGG(r.commission)
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `affiliate-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (referralsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden h-48 md:h-56">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/f660ad96b_gemini-25-flash-image_The_Ascension_Blueprint_Lab_Theme_Divine_architecture_plus_futuristic_creation_V-61.jpg"
          alt="Affiliate Dashboard"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-slate-50" />
        <HeroGalleryTrigger startIndex={16} className="absolute bottom-4 left-4 text-white/80 z-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 rounded-lg" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-amber-300" />
                Affiliate Dashboard
              </h1>
            </div>
            <p className="text-white/90 text-sm">Track your referral performance and earnings</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Date Range Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Available Balance</p>
                  <p className="text-3xl font-bold text-emerald-700">{formatGGG(metrics.availableBalance)} GGG</p>
                  <p className="text-sm text-emerald-600">${(metrics.availableBalance * 145).toFixed(2)} USD</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="text-center md:text-right px-4 py-2 rounded-lg bg-white/60">
                  <p className="text-xs text-slate-500">Total Earned</p>
                  <p className="text-lg font-bold text-slate-700">{formatGGG(metrics.totalEarned)} GGG</p>
                </div>
                <div className="text-center md:text-right px-4 py-2 rounded-lg bg-white/60">
                  <p className="text-xs text-slate-500">Total Paid Out</p>
                  <p className="text-lg font-bold text-slate-700">{formatGGG(metrics.totalPaidOut)} GGG</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-violet-500" />
              <p className="text-2xl font-bold">{metrics.totalReferrals}</p>
              <p className="text-xs text-slate-500">Total Referred</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <UserPlus className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{metrics.activatedReferrals}</p>
              <p className="text-xs text-slate-500">Activated</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Coins className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{formatGGG(metrics.totalSignupBonuses)}</p>
              <p className="text-xs text-slate-500">Signup Bonuses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold">{formatGGG(metrics.totalCommission)}</p>
              <p className="text-xs text-slate-500">Commission</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-pink-500" />
              <p className="text-2xl font-bold">{formatGGG(metrics.avgCommissionPerReferral)}</p>
              <p className="text-xs text-slate-500">Avg/Referral</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{metrics.pendingReferrals}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Level Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-600" />
              Referrals by Activity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-3xl font-bold text-slate-600">{metrics.activityBreakdown.low}</p>
                <Badge className={ACTIVITY_THRESHOLDS.low.color}>Low Use</Badge>
                <p className="text-xs text-slate-500 mt-1">0-5 GGG in 90 days</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <p className="text-3xl font-bold text-blue-600">{metrics.activityBreakdown.mid}</p>
                <Badge className={ACTIVITY_THRESHOLDS.mid.color}>Mid Use</Badge>
                <p className="text-xs text-slate-500 mt-1">5-50 GGG in 90 days</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-3xl font-bold text-emerald-600">{metrics.activityBreakdown.high}</p>
                <Badge className={ACTIVITY_THRESHOLDS.high.color}>High Use</Badge>
                <p className="text-xs text-slate-500 mt-1">50+ GGG in 90 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="gap-2">
              <Users className="w-4 h-4" />
              Referrals Detail
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Payout History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Earnings per Referred User</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {detailedReferrals.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No referrals in this period</p>
                      </div>
                    ) : (
                      detailedReferrals.map(ref => (
                        <div 
                          key={ref.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={ref.profile?.avatar_url} />
                            <AvatarFallback>{ref.referred_user_id?.charAt(0)?.toUpperCase()}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {ref.profile?.display_name || ref.referred_user_id}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {ref.status}
                              </Badge>
                              <Badge className={ACTIVITY_THRESHOLDS[ref.activityLevel].color}>
                                {ACTIVITY_THRESHOLDS[ref.activityLevel].label}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {format(new Date(ref.created_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-xs text-slate-500">Their GGG</p>
                                <p className="font-semibold text-slate-700">{formatGGG(ref.earnings)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Your Commission</p>
                                <p className="font-bold text-emerald-600">+{formatGGG(ref.commission)}</p>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Payout History</span>
                  {metrics.availableBalance > 0 && (
                    <Badge className="bg-amber-100 text-amber-700">
                      {formatGGG(metrics.availableBalance)} GGG available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {payouts.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No payouts yet</p>
                        <p className="text-sm mt-1">Payouts are processed by administrators</p>
                      </div>
                    ) : (
                      payouts.map(payout => (
                        <div 
                          key={payout.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border",
                            payout.status === 'completed' && "bg-emerald-50 border-emerald-200",
                            payout.status === 'pending' && "bg-amber-50 border-amber-200",
                            payout.status === 'failed' && "bg-red-50 border-red-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {payout.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : payout.status === 'pending' ? (
                              <Clock className="w-5 h-5 text-amber-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {payout.payout_type === 'commission' ? 'Commission Payout' : 
                                 payout.payout_type === 'signup_bonus' ? 'Signup Bonus' : 'Payout'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(payout.created_date), 'MMM d, yyyy')}
                                {payout.referral_count > 0 && ` • ${payout.referral_count} referrals`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-bold",
                              payout.status === 'completed' ? "text-emerald-600" : "text-slate-700"
                            )}>
                              +{formatGGG(payout.amount_ggg)} GGG
                            </p>
                            <p className="text-xs text-slate-500">${payout.amount_usd?.toFixed(2) || '—'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}