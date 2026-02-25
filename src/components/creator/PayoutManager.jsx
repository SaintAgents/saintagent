import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Wallet, ArrowUpRight, Clock, CheckCircle, XCircle, 
  DollarSign, AlertCircle, BanknoteIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PayoutManager({ profile }) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();
  const userId = profile?.user_id;

  // Fetch wallet and transactions
  const { data: walletData } = useQuery({
    queryKey: ['creatorWallet', userId],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('walletEngine', {
          action: 'getWallet',
          payload: { user_id: userId }
        });
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!userId
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['creatorWithdrawals', userId],
    queryFn: () => base44.entities.WithdrawalRequest.filter({ user_id: userId }, '-created_date', 50),
    enabled: !!userId
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['creatorSubsForPayout', userId],
    queryFn: () => base44.entities.Subscription.filter({ creator_id: userId, status: 'active' }),
    enabled: !!userId
  });

  const { data: tips = [] } = useQuery({
    queryKey: ['creatorTipsForPayout', userId],
    queryFn: () => base44.entities.Tip.filter({ to_user_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['creatorSalesForPayout', userId],
    queryFn: () => base44.entities.ProductPurchase.filter({ creator_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  // Calculate available balance
  const earnings = useMemo(() => {
    const subscriptionRevenue = subscriptions.reduce((sum, s) => {
      if (s.billing_cycle === 'monthly') return sum + (s.price_paid_ggg || 0);
      return sum + ((s.price_paid_ggg || 0) / 12);
    }, 0);
    const tipRevenue = tips.reduce((sum, t) => sum + (t.amount_ggg || 0), 0);
    const salesRevenue = purchases.reduce((sum, p) => sum + (p.price_paid_ggg || 0), 0);
    
    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'completed' || w.status === 'approved')
      .reduce((sum, w) => sum + (w.amount || 0), 0);
    
    const pendingWithdrawal = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    const totalEarned = subscriptionRevenue + tipRevenue + salesRevenue;
    const available = Math.max(0, totalEarned - totalWithdrawn - pendingWithdrawal);

    return {
      subscriptionRevenue,
      tipRevenue,
      salesRevenue,
      totalEarned,
      totalWithdrawn,
      pendingWithdrawal,
      available
    };
  }, [subscriptions, tips, purchases, withdrawals]);

  const requestWithdrawal = useMutation({
    mutationFn: async (amount) => {
      return base44.entities.WithdrawalRequest.create({
        user_id: userId,
        user_name: profile.display_name,
        amount: parseFloat(amount),
        status: 'pending',
        requested_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creatorWithdrawals'] });
      setWithdrawOpen(false);
      setAmount('');
      toast.success('Withdrawal request submitted for review');
    }
  });

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > earnings.available) {
      toast.error('Amount exceeds available balance');
      return;
    }
    if (withdrawAmount < 10) {
      toast.error('Minimum withdrawal is 10 GGG');
      return;
    }
    requestWithdrawal.mutate(amount);
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    completed: CheckCircle,
    rejected: XCircle
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Payouts & Earnings</h3>
        <p className="text-sm text-slate-500">Manage your creator earnings and withdrawals</p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm opacity-90">Available</span>
            </div>
            <p className="text-3xl font-bold">{earnings.available.toFixed(1)}</p>
            <p className="text-xs opacity-75">GGG to withdraw</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-600">{earnings.totalEarned.toFixed(1)} GGG</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Withdrawn</p>
            <p className="text-2xl font-bold text-slate-600">{earnings.totalWithdrawn.toFixed(1)} GGG</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{earnings.pendingWithdrawal.toFixed(1)} GGG</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
            <span className="text-sm font-medium">Subscriptions</span>
            <span className="font-bold text-violet-700">{earnings.subscriptionRevenue.toFixed(1)} GGG</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
            <span className="text-sm font-medium">Tips</span>
            <span className="font-bold text-rose-700">{earnings.tipRevenue.toFixed(1)} GGG</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <span className="text-sm font-medium">Product Sales</span>
            <span className="font-bold text-emerald-700">{earnings.salesRevenue.toFixed(1)} GGG</span>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">Request Withdrawal</h4>
              <p className="text-sm text-slate-500">Minimum withdrawal: 10 GGG</p>
            </div>
            <Button 
              onClick={() => setWithdrawOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              disabled={earnings.available < 10}
            >
              <BanknoteIcon className="w-4 h-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-violet-500" />
            Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((w) => {
                const Icon = statusIcons[w.status] || Clock;
                return (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusColors[w.status]?.replace('text-', 'bg-').replace('100', '200') || 'bg-slate-200'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{w.amount} GGG</p>
                        <p className="text-xs text-slate-500">
                          {w.created_date && format(new Date(w.created_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[w.status] || ''}>
                      {w.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">No withdrawal history</p>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-violet-50 rounded-lg text-center">
              <p className="text-sm text-slate-600">Available Balance</p>
              <p className="text-3xl font-bold text-violet-700">{earnings.available.toFixed(1)} GGG</p>
            </div>
            <div>
              <Label>Withdrawal Amount (GGG)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="10"
                max={earnings.available}
              />
              <p className="text-xs text-slate-500 mt-1">Minimum: 10 GGG</p>
            </div>
            {parseFloat(amount) > earnings.available && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Amount exceeds available balance
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setWithdrawOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={handleWithdraw}
                disabled={requestWithdrawal.isPending || !amount || parseFloat(amount) > earnings.available || parseFloat(amount) < 10}
              >
                Request Withdrawal
              </Button>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Withdrawals are reviewed by admin and typically processed within 3-5 business days.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}