import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Landmark, Coins, ArrowUpRight, ArrowDownRight, History,
  Shield, Sparkles, CheckCircle, AlertCircle, Clock, TrendingUp
} from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { AuditService } from '@/components/audit/UserAuditService';

export default function GaiaBankTab() {
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Get user profile for GGG balance
  const { data: profiles } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  // Get bank account
  const { data: bankAccounts } = useQuery({
    queryKey: ['gaiaBankAccount', currentUser?.email],
    queryFn: () => base44.entities.Wallet.filter({ user_id: currentUser.email, wallet_type: 'gaia_bank' }),
    enabled: !!currentUser?.email
  });
  const bankAccount = bankAccounts?.[0];

  // Get transaction history
  const { data: transactions = [] } = useQuery({
    queryKey: ['bankTransactions', currentUser?.email],
    queryFn: () => base44.entities.WalletTransaction.filter({ 
      user_id: currentUser.email 
    }, '-created_date', 50),
    enabled: !!currentUser?.email
  });

  // Sign up for bank account
  const signupMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Wallet.create({
        user_id: currentUser.email,
        wallet_type: 'gaia_bank',
        balance: 0,
        status: 'active',
        label: '7th Seal Gaia Bank Account'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaiaBankAccount'] });
      toast.success('Welcome to 7th Seal Gaia Bank!');
      AuditService.create('Wallet', null, 'Signed up for Gaia Bank');
    }
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      const numAmount = parseFloat(amount);
      if (numAmount <= 0 || numAmount > (profile?.ggg_balance || 0)) {
        throw new Error('Invalid amount');
      }

      // Deduct from GGG balance
      await base44.entities.UserProfile.update(profile.id, {
        ggg_balance: (profile.ggg_balance || 0) - numAmount
      });

      // Add to bank balance
      await base44.entities.Wallet.update(bankAccount.id, {
        balance: (bankAccount.balance || 0) + numAmount
      });

      // Record transaction
      await base44.entities.WalletTransaction.create({
        user_id: currentUser.email,
        wallet_id: bankAccount.id,
        transaction_type: 'deposit',
        amount: numAmount,
        balance_after: (bankAccount.balance || 0) + numAmount,
        description: 'Deposit to Gaia Bank',
        status: 'completed'
      });

      // Audit
      AuditService.bankDeposit(numAmount);

      return numAmount;
    },
    onSuccess: (amount) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['gaiaBankAccount'] });
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      setDepositAmount('');
      toast.success(`Deposited ${amount} GGG to Gaia Bank`);
    },
    onError: (error) => {
      toast.error(error.message || 'Deposit failed');
    }
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount) => {
      const numAmount = parseFloat(amount);
      if (numAmount <= 0 || numAmount > (bankAccount?.balance || 0)) {
        throw new Error('Insufficient bank balance');
      }

      // Add to GGG balance
      await base44.entities.UserProfile.update(profile.id, {
        ggg_balance: (profile.ggg_balance || 0) + numAmount
      });

      // Deduct from bank balance
      await base44.entities.Wallet.update(bankAccount.id, {
        balance: (bankAccount.balance || 0) - numAmount
      });

      // Record transaction
      await base44.entities.WalletTransaction.create({
        user_id: currentUser.email,
        wallet_id: bankAccount.id,
        transaction_type: 'withdrawal',
        amount: -numAmount,
        balance_after: (bankAccount.balance || 0) - numAmount,
        description: 'Withdrawal from Gaia Bank',
        status: 'completed'
      });

      // Audit
      AuditService.bankWithdraw(numAmount);

      return numAmount;
    },
    onSuccess: (amount) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['gaiaBankAccount'] });
      queryClient.invalidateQueries({ queryKey: ['bankTransactions'] });
      setWithdrawAmount('');
      toast.success(`Withdrew ${amount} GGG from Gaia Bank`);
    },
    onError: (error) => {
      toast.error(error.message || 'Withdrawal failed');
    }
  });

  // Not signed up yet
  if (!bankAccount) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">7th Seal Gaia Bank</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Secure your GGG earnings in the sacred vaults of Gaia Bank. 
              Earn interest, protect your assets, and participate in the new economy.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/80 border border-amber-200">
                <Shield className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Vaults</p>
              </div>
              <div className="p-4 rounded-xl bg-white/80 border border-amber-200">
                <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Earn Interest</p>
              </div>
              <div className="p-4 rounded-xl bg-white/80 border border-amber-200">
                <Sparkles className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Sacred Trust</p>
              </div>
            </div>

            <Button 
              onClick={() => signupMutation.mutate()}
              disabled={signupMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-6 text-lg"
            >
              {signupMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Landmark className="w-5 h-5 mr-2" />
              )}
              Open Gaia Bank Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Bank Balance</p>
                <p className="text-3xl font-bold text-amber-900">{(bankAccount?.balance || 0).toLocaleString()}</p>
                <p className="text-xs text-amber-600">GGG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Coins className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Wallet Balance</p>
                <p className="text-3xl font-bold text-slate-900">{(profile?.ggg_balance || 0).toLocaleString()}</p>
                <p className="text-xs text-slate-500">Available GGG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Assets</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {((bankAccount?.balance || 0) + (profile?.ggg_balance || 0)).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">GGG</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="deposit" className="gap-2">
            <ArrowDownRight className="w-4 h-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Withdraw
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                Deposit to Gaia Bank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Amount (GGG)</Label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount..."
                  max={profile?.ggg_balance || 0}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available: {(profile?.ggg_balance || 0).toLocaleString()} GGG
                </p>
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000].map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(String(Math.min(amt, profile?.ggg_balance || 0)))}
                    disabled={(profile?.ggg_balance || 0) < amt}
                  >
                    {amt}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(String(profile?.ggg_balance || 0))}
                >
                  Max
                </Button>
              </div>
              <Button
                onClick={() => depositMutation.mutate(depositAmount)}
                disabled={!depositAmount || depositMutation.isPending || parseFloat(depositAmount) <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {depositMutation.isPending ? 'Processing...' : 'Deposit'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
                Withdraw from Gaia Bank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Amount (GGG)</Label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount..."
                  max={bankAccount?.balance || 0}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Bank Balance: {(bankAccount?.balance || 0).toLocaleString()} GGG
                </p>
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000].map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawAmount(String(Math.min(amt, bankAccount?.balance || 0)))}
                    disabled={(bankAccount?.balance || 0) < amt}
                  >
                    {amt}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(String(bankAccount?.balance || 0))}
                >
                  Max
                </Button>
              </div>
              <Button
                onClick={() => withdrawMutation.mutate(withdrawAmount)}
                disabled={!withdrawAmount || withdrawMutation.isPending || parseFloat(withdrawAmount) <= 0}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {tx.amount > 0 ? (
                              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{tx.description}</p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(tx.created_date), 'MMM d, yyyy · HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount} GGG
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}