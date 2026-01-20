import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Settings, TrendingUp, History, Repeat, Clock, 
  Wallet, Activity, BarChart3, Layers, Shield, Zap, Globe,
  Bell, Sun, Moon, ExternalLink, RefreshCw, Lock, Sparkles
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import SwapInterface from '@/components/dex/SwapInterface';
import LimitOrderTab from '@/components/dex/LimitOrderTab';
import DCATab from '@/components/dex/DCATab';
import TrendingPairs from '@/components/dex/TrendingPairs';
import TransactionHistory from '@/components/dex/TransactionHistory';
import WalletConnect from '@/components/dex/WalletConnect';
import SettingsModal from '@/components/dex/SettingsModal';
import PriceChart from '@/components/dex/PriceChart';
import PortfolioPanel from '@/components/dex/PortfolioPanel';
import PerpsTab from '@/components/dex/PerpsTab';
import StatsBar from '@/components/dex/StatsBar';
import NeoNFTMarketplace from '@/components/dex/NeoNFTMarketplace';
import EscrowManager from '@/components/dex/EscrowManager';
import ResourceBridge from '@/components/dex/ResourceBridge';
import StakePoolsModal from '@/components/dex/StakePoolsModal';
import BridgeModal from '@/components/dex/BridgeModal';

export default function G3Dex() {
  const [activeTab, setActiveTab] = useState('swap');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [gasPriority, setGasPriority] = useState('medium');
  const [selectedPair, setSelectedPair] = useState({ from: 'ETH', to: 'USDC' });
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [theme, setTheme] = useState('cyber'); // cyber, midnight, matrix, light
  const [stakeModalOpen, setStakeModalOpen] = useState(false);
  const [poolsModalOpen, setPoolsModalOpen] = useState(false);
  const [bridgeModalOpen, setBridgeModalOpen] = useState(false);

  // Check for existing wallet connection
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        } catch (err) {
          console.log('No wallet connected');
        }
      }
    };
    checkWallet();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        } else {
          setWalletAddress('');
          setWalletConnected(false);
        }
      });
    }
  }, []);

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    setWalletConnected(true);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setWalletConnected(false);
  };

  const themeStyles = {
    cyber: {
      bg: 'bg-[#0a0a0f]',
      accent: 'lime',
      glow: 'rgba(0,255,100,0.03)',
      border: 'lime-500/20',
      text: 'text-white',
      cardBg: 'bg-black/60',
      subtext: 'text-gray-400'
    },
    midnight: {
      bg: 'bg-[#0d1117]',
      accent: 'blue',
      glow: 'rgba(59,130,246,0.03)',
      border: 'blue-500/20',
      text: 'text-white',
      cardBg: 'bg-black/60',
      subtext: 'text-gray-400'
    },
    matrix: {
      bg: 'bg-black',
      accent: 'emerald',
      glow: 'rgba(16,185,129,0.05)',
      border: 'emerald-500/30',
      text: 'text-white',
      cardBg: 'bg-black/60',
      subtext: 'text-gray-400'
    },
    light: {
      bg: 'bg-gray-100',
      accent: 'violet',
      glow: 'rgba(139,92,246,0.03)',
      border: 'violet-300',
      text: 'text-gray-900',
      cardBg: 'bg-white',
      subtext: 'text-gray-700'
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${currentTheme.glow} 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.glow} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] bg-${currentTheme.accent}-500/5 rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-${currentTheme.accent}-400/5 rounded-full blur-[100px]`} />
        <div className={`absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2`} />
      </div>

      {/* Top Stats Bar */}
      <StatsBar />

      {/* Header */}
      <header className={`relative z-10 border-b border-${currentTheme.border} ${theme === 'light' ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-xl sticky top-0`}>
        <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('CommandDeck')}>
              <Button variant="ghost" size="icon" className={`text-${currentTheme.accent}-400 hover:bg-${currentTheme.accent}-500/10`}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${currentTheme.accent}-400 to-emerald-500 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-${currentTheme.accent}-500/20`}>
                G3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold bg-gradient-to-r from-${currentTheme.accent}-400 to-emerald-400 bg-clip-text text-transparent`}>
                    G3DEX
                  </span>
                  <Badge variant="outline" className={`text-${currentTheme.accent}-400 border-${currentTheme.accent}-500/50 text-[10px] px-1.5`}>
                    V2
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  Base Mainnet
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="hidden md:flex items-center gap-1 ml-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white text-xs h-7"
                onClick={() => setBridgeModalOpen(true)}
              >
                <Globe className="w-3 h-3 mr-1" />
                Bridge
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white text-xs h-7"
                onClick={() => setStakeModalOpen(true)}
              >
                <Shield className="w-3 h-3 mr-1" />
                Stake
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white text-xs h-7"
                onClick={() => setPoolsModalOpen(true)}
              >
                <Layers className="w-3 h-3 mr-1" />
                Pools
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className={`hidden sm:flex items-center gap-1 ${theme === 'light' ? 'bg-gray-200' : 'bg-black/40'} rounded-lg p-0.5 border ${theme === 'light' ? 'border-gray-300' : 'border-gray-800'}`}>
              {['cyber', 'midnight', 'matrix', 'light'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-2 py-1 rounded-md text-[10px] capitalize transition-all ${
                    theme === t 
                      ? `bg-${t === 'cyber' ? 'lime' : t === 'midnight' ? 'blue' : t === 'matrix' ? 'emerald' : 'violet'}-500/20 ${t === 'light' ? 'text-violet-700' : 'text-white'}` 
                      : `${theme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300'}`
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <Bell className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className={`text-${currentTheme.accent}-400 hover:bg-${currentTheme.accent}-500/10 h-8 w-8`}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {walletConnected && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPortfolio(!showPortfolio)}
                className={`text-${currentTheme.accent}-400 hover:bg-${currentTheme.accent}-500/10 h-8 w-8 ${showPortfolio ? `bg-${currentTheme.accent}-500/20` : ''}`}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            )}
            
            <WalletConnect
              connected={walletConnected}
              address={walletAddress}
              onConnect={handleWalletConnect}
              onDisconnect={handleDisconnect}
              theme={currentTheme.accent}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full px-2 sm:px-3 md:px-4 py-3 md:py-4 ml-0 md:ml-2 lg:ml-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 md:gap-4 max-w-[1600px] mx-auto">
          
          {/* Left Sidebar - Chart & Portfolio */}
          <div className="xl:col-span-5 space-y-3 md:space-y-4">
            <PriceChart pair={selectedPair} theme={currentTheme.accent} isLightTheme={theme === 'light'} />
            {showPortfolio && walletConnected && (
              <PortfolioPanel walletAddress={walletAddress} theme={currentTheme.accent} />
            )}
          </div>

          {/* Main Trading Area */}
          <div className="xl:col-span-4 space-y-3 md:space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`bg-black/60 border border-${currentTheme.border} p-1 w-full grid grid-cols-8 gap-0.5`}>
                <TabsTrigger 
                  value="swap" 
                  className={`data-[state=active]:bg-${currentTheme.accent}-500/20 data-[state=active]:text-${currentTheme.accent}-400 text-xs`}
                >
                  <Repeat className="w-3 h-3 mr-1" />
                  Swap
                </TabsTrigger>
                <TabsTrigger 
                  value="limit" 
                  className={`data-[state=active]:bg-${currentTheme.accent}-500/20 data-[state=active]:text-${currentTheme.accent}-400 text-xs`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Limit
                </TabsTrigger>
                <TabsTrigger 
                  value="dca" 
                  className={`data-[state=active]:bg-${currentTheme.accent}-500/20 data-[state=active]:text-${currentTheme.accent}-400 text-xs`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  DCA
                </TabsTrigger>
                <TabsTrigger 
                  value="perps" 
                  className={`data-[state=active]:bg-${currentTheme.accent}-500/20 data-[state=active]:text-${currentTheme.accent}-400 text-xs`}
                >
                  <Activity className="w-3 h-3 mr-1" />
                  Perps
                </TabsTrigger>
                <TabsTrigger 
                  value="neonft" 
                  className={`data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-xs`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Neo-NFT
                </TabsTrigger>
                <TabsTrigger 
                  value="escrow" 
                  className={`data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-xs`}
                >
                  <Lock className="w-3 h-3 mr-1" />
                  Escrow
                </TabsTrigger>
                <TabsTrigger 
                  value="bridge" 
                  className={`data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-xs`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Bridge
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className={`data-[state=active]:bg-${currentTheme.accent}-500/20 data-[state=active]:text-${currentTheme.accent}-400 text-xs`}
                >
                  <History className="w-3 h-3 mr-1" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swap" className="mt-4">
                <SwapInterface
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  slippage={slippage}
                  gasPriority={gasPriority}
                  onPairChange={setSelectedPair}
                  theme={currentTheme.accent}
                  isLightTheme={theme === 'light'}
                />
              </TabsContent>

              <TabsContent value="limit" className="mt-4">
                <LimitOrderTab
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  theme={currentTheme.accent}
                />
              </TabsContent>

              <TabsContent value="dca" className="mt-4">
                <DCATab
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  theme={currentTheme.accent}
                />
              </TabsContent>

              <TabsContent value="perps" className="mt-4">
                <PerpsTab
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  theme={currentTheme.accent}
                />
              </TabsContent>

              <TabsContent value="neonft" className="mt-4">
                <NeoNFTMarketplace theme={currentTheme.accent} />
              </TabsContent>

              <TabsContent value="escrow" className="mt-4">
                <EscrowManager theme={currentTheme.accent} />
              </TabsContent>

              <TabsContent value="bridge" className="mt-4">
                <ResourceBridge theme={currentTheme.accent} />
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <TransactionHistory walletAddress={walletAddress} theme={currentTheme.accent} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Trending & Info */}
          <div className="xl:col-span-3 space-y-4">
            <TrendingPairs onPairSelect={setSelectedPair} theme={currentTheme.accent} isLightTheme={theme === 'light'} />
          </div>
        </div>
      </div>

      {/* Stake Modal */}
      <StakePoolsModal
        open={stakeModalOpen}
        onClose={() => setStakeModalOpen(false)}
        type="stake"
      />

      {/* Pools Modal */}
      <StakePoolsModal
        open={poolsModalOpen}
        onClose={() => setPoolsModalOpen(false)}
        type="pools"
      />

      {/* Bridge Modal */}
      <BridgeModal
        open={bridgeModalOpen}
        onClose={() => setBridgeModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slippage={slippage}
        setSlippage={setSlippage}
        gasPriority={gasPriority}
        setGasPriority={setGasPriority}
        theme={currentTheme.accent}
      />


    </div>
  );
}