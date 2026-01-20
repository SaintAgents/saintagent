import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, ArrowDown, AlertCircle, CheckCircle2, Loader2, 
  ArrowRight, Clock, Shield, Zap
} from 'lucide-react';

export default function BridgeModal({ open, onClose }) {
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('base');
  const [token, setToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('input'); // input, confirm, processing, success

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'from-blue-400 to-indigo-500' },
    { id: 'base', name: 'Base', icon: '🔵', color: 'from-blue-500 to-blue-600' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: 'from-blue-400 to-cyan-500' },
    { id: 'optimism', name: 'Optimism', icon: '🔴', color: 'from-red-400 to-red-500' },
    { id: 'polygon', name: 'Polygon', icon: '💜', color: 'from-purple-400 to-purple-600' },
  ];

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: '2.45' },
    { symbol: 'USDC', name: 'USD Coin', balance: '1,234.56' },
    { symbol: 'USDT', name: 'Tether', balance: '500.00' },
    { symbol: 'G3', name: 'G3 Token', balance: '10,000.00' },
  ];

  const estimatedTime = fromChain === 'ethereum' ? '~15 min' : '~2 min';
  const bridgeFee = '0.1%';
  const gasFee = fromChain === 'ethereum' ? '$12.50' : '$0.05';

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const handleBridge = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 3000);
  };

  const resetModal = () => {
    setStep('input');
    setAmount('');
    onClose();
  };

  const fromChainData = chains.find(c => c.id === fromChain);
  const toChainData = chains.find(c => c.id === toChain);
  const selectedToken = tokens.find(t => t.symbol === token);

  return (
    <Dialog open={open} onOpenChange={resetModal}>
      <DialogContent className="max-w-md bg-[#0a0a0f] border-purple-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-400">
            <Globe className="w-5 h-5" />
            Cross-Chain Bridge
            <Badge variant="outline" className="text-amber-400 border-amber-500/50 ml-2">
              Demo Mode
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200">
              This is a preview of the G3DEX bridge. Live cross-chain transfers are coming soon!
            </p>
          </div>
        </div>

        {step === 'input' && (
          <div className="space-y-4">
            {/* From Chain */}
            <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">From</span>
                <Select value={fromChain} onValueChange={setFromChain}>
                  <SelectTrigger className="w-40 bg-black/60 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-gray-800">
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id} disabled={chain.id === toChain}>
                        <div className="flex items-center gap-2">
                          <span>{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger className="w-28 bg-black/60 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-gray-800">
                    {tokens.map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        {t.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-black/60 border-gray-800 text-white text-lg"
                />
              </div>
              <p className="text-xs text-gray-500">
                Balance: {selectedToken?.balance} {token} (Demo)
              </p>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwapChains}
                className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center hover:bg-purple-500/30 transition-colors"
              >
                <ArrowDown className="w-5 h-5 text-purple-400" />
              </button>
            </div>

            {/* To Chain */}
            <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">To</span>
                <Select value={toChain} onValueChange={setToChain}>
                  <SelectTrigger className="w-40 bg-black/60 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-gray-800">
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id} disabled={chain.id === fromChain}>
                        <div className="flex items-center gap-2">
                          <span>{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-2xl font-semibold text-center py-2">
                {amount ? (parseFloat(amount) * 0.999).toFixed(4) : '0.00'} {token}
              </div>
            </div>

            {/* Bridge Info */}
            {amount && parseFloat(amount) > 0 && (
              <div className="space-y-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </div>
                  <span className="text-white">{estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Zap className="w-4 h-4" />
                    Bridge Fee
                  </div>
                  <span className="text-white">{bridgeFee}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Shield className="w-4 h-4" />
                    Gas Fee
                  </div>
                  <span className="text-white">{gasFee}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleBridge}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold h-12"
            >
              Bridge {token}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${fromChainData?.color} flex items-center justify-center text-2xl mb-2`}>
                    {fromChainData?.icon}
                  </div>
                  <p className="text-sm font-medium">{fromChainData?.name}</p>
                  <p className="text-xs text-gray-400">{amount} {token}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-purple-400" />
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${toChainData?.color} flex items-center justify-center text-2xl mb-2`}>
                    {toChainData?.icon}
                  </div>
                  <p className="text-sm font-medium">{toChainData?.name}</p>
                  <p className="text-xs text-gray-400">{(parseFloat(amount) * 0.999).toFixed(4)} {token}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">You Send</span>
                <span>{amount} {token}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">You Receive</span>
                <span className="text-purple-400">{(parseFloat(amount) * 0.999).toFixed(4)} {token}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Time</span>
                <span>{estimatedTime}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="flex-1 border-gray-700 text-gray-400"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
              >
                Confirm Bridge (Demo)
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-lg">Bridging Assets</p>
              <p className="text-sm text-gray-400">Simulating cross-chain transfer...</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Waiting for confirmation on {fromChainData?.name}...
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-lg text-emerald-400">Bridge Complete!</p>
              <p className="text-sm text-gray-400">
                {(parseFloat(amount) * 0.999).toFixed(4)} {token} is now on {toChainData?.name} (Demo)
              </p>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-gray-800 text-xs text-gray-400">
              <p>Transaction Hash (Demo):</p>
              <p className="font-mono text-purple-400 mt-1">0x1234...abcd</p>
            </div>
            <Button
              onClick={resetModal}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}