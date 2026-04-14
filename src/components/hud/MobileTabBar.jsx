import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileTabBar({ currentPage, onWalletOpen, onMenuOpen }) {
  return (
    <button
      onClick={onMenuOpen}
      className={cn(
        "fixed bottom-4 left-4 z-[100] md:hidden",
        "w-14 h-14 rounded-full",
        "bg-violet-600 dark:bg-[#00ff88] shadow-xl",
        "flex items-center justify-center",
        "hover:bg-violet-700 dark:hover:bg-[#00dd77]",
        "active:scale-95 transition-all",
        "shadow-violet-500/40 dark:shadow-[#00ff88]/40",
        "ring-4 ring-white/50 dark:ring-black/30"
      )}
    >
      <Menu className="w-6 h-6 text-white dark:text-black" />
    </button>
  );
}