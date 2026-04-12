import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Zap, CheckCircle2, Circle, ChevronRight, Camera, Image, FileText,
  MapPin, Sparkles, Target, Link, Star, ShoppingBag, UserPlus, Users, Calendar
} from 'lucide-react';
import {
  XP_TASKS, XP_SOCIAL_TASKS, calculateXP, getLevel, getUnlockedBadges, LEVEL_BADGES, XP_LEVELS
} from './xpConfig';

const ICON_MAP = { Camera, Image, FileText, MapPin, Sparkles, Target, Link, Star, ShoppingBag, UserPlus, Users, Calendar };

function TaskRow({ task, done }) {
  const Icon = ICON_MAP[task.icon] || Zap;
  return (
    <div className={`flex items-center gap-2 py-1 ${done ? 'opacity-60' : ''}`}>
      {done ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
      )}
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className={`text-xs flex-1 ${done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
        {task.label}
      </span>
      <span className={`text-[10px] font-semibold ${done ? 'text-emerald-600' : 'text-violet-600 dark:text-violet-400'}`}>
        +{task.xp} XP
      </span>
    </div>
  );
}

export default function XPProgressCard({ profile, socialCounts = {} }) {
  const { totalXP, completed } = useMemo(
    () => calculateXP(profile, socialCounts),
    [profile, socialCounts]
  );
  const level = useMemo(() => getLevel(totalXP), [totalXP]);
  const badges = useMemo(() => getUnlockedBadges(level.level), [level.level]);
  const maxXP = XP_LEVELS[XP_LEVELS.length - 1].xpRequired;

  const allTasks = [...XP_TASKS, ...XP_SOCIAL_TASKS];
  const incompleteTasks = allTasks.filter(t => !completed.includes(t.id));
  const completedTasks = allTasks.filter(t => completed.includes(t.id));

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/20 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Level {level.level}</h4>
            <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">{level.title}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{totalXP}</p>
          <p className="text-[10px] text-slate-500">/ {maxXP} XP</p>
        </div>
      </div>

      {/* Level progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Lvl {level.level}</span>
          {level.next ? <span>Lvl {level.next.level} — {level.next.title}</span> : <span>Max Level!</span>}
        </div>
        <Progress value={level.progressToNext} className="h-2" />
        {level.next && (
          <p className="text-[10px] text-slate-400 mt-0.5 text-right">
            {level.next.xpRequired - totalXP} XP to next level
          </p>
        )}
      </div>

      {/* Unlocked Badges */}
      {badges.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Earned Badges</p>
          <div className="flex flex-wrap gap-1.5">
            <TooltipProvider>
              {badges.map(b => (
                <Tooltip key={b.level}>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white dark:bg-black/30 border-violet-200 dark:border-violet-700 cursor-default">
                      {b.emoji} {b.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Unlocked at Level {b.level}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
            {/* Locked badges preview */}
            {Object.entries(LEVEL_BADGES)
              .filter(([lvl]) => Number(lvl) > level.level)
              .slice(0, 2)
              .map(([lvl, b]) => (
                <Badge key={lvl} variant="outline" className="text-xs px-2 py-0.5 opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  🔒 Lvl {lvl}
                </Badge>
              ))
            }
          </div>
        </div>
      )}

      {/* Next tasks to complete */}
      {incompleteTasks.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Next Steps</p>
          <div className="space-y-0.5">
            {incompleteTasks.slice(0, 4).map(t => (
              <TaskRow key={t.id} task={t} done={false} />
            ))}
            {incompleteTasks.length > 4 && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                +{incompleteTasks.length - 4} more tasks <ChevronRight className="w-3 h-3" />
              </p>
            )}
          </div>
        </div>
      )}

      {/* Completed summary */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-violet-200/50 dark:border-violet-800/30">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ {completedTasks.length}/{allTasks.length} tasks completed
          </p>
        </div>
      )}
    </div>
  );
}