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
import GlobalChatWidget from '@/components/community/GlobalChatWidget';
import GlobalSidePanelNudge from '@/components/hud/GlobalSidePanelNudge';
import HelpSupportAgent from '@/components/support/HelpSupportAgent';
import GlobalPhotoViewer from '@/components/profile/GlobalPhotoViewer';
import { useLiveStatus } from '@/components/community/LiveStatusIndicator';

import MeetingReminderService from '@/components/MeetingReminderService';
import { createPageUrl } from '@/utils';

const PUBLIC_PAGES = ['Join', 'join', 'SignUp', 'Welcome', 'Onboarding', 'Terms', 'FAQ', 'Home', 'home'];

// Authenticated layout with all the hooks - only used for protected pages
function AuthenticatedLayout({ children, currentPageName }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mode, setMode] = useState('command');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [openProfileUserIds, setOpenProfileUserIds] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [floatingChat, setFloatingChat] = useState(null);
  const [theme, setTheme] = useState('light');
  const [bgEffect, setBgEffect] = useState(() => {
    try { return localStorage.getItem('bgEffect') || 'matrix'; } catch { return 'matrix'; }
  });
  const queryClient = useQueryClient();

  // Listen for background effect changes from Sidebar
  useEffect(() => {
    const handleBgEffectChange = (e) => {
      if (e.detail?.effect) setBgEffect(e.detail.effect);
    };
    document.addEventListener('bgEffectChange', handleBgEffectChange);
    return () => document.removeEventListener('bgEffectChange', handleBgEffectChange);
  }, []);


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

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light' || saved === 'custom' || saved === 'hacker') {
        setTheme(saved);
        // Apply immediately to prevent flash
        document.documentElement.setAttribute('data-theme', saved);
      }
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

  // Initialize live status tracking
  useLiveStatus();

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

  // Determine if we should show starfield (dark/hacker theme + starfield effect selected)
  const showStarfield = (theme === 'dark' || theme === 'hacker') && bgEffect === 'starfield';
  const showMatrixRain = (theme === 'dark' || theme === 'hacker') && bgEffect === 'matrix';
  const showNebula = (theme === 'dark' || theme === 'hacker') && bgEffect === 'nebula';
  const showCircuit = (theme === 'dark' || theme === 'hacker') && bgEffect === 'circuit';
  const rankCode = profile?.rp_rank_code || 'seeker';

  return (
    <div className="min-h-screen bg-slate-50" data-bg-effect={bgEffect}>
      {/* Starfield Canvas - rank-colored stars */}
      {showStarfield && <StarfieldCanvas rankCode={rankCode} />}
      {showMatrixRain && <MatrixRainCanvas />}
      {showNebula && <NebulaCanvas />}
      {showCircuit && <CircuitCanvas />}

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
        /* Dark theme overrides - OBSIDIAN BLACK with NEON ACCENTS */
        [data-theme='dark'] {
          color-scheme: dark;
          --obsidian: #050505;
          --obsidian-light: #0a0a0a;
          --neon-green: #00ff88;
          --neon-teal: #00d4ff;
          --neon-purple: #a855f7;
          --text-primary: #ffffff;
          --text-secondary: #e0e0e0;
        }

        /* Matrix Rain Canvas Container */
        [data-theme='dark'] body {
          position: relative;
        }

        [data-theme='dark'] body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(0, 255, 136, 0.02) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(0, 212, 255, 0.02) 0%, transparent 50%);
        }

        /* Hide CSS matrix rain - using canvas instead */
        [data-theme='dark'] [data-bg-effect='matrix'] body::after,
        [data-theme='dark'][data-bg-effect='matrix'] body::after {
          display: none !important;
        }

        /* Hide matrix rain when off or starfield selected */
        [data-theme='dark'] [data-bg-effect='off'] body::after,
        [data-theme='dark'] [data-bg-effect='starfield'] body::after {
          display: none !important;
        }

        /* SOLID OBSIDIAN - No transparency anywhere */
        [data-theme='dark'] body, 
        [data-theme='dark'] .min-h-screen,
        [data-theme='dark'] main {
          background-color: var(--obsidian) !important;
          color: #ffffff !important;
        }

        /* Allow Command Deck to show its background image */
        [data-theme='dark'] main[data-page='CommandDeck'].min-h-screen,
        [data-theme='dark'] main[data-page='CommandDeck'] {
          background-color: transparent !important;
        }

        /* FORCE SOLID OBSIDIAN on all backgrounds - eliminate ALL fading/transparency */
        [data-theme='dark'] [class*='bg-white'],
        [data-theme='dark'] [class*='bg-gray-'],
        [data-theme='dark'] [class*='bg-slate-'] { 
          background-color: var(--obsidian) !important; 
          color: #ffffff !important;
          border-color: rgba(0, 255, 136, 0.2) !important;
        }

        /* Specific overrides for gradient backgrounds - exclude mission card image containers */
        [data-theme='dark'] [class*='bg-gradient-']:not(.mission-card *) {
          background: var(--obsidian) !important;
          background-image: none !important;
        }

        /* Mission card image container should keep its gradient fallback */
        [data-theme='dark'] .mission-card [class*='bg-gradient-'] {
          background: linear-gradient(to br, #7c3aed, #9333ea) !important;
        }

        /* Fix any semi-transparent overlays */
        [data-theme='dark'] [class*='bg-white/'],
        [data-theme='dark'] [class*='bg-slate-50/'],
        [data-theme='dark'] [class*='bg-gray-50/'] {
          background-color: var(--obsidian) !important;
        }

        /* Neon borders with strong glow */
        [data-theme='dark'] [class*='border-slate-'],
        [data-theme='dark'] [class*='border-gray-'] { 
          border-color: rgba(0, 255, 136, 0.25) !important; 
        }

        /* HIGH CONTRAST text - white primary, neon secondary */
        [data-theme='dark'] [class*='text-slate-900'],
        [data-theme='dark'] [class*='text-gray-900'],
        [data-theme='dark'] [class*='text-blue-950'] { color: #ffffff !important; }
        [data-theme='dark'] [class*='text-slate-800'],
        [data-theme='dark'] [class*='text-gray-800'] { color: #f5f5f5 !important; }
        [data-theme='dark'] [class*='text-slate-700'],
        [data-theme='dark'] [class*='text-gray-700'] { color: #e8e8e8 !important; }
        [data-theme='dark'] [class*='text-slate-600'],
        [data-theme='dark'] [class*='text-gray-600'] { color: #d0d0d0 !important; }
        [data-theme='dark'] [class*='text-slate-500'],
        [data-theme='dark'] [class*='text-gray-500'],
        [data-theme='dark'] [class*='text-zinc-500'] { color: #b8b8b8 !important; }
        [data-theme='dark'] [class*='text-slate-400'],
        [data-theme='dark'] [class*='text-gray-400'] { color: #a0a0a0 !important; }
        [data-theme='dark'] [class*='text-slate-300'],
        [data-theme='dark'] [class*='text-gray-300'] { color: #8a8a8a !important; }

        /* Profile page specific - ensure high contrast on card content */
        [data-theme='dark'] main[data-page='Profile'] [class*='text-slate-'],
        [data-theme='dark'] main[data-page='Profile'] [class*='text-zinc-'],
        [data-theme='dark'] main[data-page='Profile'] p,
        [data-theme='dark'] main[data-page='Profile'] span,
        [data-theme='dark'] main[data-page='Profile'] div {
          color: #e8e8e8 !important;
        }

        /* CardTitle and headings always white */
        [data-theme='dark'] main[data-page='Profile'] h1,
        [data-theme='dark'] main[data-page='Profile'] h2,
        [data-theme='dark'] main[data-page='Profile'] h3,
        [data-theme='dark'] main[data-page='Profile'] h4,
        [data-theme='dark'] main[data-page='Profile'] [class*='CardTitle'],
        [data-theme='dark'] main[data-page='Profile'] [class*='font-bold'] {
          color: #ffffff !important;
        }

        /* Labels remain lighter */
        [data-theme='dark'] main[data-page='Profile'] label,
        [data-theme='dark'] main[data-page='Profile'] [class*='Label'] {
          color: #b8b8b8 !important;
        }

        /* Cards and containers - solid obsidian with neon glow borders */
        [data-theme='dark'] .rounded-xl, 
        [data-theme='dark'] .rounded-lg,
        [data-theme='dark'] .rounded-2xl,
        [data-theme='dark'] .rounded-md {
          background-color: var(--obsidian) !important;
          border: 1px solid rgba(0, 255, 136, 0.2) !important;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.05), inset 0 1px 0 rgba(0, 255, 136, 0.08) !important;
        }

        /* Profile page - ensure all card backgrounds and text are readable */
        [data-theme='dark'] main[data-page='Profile'] .bg-purple-100,
        [data-theme='dark'] main[data-page='Profile'] [class*='bg-purple-100'] {
          background-color: var(--obsidian) !important;
        }

        /* Intentions card - force high contrast */
        [data-theme='dark'] main[data-page='Profile'] [class*='CardContent'] p,
        [data-theme='dark'] main[data-page='Profile'] [class*='CardContent'] span {
          color: #e8e8e8 !important;
          font-weight: 500 !important;
        }

        /* Sidebar and nav - solid obsidian, no leakage */
        [data-theme='dark'] aside,
        [data-theme='dark'] nav,
        [data-theme='dark'] [class*='sidebar'],
        [data-theme='dark'] [data-sidebar] {
          background-color: var(--obsidian) !important;
          border-color: rgba(0, 255, 136, 0.2) !important;
        }

        /* Presence and Theme panels - enforce solid */
        [data-theme='dark'] [class*='panel'],
        [data-theme='dark'] [class*='dropdown'],
        [data-theme='dark'] [class*='popover'] {
          background-color: var(--obsidian) !important;
          border-color: rgba(0, 255, 136, 0.25) !important;
        }

        /* Search bar and inputs - obsidian with neon border */
        [data-theme='dark'] input,
        [data-theme='dark'] textarea,
        [data-theme='dark'] select {
          background-color: var(--obsidian) !important;
          color: #ffffff !important;
          border-color: rgba(0, 255, 136, 0.3) !important;
        }
        [data-theme='dark'] input:focus,
        [data-theme='dark'] textarea:focus,
        [data-theme='dark'] select:focus {
          border-color: var(--neon-green) !important;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.4) !important;
          outline: none !important;
        }
        [data-theme='dark'] input::placeholder,
        [data-theme='dark'] textarea::placeholder {
          color: rgba(0, 212, 255, 0.5) !important;
        }

        /* Buttons - solid with neon glow on hover */
        [data-theme='dark'] button,
        [data-theme='dark'] [role="button"] {
          background-color: var(--obsidian) !important;
          border-color: rgba(0, 255, 136, 0.25) !important;
        }
        [data-theme='dark'] button:hover,
        [data-theme='dark'] [role="button"]:hover {
          box-shadow: 0 0 18px rgba(0, 255, 136, 0.5) !important;
          border-color: var(--neon-green) !important;
        }

        /* Active/selected states - vibrant neon glow */
        [data-theme='dark'] [data-state="active"],
        [data-theme='dark'] [aria-selected="true"] {
          background-color: rgba(0, 255, 136, 0.1) !important;
          border-color: var(--neon-green) !important;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.4) !important;
          color: var(--neon-green) !important;
        }

        /* Tabs - solid with neon active state */
        [data-theme='dark'] [role="tablist"] {
          background-color: var(--obsidian) !important;
          border-color: rgba(0, 255, 136, 0.2) !important;
        }
        [data-theme='dark'] [role="tab"] {
          background-color: transparent !important;
          color: rgba(0, 212, 255, 0.8) !important;
        }
        [data-theme='dark'] [role="tab"][data-state="active"] {
          background-color: rgba(0, 255, 136, 0.15) !important;
          color: var(--neon-green) !important;
          border-color: var(--neon-green) !important;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.3) !important;
        }

        /* Modals and dialogs - solid obsidian */
        [data-theme='dark'] [role="dialog"],
        [data-theme='dark'] [data-radix-popper-content-wrapper] > * {
          background-color: var(--obsidian) !important;
          border: 1px solid rgba(0, 255, 136, 0.25) !important;
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.15), 0 0 80px rgba(0, 212, 255, 0.08) !important;
        }

        /* Empty state containers - solid obsidian */
        [data-theme='dark'] [class*='empty'],
        [data-theme='dark'] [class*='placeholder'] {
          background-color: var(--obsidian) !important;
        }

        /* Scrollbar neon style */
        [data-theme='dark'] ::-webkit-scrollbar {
          background-color: var(--obsidian) !important;
          width: 8px;
        }
        [data-theme='dark'] ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--neon-green), var(--neon-teal)) !important;
          border-radius: 4px;
        }
        [data-theme='dark'] ::-webkit-scrollbar-thumb:hover {
          box-shadow: 0 0 12px var(--neon-green) !important;
        }

        /* Command Deck neon accent */
        [data-theme='dark'] main[data-page='CommandDeck'] { 
          --gold: var(--neon-green);
          background-color: transparent !important;
        }
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-slate-900'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-slate-800'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-slate-700'] {
          color: var(--neon-green) !important;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
        }
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-950'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-900'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-800'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-700'],
        [data-theme='dark'] main[data-page='CommandDeck'] [class*='text-violet-600'] {
          color: var(--neon-purple) !important;
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
        }

        /* Ensure Avatar dashboard stats stay readable */
        [data-theme='dark'] main[data-page='CommandDeck'] [data-cmd-stats],
        [data-theme='dark'] main[data-page='CommandDeck'] [data-cmd-stats] * {
          color: var(--obsidian) !important;
        }

        /* Dark mode: Stat numbers neon */
        [data-theme='dark'] main[data-page='CommandDeck'] [data-stats-bar] .stat-number {
          color: var(--neon-teal) !important;
          text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
        }

        /* SidePanel control buttons - neon style */
        [data-theme='dark'] [data-ggg-controls] {
          background-color: var(--obsidian) !important;
          border-color: rgba(0, 255, 136, 0.2) !important;
        }
        [data-theme='dark'] [data-ggg-controls] .btn-ctrl {
          background-color: var(--obsidian) !important;
          color: var(--neon-green) !important;
          border-color: rgba(0, 255, 136, 0.3) !important;
        }
        [data-theme='dark'] [data-ggg-controls] .btn-ctrl:hover {
          background-color: rgba(0, 255, 136, 0.1) !important;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.3) !important;
        }

        /* Badges and pills - neon glow */
        [data-theme='dark'] [class*='badge'],
        [data-theme='dark'] .badge {
          background-color: var(--obsidian) !important;
          border: 1px solid rgba(0, 255, 136, 0.3) !important;
          box-shadow: 0 0 8px rgba(0, 255, 136, 0.2) !important;
        }

        /* Icons - neon glow */
        [data-theme='dark'] svg {
          filter: drop-shadow(0 0 3px rgba(0, 255, 136, 0.4));
        }

        /* Hover effects with neon glow */
        [data-theme='dark'] [class*='hover\\:bg-']:hover {
          box-shadow: 0 0 18px rgba(0, 255, 136, 0.25) !important;
        }

        /* Fix violet/purple backgrounds to obsidian */
        [data-theme='dark'] [class*='bg-violet-'],
        [data-theme='dark'] [class*='bg-purple-'] {
          background-color: rgba(0, 255, 136, 0.1) !important;
          border-color: var(--neon-green) !important;
        }

        /* Profile Menu - solid obsidian with neon glow and glitch slide effect */
        [data-theme='dark'] [data-radix-menu-content],
        [data-theme='dark'] [role="menu"] {
          background-color: #050505 !important;
          border: 1px solid var(--neon-green) !important;
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.4), 0 0 50px rgba(0, 255, 136, 0.15) !important;
          z-index: 9999 !important;
        }

        [data-theme='dark'] [data-radix-menu-content] [role="menuitem"],
        [data-theme='dark'] [role="menu"] [role="menuitem"] {
          color: #ffffff !important;
          background-color: transparent !important;
        }

        [data-theme='dark'] [data-radix-menu-content] [role="menuitem"]:hover,
        [data-theme='dark'] [data-radix-menu-content] [role="menuitem"]:focus,
        [data-theme='dark'] [role="menu"] [role="menuitem"]:hover {
          background-color: rgba(0, 255, 136, 0.15) !important;
          color: var(--neon-green) !important;
          box-shadow: inset 0 0 10px rgba(0, 255, 136, 0.2) !important;
        }

        [data-theme='dark'] [data-radix-menu-content] [role="separator"],
        [data-theme='dark'] [role="menu"] [role="separator"] {
          background-color: rgba(0, 255, 136, 0.3) !important;
        }

        /* Glitch transition animation for menus */
        @keyframes glitchSlideIn {
          0% { 
            opacity: 0; 
            transform: translateX(20px) skewX(-2deg);
            filter: blur(2px);
          }
          30% { 
            opacity: 0.7; 
            transform: translateX(-5px) skewX(1deg);
            filter: blur(0);
          }
          60% { 
            transform: translateX(3px) skewX(-0.5deg);
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) skewX(0);
          }
        }

        [data-theme='dark'] [data-radix-menu-content][data-state="open"],
        [data-theme='dark'] [role="menu"][data-state="open"] {
          animation: glitchSlideIn 0.25s ease-out forwards !important;
        }

        /* Side Panel Handle - Dark/Hacker Theme */
        [data-theme='dark'] [data-side-panel-handle] > div,
        [data-theme='hacker'] [data-side-panel-handle] > div {
          background: #050505 !important;
          background-image: none !important;
          border: 1px solid var(--neon-green, #00ff88) !important;
          border-right: none !important;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.05) !important;
        }

        [data-theme='dark'] [data-side-panel-handle]:hover > div,
        [data-theme='hacker'] [data-side-panel-handle]:hover > div {
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.5), inset 0 0 30px rgba(0, 255, 136, 0.1) !important;
        }

        [data-theme='dark'] [data-side-panel-handle] .dot-glow,
        [data-theme='hacker'] [data-side-panel-handle] .dot-glow {
          background-color: rgba(0, 255, 136, 0.5) !important;
          box-shadow: 0 0 6px rgba(0, 255, 136, 0.8);
        }

        [data-theme='dark'] [data-side-panel-handle]:hover .dot-glow,
        [data-theme='hacker'] [data-side-panel-handle]:hover .dot-glow {
          background-color: var(--neon-green, #00ff88) !important;
          box-shadow: 0 0 10px var(--neon-green, #00ff88);
        }

        [data-theme='dark'] [data-side-panel-handle] .icon-glow,
        [data-theme='hacker'] [data-side-panel-handle] .icon-glow {
          color: rgba(0, 255, 136, 0.7) !important;
          filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.6));
        }

        [data-theme='dark'] [data-side-panel-handle]:hover .icon-glow,
        [data-theme='hacker'] [data-side-panel-handle]:hover .icon-glow {
          color: var(--neon-green, #00ff88) !important;
          filter: drop-shadow(0 0 8px var(--neon-green, #00ff88));
        }

        /* Hacker theme handle - pure green on black */
        [data-theme='hacker'] [data-side-panel-handle] > div {
          border-color: #00ff00 !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.08) !important;
        }

        [data-theme='hacker'] [data-side-panel-handle] .dot-glow {
          background-color: rgba(0, 255, 0, 0.5) !important;
          box-shadow: 0 0 6px rgba(0, 255, 0, 0.8);
        }

        [data-theme='hacker'] [data-side-panel-handle] .icon-glow {
          color: rgba(0, 255, 0, 0.7) !important;
          filter: drop-shadow(0 0 4px rgba(0, 255, 0, 0.6));
        }

        /* ============================================
           MISSION CARD - Dark/Hacker Theme Styling
           ============================================ */

        /* Mission card container */
        [data-theme='dark'] .mission-card,
        [data-theme='hacker'] .mission-card {
          background-color: #050505 !important;
          border: 1px solid rgba(0, 255, 136, 0.3) !important;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.1) !important;
        }

        [data-theme='hacker'] .mission-card {
          border-color: #00ff00 !important;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.15) !important;
        }

        /* Mission title - monospace terminal font */
        [data-theme='dark'] .mission-title,
        [data-theme='hacker'] .mission-title {
          color: #ffffff !important;
          font-family: 'Courier New', Consolas, monospace !important;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
          letter-spacing: 0.5px;
        }

        [data-theme='hacker'] .mission-title {
          color: #00ff00 !important;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
        }

        /* Mission description - high contrast */
        [data-theme='dark'] .mission-description,
        [data-theme='hacker'] .mission-description {
          color: rgba(0, 212, 255, 0.9) !important;
          font-family: 'Courier New', Consolas, monospace !important;
        }

        [data-theme='hacker'] .mission-description {
          color: rgba(0, 255, 0, 0.8) !important;
        }

        /* Mission meta text (time, participants) */
        [data-theme='dark'] .mission-meta-text,
        [data-theme='hacker'] .mission-meta-text {
          color: rgba(0, 255, 136, 0.8) !important;
        }

        [data-theme='hacker'] .mission-meta-text {
          color: rgba(0, 255, 0, 0.8) !important;
        }

        [data-theme='dark'] .mission-icon,
        [data-theme='hacker'] .mission-icon {
          color: var(--neon-green, #00ff88) !important;
          filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.5));
        }

        [data-theme='hacker'] .mission-icon {
          color: #00ff00 !important;
          filter: drop-shadow(0 0 4px rgba(0, 255, 0, 0.6));
        }

        /* Mission type badge */
        [data-theme='dark'] .mission-type-badge,
        [data-theme='hacker'] .mission-type-badge {
          background-color: rgba(0, 255, 136, 0.2) !important;
          color: var(--neon-green, #00ff88) !important;
          border: 1px solid var(--neon-green, #00ff88) !important;
          font-family: 'Courier New', Consolas, monospace !important;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        [data-theme='hacker'] .mission-type-badge {
          background-color: rgba(0, 255, 0, 0.15) !important;
          color: #00ff00 !important;
          border-color: #00ff00 !important;
        }

        /* Rewards section */
        [data-theme='dark'] .mission-rewards,
        [data-theme='hacker'] .mission-rewards {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 212, 255, 0.05)) !important;
          border: 1px solid rgba(0, 255, 136, 0.3) !important;
        }

        [data-theme='hacker'] .mission-rewards {
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 200, 0, 0.05)) !important;
          border-color: rgba(0, 255, 0, 0.4) !important;
        }

        /* Reward label */
        [data-theme='dark'] .reward-label,
        [data-theme='hacker'] .reward-label {
          color: var(--neon-green, #00ff88) !important;
          font-family: 'Courier New', Consolas, monospace !important;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        [data-theme='hacker'] .reward-label {
          color: #00ff00 !important;
        }

        /* Reward amounts with neon glow */
        [data-theme='dark'] .reward-amount,
        [data-theme='hacker'] .reward-amount {
          color: #ffffff !important;
          font-family: 'Courier New', Consolas, monospace !important;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.6), 0 0 20px rgba(0, 255, 136, 0.3);
          animation: rewardPulse 2s ease-in-out infinite;
        }

        [data-theme='hacker'] .reward-amount {
          color: #00ff00 !important;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4);
        }

        @keyframes rewardPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(0, 255, 136, 0.6), 0 0 20px rgba(0, 255, 136, 0.3); }
          50% { text-shadow: 0 0 15px rgba(0, 255, 136, 0.9), 0 0 30px rgba(0, 255, 136, 0.5); }
        }

        [data-theme='hacker'] .reward-amount {
          animation-name: rewardPulseHacker;
        }

        @keyframes rewardPulseHacker {
          0%, 100% { text-shadow: 0 0 10px rgba(0, 255, 0, 0.8), 0 0 20px rgba(0, 255, 0, 0.4); }
          50% { text-shadow: 0 0 15px rgba(0, 255, 0, 1), 0 0 30px rgba(0, 255, 0, 0.6); }
        }

        /* Reward icon glow */
        [data-theme='dark'] .reward-icon,
        [data-theme='hacker'] .reward-icon {
          color: var(--neon-green, #00ff88) !important;
          filter: drop-shadow(0 0 6px rgba(0, 255, 136, 0.8));
        }

        [data-theme='hacker'] .reward-icon {
          color: #00ff00 !important;
          filter: drop-shadow(0 0 6px rgba(0, 255, 0, 0.9));
        }

        /* Progress bar in mission cards */
        [data-theme='dark'] .mission-card [role="progressbar"],
        [data-theme='hacker'] .mission-card [role="progressbar"] {
          background-color: rgba(0, 255, 136, 0.2) !important;
        }

        [data-theme='dark'] .mission-card [role="progressbar"] > div,
        [data-theme='hacker'] .mission-card [role="progressbar"] > div {
          background-color: var(--neon-green, #00ff88) !important;
          box-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
        }

        [data-theme='hacker'] .mission-card [role="progressbar"] {
          background-color: rgba(0, 255, 0, 0.2) !important;
        }

        [data-theme='hacker'] .mission-card [role="progressbar"] > div {
          background-color: #00ff00 !important;
          box-shadow: 0 0 8px rgba(0, 255, 0, 0.8);
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
          background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ebbb7d483_universal_upscale_0_d6828612-8b20-4bc7-aefe-008865240cf1_0.jpg') !important;
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          background-color: #050505 !important;
        }

        /* Hacker theme background for Command Deck - ensure no white flash */
        [data-theme='hacker'] main[data-page='CommandDeck'] {
          background-color: #000 !important;
          background-image: none !important;
        }

        /* Prevent white flash during theme transitions - apply to NON-CommandDeck pages */
        [data-theme='dark'] main:not([data-page='CommandDeck']) {
          background-color: #050505 !important;
          background-image: none !important;
          transition: none !important;
        }
        [data-theme='hacker'] main:not([data-page='CommandDeck']) {
          background-color: #000 !important;
          background-image: none !important;
          transition: none !important;
        }

        /* Command Deck keeps its background image in dark mode */
        [data-theme='dark'] main[data-page='CommandDeck'] {
          background-color: #050505 !important;
          background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ebbb7d483_universal_upscale_0_d6828612-8b20-4bc7-aefe-008865240cf1_0.jpg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-attachment: fixed !important;
        }

        /* Avatar card background - light mode uses gold shield, dark mode solid obsidian */
        [data-theme='light'] [data-avatar-card] [data-avatar-bg] {
          display: block;
          background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/f95689693_Screenshot2026-01-04192526.png') !important;
        }
        [data-theme='light'] [data-avatar-card] [data-avatar-overlay] {
          background: transparent;
        }
        [data-theme='dark'] [data-avatar-card] {
          background-color: #050505 !important;
          border: 1px solid rgba(0, 255, 136, 0.2) !important;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.08), inset 0 0 60px rgba(0, 212, 255, 0.03) !important;
        }
        [data-theme='dark'] [data-avatar-card] [data-avatar-bg] {
          display: none;
        }
        [data-theme='dark'] [data-avatar-card] [data-avatar-overlay] {
          background: transparent;
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
          [data-theme='hacker'] img:not([data-no-filter]):not(.mission-image):not(.mission-card img):not(.hero-image) { filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important; }
          [data-theme='hacker'] .hero-image { filter: grayscale(100%) brightness(0.6) sepia(100%) hue-rotate(70deg) saturate(400%) !important; }
          [data-theme='hacker'] .mission-card img,
          [data-theme='hacker'] .mission-image,
          [data-theme='hacker'] img[data-no-filter],
          [data-theme='hacker'] [data-no-filter="true"] { filter: none !important; }
          [data-theme='dark'] .mission-card img,
          [data-theme='dark'] .mission-image,
          [data-theme='dark'] img[data-no-filter],
          [data-theme='dark'] [data-no-filter="true"] { filter: none !important; }

          /* Hacker theme - brighter text, no fading */
          [data-theme='hacker'] h1, [data-theme='hacker'] h2, [data-theme='hacker'] h3, [data-theme='hacker'] h4,
          [data-theme='hacker'] [class*='font-semibold'], [data-theme='hacker'] [class*='font-bold'] {
            color: #00ff00 !important;
            text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
          }
          [data-theme='hacker'] p, [data-theme='hacker'] span:not(.dot-glow):not(.icon-glow),
          [data-theme='hacker'] div:not([class*='bg-']) {
            color: #00ff00 !important;
          }
          [data-theme='hacker'] [class*='text-slate-500'], [data-theme='hacker'] [class*='text-slate-400'],
          [data-theme='hacker'] [class*='text-slate-600'], [data-theme='hacker'] [class*='text-gray-500'] {
            color: #88ff88 !important;
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

      {/* Global Chat Widget */}
      <GlobalChatWidget />

      {/* Global Side Panel Nudge */}
      <GlobalSidePanelNudge />

      {/* Help Support Agent */}
      <HelpSupportAgent />

      {/* Global Photo Viewer */}
      <GlobalPhotoViewer />



      {/* Meeting Reminder Service */}
      {currentUser && <MeetingReminderService />}
    </div>
  );
}

// Nebula canvas effect
function NebulaCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const numParticles = 60;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Initialize nebula particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 150 + 50,
        color: ['#00ff88', '#00d4ff', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.15 + 0.05
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = canvas.height + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}

// Circuit board effect
function CircuitCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const nodes = [];
    const traces = [];
    const numNodes = 40;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Initialize circuit nodes
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        pulse: Math.random() * Math.PI * 2,
        size: Math.random() * 4 + 2
      });
    }
    
    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 200 && Math.random() > 0.7) {
          traces.push({ from: i, to: j, progress: 0, active: false, delay: Math.random() * 100 });
        }
      }
    }
    
    let frame = 0;
    const animate = () => {
      frame++;
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw traces
      traces.forEach(trace => {
        const from = nodes[trace.from];
        const to = nodes[trace.to];
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Animate pulse along trace
        if (frame % 120 === Math.floor(trace.delay)) {
          trace.active = true;
          trace.progress = 0;
        }
        
        if (trace.active) {
          trace.progress += 0.02;
          if (trace.progress >= 1) trace.active = false;
          
          const px = from.x + (to.x - from.x) * trace.progress;
          const py = from.y + (to.y - from.y) * trace.progress;
          
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#00ff88';
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        node.pulse += 0.02;
        const glow = 0.5 + Math.sin(node.pulse) * 0.3;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${glow})`;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}

// Main Layout component - check public pages BEFORE any hooks
// Starfield canvas component for cosmic background effect
function StarfieldCanvas({ rankCode = 'seeker' }) {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  
  // Rank-based star colors
  const rankColors = {
    seeker: ['#6b7280', '#9ca3af', '#00d4ff'],
    initiate: ['#60a5fa', '#93c5fd', '#00d4ff'],
    adept: ['#34d399', '#6ee7b7', '#00ff88'],
    practitioner: ['#10b981', '#a7f3d0', '#00ff88'],
    master: ['#f59e0b', '#fcd34d', '#fef3c7'],
    sage: ['#8b5cf6', '#c4b5fd', '#f59e0b'],
    oracle: ['#6366f1', '#a5b4fc', '#fde68a'],
    ascended: ['#fef3c7', '#fde68a', '#f59e0b'],
    guardian: ['#f59e0b', '#fcd34d', '#ffffff']
  };
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const stars = [];
    const numStars = 150;
    const colors = rankColors[rankCode] || rankColors.seeker;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Initialize stars with varying depths
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 3 + 0.5, // depth/parallax
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        // Parallax movement
        star.x -= star.z * 0.15;
        star.twinkle += star.twinkleSpeed;
        
        // Wrap around
        if (star.x < 0) {
          star.x = canvas.width;
          star.y = Math.random() * canvas.height;
        }
        
        // Twinkle effect
        const alpha = 0.5 + Math.sin(star.twinkle) * 0.4;
        const glowSize = star.size * (1 + Math.sin(star.twinkle) * 0.3);
        
        // Draw glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize * 3);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(0.5, star.color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fill();
        
        // Draw star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rankCode]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}

export default function Layout({ children, currentPageName }) {
  // CRITICAL: Public pages bypass ALL hooks and render immediately
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }
  
  // Non-public pages use the authenticated layout with hooks
  return <AuthenticatedLayout currentPageName={currentPageName}>{children}</AuthenticatedLayout>;
}