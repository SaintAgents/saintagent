import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown, Check } from 'lucide-react';
import { shortenAddress, formatUSD } from './dexUtils';

const WALLETS = [
  { 
    id: 'metamask', 
    name: 'MetaMask', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    installed: typeof window !== 'undefined' && window.ethereum?.isMetaMask
  },
  { 
    id: 'coinbase', 
    name: 'Coinbase Wallet', 
    icon: 'https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.webp',
    installed: typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet
  },
  { 
    id: 'rabby', 
    name: 'Rabby', 
    icon: 'https://rabby.io/assets/images/logo.svg',
    installed: typeof window !== 'undefined' && window.ethereum?.isRabby
  }
];

export default function WalletConnect({ connected, address, onConnect, onDisconnect, theme = 'lime' }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletId) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setConnecting(walletId);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Switch to Base network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }] // 8453 in hex
        });
      } catch (switchError) {
        // If Base isn't added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
        }
      }

      if (accounts[0]) {
        onConnect(accounts[0]);
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setConnecting(null);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20 text-lime-400"
          >
            <div className="w-2 h-2 rounded-full bg-lime-400 mr-2" />
            {shortenAddress(address)}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="bg-[#0a0a0f] border-lime-500/30 text-white w-56"
          align="end"
        >
          <div className="px-3 py-2">
            <div className="text-xs text-gray-500">Connected</div>
            <div className="font-mono text-sm">{shortenAddress(address)}</div>
            <div className="text-lime-400 text-sm mt-1">{formatUSD(4800)}</div>
          </div>
          <DropdownMenuSeparator className="bg-lime-500/20" />
          <DropdownMenuItem 
            onClick={copyAddress}
            className="focus:bg-lime-500/20 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
            className="focus:bg-lime-500/20 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on BaseScan
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-lime-500/20" />
          <DropdownMenuItem 
            onClick={onDisconnect}
            className="focus:bg-red-500/20 text-red-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setModalOpen(true)}
        className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-semibold"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0a0a0f] border border-lime-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lime-400">Connect Wallet</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {WALLETS.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={connecting !== null}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-black/40 border border-lime-500/20 hover:bg-lime-500/10 hover:border-lime-500/40 transition-all disabled:opacity-50"
              >
                <img src={wallet.icon} alt="" className="w-8 h-8" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{wallet.name}</div>
                  {wallet.installed && (
                    <div className="text-xs text-lime-400">Detected</div>
                  )}
                </div>
                {connecting === wallet.id && (
                  <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-lime-500/20 text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to the Terms of Service
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}