import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileTabBar({ currentPage, onWalletOpen, onMenuOpen }) {
  return (
    <button
      onClick={onMenuOpen}
      className={cn(
        "fixed bottom-2 right-2 z-[50] md:hidden",
        "w-11 h-11 rounded-full",
        "bg-violet-600 dark:bg-[#00ff88] shadow-lg",
        "flex items-center justify-center",
        "hover:bg-violet-700 dark:hover:bg-[#00dd77]",
        "active:scale-95 transition-all",
        "shadow-violet-500/30 dark:shadow-[#00ff88]/30"
      )}
    >
      <Menu className="w-5 h-5 text-white dark:text-black" />
    </button>
  );
}