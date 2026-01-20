import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Fuel, Clock, Zap } from 'lucide-react';

export default function StatsBar() {
  const [stats, setStats] = useState({
    ethPrice: 3247.82,
    ethChange: 2.4,
    gasPrice: 0.001,
    blockNumber: 28547892,
    tps: 45.2,
    tvl: '1.24B'
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        ethPrice: prev.ethPrice + (Math.random() - 0.5) * 5,
        gasPrice: Math.max(0.0005, prev.gasPrice + (Math.random() - 0.5) * 0.0002),
        blockNumber: prev.blockNumber + 1,
        tps: Math.max(10, prev.tps + (Math.random() - 0.5) * 5)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-20 bg-black/80 border-b border-lime-500/10 backdrop-blur-xl">
      <div className="max-w-[1800px] mx-auto px-4 py-1.5">
        <div className="flex items-center justify-between text-[10px] overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6">
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

            {/* Gas */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <Fuel className="w-3 h-3 text-orange-400" />
              <span className="text-gray-500">Gas:</span>
              <span className="text-white font-mono">{stats.gasPrice.toFixed(4)} Gwei</span>
            </div>

            {/* Block */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <Activity className="w-3 h-3 text-lime-400 animate-pulse" />
              <span className="text-gray-500">Block:</span>
              <span className="text-lime-400 font-mono">#{stats.blockNumber.toLocaleString()}</span>
            </div>

            {/* TPS */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-500">TPS:</span>
              <span className="text-white font-mono">{stats.tps.toFixed(1)}</span>
            </div>

            {/* TVL */}
            <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
              <span className="text-gray-500">TVL:</span>
              <span className="text-white font-mono">${stats.tvl}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-gray-500">
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