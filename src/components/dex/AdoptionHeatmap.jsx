import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, Users, MapPin, TrendingUp, Activity, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const REGION_DATA = [
  { region: 'North America', users: 4280, wallets: 5120, volume: 2850000, growth: 18.5, color: '#22c55e' },
  { region: 'Europe', users: 3890, wallets: 4650, volume: 2100000, growth: 12.3, color: '#3b82f6' },
  { region: 'Asia Pacific', users: 2950, wallets: 3800, volume: 1890000, growth: 35.2, color: '#f59e0b' },
  { region: 'Middle East', users: 890, wallets: 1200, volume: 780000, growth: 42.8, color: '#8b5cf6' },
  { region: 'South America', users: 650, wallets: 890, volume: 420000, growth: 28.4, color: '#ec4899' },
  { region: 'Africa', users: 340, wallets: 480, volume: 180000, growth: 55.1, color: '#14b8a6' },
];

const COUNTRY_DATA = [
  { country: 'United States', code: 'US', users: 2850, volume: 1800000, flag: '🇺🇸' },
  { country: 'Germany', code: 'DE', users: 1240, volume: 650000, flag: '🇩🇪' },
  { country: 'Singapore', code: 'SG', users: 980, volume: 580000, flag: '🇸🇬' },
  { country: 'Switzerland', code: 'CH', users: 720, volume: 520000, flag: '🇨🇭' },
  { country: 'United Kingdom', code: 'GB', users: 680, volume: 420000, flag: '🇬🇧' },
  { country: 'Japan', code: 'JP', users: 620, volume: 380000, flag: '🇯🇵' },
  { country: 'Australia', code: 'AU', users: 540, volume: 320000, flag: '🇦🇺' },
  { country: 'Canada', code: 'CA', users: 480, volume: 280000, flag: '🇨🇦' },
];

// Simplified world map heatmap component
function WorldHeatmap({ data }) {
  return (
    <div className="relative h-[200px] bg-gradient-to-b from-black/60 to-black/40 rounded-lg border border-gray-800 overflow-hidden">
      {/* World map background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cpath fill='%2322c55e' d='M150,100 Q200,80 250,100 T350,90 T450,100 T550,85 T650,95 Q700,100 750,90 L750,200 Q700,190 650,200 T550,195 T450,200 T350,190 T250,200 T150,195 Z'/%3E%3Cpath fill='%233b82f6' d='M400,120 Q450,100 500,120 T600,110 L600,180 Q550,170 500,180 T400,175 Z'/%3E%3Cpath fill='%23f59e0b' d='M700,140 Q750,120 800,140 T900,130 L900,220 Q850,210 800,220 T700,215 Z'/%3E%3Cpath fill='%238b5cf6' d='M500,200 Q550,180 600,200 T700,190 L700,280 Q650,270 600,280 T500,275 Z'/%3E%3Cpath fill='%23ec4899' d='M200,250 Q250,230 300,250 T400,240 L400,330 Q350,320 300,330 T200,325 Z'/%3E%3Cpath fill='%2314b8a6' d='M450,280 Q500,260 550,280 T650,270 L650,360 Q600,350 550,360 T450,355 Z'/%3E%3C/svg%3E")`,
        backgroundSize: 'cover'
      }} />
      
      {/* Activity dots */}
      {data.map((region, idx) => {
        const positions = {
          'North America': { x: 15, y: 30 },
          'Europe': { x: 45, y: 25 },
          'Asia Pacific': { x: 75, y: 35 },
          'Middle East': { x: 55, y: 40 },
          'South America': { x: 25, y: 65 },
          'Africa': { x: 48, y: 55 },
        };
        const pos = positions[region.region] || { x: 50, y: 50 };
        const size = Math.min(40, Math.max(12, region.users / 150));
        
        return (
          <div
            key={idx}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Pulse animation */}
            <div 
              className="absolute rounded-full animate-ping opacity-30"
              style={{ 
                width: size * 2, 
                height: size * 2, 
                backgroundColor: region.color,
                left: -size/2,
                top: -size/2
              }}
            />
            {/* Main dot */}
            <div 
              className="rounded-full flex items-center justify-center relative z-10"
              style={{ 
                width: size, 
                height: size, 
                backgroundColor: region.color,
                boxShadow: `0 0 20px ${region.color}60`
              }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
              <div className="bg-black/90 border border-gray-700 rounded-lg p-2 text-xs whitespace-nowrap">
                <div className="font-semibold text-white">{region.region}</div>
                <div className="text-gray-400">{region.users.toLocaleString()} users</div>
                <div className="text-lime-400">+{region.growth}% growth</div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 text-[10px] text-gray-500">
        <span>Activity Level:</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="w-3 h-3 rounded-full bg-lime-600" />
          <div className="w-4 h-4 rounded-full bg-lime-400" />
        </div>
      </div>
    </div>
  );
}

export default function AdoptionHeatmap({ theme = 'lime' }) {
  const [totalUsers, setTotalUsers] = useState(13000);
  const [totalWallets, setTotalWallets] = useState(16140);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalUsers(prev => prev + Math.floor(Math.random() * 3));
      setTotalWallets(prev => prev + Math.floor(Math.random() * 5));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-black/40 border border-lime-500/20 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Users className="w-3 h-3" />
            Total Active Users
          </div>
          <div className="text-xl font-bold text-lime-400">{totalUsers.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400">+18.5% this month</div>
        </Card>
        <Card className="bg-black/40 border border-blue-500/20 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Zap className="w-3 h-3" />
            Unique Wallets
          </div>
          <div className="text-xl font-bold text-blue-400">{totalWallets.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400">+24.2% this month</div>
        </Card>
        <Card className="bg-black/40 border border-purple-500/20 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Globe className="w-3 h-3" />
            Countries
          </div>
          <div className="text-xl font-bold text-purple-400">47</div>
          <div className="text-[10px] text-emerald-400">+5 new this month</div>
        </Card>
        <Card className="bg-black/40 border border-amber-500/20 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <TrendingUp className="w-3 h-3" />
            Avg. Session
          </div>
          <div className="text-xl font-bold text-amber-400">12.4m</div>
          <div className="text-[10px] text-emerald-400">+2.1m vs last month</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* World Heatmap */}
        <Card className="bg-black/40 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-lime-400" />
                Geographic Distribution
              </h3>
              <p className="text-xs text-gray-400">User activity by region</p>
            </div>
            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40 text-[10px]">
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>
          <WorldHeatmap data={REGION_DATA} />
        </Card>

        {/* Top Countries */}
        <Card className="bg-black/40 border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                Top Countries
              </h3>
              <p className="text-xs text-gray-400">By active users</p>
            </div>
          </div>
          <div className="space-y-2">
            {COUNTRY_DATA.map((country, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-gray-800/50 hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <div className="text-sm text-white">{country.country}</div>
                    <div className="text-[10px] text-gray-500">{country.users.toLocaleString()} users</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-lime-400 font-mono">${(country.volume/1000000).toFixed(2)}M</div>
                  <div className="text-[10px] text-gray-500">volume</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Regional Breakdown Chart */}
      <Card className="bg-black/40 border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Regional Growth Rates</h3>
            <p className="text-xs text-gray-400">Month-over-month user growth by region</p>
          </div>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REGION_DATA} layout="vertical">
              <XAxis type="number" stroke="#4b5563" fontSize={10} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="region" stroke="#4b5563" fontSize={10} width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                formatter={(value) => [`${value}%`, 'Growth']}
              />
              <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                {REGION_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}