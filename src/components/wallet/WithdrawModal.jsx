import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Wallet, AlertTriangle, CheckCircle2, ExternalLink, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const GGG_TO_USD = 145.00; // 1 GGG = 1 gram of gold ≈ $145
const MIN_WITHDRAWAL_USD = 350.00;
const MIN_WITHDRAWAL_GGG = MIN_WITHDRAWAL_USD / GGG_TO_USD; // ~2.41 GGG

const NETWORKS = [
  { value: 'TRC20', label: 'TRC20 (Tron)', desc: 'Lowest fees, recommended' },
  { value: 'ERC20', label: 'ERC20 (Ethereum)', desc: 'Higher fees' },
  { value: 'BEP20', label: 'BEP20 (BSC)', desc: 'Low fees' },
];

export default function WithdrawModal({ open, onClose, wallet, userId }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState(wallet?.usdt_address || '');
  const [network, setNetwork] = useState(wallet?.usdt_network || 'TRC20');
  const [error, setError] = useState('');

  const availableGGG = wallet?.available_balance || 0;
  const availableUSD = availableGGG * GGG_TO_USD;
  const amountGGG = parseFloat(amount) || 0;
  const amountUSD = amountGGG * GGG_TO_USD;
  const canWithdraw = availableUSD >= MIN_WITHDRAWAL_USD;
  const isValidAmount = amountGGG >= MIN_WITHDRAWAL_GGG && amountGGG <= availableGGG;

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Save address to wallet
      if (wallet?.id) {
        await base44.entities.Wallet.update(wallet.id, {
          usdt_address: address,
          usdt_network: network
        });
      }

      // Create withdrawal request
      await base44.entities.WithdrawalRequest.create({
        user_id: userId,
        amount_ggg: amountGGG,
        amount_usd: amountUSD,
        usdt_address: address,
        network: network,
        status: 'pending'
      });

      // Lock the funds
      await base44.functions.invoke('walletEngine', {
        action: 'lockFunds',
        payload: {
          user_id: userId,
          amount: amountGGG,
          memo: `Withdrawal request: ${amountGGG} GGG to ${address}`,
          related: { type: 'WITHDRAWAL', id: address }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      setStep(3);
    },
    onError: (err) => {
      setError(err.message || 'Failed to submit withdrawal request');
    }
  });

  const handleSubmit = () => {
    setError('');
    if (!address.trim()) {
      setError('Please enter your USDT wallet address');
      return;
    }
    if (!isValidAmount) {
      setError(`Minimum withdrawal is $${MIN_WITHDRAWAL_USD.toFixed(2)} (~${MIN_WITHDRAWAL_GGG.toFixed(2)} GGG)`);
      return;
    }
    submitMutation.mutate();
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setError('');
    onClose();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Withdraw to USDT
          </DialogTitle>
          <DialogDescription>
            Convert your GGG to USDT stablecoin
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            {/* Balance Overview */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-violet-600 font-medium">Available Balance</span>
                <Badge className="bg-violet-100 text-violet-700">
                  1 GGG = ${GGG_TO_USD.toFixed(2)}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-violet-900">
                {availableGGG.toFixed(4)} GGG
              </div>
              <div className="text-sm text-violet-600">
                ≈ ${availableUSD.toFixed(2)} USD
              </div>
            </div>

            {!canWithdraw ? (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Minimum withdrawal: ${MIN_WITHDRAWAL_USD.toFixed(2)}</strong>
                  <br />
                  You need {((MIN_WITHDRAWAL_USD - availableUSD) / GGG_TO_USD).toFixed(2)} more GGG to withdraw.
                  <br />
                  <span className="text-xs mt-1 block text-amber-700">
                    Keep contributing to earn more GGG!
                  </span>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-800">Eligible for Withdrawal</p>
                      <p className="text-sm text-emerald-700">
                        You can withdraw up to ${availableUSD.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700" 
                  onClick={() => setStep(2)}
                >
                  Continue to Withdraw
                </Button>
              </>
            )}

            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-medium">How it works:</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Enter amount and your USDT wallet address</li>
                <li>GGG is locked while request is processed</li>
                <li>Admin reviews and sends USDT manually</li>
                <li>You receive USDT in your crypto wallet</li>
              </ol>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Amount to Withdraw (GGG)</Label>
              <div className="relative mt-1.5">
                <Input
                  type="number"
                  step="0.01"
                  min={MIN_WITHDRAWAL_GGG}
                  max={availableGGG}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ${MIN_WITHDRAWAL_GGG.toFixed(2)}`}
                  className="pr-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 text-xs"
                  onClick={() => setAmount(availableGGG.toString())}
                >
                  MAX
                </Button>
              </div>
              {amountGGG > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  ≈ ${amountUSD.toFixed(2)} USDT
                </p>
              )}
            </div>

            <div>
              <Label>USDT Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <div>
                        <span className="font-medium">{n.label}</span>
                        <span className="text-xs text-slate-500 ml-2">{n.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Your USDT Wallet Address ({network})</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={network === 'TRC20' ? 'T...' : '0x...'}
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Double-check this address. Crypto transactions are irreversible.
              </p>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Request Submitted!</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your withdrawal request for {amountGGG.toFixed(4)} GGG (≈${amountUSD.toFixed(2)}) has been submitted.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border text-left">
              <p className="text-xs text-slate-500 mb-1">Sending to:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate">
                  {address}
                </code>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Badge variant="outline" className="mt-2 text-xs">{network}</Badge>
            </div>

            <p className="text-xs text-slate-500">
              Processing typically takes 1-3 business days. You'll receive a notification when complete.
            </p>

            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}