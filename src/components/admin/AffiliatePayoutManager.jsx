import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, DollarSign, Coins, Wallet, CheckCircle2, Clock,
  AlertCircle, Send, RefreshCw, Search, TrendingUp, ChevronRight, Loader2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AffiliatePayoutManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all affiliate codes with earnings
  const { data: affiliateCodes = [], isLoading, refetch } = useQuery({
    queryKey: ['adminAffiliateCodes'],
    queryFn: () => base44.entities.AffiliateCode.list('-total_ggg_earned', 500)
  });

  // Fetch all referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['adminReferrals'],
    queryFn: () => base44.entities.Referral.list('-created_date', 2000)
  });

  // Fetch all payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ['adminPayouts'],
    queryFn: () => base44.entities.AffiliatePayout.list('-created_date', 500)
  });

  // Fetch profiles for display
  const { data: profiles = [] } = useQuery({
    queryKey: ['adminProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  const profileMap = useMemo(() => {
    const map = {};
    profiles.forEach(p => { map[p.user_id] = p; });
    return map;
  }, [profiles]);

  // Calculate affiliate summaries with pending balances
  const affiliateSummaries = useMemo(() => {
    return affiliateCodes
      .filter(code => code.total_ggg_earned > 0 || code.total_paid > 0)
      .map(code => {
        const userPayouts = payouts.filter(p => p.affiliate_user_id === code.user_id);
        const completedPayouts = userPayouts.filter(p => p.status === 'completed');
        const pendingPayouts = userPayouts.filter(p => p.status === 'pending');
        const totalPaidOut = completedPayouts.reduce((sum, p) => sum + p.amount_ggg, 0);
        const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount_ggg, 0);
        
        // Calculate signup bonuses from referrals
        const userReferrals = referrals.filter(r => r.affiliate_user_id === code.user_id);
        const signupBonuses = userReferrals
          .filter(r => r.signup_bonus_paid)
          .reduce((sum, r) => sum + (r.signup_bonus_ggg || 0.25), 0);
        
        // Total commission from referrals
        const totalCommission = userReferrals.reduce((sum, r) => sum + (r.total_commission_earned || 0), 0);
        
        const totalEarned = totalCommission + signupBonuses;
        const availableBalance = totalEarned - totalPaidOut - pendingAmount;

        const profile = profileMap[code.user_id];

        return {
          ...code,
          profile,
          totalEarned,
          signupBonuses,
          totalCommission,
          totalPaidOut,
          pendingAmount,
          availableBalance,
          referralCount: userReferrals.length,
          activatedCount: userReferrals.filter(r => r.status !== 'pending').length,
          lastPayout: completedPayouts[0]?.created_date
        };
      })
      .filter(a => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.user_id.toLowerCase().includes(q) ||
          a.profile?.display_name?.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.availableBalance - a.availableBalance);
  }, [affiliateCodes, payouts, referrals, profileMap, searchQuery]);

  // Totals
  const totals = useMemo(() => {
    return {
      totalEarned: affiliateSummaries.reduce((sum, a) => sum + a.totalEarned, 0),
      totalPaidOut: affiliateSummaries.reduce((sum, a) => sum + a.totalPaidOut, 0),
      totalPending: affiliateSummaries.reduce((sum, a) => sum + a.pendingAmount, 0),
      totalAvailable: affiliateSummaries.reduce((sum, a) => sum + Math.max(0, a.availableBalance), 0),
      affiliateCount: affiliateSummaries.length
    };
  }, [affiliateSummaries]);

  // Process payout mutation
  const processPayoutMutation = useMutation({
    mutationFn: async ({ affiliateUserId, amount, note, profile }) => {
      const currentUser = await base44.auth.me();
      
      // Create payout record
      const payout = await base44.entities.AffiliatePayout.create({
        affiliate_user_id: affiliateUserId,
        affiliate_name: profile?.display_name || affiliateUserId,
        affiliate_avatar: profile?.avatar_url,
        amount_ggg: amount,
        amount_usd: amount * 145,
        payout_type: 'commission',
        status: 'completed',
        payout_method: 'ggg_wallet',
        processed_by: currentUser.email,
        processed_at: new Date().toISOString(),
        notes: note
      });

      // Credit to user's GGG balance via transaction
      await base44.entities.GGGTransaction.create({
        user_id: affiliateUserId,
        source_type: 'referral',
        source_id: payout.id,
        delta: amount,
        reason_code: 'affiliate_payout',
        description: `Affiliate commission payout`
      });

      // Update user profile GGG balance
      const userProfiles = await base44.entities.UserProfile.filter({ user_id: affiliateUserId });
      if (userProfiles[0]) {
        const currentBalance = userProfiles[0].ggg_balance || 0;
        await base44.entities.UserProfile.update(userProfiles[0].id, {
          ggg_balance: currentBalance + amount
        });
      }

      return payout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
      queryClient.invalidateQueries({ queryKey: ['adminAffiliateCodes'] });
      setSelectedAffiliate(null);
      setPayoutAmount('');
      setPayoutNote('');
      toast.success('Payout processed successfully');
    },
    onError: (error) => {
      toast.error('Failed to process payout: ' + error.message);
    }
  });

  // Approve pending payout
  const approvePendingMutation = useMutation({
    mutationFn: async (payout) => {
      const currentUser = await base44.auth.me();
      
      // Update payout status
      await base44.entities.AffiliatePayout.update(payout.id, {
        status: 'completed',
        processed_by: currentUser.email,
        processed_at: new Date().toISOString()
      });

      // Credit to user's GGG balance
      await base44.entities.GGGTransaction.create({
        user_id: payout.affiliate_user_id,
        source_type: 'referral',
        source_id: payout.id,
        delta: payout.amount_ggg,
        reason_code: 'affiliate_payout',
        description: `Affiliate commission payout`
      });

      // Update user profile GGG balance
      const userProfiles = await base44.entities.UserProfile.filter({ user_id: payout.affiliate_user_id });
      if (userProfiles[0]) {
        const currentBalance = userProfiles[0].ggg_balance || 0;
        await base44.entities.UserProfile.update(userProfiles[0].id, {
          ggg_balance: currentBalance + payout.amount_ggg
        });
      }

      return payout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayouts'] });
      setProcessingId(null);
      toast.success('Payout approved');
    }
  });

  const formatGGG = (val) => {
    if (val === 0) return '0';
    if (Math.abs(val) < 1) return val.toFixed(4);
    return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const pendingPayouts = payouts.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-600 font-medium">Affiliates</p>
                <p className="text-2xl font-bold text-violet-700">{totals.affiliateCount}</p>
              </div>
              <Users className="w-8 h-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>

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

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Paid Out</p>
                <p className="text-2xl font-bold text-blue-700">{formatGGG(totals.totalPaidOut)}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-700">{formatGGG(totals.totalPending)}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 font-medium">Available</p>
                <p className="text-2xl font-bold text-rose-700">{formatGGG(totals.totalAvailable)}</p>
              </div>
              <Wallet className="w-8 h-8 text-rose-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payouts */}
      {pendingPayouts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Clock className="w-5 h-5" />
              Pending Payouts ({pendingPayouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPayouts.map(payout => (
                <div 
                  key={payout.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={payout.affiliate_avatar} />
                      <AvatarFallback>{payout.affiliate_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{payout.affiliate_name}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(payout.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-amber-700">{formatGGG(payout.amount_ggg)} GGG</p>
                      <p className="text-xs text-slate-500">${payout.amount_usd?.toFixed(2)}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setProcessingId(payout.id);
                        approvePendingMutation.mutate(payout);
                      }}
                      disabled={processingId === payout.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {processingId === payout.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affiliate List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              Affiliate Balances
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search affiliates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {affiliateSummaries.map(affiliate => (
                <div 
                  key={affiliate.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={affiliate.profile?.avatar_url} />
                    <AvatarFallback>{affiliate.profile?.display_name?.charAt(0) || affiliate.user_id?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {affiliate.profile?.display_name || affiliate.user_id}
                    </p>
                    <p className="text-xs text-slate-500">
                      {affiliate.referralCount} referrals • {affiliate.activatedCount} activated
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Earned</p>
                      <p className="font-semibold text-emerald-600">{formatGGG(affiliate.totalEarned)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="font-semibold text-blue-600">{formatGGG(affiliate.totalPaidOut)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Available</p>
                      <p className={cn(
                        "font-bold",
                        affiliate.availableBalance > 0 ? "text-amber-600" : "text-slate-400"
                      )}>
                        {formatGGG(Math.max(0, affiliate.availableBalance))}
                      </p>
                    </div>
                    {affiliate.availableBalance > 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setPayoutAmount(affiliate.availableBalance.toString());
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {affiliateSummaries.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No affiliates with earnings found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Process Payout Dialog */}
      <Dialog open={!!selectedAffiliate} onOpenChange={() => setSelectedAffiliate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Process Payout
            </DialogTitle>
          </DialogHeader>

          {selectedAffiliate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedAffiliate.profile?.avatar_url} />
                  <AvatarFallback>{selectedAffiliate.profile?.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedAffiliate.profile?.display_name || selectedAffiliate.user_id}</p>
                  <p className="text-sm text-slate-500">Available: {formatGGG(selectedAffiliate.availableBalance)} GGG</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Payout Amount (GGG)</label>
                <Input
                  type="number"
                  step="0.0001"
                  max={selectedAffiliate.availableBalance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  USD Value: ${(parseFloat(payoutAmount || 0) * 145).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Note (optional)</label>
                <Textarea
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="Add a note about this payout..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAffiliate(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => processPayoutMutation.mutate({
                affiliateUserId: selectedAffiliate.user_id,
                amount: parseFloat(payoutAmount),
                note: payoutNote,
                profile: selectedAffiliate.profile
              })}
              disabled={!payoutAmount || parseFloat(payoutAmount) <= 0 || processPayoutMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {processPayoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Process Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}