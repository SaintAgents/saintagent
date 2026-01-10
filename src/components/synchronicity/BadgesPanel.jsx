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
import { Award, ChevronDown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BADGE_INDEX, QUEST_BADGE_IMAGES } from '@/components/badges/badgesData';

// Rarity glow effects
const RARITY_GLOW = {
  common: 'shadow-slate-400/30',
  uncommon: 'shadow-emerald-400/40',
  rare: 'shadow-blue-400/50',
  epic: 'shadow-violet-400/60',
  legendary: 'shadow-amber-400/70',
};

// Rarity color gradients for fallback
const RARITY_COLORS = {
  common: 'from-slate-500 to-slate-400',
  uncommon: 'from-emerald-500 to-green-400',
  rare: 'from-blue-500 to-cyan-400',
  epic: 'from-violet-500 to-purple-400',
  legendary: 'from-amber-400 to-yellow-300',
};

// All quest badges we want to display
const QUEST_BADGE_KEYS = [
  'first_meeting',
  'audit_expert',
  'streak_7',
  'top_mentor',
  'ascended_tier',
  'social_butterfly',
  'mission_master',
  'trust_anchor',
  'synchronicity_weaver',
  'eternal_flame',
];

function BadgeIcon({ badge, size = 'md', locked = false }) {
  const code = badge?.badge_code || badge?.code;
  const def = BADGE_INDEX[code] || {};
  const rarity = def.rarity || 'common';
  const imageUrl = QUEST_BADGE_IMAGES[code];
  
  const sizeClasses = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';

  return (
    <motion.div
      whileHover={{ scale: locked ? 1 : 1.1 }}
      className={`relative ${sizeClasses} rounded-full flex items-center justify-center shadow-lg ${RARITY_GLOW[rarity]} ${locked ? 'opacity-30 grayscale' : ''}`}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={def.label || code}
          className="w-full h-full object-contain drop-shadow-lg"
          data-no-filter="true"
        />
      ) : (
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${RARITY_COLORS[rarity]} flex items-center justify-center`}>
          <Award className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
      )}
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
  const allBadgeKeys = QUEST_BADGE_KEYS;
  const displayBadges = badges.slice(0, 5);
  const totalEarned = earnedBadgeCodes.filter(c => allBadgeKeys.includes(c)).length;
  const totalPossible = allBadgeKeys.length;

  return (
    <>
      <Card className="relative z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
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
          <ScrollArea className="h-96 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {allBadgeKeys.map(code => {
                const def = BADGE_INDEX[code] || {};
                const earned = earnedBadgeCodes.includes(code);
                return (
                  <div key={code} className="flex flex-col items-center gap-2 p-2">
                    <BadgeIcon badge={{ code }} size="lg" locked={!earned} />
                    <p className={`text-xs text-center font-medium ${earned ? 'text-amber-200' : 'text-amber-400/40'}`}>
                      {def.label || code}
                    </p>
                    {def.rarity && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                        def.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
                        def.rarity === 'epic' ? 'bg-violet-500/20 text-violet-300' :
                        def.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {def.rarity}
                      </span>
                    )}
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