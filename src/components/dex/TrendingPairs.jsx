import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, ExternalLink, RefreshCw, Sparkles, Activity } from 'lucide-react';
import { TRENDING_PAIRS } from './dexUtils';

export default function TrendingPairs({ onPairSelect, theme = 'lime' }) {
  const [pairs, setPairs] = useState(TRENDING_PAIRS);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('trending'); // trending, gainers, volume

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prev => prev.map(p => ({
        ...p,
        price: p.price * (1 + (Math.random() - 0.5) * 0.002),
        change: p.change + (Math.random() - 0.5) * 0.1
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setRefreshing(false);
  };

  const sortedPairs = [...pairs].sort((a, b) => {
    if (filter === 'gainers') return b.change - a.change;
    if (filter === 'volume') return parseFloat(b.volume) - parseFloat(a.volume);
    return 0;
  });
  return (
    <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-medium text-white">Trending on Base</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 text-gray-400 hover:text-white ${refreshing ? 'animate-spin' : ''}`}
            onClick={handleRefresh}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {[
            { key: 'trending', icon: Flame, label: 'Hot' },
            { key: 'gainers', icon: TrendingUp, label: 'Gainers' },
            { key: 'volume', icon: Activity, label: 'Volume' }
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                filter === key
                  ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/30`
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pairs List */}
      <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
        {sortedPairs.map((pair, idx) => (
          <button 
            key={pair.pair}
            onClick={() => {
              const [from, to] = pair.pair.split('/');
              onPairSelect?.({ from, to });
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg bg-black/30 hover:bg-${theme}-500/10 transition-colors group`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full bg-${theme}-500/20 flex items-center justify-center text-[10px] font-bold text-${theme}-400`}>
                {idx + 1}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-white group-hover:text-${theme}-400 transition-colors">
                  {pair.pair}
                </div>
                <div className="text-[10px] text-gray-500">Vol: ${pair.volume}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-white">
                ${typeof pair.price === 'number' ? pair.price.toFixed(pair.price < 1 ? 6 : 2) : pair.price}
              </div>
              <div className={`flex items-center justify-end gap-0.5 text-[10px] ${
                pair.change >= 0 ? `text-${theme}-400` : 'text-red-400'
              }`}>
                {pair.change >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {Math.abs(pair.change).toFixed(1)}%
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`w-full text-xs text-${theme}-400 hover:text-${theme}-300 h-8`}
          onClick={() => window.open('https://www.geckoterminal.com/base/pools', '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-1.5" />
          View on GeckoTerminal
        </Button>

        {/* New Pairs Alert */}
        <div className={`mt-2 p-2 rounded-lg bg-${theme}-500/10 border border-${theme}-500/20`}>
          <div className="flex items-center gap-2 text-[10px]">
            <Sparkles className={`w-3 h-3 text-${theme}-400`} />
            <span className="text-gray-400">New pair:</span>
            <span className={`text-${theme}-400 font-medium`}>BRETT/ETH</span>
            <Badge variant="outline" className={`text-[8px] text-${theme}-400 border-${theme}-500/30 px-1`}>
              +142%
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}