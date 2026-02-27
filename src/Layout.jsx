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
import RightSideTabs from '@/components/hud/RightSideTabs';
import DatingMatchesPopup from '@/components/hud/DatingMatchesPopup';
import GlobalSidePanelNudge from '@/components/hud/GlobalSidePanelNudge';
import SidePanel from '@/components/hud/SidePanel';

import GlobalPhotoViewer from '@/components/profile/GlobalPhotoViewer';
import HeroGalleryViewer from '@/components/hud/HeroGalleryViewer';
import { useLiveStatus } from '@/components/community/LiveStatusIndicator';
import MobileTabBar from '@/components/hud/MobileTabBar';
import MobileWalletSheet from '@/components/hud/MobileWalletSheet';
import MobileMenuSheet from '@/components/hud/MobileMenuSheet';
import FullscreenMatchesSwiper from '@/components/hud/FullscreenMatchesSwiper';
import MobileCloseButton from '@/components/hud/MobileCloseButton';

import MeetingReminderService from '@/components/MeetingReminderService';
import { createPageUrl } from '@/utils';
import InteractiveOnboardingTour from '@/components/onboarding/InteractiveOnboardingTour';
import AnnouncementBanner from '@/components/hud/AnnouncementBanner';

import GlobalAlertPopup from '@/components/hud/GlobalAlertPopup';
import FloatingNotesWidget from '@/components/notes/FloatingNotesWidget';

const PUBLIC_PAGES = ['Join', 'join', 'SignUp', 'Welcome', 'Onboarding', 'Terms', 'FAQ', 'Home', 'home', 'DemoPreview'];

// Global hacker theme draggable popup handler
function useHackerDraggablePopups() {
  useEffect(() => {
    const handleThemeChange = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme !== 'hacker') return;
      
      // Find all dialogs and make them draggable
      const setupDraggable = (el) => {
        if (el.dataset.hackerDraggable) return;
        el.dataset.hackerDraggable = 'true';
        
        let isDragging = false;
        let startX = 0, startY = 0;
        let offsetX = 0, offsetY = 0;
        
        const onMouseDown = (e) => {
          if (e.target.closest('button, input, textarea, select, a, [role="button"]')) return;
          isDragging = true;
          startX = e.clientX - offsetX;
          startY = e.clientY - offsetY;
          el.style.transition = 'none';
        };
        
        const onMouseMove = (e) => {
          if (!isDragging) return;
          e.preventDefault();
          offsetX = e.clientX - startX;
          offsetY = e.clientY - startY;
          el.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        };
        
        const onMouseUp = () => {
          isDragging = false;
          el.style.transition = '';
        };
        
        el.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Touch support
        el.addEventListener('touchstart', (e) => {
          if (e.target.closest('button, input, textarea, select, a, [role="button"]')) return;
          isDragging = true;
          startX = e.touches[0].clientX - offsetX;
          startY = e.touches[0].clientY - offsetY;
          el.style.transition = 'none';
        });
        document.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          offsetX = e.touches[0].clientX - startX;
          offsetY = e.touches[0].clientY - startY;
          el.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        });
        document.addEventListener('touchend', onMouseUp);
      };
      
      // Observe for new dialogs
      document.querySelectorAll('[role="dialog"], [data-radix-dialog-content]').forEach(setupDraggable);
    };
    
    // Run on theme changes and periodically check for new dialogs
    const observer = new MutationObserver(() => {
      if (document.documentElement.getAttribute('data-theme') === 'hacker') {
        document.querySelectorAll('[role="dialog"], [data-radix-dialog-content]').forEach(el => {
          if (!el.dataset.hackerDraggable) {
            el.dataset.hackerDraggable = 'true';
            let isDragging = false;
            let startX = 0, startY = 0;
            let offsetX = 0, offsetY = 0;
            
            el.addEventListener('mousedown', (e) => {
              if (e.target.closest('button, input, textarea, select, a, [role="button"]')) return;
              isDragging = true;
              startX = e.clientX - offsetX;
              startY = e.clientY - offsetY;
              el.style.transition = 'none';
            });
            
            document.addEventListener('mousemove', (e) => {
              if (!isDragging) return;
              e.preventDefault();
              offsetX = e.clientX - startX;
              offsetY = e.clientY - startY;
              el.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
            });
            
            document.addEventListener('mouseup', () => {
              isDragging = false;
              el.style.transition = '';
            });
          }
        });
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    handleThemeChange();
    
    return () => observer.disconnect();
  }, []);
}

// Authenticated layout with all the hooks - only used for protected pages
function AuthenticatedLayout({ children, currentPageName }) {
  // Enable hacker theme draggable popups
  useHackerDraggablePopups();
  
  // On mobile, sidebar starts collapsed
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return true;
      }
      return false;
    });
  const [topbarCollapsed, setTopbarCollapsed] = useState(false);
  const [mode, setMode] = useState('command');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [openProfileUserIds, setOpenProfileUserIds] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [floatingChat, setFloatingChat] = useState(null);
  const [theme, setTheme] = useState('light');
  const [bgEffect, setBgEffect] = useState(() => {
    try { return localStorage.getItem('bgEffect') || 'matrix'; } catch { return 'matrix'; }
  });
  const [floatingSidePanelOpen, setFloatingSidePanelOpen] = useState(false);
  const [userTourOpen, setUserTourOpen] = useState(false);
      const [mobileWalletOpen, setMobileWalletOpen] = useState(false);
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [fullscreenMatchesOpen, setFullscreenMatchesOpen] = useState(false);
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
      if (e.detail?.recipientId) {
        setFloatingChat({
          recipientId: e.detail.recipientId,
          recipientName: e.detail.recipientName || 'User',
          recipientAvatar: e.detail.recipientAvatar || ''
        });
      }
    };
    const handleOpenFloatingSidePanel = () => {
      setFloatingSidePanelOpen(true);
    };
    const handleOpenFullscreenMatches = () => {
      setFullscreenMatchesOpen(true);
    };
    document.addEventListener('click', handleProfileClick);
    document.addEventListener('openProfile', handleOpenProfile);
    document.addEventListener('openFloatingChat', handleOpenChat);
    document.addEventListener('openFloatingSidePanel', handleOpenFloatingSidePanel);
    document.addEventListener('openFullscreenMatches', handleOpenFullscreenMatches);
    return () => {
      document.removeEventListener('click', handleProfileClick);
      document.removeEventListener('openProfile', handleOpenProfile);
      document.removeEventListener('openFloatingChat', handleOpenChat);
      document.removeEventListener('openFloatingSidePanel', handleOpenFloatingSidePanel);
      document.removeEventListener('openFullscreenMatches', handleOpenFullscreenMatches);
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
    },
    staleTime: 300000 // Cache for 5 minutes
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
              return base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1);
            },
    enabled: !!currentUser?.email,
    staleTime: 1800000, // Cache for 30 minutes
    gcTime: 3600000, // Keep in cache for 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: false,
  });
  const profile = profiles?.[0];
  const cmdViewMode = profile?.command_deck_layout?.view_mode;

  // Heartbeat DISABLED to reduce rate limits
  // useEffect(() => {
  //   if (!profile?.id) return;
  //   const update = async () => {
  //     await base44.entities.UserProfile.update(profile.id, { last_seen_at: new Date().toISOString() });
  //   };
  //   update();
  //   const i = setInterval(update, 300000);
  //   return () => clearInterval(i);
  // }, [profile?.id]);

  // Initialize live status tracking
  useLiveStatus();

  // Fetch notifications - DISABLED to reduce rate limits
  const notifications = [];

  // Onboarding progress for redirect - cached heavily
  const { data: onboardingRecords, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboardingProgress', currentUser?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 3600000, // Cache for 60 minutes
    gcTime: 7200000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
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
          } else if (type === 'dailylog') {
            window.location.href = createPageUrl('DailyOps') + `?date=${item.date}`;
            setSearchOpen(false);
          } else if (type === 'note') {
            window.location.href = createPageUrl('Notes') + `?id=${item.id}`;
            setSearchOpen(false);
          } else if (type === 'meeting') {
            window.location.href = createPageUrl('Meetings') + `?id=${item.id}`;
            setSearchOpen(false);
          } else if (type === 'event') {
            window.location.href = createPageUrl('Events') + `?id=${item.id}`;
            setSearchOpen(false);
          } else if (type === 'mission') {
            window.location.href = createPageUrl('MissionDetail') + `?id=${item.id}`;
            setSearchOpen(false);
          } else if (type === 'listing') {
            window.location.href = createPageUrl('ListingDetail') + `?id=${item.id}`;
            setSearchOpen(false);
          } else if (type === 'circle') {
            window.location.href = createPageUrl('Circles') + `?id=${item.id}`;
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
      if (all.length === 0) return;

      // Immediately set cache to empty to update UI
      queryClient.setQueryData(['notifications'], []);

      try {
        // Delete all notifications in parallel
        await Promise.all(all.map(n => 
          base44.entities.Notification.delete(n.id).catch(err => {
            console.warn('Failed to delete notification:', n.id, err);
          })
        ));
      } catch (e) {
        console.error('Failed to clear notifications:', e);
      }
      // Force refetch after deletion
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
                base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
              }
            }, [currentUser]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPageName]);

  // If authenticated and onboarding missing or not complete, force Onboarding
    // Otherwise, redirect to Command Deck if on a generic/home page
    useEffect(() => {
      const justCompleted = typeof window !== 'undefined' && localStorage.getItem('onboardingJustCompleted') === '1';
      const tourDismissed = typeof window !== 'undefined' && localStorage.getItem('tourDismissed') === '1';
      if (!currentUser || currentPageName === 'Onboarding') return;
      if (onboardingRecords === undefined || onboardingLoading) return; // wait until loaded to avoid flicker/loop

      // Only show tour for brand new users who JUST completed onboarding
      // If justCompleted flag is set AND tour not dismissed, show tour then clear flag
      if (justCompleted && !tourDismissed && !userTourOpen) {
        try { localStorage.removeItem('onboardingJustCompleted'); } catch {}
        setUserTourOpen(true);
        return;
      }

      // For returning users (no justCompleted flag), never show tour
      // Skip tour entirely for existing users

      // Redirect to onboarding if:
      // 1. No record exists (brand new user)
      // 2. Record exists but status is not complete
      if (!onboarding || onboarding.status !== 'complete') {
        window.location.href = createPageUrl('Onboarding');
        return;
      }

      // For returning users with complete onboarding, redirect to Command Deck if on generic pages
      const genericPages = ['Home', 'home', 'Landing', 'Welcome'];
      if (onboarding?.status === 'complete' && genericPages.includes(currentPageName)) {
        window.location.href = createPageUrl('CommandDeck');
        return;
      }
    }, [currentUser, onboardingRecords, onboardingLoading, onboarding, currentPageName]);

  // If auth state is still loading (undefined), show loading spinner
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  // If no user and not public page, show blank while redirecting to login
  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  // If onboarding data is still loading, show loading spinner
  if (onboardingLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
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

        /* Dark theme backgrounds - transparent to show effects */
        [data-theme='dark'] body {
          background-color: var(--obsidian) !important;
        }
        [data-theme='dark'] .min-h-screen,
        [data-theme='dark'] main {
          background-color: transparent !important;
          color: #ffffff !important;
        }

        /* Allow Command Deck to show its background image */
        [data-theme='dark'] main[data-page='CommandDeck'].min-h-screen,
        [data-theme='dark'] main[data-page='CommandDeck'] {
          background-color: transparent !important;
        }

        /* Semi-transparent dark backgrounds to show effects through */
        [data-theme='dark'] [class*='bg-white'],
        [data-theme='dark'] [class*='bg-gray-'],
        [data-theme='dark'] [class*='bg-slate-'] { 
          background-color: rgba(5, 5, 5, 0.75) !important; 
          color: #ffffff !important;
          border-color: rgba(0, 255, 136, 0.2) !important;
        }

        /* Ensure page backgrounds are transparent to show canvas effects */
        [data-theme='dark'] .min-h-screen,
        [data-theme='hacker'] .min-h-screen {
          background-color: transparent !important;
          background-image: none !important;
        }
        
        [data-theme='hacker'] body {
          background-color: #000 !important;
        }

        /* Specific overrides for gradient backgrounds - make transparent */
        [data-theme='dark'] [class*='bg-gradient-']:not(.mission-card *):not(.hero-gradient):not(main[data-page='CommandDeck'] *):not(.page-hero *) {
          background: transparent !important;
          background-image: none !important;
        }

        /* Page header titles - brighter in dark themes */
        [data-theme='dark'] h1,
        [data-theme='dark'] h2 {
          color: #ffffff !important;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
        }
        [data-theme='hacker'] h1,
        [data-theme='hacker'] h2 {
          color: #00ff00 !important;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
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

        /* Cards and containers - semi-transparent to show effects through */
        /* EXCLUDE images from these styles */
        [data-theme='dark'] .rounded-xl:not(img):not([data-no-filter="true"]), 
        [data-theme='dark'] .rounded-lg:not(img):not([data-no-filter="true"]),
        [data-theme='dark'] .rounded-2xl:not(img):not([data-no-filter="true"]),
        [data-theme='dark'] .rounded-md:not(img):not([data-no-filter="true"]) {
          background-color: rgba(0, 0, 0, 0.75) !important;
          border: 1px solid rgba(0, 255, 136, 0.2) !important;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.05), inset 0 1px 0 rgba(0, 255, 136, 0.08) !important;
        }
        
        /* Trust gauge container - no box styling - HIGHEST SPECIFICITY */
        html[data-theme='dark'] [data-no-filter="true"],
        html[data-theme='dark'] [data-no-filter="true"] *,
        html[data-theme='dark'] div[data-no-filter="true"],
        html[data-theme='dark'] div[data-no-filter="true"] *,
        html[data-theme='hacker'] [data-no-filter="true"],
        html[data-theme='hacker'] [data-no-filter="true"] *,
        html[data-theme='hacker'] div[data-no-filter="true"],
        html[data-theme='hacker'] div[data-no-filter="true"] *,
        [data-theme='dark'] [data-no-filter="true"],
        [data-theme='dark'] [data-no-filter="true"] *,
        [data-theme='hacker'] [data-no-filter="true"],
        [data-theme='hacker'] [data-no-filter="true"] * {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* Hacker theme - also exclude data-no-filter from square styling */
        [data-theme='hacker'] .rounded-xl:not(img):not([data-no-filter="true"]),
        [data-theme='hacker'] .rounded-lg:not(img):not([data-no-filter="true"]),
        [data-theme='hacker'] .rounded-2xl:not(img):not([data-no-filter="true"]),
        [data-theme='hacker'] .rounded-md:not(img):not([data-no-filter="true"]) {
          border-radius: 0 !important;
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
          background-color: #0a0a0a !important;
          color: #ffffff !important;
          border-color: rgba(0, 255, 136, 0.3) !important;
          opacity: 1 !important;
        }
        [data-theme='dark'] select option {
          background-color: #0a0a0a !important;
          color: #ffffff !important;
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
          background-color: #050505 !important;
          border: 1px solid rgba(0, 255, 136, 0.25) !important;
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.15), 0 0 80px rgba(0, 212, 255, 0.08) !important;
          opacity: 1 !important;
        }

        /* Hacker theme dialogs - pure black solid */
        [data-theme='hacker'] [role="dialog"],
        [data-theme='hacker'] [data-radix-popper-content-wrapper] > *,
        [data-theme='hacker'] [data-radix-dialog-content] {
          background-color: #000000 !important;
          border: 1px solid #00ff00 !important;
          box-shadow: 0 0 40px rgba(0, 255, 0, 0.3) !important;
          opacity: 1 !important;
        }
        [data-theme='hacker'] [role="dialog"] *,
        [data-theme='hacker'] [data-radix-dialog-content] * {
          background-color: transparent !important;
        }
        [data-theme='hacker'] [role="dialog"] > div,
        [data-theme='hacker'] [data-radix-dialog-content] > div {
          background-color: #000000 !important;
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

        /* Icons - neon glow - but NOT inside images */
        [data-theme='dark'] svg:not(.listing-image svg) {
          filter: drop-shadow(0 0 3px rgba(0, 255, 136, 0.4));
        }

        /* Ensure listing images are never filtered */
        [data-theme='dark'] img.listing-image,
        [data-theme='dark'] .listing-image {
          filter: none !important;
          -webkit-filter: none !important;
          opacity: 1 !important;
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

        /* Side Panel Handle - ALL themes - FORCE 32px height */
        [data-side-panel-handle] {
          height: 32px !important;
          min-height: 32px !important;
          max-height: 32px !important;
        }
        [data-side-panel-handle] > div {
          height: 32px !important;
        }
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
          background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ccd2173e5_universal_upscale_0_cd3894c1-6a97-4a04-8d63-916963fb681c_0.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }

        /* Dark theme background for Command Deck - transparent to show canvas effects */
        [data-theme='dark'] main[data-page='CommandDeck'] {
          background-image: none !important;
          background-color: transparent !important;
        }

        /* Hacker theme background for Command Deck - transparent to show canvas effects */
        [data-theme='hacker'] main[data-page='CommandDeck'] {
          background-color: transparent !important;
          background-image: none !important;
        }

        /* Prevent white flash during theme transitions - apply to NON-CommandDeck pages */
        [data-theme='dark'] main:not([data-page='CommandDeck']) {
                    background-color: transparent !important;
                    background-image: none !important;
                    transition: none !important;
                  }
                  /* Override for pages with hero images */
                  [data-theme='dark'] main[data-page='Teams'],
                    [data-theme='dark'] main[data-page='Matches'],
                    [data-theme='dark'] main[data-page='Meetings'],
                    [data-theme='dark'] main[data-page='Gamification'],
                    [data-theme='dark'] main[data-page='Projects'] {
                      background-color: transparent !important;
                    }
                  [data-theme='hacker'] main:not([data-page='CommandDeck']) {
                    background-color: transparent !important;
                    background-image: none !important;
                    transition: none !important;
                  }
                  /* Override for pages with hero images */
                  [data-theme='hacker'] main[data-page='Teams'],
                    [data-theme='hacker'] main[data-page='Matches'],
                    [data-theme='hacker'] main[data-page='Meetings'],
                    [data-theme='hacker'] main[data-page='Gamification'],
                    [data-theme='hacker'] main[data-page='Projects'] {
                      background-color: transparent !important;
                    }

                  /* Hero section sizing */
                  .page-hero {
                    height: 256px;
                  }
                  @media (min-width: 768px) {
                    .page-hero {
                      height: 288px;
                    }
                  }
                  [data-theme='dark'] .page-hero {
                    height: 160px !important;
                    min-height: 160px !important;
                    max-height: 160px !important;
                    padding-top: 0 !important;
                    margin-top: -64px !important;
                  }
                  [data-theme='hacker'] .page-hero {
                    height: 320px !important;
                    min-height: 320px !important;
                    max-height: 320px !important;
                    padding-top: 0 !important;
                    margin-top: -64px !important;
                  }
                  [data-theme='dark'] .page-hero h1 {
                                  padding-top: 0 !important;
                                  margin-top: 0 !important;
                                }
                                [data-theme='hacker'] .page-hero h1 {
                                  padding-top: 0 !important;
                                  margin-top: 0 !important;
                                }
                                [data-theme='dark'] .page-hero .hero-content {
                                  padding-top: 30px !important;
                                  margin-top: 0 !important;
                                }
                                [data-theme='hacker'] .page-hero .hero-content {
                                  padding-top: 80px !important;
                                  margin-top: 0 !important;
                                }

        /* Command Deck transparent in dark mode to show canvas effects */
        [data-theme='dark'] main[data-page='CommandDeck'] {
          background-color: transparent !important;
          background-image: none !important;
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
          [data-theme='hacker'] body {
            background-color: #000 !important;
          }
          [data-theme='hacker'] .min-h-screen, [data-theme='hacker'] main {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            color: #00ff00 !important;
          }
          [data-theme='hacker'] [class*='bg-gradient-'],
          [data-theme='hacker'] [class*='from-slate-'],
          [data-theme='hacker'] [class*='via-'],
          [data-theme='hacker'] [class*='to-slate-'],
          [data-theme='hacker'] [class*='to-violet-'] {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
          }
          [data-theme='hacker'] aside, [data-theme='hacker'] header, [data-theme='hacker'] footer, [data-theme='hacker'] nav {
            background-color: rgba(0, 0, 0, 0.9) !important;
            background-image: none !important;
            color: #00ff00 !important;
          }
          [data-theme='hacker'] div, [data-theme='hacker'] section {
            background-color: transparent !important;
            background-image: none !important;
            color: #00ff00 !important;
          }
          [data-theme='hacker'] h1, [data-theme='hacker'] h2, [data-theme='hacker'] h3, [data-theme='hacker'] h4, [data-theme='hacker'] h5, [data-theme='hacker'] h6, [data-theme='hacker'] p, [data-theme='hacker'] span, [data-theme='hacker'] a, [data-theme='hacker'] li, [data-theme='hacker'] label {
            color: #00ff00 !important;
          }
          [data-theme='hacker'] [class*='bg-']:not(canvas) { background-color: transparent !important; }
          [data-theme='hacker'] .rounded-xl:not(img):not([data-no-filter="true"]),
          [data-theme='hacker'] .rounded-lg:not(img):not([data-no-filter="true"]),
          [data-theme='hacker'] .rounded-2xl:not(img):not([data-no-filter="true"]),
          [data-theme='hacker'] [class*='Card']:not(img) {
            background-color: rgba(0, 0, 0, 0.85) !important;
          }
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
            background-color: #000000 !important;
            color: #00ff00 !important;
            border: 1px solid #00ff00 !important;
            opacity: 1 !important;
          }
          [data-theme='hacker'] select option {
            background-color: #000000 !important;
            color: #00ff00 !important;
          }
          [data-theme='hacker'] input::placeholder, [data-theme='hacker'] textarea::placeholder {
            color: #006600 !important;
          }
          [data-theme='hacker'] [role="dialog"],
          [data-theme='hacker'] [data-radix-dialog-content],
          [data-theme='hacker'] [data-radix-popper-content-wrapper] > div {
            background-color: #000000 !important;
            color: #00ff00 !important;
            border-color: #00ff00 !important;
          }
          [data-theme='hacker'] [role="dialog"] > div,
          [data-theme='hacker'] [data-radix-dialog-content] > div {
            background-color: #000000 !important;
          }
          /* Dialog content wrapper - solid black */
          html[data-theme='hacker'] [role="dialog"],
          html[data-theme='hacker'] [data-radix-dialog-content] {
            background-color: #000000 !important;
            border: 1px solid #00ff00 !important;
            box-shadow: 0 0 40px rgba(0, 255, 0, 0.4) !important;
          }
          [data-theme='hacker'] svg { color: #00ff00 !important; stroke: #00ff00 !important; }
          [data-theme='hacker'] svg path, [data-theme='hacker'] svg circle, [data-theme='hacker'] svg rect, [data-theme='hacker'] svg line { stroke: #00ff00 !important; fill: none !important; }
          [data-theme='hacker'] svg[fill] path { fill: #00ff00 !important; }
          [data-theme='hacker'] ::-webkit-scrollbar { background-color: #000 !important; }
          [data-theme='hacker'] ::-webkit-scrollbar-thumb { background-color: #00ff00 !important; }
          [data-theme='hacker'] a:hover { text-shadow: 0 0 5px #00ff00 !important; }
          [data-theme='hacker'] [class*='shadow'] { box-shadow: 0 0 8px #00ff00 !important; }

          /* Remove border from gauge/control panel image in hacker mode */
          [data-theme='hacker'] img[alt="Command Deck"],
          [data-theme='dark'] img[alt="Command Deck"] {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          [data-theme='hacker'] img[alt="Command Deck"] + *,
          [data-theme='hacker'] img[alt="Command Deck"]:not([class*='border']),
          [data-theme='dark'] img[alt="Command Deck"]:not([class*='border']) {
            border: none !important;
          }

          /* Hacker theme - square edges on cards but preserve circular elements */
          html[data-theme='hacker'] .rounded-xl:not(img):not([data-keep-round]),
          html[data-theme='hacker'] .rounded-lg:not(img):not([data-keep-round]),
          html[data-theme='hacker'] .rounded-2xl:not(img):not([data-keep-round]),
          html[data-theme='hacker'] .rounded-md:not(img):not([data-keep-round]),
          html[data-theme='hacker'] .rounded-3xl:not(img):not([data-keep-round]),
          [data-theme='hacker'] .rounded-xl:not(img):not([data-keep-round]),
          [data-theme='hacker'] .rounded-lg:not(img):not([data-keep-round]),
          [data-theme='hacker'] .rounded-2xl:not(img):not([data-keep-round]),
          [data-theme='hacker'] .rounded-md:not(img):not([data-keep-round]),
          [data-theme='hacker'] .rounded-3xl:not(img):not([data-keep-round]) {
            border-radius: 0 !important;
          }
          /* Keep circular images round in hacker mode */
          [data-theme='hacker'] img.object-contain,
          [data-theme='hacker'] [data-keep-round] {
            border-radius: inherit !important;
          }

          /* Hacker theme - Force ALL buttons to be green on black, no exceptions */
          [data-theme='hacker'] [class*='bg-violet-'],
          [data-theme='hacker'] [class*='bg-purple-'],
          [data-theme='hacker'] [class*='bg-pink-'],
          [data-theme='hacker'] [class*='bg-rose-'],
          [data-theme='hacker'] [class*='bg-fuchsia-'],
          [data-theme='hacker'] [class*='bg-gradient-'] {
            background: #000 !important;
            background-color: #000 !important;
            background-image: none !important;
            border-color: #00ff00 !important;
          }
          [data-theme='hacker'] [class*='text-violet-'],
          [data-theme='hacker'] [class*='text-purple-'],
          [data-theme='hacker'] [class*='text-pink-'],
          [data-theme='hacker'] [class*='text-rose-'],
          [data-theme='hacker'] [class*='text-fuchsia-'] {
            color: #00ff00 !important;
          }
          [data-theme='hacker'] [class*='from-violet-'],
          [data-theme='hacker'] [class*='from-purple-'],
          [data-theme='hacker'] [class*='from-pink-'],
          [data-theme='hacker'] [class*='to-violet-'],
          [data-theme='hacker'] [class*='to-purple-'],
          [data-theme='hacker'] [class*='to-pink-'] {
            background: #000 !important;
            background-image: none !important;
          }
          [data-theme='hacker'] [data-avatar-card], [data-theme='hacker'] [data-avatar-card] * { background-color: #000 !important; color: #00ff00 !important; }
          [data-theme='hacker'] [data-avatar-card] [data-avatar-bg] { display: none !important; }
          [data-theme='hacker'] [data-avatar-card] [data-avatar-overlay] { background: #000 !important; backdrop-filter: none !important; }
          
          /* HERO IMAGES - NEVER FILTER for dark theme only */
          [data-theme='dark'] img.hero-image,
          [data-theme='dark'] .hero-image,
          [data-theme='dark'] img[data-no-filter="true"],
          [data-theme='dark'] img[data-no-filter],
          html[data-theme='dark'] img.hero-image,
          html[data-theme='dark'] img[data-no-filter="true"] { 
            filter: none !important; 
            -webkit-filter: none !important;
            opacity: 1 !important; 
            display: block !important;
            visibility: visible !important;
            mix-blend-mode: normal !important;
          }

          /* HACKER THEME - ALL images get green monochrome filter EXCEPT gauge images */
          [data-theme='hacker'] img:not(.gauge-image):not([data-no-filter="true"]),
          [data-theme='hacker'] img.hero-image:not(.gauge-image),
          [data-theme='hacker'] .hero-image:not(.gauge-image),
          html[data-theme='hacker'] img:not(.gauge-image):not([data-no-filter="true"]),
          html[data-theme='hacker'] img.hero-image:not(.gauge-image),
          html[data-theme='hacker'] .hero-image:not(.gauge-image) { 
            filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important; 
            -webkit-filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important;
          }

          /* Dark theme - preserve original colors for specific images */
          [data-theme='dark'] .mission-card img,
          [data-theme='dark'] .mission-image,
          [data-theme='dark'] img[data-no-filter],
          [data-theme='dark'] [data-no-filter="true"],
          [data-theme='dark'] .rank-badge-img,
          [data-theme='dark'] img[data-no-filter="true"] { 
            filter: none !important; 
          }

          /* HACKER THEME - Force green filter on ALL images including avatars, badges, everything */
          [data-theme='hacker'] .mission-card img:not(.gauge-image),
          [data-theme='hacker'] .mission-image,
          [data-theme='hacker'] .rank-badge-img,
          [data-theme='hacker'] [class*='Avatar'] img,
          [data-theme='hacker'] .avatar-image,
          [data-theme='hacker'] [data-slot='avatar'] img,
          [data-theme='hacker'] svg:not(.gauge-image *),
          [data-theme='hacker'] [data-user-id] img:not(.gauge-image):not([alt="Trust Gauge"]),
          [data-theme='hacker'] [data-avatar-card] img:not(.gauge-image):not([alt="Trust Gauge"]),
          html[data-theme='hacker'] [data-user-id] img:not(.gauge-image):not([alt="Trust Gauge"]),
          html[data-theme='hacker'] [data-avatar-card] img:not(.gauge-image):not([alt="Trust Gauge"]),
          [data-theme='hacker'] .rounded-full img:not(.gauge-image):not([alt="Trust Gauge"]) {
            filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important;
            -webkit-filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important;
          }

          /* HACKER THEME - Gauge images get green monochrome filter */
          html[data-theme='hacker'] img.gauge-image,
          html[data-theme='hacker'] .gauge-image,
          [data-theme='hacker'] img.gauge-image,
          [data-theme='hacker'] .gauge-image,
          html[data-theme='hacker'] img[alt="Trust Gauge"],
          [data-theme='hacker'] img[alt="Trust Gauge"] {
            filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important;
            -webkit-filter: grayscale(100%) brightness(0.8) sepia(100%) hue-rotate(70deg) saturate(500%) !important;
            opacity: 1 !important;
            display: block !important;
            visibility: visible !important;
            mix-blend-mode: normal !important;
          }

          /* DARK/LIGHT THEME - Gauge images preserve original colors */
          html[data-theme='dark'] img[alt="Trust Gauge"],
          [data-theme='dark'] img[alt="Trust Gauge"],
          html[data-theme='dark'] img.gauge-image,
          [data-theme='dark'] img.gauge-image,
          html[data-theme='light'] img.gauge-image,
          [data-theme='light'] img.gauge-image {
            filter: none !important;
            -webkit-filter: none !important;
            opacity: 1 !important;
            display: block !important;
            visibility: visible !important;
            mix-blend-mode: normal !important;
          }

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

        {/* Sidebar - hidden on G3Dex and GGGCrypto for full-width experience */}
        {currentPageName !== 'G3Dex' && currentPageName !== 'GGGCrypto' && (
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
        )}

      {/* Top Bar - hidden on G3Dex and GGGCrypto for full-width experience */}
      {currentPageName !== 'G3Dex' && currentPageName !== 'GGGCrypto' && (
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
          isCollapsed={topbarCollapsed}
          onToggleCollapse={() => setTopbarCollapsed(!topbarCollapsed)}
        />
      )}

      {/* Beta Ticker removed - out of beta */}

      {/* System-wide Announcement Banner */}
      <AnnouncementBanner 
        sidebarCollapsed={sidebarCollapsed} 
        topbarCollapsed={topbarCollapsed} 
      />
        <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        `}</style>

        {/* Main Content */}
        <main
          data-page={currentPageName}
          data-cmd-view={cmdViewMode || 'standard'}
          className={cn(
              "min-h-screen transition-all duration-300",
              (currentPageName === 'G3Dex' || currentPageName === 'GGGCrypto')
                ? "pl-0"
                : sidebarCollapsed ? "pl-0 md:pl-16" : "pl-0 md:pl-16 lg:pl-64",
              "pr-0",
              (currentPageName === 'G3Dex' || currentPageName === 'GGGCrypto')
                ? "pt-0"
                : (topbarCollapsed ? "pt-8" : "pt-28"),
          currentPageName === 'CommandDeck' && cmdViewMode === 'compact' ? "cmd-compact" : "",
          currentPageName === 'CommandDeck' && cmdViewMode === 'analytics' ? "cmd-analytics" : ""
        )}>
        {currentPageName === 'CommandDeck' ? 
          React.cloneElement(children, { theme, onThemeToggle: setTheme }) : 
          children
        }
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

      {/* Right Side Tabs (Help + Chat) */}
      <RightSideTabs />

      {/* Global Side Panel Nudge */}
      <GlobalSidePanelNudge />

      {/* Floating Side Panel for non-CommandDeck pages */}
      {floatingSidePanelOpen && currentPageName !== 'CommandDeck' && (
        <SidePanel
          matches={[]}
          meetings={[]}
          profile={profile}
          isOpen={true}
          onToggle={() => setFloatingSidePanelOpen(false)}
        />
      )}

      {/* Global Photo Viewer */}
      <GlobalPhotoViewer />

      {/* Hero Gallery Viewer */}
      <HeroGalleryViewer />

      {/* Global Dating Matches Popup */}
      <DatingMatchesPopup currentUser={currentUser} />

      {/* Global Alert Popup */}
      <GlobalAlertPopup />

      {/* Meeting Reminder Service */}
              {currentUser && <MeetingReminderService />}

      {/* Floating Notes Widget */}
      <FloatingNotesWidget />

              {/* Mobile Close Button - shows X on secondary pages */}
              <MobileCloseButton currentPageName={currentPageName} />

              {/* Mobile Bottom Tab Bar */}
              <MobileTabBar 
                currentPage={currentPageName}
                onWalletOpen={() => setMobileWalletOpen(true)}
                onMenuOpen={() => setMobileMenuOpen(true)}
              />

              {/* Mobile Wallet Sheet */}
              <MobileWalletSheet 
                open={mobileWalletOpen} 
                onOpenChange={setMobileWalletOpen} 
              />

              {/* Mobile Menu Sheet */}
              <MobileMenuSheet 
                open={mobileMenuOpen} 
                onOpenChange={setMobileMenuOpen} 
              />

              {/* Fullscreen Matches Swiper */}
              <FullscreenMatchesSwiper
                open={fullscreenMatchesOpen}
                onClose={() => setFullscreenMatchesOpen(false)}
              />

      {/* Interactive Onboarding Tour */}
      {userTourOpen && (
        <InteractiveOnboardingTour 
          open={userTourOpen} 
          onClose={async () => {
            setUserTourOpen(false);
            // Mark tour as dismissed in localStorage immediately to prevent re-showing
            try { localStorage.setItem('tourDismissed', '1'); } catch {}
            if (onboarding?.id) {
              await base44.entities.OnboardingProgress.update(onboarding.id, { tour_completed: true });
              queryClient.invalidateQueries({ queryKey: ['onboardingProgress'] });
            }
            const genericPages = ['Home', 'home', 'Landing', 'Welcome', 'ActivityFeed'];
            if (genericPages.includes(currentPageName)) {
              window.location.href = createPageUrl('CommandDeck');
            }
          }}
          userTrack={onboarding?.step_data?.[1]?.track}
        />
      )}
    </div>
  );
}

// Nebula canvas effect with speed/brightness/variance controls
function NebulaCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });
  
  React.useEffect(() => {
    try {
      settingsRef.current = {
        speed: parseFloat(localStorage.getItem('matrixSpeed')) || 1,
        brightness: parseFloat(localStorage.getItem('matrixBrightness')) || 0.8,
        variance: parseFloat(localStorage.getItem('matrixVariance')) || 0.5
      };
    } catch {}
    const handleSettingsChange = (e) => {
      if (e.detail) settingsRef.current = { 
        speed: e.detail.speed ?? 1, 
        brightness: e.detail.brightness ?? 0.8,
        variance: e.detail.variance ?? 0.5
      };
    };
    document.addEventListener('matrixSettingsChange', handleSettingsChange);
    return () => document.removeEventListener('matrixSettingsChange', handleSettingsChange);
  }, []);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const baseColors = ['#00ff88', '#00d4ff', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];
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
        baseSize: Math.random() * 150 + 50,
        colorIdx: Math.floor(Math.random() * baseColors.length),
        baseVx: (Math.random() - 0.5) * 0.3,
        baseVy: (Math.random() - 0.5) * 0.3,
        baseOpacity: Math.random() * 0.15 + 0.05,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        orbitPhase: Math.random() * Math.PI * 2,
        orbitRadius: Math.random() * 50 + 20
      });
    }
    
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.02 + variance * 0.02})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        // Variance affects movement patterns
        p.pulsePhase += p.pulseSpeed * speed;
        p.orbitPhase += 0.005 * speed * (1 + variance);
        
        // Base movement plus orbital motion at high variance
        const orbitX = variance > 0.3 ? Math.cos(p.orbitPhase) * p.orbitRadius * variance : 0;
        const orbitY = variance > 0.3 ? Math.sin(p.orbitPhase) * p.orbitRadius * variance : 0;
        
        p.x += p.baseVx * speed * (1 + variance * Math.sin(p.pulsePhase));
        p.y += p.baseVy * speed * (1 + variance * Math.cos(p.pulsePhase));
        
        if (p.x < -p.baseSize) p.x = canvas.width + p.baseSize;
        if (p.x > canvas.width + p.baseSize) p.x = -p.baseSize;
        if (p.y < -p.baseSize) p.y = canvas.height + p.baseSize;
        if (p.y > canvas.height + p.baseSize) p.y = -p.baseSize;
        
        // Variance affects size pulsing
        const sizePulse = 1 + Math.sin(p.pulsePhase) * variance * 0.4;
        const size = p.baseSize * sizePulse;
        
        // Variance affects opacity pulsing
        const opacityPulse = 1 + Math.sin(p.pulsePhase * 1.5) * variance * 0.5;
        const adjustedOpacity = p.baseOpacity * brightness * opacityPulse;
        
        // Color cycling at high variance
        let color = baseColors[p.colorIdx];
        if (variance > 0.5) {
          const cycleIdx = Math.floor((p.colorIdx + Date.now() * 0.0001 * variance) % baseColors.length);
          color = baseColors[cycleIdx];
        }
        
        const drawX = p.x + orbitX;
        const drawY = p.y + orbitY;
        
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, size);
        gradient.addColorStop(0, color + Math.floor(Math.min(1, adjustedOpacity) * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5 + variance * 0.3, color + Math.floor(adjustedOpacity * 0.3 * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
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
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.8, zIndex: -1 }}
    />
  );
}

// Matrix Rain Canvas - authentic green falling characters with speed/brightness/variance controls
function MatrixRainCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });
  
  // Load initial settings from localStorage
  React.useEffect(() => {
    try {
      const savedSpeed = parseFloat(localStorage.getItem('matrixSpeed')) || 1;
      const savedBrightness = parseFloat(localStorage.getItem('matrixBrightness')) || 0.8;
      const savedVariance = parseFloat(localStorage.getItem('matrixVariance')) || 0.5;
      settingsRef.current = { speed: savedSpeed, brightness: savedBrightness, variance: savedVariance };
    } catch {}
    
    // Listen for settings changes
    const handleSettingsChange = (e) => {
      if (e.detail) {
        settingsRef.current = { 
          speed: e.detail.speed ?? settingsRef.current.speed, 
          brightness: e.detail.brightness ?? settingsRef.current.brightness,
          variance: e.detail.variance ?? settingsRef.current.variance
        };
      }
    };
    document.addEventListener('matrixSettingsChange', handleSettingsChange);
    return () => document.removeEventListener('matrixSettingsChange', handleSettingsChange);
  }, []);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Matrix characters (katakana + numbers + symbols)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
    const charArray = chars.split('');
    
    // Variance affects font size range
    const baseFontSize = 14;
    const columns = Math.floor(canvas.width / baseFontSize);
    
    // Array to track y position of each column
    const drops = Array(columns).fill(1);
    
    // Column properties that vary based on variance setting
    const columnProps = Array(columns).fill(0).map(() => ({
      baseSpeed: Math.random() * 0.2 + 0.15,
      fontSize: baseFontSize,
      hueShift: 0, // For color variance
      trailLength: 15
    }));
    
    const draw = () => {
      const { speed, brightness, variance } = settingsRef.current;
      
      // Update column properties based on variance
      columnProps.forEach((prop, i) => {
        prop.fontSize = baseFontSize + (Math.sin(Date.now() * 0.001 + i) * variance * 6);
        prop.hueShift = variance * 30 * Math.sin(Date.now() * 0.0005 + i * 0.5); // -30 to +30 hue shift
        prop.trailLength = Math.floor(10 + variance * 20 + Math.sin(Date.now() * 0.002 + i) * variance * 10);
      });
      
      // Semi-transparent black to create fade trail effect - variance affects fade speed
      ctx.fillStyle = `rgba(0, 0, 0, ${0.03 + (1 - variance) * 0.04})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < drops.length; i++) {
        const prop = columnProps[i];
        ctx.font = `${Math.floor(prop.fontSize)}px monospace`;
        
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        
        const x = i * baseFontSize;
        const y = drops[i] * baseFontSize;
        
        // Color with optional hue shift based on variance
        const greenVal = Math.floor(255 * brightness);
        const redVal = Math.floor(Math.max(0, prop.hueShift) * brightness);
        const blueVal = Math.floor(Math.max(0, -prop.hueShift + 50 * variance) * brightness);
        
        ctx.fillStyle = `rgb(${redVal}, ${greenVal}, ${blueVal})`;
        ctx.shadowColor = `rgb(${redVal}, ${greenVal}, ${blueVal})`;
        ctx.shadowBlur = (10 + variance * 10) * brightness;
        ctx.fillText(char, x, y);
        
        // Dimmer trail characters
        ctx.shadowBlur = 0;
        for (let j = 1; j < prop.trailLength; j++) {
          const trailY = y - (j * baseFontSize);
          if (trailY > 0) {
            const opacity = (1 - (j / prop.trailLength)) * brightness;
            ctx.fillStyle = `rgba(${redVal}, ${greenVal}, ${blueVal}, ${opacity * 0.5})`;
            const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(trailChar, x, trailY);
          }
        }
        
        // Reset drop to top when it reaches bottom (variance affects reset randomness)
        const resetThreshold = 0.97 - variance * 0.03;
        if (y > canvas.height && Math.random() > resetThreshold) {
          drops[i] = 0;
        }
        
        // Apply speed multiplier with variance-based variation
        const speedVariation = 1 + (Math.sin(Date.now() * 0.003 + i * 2) * variance * 0.5);
        drops[i] += prop.baseSpeed * speed * speedVariation;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.9, zIndex: -1 }}
    />
  );
}

// Circuit board effect with speed/brightness/variance controls
function CircuitCanvas() {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });
  const gridDataRef = React.useRef(null);
  
  React.useEffect(() => {
    try {
      settingsRef.current = {
        speed: parseFloat(localStorage.getItem('matrixSpeed')) || 1,
        brightness: parseFloat(localStorage.getItem('matrixBrightness')) || 0.8,
        variance: parseFloat(localStorage.getItem('matrixVariance')) || 0.5
      };
    } catch {}
    const handleSettingsChange = (e) => {
      if (e.detail) {
        const newVariance = e.detail.variance ?? settingsRef.current.variance;
        const oldVariance = settingsRef.current.variance;
        settingsRef.current = { 
          speed: e.detail.speed ?? 1, 
          brightness: e.detail.brightness ?? 0.8,
          variance: newVariance
        };
        // Regenerate grid when variance changes significantly
        if (Math.abs(newVariance - oldVariance) > 0.05 && gridDataRef.current) {
          gridDataRef.current.needsRegen = true;
        }
      }
    };
    document.addEventListener('matrixSettingsChange', handleSettingsChange);
    return () => document.removeEventListener('matrixSettingsChange', handleSettingsChange);
  }, []);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (gridDataRef.current) gridDataRef.current.needsRegen = true;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const generateGrid = (variance) => {
      const nodes = [];
      const traces = [];
      const gridLines = [];
      
      // Variance affects grid spacing and density
      const baseSpacing = 80;
      const gridSpacing = baseSpacing - (variance * 40); // 80 down to 40 at max variance
      const cols = Math.ceil(canvas.width / gridSpacing) + 1;
      const rows = Math.ceil(canvas.height / gridSpacing) + 1;
      
      // Grid intersection nodes with variance-based offset
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSpacing;
          const y = row * gridSpacing;
          // Variance increases node position randomness
          const offsetX = (Math.random() - 0.5) * (10 + variance * 30);
          const offsetY = (Math.random() - 0.5) * (10 + variance * 30);
          nodes.push({
            x: x + offsetX,
            y: y + offsetY,
            baseX: x,
            baseY: y,
            gridX: col,
            gridY: row,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * variance * 0.03,
            size: Math.random() * (2 + variance * 3) + 2,
            isJunction: Math.random() > (0.8 - variance * 0.3) // More junctions at higher variance
          });
        }
      }
      
      // Create grid lines (horizontal and vertical)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const idx = row * cols + col;
          if (Math.random() > variance * 0.3) { // Skip some lines at high variance
            gridLines.push({ from: idx, to: idx + 1, type: 'horizontal' });
          }
        }
      }
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          if (Math.random() > variance * 0.3) {
            gridLines.push({ from: idx, to: idx + cols, type: 'vertical' });
          }
        }
      }
      
      // Add diagonal connections - more at higher variance
      const diagThreshold = 0.7 - variance * 0.5; // More diagonals at high variance
      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const idx = row * cols + col;
          if (Math.random() > diagThreshold) {
            gridLines.push({ from: idx, to: idx + cols + 1, type: 'diagonal' });
          }
          if (Math.random() > diagThreshold) {
            gridLines.push({ from: idx + 1, to: idx + cols, type: 'diagonal' });
          }
        }
      }
      
      // Cross-grid connections at high variance (skip 1-2 nodes)
      if (variance > 0.4) {
        for (let row = 0; row < rows - 2; row++) {
          for (let col = 0; col < cols - 2; col++) {
            const idx = row * cols + col;
            if (Math.random() > (1 - variance * 0.5)) {
              gridLines.push({ from: idx, to: idx + cols * 2 + 2, type: 'long_diagonal' });
            }
            if (Math.random() > (1 - variance * 0.5)) {
              gridLines.push({ from: idx + 2, to: idx + cols * 2, type: 'long_diagonal' });
            }
          }
        }
      }
      
      // Create animated traces - more at higher variance
      const traceThreshold = 0.9 - variance * 0.4;
      gridLines.forEach((line, i) => {
        if (Math.random() > traceThreshold) {
          traces.push({ 
            lineIdx: i, 
            progress: 0, 
            active: false, 
            delay: Math.random() * 200,
            speed: (Math.random() * 0.02 + 0.01) * (1 + variance)
          });
        }
      });
      
      return { nodes, traces, gridLines, cols, needsRegen: false };
    };
    
    gridDataRef.current = generateGrid(settingsRef.current.variance);
    
    let frame = 0;
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      
      // Regenerate grid if variance changed
      if (gridDataRef.current.needsRegen) {
        gridDataRef.current = generateGrid(variance);
      }
      
      const { nodes, traces, gridLines } = gridDataRef.current;
      
      frame++;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.03 + variance * 0.02})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const greenVal = Math.floor(255 * brightness);
      const tealVal = Math.floor(200 * brightness);
      
      // Draw grid lines
      gridLines.forEach((line, idx) => {
        const from = nodes[line.from];
        const to = nodes[line.to];
        if (!from || !to) return;
        
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        const lineOpacity = line.type === 'horizontal' || line.type === 'vertical' ? 0.12 : 0.06;
        ctx.strokeStyle = `rgba(0, ${greenVal}, 136, ${lineOpacity * brightness})`;
        ctx.lineWidth = line.type === 'long_diagonal' ? 0.3 : (line.type === 'diagonal' ? 0.5 : 1);
        ctx.stroke();
      });
      
      // Animate pulses along traces
      traces.forEach(trace => {
        const line = gridLines[trace.lineIdx];
        if (!line) return;
        const from = nodes[line.from];
        const to = nodes[line.to];
        if (!from || !to) return;
        
        const triggerFrame = Math.floor((80 - variance * 40) / speed);
        if (frame % Math.max(1, triggerFrame) === Math.floor(trace.delay / speed) % Math.max(1, triggerFrame)) {
          trace.active = true;
          trace.progress = 0;
        }
        
        if (trace.active) {
          trace.progress += trace.speed * speed;
          if (trace.progress >= 1) {
            trace.active = false;
            // Chain reaction - more likely at higher variance
            const endNode = line.to;
            traces.forEach(t => {
              const tLine = gridLines[t.lineIdx];
              if (tLine && (tLine.from === endNode || tLine.to === endNode) && Math.random() > (0.8 - variance * 0.3)) {
                t.active = true;
                t.progress = 0;
              }
            });
          }
          
          const px = from.x + (to.x - from.x) * trace.progress;
          const py = from.y + (to.y - from.y) * trace.progress;
          
          // Glowing pulse - larger at high variance
          ctx.beginPath();
          ctx.arc(px, py, 3 + variance * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(0, ${greenVal}, 136)`;
          ctx.shadowColor = `rgb(0, ${greenVal}, 136)`;
          ctx.shadowBlur = (15 + variance * 10) * brightness;
          ctx.fill();
          
          // Trail effect - longer at high variance
          const trailLen = Math.floor(5 + variance * 5);
          for (let t = 1; t <= trailLen; t++) {
            const trailProgress = trace.progress - t * 0.04;
            if (trailProgress > 0) {
              const tx = from.x + (to.x - from.x) * trailProgress;
              const ty = from.y + (to.y - from.y) * trailProgress;
              ctx.beginPath();
              ctx.arc(tx, ty, 1.5 + variance, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, ${tealVal}, 255, ${(1 - t/trailLen) * 0.5 * brightness})`;
              ctx.fill();
            }
          }
          ctx.shadowBlur = 0;
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        node.pulse += node.pulseSpeed * speed;
        const baseBrightness = node.isJunction ? 0.7 : 0.4;
        const glow = (baseBrightness + Math.sin(node.pulse) * (0.2 + variance * 0.2)) * brightness;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.isJunction ? node.size * 1.5 : node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, ${greenVal}, 136, ${glow})`;
        if (node.isJunction) {
          ctx.shadowColor = `rgb(0, ${greenVal}, 136)`;
          ctx.shadowBlur = (6 + variance * 6) * brightness;
        }
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
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.7, zIndex: -1 }}
    />
  );
}

// Main Layout component - check public pages BEFORE any hooks
// Starfield canvas component for cosmic background effect
function StarfieldCanvas({ rankCode = 'seeker' }) {
  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const settingsRef = React.useRef({ speed: 1, brightness: 0.8, variance: 0.5 });
  
  React.useEffect(() => {
    try {
      settingsRef.current = {
        speed: parseFloat(localStorage.getItem('matrixSpeed')) || 1,
        brightness: parseFloat(localStorage.getItem('matrixBrightness')) || 0.8,
        variance: parseFloat(localStorage.getItem('matrixVariance')) || 0.5
      };
    } catch {}
    const handleSettingsChange = (e) => {
      if (e.detail) settingsRef.current = { 
        speed: e.detail.speed ?? 1, 
        brightness: e.detail.brightness ?? 0.8,
        variance: e.detail.variance ?? 0.5
      };
    };
    document.addEventListener('matrixSettingsChange', handleSettingsChange);
    return () => document.removeEventListener('matrixSettingsChange', handleSettingsChange);
  }, []);
  
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
        baseSize: Math.random() * 2 + 0.5,
        colorIdx: Math.floor(Math.random() * colors.length),
        twinkle: Math.random() * Math.PI * 2,
        baseTwinkleSpeed: Math.random() * 0.02 + 0.01,
        // Variance-affected properties
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.01 + 0.005,
        wobbleAmplitude: Math.random() * 20 + 10
      });
    }
    
    const animate = () => {
      const { speed, brightness, variance } = settingsRef.current;
      ctx.fillStyle = `rgba(5, 5, 5, ${0.08 + variance * 0.04})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach((star, i) => {
        // Variance affects twinkle speed variation
        const twinkleSpeed = star.baseTwinkleSpeed * (1 + variance * Math.sin(Date.now() * 0.001 + i));
        star.twinkle += twinkleSpeed * speed;
        star.wobblePhase += star.wobbleSpeed * speed;
        
        // Parallax movement with speed multiplier
        star.x -= star.z * 0.15 * speed;
        
        // Variance adds vertical wobble
        const wobbleY = variance > 0.3 ? Math.sin(star.wobblePhase) * star.wobbleAmplitude * variance : 0;
        
        // Wrap around
        if (star.x < 0) {
          star.x = canvas.width;
          star.y = Math.random() * canvas.height;
        }
        
        // Variance affects size variation
        const sizeVariation = 1 + Math.sin(star.twinkle * 2) * variance * 0.5;
        const size = star.baseSize * sizeVariation;
        
        // Twinkle effect with brightness and variance
        const twinkleIntensity = 0.4 + variance * 0.3;
        const alpha = (0.5 + Math.sin(star.twinkle) * twinkleIntensity) * brightness;
        const glowSize = size * (1 + Math.sin(star.twinkle) * (0.3 + variance * 0.4));
        
        // Color cycling at high variance
        let color = colors[star.colorIdx];
        if (variance > 0.6) {
          const cycleIdx = Math.floor((star.colorIdx + star.twinkle * 0.1) % colors.length);
          color = colors[cycleIdx];
        }
        
        const drawY = star.y + wobbleY;
        
        // Draw glow - larger at high variance
        const glowMultiplier = 3 + variance * 2;
        const gradient = ctx.createRadialGradient(star.x, drawY, 0, star.x, drawY, glowSize * glowMultiplier);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.3 + variance * 0.2, color + '60');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(star.x, drawY, glowSize * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * (0.3 + variance * 0.2);
        ctx.fill();
        
        // Draw star core
        ctx.beginPath();
        ctx.arc(star.x, drawY, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
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
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.7, zIndex: -1 }}
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