import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ChevronDown, Loader2, Zap, AlertCircle, CheckCircle2, RefreshCw, Info, Percent } from 'lucide-react';
import TokenSelector from './TokenSelector';
import RouteDisplay from './RouteDisplay';
import { BASE_TOKENS, formatBalance, formatUSD } from './dexUtils';

export default function SwapInterface({ walletConnected, walletAddress, slippage, gasPriority, onPairChange, theme = 'lime' }) {
  const [fromToken, setFromToken] = useState(BASE_TOKENS[0]); // ETH
  const [toToken, setToToken] = useState(BASE_TOKENS[1]); // USDC
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [priceImpact, setPriceImpact] = useState(0);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(null);
  const [swapStatus, setSwapStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  // Simulate fetching quote when amount changes
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setRoute(null);
      return;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      // Simulate API call to 0x or OpenOcean
      await new Promise(r => setTimeout(r, 500));
      
      // Mock price calculation
      const mockPrices = {
        'ETH': 3200,
        'USDC': 1,
        'WETH': 3200,
        'DAI': 1,
        'USDT': 1,
        'AERO': 1.5,
        'cbBTC': 42000,
        'DEGEN': 0.01
      };

      const fromPrice = mockPrices[fromToken.symbol] || 1;
      const toPrice = mockPrices[toToken.symbol] || 1;
      const calculated = (parseFloat(fromAmount) * fromPrice) / toPrice;
      
      setToAmount(calculated.toFixed(6));
      setPriceImpact(Math.random() * 0.5); // Mock price impact
      
      // Mock route
      setRoute({
        dex: Math.random() > 0.5 ? 'Uniswap V3' : 'Aerodrome',
        hops: fromToken.symbol === 'ETH' && toToken.symbol !== 'USDC' ? 2 : 1,
        path: fromToken.symbol === 'ETH' && toToken.symbol !== 'USDC' 
          ? [fromToken.symbol, 'USDC', toToken.symbol]
          : [fromToken.symbol, toToken.symbol],
        estimatedGas: '0.0012',
        savings: (Math.random() * 2).toFixed(2)
      });
      
      setQuoteLoading(false);
      
      // Notify parent of pair change
      if (onPairChange) {
        onPairChange({ from: fromToken.symbol, to: toToken.symbol });
      }
    };

    const timer = setTimeout(fetchQuote, 300);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken]);

  const refreshQuote = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setRefreshing(false);
  };

  const handleSwap = async () => {
    if (!walletConnected) return;
    
    setLoading(true);
    setSwapStatus('pending');
    
    // Simulate swap transaction
    await new Promise(r => setTimeout(r, 2000));
    
    setSwapStatus('success');
    setLoading(false);
    
    // Reset after showing success
    setTimeout(() => {
      setSwapStatus(null);
      setFromAmount('');
      setToAmount('');
    }, 3000);
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  const handleTokenSelect = (token) => {
    if (tokenSelectorOpen === 'from') {
      if (token.symbol === toToken.symbol) {
        setToToken(fromToken);
      }
      setFromToken(token);
    } else {
      if (token.symbol === fromToken.symbol) {
        setFromToken(toToken);
      }
      setToToken(token);
    }
    setTokenSelectorOpen(null);
  };

  return (
    <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-5`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white">Swap</h3>
            <Badge variant="outline" className={`text-[10px] text-${theme}-400 border-${theme}-500/30`}>
              Best Route
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-7 w-7 text-gray-400 hover:text-white ${refreshing ? 'animate-spin' : ''}`}
              onClick={refreshQuote}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* From Token */}
        <div className={`bg-black/40 rounded-xl p-4 border border-${theme}-500/10 transition-all hover:border-${theme}-500/30`}>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>You Pay</span>
            <button 
              className={`hover:text-${theme}-400 transition-colors`}
              onClick={() => setFromAmount(fromToken.balance?.toString() || '0')}
            >
              Balance: {formatBalance(fromToken.balance || 0)}
              <span className={`ml-1 text-${theme}-400`}>MAX</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent border-0 text-2xl font-mono text-white placeholder:text-gray-600 focus-visible:ring-0 p-0"
            />
            <Button
              variant="outline"
              className={`bg-${theme}-500/10 border-${theme}-500/30 hover:bg-${theme}-500/20 text-${theme}-400 h-10`}
              onClick={() => setTokenSelectorOpen('from')}
            >
              <img src={fromToken.logo} alt="" className="w-5 h-5 rounded-full mr-2" />
              {fromToken.symbol}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {fromAmount && (
            <div className="text-xs text-gray-500 mt-1.5">
              ≈ {formatUSD(parseFloat(fromAmount) * (fromToken.price || 0))}
            </div>
          )}
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={switchTokens}
            className={`bg-black border-${theme}-500/30 hover:bg-${theme}-500/20 hover:border-${theme}-500 text-${theme}-400 rounded-full h-9 w-9 shadow-lg shadow-black/50`}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className={`bg-black/40 rounded-xl p-4 border border-${theme}-500/10 transition-all hover:border-${theme}-500/30`}>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>You Receive</span>
            <span>Balance: {formatBalance(toToken.balance || 0)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-mono text-white">
              {quoteLoading ? (
                <Loader2 className={`w-5 h-5 animate-spin text-${theme}-400`} />
              ) : (
                <span className={toAmount ? 'text-white' : 'text-gray-600'}>{toAmount || '0.0'}</span>
              )}
            </div>
            <Button
              variant="outline"
              className={`bg-${theme}-500/10 border-${theme}-500/30 hover:bg-${theme}-500/20 text-${theme}-400 h-10`}
              onClick={() => setTokenSelectorOpen('to')}
            >
              <img src={toToken.logo} alt="" className="w-5 h-5 rounded-full mr-2" />
              {toToken.symbol}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {toAmount && (
            <div className="text-xs text-gray-500 mt-1.5">
              ≈ {formatUSD(parseFloat(toAmount) * (toToken.price || 0))}
            </div>
          )}
        </div>

        {/* Price Info */}
        {route && (
          <div className={`bg-${theme}-500/5 rounded-xl p-3 border border-${theme}-500/10`}>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-xs"
            >
              <span className="text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}
              </span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-800/50 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Price Impact
                  </span>
                  <span className={priceImpact > 1 ? 'text-red-400' : `text-${theme}-400`}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Min. Received</span>
                  <span className="text-white font-mono">
                    {(parseFloat(toAmount) * (1 - slippage/100)).toFixed(4)} {toToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Slippage Tolerance</span>
                  <span className={`text-${theme}-400`}>{slippage}%</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Route</span>
                  <span className="text-white">{route.dex} ({route.hops} hop{route.hops > 1 ? 's' : ''})</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Network Fee</span>
                  <span className="text-white font-mono">~${(parseFloat(route.estimatedGas) * 3200).toFixed(2)}</span>
                </div>
                {parseFloat(route.savings) > 0 && (
                  <div className={`flex justify-between text-${theme}-400`}>
                    <span>You Save</span>
                    <span className="font-mono">${route.savings}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Swap Button */}
        <Button
          className={`w-full h-12 text-base font-semibold bg-gradient-to-r from-${theme}-500 to-emerald-500 hover:from-${theme}-400 hover:to-emerald-400 text-black shadow-lg shadow-${theme}-500/20`}
          disabled={!walletConnected || !fromAmount || loading}
          onClick={handleSwap}
        >
          {swapStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Swap Successful!
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Confirming...
            </>
          ) : !walletConnected ? (
            'Connect Wallet'
          ) : !fromAmount ? (
            'Enter Amount'
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Swap
            </>
          )}
        </Button>

        {/* Route Preview */}
        {route && (
          <RouteDisplay route={route} fromToken={fromToken} toToken={toToken} theme={theme} compact />
        )}
      </div>

      {/* Token Selector Modal */}
      {tokenSelectorOpen && (
        <TokenSelector
          open={!!tokenSelectorOpen}
          onClose={() => setTokenSelectorOpen(null)}
          onSelect={handleTokenSelect}
          excludeToken={tokenSelectorOpen === 'from' ? toToken : fromToken}
          theme={theme}
        />
      )}
    </Card>
  );
}