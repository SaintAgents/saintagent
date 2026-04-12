import React from 'react';
import { cn } from '@/lib/utils';
import { BADGE_SECTIONS, QUEST_BADGE_IMAGES } from '@/components/badges/badgesData';
import { Shield, Star, Sparkles, Flame, Heart, Lock, Trophy, Globe, Coins, Target, Users, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const ICON_MAP = {
  shieldCheck: Shield, shield: Shield, badgeCheck: Check, lock: Lock,
  diamond: Sparkles, flame: Flame, building: Globe, coins: Coins,
  trophy: Trophy, flag: Target, handshake: Users, globe: Globe,
  heartPulse: Heart, sprout: Sparkles, star: Star, heart: Heart,
  sparkles: Sparkles, target: Target, users: Users, clipboard: Shield,
};

export default function BadgeShowcase({ earnedBadges = [] }) {
  const earnedCodes = new Set(earnedBadges.map(b => b.code || b.name?.toLowerCase().replace(/\s+/g, '_')));
  const totalBadges = BADGE_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const earnedCount = earnedBadges.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Badge Collection</p>
          <p className="text-xs text-slate-500">{earnedCount} of {totalBadges} badges earned</p>
        </div>
        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
            style={{ width: `${totalBadges > 0 ? (earnedCount / totalBadges) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Badge sections */}
      <TooltipProvider>
        <div className="space-y-4">
          {BADGE_SECTIONS.map(section => (
            <div key={section.id}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{section.title}</p>
              <div className="flex flex-wrap gap-2">
                {section.items.map(badge => {
                  const isEarned = earnedCodes.has(badge.code);
                  const Icon = ICON_MAP[badge.iconKey] || Star;
                  const imgUrl = QUEST_BADGE_IMAGES[badge.code];

                  return (
                    <Tooltip key={badge.code}>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center border-2 cursor-pointer relative transition-all",
                            isEarned
                              ? "bg-amber-50 border-amber-300 shadow-sm"
                              : "bg-slate-50 border-slate-200 opacity-40 grayscale"
                          )}
                        >
                          {imgUrl ? (
                            <img src={imgUrl} alt={badge.label} className="w-8 h-8 object-contain" />
                          ) : (
                            <Icon className={cn("w-5 h-5", isEarned ? "text-amber-600" : "text-slate-400")} />
                          )}
                          {!isEarned && <Lock className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-slate-400" />}
                          {isEarned && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-semibold text-sm">{badge.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{badge.definition}</p>
                        {isEarned ? (
                          <Badge className="mt-1 bg-emerald-100 text-emerald-700 text-[10px]">Earned</Badge>
                        ) : (
                          <Badge className="mt-1 bg-slate-100 text-slate-500 text-[10px]">Locked</Badge>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}