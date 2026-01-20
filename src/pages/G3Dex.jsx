import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, Settings, TrendingUp, History, Repeat, Clock, DollarSign } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

import SwapInterface from '@/components/dex/SwapInterface';
import LimitOrderTab from '@/components/dex/LimitOrderTab';
import DCATab from '@/components/dex/DCATab';
import TrendingPairs from '@/components/dex/TrendingPairs';
import TransactionHistory from '@/components/dex/TransactionHistory';
import WalletConnect from '@/components/dex/WalletConnect';
import SettingsModal from '@/components/dex/SettingsModal';

export default function G3Dex() {
  const [activeTab, setActiveTab] = useState('swap');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [gasPriority, setGasPriority] = useState('medium');

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
  }, []);

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    setWalletConnected(true);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setWalletConnected(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Cyberpunk grid background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-lime-500/20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('CommandDeck')}>
              <Button variant="ghost" size="icon" className="text-lime-400 hover:bg-lime-500/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center font-bold text-black">
                G3
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                G3DEX
              </span>
              <span className="text-xs text-lime-500/60 border border-lime-500/30 px-2 py-0.5 rounded-full">
                BASE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-lime-400 hover:bg-lime-500/10"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <WalletConnect
              connected={walletConnected}
              address={walletAddress}
              onConnect={handleWalletConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Trading Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-black/40 border border-lime-500/20 p-1">
                <TabsTrigger 
                  value="swap" 
                  className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400"
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  Swap
                </TabsTrigger>
                <TabsTrigger 
                  value="limit" 
                  className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Limit
                </TabsTrigger>
                <TabsTrigger 
                  value="dca" 
                  className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  DCA
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="swap" className="mt-6">
                <SwapInterface
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                  slippage={slippage}
                  gasPriority={gasPriority}
                />
              </TabsContent>

              <TabsContent value="limit" className="mt-6">
                <LimitOrderTab
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                />
              </TabsContent>

              <TabsContent value="dca" className="mt-6">
                <DCATab
                  walletConnected={walletConnected}
                  walletAddress={walletAddress}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <TransactionHistory walletAddress={walletAddress} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TrendingPairs />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slippage={slippage}
        setSlippage={setSlippage}
        gasPriority={gasPriority}
        setGasPriority={setGasPriority}
      />
    </div>
  );
}