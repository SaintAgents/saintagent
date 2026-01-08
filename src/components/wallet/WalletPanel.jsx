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

  // Force dark background for this panel
  React.useEffect(() => {
    const panel = document.querySelector('[data-wallet-panel]');
    if (panel) {
      panel.style.backgroundColor = '#050505';
    }
  }, []);
  
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
    <div className="space-y-4 bg-[#050505] p-4 rounded-xl" data-wallet-panel style={{ backgroundColor: '#000000' }}>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-[#0a0a0a] dark:to-[#0a0a0a] border border-violet-100 dark:border-[rgba(0,255,136,0.3)]">
          <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Available</p>
          <p className="text-xl font-bold text-violet-900 dark:text-white">{(available ?? 0).toLocaleString?.()} GGG</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0a0a0a] dark:to-[#0a0a0a] border border-slate-200 dark:border-[rgba(0,255,136,0.2)]">
          <div className="flex items-center gap-1">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Locked</p>
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
          <p className="text-gray-500 dark:text-white text-xl font-bold">{(locked ?? 0).toLocaleString?.()} GGG</p>
        </div>
      </div>

      <div className="mt-2">
        <div className="p-3 rounded-xl bg-black border border-[rgba(0,255,136,0.3)]">
          <p className="text-xs font-medium text-[#00ff88]">Total GGG</p>
          <p className="text-lg font-bold text-white">{(total ?? 0).toLocaleString?.()}</p>
        </div>
        <div className="text-xs text-slate-400 mt-1">≈ ${(total * GGG_TO_USD).toFixed(2)} USD</div>
      </div>

      {/* Withdraw Section */}
      <div className="p-3 rounded-xl bg-black border border-[#00ff88]/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#00ff88]" />
            <span className="text-sm font-medium text-[#00ff88]">Withdraw to USDT</span>
          </div>
          <Badge className="bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/40 text-xs">
            1 GGG = ${GGG_TO_USD}
          </Badge>
        </div>
        {canWithdraw ? (
          <Button 
            size="sm" 
            className="w-full bg-[#00ff88] hover:bg-[#00ff88]/80 text-black gap-2"
            onClick={() => setWithdrawOpen(true)}
          >
            <ArrowUpRight className="w-4 h-4" />
            Withdraw (${availableUSD.toFixed(2)} available)
          </Button>
        ) : (
          <div className="text-xs text-[#00ff88]">
            <p className="font-medium">Min. withdrawal: ${MIN_WITHDRAWAL_USD}</p>
            <p className="text-[#00ff88]/70">You need ${(MIN_WITHDRAWAL_USD - availableUSD).toFixed(2)} more</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-2">
        <div className="p-3 rounded-xl bg-black border border-emerald-500/40">
          <p className="text-xs font-medium text-emerald-400">Total Earned</p>
          <p className="text-lg font-bold text-white">{(wallet?.total_earned ?? 0).toLocaleString?.()}</p>
        </div>
        <div className="p-3 rounded-xl bg-black border border-rose-500/40">
          <p className="text-xs font-medium text-rose-400">Total Spent</p>
          <p className="text-lg font-bold text-white">{(wallet?.total_spent ?? 0).toLocaleString?.()}</p>
        </div>
        <div className="p-3 rounded-xl bg-black border border-amber-500/40">
          <p className="text-xs font-medium text-amber-400">Rewards</p>
          <p className="text-lg font-bold text-white">{(wallet?.total_rewards ?? 0).toLocaleString?.()}</p>
        </div>
      </div>

      {/* Connected Wallets Section */}
      <ConnectedWalletsSection userId={user?.email} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#00ff88]">Recent Transactions</p>
          <Badge variant="outline" className="text-xs border-[#00ff88]/40 text-[#00ff88]">{txs.length}</Badge>
        </div>
        <ScrollArea className="h-64 pr-2">
          <div className="space-y-2">
            {txs.length === 0 ?
            <p className="text-sm text-slate-500 py-6 text-center">No transactions yet</p> :

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
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-100',
    rose: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700/50 text-rose-900 dark:text-rose-100',
    amber: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-100',
    violet: 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700/50 text-violet-900 dark:text-violet-100',
    slate: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
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
  const color = isCredit ? 'text-emerald-400' : 'text-rose-400';
  const date = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '';

  return (
    <div className="p-3 rounded-lg bg-black border border-[#00ff88]/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{tx.tx_type}</p>
          {tx.memo && <p className="text-xs text-slate-400 truncate">{tx.memo}</p>}
          <p className="text-[11px] text-slate-500 mt-0.5">{date}</p>
        </div>
        <div className={cn('text-sm font-semibold whitespace-nowrap', color)}>{amount}</div>
      </div>
    </div>);

}