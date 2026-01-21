import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Gem, Users, TrendingUp, Shield, Scale, Link2, Globe,
  Lock, Calendar, Clock, Wallet, ArrowRight, CheckCircle2,
  Sparkles, ChevronDown, ExternalLink
} from 'lucide-react';

const GGG_TOKEN_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759538255968_faab45d0.png";
const PERFORMANCE_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759270221703_07ca2115.png";
const UCC1_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759270227626_21532a62.png";
const GLOBAL_REACH_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759270234890_76e70761.png";
const FOUNDER_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68be038a43ca0f0ab13d5a76_1759526821607_d4e0d0bd.jpg";
const CTO_IMAGE = "https://d64gsuwffb70l.cloudfront.net/68dc5585644aaf2ae1f8f596_1761353425430_dd434846.webp";

const stats = [
  { icon: Trophy, label: "Gold Backing", value: "1.2T AU", color: "text-yellow-400" },
  { icon: Gem, label: "Market Cap", value: "$2.4B", color: "text-purple-400" },
  { icon: Users, label: "Holders", value: "662", color: "text-blue-400" },
  { icon: TrendingUp, label: "Stability", value: "99.8%", color: "text-green-400" },
];

const stakingPools = [
  { icon: "🔓", name: "Flexible", apy: "5%", lockPeriod: "Flexible", minStake: "10 GGG", totalStaked: "1.25M GGG" },
  { icon: "📅", name: "30 Days", apy: "12%", lockPeriod: "30 days", minStake: "100 GGG", totalStaked: "3.50M GGG" },
  { icon: "⏰", name: "90 Days", apy: "25%", lockPeriod: "90 days", minStake: "250 GGG", totalStaked: "7.80M GGG" },
  { icon: "🔒", name: "180 Days", apy: "45%", lockPeriod: "180 days", minStake: "1,000 GGG", totalStaked: "15.20M GGG" },
  { icon: "💎", name: "365 Days", apy: "80%", lockPeriod: "365 days", minStake: "2,500 GGG", totalStaked: "28.50M GGG" },
];

const features = [
  { icon: Shield, title: "Gold-Backed Security", description: "Every GGG token is backed by physical gold reserves, providing unprecedented stability and real-world value." },
  { icon: Scale, title: "UCC1 Secured", description: "Legally secured through UCC1 filing with 1.2 Trillion in assigned gold assets, ensuring regulatory compliance." },
  { icon: Link2, title: "Blockchain Transparency", description: "Built on secure blockchain technology with full transparency and immutable transaction records." },
  { icon: Globe, title: "Global Accessibility", description: "Trade 24/7 on major exchanges worldwide with instant settlement and minimal transaction fees." },
];

const roadmapItems = [
  { quarter: "Q3 2025", title: "Foundation & Private Round", items: ["GGG Token Deployed", "Private Investor Round Open", "Investor Portal + Website Live", "UCC1 Filing Secured", "Community Building Initiatives"] },
  { quarter: "Q4 2025", title: "ICO Preparation & Staking", items: ["Public ICO Launchpad Preparation", "Staking & Vesting Dashboard Launch", "First Exchange Listings", "Mobile Wallet Integration"] },
  { quarter: "Q1 2026", title: "Growth & Global Expansion", items: ["Public ICO Launch", "Expanded Exchange Partnerships", "DeFi Integration", "Global Marketing Campaign"] },
  { quarter: "Q2 2026", title: "Innovation & Ecosystem", items: ["NFT Marketplace Launch", "Cross-Chain Bridges", "GGG Developer Grants", "Treasury Transparency Dashboard"] },
  { quarter: "Q3 2026", title: "Institutional Adoption", items: ["Institutional Partnerships", "Fiat Gateway Integrations", "Enterprise Custody Layer", "Regional Expansion"] },
  { quarter: "Q4 2026", title: "Sovereign Infrastructure", items: ["Gaia Global Treasury Portal", "Institutional Asset Management", "Sovereign Banking Arm", "Heritage assets integration"] },
];

const walletOptions = [
  { name: "MetaMask", icon: "🦊", popular: true },
  { name: "WalletConnect", icon: "🔗", popular: true },
  { name: "Coinbase Wallet", icon: "💼", popular: false },
  { name: "Trust Wallet", icon: "🛡️", popular: false },
];

export default function GGGCrypto() {
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("GGG");
  const [activeSection, setActiveSection] = useState("hero");

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-purple-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-900/80 backdrop-blur-md border-b border-purple-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={GGG_TOKEN_IMAGE} alt="GGG" className="w-10 h-10" />
            <span className="text-yellow-400 font-bold text-xl">GGG</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {["Swap", "Staking", "Features", "Tokenomics", "Roadmap", "Wallet"].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-purple-500 text-purple-200 hover:bg-purple-800">
              <Users className="w-4 h-4 mr-1" /> Sign In
            </Button>
            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Wallet className="w-4 h-4 mr-1" /> Connect Wallet
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-yellow-400 block" style={{ fontVariant: 'small-caps' }}>Gaia</span>
              <span className="text-yellow-400 block" style={{ fontVariant: 'small-caps' }}>Global</span>
              <span className="text-yellow-400 block" style={{ fontVariant: 'small-caps' }}>Gold</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-yellow-300 mb-6">Finance. Reinvented. Realized.</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Experience the future of stable cryptocurrency. Backed by 1.2 Trillion in gold (AU), 
              secured through UCC1 filing, GGG represents the perfect fusion of traditional wealth 
              and blockchain technology. The Gold-Backed Digital Asset for a New Era.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                Get GGG Now
              </Button>
              <Button size="lg" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
                Learn More
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src={GGG_TOKEN_IMAGE} 
              alt="GGG Token" 
              className="w-80 h-80 md:w-[450px] md:h-[450px] object-contain drop-shadow-2xl animate-pulse"
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-purple-800/50 backdrop-blur-sm rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swap Section */}
      <section id="swap" className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Swap Tokens</h2>
          <p className="text-gray-400 text-center mb-8">Exchange your tokens for GGG instantly</p>
          
          <Card className="bg-purple-800/50 border-purple-600">
            <CardContent className="p-6">
              <Tabs defaultValue="swap">
                <TabsList className="w-full bg-purple-900/50 mb-6">
                  <TabsTrigger value="swap" className="flex-1">Swap</TabsTrigger>
                </TabsList>
                <TabsContent value="swap" className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">From</label>
                    <div className="flex gap-2">
                      <Input placeholder="0.0" className="flex-1 bg-purple-900/50 border-purple-600 text-white" />
                      <Select value={fromToken} onValueChange={setFromToken}>
                        <SelectTrigger className="w-32 bg-purple-900/50 border-purple-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="DAI">DAI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-purple-700 p-2 rounded-full">
                      <ChevronDown className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">To</label>
                    <div className="flex gap-2">
                      <Input placeholder="0.0" className="flex-1 bg-purple-900/50 border-purple-600 text-white" />
                      <Select value={toToken} onValueChange={setToToken}>
                        <SelectTrigger className="w-32 bg-purple-900/50 border-purple-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GGG">GGG</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex justify-between">
                    <span>Gas Price: 0 Gwei</span>
                    <span>Est. Gas Fee: 0 ETH</span>
                  </div>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    Connect Wallet First
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Staking Section */}
      <section id="staking" className="py-16 px-4 bg-purple-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Stake & Earn Rewards</h2>
          <p className="text-gray-400 text-center mb-8">
            Lock your GGG tokens to earn passive income. Choose from flexible to long-term staking pools with competitive APY rates.
          </p>

          {/* User Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-purple-800/50 border-purple-600">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-400">Your Total Staked</div>
                <div className="text-2xl font-bold text-white">0 GGG</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/50 border-purple-600">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-400">Total Rewards</div>
                <div className="text-2xl font-bold text-yellow-400">0.00 GGG</div>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/50 border-purple-600">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-400">Active Stakes</div>
                <div className="text-2xl font-bold text-white">0</div>
              </CardContent>
            </Card>
          </div>

          {/* Staking Pools */}
          <h3 className="text-xl font-semibold text-white mb-4">Available Staking Pools</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stakingPools.map((pool, i) => (
              <Card key={i} className="bg-purple-800/50 border-purple-600 hover:border-yellow-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="text-3xl mb-2">{pool.icon}</div>
                  <h4 className="font-semibold text-white mb-1">{pool.name}</h4>
                  <div className="text-2xl font-bold text-yellow-400 mb-3">{pool.apy} APY</div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Lock Period:</span>
                      <span className="text-white">{pool.lockPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Stake:</span>
                      <span className="text-white">{pool.minStake}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Staked:</span>
                      <span className="text-white">{pool.totalStaked}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-purple-700 hover:bg-purple-600 text-white" size="sm">
                    Sign In Required
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Why Choose GGG?</h2>
          <p className="text-gray-400 text-center mb-12">
            Experience the perfect harmony of traditional wealth preservation and cutting-edge blockchain technology
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="bg-purple-800/30 border-purple-600 hover:border-yellow-500/50 transition-all hover:transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-16 px-4 bg-purple-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Tokenomics</h2>
          <p className="text-gray-400 text-center mb-12">Built on a foundation of real-world assets and sustainable economics</p>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="bg-purple-800/50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-300">Total Supply</span>
                <span className="text-xl font-bold text-white">1,000,000,000</span>
              </div>
              <div className="bg-purple-800/50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-300">Gold Backing Ratio</span>
                <span className="text-xl font-bold text-yellow-400">1:1.2T AU</span>
              </div>
              <div className="bg-purple-800/50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-300">Circulating Supply</span>
                <span className="text-xl font-bold text-white">750,000,000</span>
              </div>
              <div className="bg-purple-800/50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-300">Reserve Fund</span>
                <span className="text-xl font-bold text-white">250,000,000</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={PERFORMANCE_IMAGE} alt="GGG Performance" className="rounded-xl w-full" />
              <img src={UCC1_IMAGE} alt="UCC1 Secured" className="rounded-xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Bridge Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">A Bridge Between Ancient and Future</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Banks are faltering. Confidence in the old financial order is eroding. At the same time, cryptocurrency 
            has proven its staying power, and stablecoins are paving the way for trust, transparency, and liquidity in the digital age.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            Gaia Global Gold (GGG) is more than a token—it is a bridge between the ancient and the future. The gold 
            behind GGG is drawn from the treasuries of ancient royal dynasties, secured and entrusted to us. We stand 
            not only as Ambassadors, but as Trustees, safeguarding these assets for humanity's transition into a new financial system.
          </p>
          <p className="text-yellow-400 text-lg font-semibold">
            GGG represents more than wealth—it is legacy, responsibility, and the new standard of trust.
          </p>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-16 px-4 bg-purple-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Global Reach</h2>
          <p className="text-gray-400 text-center mb-12">
            GGG Token transcends borders, bringing gold-backed stability to the global digital economy.
          </p>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "150+", label: "Countries" },
                { value: "24/7", label: "Trading" },
                { value: "$2.4B", label: "Volume" },
                { value: "10+", label: "Exchanges" },
              ].map((stat, i) => (
                <div key={i} className="bg-purple-800/50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
            <img src={GLOBAL_REACH_IMAGE} alt="Global Reach" className="rounded-xl w-full" />
          </div>
        </div>
      </section>

      {/* Wallet Connect Section */}
      <section id="wallet" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 text-center mb-8">
            Get started with GGG Token in seconds. Connect your preferred wallet and complete KYC verification.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {walletOptions.map((wallet, i) => (
              <Card key={i} className="bg-purple-800/50 border-purple-600 hover:border-yellow-500/50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{wallet.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{wallet.name}</h3>
                  {wallet.popular && <Badge className="bg-yellow-500/20 text-yellow-400 mb-3">Popular</Badge>}
                  <Button variant="outline" size="sm" className="w-full border-purple-500 text-purple-200 hover:bg-purple-700">
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border-yellow-500/50 mt-8">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Started?</h3>
              <p className="text-gray-300 mb-4">Join thousands of investors who trust GGG Token for stable, gold-backed cryptocurrency</p>
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Wallet className="w-5 h-5 mr-2" /> Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-16 px-4 bg-purple-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">GGG Roadmap</h2>
          <p className="text-gray-400 text-center mb-12">Q3 2025 – Q4 2026: From Foundation to Sovereign Infrastructure</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapItems.map((item, i) => (
              <Card key={i} className="bg-purple-800/50 border-purple-600">
                <CardHeader className="pb-2">
                  <Badge className="w-fit bg-yellow-500/20 text-yellow-400 mb-2">{item.quarter}</Badge>
                  <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.items.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2">Leadership Team</h2>
          <p className="text-gray-400 text-center mb-12">Visionary leaders pioneering sovereign financial transformation</p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-purple-800/50 border-purple-600">
              <CardContent className="p-6 text-center">
                <img 
                  src={FOUNDER_IMAGE} 
                  alt="Mathew Louis Schlueter" 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-white">Mathew Louis Schlueter</h3>
                <p className="text-yellow-400 text-sm mb-3">Founder & Director | Systems Architect</p>
                <p className="text-gray-400 text-sm">
                  Systems architect, trust strategist, and founder of Gaia Global Treasury (GGT) — 
                  the chosen future treasury of the Dragon Families and Office of the M1.
                </p>
                <Button variant="link" className="text-yellow-400 mt-2">
                  Read full biography <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-purple-800/50 border-purple-600">
              <CardContent className="p-6 text-center">
                <img 
                  src={CTO_IMAGE} 
                  alt="Timothy Fisher" 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-white">Timothy Fisher</h3>
                <p className="text-yellow-400 text-sm mb-3">Chief Technology Officer</p>
                <p className="text-gray-400 text-sm">
                  Crafts systems that safeguard value, people, and information, ensuring their security, 
                  transparency, and global connectivity.
                </p>
                <Button variant="link" className="text-yellow-400 mt-2">
                  Read full biography <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-purple-700/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={GGG_TOKEN_IMAGE} alt="GGG" className="w-8 h-8" />
            <span className="text-yellow-400 font-bold text-lg">Gaia Global Gold</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 Gaia Global Gold. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}