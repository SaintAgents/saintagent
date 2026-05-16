import React, { useEffect, useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Award, Trophy, Target, Sparkles } from 'lucide-react';

const ICONS = {
  ggg: Coins,
  badge: Award,
  mission: Target,
  rank: Trophy,
  default: Sparkles,
};

const COLORS = {
  ggg: { bg: 'from-amber-500 to-yellow-500', glow: 'shadow-amber-500/40', icon: 'text-amber-100', text: 'text-amber-50' },
  badge: { bg: 'from-violet-600 to-purple-600', glow: 'shadow-violet-500/40', icon: 'text-violet-100', text: 'text-violet-50' },
  mission: { bg: 'from-emerald-600 to-teal-600', glow: 'shadow-emerald-500/40', icon: 'text-emerald-100', text: 'text-emerald-50' },
  rank: { bg: 'from-rose-600 to-pink-600', glow: 'shadow-rose-500/40', icon: 'text-rose-100', text: 'text-rose-50' },
  default: { bg: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-500/40', icon: 'text-blue-100', text: 'text-blue-50' },
};

const POSITION_CLASSES = {
  'top-right': 'top-20 right-4 items-end',
  'top-left': 'top-20 left-4 items-start',
  'top-center': 'top-20 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-20 right-4 items-end',
  'bottom-left': 'bottom-20 left-4 items-start',
  'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2 items-center',
};

const SLIDE_DIR = {
  'top-right': { in: { x: 400 }, out: { x: 400 } },
  'top-left': { in: { x: -400 }, out: { x: -400 } },
  'top-center': { in: { y: -100 }, out: { y: -100 } },
  'bottom-right': { in: { x: 400 }, out: { x: 400 } },
  'bottom-left': { in: { x: -400 }, out: { x: -400 } },
  'bottom-center': { in: { y: 100 }, out: { y: 100 } },
};

function AchievementToast({ toast, onRemove, duration }) {
  const colorSet = COLORS[toast.type] || COLORS.default;
  const Icon = ICONS[toast.type] || ICONS.default;
  const pos = toast._position || 'top-right';
  const slide = SLIDE_DIR[pos] || SLIDE_DIR['top-right'];

  useEffect(() => {
    const timer = setTimeout(onRemove, duration);
    return () => clearTimeout(timer);
  }, [onRemove, duration]);

  return (
    <motion.div
      layout
      initial={{ ...slide.in, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      exit={{ ...slide.out, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${colorSet.bg} shadow-2xl ${colorSet.glow} cursor-pointer`}
      onClick={onRemove}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
      />

      <div className="relative flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-[380px]">
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.15 }}
          className={`p-2 rounded-lg bg-white/20 ${colorSet.icon}`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-bold text-white truncate"
          >
            {toast.title}
          </motion.p>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-xs ${colorSet.text} truncate`}
          >
            {toast.message}
          </motion.p>
        </div>
        {toast.amount && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 8, stiffness: 200, delay: 0.3 }}
            className="text-right"
          >
            <span className="text-lg font-black text-white">+{toast.amount}</span>
            <p className="text-[10px] text-white/80 font-medium">GGG</p>
          </motion.div>
        )}
      </div>

      {/* Countdown bar */}
      <motion.div
        className="h-0.5 bg-white/40"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export default function LiveAchievementToasts() {
  const [toasts, setToasts] = useState([]);
  const toastQueue = useRef([]);
  const lastToastTime = useRef(0);
  const processTimer = useRef(null);
  const currentUserRef = useRef(null);
  const configRef = useRef(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 600000,
  });

  // Fetch live toast config from PlatformSetting
  const { data: settings = [] } = useQuery({
    queryKey: ['liveToastConfig'],
    queryFn: () => base44.entities.PlatformSetting.list('-updated_date', 1),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const config = settings?.[0];

  useEffect(() => {
    currentUserRef.current = currentUser?.email;
  }, [currentUser?.email]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const getConfig = useCallback(() => {
    const c = configRef.current;
    return {
      enabled: c?.live_toasts_enabled ?? true,
      showGGG: c?.live_toasts_show_ggg ?? true,
      showBadges: c?.live_toasts_show_badges ?? true,
      showMissions: c?.live_toasts_show_missions ?? true,
      duration: c?.live_toasts_duration_ms ?? 6000,
      cooldown: c?.live_toasts_cooldown_ms ?? 3000,
      maxVisible: c?.live_toasts_max_visible ?? 3,
      position: c?.live_toasts_position ?? 'top-right',
      includeSelf: c?.live_toasts_include_self ?? false,
      minGGG: c?.live_toasts_min_ggg ?? 0,
    };
  }, []);

  const processQueue = useCallback(() => {
    if (toastQueue.current.length === 0) return;
    const cfg = getConfig();
    const now = Date.now();
    const elapsed = now - lastToastTime.current;

    if (elapsed >= cfg.cooldown) {
      const next = toastQueue.current.shift();
      if (next) {
        lastToastTime.current = now;
        next._position = cfg.position;
        setToasts(prev => [...prev, next].slice(-cfg.maxVisible));
      }
    }

    if (toastQueue.current.length > 0) {
      clearTimeout(processTimer.current);
      processTimer.current = setTimeout(processQueue, cfg.cooldown - elapsed + 100);
    }
  }, [getConfig]);

  const enqueueToast = useCallback((t) => {
    const cfg = getConfig();
    if (!cfg.enabled) return;

    toastQueue.current.push({ ...t, id: Date.now() + Math.random() });
    if (toastQueue.current.length > 10) toastQueue.current = toastQueue.current.slice(-10);
    processQueue();
  }, [getConfig, processQueue]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Listen for test toasts from admin panel
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) enqueueToast(e.detail);
    };
    window.addEventListener('testLiveToast', handler);
    return () => window.removeEventListener('testLiveToast', handler);
  }, [enqueueToast]);

  // Subscribe to GGG transactions
  useEffect(() => {
    const unsub = base44.entities.GGGTransaction.subscribe((event) => {
      if (event.type !== 'create') return;
      const cfg = getConfig();
      if (!cfg.enabled || !cfg.showGGG) return;
      const tx = event.data;
      if (!tx || (tx.delta || 0) <= 0) return;
      if (tx.delta < cfg.minGGG) return;
      if (!cfg.includeSelf && tx.user_id === currentUserRef.current) return;

      base44.entities.UserProfile.filter({ user_id: tx.user_id }, '-updated_date', 1)
        .then(profiles => {
          const p = profiles?.[0];
          const name = p?.display_name || p?.handle || 'A SaintAgent';
          const saNum = p?.sa_number ? `SA${p.sa_number}` : '';
          const label = saNum ? `${name} ${saNum}` : name;
          enqueueToast({
            type: 'ggg',
            title: `${label} just earned GGG!`,
            message: tx.description || tx.reason_code || 'Earning rewards',
            amount: Math.round(tx.delta),
          });
        }).catch(() => {});
    });
    return unsub;
  }, [enqueueToast, getConfig]);

  // Subscribe to badges
  useEffect(() => {
    const unsub = base44.entities.Badge.subscribe((event) => {
      if (event.type !== 'create') return;
      const cfg = getConfig();
      if (!cfg.enabled || !cfg.showBadges) return;
      const badge = event.data;
      if (!badge) return;
      if (!cfg.includeSelf && badge.user_id === currentUserRef.current) return;

      base44.entities.UserProfile.filter({ user_id: badge.user_id }, '-updated_date', 1)
        .then(profiles => {
          const p = profiles?.[0];
          const name = p?.display_name || p?.handle || 'A SaintAgent';
          const saNum = p?.sa_number ? `SA${p.sa_number}` : '';
          const label = saNum ? `${name} ${saNum}` : name;
          enqueueToast({
            type: 'badge',
            title: `${label} earned a badge!`,
            message: badge.badge_name || badge.badge_code || 'New achievement unlocked',
          });
        }).catch(() => {});
    });
    return unsub;
  }, [enqueueToast, getConfig]);

  // Subscribe to missions
  useEffect(() => {
    const unsub = base44.entities.Mission.subscribe((event) => {
      if (event.type !== 'update') return;
      const cfg = getConfig();
      if (!cfg.enabled || !cfg.showMissions) return;
      const mission = event.data;
      if (!mission || mission.status !== 'completed') return;

      enqueueToast({
        type: 'mission',
        title: 'Mission Completed!',
        message: mission.title || 'A mission was just completed',
      });
    });
    return unsub;
  }, [enqueueToast, getConfig]);

  const cfg = getConfig();
  const posClass = POSITION_CLASSES[cfg.position] || POSITION_CLASSES['top-right'];

  return (
    <div className={`fixed z-[9998] flex flex-col gap-3 pointer-events-none ${posClass}`}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <AchievementToast
              toast={t}
              duration={cfg.duration}
              onRemove={() => removeToast(t.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}