import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Flame, ExternalLink } from 'lucide-react';
import { TRENDING_PAIRS } from './dexUtils';

export default function TrendingPairs() {
  return (
    <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-medium text-white">Trending on Base</h3>
      </div>

      <div className="space-y-2">
        {TRENDING_PAIRS.map((pair, idx) => (
          <div 
            key={pair.pair}
            className="flex items-center justify-between p-3 rounded-lg bg-black/30 hover:bg-lime-500/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-lime-500/20 flex items-center justify-center text-xs font-bold text-lime-400">
                {idx + 1}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{pair.pair}</div>
                <div className="text-xs text-gray-500">Vol: ${pair.volume}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-white">${pair.price}</div>
              <div className={`flex items-center gap-1 text-xs ${
                pair.change >= 0 ? 'text-lime-400' : 'text-red-400'
              }`}>
                {pair.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(pair.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm text-lime-400 hover:text-lime-300 transition-colors">
        <ExternalLink className="w-4 h-4" />
        View on GeckoTerminal
      </button>
    </Card>
  );
}