import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Activity, Users, Wallet, Globe,
  BarChart3, PieChart, Zap, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

// Generate realistic TVL data
const generateTVLData = () => {
  const data = [];
  let tvl = 28500000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    tvl += (Math.random() - 0.4) * 500000;
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tvl: Math.max(25000000, tvl),
      staking: tvl * 0.65,
      liquidity: tvl * 0.35
    });
  }
  return data;
};

const generateVolumeData = () => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      hour: `${i}h`,
      volume: Math.random() * 2000000 + 500000,
      trades: Math.floor(Math.random() * 500 + 100)
    });
  }
  return data.reverse();
};

const POOL_DISTRIBUTION = [
  { name: 'GGG Flex', value: 2400000, color: '#22c55e' },
  { name: 'GGG Growth', value: 5800000, color: '#3b82f6' },
  { name: 'GGG Elite', value: 8200000, color: '#8b5cf6' },
  { name: 'GGG Diamond', value: 12400000, color: '#f59e0b' },
  { name: 'GGG-GGR LP', value: 3200000, color: '#ec4899' },
];

const PAIR_VOLUMES = [
  { pair: 'GGG/USDT', volume: 4250000, change: 12.5, trades: 1847 },
  { pair: 'GGR/GGG', volume: 1890000, change: -3.2, trades: 892 },
  { pair: 'GAU/GGG', volume: 980000, change: 8.7, trades: 456 },
  { pair: 'GGK/GGG', volume: 520000, change: 24.1, trades: 234 },
  { pair: 'GGT/GGG', volume: 340000, change: -1.8, trades: 178 },
];

function StatCard({ title, value, change, icon: Icon, color = 'lime', prefix = '', suffix = '' }) {
  const isPositive = change >= 0;
  return (
    <Card className="bg-black/40 border border-gray-800 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-1">{title}</div>
          <div className={`text-2xl font-bold text-${color}-400`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change).toFixed(1)}% (24h)
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
      </div>
    </Card>
  );
}

export default function AnalyticsDashboard({ theme = 'lime' }) {
  const [tvlData, setTvlData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [liveStats, setLiveStats] = useState({
    tvl: 32000000,
    volume24h: 7980000,
    trades24h: 3607,
    activeUsers: 2847,
    uniqueWallets: 12458,
    avgTradeSize: 2212
  });

  useEffect(() => {
    setTvlData(generateTVLData());
    setVolumeData(generateVolumeData());

    // Simulate live updates
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        tvl: prev.tvl + (Math.random() - 0.5) * 50000,
        volume24h: prev.volume24h + Math.random() * 10000,
        trades24h: prev.trades24h + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5 - 2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard 
          title="Total Value Locked" 
          value={`$${(liveStats.tvl / 1000000).toFixed(2)}M`}
          change={5.8}
          icon={TrendingUp}
          color="lime"
        />
        <StatCard 
          title="24h Volume" 
          value={`$${(liveStats.volume24h / 1000000).toFixed(2)}M`}
          change={12.3}
          icon={BarChart3}
          color="blue"
        />
        <StatCard 
          title="24h Trades" 
          value={liveStats.trades24h}
          change={8.7}
          icon={Activity}
          color="purple"
        />
        <StatCard 
          title="Active Users" 
          value={liveStats.activeUsers}
          change={3.2}
          icon={Users}
          color="emerald"
        />
        <StatCard 
          title="Unique Wallets" 
          value={liveStats.uniqueWallets}
          change={15.4}
          icon={Wallet}
          color="amber"
        />
        <StatCard 
          title="Avg Trade Size" 
          value={`$${liveStats.avgTradeSize}`}
          change={-2.1}
          icon={Zap}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* TVL Chart */}
        <Card className="lg:col-span-2 bg-black/40 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Total Value Locked</h3>
              <p className="text-xs text-gray-400">30-day TVL trend</p>
            </div>
            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tvlData}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [`$${(value/1000000).toFixed(2)}M`, 'TVL']}
                />
                <Area type="monotone" dataKey="tvl" stroke="#84cc16" fill="url(#tvlGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pool Distribution */}
        <Card className="bg-black/40 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Pool Distribution</h3>
              <p className="text-xs text-gray-400">TVL by pool</p>
            </div>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={POOL_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {POOL_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [`$${(value/1000000).toFixed(2)}M`, '']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {POOL_DISTRIBUTION.map((pool, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pool.color }} />
                  <span className="text-gray-400">{pool.name}</span>
                </div>
                <span className="text-white font-mono">${(pool.value/1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Volume & Pairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 24h Volume Chart */}
        <Card className="bg-black/40 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">24h Volume</h3>
              <p className="text-xs text-gray-400">Hourly trading volume</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <XAxis dataKey="hour" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Trading Pairs */}
        <Card className="bg-black/40 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Top Trading Pairs</h3>
              <p className="text-xs text-gray-400">24h volume leaders</p>
            </div>
          </div>
          <div className="space-y-2">
            {PAIR_VOLUMES.map((pair, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-gray-800/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-4">#{idx + 1}</span>
                  <span className="text-white font-medium text-sm">{pair.pair}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-white font-mono">${(pair.volume/1000000).toFixed(2)}M</div>
                    <div className="text-[10px] text-gray-500">{pair.trades} trades</div>
                  </div>
                  <Badge className={`${pair.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} text-[10px]`}>
                    {pair.change >= 0 ? '+' : ''}{pair.change}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}