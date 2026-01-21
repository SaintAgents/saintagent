import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, TrendingUp, Clock, Coins, Lock, Users, Gift,
  ArrowRight, AlertTriangle, CheckCircle, Wallet, Copy,
  RefreshCw, Sparkles, Percent, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// Demo staking pools with varying lock periods and APY
const STAKING_POOLS = [
  { 
    id: 'ggg-30', 
    name: 'GGG Flex', 
    token: 'GGG', 
    lockDays: 30, 
    baseApy: 8, 
    tvl: 2400000, 
    stakers: 1247,
    minStake: 100,
    maxStake: 100000,
    referralBonus: 5,
    riskLevel: 'low',
    description: 'Flexible staking with 30-day lock'
  },
  { 
    id: 'ggg-90', 
    name: 'GGG Growth', 
    token: 'GGG', 
    lockDays: 90, 
    baseApy: 15, 
    tvl: 5800000, 
    stakers: 892,
    minStake: 500,
    maxStake: 250000,
    referralBonus: 8,
    riskLevel: 'low',
    description: 'Higher yields with 90-day commitment'
  },
  { 
    id: 'ggg-180', 
    name: 'GGG Elite', 
    token: 'GGG', 
    lockDays: 180, 
    baseApy: 22, 
    tvl: 8200000, 
    stakers: 456,
    minStake: 1000,
    maxStake: 500000,
    referralBonus: 12,
    riskLevel: 'medium',
    description: 'Premium returns for committed stakers'
  },
  { 
    id: 'ggg-365', 
    name: 'GGG Diamond', 
    token: 'GGG', 
    lockDays: 365, 
    baseApy: 35, 
    tvl: 12400000, 
    stakers: 234,
    minStake: 5000,
    maxStake: 1000000,
    referralBonus: 20,
    riskLevel: 'medium',
    description: 'Maximum APY for annual stakers'
  },
];

// Demo user stakes
const DEMO_USER_STAKES = [
  {
    id: 1,
    poolId: 'ggg-90',
    poolName: 'GGG Growth',
    amountStaked: 5000,
    startDate: '2024-11-15',
    endDate: '2025-02-13',
    apy: 15,
    earnedRewards: 187.50,
    claimedRewards: 0,
    status: 'active',
    daysRemaining: 45,
    progress: 50
  },
  {
    id: 2,
    poolId: 'ggg-30',
    poolName: 'GGG Flex',
    amountStaked: 2000,
    startDate: '2024-12-20',
    endDate: '2025-01-19',
    apy: 8,
    earnedRewards: 13.33,
    claimedRewards: 0,
    status: 'active',
    daysRemaining: 5,
    progress: 83
  }
];

export default function StakingDashboard({ theme = 'lime' }) {
  const [activeTab, setActiveTab] = useState('pools');
  const [selectedPool, setSelectedPool] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const userReferralCode = 'SAINT-' + Math.random().toString(36).substr(2, 8).toUpperCase();

  // Calculate totals
  const totalStaked = DEMO_USER_STAKES.reduce((sum, s) => sum + s.amountStaked, 0);
  const totalEarned = DEMO_USER_STAKES.reduce((sum, s) => sum + s.earnedRewards, 0);
  const avgApy = DEMO_USER_STAKES.length > 0 
    ? DEMO_USER_STAKES.reduce((sum, s) => sum + s.apy, 0) / DEMO_USER_STAKES.length 
    : 0;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    toast.success('Referral code copied!');
  };

  const handleStake = () => {
    if (!selectedPool || !stakeAmount) return;
    toast.success(`Staked ${stakeAmount} GGG in ${selectedPool.name} (Demo)`);
    setStakeAmount('');
    setSelectedPool(null);
  };

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={`bg-black/40 border border-${theme}-500/20 p-4`}>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Wallet className="w-3 h-3" />
            Total Staked
          </div>
          <div className={`text-xl font-bold text-${theme}-400 font-mono`}>
            {totalStaked.toLocaleString()} GGG
          </div>
          <div className="text-xs text-gray-500">${(totalStaked * 145).toLocaleString()}</div>
        </Card>

        <Card className={`bg-black/40 border border-${theme}-500/20 p-4`}>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Gift className="w-3 h-3" />
            Earned Rewards
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            +{totalEarned.toFixed(2)} GGG
          </div>
          <div className="text-xs text-gray-500">${(totalEarned * 145).toFixed(2)}</div>
        </Card>

        <Card className={`bg-black/40 border border-${theme}-500/20 p-4`}>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Percent className="w-3 h-3" />
            Avg APY
          </div>
          <div className="text-xl font-bold text-amber-400">
            {avgApy.toFixed(1)}%
          </div>
        </Card>

        <Card className={`bg-black/40 border border-${theme}-500/20 p-4`}>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Users className="w-3 h-3" />
            Active Stakes
          </div>
          <div className="text-xl font-bold text-white">
            {DEMO_USER_STAKES.filter(s => s.status === 'active').length}
          </div>
        </Card>
      </div>

      {/* Referral Card */}
      <Card className={`bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Earn More with Referrals</div>
              <div className="text-xs text-gray-400">Get +5% bonus APY when friends stake using your code</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-black/40 border border-purple-500/30 font-mono text-purple-300 text-sm">
              {userReferralCode}
            </div>
            <Button size="sm" variant="ghost" onClick={copyReferralCode} className="text-purple-400">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`bg-black/60 border border-${theme}-500/20`}>
          <TabsTrigger value="pools" className="text-xs">Available Pools</TabsTrigger>
          <TabsTrigger value="mystakes" className="text-xs">My Stakes</TabsTrigger>
          <TabsTrigger value="rewards" className="text-xs">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="mt-4 space-y-3">
          {STAKING_POOLS.map((pool) => (
            <Card 
              key={pool.id}
              className={`bg-black/40 border ${selectedPool?.id === pool.id ? `border-${theme}-500` : 'border-gray-800'} p-4 cursor-pointer hover:border-gray-700 transition-all`}
              onClick={() => setSelectedPool(pool)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${theme}-400 to-emerald-500 flex items-center justify-center`}>
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {pool.name}
                      <Badge className={`text-[10px] ${pool.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {pool.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">{pool.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{pool.baseApy}%</div>
                  <div className="text-xs text-gray-500">APY</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-gray-500">Lock Period</div>
                  <div className="text-white font-medium">{pool.lockDays} days</div>
                </div>
                <div>
                  <div className="text-gray-500">TVL</div>
                  <div className="text-white font-medium">${(pool.tvl / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-gray-500">Stakers</div>
                  <div className="text-white font-medium">{pool.stakers.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Referral Bonus</div>
                  <div className="text-purple-400 font-medium">+{pool.referralBonus}%</div>
                </div>
              </div>

              {selectedPool?.id === pool.id && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Stake Amount</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          className="bg-black/60 border-gray-700 text-white pr-16"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`absolute right-1 top-1/2 -translate-y-1/2 text-${theme}-400 text-xs h-7`}
                          onClick={() => setStakeAmount('10000')}
                        >
                          MAX
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: {pool.minStake} GGG • Max: {pool.maxStake.toLocaleString()} GGG
                      </div>
                    </div>
                    <div className="w-40">
                      <label className="text-xs text-gray-400 mb-1 block">Referral Code (Optional)</label>
                      <Input
                        placeholder="SAINT-XXXX"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="bg-black/60 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  {stakeAmount && (
                    <div className={`p-3 rounded-lg bg-${theme}-500/10 border border-${theme}-500/30`}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Est. Monthly Earnings</span>
                        <span className={`text-${theme}-400 font-semibold`}>
                          +{(parseFloat(stakeAmount || 0) * (pool.baseApy / 100) / 12).toFixed(2)} GGG
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Est. Annual Earnings</span>
                        <span className="text-emerald-400 font-semibold">
                          +{(parseFloat(stakeAmount || 0) * (pool.baseApy / 100)).toFixed(2)} GGG
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className={`w-full bg-gradient-to-r from-${theme}-500 to-emerald-500 text-black font-semibold`}
                    disabled={!stakeAmount || parseFloat(stakeAmount) < pool.minStake}
                    onClick={handleStake}
                  >
                    Stake GGG
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mystakes" className="mt-4 space-y-3">
          {DEMO_USER_STAKES.map((stake) => (
            <Card key={stake.id} className={`bg-black/40 border border-${theme}-500/20 p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{stake.poolName}</div>
                  <div className="text-xs text-gray-400">
                    Started {stake.startDate} • Ends {stake.endDate}
                  </div>
                </div>
                <Badge className={stake.status === 'active' ? `bg-${theme}-500/20 text-${theme}-400` : 'bg-gray-500/20 text-gray-400'}>
                  {stake.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Staked</div>
                  <div className={`font-mono text-${theme}-400`}>{stake.amountStaked.toLocaleString()} GGG</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Earned</div>
                  <div className="font-mono text-emerald-400">+{stake.earnedRewards.toFixed(2)} GGG</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">APY</div>
                  <div className="font-mono text-amber-400">{stake.apy}%</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Lock Progress</span>
                  <span className="text-white">{stake.daysRemaining} days remaining</span>
                </div>
                <Progress value={stake.progress} className="h-2" />
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-400">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Compound
                </Button>
                <Button 
                  size="sm" 
                  className={`flex-1 bg-${theme}-500/20 text-${theme}-400 hover:bg-${theme}-500/30`}
                  disabled={stake.daysRemaining > 0}
                >
                  <Gift className="w-3 h-3 mr-1" />
                  Claim
                </Button>
              </div>
            </Card>
          ))}

          {DEMO_USER_STAKES.length === 0 && (
            <Card className={`bg-black/40 border border-${theme}-500/20 p-8 text-center`}>
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400">No active stakes</div>
              <Button 
                className={`mt-3 bg-${theme}-500/20 text-${theme}-400`}
                onClick={() => setActiveTab('pools')}
              >
                Explore Pools
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="mt-4 space-y-4">
          <Card className={`bg-gradient-to-br from-${theme}-500/10 to-emerald-500/10 border border-${theme}-500/30 p-6`}>
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400 mb-1">Total Claimable Rewards</div>
              <div className="text-3xl font-bold text-emerald-400 font-mono">
                {totalEarned.toFixed(2)} GGG
              </div>
              <div className="text-sm text-gray-500">${(totalEarned * 145).toFixed(2)} USD</div>
            </div>
            <Button className={`w-full bg-gradient-to-r from-${theme}-500 to-emerald-500 text-black font-semibold`}>
              <Gift className="w-4 h-4 mr-2" />
              Claim All Rewards
            </Button>
          </Card>

          {/* Referral Rewards */}
          <Card className={`bg-black/40 border border-purple-500/20 p-4`}>
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold text-white">Referral Rewards</div>
                <div className="text-xs text-gray-400">Earnings from your referrals</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-400">3</div>
                <div className="text-xs text-gray-500">Active Referrals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">+42.50</div>
                <div className="text-xs text-gray-500">GGG Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">15,000</div>
                <div className="text-xs text-gray-500">GGG Staked by Refs</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}