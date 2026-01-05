import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import Sidebar from '@/components/hud/Sidebar';
import TopBar from '@/components/hud/TopBar';
import QuickCreateModal from '@/components/hud/QuickCreateModal';
import ProfileDrawer from '@/components/ProfileDrawer';
import SearchModal from '@/components/SearchModal';
import FloatingChatWidget from '@/components/FloatingChatWidget';

import MeetingReminderService from '@/components/MeetingReminderService';
import { createPageUrl } from '@/utils';

const PUBLIC_PAGES = ['Join', 'SignUp', 'Welcome', 'Onboarding', 'Terms', 'FAQ'];

// Wrapper component to handle public pages without hooks
function PublicPageWrapper({ children }) {
  return <>{children}</>;
}

export default function Layout({ children, currentPageName }) {
  // CRITICAL: Check public pages FIRST - return simple wrapper immediately
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <PublicPageWrapper>{children}</PublicPageWrapper>;
  }

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState('command');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [openProfileUserIds, setOpenProfileUserIds] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [floatingChat, setFloatingChat] = useState(null);
  const [theme, setTheme] = useState('light');
  const queryClient = useQueryClient();


        // Open/close multiple profile drawers (max 6)
        const openProfile = (id) => {
          if (!id) return;
          setOpenProfileUserIds((prev) => {
            const next = [...prev.filter((uid) => uid !== id), id];
            return next.length > 6 ? next.slice(next.length - 6) : next;
          });
        };
        const closeProfile = (id) => {
          setOpenProfileUserIds((prev) => prev.filter((uid) => uid !== id));
        };


  // Global profile click handler
  useEffect(() => {
    const handleProfileClick = (e) => {
      // Ignore clicks inside the open drawer
      if (e.target.closest('#profile-drawer')) return;
      // Support both explicit profile triggers and generic user-id tags
      const target = e.target.closest('[data-user-id], [data-open-profile]');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        const id = target.getAttribute('data-user-id') || target.getAttribute('data-open-profile');
        if (id) openProfile(id);
      }
    };
    const handleOpenProfile = (e) => {
      if (e.detail?.userId) {
        openProfile(e.detail.userId);
      }
    };
    const handleOpenChat = (e) => {
      console.log('openFloatingChat event received:', e.detail);
      if (e.detail) {
        setFloatingChat({
          recipientId: e.detail.recipientId,
          recipientName: e.detail.recipientName,
          recipientAvatar: e.detail.recipientAvatar
        });
        console.log('Floating chat state set:', e.detail);
      }
    };
    document.addEventListener('click', handleProfileClick);
    document.addEventListener('openProfile', handleOpenProfile);
    document.addEventListener('openFloatingChat', handleOpenChat);
    return () => {
      document.removeEventListener('click', handleProfileClick);
      document.removeEventListener('openProfile', handleOpenProfile);
      document.removeEventListener('openFloatingChat', handleOpenChat);
    };
  }, []);

  // Initialize theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light' || saved === 'custom') setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try { 
      localStorage.setItem('theme', theme); 
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'custom') {
        const p = localStorage.getItem('custom_primary') || '#7c3aed';
        const a = localStorage.getItem('custom_accent') || '#f59e0b';
        document.documentElement.style.setProperty('--primary', p);
        document.documentElement.style.setProperty('--accent', a);
      }
    }
  }, [theme]);

  // Get current page ID for sidebar highlighting
  const getPageId = (pageName) => {
    const pageMap = {
      'CommandDeck': 'command',
      'Matches': 'matches',
      'Meetings': 'meetings',
      'Missions': 'missions',
      'Projects': 'projects',
      'FindCollaborators': 'collaborators',
      'Marketplace': 'marketplace',
      'LeaderChannel': 'leader',
      'Circles': 'circles',
      'Studio': 'studio',
      'Settings': 'settings',
      'Profile': 'profile',
    };
    return pageMap[pageName] || 'command';
  };

  // Fetch user profile and current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
              const user = await base44.auth.me();
              return base44.entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1);
            },
    enabled: !!currentUser
  });
  const profile = profiles?.[0];
  const cmdViewMode = profile?.command_deck_layout?.view_mode;

  // Heartbeat: update last_seen_at periodically for online indicator
  useEffect(() => {
    if (!profile?.id) return;
    const update = async () => {
      await base44.entities.UserProfile.update(profile.id, { last_seen_at: new Date().toISOString() });
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [profile?.id]);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 20),
    enabled: !!currentUser
  });

  // Onboarding progress for redirect
  const { data: onboardingRecords, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboardingProgress', currentUser?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const onboarding = onboardingRecords?.[0];



  const handleStatusChange = async (status) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { status });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    }
  };

  const handleDMPolicyChange = async (dm_policy) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { dm_policy });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    }
  };



  const handleSearch = (query) => {
    setSearchOpen(true);
  };

  const handleSearchSelect = (type, item) => {
          if (type === 'profile') {
            openProfile(item.user_id);
            setSearchOpen(false);
          } else if (type === 'project') {
            window.location.href = createPageUrl('Projects');
            setSearchOpen(false);
          }
        };

  const handleNotificationAction = async (action, notif) => {
    if (action === 'markAllRead') {
      const unread = (notifications || []).filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } else if (action === 'clearAll') {
      const all = notifications || [];
      await Promise.all(all.map(n => base44.entities.Notification.delete(n.id)));
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } else if (action === 'click' && notif?.action_url) {
      window.location.href = notif.action_url;
    }
  };

  const handleCreate = async (type, data) => {
    if (type === 'message') {
      const me = await base44.auth.me();
      // resolve recipient (email or @handle)
      let recipientEmail = null;
      let recipientProfile = null;
      if (data.recipient?.includes('@') && !data.recipient.startsWith('@')) {
        recipientEmail = data.recipient.trim();
        const rp = await base44.entities.UserProfile.filter({ user_id: recipientEmail });
        recipientProfile = rp?.[0];
      } else {
        const handle = data.recipient?.replace(/^@/, '');
        const rp = await base44.entities.UserProfile.filter({ handle });
        recipientProfile = rp?.[0];
        recipientEmail = recipientProfile?.user_id;
      }
      if (!recipientEmail) return;
      const myProfiles = await base44.entities.UserProfile.filter({ user_id: me.email });
      const myProfile = myProfiles?.[0];
      await base44.entities.Message.create({
        conversation_id: [me.email, recipientEmail].sort().join('_'),
        from_user_id: me.email,
        to_user_id: recipientEmail,
        from_name: me.full_name,
        from_avatar: myProfile?.avatar_url,
        to_name: recipientProfile?.display_name,
        content: data.content || ''
      });
    } else if (type === 'event') {
      const me = await base44.auth.me();
      await base44.entities.Event.create({
        title: data.title,
        description: data.description || '',
        start_time: data.start_time,
        end_time: data.end_time || undefined,
        location: data.location || '',
        online_link: data.online_link || '',
        host_id: me.email,
        host_name: me.full_name,
        image_url: data.image_url || undefined,
        status: 'upcoming'
      });
    }
  };

  // Redirect unauthenticated users to login
    useEffect(() => {
              if (currentUser === null) {
                base44.auth.redirectToLogin(createPageUrl('Onboarding'));
              }
            }, [currentUser]);

  // If authenticated and onboarding missing or not complete, force Onboarding
  useEffect(() => {
    const justCompleted = typeof window !== 'undefined' && localStorage.getItem('onboardingJustCompleted') === '1';
    if (!currentUser || currentPageName === 'Onboarding') return;
    if (onboardingRecords === undefined || onboardingLoading) return; // wait until loaded to avoid flicker/loop
    if (!justCompleted && (!onboarding || onboarding.status !== 'complete')) {
      window.location.href = createPageUrl('Onboarding');
    }
    if (justCompleted && onboarding?.status === 'complete') {
      try { localStorage.removeItem('onboardingJustCompleted'); } catch {}
    }
  }, [currentUser, onboardingRecords, onboardingLoading, onboarding, currentPageName]);

  // If auth state is still loading (undefined), show loading
  if (currentUser === undefined) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  // If no user and not public page, show blank while redirecting to login
  if (currentUser === null) {
    return <div className="min-h-screen bg-slate-50" />;
  }

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
      <style>{`
        /* Dark theme overrides */
        [data-theme='dark'] {
          color-scheme: dark;
        }
        [data-theme='dark'] body, [data-theme='dark'] .min-h-screen {
                        background-color: #0b1220 !important;
                        background-image: linear-gradient(180deg, rgba(2,6,23,0.6), rgba(2,6,23,0.85)), url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2f0df9019_gemini-25-flash-image_make_yes_normal_human_with_blue_iris-0.jpg');
                        background-size: cover;
                        background-position: center;
                        background-attachment: fixed;
                        color: #e5e7eb;
        }
        [data-theme='dark'] [class*='bg-white'] { background-color: #0f172a !important; color: #e5e7eb !important; }
        [data-theme='dark'] [class*='bg-slate-50'] { background-color: #0b1220 !important; color: #e5e7eb !important; }
        [data-theme='dark'] [class*='bg-slate-100'] { background-color: #111827 !important; color: #e5e7eb !important; }
        [data-theme='dark'] [class*='border-slate-100'] { border-color: #1f2937 !important; }
        [data-theme='dark'] [class*='border-slate-200'] { border-color: #334155 !important; }
        [data-theme='dark'] [class*='text-slate-900'] { color: #e5e7eb !important; }
        [data-theme='dark'] [class*='text-slate-700'] { color: #cbd5e1 !important; }
        [data-theme='dark'] [class*='text-slate-600'] { color: #94a3b8 !important; }
        [data-theme='dark'] [class*='text-slate-500'] { color: #94a3b8 !important; }

        /* Command Deck gold accent */
        [data-theme='dark'] main[data-page='CommandDeck'] { --gold: #FFE27A; }
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-slate-900'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-slate-800'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-slate-700'] {
          color: var(--gold) !important;
        }
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-950'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-900'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-800'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-700'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-600'] {
          color: #1e1b4b !important;
        }
        /* Ensure Avatar dashboard stats stay dark on dark theme */
        [data-theme='dark'] main[data-page='CommandDeck'] [data-cmd-stats],
        [data-theme='dark'] main[data-page='CommandDeck'] [data-cmd-stats] * {
          color: #0f172a !important;
        }

        /* Dark mode: Stat numbers deep purple */
        [data-theme='dark'] main[data-page='CommandDeck'] [data-stats-bar] .stat-number {
          color: #5b21b6 !important;
        }

        /* SidePanel control buttons */
        [data-theme='dark'] [data-ggg-controls] {
          background-color: #0f172a !important;
          border-color: #1f2937 !important;
        }
        [data-theme='dark'] [data-ggg-controls] .btn-ctrl {
          background-color: #111827 !important;
          color: #e5e7eb !important;
          border-color: #374151 !important;
        }
        [data-theme='dark'] [data-ggg-controls] .btn-ctrl:hover {
          background-color: #1f2937 !important;
        }
      `}</style>
      <style>{`
        /* Light theme background for Command Deck */
        [data-theme='light'] main[data-page='CommandDeck'] {
          background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/98d67726c_gemini-25-flash-image_merge_the_shield_into_the_center-0.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        /* Dark theme background for Command Deck */
        [data-theme='dark'] main[data-page='CommandDeck'] {
                                      background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2f0df9019_gemini-25-flash-image_make_yes_normal_human_with_blue_iris-0.jpg');
                                      background-size: cover;
                                      background-position: center;
                                      background-attachment: fixed;
                                    }

        /* Avatar card background - light mode uses gold shield, dark mode uses dark image */
                    [data-theme='light'] [data-avatar-card] [data-avatar-bg] {
                      display: block;
                      background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/f95689693_Screenshot2026-01-04192526.png') !important;
                    }
        [data-theme='light'] [data-avatar-card] [data-avatar-overlay] {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(4px);
        }
        [data-theme='dark'] [data-avatar-card] [data-avatar-bg] {
          display: block;
          opacity: 1;
        }
        [data-theme='dark'] [data-avatar-card] [data-avatar-overlay] {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(4px);
        }

        `}</style>
        <style>{`
          :root { --primary: #7c3aed; --accent: #f59e0b; }
          [data-theme='custom'] .min-h-screen {
            background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 12%, white), color-mix(in srgb, var(--accent) 12%, white));
          }

          /* Hacker theme - Complete green on black, no white anywhere */
          [data-theme='hacker'] *, [data-theme='hacker'] *::before, [data-theme='hacker'] *::after {
            border-color: #00ff00 !important;
          }
          [data-theme='hacker'] body, [data-theme='hacker'] .min-h-screen, [data-theme='hacker'] div, [data-theme='hacker'] section, [data-theme='hacker'] main, [data-theme='hacker'] aside, [data-theme='hacker'] header, [data-theme='hacker'] footer, [data-theme='hacker'] nav {
            background-color: #000 !important;
            background-image: none !important;
            color: #00ff00 !important;
          }
          [data-theme='hacker'] h1, [data-theme='hacker'] h2, [data-theme='hacker'] h3, [data-theme='hacker'] h4, [data-theme='hacker'] h5, [data-theme='hacker'] h6, [data-theme='hacker'] p, [data-theme='hacker'] span, [data-theme='hacker'] a, [data-theme='hacker'] li, [data-theme='hacker'] label {
            color: #00ff00 !important;
          }
          [data-theme='hacker'] [class*='bg-'] { background-color: #000 !important; }
          [data-theme='hacker'] [class*='text-'] { color: #00ff00 !important; }
          [data-theme='hacker'] button, [data-theme='hacker'] [role="button"] {
            background-color: #000 !important;
            color: #00ff00 !important;
            border: 1px solid #00ff00 !important;
          }
          [data-theme='hacker'] button:hover, [data-theme='hacker'] [role="button"]:hover {
            background-color: #001a00 !important;
            box-shadow: 0 0 10px #00ff00 !important;
          }
          [data-theme='hacker'] input, [data-theme='hacker'] textarea, [data-theme='hacker'] select {
            background-color: #001a00 !important;
            color: #00ff00 !important;
            border: 1px solid #00ff00 !important;
          }
          [data-theme='hacker'] input::placeholder, [data-theme='hacker'] textarea::placeholder {
            color: #006600 !important;
          }
          [data-theme='hacker'] [role="dialog"], [data-theme='hacker'] [data-radix-popper-content-wrapper] *, [data-theme='hacker'] [data-state="open"] {
            background-color: #000 !important;
            color: #00ff00 !important;
            border-color: #00ff00 !important;
          }
          [data-theme='hacker'] svg { color: #00ff00 !important; stroke: #00ff00 !important; }
          [data-theme='hacker'] svg path, [data-theme='hacker'] svg circle, [data-theme='hacker'] svg rect, [data-theme='hacker'] svg line { stroke: #00ff00 !important; fill: none !important; }
          [data-theme='hacker'] svg[fill] path { fill: #00ff00 !important; }
          [data-theme='hacker'] ::-webkit-scrollbar { background-color: #000 !important; }
          [data-theme='hacker'] ::-webkit-scrollbar-thumb { background-color: #00ff00 !important; }
          [data-theme='hacker'] a:hover { text-shadow: 0 0 5px #00ff00 !important; }
          [data-theme='hacker'] [class*='shadow'] { box-shadow: 0 0 8px #00ff00 !important; }
          [data-theme='hacker'] [data-avatar-card], [data-theme='hacker'] [data-avatar-card] * { background-color: #000 !important; color: #00ff00 !important; }
          [data-theme='hacker'] [data-avatar-card] [data-avatar-bg] { display: none !important; }
          [data-theme='hacker'] [data-avatar-card] [data-avatar-overlay] { background: #000 !important; backdrop-filter: none !important; }
          [data-theme='hacker'] img { filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important; }
        `}</style>

        {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPage={getPageId(currentPageName)}
        profile={profile}
        onStatusChange={handleStatusChange}
        onDMPolicyChange={handleDMPolicyChange}
        theme={theme}
        onThemeToggle={setTheme}
      />

      {/* Top Bar */}
      <TopBar 
        mode={mode}
        onModeChange={setMode}
        profile={profile}
        currentUser={currentUser}
        notifications={notifications}
        onSearch={handleSearch}
        onQuickCreate={() => setQuickCreateOpen(true)}
        onNotificationAction={handleNotificationAction}
         sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        data-page={currentPageName}
        data-cmd-view={cmdViewMode || 'standard'}
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "pl-20" : "pl-64",
          currentPageName === 'CommandDeck' && cmdViewMode === 'compact' ? "cmd-compact" : "",
          currentPageName === 'CommandDeck' && cmdViewMode === 'analytics' ? "cmd-analytics" : ""
        )}>
        {children}
      </main>

      {/* Quick Create Modal */}
      <QuickCreateModal 
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* Profile Drawers */}
      {openProfileUserIds.map((uid, idx) => (
                    <ProfileDrawer
                      key={uid}
                      userId={uid}
                      offsetIndex={idx}
                      onClose={() => closeProfile(uid)}
                    />
                  ))}

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />

      {/* Floating Chat Widget */}
      {floatingChat && (
        <FloatingChatWidget
          recipientId={floatingChat.recipientId}
          recipientName={floatingChat.recipientName}
          recipientAvatar={floatingChat.recipientAvatar}
          onClose={() => setFloatingChat(null)}
        />
      )}



      {/* Meeting Reminder Service */}
      {currentUser && <MeetingReminderService />}
    </div>
  );
}