import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, Heart, MessageSquare, Menu, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileTabBar({ currentPage, onWalletOpen, onMenuOpen }) {
  const tabs = [
    { id: 'command', label: 'Deck', icon: LayoutDashboard, page: 'CommandDeck' },
    { id: 'matches', label: 'Matches', icon: Heart, action: 'matches' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, action: 'chat' },
    { id: 'help', label: 'Help', icon: HelpCircle, action: 'help' },
    { id: 'menu', label: 'More', icon: Menu, action: 'menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[50] bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-[#00ff88]/20 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = tab.page && currentPage === tab.page;
          const Icon = tab.icon;
          
          if (tab.action === 'matches') {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  // Open fullscreen matches swiper
                  document.dispatchEvent(new CustomEvent('openFullscreenMatches'));
                }}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-[#00ff88]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }
          
          if (tab.action === 'chat') {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  // Navigate to Messages page on mobile
                  window.location.href = createPageUrl('Messages');
                }}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-[#00ff88]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }
          
          if (tab.action === 'help') {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  // Navigate to FAQ/Help page
                  window.location.href = createPageUrl('FAQ');
                }}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-[#00ff88]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }
          
          if (tab.action === 'menu') {
            return (
              <button
                key={tab.id}
                onClick={onMenuOpen}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-[#00ff88]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={tab.id}
              to={createPageUrl(tab.page)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-violet-600 dark:text-[#00ff88]"
                  : "text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-[#00ff88]"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_8px_rgba(124,58,237,0.5)] dark:drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-8 h-0.5 rounded-full bg-violet-600 dark:bg-[#00ff88]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}