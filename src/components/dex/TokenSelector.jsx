import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Star } from 'lucide-react';
import { BASE_TOKENS, formatBalance, formatUSD } from './dexUtils';

export default function TokenSelector({ open, onClose, onSelect, excludeToken }) {
  const [search, setSearch] = useState('');

  const filteredTokens = BASE_TOKENS.filter(token => {
    if (excludeToken && token.symbol === excludeToken.symbol) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return token.symbol.toLowerCase().includes(q) || token.name.toLowerCase().includes(q);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0f] border border-lime-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lime-400">Select Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or address"
              className="pl-10 bg-black/40 border-lime-500/20 text-white placeholder:text-gray-500 focus:border-lime-500"
            />
          </div>

          {/* Popular tokens */}
          <div>
            <div className="text-xs text-gray-500 mb-2">Popular Tokens</div>
            <div className="flex flex-wrap gap-2">
              {BASE_TOKENS.slice(0, 5).map(token => (
                <button
                  key={token.symbol}
                  onClick={() => onSelect(token)}
                  disabled={excludeToken?.symbol === token.symbol}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/20 hover:bg-lime-500/20 hover:border-lime-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <img src={token.logo} alt="" className="w-4 h-4 rounded-full" />
                  <span className="text-sm text-white">{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filteredTokens.map(token => (
              <button
                key={token.symbol}
                onClick={() => onSelect(token)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-lime-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={token.logo} alt="" className="w-8 h-8 rounded-full" />
                  <div className="text-left">
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono">{formatBalance(token.balance)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(token.balance * token.price)}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom token input */}
          <div className="pt-2 border-t border-lime-500/20">
            <div className="text-xs text-gray-500 mb-2">Or paste token address</div>
            <Input
              placeholder="0x..."
              className="font-mono text-sm bg-black/40 border-lime-500/20 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}