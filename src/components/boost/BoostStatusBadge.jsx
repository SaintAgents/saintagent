import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown, Rocket, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const LEVEL_CONFIG = {
  standard: { icon: Zap, color: 'bg-blue-500', label: 'Boosted' },
  priority: { icon: Star, color: 'bg-amber-500', label: 'Priority' },
  spotlight: { icon: Crown, color: 'bg-violet-500', label: 'Spotlight' },
  superboost: { icon: Rocket, color: 'bg-rose-500', label: 'Super Boost' }
};

export default function BoostStatusBadge({ userId, showLabel = true, size = 'sm' }) {
  const { data: boosts = [] } = useQuery({
    queryKey: ['activeBoost', userId],
    queryFn: () => base44.entities.Boost.filter({ 
      user_id: userId, 
      status: 'active',
      boost_type: 'profile'
    }),
    enabled: !!userId,
    staleTime: 30000
  });

  const activeBoost = boosts.find(b => new Date(b.end_time) > new Date());
  if (!activeBoost) return null;

  const config = LEVEL_CONFIG[activeBoost.visibility_level] || LEVEL_CONFIG.standard;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'h-5 text-[10px] px-1.5' : 'h-6 text-xs px-2';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex"
    >
      <Badge className={cn(
        sizeClasses,
        config.color,
        "text-white font-medium gap-1 shadow-lg",
        activeBoost.visibility_level === 'superboost' && "animate-pulse"
      )}>
        <Icon className={iconSize} />
        {showLabel && config.label}
      </Badge>
    </motion.div>
  );
}