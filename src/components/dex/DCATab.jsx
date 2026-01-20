import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Calendar, Clock, TrendingUp, Pause, Play, Trash2 } from 'lucide-react';
import { BASE_TOKENS, DCA_FREQUENCIES, formatBalance, formatUSD } from './dexUtils';
import TokenSelector from './TokenSelector';

export default function DCATab({ walletConnected, walletAddress }) {
  const [fromToken, setFromToken] = useState(BASE_TOKENS[1]); // USDC
  const [toToken, setToToken] = useState(BASE_TOKENS[0]); // ETH
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [duration, setDuration] = useState('30');
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(null);
  const [dcaOrders, setDcaOrders] = useState([
    { 
      id: 1, 
      from: 'USDC', 
      to: 'ETH', 
      amount: '100', 
      frequency: 'daily', 
      remaining: 25,
      total: 30,
      status: 'active',
      nextExecution: '2h 15m'
    }
  ]);

  const handleTokenSelect = (token) => {
    if (tokenSelectorOpen === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setTokenSelectorOpen(null);
  };

  const createDCA = () => {
    if (!amount || !frequency || !duration) return;
    const newDCA = {
      id: Date.now(),
      from: fromToken.symbol,
      to: toToken.symbol,
      amount,
      frequency,
      remaining: parseInt(duration),
      total: parseInt(duration),
      status: 'active',
      nextExecution: frequency === 'hourly' ? '1h' : frequency === 'daily' ? '24h' : '7d'
    };
    setDcaOrders([newDCA, ...dcaOrders]);
    setAmount('');
    setDuration('30');
  };

  const toggleDCA = (id) => {
    setDcaOrders(dcaOrders.map(o => 
      o.id === id ? { ...o, status: o.status === 'active' ? 'paused' : 'active' } : o
    ));
  };

  const cancelDCA = (id) => {
    setDcaOrders(dcaOrders.filter(o => o.id !== id));
  };

  const totalInvestment = parseFloat(amount || 0) * parseInt(duration || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create DCA */}
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Schedule DCA</h3>

        <div className="space-y-4">
          {/* Amount per order */}
          <div className="bg-black/40 rounded-xl p-4 border border-lime-500/10">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Amount per Order</span>
              <span>Balance: {formatBalance(fromToken.balance)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
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

          {/* Buy Token */}
          <div className="bg-black/40 rounded-xl p-4 border border-lime-500/10">
            <div className="text-sm text-gray-400 mb-2">Buy Token</div>
            <Button
              variant="outline"
              className="w-full justify-between bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20 text-lime-400"
              onClick={() => setTokenSelectorOpen('to')}
            >
              <div className="flex items-center gap-2">
                <img src={toToken.logo} alt="" className="w-5 h-5 rounded-full" />
                <span>{toToken.name}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Frequency & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Frequency</label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="bg-black/40 border-lime-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0f] border-lime-500/30">
                  {DCA_FREQUENCIES.map(f => (
                    <SelectItem key={f.value} value={f.value} className="text-white focus:bg-lime-500/20">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Number of Orders</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="bg-black/40 border-lime-500/30 text-white"
              />
            </div>
          </div>

          {/* Summary */}
          {amount && duration && (
            <div className="bg-lime-500/5 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Investment</span>
                <span className="text-white font-mono">{formatUSD(totalInvestment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">
                  {duration} {frequency === 'hourly' ? 'hours' : frequency === 'daily' ? 'days' : frequency === 'weekly' ? 'weeks' : 'periods'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">First Execution</span>
                <span className="text-lime-400">Immediately</span>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black"
            disabled={!walletConnected || !amount || !duration}
            onClick={createDCA}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Start DCA Schedule
          </Button>
        </div>
      </Card>

      {/* Active DCA Orders */}
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active DCA Schedules</h3>

        {dcaOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No active DCA schedules</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dcaOrders.map(order => (
              <div 
                key={order.id}
                className="p-4 rounded-xl bg-black/30 border border-lime-500/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{order.from} → {order.to}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      order.status === 'active' 
                        ? 'bg-lime-500/20 text-lime-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleDCA(order.id)}
                      className="text-gray-400 hover:text-white hover:bg-lime-500/20 h-8 w-8"
                    >
                      {order.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelDCA(order.id)}
                      className="text-red-400 hover:bg-red-500/20 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Per Order</div>
                    <div className="text-white font-mono">{order.amount} {order.from}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Frequency</div>
                    <div className="text-white capitalize">{order.frequency}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Progress</div>
                    <div className="text-white">{order.total - order.remaining}/{order.total}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full"
                    style={{ width: `${((order.total - order.remaining) / order.total) * 100}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  Next execution in {order.nextExecution}
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