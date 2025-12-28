import React from 'react';
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  BadgeCheck,
  Lock,
  Diamond,
  Handshake,
  Globe,
  HeartPulse,
  Sprout,
  Star,
  Heart,
  Sparkles,
  Flame,
  Trophy,
  Coins,
  Shield,
  Flag,
  Building2
} from 'lucide-react';

const ICONS = {
  shieldCheck: ShieldCheck,
  badgeCheck: BadgeCheck,
  lock: Lock,
  diamond: Diamond,
  handshake: Handshake,
  globe: Globe,
  heartPulse: HeartPulse,
  sprout: Sprout,
  star: Star,
  heart: Heart,
  sparkles: Sparkles,
  flame: Flame,
  trophy: Trophy,
  coins: Coins,
  shield: Shield,
  flag: Flag,
  building: Building2
};

const COLORS = {
  identity: { bg: 'bg-amber-50', border: 'border-amber-200', fg: 'text-amber-600' },
  marketplace: { bg: 'bg-emerald-50', border: 'border-emerald-200', fg: 'text-emerald-600' },
  mission: { bg: 'bg-blue-50', border: 'border-blue-200', fg: 'text-blue-600' },
  alignment: { bg: 'bg-violet-50', border: 'border-violet-200', fg: 'text-violet-600' },
  default: { bg: 'bg-slate-50', border: 'border-slate-200', fg: 'text-slate-600' }
};

export default function BadgeIcon({ iconKey = 'star', section = 'default', size = 16, className }) {
  const Icon = ICONS[iconKey] || Star;
  const theme = COLORS[section] || COLORS.default;
  const box = size + 8;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border',
        theme.bg,
        theme.border,
        'shrink-0',
        className
      )}
      style={{ width: box, height: box }}
    >
      <Icon className={cn(theme.fg)} style={{ width: size, height: size }} />
    </span>
  );
}