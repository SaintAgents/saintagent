import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function GoldPriceTicker({ className }) {
  // Fetch gold price from LLM with internet context
  const { data: goldData, isLoading } = useQuery({
    queryKey: ['goldPrice'],
    queryFn: async () => {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: "What is the current spot price of gold per troy ounce in USD? Also provide the price per gram. Return only the data.",
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              price_per_ounce: { type: "number", description: "Gold price per troy ounce in USD" },
              price_per_gram: { type: "number", description: "Gold price per gram in USD" },
              change_percent: { type: "number", description: "Daily change percentage" },
              direction: { type: "string", enum: ["up", "down", "flat"] }
            }
          }
        });
        return result;
      } catch (e) {
        console.error('Gold price fetch failed:', e);
        // Fallback to approximate values
        return {
          price_per_ounce: 2650,
          price_per_gram: 85.20,
          change_percent: 0,
          direction: 'flat'
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });

  const pricePerGram = goldData?.price_per_gram || 85.20;
  const pricePerOunce = goldData?.price_per_ounce || 2650;
  const changePercent = goldData?.change_percent || 0;
  const direction = goldData?.direction || 'flat';

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-amber-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/70 via-yellow-800/60 to-amber-900/70" />
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80)' }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 text-amber-300" />
            <p className="text-xs font-medium uppercase tracking-wider text-amber-200">1 GGG = 1g Gold</p>
          </div>
          {isLoading ? (
            <div className="h-8 w-20 bg-amber-800/50 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                ${pricePerGram.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {direction === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                ) : direction === 'down' ? (
                  <TrendingDown className="w-3 h-3 text-rose-300" />
                ) : null}
                <span className={cn(
                  "text-xs font-medium",
                  direction === 'up' ? "text-emerald-200" : direction === 'down' ? "text-rose-200" : "text-amber-200"
                )}>
                  {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
                <span className="text-xs text-amber-300/70 ml-1">
                  (${pricePerOunce.toLocaleString()}/oz)
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}