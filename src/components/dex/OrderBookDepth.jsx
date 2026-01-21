import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, TrendingDown, Activity, BarChart3, 
  ArrowUp, ArrowDown, Zap, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Generate realistic order book data
const generateOrderBook = (midPrice) => {
  const bids = [];
  const asks = [];
  
  for (let i = 0; i < 15; i++) {
    const bidPrice = midPrice - (i + 1) * 0.001 - Math.random() * 0.0005;
    const askPrice = midPrice + (i + 1) * 0.001 + Math.random() * 0.0005;
    const bidSize = Math.random() * 50000 + 10000;
    const askSize = Math.random() * 50000 + 10000;
    
    bids.push({
      price: bidPrice,
      size: bidSize,
      total: bids.reduce((acc, b) => acc + b.size, 0) + bidSize
    });
    
    asks.push({
      price: askPrice,
      size: askSize,
      total: asks.reduce((acc, a) => acc + a.size, 0) + askSize
    });
  }
  
  return { bids, asks };
};

// Generate depth chart data
const generateDepthData = (midPrice, bids, asks) => {
  const data = [];
  
  // Bids (reverse order for chart)
  [...bids].reverse().forEach(bid => {
    data.push({
      price: bid.price,
      bidDepth: bid.total,
      askDepth: 0
    });
  });
  
  // Mid point
  data.push({
    price: midPrice,
    bidDepth: 0,
    askDepth: 0,
    isMid: true
  });
  
  // Asks
  asks.forEach(ask => {
    data.push({
      price: ask.price,
      bidDepth: 0,
      askDepth: ask.total
    });
  });
  
  return data;
};

const PAIRS = [
  { symbol: 'GGG/USDT', price: 145.23, change: 2.45, high: 148.50, low: 142.10, volume: 4250000 },
  { symbol: 'GGR/GGG', price: 0.0234, change: -1.23, high: 0.0245, low: 0.0228, volume: 1890000 },
  { symbol: 'GAU/GGG', price: 0.0089, change: 0.87, high: 0.0092, low: 0.0086, volume: 980000 },
];

const RECENT_TRADES = [
  { price: 145.25, size: 1250, side: 'buy', time: '12:45:32' },
  { price: 145.23, size: 890, side: 'sell', time: '12:45:30' },
  { price: 145.24, size: 2100, side: 'buy', time: '12:45:28' },
  { price: 145.22, size: 560, side: 'sell', time: '12:45:25' },
  { price: 145.26, size: 3400, side: 'buy', time: '12:45:22' },
  { price: 145.21, size: 780, side: 'sell', time: '12:45:19' },
  { price: 145.23, size: 1890, side: 'buy', time: '12:45:15' },
  { price: 145.20, size: 450, side: 'sell', time: '12:45:12' },
];

function OrderRow({ order, type, maxTotal }) {
  const fillPercent = (order.total / maxTotal) * 100;
  const isBid = type === 'bid';
  
  return (
    <div className="relative flex items-center justify-between py-1 px-2 text-xs font-mono hover:bg-white/5">
      {/* Fill bar */}
      <div 
        className={`absolute top-0 bottom-0 ${isBid ? 'right-0 bg-emerald-500/10' : 'left-0 bg-red-500/10'}`}
        style={{ width: `${fillPercent}%` }}
      />
      <span className={`relative z-10 ${isBid ? 'text-emerald-400' : 'text-red-400'}`}>
        {order.price.toFixed(4)}
      </span>
      <span className="relative z-10 text-gray-300">
        {order.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
      <span className="relative z-10 text-gray-500">
        {order.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
    </div>
  );
}

export default function OrderBookDepth({ theme = 'lime' }) {
  const [selectedPair, setSelectedPair] = useState(PAIRS[0]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [depthData, setDepthData] = useState([]);
  const [recentTrades, setRecentTrades] = useState(RECENT_TRADES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshOrderBook = () => {
    setIsRefreshing(true);
    const newBook = generateOrderBook(selectedPair.price);
    setOrderBook(newBook);
    setDepthData(generateDepthData(selectedPair.price, newBook.bids, newBook.asks));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    refreshOrderBook();
    const interval = setInterval(refreshOrderBook, 2000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Simulate new trades
  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade = {
        price: selectedPair.price + (Math.random() - 0.5) * 0.1,
        size: Math.floor(Math.random() * 3000 + 200),
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 7)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  const maxBidTotal = Math.max(...orderBook.bids.map(b => b.total), 1);
  const maxAskTotal = Math.max(...orderBook.asks.map(a => a.total), 1);
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  return (
    <div className="space-y-4">
      {/* Pair Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PAIRS.map((pair) => (
          <Button
            key={pair.symbol}
            variant={selectedPair.symbol === pair.symbol ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPair(pair)}
            className={selectedPair.symbol === pair.symbol 
              ? 'bg-lime-500/20 text-lime-400 border-lime-500/40' 
              : 'border-gray-700 text-gray-400'
            }
          >
            <span className="font-semibold">{pair.symbol}</span>
            <span className={`ml-2 ${pair.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pair.change >= 0 ? '+' : ''}{pair.change}%
            </span>
          </Button>
        ))}
      </div>

      {/* Price Header */}
      <Card className="bg-black/40 border border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              ${selectedPair.price.toFixed(4)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${selectedPair.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {selectedPair.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change}%
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-gray-500 text-xs">24h High</div>
              <div className="text-emerald-400 font-mono">${selectedPair.high.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">24h Low</div>
              <div className="text-red-400 font-mono">${selectedPair.low.toFixed(4)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">24h Volume</div>
              <div className="text-white font-mono">${(selectedPair.volume/1000000).toFixed(2)}M</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Book */}
        <Card className="lg:col-span-2 bg-black/40 border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-lime-400" />
              Order Book
            </h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40 text-[10px]">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={refreshOrderBook}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-800">
            {/* Bids */}
            <div>
              <div className="flex justify-between px-2 py-1 text-[10px] text-gray-500 border-b border-gray-800 bg-emerald-500/5">
                <span>Price (USDT)</span>
                <span>Size (GGG)</span>
                <span>Total</span>
              </div>
              <ScrollArea className="h-[280px]">
                {orderBook.bids.map((bid, idx) => (
                  <OrderRow key={idx} order={bid} type="bid" maxTotal={maxTotal} />
                ))}
              </ScrollArea>
            </div>

            {/* Asks */}
            <div>
              <div className="flex justify-between px-2 py-1 text-[10px] text-gray-500 border-b border-gray-800 bg-red-500/5">
                <span>Price (USDT)</span>
                <span>Size (GGG)</span>
                <span>Total</span>
              </div>
              <ScrollArea className="h-[280px]">
                {orderBook.asks.map((ask, idx) => (
                  <OrderRow key={idx} order={ask} type="ask" maxTotal={maxTotal} />
                ))}
              </ScrollArea>
            </div>
          </div>

          {/* Spread */}
          <div className="p-2 border-t border-gray-800 bg-black/60 flex items-center justify-center gap-4 text-xs">
            <span className="text-gray-500">Spread:</span>
            <span className="text-white font-mono">
              ${(orderBook.asks[0]?.price - orderBook.bids[0]?.price || 0).toFixed(4)}
            </span>
            <span className="text-gray-500">
              ({((orderBook.asks[0]?.price - orderBook.bids[0]?.price) / selectedPair.price * 100 || 0).toFixed(3)}%)
            </span>
          </div>
        </Card>

        {/* Recent Trades */}
        <Card className="bg-black/40 border border-gray-800">
          <div className="p-3 border-b border-gray-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Recent Trades
            </h3>
          </div>
          <div className="flex justify-between px-3 py-1 text-[10px] text-gray-500 border-b border-gray-800">
            <span>Price</span>
            <span>Size</span>
            <span>Time</span>
          </div>
          <ScrollArea className="h-[280px]">
            {recentTrades.map((trade, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-1.5 text-xs font-mono hover:bg-white/5 border-b border-gray-800/50">
                <div className={`flex items-center gap-1 ${trade.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trade.side === 'buy' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {trade.price.toFixed(2)}
                </div>
                <span className="text-gray-300">{trade.size.toLocaleString()}</span>
                <span className="text-gray-500">{trade.time}</span>
              </div>
            ))}
          </ScrollArea>
        </Card>
      </div>

      {/* Depth Chart */}
      <Card className="bg-black/40 border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Market Depth</h3>
            <p className="text-xs text-gray-400">Cumulative order book visualization</p>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={depthData}>
              <defs>
                <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="price" 
                stroke="#4b5563" 
                fontSize={10} 
                tickFormatter={(v) => `$${v.toFixed(2)}`}
              />
              <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value, name) => [value.toLocaleString(), name === 'bidDepth' ? 'Bids' : 'Asks']}
              />
              <ReferenceLine x={selectedPair.price} stroke="#84cc16" strokeDasharray="3 3" />
              <Area type="stepAfter" dataKey="bidDepth" stroke="#22c55e" fill="url(#bidGradient)" />
              <Area type="stepAfter" dataKey="askDepth" stroke="#ef4444" fill="url(#askGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}