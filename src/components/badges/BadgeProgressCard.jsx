import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Lock, CheckCircle2, Circle, ChevronRight, Award, Target, Info,
  Heart, Users, Eye, Zap, Activity, Grid3X3, Key, Compass, Fingerprint,
  Crown, Shield, UserCheck, Bot, MapPin, Scale, Sparkles
} from 'lucide-react';
import { QUEST_BADGE_IMAGES } from '@/components/badges/badgesData';

// Helper to get icon component
const ICON_MAP = {
  Heart, Users, Eye, Zap, Activity, Grid3X3, Key, Compass, Fingerprint,
  Crown, Shield, UserCheck, Bot, MapPin, Scale, Sparkles, Target, Award
};

// Rarity colors
const RARITY_COLORS = {
  common: 'from-slate-500 to-slate-400',
  uncommon: 'from-emerald-500 to-green-400',
  rare: 'from-blue-500 to-cyan-400',
  epic: 'from-violet-500 to-purple-400',
  legendary: 'from-amber-400 to-yellow-300',
};

export default function BadgeProgressCard({ 
  badge, 
  isEarned = false, 
  userProgress = {}, // { objective_id: { current: number, target: number } }
  onStartQuest,
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = badge.icon || ICON_MAP[badge.iconKey] || Award;
  const imageUrl = QUEST_BADGE_IMAGES[badge.code || badge.id];
  
  // Calculate overall progress
  const objectives = badge.objectives || [];
  const totalObjectives = objectives.length || 1;
  const completedObjectives = objectives.filter((_, idx) => {
    const prog = userProgress[`obj-${idx}`] || userProgress[badge.id + `-${idx}`] || {};
    return prog.current >= (prog.target || 1);
  }).length;
  
  // If no structured progress, estimate from earned status
  const overallProgress = isEarned ? 100 : 
    objectives.length > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsExpanded(true)}
              className={`
                relative cursor-pointer rounded-xl p-2 border-2 transition-all
                ${isEarned 
                  ? 'border-amber-400 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 shadow-lg shadow-amber-500/20' 
                  : 'border-amber-900/30 bg-black/30 hover:border-amber-700/50'}
              `}
            >
              <div className={`w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center relative ${isEarned ? '' : 'opacity-50 grayscale'}`}>
                {imageUrl ? (
                  <img src={imageUrl} alt={badge.name} className="w-full h-full object-contain" data-no-filter="true" />
                ) : badge.color ? (
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${RARITY_COLORS[badge.rarity] || RARITY_COLORS.common} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}
                {!isEarned && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-white/70" />
                  </div>
                )}
              </div>
              
              <p className={`text-[9px] text-center font-medium line-clamp-2 ${isEarned ? 'text-amber-200' : 'text-amber-400/50'}`}>
                {badge.name?.split(' ').slice(0, 2).join(' ')}
              </p>
              
              {/* Mini progress bar */}
              {!isEarned && overallProgress > 0 && (
                <div className="mt-1">
                  <Progress value={overallProgress} className="h-1 bg-amber-900/30" />
                </div>
              )}
              
              {isEarned && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-900" />
                </div>
              )}
              
              {/* Progress indicator */}
              {!isEarned && objectives.length > 0 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <span className="text-[8px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded-full">
                    {completedObjectives}/{totalObjectives}
                  </span>
                </div>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs bg-[#1a2f1a] text-amber-100 border border-amber-900/50 p-3">
            <p className="font-semibold text-amber-200 mb-1">{badge.name}</p>
            <p className="text-xs text-amber-300/70 mb-2">{badge.description}</p>
            {!isEarned && objectives.length > 0 && (
              <div className="text-xs text-amber-400">
                Progress: {completedObjectives} of {totalObjectives} objectives
              </div>
            )}
            <p className="text-[10px] text-amber-500/70 mt-1">Click for details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      layout
      className={`
        rounded-xl border-2 transition-all overflow-hidden
        ${isEarned 
          ? 'border-amber-400 bg-gradient-to-br from-amber-900/20 to-yellow-900/20' 
          : 'border-amber-900/30 bg-black/20 hover:border-amber-700/40'}
      `}
    >
      {/* Header */}
      <div 
        className="p-3 cursor-pointer flex items-center gap-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative shrink-0 ${isEarned ? '' : 'opacity-60 grayscale'}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={badge.name} className="w-full h-full object-contain" data-no-filter="true" />
          ) : badge.color ? (
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${RARITY_COLORS[badge.rarity] || RARITY_COLORS.common} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          {!isEarned && (
            <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white/70" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold text-sm truncate ${isEarned ? 'text-amber-100' : 'text-amber-300/70'}`}>
              {badge.name}
            </h4>
            {isEarned && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
          </div>
          
          {/* Progress bar and stats */}
          <div className="mt-1.5">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-amber-400/60">
                {isEarned ? 'Completed' : `${completedObjectives} of ${totalObjectives} objectives`}
              </span>
              <span className="text-amber-400">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-1.5 bg-amber-900/30" />
          </div>
        </div>
        
        <ChevronRight className={`w-4 h-4 text-amber-400/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </div>
      
      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-amber-900/30"
          >
            <div className="p-3 space-y-3">
              {/* Description */}
              <p className="text-xs text-amber-300/70">{badge.description}</p>
              
              {/* Quest info */}
              {badge.quest && (
                <div className="flex items-center gap-2 text-xs">
                  <Target className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-200">{badge.quest}</span>
                  {badge.type && (
                    <Badge variant="outline" className="text-[10px] border-amber-700/50 text-amber-400">
                      {badge.type}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* MetaV number */}
              {badge.metav && (
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-300/70">MetaV:</span>
                  <Badge className="text-[10px] bg-slate-800 text-amber-400">{badge.metav}</Badge>
                </div>
              )}
              
              {/* Objectives with progress */}
              {objectives.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-amber-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Objectives
                  </h5>
                  <ul className="space-y-2">
                    {objectives.map((obj, idx) => {
                      const prog = userProgress[`obj-${idx}`] || userProgress[badge.id + `-${idx}`] || { current: 0, target: 1 };
                      const objCompleted = isEarned || prog.current >= prog.target;
                      const objProgress = isEarned ? 100 : Math.min((prog.current / prog.target) * 100, 100);
                      
                      return (
                        <li key={idx} className="bg-black/20 rounded-lg p-2">
                          <div className="flex items-start gap-2">
                            {objCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs ${objCompleted ? 'text-amber-200' : 'text-amber-300/70'}`}>
                                {obj}
                              </span>
                              {!isEarned && (
                                <div className="mt-1 flex items-center gap-2">
                                  <Progress value={objProgress} className="h-1 flex-1 bg-amber-900/30" />
                                  <span className="text-[10px] text-amber-400 shrink-0">
                                    {prog.current}/{prog.target}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              {/* Rarity */}
              {badge.rarity && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    badge.rarity === 'legendary' ? 'bg-amber-500/30 text-amber-300' :
                    badge.rarity === 'epic' ? 'bg-violet-500/30 text-violet-300' :
                    badge.rarity === 'rare' ? 'bg-blue-500/30 text-blue-300' :
                    badge.rarity === 'uncommon' ? 'bg-emerald-500/30 text-emerald-300' :
                    'bg-slate-500/30 text-slate-300'
                  }`}>
                    {badge.rarity}
                  </span>
                </div>
              )}
              
              {/* Action button */}
              {!isEarned && onStartQuest && (
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs"
                  onClick={() => onStartQuest(badge)}
                >
                  Start Quest
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}