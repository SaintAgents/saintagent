import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Lock, Sparkles } from 'lucide-react';

// Pyramid layout: 42 badge slots arranged in rows from bottom to top
// Row 1 (bottom): 7 slots, Row 2: 7 slots, Row 3: 6 slots, Row 4: 6 slots, 
// Row 5: 5 slots, Row 6: 4 slots, Row 7: 3 slots, Row 8: 2 slots, Row 9: 1 slot, Row 10: 1 slot (top)
const PYRAMID_ROWS = [
  { slots: 7, yPercent: 92 },   // Row 1 (bottom): badges 1-7
  { slots: 7, yPercent: 82 },   // Row 2: badges 8-14
  { slots: 6, yPercent: 72 },   // Row 3: badges 15-20 (note: image shows 15-21)
  { slots: 6, yPercent: 63 },   // Row 4: badges 21-26
  { slots: 5, yPercent: 54 },   // Row 5: badges 27-31
  { slots: 4, yPercent: 45 },   // Row 6: badges 32-35
  { slots: 3, yPercent: 36 },   // Row 7: badges 36-38
  { slots: 2, yPercent: 27 },   // Row 8: badges 39-40
  { slots: 1, yPercent: 18 },   // Row 9: badge 41
  { slots: 1, yPercent: 8 },    // Row 10 (top): badge 42
];

// Generate slot positions based on pyramid layout
const generateSlotPositions = () => {
  const positions = [];
  let badgeNum = 1;
  
  PYRAMID_ROWS.forEach((row) => {
    const startX = 50 - ((row.slots - 1) * 6); // Center the row
    for (let i = 0; i < row.slots; i++) {
      positions.push({
        id: badgeNum,
        x: startX + (i * 12), // 12% spacing between slots
        y: row.yPercent,
      });
      badgeNum++;
    }
  });
  
  return positions;
};

const SLOT_POSITIONS = generateSlotPositions();

export default function AscensionGrid({ 
  badges = [], 
  badgeDefinitions = [],
  totalBadges = 42,
  onBadgeClick,
  className 
}) {
  const [hoveredSlot, setHoveredSlot] = useState(null);
  
  // Map earned badges to slot numbers (simplified - in production you'd map badge_code to specific slots)
  const earnedBadgeCodes = badges.map(b => b.badge_code || b.code);
  
  // Get badge definition by slot number
  const getBadgeForSlot = (slotNum) => {
    if (slotNum <= badgeDefinitions.length) {
      return badgeDefinitions[slotNum - 1];
    }
    return null;
  };
  
  // Check if slot is unlocked (badge earned)
  const isSlotUnlocked = (slotNum) => {
    const badgeDef = getBadgeForSlot(slotNum);
    if (badgeDef) {
      return earnedBadgeCodes.includes(badgeDef.badge_code);
    }
    // For slots without definitions, check if user has enough badges
    return slotNum <= badges.length;
  };

  const progress = Math.round((badges.length / totalBadges) * 100);

  return (
    <TooltipProvider>
      <div className={cn("relative w-full", className)}>
        {/* Background Image */}
        <div className="relative w-full aspect-[3/4] max-h-[600px] mx-auto">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/851cec6ac_agrid.png"
            alt="Ascension Grid"
            className="w-full h-full object-contain"
            data-no-filter="true"
          />
          
          {/* Badge Slots Overlay */}
          <div className="absolute inset-0">
            {SLOT_POSITIONS.map((slot) => {
              const unlocked = isSlotUnlocked(slot.id);
              const badgeDef = getBadgeForSlot(slot.id);
              const isHovered = hoveredSlot === slot.id;
              
              return (
                <Tooltip key={slot.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      className={cn(
                        "absolute w-[8%] aspect-square rounded-full cursor-pointer",
                        "flex items-center justify-center",
                        "transition-all duration-300",
                        "-translate-x-1/2 -translate-y-1/2"
                      )}
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                      }}
                      onMouseEnter={() => setHoveredSlot(slot.id)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => onBadgeClick?.(slot.id, badgeDef)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {unlocked ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "w-full h-full rounded-full",
                            "bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500",
                            "shadow-[0_0_20px_rgba(251,191,36,0.6)]",
                            "flex items-center justify-center",
                            "border-2 border-amber-300"
                          )}
                        >
                          {badgeDef?.icon_url ? (
                            <img 
                              src={badgeDef.icon_url} 
                              alt={badgeDef.badge_name}
                              className="w-3/4 h-3/4 object-contain"
                            />
                          ) : (
                            <Sparkles className="w-1/2 h-1/2 text-amber-800" />
                          )}
                        </motion.div>
                      ) : (
                        <div className={cn(
                          "w-full h-full rounded-full",
                          "bg-slate-800/60 backdrop-blur-sm",
                          "border border-slate-600/50",
                          "flex items-center justify-center",
                          isHovered && "bg-violet-900/40 border-violet-500/50"
                        )}>
                          <Lock className="w-1/3 h-1/3 text-slate-500" />
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-slate-900 border-slate-700 text-white max-w-[200px]"
                  >
                    <div className="text-center">
                      <p className="font-semibold text-amber-400">
                        {badgeDef?.badge_name || `Badge #${slot.id}`}
                      </p>
                      {badgeDef?.description && (
                        <p className="text-xs text-slate-300 mt-1">{badgeDef.description}</p>
                      )}
                      {!unlocked && (
                        <p className="text-xs text-violet-400 mt-1">🔒 Locked</p>
                      )}
                      {unlocked && (
                        <p className="text-xs text-emerald-400 mt-1">✓ Unlocked</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
        
        {/* Progress Footer */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900/80 border border-violet-500/30">
            <span className="text-violet-300 text-sm font-medium">Ascension Progress</span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              {progress}%
            </span>
            <span className="text-slate-400 text-sm">
              {badges.length} / {totalBadges} COLLECTED
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}