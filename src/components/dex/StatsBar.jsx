import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Fuel, Clock, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StatsBar() {
  const [stats, setStats] = useState({
    ethPrice: 3247.82,
    ethChange: 2.4,
    gasGwei: 45,
    gasUsd: 2.85, // ETH gas cost in USD for typical transaction
    silenceCost: 0.03, // $SILENCE fixed cost
    blockNumber: 28547892,
    tps: 45.2,
    tvl: '1.24B'
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newGasGwei = Math.max(15, Math.min(120, stats.gasGwei + (Math.random() - 0.5) * 10));
      // Calculate ETH gas cost: (gasGwei / 1e9) * 21000 gas units * ETH price
      const ethPrice = stats.ethPrice + (Math.random() - 0.5) * 5;
      const gasUsd = (newGasGwei / 1000000000) * 21000 * ethPrice;
      
      setStats(prev => ({
        ...prev,
        ethPrice: ethPrice,
        gasGwei: newGasGwei,
        gasUsd: gasUsd,
        blockNumber: prev.blockNumber + 1,
        tps: Math.max(10, prev.tps + (Math.random() - 0.5) * 5)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.gasGwei, stats.ethPrice]);

  // Calculate savings percentage
  const savingsPercent = ((stats.gasUsd - stats.silenceCost) / stats.gasUsd * 100).toFixed(0);

  return (
    <div className="relative z-20 bg-black/80 border-b border-lime-500/10 backdrop-blur-xl">
      <div className="max-w-[1800px] mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between text-[10px] overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4 lg:gap-6">
            {/* ETH Price */}
            <div className="flex items-center gap-2 shrink-0">
              <img 
                src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                alt="ETH" 
                className="w-4 h-4"
              />
              <span className="text-white font-mono">${stats.ethPrice.toFixed(2)}</span>
              <span className={`flex items-center gap-0.5 ${stats.ethChange >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                {stats.ethChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stats.ethChange).toFixed(1)}%
              </span>
            </div>

            {/* ETH Gas with USD Cost */}
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30">
              <Fuel className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 font-medium">ETH Gas:</span>
              <span className="text-white font-mono">{stats.gasGwei.toFixed(0)} Gwei</span>
              <span className="text-orange-300 font-mono">(${stats.gasUsd.toFixed(2)})</span>
            </div>

            {/* VS Indicator */}
            <span className="text-gray-600 font-bold shrink-0 hidden sm:block">vs</span>

            {/* $SILENCE Cost */}
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/30">
              <Shield className="w-3 h-3 text-lime-400" />
              <span className="text-lime-400 font-medium">$SILENCE:</span>
              <span className="text-white font-mono">~${stats.silenceCost.toFixed(2)}</span>
              <Badge className="bg-lime-500/20 text-lime-300 border-lime-500/40 text-[8px] px-1 py-0 h-4">
                {savingsPercent}% LESS
              </Badge>
            </div>

            {/* Block */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0 hidden md:flex">
              <Activity className="w-3 h-3 text-lime-400 animate-pulse" />
              <span className="text-gray-500">Block:</span>
              <span className="text-lime-400 font-mono">#{stats.blockNumber.toLocaleString()}</span>
            </div>

            {/* TPS */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0 hidden lg:flex">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-500">TPS:</span>
              <span className="text-white font-mono">{stats.tps.toFixed(1)}</span>
            </div>

            {/* TVL */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0 hidden lg:flex">
              <span className="text-gray-500">TVL:</span>
              <span className="text-white font-mono">${stats.tvl}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-gray-500 hidden sm:flex">
              <Clock className="w-3 h-3" />
              <span>Latency: <span className="text-lime-400">42ms</span></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-lime-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}