import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Maximize2, Minimize2, RefreshCw, BarChart2, CandlestickChart, Building2, X, Bell, Pencil, Minus, TrendingUp as LineIcon, Circle, Square, Trash2 } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Bar, BarChart, Cell, ComposedChart, ReferenceLine } from 'recharts';
import PriceAlertModal from './PriceAlertModal';

const TIMEFRAMES = ['1H', '4H', '1D', '1W', '1M', '6M'];
const CHART_TYPES = ['area', 'candle', 'manhattan'];
const DRAWING_TOOLS = [
  { id: 'line', icon: Minus, label: 'Trend Line' },
  { id: 'horizontal', icon: LineIcon, label: 'Horizontal Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' }
];

// Token base prices (approximate real values)
const TOKEN_PRICES = {
  BTC: { price: 67432, volatility: 200, change: 1.8 },
  ETH: { price: 3247, volatility: 25, change: 2.4 },
  SOL: { price: 142.5, volatility: 3, change: 5.2 },
  ARB: { price: 1.24, volatility: 0.03, change: -0.8 },
  USDC: { price: 1.0, volatility: 0.001, change: 0 },
  USDT: { price: 1.0, volatility: 0.001, change: 0 },
  MATIC: { price: 0.89, volatility: 0.02, change: 3.1 },
  AVAX: { price: 35.2, volatility: 0.8, change: 4.2 },
  LINK: { price: 14.5, volatility: 0.3, change: 1.5 },
  UNI: { price: 7.8, volatility: 0.15, change: -1.2 },
  AAVE: { price: 92, volatility: 2, change: 2.8 },
  OP: { price: 2.1, volatility: 0.05, change: 6.3 },
  BASE: { price: 0.45, volatility: 0.01, change: 8.5 },
};

export default function PriceChart({ pair, theme = 'lime', isLightTheme = false }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('area');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(3247.82);
  const [priceChange, setPriceChange] = useState(2.4);
  const [isExpanded, setIsExpanded] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [showDrawingTools, setShowDrawingTools] = useState(false);

  const clearDrawings = () => setDrawings([]);
  const toggleDrawingTool = (tool) => {
    setDrawingMode(prev => prev === tool ? null : tool);
  };

  // Get token info based on pair
  const tokenInfo = useMemo(() => {
    const fromToken = pair?.from?.toUpperCase() || 'ETH';
    return TOKEN_PRICES[fromToken] || TOKEN_PRICES.ETH;
  }, [pair]);

  // Update price when pair changes
  useEffect(() => {
    setCurrentPrice(tokenInfo.price * (1 + (Math.random() - 0.5) * 0.01));
    setPriceChange(tokenInfo.change + (Math.random() - 0.5) * 0.5);
  }, [pair, tokenInfo]);

  // Generate mock price data with OHLC for candlestick
  const chartData = useMemo(() => {
    const points = timeframe === '1H' ? 60 : timeframe === '4H' ? 48 : timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 180;
    const basePrice = tokenInfo.price;
    const volatility = tokenInfo.volatility;
    const data = [];
    let price = basePrice * (1 - 0.02); // Start slightly below current
    
    for (let i = 0; i < points; i++) {
      const open = price;
      const change = volatility * (Math.random() - 0.48);
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      
      data.push({
        time: i,
        price: close,
        open,
        close,
        high,
        low,
        volume: Math.random() * 1000000 * (basePrice / 100),
        isUp: close >= open
      });
      price = close;
    }
    return data;
  }, [timeframe, pair, tokenInfo]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => prev + (Math.random() - 0.5) * tokenInfo.volatility * 0.1);
      setPriceChange(prev => {
        const newChange = prev + (Math.random() - 0.5) * 0.05;
        return Math.max(-10, Math.min(10, newChange));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [tokenInfo]);

  const themeColor = theme === 'lime' ? '#84cc16' : theme === 'blue' ? '#3b82f6' : '#10b981';
  const isPositive = priceChange >= 0;

  // Render chart content (reusable for both normal and expanded views)
  const renderChart = (height = 280) => (
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
  );

  // Handle escape key to close expanded view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Expanded fullscreen modal
  if (isExpanded) {
    return (
      <div 
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col"
        onClick={(e) => {
          // Close when clicking the backdrop (outside the main content)
          if (e.target === e.currentTarget) {
            setIsExpanded(false);
          }
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img 
                src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" 
                alt="ETH" 
                className="w-10 h-10 rounded-full border-2 border-black"
              />
              <img 
                src="https://assets.coingecko.com/coins/images/6319/small/usdc.png" 
                alt="USDC" 
                className="w-10 h-10 rounded-full border-2 border-black"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{pair?.from || 'ETH'}/{pair?.to || 'USDC'}</span>
                <Badge variant="outline" className={`text-${theme}-400 border-${theme}-500/30`}>
                  Base
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-2xl">${currentPrice.toFixed(2)}</span>
                <span className={`flex items-center gap-0.5 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Buttons */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-9 w-9 ${chartType === 'area' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setChartType('area')}
            >
              <BarChart2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-9 w-9 ${chartType === 'candle' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setChartType('candle')}
            >
              <CandlestickChart className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-9 w-9 ${chartType === 'manhattan' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setChartType('manhattan')}
            >
              <Building2 className="w-5 h-5" />
            </Button>
            
            <div className="w-px h-6 bg-gray-700 mx-2" />
            
            {/* Timeframes */}
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  timeframe === tf 
                    ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/30` 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                {tf}
              </button>
            ))}
            
            <div className="w-px h-6 bg-gray-700 mx-2" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-gray-400 hover:text-white"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Chart */}
        <div className="flex-1 p-4">
          {renderChart()}
        </div>

        {/* Stats Footer */}
        <div className="px-6 py-4 border-t border-gray-800 grid grid-cols-4 gap-8 text-sm">
          <div>
            <div className="text-gray-500">24h High</div>
            <div className="text-white font-mono text-lg">${(currentPrice * 1.02).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">24h Low</div>
            <div className="text-white font-mono text-lg">${(currentPrice * 0.97).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">24h Volume</div>
            <div className="text-white font-mono text-lg">$45.2M</div>
          </div>
          <div>
            <div className="text-gray-500">Liquidity</div>
            <div className="text-white font-mono text-lg">$128.4M</div>
          </div>
        </div>
      </div>
    );
  }

  const cardBg = isLightTheme ? 'bg-white' : 'bg-black/40';
  const textPrimary = isLightTheme ? 'text-gray-900' : 'text-white';
  const textSecondary = isLightTheme ? 'text-gray-600' : 'text-gray-500';
  const borderColor = isLightTheme ? 'border-gray-200' : 'border-gray-800/50';

  return (
    <Card className={`${cardBg} border ${isLightTheme ? 'border-gray-200' : `border-${theme}-500/20`} backdrop-blur-xl overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${borderColor}`}>
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
                <span className={`font-bold ${textPrimary}`}>{pair?.from || 'ETH'}/{pair?.to || 'USDC'}</span>
                <Badge variant="outline" className={`text-${theme}-400 border-${theme}-500/30 text-[10px]`}>
                  Base
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`${textPrimary} font-mono text-lg`}>${currentPrice.toFixed(2)}</span>
                <span className={`flex items-center gap-0.5 ${isPositive ? `text-${theme}-400` : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Chart Type Buttons */}
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
            
            <div className={`w-px h-4 ${isLightTheme ? 'bg-gray-300' : 'bg-gray-700'}`} />
            
            {/* Drawing Tools */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 ${showDrawingTools ? `text-${theme}-400 bg-${theme}-500/20` : 'text-gray-400 hover:text-white'}`}
              onClick={() => setShowDrawingTools(!showDrawingTools)}
              title="Drawing Tools"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            
            {/* Price Alert */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20`}
              onClick={() => setAlertModalOpen(true)}
              title="Price Alerts"
            >
              <Bell className="w-4 h-4" />
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
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                timeframe === tf 
                  ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/30` 
                  : `${textSecondary} ${isLightTheme ? 'hover:text-gray-800 hover:bg-gray-100' : 'hover:text-gray-300 hover:bg-gray-800/50'}`
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Drawing Tools Panel */}
        {showDrawingTools && (
          <div className={`flex items-center gap-1 p-2 rounded-lg ${isLightTheme ? 'bg-gray-100' : 'bg-black/60'} border ${isLightTheme ? 'border-gray-200' : 'border-gray-800'}`}>
            {DRAWING_TOOLS.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${drawingMode === id ? `text-${theme}-400 bg-${theme}-500/20` : 'text-gray-400 hover:text-white'}`}
                onClick={() => toggleDrawingTool(id)}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
            <div className={`w-px h-4 ${isLightTheme ? 'bg-gray-300' : 'bg-gray-700'}`} />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300"
              onClick={clearDrawings}
              title="Clear Drawings"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {drawingMode && (
              <span className={`text-[10px] ${textSecondary} ml-2`}>
                Click on chart to draw
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[280px] p-2">
        {renderChart(280)}
      </div>

      {/* Stats Footer */}
      <div className={`px-4 py-3 border-t ${borderColor} grid grid-cols-4 gap-4 text-xs`}>
        <div>
          <div className={textSecondary}>24h High</div>
          <div className={`${textPrimary} font-mono`}>${(currentPrice * 1.02).toFixed(2)}</div>
        </div>
        <div>
          <div className={textSecondary}>24h Low</div>
          <div className={`${textPrimary} font-mono`}>${(currentPrice * 0.97).toFixed(2)}</div>
        </div>
        <div>
          <div className={textSecondary}>24h Vol</div>
          <div className={`${textPrimary} font-mono`}>$45.2M</div>
        </div>
        <div>
          <div className={textSecondary}>Liquidity</div>
          <div className={`${textPrimary} font-mono`}>$128.4M</div>
        </div>
      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        open={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        pair={pair}
        currentPrice={currentPrice}
        theme={theme}
      />
    </Card>
  );
}