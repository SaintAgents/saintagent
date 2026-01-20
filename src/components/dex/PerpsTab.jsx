import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, ChevronDown, AlertTriangle, 
  Info, Zap, Target, Shield, Wallet
} from 'lucide-react';
import { BASE_TOKENS, formatUSD } from './dexUtils';
import TokenSelector from './TokenSelector';

export default function PerpsTab({ walletConnected, walletAddress, theme = 'lime' }) {
  const [side, setSide] = useState('long');
  const [orderType, setOrderType] = useState('market');
  const [leverage, setLeverage] = useState([5]);
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(BASE_TOKENS[0]);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const currentPrice = 3247.82;
  const marginRequired = amount ? (parseFloat(amount) / leverage[0]).toFixed(2) : '0.00';
  const liquidationPrice = side === 'long' 
    ? (currentPrice * (1 - 0.9 / leverage[0])).toFixed(2)
    : (currentPrice * (1 + 0.9 / leverage[0])).toFixed(2);

  const leveragePresets = [2, 5, 10, 25, 50, 100];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Trading Panel */}
      <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        {/* Long/Short Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={() => setSide('long')}
            className={`h-12 text-base font-semibold ${
              side === 'long'
                ? `bg-${theme}-500 hover:bg-${theme}-600 text-black`
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Long
          </Button>
          <Button
            onClick={() => setSide('short')}
            className={`h-12 text-base font-semibold ${
              side === 'short'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            Short
          </Button>
        </div>

        {/* Order Type */}
        <Tabs value={orderType} onValueChange={setOrderType} className="mb-4">
          <TabsList className="w-full bg-black/40 border border-gray-800">
            <TabsTrigger value="market" className={`flex-1 data-[state=active]:bg-${theme}-500/20 data-[state=active]:text-${theme}-400 text-xs`}>
              Market
            </TabsTrigger>
            <TabsTrigger value="limit" className={`flex-1 data-[state=active]:bg-${theme}-500/20 data-[state=active]:text-${theme}-400 text-xs`}>
              Limit
            </TabsTrigger>
            <TabsTrigger value="stop" className={`flex-1 data-[state=active]:bg-${theme}-500/20 data-[state=active]:text-${theme}-400 text-xs`}>
              Stop
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Token Selection */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">Asset</label>
          <Button
            variant="outline"
            className={`w-full justify-between bg-black/40 border-${theme}-500/30 hover:bg-${theme}-500/10 text-white`}
            onClick={() => setTokenSelectorOpen(true)}
          >
            <div className="flex items-center gap-2">
              <img src={selectedToken.logo} alt="" className="w-5 h-5 rounded-full" />
              <span>{selectedToken.symbol}/USD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">${currentPrice}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </div>

        {/* Size Input */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Size (USD)</span>
            <span>Available: $5,000</span>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`bg-black/40 border-${theme}-500/30 text-white text-lg font-mono h-12`}
          />
        </div>

        {/* Leverage Slider */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>Leverage</span>
            <span className={`text-${theme}-400 font-bold`}>{leverage[0]}x</span>
          </div>
          <Slider
            value={leverage}
            onValueChange={setLeverage}
            min={1}
            max={100}
            step={1}
            className={`mb-3 [&_[role=slider]]:bg-${theme}-400`}
          />
          <div className="flex gap-1">
            {leveragePresets.map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage([lev])}
                className={`flex-1 py-1 rounded text-xs transition-colors ${
                  leverage[0] === lev
                    ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/30`
                    : 'bg-gray-800/50 text-gray-500 hover:bg-gray-800'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* TP/SL */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <Target className="w-3 h-3 text-lime-400" />
              Take Profit
            </label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Price"
              className="bg-black/40 border-lime-500/30 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-400" />
              Stop Loss
            </label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Price"
              className="bg-black/40 border-red-500/30 text-white text-sm"
            />
          </div>
        </div>

        {/* Trade Button */}
        <Button
          className={`w-full h-14 text-lg font-bold ${
            side === 'long'
              ? `bg-gradient-to-r from-${theme}-500 to-emerald-500 hover:from-${theme}-400 hover:to-emerald-400 text-black`
              : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white'
          }`}
          disabled={!walletConnected || !amount}
        >
          {!walletConnected ? (
            <>
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              {side === 'long' ? 'Long' : 'Short'} {selectedToken.symbol}
            </>
          )}
        </Button>
      </Card>

      {/* Info Panel */}
      <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" />
          Position Details
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Entry Price</span>
            <span className="text-white font-mono">${currentPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Position Size</span>
            <span className="text-white font-mono">{amount ? `$${parseFloat(amount).toLocaleString()}` : '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin Required</span>
            <span className="text-white font-mono">${marginRequired}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Leverage</span>
            <span className={`text-${theme}-400 font-mono`}>{leverage[0]}x</span>
          </div>
          
          <div className="border-t border-gray-800 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                Liquidation Price
              </span>
              <span className="text-yellow-400 font-mono">${liquidationPrice}</span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Trading Fee</span>
              <span className="text-gray-300 font-mono">0.05%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Funding Rate</span>
              <span className={`font-mono ${side === 'long' ? 'text-red-400' : `text-${theme}-400`}`}>
                {side === 'long' ? '-' : '+'}0.01%/8h
              </span>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        {leverage[0] >= 20 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start gap-2 text-xs text-yellow-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">High Leverage Warning</p>
                <p className="text-yellow-400/70 mt-1">
                  Using {leverage[0]}x leverage significantly increases your risk. You could lose your entire position quickly.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {tokenSelectorOpen && (
        <TokenSelector
          open={tokenSelectorOpen}
          onClose={() => setTokenSelectorOpen(false)}
          onSelect={(token) => { setSelectedToken(token); setTokenSelectorOpen(false); }}
        />
      )}
    </div>
  );
}