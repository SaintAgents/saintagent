import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins, TrendingUp } from 'lucide-react';

const DEFAULT_GOLD_PRICE = 85.20; // fallback price per gram

export default function GGGBalanceCard({ walletAvailable }) {
  // Fetch gold price from PlatformSetting
  const { data: settings } = useQuery({
    queryKey: ['goldPriceSetting'],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: 'gold_price_per_gram' }),
    staleTime: 300000,
    refetchInterval: 300000
  });

  const storedPrice = settings?.[0]?.value ? JSON.parse(settings[0].value) : null;
  const pricePerGram = storedPrice?.price || DEFAULT_GOLD_PRICE;
  const gggBalance = walletAvailable || 0;
  const usdValue = gggBalance * pricePerGram;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
      <div className="absolute inset-0 bg-cover bg-center opacity-[0.875]" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e8ff4336b_image_2025-12-27_131552732.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-amber-300" />
            <p className="text-xs font-medium uppercase tracking-wider text-amber-200">GGG</p>
          </div>
          <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{gggBalance.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-medium text-emerald-200">≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}