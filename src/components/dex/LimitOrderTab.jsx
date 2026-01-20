import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { BASE_TOKENS, formatBalance, formatUSD } from './dexUtils';
import TokenSelector from './TokenSelector';

export default function LimitOrderTab({ walletConnected, walletAddress }) {
  const [fromToken, setFromToken] = useState(BASE_TOKENS[0]);
  const [toToken, setToToken] = useState(BASE_TOKENS[1]);
  const [amount, setAmount] = useState('');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(null);
  const [orders, setOrders] = useState([
    { id: 1, from: 'ETH', to: 'USDC', amount: '0.5', trigger: '3500', status: 'active' },
    { id: 2, from: 'USDC', to: 'ETH', amount: '1000', trigger: '2800', status: 'active' }
  ]);

  const handleTokenSelect = (token) => {
    if (tokenSelectorOpen === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setTokenSelectorOpen(null);
  };

  const createOrder = () => {
    if (!amount || !triggerPrice) return;
    const newOrder = {
      id: Date.now(),
      from: fromToken.symbol,
      to: toToken.symbol,
      amount,
      trigger: triggerPrice,
      status: 'active'
    };
    setOrders([newOrder, ...orders]);
    setAmount('');
    setTriggerPrice('');
  };

  const cancelOrder = (id) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const currentPrice = (fromToken.price / toToken.price).toFixed(6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Order */}
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Create Limit Order</h3>

        <div className="space-y-4">
          {/* Amount */}
          <div className="bg-black/40 rounded-xl p-4 border border-lime-500/10">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Sell Amount</span>
              <span>Balance: {formatBalance(fromToken.balance)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
          </div>

          {/* Trigger Price */}
          <div className="bg-black/40 rounded-xl p-4 border border-lime-500/10">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Trigger Price ({toToken.symbol})</span>
              <span>Current: {currentPrice}</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                placeholder={currentPrice}
                className="flex-1 bg-transparent border-0 text-2xl font-mono text-white placeholder:text-gray-600 focus-visible:ring-0"
              />
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
          </div>

          {/* Info */}
          {amount && triggerPrice && (
            <div className="bg-lime-500/5 rounded-lg p-3 text-sm space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>You'll receive (est.)</span>
                <span className="text-white">
                  {(parseFloat(amount) * parseFloat(triggerPrice)).toFixed(4)} {toToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Price difference</span>
                <span className={parseFloat(triggerPrice) > parseFloat(currentPrice) ? 'text-lime-400' : 'text-red-400'}>
                  {(((parseFloat(triggerPrice) - parseFloat(currentPrice)) / parseFloat(currentPrice)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black"
            disabled={!walletConnected || !amount || !triggerPrice}
            onClick={createOrder}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Limit Order
          </Button>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Limit orders are stored off-chain and executed when the price reaches your target.</p>
          </div>
        </div>
      </Card>

      {/* Active Orders */}
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Orders</h3>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active limit orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div 
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-lime-500/10"
              >
                <div>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <span>{order.from}</span>
                    <span className="text-gray-500">→</span>
                    <span>{order.to}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {order.amount} {order.from} @ {order.trigger} {order.to}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-lime-500/20 text-lime-400">
                    {order.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelOrder(order.id)}
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

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