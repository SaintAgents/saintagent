import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PointsDisplay({ 
  points = 0, 
  level = 1, 
  showAnimation = false,
  size = 'default',
  className 
}) {
  const levelProgress = (points % 1000) / 10; // 1000 points per level
  const nextLevel = level + 1;
  const pointsToNext = 1000 - (points % 1000);

  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200"
        )}>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className={cn("font-bold text-amber-700", sizeClasses[size])}>
            {points.toLocaleString()}
          </span>
          <AnimatePresence>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, y: -40 }}
                className="absolute -top-2 right-0 text-emerald-500 font-bold text-sm"
              >
                +10
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 border border-violet-200">
          <Zap className="w-4 h-4 text-violet-500" />
          <span className={cn("font-bold text-violet-700", sizeClasses[size])}>
            Lvl {level}
          </span>
        </div>
      </div>

      {size !== 'sm' && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Level {level}</span>
            <span>{pointsToNext} pts to Lvl {nextLevel}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}