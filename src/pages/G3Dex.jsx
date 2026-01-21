import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Settings, TrendingUp, History, Repeat, Clock, 
  Wallet, Activity, BarChart3, Layers, Shield, Zap, Globe,
  Bell, Sun, Moon, ExternalLink, RefreshCw, Lock, Sparkles,
  X, Minus, Maximize2, Move, Search, ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { DexCard, DexFloatingCard } from '@/components/dex/DexCardControls';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showTopCoinsDropdown, setShowTopCoinsDropdown] = useState(false);
  
  // Card modes: 'expanded', 'collapsed', 'stowed' (floating), 'hidden'
  const [cardModes, setCardModes] = useState({
    chart: 'expanded',
    portfolio: 'expanded',
    trading: 'expanded',
    trending: 'expanded'
  });
  
  // Floating card positions and sizes (y starts at 70 to stay below topbar)
  const [floatingCards, setFloatingCards] = useState({
    chart: { position: { x: 100, y: 70 }, size: { width: 600, height: 450 } },
    portfolio: { position: { x: 150, y: 120 }, size: { width: 400, height: 350 } },
    trading: { position: { x: 200, y: 90 }, size: { width: 450, height: 500 } },
    trending: { position: { x: 250, y: 100 }, size: { width: 380, height: 400 } }
  });
  
  const setCardMode = (cardId, mode) => {
    setCardModes(prev => ({ ...prev, [cardId]: mode }));
  };
  
  const updateFloatingPosition = (cardId, position) => {
    setFloatingCards(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], position }
    }));
  };
  
  const updateFloatingSize = (cardId, size) => {
    setFloatingCards(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], size }
    }));
  };
  
  // Legacy chart mode for backward compatibility
  const chartMode = cardModes.chart === 'stowed' ? 'floating' : cardModes.chart === 'hidden' ? 'hidden' : 'docked';
  const setChartMode = (mode) => {
    if (mode === 'floating') setCardMode('chart', 'stowed');
    else if (mode === 'hidden') setCardMode('chart', 'hidden');
    else setCardMode('chart', 'expanded');
  };
  const floatingPosition = floatingCards.chart.position;
  const floatingSize = floatingCards.chart.size;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const floatingRef = useRef(null);

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

  // Handle floating window drag
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      setFloatingPosition({
        x: Math.max(0, Math.min(window.innerWidth - floatingSize.width, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - floatingSize.height, e.clientY - dragOffset.y))
      });
    };
    
    const handleMouseUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, floatingSize]);

  // Handle floating window resize
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e) => {
      setFloatingSize({
        width: Math.max(400, e.clientX - floatingPosition.x),
        height: Math.max(300, e.clientY - floatingPosition.y)
      });
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, floatingPosition]);

  const startDrag = (e) => {
    if (floatingRef.current) {
      const rect = floatingRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

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
      <header className={`relative z-[150] border-b border-${currentTheme.border} ${theme === 'light' ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-xl sticky top-0`}>
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
              {/* Token Search with Top Coins Dropdown */}
              <div className="relative">
                <div className={`flex items-center gap-1 ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-black/60 border-gray-700'} border rounded-lg px-2 h-7`}>
                  <Search className="w-3 h-3 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchDropdown(e.target.value.length > 0);
                      setShowTopCoinsDropdown(false);
                    }}
                    onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                    className={`border-0 bg-transparent h-6 w-28 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 ${theme === 'light' ? 'text-gray-800 placeholder:text-gray-500' : 'text-white placeholder:text-gray-500'}`}
                  />
                  {/* Top Coins Dropdown Button */}
                  <button
                    onClick={() => {
                      setShowTopCoinsDropdown(!showTopCoinsDropdown);
                      setShowSearchDropdown(false);
                    }}
                    className={`flex items-center justify-center h-5 w-5 rounded ${theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-gray-700'} transition-colors`}
                    title="Top Coins"
                  >
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${showTopCoinsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-64 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/95 border-gray-700'} border rounded-lg shadow-xl z-[200] overflow-hidden`}>
                    <div className="p-2 text-[10px] text-gray-500 border-b border-gray-700/50">Search Results</div>
                    {[
                      { symbol: 'ETH', name: 'Ethereum', price: '$3,247.82', change: '+2.4%' },
                      { symbol: 'BTC', name: 'Bitcoin', price: '$67,432.00', change: '+1.8%' },
                      { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '0%' },
                      { symbol: 'SOL', name: 'Solana', price: '$142.50', change: '+5.2%' },
                      { symbol: 'ARB', name: 'Arbitrum', price: '$1.24', change: '-0.8%' },
                    ].filter(t => 
                      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      t.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((token) => (
                      <button
                        key={token.symbol}
                        className={`w-full flex items-center justify-between px-3 py-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} transition-colors`}
                        onClick={() => {
                          setSelectedPair({ from: token.symbol, to: 'USDC' });
                          setSearchQuery('');
                          setShowSearchDropdown(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${currentTheme.accent}-400 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-black`}>
                            {token.symbol.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className={`text-xs font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{token.symbol}</div>
                            <div className="text-[10px] text-gray-500">{token.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{token.price}</div>
                          <div className={`text-[10px] ${token.change.startsWith('+') ? 'text-green-400' : token.change.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>{token.change}</div>
                        </div>
                      </button>
                    ))}
                    {searchQuery.length > 0 && (
                      <div className={`p-2 text-[10px] text-gray-500 border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700/50'}`}>
                        Press Enter to search all tokens
                      </div>
                    )}
                  </div>
                )}
                {/* Top Coins Dropdown */}
                {showTopCoinsDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-72 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black/95 border-gray-700'} border rounded-lg shadow-xl z-[200] overflow-hidden`}>
                    <div className={`p-2 text-[10px] text-gray-500 border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-700/50'} flex items-center justify-between`}>
                      <span>Top Coins by Market Cap</span>
                      <span className="text-[9px]">24h Change</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto scrollbar-hide">
                      {[
                        { symbol: 'BTC', name: 'Bitcoin', price: '$67,432.00', change: '+1.8%', rank: 1 },
                        { symbol: 'ETH', name: 'Ethereum', price: '$3,247.82', change: '+2.4%', rank: 2 },
                        { symbol: 'USDT', name: 'Tether', price: '$1.00', change: '0%', rank: 3 },
                        { symbol: 'BNB', name: 'BNB', price: '$598.20', change: '+0.5%', rank: 4 },
                        { symbol: 'SOL', name: 'Solana', price: '$142.50', change: '+5.2%', rank: 5 },
                        { symbol: 'XRP', name: 'XRP', price: '$0.52', change: '-1.2%', rank: 6 },
                        { symbol: 'USDC', name: 'USD Coin', price: '$1.00', change: '0%', rank: 7 },
                        { symbol: 'ADA', name: 'Cardano', price: '$0.45', change: '+3.1%', rank: 8 },
                        { symbol: 'AVAX', name: 'Avalanche', price: '$35.20', change: '+4.2%', rank: 9 },
                        { symbol: 'DOGE', name: 'Dogecoin', price: '$0.082', change: '+2.8%', rank: 10 },
                        { symbol: 'DOT', name: 'Polkadot', price: '$7.12', change: '-0.3%', rank: 11 },
                        { symbol: 'TRX', name: 'TRON', price: '$0.11', change: '+1.5%', rank: 12 },
                        { symbol: 'LINK', name: 'Chainlink', price: '$14.50', change: '+1.5%', rank: 13 },
                        { symbol: 'MATIC', name: 'Polygon', price: '$0.89', change: '+3.1%', rank: 14 },
                        { symbol: 'UNI', name: 'Uniswap', price: '$7.80', change: '-1.2%', rank: 15 },
                        { symbol: 'ATOM', name: 'Cosmos', price: '$9.24', change: '+2.1%', rank: 16 },
                        { symbol: 'LTC', name: 'Litecoin', price: '$72.50', change: '+0.8%', rank: 17 },
                        { symbol: 'ARB', name: 'Arbitrum', price: '$1.24', change: '-0.8%', rank: 18 },
                        { symbol: 'OP', name: 'Optimism', price: '$2.10', change: '+6.3%', rank: 19 },
                        { symbol: 'AAVE', name: 'Aave', price: '$92.00', change: '+2.8%', rank: 20 },
                      ].map((token) => (
                        <button
                          key={token.symbol}
                          className={`w-full flex items-center justify-between px-3 py-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} transition-colors`}
                          onClick={() => {
                            setSelectedPair({ from: token.symbol, to: 'USDC' });
                            setShowTopCoinsDropdown(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-4">{token.rank}</span>
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${currentTheme.accent}-400 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-black`}>
                              {token.symbol.charAt(0)}
                            </div>
                            <div className="text-left">
                              <div className={`text-xs font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{token.symbol}</div>
                              <div className="text-[10px] text-gray-500">{token.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{token.price}</div>
                            <div className={`text-[10px] ${token.change.startsWith('+') ? 'text-green-400' : token.change.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>{token.change}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
              {/* Hidden card restore buttons - click to restore to docked position */}
              {cardModes.chart === 'hidden' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`w-7 h-7 rounded-full bg-${currentTheme.accent}-500/20 text-${currentTheme.accent}-400 hover:bg-${currentTheme.accent}-500/30 border border-${currentTheme.accent}-500/40`}
                  onClick={() => setCardMode('chart', 'expanded')}
                  title={`${selectedPair?.from || 'ETH'}/${selectedPair?.to || 'USDC'} Chart - Click to restore`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </Button>
              )}
              {cardModes.portfolio === 'hidden' && showPortfolio && walletConnected && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/40`}
                  onClick={() => setCardMode('portfolio', 'expanded')}
                  title="Portfolio - Click to restore"
                >
                  <Wallet className="w-3.5 h-3.5" />
                </Button>
              )}
              {cardModes.trending === 'hidden' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40`}
                  onClick={() => setCardMode('trending', 'expanded')}
                  title="Trending Pairs - Click to restore"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                </Button>
              )}
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
      <div className="relative z-10 w-full px-2 sm:px-3 md:px-4 py-3 md:py-4">
        {/* Function Tabs Bar - ABOVE the chart */}
        <div className="max-w-[1600px] mx-auto mb-3">
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
          </Tabs>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 md:gap-4 max-w-[1600px] mx-auto">
          
          {/* Left Sidebar - Chart & Portfolio */}
          {cardModes.chart !== 'hidden' && cardModes.chart !== 'stowed' && (
            <div className="xl:col-span-5 space-y-3 md:space-y-4">
              <DexCard
                id="chart"
                title={`${selectedPair?.from || 'ETH'}/${selectedPair?.to || 'USDC'} Chart`}
                icon={BarChart3}
                mode={cardModes.chart}
                onModeChange={(mode) => setCardMode('chart', mode)}
                theme={currentTheme.accent}
                isLightTheme={theme === 'light'}
              >
                <PriceChart pair={selectedPair} theme={currentTheme.accent} isLightTheme={theme === 'light'} />
              </DexCard>
              
              {showPortfolio && walletConnected && cardModes.portfolio !== 'hidden' && cardModes.portfolio !== 'stowed' && (
                <DexCard
                  id="portfolio"
                  title="Portfolio"
                  icon={Wallet}
                  mode={cardModes.portfolio}
                  onModeChange={(mode) => setCardMode('portfolio', mode)}
                  theme={currentTheme.accent}
                  isLightTheme={theme === 'light'}
                >
                  <PortfolioPanel walletAddress={walletAddress} theme={currentTheme.accent} />
                </DexCard>
              )}
            </div>
          )}
          
          {/* When chart is hidden or floating, show portfolio if needed */}
          {(cardModes.chart === 'hidden' || cardModes.chart === 'stowed') && showPortfolio && walletConnected && cardModes.portfolio !== 'hidden' && cardModes.portfolio !== 'stowed' && (
            <div className="xl:col-span-5 space-y-3 md:space-y-4">
              <DexCard
                id="portfolio"
                title="Portfolio"
                icon={Wallet}
                mode={cardModes.portfolio}
                onModeChange={(mode) => setCardMode('portfolio', mode)}
                theme={currentTheme.accent}
                isLightTheme={theme === 'light'}
              >
                <PortfolioPanel walletAddress={walletAddress} theme={currentTheme.accent} />
              </DexCard>
            </div>
          )}

          {/* Main Trading Area */}
          <div className={`${chartMode === 'docked' ? 'xl:col-span-4' : 'xl:col-span-6'} space-y-3 md:space-y-4`}>
            {/* Tab Content */}
            {activeTab === 'swap' && (
              <SwapInterface
                walletConnected={walletConnected}
                walletAddress={walletAddress}
                slippage={slippage}
                gasPriority={gasPriority}
                onPairChange={setSelectedPair}
                theme={currentTheme.accent}
                isLightTheme={theme === 'light'}
              />
            )}

            {activeTab === 'limit' && (
              <LimitOrderTab
                walletConnected={walletConnected}
                walletAddress={walletAddress}
                theme={currentTheme.accent}
              />
            )}

            {activeTab === 'dca' && (
              <DCATab
                walletConnected={walletConnected}
                walletAddress={walletAddress}
                theme={currentTheme.accent}
              />
            )}

            {activeTab === 'perps' && (
              <PerpsTab
                walletConnected={walletConnected}
                walletAddress={walletAddress}
                theme={currentTheme.accent}
              />
            )}

            {activeTab === 'neonft' && (
              <NeoNFTMarketplace theme={currentTheme.accent} />
            )}

            {activeTab === 'escrow' && (
              <EscrowManager theme={currentTheme.accent} />
            )}

            {activeTab === 'bridge' && (
              <ResourceBridge theme={currentTheme.accent} />
            )}

            {activeTab === 'history' && (
              <TransactionHistory walletAddress={walletAddress} theme={currentTheme.accent} />
            )}
          </div>

          {/* Right Sidebar - Trending & Info */}
          {cardModes.trending !== 'hidden' && cardModes.trending !== 'stowed' && (
            <div className={`${cardModes.chart !== 'hidden' && cardModes.chart !== 'stowed' ? 'xl:col-span-3' : 'xl:col-span-6'} space-y-3 md:space-y-4`}>
              <DexCard
                id="trending"
                title="Trending Pairs"
                icon={TrendingUp}
                mode={cardModes.trending}
                onModeChange={(mode) => setCardMode('trending', mode)}
                theme={currentTheme.accent}
                isLightTheme={theme === 'light'}
              >
                <TrendingPairs onPairSelect={setSelectedPair} theme={currentTheme.accent} isLightTheme={theme === 'light'} />
              </DexCard>
            </div>
          )}
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

      {/* Floating Cards */}
      {cardModes.chart === 'stowed' && (
        <DexFloatingCard
          id="chart"
          title={`${selectedPair?.from || 'ETH'}/${selectedPair?.to || 'USDC'} Chart`}
          icon={BarChart3}
          position={floatingCards.chart.position}
          size={floatingCards.chart.size}
          onPositionChange={(pos) => updateFloatingPosition('chart', pos)}
          onSizeChange={(size) => updateFloatingSize('chart', size)}
          onDock={() => setCardMode('chart', 'expanded')}
          onHide={() => setCardMode('chart', 'hidden')}
          theme={currentTheme.accent}
          isLightTheme={theme === 'light'}
        >
          <PriceChart pair={selectedPair} theme={currentTheme.accent} isLightTheme={theme === 'light'} />
        </DexFloatingCard>
      )}
      
      {cardModes.portfolio === 'stowed' && showPortfolio && walletConnected && (
        <DexFloatingCard
          id="portfolio"
          title="Portfolio"
          icon={Wallet}
          position={floatingCards.portfolio.position}
          size={floatingCards.portfolio.size}
          onPositionChange={(pos) => updateFloatingPosition('portfolio', pos)}
          onSizeChange={(size) => updateFloatingSize('portfolio', size)}
          onDock={() => setCardMode('portfolio', 'expanded')}
          onHide={() => setCardMode('portfolio', 'hidden')}
          theme={currentTheme.accent}
          isLightTheme={theme === 'light'}
        >
          <PortfolioPanel walletAddress={walletAddress} theme={currentTheme.accent} />
        </DexFloatingCard>
      )}
      
      {cardModes.trending === 'stowed' && (
        <DexFloatingCard
          id="trending"
          title="Trending Pairs"
          icon={TrendingUp}
          position={floatingCards.trending.position}
          size={floatingCards.trending.size}
          onPositionChange={(pos) => updateFloatingPosition('trending', pos)}
          onSizeChange={(size) => updateFloatingSize('trending', size)}
          onDock={() => setCardMode('trending', 'expanded')}
          onHide={() => setCardMode('trending', 'hidden')}
          theme={currentTheme.accent}
          isLightTheme={theme === 'light'}
        >
          <TrendingPairs onPairSelect={setSelectedPair} theme={currentTheme.accent} isLightTheme={theme === 'light'} />
        </DexFloatingCard>
      )}

    </div>
  );
}