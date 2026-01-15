import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import WalletPanel from '@/components/wallet/WalletPanel';

export default function MobileWalletSheet({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 bg-slate-50 dark:bg-[#0a1f0a]">
        <SheetHeader className="p-4 border-b border-slate-200 dark:border-[#00ff88]/20">
          <SheetTitle className="text-violet-600 dark:text-[#00ff88]">My Wallet</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(85vh-60px)]">
          <WalletPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
}