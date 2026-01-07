import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Target, Star, Sparkles, Gift, Crown, Coins, Clock, 
  ChevronRight, Play, Eye, Loader2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-green-400 to-emerald-500',
  rare: 'from-blue-400 to-cyan-500',
  epic: 'from-purple-400 to-violet-500',
  legendary: 'from-amber-400 to-yellow-500'
};

export default function QuestStartModal({ open, onClose, quest, onConfirm, isPending }) {
  if (!quest) return null;

  const Icon = quest.icon || Target;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={cn(
                "p-4 rounded-2xl bg-gradient-to-br shadow-lg",
                RARITY_COLORS[quest.rarity]
              )}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <DialogTitle className="text-xl">{quest.title}</DialogTitle>
              <Badge className={cn(
                "mt-1",
                quest.rarity === 'legendary' ? 'bg-amber-100 text-amber-700' :
                quest.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                quest.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-700'
              )}>
                {quest.rarity} pathway
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Sacred Purpose */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200"
          >
            <p className="text-violet-700 italic text-center font-medium">
              "{quest.sacredPurpose}"
            </p>
          </motion.div>

          {/* Description */}
          <p className="text-slate-600">{quest.description}</p>

          {/* Objectives */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-500" />
              Your Journey
            </h4>
            <div className="space-y-2">
              {quest.objectives.map((obj, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <span className="text-slate-700">{obj.description}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {obj.target}x
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Duration */}
          {quest.duration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <Clock className="w-4 h-4" />
              Complete within: <span className="font-semibold">{quest.duration}</span>
            </motion.div>
          )}

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
          >
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards Upon Completion
            </h4>
            <div className="flex flex-wrap gap-3">
              {quest.rewards.rp > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200">
                  <Star className="w-5 h-5 text-violet-500" />
                  <span className="font-semibold text-violet-700">+{quest.rewards.rp} RP</span>
                </div>
              )}
              {quest.rewards.ggg > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-amber-700">+{quest.rewards.ggg} GGG</span>
                </div>
              )}
              {quest.rewards.badge && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200">
                  <Crown className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-emerald-700">Badge Unlock</span>
                </div>
              )}
              {quest.rewards.title && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-purple-700">"{quest.rewards.title}"</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            View Later
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isPending}
            className={cn(
              "gap-2",
              quest.rarity === 'legendary' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' :
              quest.rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600' :
              'bg-violet-600 hover:bg-violet-700'
            )}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Begin Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}