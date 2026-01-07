import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Award, ChevronDown, Lock, Star, Shield, Zap, Heart, Target, Crown, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

// Badge definitions with icons and colors
const BADGE_DEFINITIONS = {
  first_meeting: { name: 'First Meeting', icon: Heart, color: 'from-rose-500 to-pink-400', rarity: 'common' },
  audit_expert: { name: 'Audit Expert', icon: Shield, color: 'from-blue-500 to-cyan-400', rarity: 'uncommon' },
  seven_day_streak: { name: '7-Day Streak', icon: Flame, color: 'from-orange-500 to-amber-400', rarity: 'uncommon' },
  top_mentor: { name: 'Top Mentor', icon: Star, color: 'from-violet-500 to-purple-400', rarity: 'rare' },
  ascended_tier: { name: 'Ascended Tier', icon: Crown, color: 'from-amber-400 to-yellow-300', rarity: 'epic' },
  social_butterfly: { name: 'Social Butterfly', icon: Heart, color: 'from-pink-500 to-rose-400', rarity: 'uncommon' },
  mission_master: { name: 'Mission Master', icon: Target, color: 'from-emerald-500 to-green-400', rarity: 'rare' },
  synchronicity_weaver: { name: 'Synchronicity Weaver', icon: Zap, color: 'from-violet-600 to-indigo-400', rarity: 'legendary' },
  eternal_flame: { name: 'Eternal Flame', icon: Flame, color: 'from-amber-500 to-orange-400', rarity: 'common' },
  trust_anchor: { name: 'Trust Anchor', icon: Shield, color: 'from-teal-500 to-cyan-400', rarity: 'rare' },
};

const RARITY_GLOW = {
  common: 'shadow-slate-400/30',
  uncommon: 'shadow-emerald-400/40',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-violet-400/60',
  legendary: 'shadow-amber-400/70',
};

function BadgeIcon({ badge, size = 'md', locked = false }) {
  const def = BADGE_DEFINITIONS[badge?.badge_code] || BADGE_DEFINITIONS[badge?.code] || {
    name: badge?.badge_name || 'Badge',
    icon: Award,
    color: 'from-slate-500 to-slate-400',
    rarity: 'common'
  };
  const Icon = def.icon;
  const sizeClasses = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <motion.div
      whileHover={{ scale: locked ? 1 : 1.1 }}
      className={`relative ${sizeClasses} rounded-full bg-gradient-to-br ${def.color} flex items-center justify-center shadow-lg ${RARITY_GLOW[def.rarity]} ${locked ? 'opacity-30 grayscale' : ''}`}
    >
      <Icon className={`${iconSize} text-white drop-shadow-lg`} />
      {locked && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          <Lock className="w-4 h-4 text-white/70" />
        </div>
      )}
    </motion.div>
  );
}

export default function BadgesPanel({ badges = [] }) {
  const [viewAllOpen, setViewAllOpen] = useState(false);
  
  const earnedBadgeCodes = badges.map(b => b.badge_code || b.code);
  const allBadgeKeys = Object.keys(BADGE_DEFINITIONS);
  const displayBadges = badges.slice(0, 5);
  const totalEarned = badges.length;
  const totalPossible = allBadgeKeys.length;

  return (
    <>
      <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-amber-100">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              My Badges
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-amber-400/70 hover:text-amber-300 h-auto py-1"
              onClick={() => setViewAllOpen(true)}
            >
              View All <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {/* Badge Grid */}
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {displayBadges.length > 0 ? (
              displayBadges.map((badge, i) => (
                <BadgeIcon key={badge.id || i} badge={badge} size="sm" />
              ))
            ) : (
              // Show locked placeholders
              Array.from({ length: 5 }).map((_, i) => (
                <BadgeIcon key={i} badge={{ code: allBadgeKeys[i] }} size="sm" locked />
              ))
            )}
          </div>

          {/* Progress */}
          <div className="text-center border-t border-amber-900/30 pt-3">
            <p className="text-sm text-amber-300">
              <span className="font-bold">{totalEarned}</span>
              <span className="text-amber-400/50"> / {totalPossible} COLLECTED</span>
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-amber-400/70 hover:text-amber-300 mt-1"
              onClick={() => setViewAllOpen(true)}
            >
              View All <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View All Dialog */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-amber-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              All Badges
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-80 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {allBadgeKeys.map(code => {
                const def = BADGE_DEFINITIONS[code];
                const earned = earnedBadgeCodes.includes(code);
                return (
                  <div key={code} className="flex flex-col items-center gap-2">
                    <BadgeIcon badge={{ code }} locked={!earned} />
                    <p className={`text-xs text-center ${earned ? 'text-amber-200' : 'text-amber-400/40'}`}>
                      {def.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}