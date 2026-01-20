import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Check, Clock, X, Filter } from 'lucide-react';
import { formatUSD, shortenAddress } from './dexUtils';

const MOCK_TRANSACTIONS = [
  {
    id: '0x1234',
    type: 'swap',
    from: { symbol: 'ETH', amount: '0.5' },
    to: { symbol: 'USDC', amount: '1600' },
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 5,
    hash: '0x1234567890abcdef1234567890abcdef12345678'
  },
  {
    id: '0x2345',
    type: 'swap',
    from: { symbol: 'USDC', amount: '500' },
    to: { symbol: 'AERO', amount: '333.33' },
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    hash: '0x2345678901abcdef2345678901abcdef23456789'
  },
  {
    id: '0x3456',
    type: 'limit',
    from: { symbol: 'ETH', amount: '1.0' },
    to: { symbol: 'USDC', amount: '3500' },
    status: 'pending',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    triggerPrice: '3500'
  },
  {
    id: '0x4567',
    type: 'dca',
    from: { symbol: 'USDC', amount: '100' },
    to: { symbol: 'ETH', amount: '0.03125' },
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
    hash: '0x4567890123abcdef4567890123abcdef45678901'
  },
  {
    id: '0x5678',
    type: 'swap',
    from: { symbol: 'DEGEN', amount: '10000' },
    to: { symbol: 'ETH', amount: '0.1' },
    status: 'failed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    error: 'Slippage exceeded'
  }
];

export default function TransactionHistory({ walletAddress }) {
  const [filter, setFilter] = useState('all');
  const [transactions] = useState(MOCK_TRANSACTIONS);

  const filteredTxs = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4 text-lime-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-lime-500/20 text-lime-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!walletAddress) {
    return (
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-8 text-center">
        <div className="text-gray-500">
          <ArrowUpRight className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Connect your wallet to view transaction history</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Transaction History</h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-black/40 border border-lime-500/20">
              <TabsTrigger value="all" className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="swap" className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 text-xs">
                Swaps
              </TabsTrigger>
              <TabsTrigger value="limit" className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 text-xs">
                Limits
              </TabsTrigger>
              <TabsTrigger value="dca" className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400 text-xs">
                DCA
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTxs.map(tx => (
            <div 
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-lime-500/10 hover:border-lime-500/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Type indicator */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'swap' ? 'bg-lime-500/20' : 
                  tx.type === 'limit' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                }`}>
                  {tx.type === 'swap' ? (
                    <ArrowUpRight className="w-5 h-5 text-lime-400" />
                  ) : tx.type === 'limit' ? (
                    <ArrowDownLeft className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-purple-400" />
                  )}
                </div>

                {/* Transaction details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {tx.from.amount} {tx.from.symbol}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="text-white font-medium">
                      {tx.to.amount} {tx.to.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="capitalize">{tx.type}</span>
                    <span>•</span>
                    <span>{formatTime(tx.timestamp)}</span>
                    {tx.triggerPrice && (
                      <>
                        <span>•</span>
                        <span>@ {tx.triggerPrice}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${getStatusColor(tx.status)}`}>
                  {getStatusIcon(tx.status)}
                  <span className="capitalize">{tx.status}</span>
                </div>

                {tx.hash && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-lime-400 h-8 w-8"
                    onClick={() => window.open(`https://basescan.org/tx/${tx.hash}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredTxs.length > 0 && (
        <Button
          variant="outline"
          className="w-full mt-4 border-lime-500/30 text-lime-400 hover:bg-lime-500/10"
        >
          Load More
        </Button>
      )}
    </Card>
  );
}