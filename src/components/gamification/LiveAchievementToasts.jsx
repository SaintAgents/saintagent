import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Award, Trophy, Target, Sparkles, Zap, Star } from 'lucide-react';

const TOAST_DURATION = 6000;
const MAX_TOASTS = 3;
const COOLDOWN_MS = 3000; // minimum gap between toasts

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

function AchievementToast({ toast, onRemove }) {
  const colorSet = COLORS[toast.type] || COLORS.default;
  const Icon = ICONS[toast.type] || ICONS.default;

  useEffect(() => {
    const timer = setTimeout(onRemove, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${colorSet.bg} shadow-2xl ${colorSet.glow} cursor-pointer`}
      onClick={onRemove}
    >
      {/* Shimmer effect */}
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
            <span className="text-lg font-black text-white">
              +{toast.amount}
            </span>
            <p className="text-[10px] text-white/80 font-medium">GGG</p>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <motion.div
        className="h-0.5 bg-white/40"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
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

  // Get current user to exclude self-events
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 600000,
  });

  useEffect(() => {
    currentUserRef.current = currentUser?.email;
  }, [currentUser?.email]);

  // Process queue with cooldown
  const processQueue = () => {
    if (toastQueue.current.length === 0) return;
    const now = Date.now();
    const elapsed = now - lastToastTime.current;

    if (elapsed >= COOLDOWN_MS) {
      const next = toastQueue.current.shift();
      if (next) {
        lastToastTime.current = now;
        setToasts(prev => {
          const updated = [...prev, next];
          return updated.slice(-MAX_TOASTS);
        });
      }
    }

    if (toastQueue.current.length > 0) {
      clearTimeout(processTimer.current);
      processTimer.current = setTimeout(processQueue, COOLDOWN_MS - elapsed + 100);
    }
  };

  const enqueueToast = (toast) => {
    toastQueue.current.push({ ...toast, id: Date.now() + Math.random() });
    // Keep queue reasonable
    if (toastQueue.current.length > 10) toastQueue.current = toastQueue.current.slice(-10);
    processQueue();
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Subscribe to GGG transactions
  useEffect(() => {
    const unsubGGG = base44.entities.GGGTransaction.subscribe((event) => {
      if (event.type !== 'create') return;
      const tx = event.data;
      if (!tx || (tx.delta || 0) <= 0) return;
      // Don't show for current user's own earnings (they see it in their wallet)
      if (tx.user_id === currentUserRef.current) return;

      // Look up profile info asynchronously
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
        })
        .catch(() => {});
    });

    return unsubGGG;
  }, []);

  // Subscribe to badges earned
  useEffect(() => {
    const unsubBadge = base44.entities.Badge.subscribe((event) => {
      if (event.type !== 'create') return;
      const badge = event.data;
      if (!badge) return;
      if (badge.user_id === currentUserRef.current) return;

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
        })
        .catch(() => {});
    });

    return unsubBadge;
  }, []);

  // Subscribe to mission completions
  useEffect(() => {
    const unsubMission = base44.entities.Mission.subscribe((event) => {
      if (event.type !== 'update') return;
      const mission = event.data;
      if (!mission || mission.status !== 'completed') return;

      enqueueToast({
        type: 'mission',
        title: 'Mission Completed!',
        message: mission.title || 'A mission was just completed',
      });
    });

    return unsubMission;
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[9998] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <AchievementToast
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}