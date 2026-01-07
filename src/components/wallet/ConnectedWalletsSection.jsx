import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Wallet, Plus, Trash2, Check, AlertCircle, ExternalLink, Coins, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUPPORTED_NETWORKS = [
  { id: 'trc20', label: 'USDT (TRC20)', chain: 'Tron', icon: '₮', color: 'bg-emerald-500' },
  { id: 'erc20', label: 'USDT (ERC20)', chain: 'Ethereum', icon: '₮', color: 'bg-blue-500' },
  { id: 'bep20', label: 'USDT (BEP20)', chain: 'BNB Chain', icon: '₮', color: 'bg-yellow-500' },
  { id: 'sol', label: 'USDC (Solana)', chain: 'Solana', icon: '◎', color: 'bg-purple-500' },
  { id: 'ggg', label: 'GGG Token', chain: 'Coming Soon', icon: '✧', color: 'bg-amber-500', comingSoon: true },
];

const ADDRESS_PATTERNS = {
  trc20: /^T[a-zA-Z0-9]{33}$/,
  erc20: /^0x[a-fA-F0-9]{40}$/,
  bep20: /^0x[a-fA-F0-9]{40}$/,
  sol: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
};

export default function ConnectedWalletsSection({ userId, compact = false }) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [newWallet, setNewWallet] = useState({ network: '', address: '', label: '' });
  const [validationError, setValidationError] = useState('');
  const queryClient = useQueryClient();

  // Fetch user's connected wallets from profile
  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId
  });
  const profile = profiles[0];
  
  // Wallets stored as JSON in profile (connected_wallets field)
  const connectedWallets = profile?.connected_wallets || [];

  const saveMutation = useMutation({
    mutationFn: async (wallets) => {
      if (!profile?.id) return;
      await base44.entities.UserProfile.update(profile.id, { connected_wallets: wallets });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      setAddModalOpen(false);
      setEditingWallet(null);
      setNewWallet({ network: '', address: '', label: '' });
      setValidationError('');
    }
  });

  const validateAddress = (network, address) => {
    if (!address) return 'Address is required';
    const pattern = ADDRESS_PATTERNS[network];
    if (pattern && !pattern.test(address)) {
      return `Invalid ${network.toUpperCase()} address format`;
    }
    // Check for duplicates
    const existing = connectedWallets.find(w => w.address.toLowerCase() === address.toLowerCase() && w.network === network);
    if (existing && (!editingWallet || existing.id !== editingWallet.id)) {
      return 'This address is already saved';
    }
    return '';
  };

  const handleSave = () => {
    const error = validateAddress(newWallet.network, newWallet.address);
    if (error) {
      setValidationError(error);
      return;
    }

    let updated;
    if (editingWallet) {
      updated = connectedWallets.map(w => 
        w.id === editingWallet.id 
          ? { ...w, ...newWallet, updated_at: new Date().toISOString() }
          : w
      );
    } else {
      updated = [
        ...connectedWallets,
        {
          id: `wallet_${Date.now()}`,
          ...newWallet,
          created_at: new Date().toISOString(),
          is_default: connectedWallets.filter(w => w.network === newWallet.network).length === 0
        }
      ];
    }
    saveMutation.mutate(updated);
  };

  const handleDelete = (walletId) => {
    const updated = connectedWallets.filter(w => w.id !== walletId);
    saveMutation.mutate(updated);
  };

  const handleSetDefault = (walletId, network) => {
    const updated = connectedWallets.map(w => ({
      ...w,
      is_default: w.network === network ? w.id === walletId : w.is_default
    }));
    saveMutation.mutate(updated);
  };

  const openEdit = (wallet) => {
    setEditingWallet(wallet);
    setNewWallet({ network: wallet.network, address: wallet.address, label: wallet.label || '' });
    setValidationError('');
    setAddModalOpen(true);
  };

  const openAdd = () => {
    setEditingWallet(null);
    setNewWallet({ network: '', address: '', label: '' });
    setValidationError('');
    setAddModalOpen(true);
  };

  if (compact) {
    return (
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-slate-900">Connected Wallets</span>
          </div>
          <Badge variant="outline" className="text-xs">{connectedWallets.length}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {SUPPORTED_NETWORKS.filter(n => !n.comingSoon).map(network => {
            const hasWallet = connectedWallets.some(w => w.network === network.id);
            return (
              <div 
                key={network.id} 
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                  hasWallet ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}
              >
                <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]", network.color)}>
                  {network.icon}
                </span>
                {network.chain}
                {hasWallet && <Check className="w-3 h-3" />}
              </div>
            );
          })}
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs gap-1" onClick={openAdd}>
          <Plus className="w-3 h-3" />
          Add Wallet
        </Button>

        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWallet ? 'Edit Wallet' : 'Add Wallet Address'}</DialogTitle>
            </DialogHeader>
            <WalletForm 
              newWallet={newWallet}
              setNewWallet={setNewWallet}
              validationError={validationError}
              setValidationError={setValidationError}
              validateAddress={validateAddress}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!newWallet.network || !newWallet.address || saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingWallet ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-slate-900">Connected Wallets</h3>
        </div>
        <Button variant="outline" size="sm" onClick={openAdd} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Connect your crypto wallets to receive payouts in your preferred currency.
      </p>

      {/* Supported Networks */}
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_NETWORKS.map(network => {
          const wallet = connectedWallets.find(w => w.network === network.id);
          return (
            <div 
              key={network.id}
              className={cn(
                "p-3 rounded-xl border transition-all",
                network.comingSoon 
                  ? "bg-slate-50 border-slate-200 opacity-60"
                  : wallet 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-white border-slate-200 hover:border-violet-300"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-sm", network.color)}>
                  {network.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{network.label}</p>
                  <p className="text-xs text-slate-500">{network.chain}</p>
                </div>
              </div>
              
              {network.comingSoon ? (
                <Badge className="bg-amber-100 text-amber-700 text-xs">Coming Soon</Badge>
              ) : wallet ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 truncate max-w-[120px]" title={wallet.address}>
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                    </p>
                    <div className="flex items-center gap-1">
                      {wallet.is_default && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1">Default</Badge>
                      )}
                      <button onClick={() => openEdit(wallet)} className="p-1 hover:bg-slate-100 rounded">
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(wallet.id)} className="p-1 hover:bg-rose-100 rounded">
                        <Trash2 className="w-3 h-3 text-rose-400" />
                      </button>
                    </div>
                  </div>
                  {wallet.label && <p className="text-xs text-slate-500">{wallet.label}</p>}
                  {!wallet.is_default && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs h-7"
                      onClick={() => handleSetDefault(wallet.id, wallet.network)}
                    >
                      Set as default
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs gap-1"
                  onClick={() => {
                    setNewWallet({ ...newWallet, network: network.id });
                    openAdd();
                  }}
                >
                  <Plus className="w-3 h-3" />
                  Connect
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* GGG Coming Soon Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900">GGG Token Coming Soon</h4>
            <p className="text-xs text-amber-700 mt-1">
              At launch, you'll be able to receive payouts directly in GGG tokens. 
              Connect your wallet now to be ready!
            </p>
          </div>
        </div>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWallet ? 'Edit Wallet' : 'Add Wallet Address'}</DialogTitle>
          </DialogHeader>
          <WalletForm 
            newWallet={newWallet}
            setNewWallet={setNewWallet}
            validationError={validationError}
            setValidationError={setValidationError}
            validateAddress={validateAddress}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!newWallet.network || !newWallet.address || saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingWallet ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WalletForm({ newWallet, setNewWallet, validationError, setValidationError, validateAddress }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Network</Label>
        <Select 
          value={newWallet.network} 
          onValueChange={(v) => {
            setNewWallet({ ...newWallet, network: v });
            setValidationError('');
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_NETWORKS.filter(n => !n.comingSoon).map(network => (
              <SelectItem key={network.id} value={network.id}>
                <div className="flex items-center gap-2">
                  <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]", network.color)}>
                    {network.icon}
                  </span>
                  {network.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Wallet Address</Label>
        <Input
          value={newWallet.address}
          onChange={(e) => {
            setNewWallet({ ...newWallet, address: e.target.value });
            if (newWallet.network) {
              setValidationError(validateAddress(newWallet.network, e.target.value));
            }
          }}
          placeholder={
            newWallet.network === 'trc20' ? 'T...' :
            newWallet.network === 'sol' ? 'Solana address...' :
            '0x...'
          }
          className={cn("mt-1", validationError && "border-rose-500")}
        />
        {validationError && (
          <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {validationError}
          </p>
        )}
      </div>

      <div>
        <Label>Label (optional)</Label>
        <Input
          value={newWallet.label}
          onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
          placeholder="e.g., Main wallet, Trading wallet"
          className="mt-1"
        />
      </div>

      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Important:</strong> Make sure this address is correct. Funds sent to the wrong address cannot be recovered.
        </p>
      </div>
    </div>
  );
}