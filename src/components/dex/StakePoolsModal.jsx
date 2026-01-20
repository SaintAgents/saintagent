import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Layers, TrendingUp, Clock, Coins, Lock, 
  Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight
} from 'lucide-react';

export default function StakePoolsModal({ open, onClose, type = 'stake' }) {
  const [amount, setAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState(null);
  const [step, setStep] = useState('select'); // select, confirm, processing, success
  const [lockPeriod, setLockPeriod] = useState('30');

  const stakingPools = [
    { id: 1, name: 'G3 Staking', token: 'G3', apy: '12.5%', tvl: '$2.4M', minStake: '100', lockPeriods: ['30', '90', '180', '365'] },
    { id: 2, name: 'ETH Staking', token: 'ETH', apy: '4.2%', tvl: '$8.1M', minStake: '0.1', lockPeriods: ['30', '90', '180'] },
    { id: 3, name: 'USDC Staking', token: 'USDC', apy: '8.0%', tvl: '$5.6M', minStake: '100', lockPeriods: ['30', '90'] },
  ];

  const liquidityPools = [
    { id: 1, name: 'G3/ETH', tokens: ['G3', 'ETH'], apy: '24.5%', tvl: '$1.8M', volume24h: '$420K' },
    { id: 2, name: 'G3/USDC', tokens: ['G3', 'USDC'], apy: '18.2%', tvl: '$3.2M', volume24h: '$680K' },
    { id: 3, name: 'ETH/USDC', tokens: ['ETH', 'USDC'], apy: '6.8%', tvl: '$12.4M', volume24h: '$2.1M' },
  ];

  const handleStake = () => {
    setStep('confirm');
  };

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  const resetModal = () => {
    setStep('select');
    setAmount('');
    setSelectedPool(null);
    onClose();
  };

  const apyMultiplier = {
    '30': 1,
    '90': 1.25,
    '180': 1.5,
    '365': 2
  };

  return (
    <Dialog open={open} onOpenChange={resetModal}>
      <DialogContent className="max-w-lg bg-[#0a0a0f] border-lime-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lime-400">
            {type === 'stake' ? <Shield className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            {type === 'stake' ? 'Staking Pools' : 'Liquidity Pools'}
            <Badge variant="outline" className="text-amber-400 border-amber-500/50 ml-2">
              Demo Mode
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-200">
              This is a preview of G3DEX V3 features. Live staking and liquidity pools are coming soon!
            </p>
          </div>
        </div>

        {step === 'select' && (
          <div className="space-y-4">
            {type === 'stake' ? (
              <div className="space-y-3">
                {stakingPools.map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => setSelectedPool(pool)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      selectedPool?.id === pool.id
                        ? 'border-lime-500 bg-lime-500/10'
                        : 'border-gray-800 bg-black/40 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-black">
                          {pool.token.charAt(0)}
                        </div>
                        <span className="font-semibold">{pool.name}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        {pool.apy} APY
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>TVL: {pool.tvl}</span>
                      <span>Min: {pool.minStake} {pool.token}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {liquidityPools.map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => setSelectedPool(pool)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      selectedPool?.id === pool.id
                        ? 'border-lime-500 bg-lime-500/10'
                        : 'border-gray-800 bg-black/40 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {pool.tokens.map((t, i) => (
                            <div key={t} className="w-7 h-7 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-black border-2 border-[#0a0a0f]">
                              {t.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="font-semibold">{pool.name}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        {pool.apy} APY
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>TVL: {pool.tvl}</span>
                      <span>24h Vol: {pool.volume24h}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedPool && (
              <div className="space-y-4 pt-4 border-t border-gray-800">
                {type === 'stake' && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Lock Period</label>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedPool.lockPeriods.map((period) => (
                        <button
                          key={period}
                          onClick={() => setLockPeriod(period)}
                          className={`p-2 rounded-lg text-center text-sm transition-all ${
                            lockPeriod === period
                              ? 'bg-lime-500/20 border border-lime-500 text-lime-400'
                              : 'bg-black/40 border border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <div className="font-semibold">{period}d</div>
                          <div className="text-[10px] text-emerald-400">
                            {(parseFloat(selectedPool.apy) * apyMultiplier[period]).toFixed(1)}%
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    {type === 'stake' ? 'Stake Amount' : 'Liquidity Amount'}
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-black/60 border-gray-800 text-white text-lg h-12 pr-20"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-lime-400 text-xs"
                      onClick={() => setAmount('1000')}
                    >
                      MAX
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Balance: 1,000.00 {type === 'stake' ? selectedPool.token : 'USDC'} (Demo)
                  </p>
                </div>

                {amount && (
                  <div className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Estimated Earnings</span>
                      <span className="text-lime-400 font-semibold">
                        +{(parseFloat(amount || 0) * (parseFloat(selectedPool.apy) / 100) * apyMultiplier[lockPeriod] / 12).toFixed(2)} {type === 'stake' ? selectedPool.token : 'USD'}/month
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleStake}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-semibold h-12"
                >
                  {type === 'stake' ? 'Stake Now' : 'Add Liquidity'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pool</span>
                <span className="font-semibold">{selectedPool?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="font-semibold">{amount} {type === 'stake' ? selectedPool?.token : 'USDC'}</span>
              </div>
              {type === 'stake' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Lock Period</span>
                  <span className="font-semibold">{lockPeriod} days</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">APY</span>
                <span className="text-emerald-400 font-semibold">
                  {type === 'stake' 
                    ? (parseFloat(selectedPool?.apy) * apyMultiplier[lockPeriod]).toFixed(1)
                    : selectedPool?.apy
                  }%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1 border-gray-700 text-gray-400"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-semibold"
              >
                Confirm (Demo)
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-lime-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-lg">Processing Transaction</p>
              <p className="text-sm text-gray-400">Simulating blockchain confirmation...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-lg text-emerald-400">Success!</p>
              <p className="text-sm text-gray-400">
                {type === 'stake' 
                  ? `You've staked ${amount} ${selectedPool?.token} (Demo)`
                  : `You've added ${amount} USDC liquidity (Demo)`
                }
              </p>
            </div>
            <Button
              onClick={resetModal}
              className="bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-semibold"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}