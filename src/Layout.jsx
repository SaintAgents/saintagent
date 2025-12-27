import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import Sidebar from '@/components/hud/Sidebar';
import TopBar from '@/components/hud/TopBar';
import QuickCreateModal from '@/components/hud/QuickCreateModal';

export default function Layout({ children, currentPageName }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState('command');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Get current page ID for sidebar highlighting
  const getPageId = (pageName) => {
    const pageMap = {
      'CommandDeck': 'command',
      'Matches': 'matches',
      'Meetings': 'meetings',
      'Missions': 'missions',
      'Marketplace': 'marketplace',
      'LeaderChannel': 'leader',
      'Circles': 'circles',
      'Studio': 'studio',
      'Settings': 'settings',
      'Profile': 'profile',
    };
    return pageMap[pageName] || 'command';
  };

  // Fetch user profile
  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 20)
  });

  const handleStatusChange = async (status) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { status });
    }
  };

  const handleDMPolicyChange = async (dm_policy) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { dm_policy });
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleSearch = (query) => {
    console.log('Search:', query);
  };

  const handleNotificationAction = (action, notif) => {
    console.log('Notification action:', action, notif);
  };

  const handleCreate = async (type, data) => {
    console.log('Create:', type, data);
    // Handle creation based on type
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPage={getPageId(currentPageName)}
        profile={profile}
        onStatusChange={handleStatusChange}
        onDMPolicyChange={handleDMPolicyChange}
      />

      {/* Top Bar */}
      <TopBar 
        mode={mode}
        onModeChange={setMode}
        profile={profile}
        notifications={notifications}
        onSearch={handleSearch}
        onQuickCreate={() => setQuickCreateOpen(true)}
        onNotificationAction={handleNotificationAction}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300",
        sidebarCollapsed ? "pl-20" : "pl-64"
      )}>
        {children}
      </main>

      {/* Quick Create Modal */}
      <QuickCreateModal 
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}