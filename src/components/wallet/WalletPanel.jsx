import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function WalletPanel() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: walletRes } = useQuery({
    queryKey: ['wallet', user?.email],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: user.email },
      });
      return data;
    },
    enabled: !!user?.email,
  });

  const { data: txRes } = useQuery({
    queryKey: ['walletTx', user?.email],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getTransactions',
        payload: { user_id: user.email },
      });
      return data;
    },
    enabled: !!user?.email,
  });

  const wallet = walletRes?.wallet;
  const txs = txRes?.transactions || [];

  // Fallback: if wallet not present yet but profile has ggg_balance, show that
  const [profile] = useQuery({
    queryKey: ['userProfileSelf', user?.email],
    queryFn: async () => user?.email ? (await base44.entities.UserProfile.filter({ user_id: user.email })) : [],
    enabled: !!user?.email,
  }).data || [];
  const available = wallet?.available_balance ?? profile?.ggg_balance ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
          <p className="text-xs text-violet-600 font-medium">Available</p>
          <p className="text-xl font-bold text-violet-900">{(available ?? 0).toLocaleString?.()} GGG</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Locked</p>
          <p className="text-xl font-bold text-slate-900">{wallet?.locked_balance?.toLocaleString?.() ?? 0} GGG</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total Earned" value={wallet?.total_earned} color="emerald" />
        <Stat label="Total Spent" value={wallet?.total_spent} color="rose" />
        <Stat label="Rewards" value={wallet?.total_rewards} color="amber" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">Recent Transactions</p>
          <Badge variant="outline" className="text-xs">{txs.length}</Badge>
        </div>
        <ScrollArea className="h-64 pr-2">
          <div className="space-y-2">
            {txs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No transactions yet</p>
            ) : (
              txs.slice(0, 50).map((t) => (
                <TxRow key={t.id} tx={t} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function Stat({ label, value, color = 'slate' }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
  };
  return (
    <div className={cn('p-3 rounded-xl border', colors[color] || colors.slate)}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg font-bold">{(value ?? 0).toLocaleString?.()}</p>
    </div>
  );
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
    </div>
  );
}