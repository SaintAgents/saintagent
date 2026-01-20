import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, ChevronDown, Loader2, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import TokenSelector from './TokenSelector';
import RouteDisplay from './RouteDisplay';
import { BASE_TOKENS, formatBalance, formatUSD } from './dexUtils';

export default function SwapInterface({ walletConnected, walletAddress, slippage, gasPriority }) {
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
    };

    const timer = setTimeout(fetchQuote, 300);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken]);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Swap Card */}
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-black/40 rounded-xl p-4 border border-lime-500/10">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>You Pay</span>
              <span>Balance: {formatBalance(fromToken.balance || 0)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent border-0 text-2xl font-mono text-white placeholder:text-gray-600 focus-visible:ring-0"
              />
              <Button
                variant="outline"
                className="bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20 text-lime-400"
                onClick={() => setTokenSelectorOpen('from')}
              >
                <img src={fromToken.logo} alt="" className="w-5 h-5 rounded-full mr-2" />
                {fromToken.symbol}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {fromAmount && (
              <div className="text-sm text-gray-500 mt-1">
                ≈ {formatUSD(parseFloat(fromAmount) * (fromToken.price || 0))}
              </div>
            )}
          </div>

          {/* Switch Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={switchTokens}
              className="bg-black border-lime-500/30 hover:bg-lime-500/20 hover:border-lime-500 text-lime-400 rounded-full h-10 w-10"
            >
              <ArrowDown className="w-5 h-5" />
            </Button>
          </div>

          {/* To Token */}
          <div className="bg-black/40 rounded-xl p-4 border border-lime-500/10">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>You Receive</span>
              <span>Balance: {formatBalance(toToken.balance || 0)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-2xl font-mono text-white">
                {quoteLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                ) : (
                  toAmount || '0.0'
                )}
              </div>
              <Button
                variant="outline"
                className="bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20 text-lime-400"
                onClick={() => setTokenSelectorOpen('to')}
              >
                <img src={toToken.logo} alt="" className="w-5 h-5 rounded-full mr-2" />
                {toToken.symbol}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
            {toAmount && (
              <div className="text-sm text-gray-500 mt-1">
                ≈ {formatUSD(parseFloat(toAmount) * (toToken.price || 0))}
              </div>
            )}
          </div>

          {/* Price Info */}
          {route && (
            <div className="bg-lime-500/5 rounded-lg p-3 text-sm space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Rate</span>
                <span className="text-white">
                  1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Price Impact</span>
                <span className={priceImpact > 1 ? 'text-red-400' : 'text-lime-400'}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Slippage</span>
                <span className="text-white">{slippage}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Est. Gas</span>
                <span className="text-white">{route.estimatedGas} ETH</span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black"
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
                Swapping...
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
        </div>
      </Card>

      {/* Route Display */}
      <div className="space-y-6">
        <RouteDisplay route={route} fromToken={fromToken} toToken={toToken} />
        
        {/* Quick Stats */}
        <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Network Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Gas Price</div>
              <div className="text-white font-mono">0.001 Gwei</div>
            </div>
            <div>
              <div className="text-gray-500">Block</div>
              <div className="text-lime-400 font-mono">#28,547,892</div>
            </div>
            <div>
              <div className="text-gray-500">TVL (Base)</div>
              <div className="text-white font-mono">$1.2B</div>
            </div>
            <div>
              <div className="text-gray-500">24h Volume</div>
              <div className="text-white font-mono">$456M</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Token Selector Modal */}
      {tokenSelectorOpen && (
        <TokenSelector
          open={!!tokenSelectorOpen}
          onClose={() => setTokenSelectorOpen(null)}
          onSelect={handleTokenSelect}
          excludeToken={tokenSelectorOpen === 'from' ? toToken : fromToken}
        />
      )}
    </div>
  );
}