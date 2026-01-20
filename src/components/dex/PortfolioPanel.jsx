import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { BASE_TOKENS, formatBalance, formatUSD, shortenAddress } from './dexUtils';

export default function PortfolioPanel({ walletAddress, theme = 'lime' }) {
  const [hideBalances, setHideBalances] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');

  // Mock portfolio data
  const totalValue = 12847.32;
  const totalChange = 3.2;
  const tokens = BASE_TOKENS.map(t => ({
    ...t,
    value: t.balance * t.price,
    change24h: (Math.random() - 0.4) * 10
  })).sort((a, b) => b.value - a.value);

  const positions = [
    { pair: 'ETH/USDC', type: 'Long', size: '$2,500', pnl: '+$124.50', pnlPercent: 4.98 },
    { pair: 'AERO/ETH', type: 'Short', size: '$1,200', pnl: '-$32.10', pnlPercent: -2.67 }
  ];

  return (
    <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className={`w-4 h-4 text-${theme}-400`} />
            <span className="text-sm font-medium text-white">Portfolio</span>
            <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-700">
              {shortenAddress(walletAddress)}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => setHideBalances(!hideBalances)}
            >
              {hideBalances ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Total Value */}
        <div>
          <div className="text-2xl font-bold text-white font-mono">
            {hideBalances ? '••••••' : formatUSD(totalValue)}
          </div>
          <div className={`flex items-center gap-1 text-sm ${totalChange >= 0 ? `text-${theme}-400` : 'text-red-400'}`}>
            {totalChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%</span>
            <span className="text-gray-500">24h</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-transparent border-b border-gray-800/50 rounded-none h-9">
          <TabsTrigger 
            value="tokens" 
            className={`flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-${theme}-400 data-[state=active]:text-${theme}-400 rounded-none`}
          >
            Tokens
          </TabsTrigger>
          <TabsTrigger 
            value="positions" 
            className={`flex-1 text-xs data-[state=active]:border-b-2 data-[state=active]:border-${theme}-400 data-[state=active]:text-${theme}-400 rounded-none`}
          >
            Positions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="p-2 max-h-[300px] overflow-y-auto">
          <div className="space-y-1">
            {tokens.filter(t => t.value > 0).map(token => (
              <div 
                key={token.symbol}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <img src={token.logo} alt="" className="w-7 h-7 rounded-full" />
                  <div>
                    <div className="text-sm font-medium text-white">{token.symbol}</div>
                    <div className="text-[10px] text-gray-500">
                      {hideBalances ? '••••' : formatBalance(token.balance)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white font-mono">
                    {hideBalances ? '••••' : formatUSD(token.value)}
                  </div>
                  <div className={`flex items-center justify-end gap-0.5 text-[10px] ${
                    token.change24h >= 0 ? `text-${theme}-400` : 'text-red-400'
                  }`}>
                    {token.change24h >= 0 ? 
                      <ArrowUpRight className="w-2.5 h-2.5" /> : 
                      <ArrowDownRight className="w-2.5 h-2.5" />
                    }
                    {Math.abs(token.change24h).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="p-2">
          {positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No open positions
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map((pos, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{pos.pair}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          pos.type === 'Long' 
                            ? `text-${theme}-400 border-${theme}-500/30` 
                            : 'text-red-400 border-red-500/30'
                        }`}
                      >
                        {pos.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">{pos.size}</span>
                  </div>
                  <div className={`text-sm font-mono ${pos.pnlPercent >= 0 ? `text-${theme}-400` : 'text-red-400'}`}>
                    {pos.pnl} ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent}%)
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}