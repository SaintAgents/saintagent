import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileTabBar({ currentPage, onWalletOpen, onMenuOpen }) {
  return (
    <button
      onClick={onMenuOpen}
      className={cn(
        "fixed bottom-6 right-6 z-[50] md:hidden",
        "w-14 h-14 rounded-full",
        "bg-violet-600 dark:bg-[#00ff88] shadow-lg",
        "flex items-center justify-center",
        "hover:bg-violet-700 dark:hover:bg-[#00dd77]",
        "active:scale-95 transition-all",
        "shadow-violet-500/30 dark:shadow-[#00ff88]/30"
      )}
    >
      <Menu className="w-6 h-6 text-white dark:text-black" />
    </button>
  );
}