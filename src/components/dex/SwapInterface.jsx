import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDown, ChevronDown, Loader2, Zap, AlertCircle, CheckCircle2, RefreshCw, Info, Percent, Clock, Target, X, Trash2 } from 'lucide-react';
import TokenSelector from './TokenSelector';
import RouteDisplay from './RouteDisplay';
import { BASE_TOKENS, formatBalance, formatUSD } from './dexUtils';
import { format } from 'date-fns';

export default function SwapInterface({ walletConnected, walletAddress, slippage, gasPriority, onPairChange, theme = 'lime', isLightTheme = false }) {
  const [orderType, setOrderType] = useState('market'); // 'market' or 'limit'
  const [fromToken, setFromToken] = useState(BASE_TOKENS[0]); // ETH
  const [toToken, setToToken] = useState(BASE_TOKENS[1]); // USDC
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [priceImpact, setPriceImpact] = useState(0);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(null);
  const [swapStatus, setSwapStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [showOpenOrders, setShowOpenOrders] = useState(false);
  const [localSlippage, setLocalSlippage] = useState(slippage || 0.5);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: openOrders = [] } = useQuery({
    queryKey: ['limitOrders', currentUser?.email],
    queryFn: () => base44.entities.LimitOrder.filter({ user_id: currentUser.email, status: 'open' }, '-created_date', 20),
    enabled: !!currentUser?.email
  });

  const createLimitOrderMutation = useMutation({
    mutationFn: async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      return base44.entities.LimitOrder.create({
        user_id: currentUser.email,
        from_token: fromToken.symbol,
        to_token: toToken.symbol,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        limit_price: parseFloat(limitPrice),
        status: 'open',
        expiry_date: expiryDate.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limitOrders'] });
      setSwapStatus('success');
      setTimeout(() => {
        setSwapStatus(null);
        setFromAmount('');
        setToAmount('');
        setLimitPrice('');
      }, 3000);
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId) => base44.entities.LimitOrder.update(orderId, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['limitOrders'] })
  });

  // Calculate limit order output when limit price changes
  useEffect(() => {
    if (orderType === 'limit' && fromAmount && limitPrice) {
      const calculated = parseFloat(fromAmount) * parseFloat(limitPrice);
      setToAmount(calculated.toFixed(6));
    }
  }, [limitPrice, fromAmount, orderType]);

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

  const cardBg = isLightTheme ? 'bg-white' : 'bg-black/40';
  const textPrimary = isLightTheme ? 'text-gray-900' : 'text-white';
  const textSecondary = isLightTheme ? 'text-gray-600' : 'text-gray-400';
  const inputBg = isLightTheme ? 'bg-gray-100' : 'bg-black/40';
  const borderColor = isLightTheme ? 'border-gray-300' : `border-${theme}-500/20`;

  // Get current market price for limit order reference
  const mockPrices = {
    'ETH': 3200, 'USDC': 1, 'WETH': 3200, 'DAI': 1, 'USDT': 1, 'AERO': 1.5, 'cbBTC': 42000, 'DEGEN': 0.01
  };
  const currentMarketPrice = (mockPrices[fromToken.symbol] || 1) / (mockPrices[toToken.symbol] || 1);

  return (
    <Card className={`${cardBg} border ${borderColor} backdrop-blur-xl p-5`}>
      <div className="space-y-3">
        {/* Header with Order Type Tabs */}
        <div className="flex items-center justify-between mb-2">
          <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className={`${isLightTheme ? 'bg-gray-100' : 'bg-black/40'} h-8`}>
                <TabsTrigger value="market" className="text-xs h-6 px-3">
                  <Zap className="w-3 h-3 mr-1" />
                  Market
                </TabsTrigger>
                <TabsTrigger value="limit" className="text-xs h-6 px-3">
                  <Target className="w-3 h-3 mr-1" />
                  Limit
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1">
                {openOrders.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOpenOrders(!showOpenOrders)}
                    className={`h-7 text-xs ${textSecondary}`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {openOrders.length} Open
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-7 w-7 ${textSecondary} hover:text-white ${refreshing ? 'animate-spin' : ''}`}
                  onClick={refreshQuote}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Slippage Tolerance Input */}
        <div className={`flex items-center justify-between p-2.5 rounded-lg ${inputBg} border ${isLightTheme ? 'border-gray-200' : `border-${theme}-500/10`}`}>
          <div className="flex items-center gap-2">
            <Percent className={`w-3.5 h-3.5 text-${theme}-400`} />
            <span className={`text-xs ${textSecondary}`}>Slippage Tolerance</span>
          </div>
          <div className="flex items-center gap-1">
            {[0.1, 0.5, 1.0].map((val) => (
              <button
                key={val}
                onClick={() => setLocalSlippage(val)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  localSlippage === val
                    ? `bg-${theme}-500/20 text-${theme}-400 border border-${theme}-500/30`
                    : `${textSecondary} hover:text-white`
                }`}
              >
                {val}%
              </button>
            ))}
            <Input
              type="number"
              value={localSlippage}
              onChange={(e) => setLocalSlippage(parseFloat(e.target.value) || 0.5)}
              className={`w-14 h-6 text-xs text-center ${isLightTheme ? 'bg-white border-gray-300' : 'bg-black/60 border-gray-700'} ${textPrimary}`}
              step="0.1"
              min="0.1"
              max="50"
            />
            <span className={`text-[10px] ${textSecondary}`}>%</span>
          </div>
        </div>

        {/* Open Orders Panel */}
        {showOpenOrders && openOrders.length > 0 && (
          <div className={`${inputBg} rounded-xl p-3 border ${isLightTheme ? 'border-gray-200' : `border-${theme}-500/20`}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${textPrimary}`}>Open Limit Orders</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowOpenOrders(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {openOrders.map((order) => (
                  <div key={order.id} className={`flex items-center justify-between p-2 rounded-lg ${isLightTheme ? 'bg-gray-50' : 'bg-black/30'}`}>
                    <div className="flex-1">
                      <div className={`text-xs font-medium ${textPrimary}`}>
                        {order.from_amount} {order.from_token} → {order.to_token}
                      </div>
                      <div className={`text-[10px] ${textSecondary}`}>
                        @ {order.limit_price} • Expires {format(new Date(order.expiry_date), 'MMM d')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-500"
                      onClick={() => cancelOrderMutation.mutate(order.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* From Token */}
        <div className={`${inputBg} rounded-xl p-4 border ${isLightTheme ? 'border-gray-200 hover:border-gray-300' : `border-${theme}-500/10 hover:border-${theme}-500/30`} transition-all`}>
          <div className={`flex justify-between text-xs ${textSecondary} mb-2`}>
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
              className={`flex-1 bg-transparent border-0 text-2xl font-mono ${textPrimary} placeholder:text-gray-400 focus-visible:ring-0 p-0`}
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
            <div className={`text-xs ${textSecondary} mt-1.5`}>
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
            className={`${isLightTheme ? 'bg-white border-gray-300 hover:bg-gray-100 text-violet-600' : `bg-black border-${theme}-500/30 hover:bg-${theme}-500/20 text-${theme}-400`} rounded-full h-9 w-9 shadow-lg`}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className={`${inputBg} rounded-xl p-4 border ${isLightTheme ? 'border-gray-200 hover:border-gray-300' : `border-${theme}-500/10 hover:border-${theme}-500/30`} transition-all`}>
          <div className={`flex justify-between text-xs ${textSecondary} mb-2`}>
            <span>You Receive</span>
            <span>Balance: {formatBalance(toToken.balance || 0)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex-1 text-2xl font-mono ${textPrimary}`}>
              {quoteLoading ? (
                <Loader2 className={`w-5 h-5 animate-spin text-${theme}-400`} />
              ) : (
                <span className={toAmount ? textPrimary : 'text-gray-400'}>{toAmount || '0.0'}</span>
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
            <div className={`text-xs ${textSecondary} mt-1.5`}>
              ≈ {formatUSD(parseFloat(toAmount) * (toToken.price || 0))}
            </div>
          )}
        </div>

        {/* Limit Order Settings */}
        {orderType === 'limit' && (
          <div className={`${isLightTheme ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'} rounded-xl p-4 border space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${textPrimary}`}>Limit Price</span>
              <span className={`text-[10px] ${textSecondary}`}>
                Market: {currentMarketPrice.toFixed(6)} {toToken.symbol}/{fromToken.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={currentMarketPrice.toFixed(6)}
                className={`flex-1 ${isLightTheme ? 'bg-white border-blue-200' : 'bg-black/40 border-blue-500/30'} text-sm font-mono`}
              />
              <span className={`text-xs ${textSecondary}`}>{toToken.symbol}/{fromToken.symbol}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textSecondary}`}>Expires in:</span>
              <div className="flex gap-1">
                {[1, 7, 30].map((days) => (
                  <Button
                    key={days}
                    size="sm"
                    variant={expiryDays === days ? 'default' : 'outline'}
                    className={`h-6 text-xs px-2 ${expiryDays === days ? `bg-${theme}-500 text-white` : ''}`}
                    onClick={() => setExpiryDays(days)}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
            {limitPrice && (
              <div className={`text-xs ${parseFloat(limitPrice) > currentMarketPrice ? 'text-green-500' : 'text-amber-500'}`}>
                {parseFloat(limitPrice) > currentMarketPrice 
                  ? `+${(((parseFloat(limitPrice) / currentMarketPrice) - 1) * 100).toFixed(2)}% above market`
                  : `-${((1 - (parseFloat(limitPrice) / currentMarketPrice)) * 100).toFixed(2)}% below market`
                }
              </div>
            )}
          </div>
        )}

        {/* Price Info */}
        {route && (
          <div className={`${isLightTheme ? 'bg-violet-50 border-violet-200' : `bg-${theme}-500/5 border-${theme}-500/10`} rounded-xl p-3 border`}>
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
              <div className={`mt-3 pt-3 border-t ${isLightTheme ? 'border-gray-200' : 'border-gray-800/50'} space-y-2 text-xs`}>
                <div className={`flex justify-between ${textSecondary}`}>
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Price Impact
                  </span>
                  <span className={priceImpact > 1 ? 'text-red-400' : `text-${theme}-400`}>
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className={`flex justify-between ${textSecondary}`}>
                  <span>Min. Received</span>
                  <span className={`${textPrimary} font-mono`}>
                    {(parseFloat(toAmount) * (1 - localSlippage/100)).toFixed(4)} {toToken.symbol}
                  </span>
                </div>
                <div className={`flex justify-between ${textSecondary}`}>
                  <span>Slippage Tolerance</span>
                  <span className={`text-${theme}-400`}>{localSlippage}%</span>
                </div>
                <div className={`flex justify-between ${textSecondary}`}>
                  <span>Route</span>
                  <span className={textPrimary}>{route.dex} ({route.hops} hop{route.hops > 1 ? 's' : ''})</span>
                </div>
                <div className={`flex justify-between ${textSecondary}`}>
                  <span>Network Fee</span>
                  <span className={`${textPrimary} font-mono`}>~${(parseFloat(route.estimatedGas) * 3200).toFixed(2)}</span>
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

        {/* Swap/Limit Order Button */}
        <Button
          className={`w-full h-12 text-base font-semibold bg-gradient-to-r from-${theme}-500 to-emerald-500 hover:from-${theme}-400 hover:to-emerald-400 text-black shadow-lg shadow-${theme}-500/20`}
          disabled={!walletConnected || !fromAmount || loading || (orderType === 'limit' && !limitPrice)}
          onClick={orderType === 'limit' ? () => createLimitOrderMutation.mutate() : handleSwap}
        >
          {swapStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {orderType === 'limit' ? 'Order Placed!' : 'Swap Successful!'}
            </>
          ) : loading || createLimitOrderMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {orderType === 'limit' ? 'Placing Order...' : 'Confirming...'}
            </>
          ) : !walletConnected ? (
            'Connect Wallet'
          ) : !fromAmount ? (
            'Enter Amount'
          ) : orderType === 'limit' && !limitPrice ? (
            'Enter Limit Price'
          ) : orderType === 'limit' ? (
            <>
              <Target className="w-5 h-5 mr-2" />
              Place Limit Order
            </>
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