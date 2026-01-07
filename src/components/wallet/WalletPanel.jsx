import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { HelpCircle, Wallet, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import WithdrawModal from './WithdrawModal';
import ConnectedWalletsSection from './ConnectedWalletsSection';

const GGG_TO_USD = 145.00;
const MIN_WITHDRAWAL_USD = 350.00;

export default function WalletPanel() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: walletRes } = useQuery({
    queryKey: ['wallet', user?.email],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: user.email }
      });
      return data;
    },
    enabled: !!user?.email,
    refetchInterval: 5000
  });

  const { data: txRes } = useQuery({
    queryKey: ['walletTx', user?.email],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getTransactions',
        payload: { user_id: user.email }
      });
      return data;
    },
    enabled: !!user?.email,
    refetchInterval: 5000
  });

  const wallet = walletRes?.wallet;
  const txs = txRes?.transactions || [];

  // Fallback: if wallet not present yet but profile has ggg_balance, show that
  const [profile] = useQuery({
    queryKey: ['userProfileSelf', user?.email],
    queryFn: async () => user?.email ? await base44.entities.UserProfile.filter({ user_id: user.email }) : [],
    enabled: !!user?.email
  }).data || [];
  const available = wallet?.available_balance ?? profile?.ggg_balance ?? 0;
  const locked = wallet?.locked_balance ?? 0;
  const total = (Number(available) || 0) + (Number(locked) || 0);
  const availableUSD = available * GGG_TO_USD;
  const canWithdraw = availableUSD >= MIN_WITHDRAWAL_USD;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
          <p className="text-xs text-violet-600 font-medium">Available</p>
          <p className="text-xl font-bold text-violet-900">{(available ?? 0).toLocaleString?.()} GGG</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <div className="flex items-center gap-1">
            <p className="text-xs text-slate-600 font-medium">Locked</p>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">
                  <HelpCircle className="w-3 h-3" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-slate-700 text-sm">
                <p className="font-semibold mb-1">Locked GGG = money in ceremony</p>
                <p className="mb-2">It’s your GGG, reserved so it can’t be double‑spent. Used for missions, orders, disputes, or stakes until released.</p>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  <li>Trust & Safety: funds escrowed until completion</li>
                  <li>Energetic Commitment: “I’m in” signal</li>
                  <li>Clean Accounting: prevents overspending</li>
                  <li>Resolution Space: held during disputes</li>
                </ul>
                <div className="mt-2 text-xs text-slate-500">
                  Total = Available + Locked. Locks are always tied to a specific mission/order/stake.
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <p className="text-gray-500 text-xl font-bold">{(locked ?? 0).toLocaleString?.()} GGG</p>
        </div>
      </div>

      <div className="mt-2">
        <Stat label="Total GGG" value={total} color="violet" />
        <div className="text-xs text-slate-500 mt-1">≈ ${(total * GGG_TO_USD).toFixed(2)} USD</div>
      </div>

      {/* Withdraw Section */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Withdraw to USDT</span>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
            1 GGG = ${GGG_TO_USD}
          </Badge>
        </div>
        {canWithdraw ? (
          <Button 
            size="sm" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
            onClick={() => setWithdrawOpen(true)}
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw (${availableUSD.toFixed(2)} available)
          </Button>
        ) : (
          <div className="text-xs text-emerald-700">
            <p className="font-medium">Min. withdrawal: ${MIN_WITHDRAWAL_USD}</p>
            <p className="text-emerald-600">You need ${(MIN_WITHDRAWAL_USD - availableUSD).toFixed(2)} more</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <Stat label="Total Earned" value={wallet?.total_earned} color="emerald" />
        <Stat label="Total Spent" value={wallet?.total_spent} color="rose" />
        <Stat label="Rewards" value={wallet?.total_rewards} color="amber" />
      </div>

      {/* Connected Wallets Section */}
      <ConnectedWalletsSection userId={user?.email} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">Recent Transactions</p>
          <Badge variant="outline" className="text-xs">{txs.length}</Badge>
        </div>
        <ScrollArea className="h-64 pr-2">
          <div className="space-y-2">
            {txs.length === 0 ?
            <p className="text-sm text-slate-400 py-6 text-center">No transactions yet</p> :

            txs.slice(0, 50).map((t) =>
            <TxRow key={t.id} tx={t} />
            )
            }
          </div>
        </ScrollArea>
      </div>

      <WithdrawModal 
        open={withdrawOpen} 
        onClose={() => setWithdrawOpen(false)} 
        wallet={wallet}
        userId={user?.email}
      />
    </div>);

}

function Stat({ label, value, color = 'slate' }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    violet: 'bg-violet-50 border-violet-200 text-violet-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-900'
  };
  return (
    <div className={cn('p-3 rounded-xl border', colors[color] || colors.slate)}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold">{(value ?? 0).toLocaleString?.()}</p>
    </div>);

}

function TxRow({ tx }) {
  const isCredit = tx.direction === 'CREDIT';
  const sign = isCredit ? '+' : '-';
  const amount = `${sign}${tx.amount_ggg} GGG`;
  const color = isCredit ? 'text-emerald-600' : 'text-rose-600';
  const date = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '';

  return (
    <div className="p-3 rounded-lg bg-white border border-slate-200">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{tx.tx_type}</p>
          {tx.memo && <p className="text-xs text-slate-500 truncate">{tx.memo}</p>}
          <p className="text-[11px] text-slate-400 mt-0.5">{date}</p>
        </div>
        <div className={cn('text-sm font-semibold whitespace-nowrap', color)}>{amount}</div>
      </div>
    </div>);

}