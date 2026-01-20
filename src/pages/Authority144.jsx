import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Globe, 
  Coins, 
  Users, 
  TrendingUp, 
  Lock, 
  Zap, 
  Crown,
  Building,
  BarChart3,
  ArrowUpRight,
  ExternalLink,
  CheckCircle,
  Star,
  Target,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';
import BackButton from '@/components/hud/BackButton';

const TREASURY_STATS = [
  { label: 'Total Supply', value: '1T GGT', icon: Coins, color: 'amber' },
  { label: 'Circulating', value: '144M GGT', icon: TrendingUp, color: 'emerald' },
  { label: 'Holders', value: '254+', icon: Users, color: 'violet' },
  { label: 'Backed Assets', value: '$2.4B', icon: Building, color: 'blue' },
];

const AUTHORITY_PILLARS = [
  {
    title: 'Sovereign Governance',
    description: 'Decentralized decision-making through the 144,000 verified leaders network.',
    icon: Crown,
    color: 'from-amber-500 to-yellow-600',
  },
  {
    title: 'Treasury Security',
    description: 'Multi-signature vaults with quantum-resistant encryption protocols.',
    icon: Shield,
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Global Distribution',
    description: 'Equitable resource allocation across all bioregions and communities.',
    icon: Globe,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Value Alignment',
    description: 'Gold-backed digital assets ensuring real-world stability.',
    icon: Coins,
    color: 'from-blue-500 to-cyan-600',
  },
];

const GOVERNANCE_TIERS = [
  { tier: 'Observer', requirement: '0 GGG', voting: 'View Only', benefits: 'Access to public proposals' },
  { tier: 'Delegate', requirement: '100 GGG', voting: 'Signal Vote', benefits: 'Participate in sentiment polls' },
  { tier: 'Council', requirement: '1,000 GGG', voting: 'Weighted Vote', benefits: 'Propose community initiatives' },
  { tier: 'Guardian', requirement: '10,000 GGG', voting: 'Veto Power', benefits: 'Multi-sig treasury access' },
  { tier: 'Architect', requirement: '100,000 GGG', voting: 'Protocol Vote', benefits: 'Core governance rights' },
];

export default function Authority144() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  const userGGG = profile?.ggg_balance || 0;
  const userTier = userGGG >= 100000 ? 'Architect' : 
                   userGGG >= 10000 ? 'Guardian' : 
                   userGGG >= 1000 ? 'Council' : 
                   userGGG >= 100 ? 'Delegate' : 'Observer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1600')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
        
        {/* Cyber Grid Overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <BackButton className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg" />
            <LoopStartIndicator currentPage="Authority144" className="text-white/70 hover:text-emerald-400 bg-white/10 hover:bg-white/20 rounded-lg" />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                style={{ 
                  fontFamily: 'serif',
                  textShadow: '0 0 60px rgba(16,185,129,0.4), 0 4px 8px rgba(0,0,0,0.8)'
                }}>
              144 Authority
            </h1>
            <p className="text-xl text-emerald-300/90 mb-2 tracking-wide">
              Gaia Global Treasury Governance
            </p>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Sovereign governance infrastructure for the 144,000 verified leaders. 
              Participate in treasury management, protocol decisions, and global resource allocation.
            </p>
            
            {/* User Tier Badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 border border-emerald-500/30 backdrop-blur-sm"
            >
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-white font-medium">Your Tier: </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/50">
                {userTier}
              </Badge>
              <span className="text-slate-400">|</span>
              <span className="text-amber-400 font-bold">{userGGG.toLocaleString()} GGG</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12 -mt-8 relative z-20">
        {/* Treasury Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {TREASURY_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 bg-slate-800/50 border border-slate-700/50 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Globe className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Crown className="w-4 h-4 mr-2" />
              Governance
            </TabsTrigger>
            <TabsTrigger value="treasury" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Coins className="w-4 h-4 mr-2" />
              Treasury
            </TabsTrigger>
            <TabsTrigger value="proposals" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4 mr-2" />
              Proposals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Authority Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUTHORITY_PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${pillar.color} shadow-lg group-hover:scale-110 transition-transform`}>
                          <pillar.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{pillar.title}</h3>
                          <p className="text-slate-400 text-sm">{pillar.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Mission Statement */}
            <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
              <CardContent className="py-8 text-center">
                <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Our Mission</h3>
                <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  To establish a sovereign, decentralized governance infrastructure that empowers the 144,000 
                  verified leaders to collectively manage global resources, make protocol decisions, and 
                  allocate treasury funds for the benefit of all beings and the planet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Governance Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Tier</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Requirement</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Voting Rights</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Benefits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GOVERNANCE_TIERS.map((tier) => (
                        <tr 
                          key={tier.tier} 
                          className={`border-b border-slate-700/50 ${tier.tier === userTier ? 'bg-emerald-500/10' : ''}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {tier.tier === userTier && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                              <span className={`font-medium ${tier.tier === userTier ? 'text-emerald-300' : 'text-white'}`}>
                                {tier.tier}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-amber-400">{tier.requirement}</td>
                          <td className="py-3 px-4 text-slate-300">{tier.voting}</td>
                          <td className="py-3 px-4 text-slate-400">{tier.benefits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Your Voting Power */}
            <Card className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/30">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Your Voting Power</h3>
                    <p className="text-slate-400 text-sm">Based on your GGG holdings and tier</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-violet-300">{Math.floor(userGGG * 0.1)}</p>
                    <p className="text-sm text-violet-400">voting weight</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-slate-400 mb-1">
                    <span>Progress to next tier</span>
                    <span>{userGGG} / {userTier === 'Observer' ? 100 : userTier === 'Delegate' ? 1000 : userTier === 'Council' ? 10000 : 100000} GGG</span>
                  </div>
                  <Progress value={userTier === 'Architect' ? 100 : (userGGG / (userTier === 'Observer' ? 100 : userTier === 'Delegate' ? 1000 : userTier === 'Council' ? 10000 : 100000)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    Treasury Vault
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                      <p className="text-slate-400 text-sm">Total Value Locked</p>
                      <p className="text-3xl font-bold text-emerald-400">$2.4B</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <p className="text-amber-400 text-xs">Gold Reserves</p>
                        <p className="text-lg font-bold text-white">$1.2B</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-blue-400 text-xs">Stablecoins</p>
                        <p className="text-lg font-bold text-white">$800M</p>
                      </div>
                      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
                        <p className="text-violet-400 text-xs">Real Estate</p>
                        <p className="text-lg font-bold text-white">$300M</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-emerald-400 text-xs">Other Assets</p>
                        <p className="text-lg font-bold text-white">$100M</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    GGT Token Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Token Symbol</span>
                      <span className="text-white font-medium">GGT</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Total Supply</span>
                      <span className="text-white font-medium">1,000,000,000,000,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Holders</span>
                      <span className="text-white font-medium">254</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-400">Network</span>
                      <span className="text-white font-medium">Ethereum</span>
                    </div>
                    <Button variant="outline" className="w-full mt-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Ethplorer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-violet-400" />
                    Active Proposals
                  </CardTitle>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Zap className="w-4 h-4" />
                    Create Proposal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample Proposals */}
                  {[
                    { id: 1, title: 'Increase Staking Rewards', status: 'active', votes: { for: 67, against: 33 }, deadline: '2 days' },
                    { id: 2, title: 'Fund Regional Hub Expansion', status: 'active', votes: { for: 82, against: 18 }, deadline: '5 days' },
                    { id: 3, title: 'Protocol Upgrade v2.5', status: 'passed', votes: { for: 91, against: 9 }, deadline: 'Passed' },
                  ].map((proposal) => (
                    <div key={proposal.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-medium">{proposal.title}</h4>
                          <p className="text-sm text-slate-400">{proposal.deadline}</p>
                        </div>
                        <Badge className={proposal.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}>
                          {proposal.status === 'active' ? 'Voting' : 'Passed'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-400">For: {proposal.votes.for}%</span>
                          <span className="text-rose-400">Against: {proposal.votes.against}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" 
                            style={{ width: `${proposal.votes.for}%` }}
                          />
                        </div>
                      </div>
                      {proposal.status === 'active' && userTier !== 'Observer' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">Vote For</Button>
                          <Button size="sm" variant="outline" className="flex-1 border-rose-500/50 text-rose-300 hover:bg-rose-500/10">Vote Against</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}