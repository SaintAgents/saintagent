import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Maximize2, RefreshCw, BarChart2, CandlestickChart, Building2 } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Bar, BarChart, Cell, ComposedChart, ReferenceLine } from 'recharts';

const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M'];
const CHART_TYPES = ['area', 'candle', 'manhattan'];

export default function PriceChart({ pair, theme = 'lime' }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('area');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(3247.82);
  const [priceChange, setPriceChange] = useState(2.4);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate mock price data with OHLC for candlestick
  const chartData = useMemo(() => {
    const points = timeframe === '1H' ? 60 : timeframe === '4H' ? 48 : timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
    const basePrice = 3200;
    const data = [];
    let price = basePrice;
    
    for (let i = 0; i < points; i++) {
      const open = price;
      const volatility = 15 + Math.random() * 25;
      const close = open + (Math.random() - 0.48) * volatility;
      const high = Math.max(open, close) + Math.random() * 10;
      const low = Math.min(open, close) - Math.random() * 10;
      
      data.push({
        time: i,
        price: close,
        open,
        close,
        high,
        low,
        volume: Math.random() * 1000000,
        isUp: close >= open
      });
      price = close;
    }
    return data;
  }, [timeframe, pair]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => prev + (Math.random() - 0.5) * 2);
      setPriceChange(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const themeColor = theme === 'lime' ? '#84cc16' : theme === 'blue' ? '#3b82f6' : '#10b981';
  const isPositive = priceChange >= 0;

  return (
    <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img 
                src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                alt="ETH" 
                className="w-8 h-8 rounded-full border-2 border-black"
              />
              <img 
                src="https://assets.coingecko.com/coins/images/6319/small/usdc.png" 
                alt="USDC" 
                className="w-8 h-8 rounded-full border-2 border-black"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{pair?.from || 'ETH'}/{pair?.to || 'USDC'}</span>
                <Badge variant="outline" className={`text-${theme}-400 border-${theme}-500/30 text-[10px]`}>
                  Base
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white font-mono text-lg">${currentPrice.toFixed(2)}</span>
                <span className={`flex items-center gap-0.5 ${isPositive ? `text-${theme}-400` : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 ${chartType === 'area' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <BarChart2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 ${chartType === 'candle' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setChartType('candle')}
              title="Candlestick Chart"
            >
              <CandlestickChart className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 ${chartType === 'manhattan' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setChartType('manhattan')}
              title="Manhattan Chart"
            >
              <Building2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-gray-400 hover:text-white"
              onClick={() => setIsExpanded(true)}
              title="Expand Chart"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 text-gray-400 hover:text-white ${isLoading ? 'animate-spin' : ''}`}
              onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 500); }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                timeframe === tf 
                  ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/30` 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${theme}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={themeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                orientation="right"
                tickFormatter={(val) => `$${val.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0f', 
                  border: `1px solid ${themeColor}30`,
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={() => ''}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={themeColor} 
                strokeWidth={2}
                fill={`url(#gradient-${theme})`}
              />
            </AreaChart>
          ) : chartType === 'candle' ? (
            <ComposedChart data={chartData}>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                orientation="right"
                tickFormatter={(val) => `$${val.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0f', 
                  border: `1px solid ${themeColor}30`,
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-black/90 border border-gray-700 rounded-lg p-2 text-xs">
                        <div className="text-gray-400">O: <span className="text-white">${d.open?.toFixed(2)}</span></div>
                        <div className="text-gray-400">H: <span className="text-white">${d.high?.toFixed(2)}</span></div>
                        <div className="text-gray-400">L: <span className="text-white">${d.low?.toFixed(2)}</span></div>
                        <div className="text-gray-400">C: <span className={d.isUp ? 'text-green-400' : 'text-red-400'}>${d.close?.toFixed(2)}</span></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Wick lines */}
              {chartData.map((entry, index) => (
                <ReferenceLine
                  key={`wick-${index}`}
                  segment={[
                    { x: entry.time, y: entry.low },
                    { x: entry.time, y: entry.high }
                  ]}
                  stroke={entry.isUp ? '#22c55e' : '#ef4444'}
                  strokeWidth={1}
                />
              ))}
              {/* Candle bodies */}
              <Bar dataKey="close" barSize={8}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isUp ? '#22c55e' : '#ef4444'}
                  />
                ))}
              </Bar>
            </ComposedChart>
          ) : (
            /* Manhattan Chart - 3D-style bar chart */
            <BarChart data={chartData} barGap={0}>
              <defs>
                <linearGradient id="manhattanGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                  <stop offset="50%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#166534" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="manhattanRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#991b1b" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                orientation="right"
                tickFormatter={(val) => `$${val.toFixed(0)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0f', 
                  border: `1px solid ${themeColor}30`,
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-black/90 border border-gray-700 rounded-lg p-2 text-xs">
                        <div className="text-gray-400">Price: <span className={d.isUp ? 'text-green-400' : 'text-red-400'}>${d.close?.toFixed(2)}</span></div>
                        <div className="text-gray-400">Change: <span className={d.isUp ? 'text-green-400' : 'text-red-400'}>{d.isUp ? '+' : ''}{(d.close - d.open).toFixed(2)}</span></div>
                        <div className="text-gray-400">Vol: <span className="text-white">{(d.volume / 1000).toFixed(0)}K</span></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="close" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`manhattan-${index}`}
                    fill={entry.isUp ? 'url(#manhattanGreen)' : 'url(#manhattanRed)'}
                    stroke={entry.isUp ? '#22c55e' : '#ef4444'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-3 border-t border-gray-800/50 grid grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-gray-500">24h High</div>
          <div className="text-white font-mono">${(currentPrice * 1.02).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">24h Low</div>
          <div className="text-white font-mono">${(currentPrice * 0.97).toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500">24h Vol</div>
          <div className="text-white font-mono">$45.2M</div>
        </div>
        <div>
          <div className="text-gray-500">Liquidity</div>
          <div className="text-white font-mono">$128.4M</div>
        </div>
      </div>
    </Card>
  );
}