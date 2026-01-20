import React, { useState } from 'react';
import { BADGE_INDEX, QUEST_BADGE_IMAGES } from './badgesData';
import BadgeIcon from './BadgeIcon';
import { Award } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BadgesBar({ badges = [], defaultIfEmpty = true, max = 20, maxDisplay, onMore, className = '', eternalFlameBadge, showEmptySlots = false, emptySlotCount = 4, size = 'default' }) {
  const effectiveMax = maxDisplay ?? max;
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const derived = React.useMemo(() => {
    const items = badges
      .map(b => {
        const code = (b.badge_code || b.code || '').toLowerCase();
        if (!code) return null;
        
        // Preserve earned_date for sorting
        const earnedDate = b.earned_date || b.created_date;
        
        // Check QUEST_BADGE_IMAGES first for image URL
        const imageUrl = QUEST_BADGE_IMAGES[code];
        
        // Direct lookup first
        if (BADGE_INDEX[code]) {
          const badgeData = { ...BADGE_INDEX[code], code, earned_date: earnedDate };
          // If badge has custom icon_url from database, use it; otherwise use QUEST_BADGE_IMAGES
          if (b.icon_url) {
            return { ...badgeData, customIcon: b.icon_url };
          }
          if (imageUrl) {
            return { ...badgeData, customIcon: imageUrl };
          }
          return badgeData;
        }
        
        // Handle streak badge variations (7-day_streak, 7_day_streak, streak_7, etc.)
        if (code.includes('streak') || code.includes('7')) {
          const streakMatch = code.match(/(\d+)/);
          if (streakMatch) {
            const num = streakMatch[1];
            // Try various formats
            const streakKey = `streak_${num}`;
            if (BADGE_INDEX[streakKey]) {
              const streakImage = QUEST_BADGE_IMAGES[streakKey] || QUEST_BADGE_IMAGES[code];
              const badgeData = { ...BADGE_INDEX[streakKey], code: streakKey };
              if (b.icon_url) {
                return { ...badgeData, customIcon: b.icon_url };
              }
              if (streakImage) {
                return { ...badgeData, customIcon: streakImage };
              }
              return badgeData;
            }
          }
          // Default to streak_7 for any streak-related badge
          if (code.includes('streak')) {
            const streakImage = QUEST_BADGE_IMAGES['streak_7'];
            const badgeData = { ...BADGE_INDEX['streak_7'], code: 'streak_7' };
            if (b.icon_url) {
              return { ...badgeData, customIcon: b.icon_url };
            }
            if (streakImage) {
              return { ...badgeData, customIcon: streakImage };
            }
            return badgeData;
          }
        }
        
        // Fallback: If badge not in index, create entry from database record
        // This ensures badges like social_butterfly display even if not in BADGE_INDEX
        const fallbackImage = imageUrl || b.icon_url;
        return {
          code,
          label: b.title || b.badge_name || code.replace(/_/g, ' '),
          definition: b.description || b.awarded_for || `Badge: ${code}`,
          section: 'mission',
          iconKey: 'award',
          customIcon: fallbackImage,
          earned_date: earnedDate
        };
      })
      .filter(Boolean);
    
    // Always add Eternal Flame badge at the beginning if provided
    if (eternalFlameBadge) {
      const eternalFlameItem = {
        code: 'eternal_flame',
        label: eternalFlameBadge.badge_name || 'Eternal Flame',
        subtitle: eternalFlameBadge.description || 'Living Agent',
        definition: 'Baseline awakening badge—signals a living agent with active inner fire and presence.',
        iconKey: 'flame',
        section: 'identity',
        customIcon: eternalFlameBadge.icon_url
      };
      items.unshift(eternalFlameItem);
    } else if (items.length === 0 && defaultIfEmpty) {
      items.push({ ...BADGE_INDEX['eternal_flame'], section: 'identity' });
    }
    return items;
  }, [badges, defaultIfEmpty, eternalFlameBadge]);

  // Sort badges by earned_date/created_date (most recent first) to ensure newest badges appear first
  const sortedDerived = React.useMemo(() => {
    return [...derived].sort((a, b) => {
      // Use earned_date if available, fallback to created_date, fallback to 0
      const dateA = a.earned_date ? new Date(a.earned_date).getTime() : (a.created_date ? new Date(a.created_date).getTime() : 0);
      const dateB = b.earned_date ? new Date(b.earned_date).getTime() : (b.created_date ? new Date(b.created_date).getTime() : 0);
      return dateB - dateA;
    });
  }, [derived]);

  const visible = sortedDerived.slice(0, effectiveMax);
  const hiddenItems = sortedDerived.slice(effectiveMax);
  const remaining = hiddenItems.length;

  const handleMoreClick = (e) => {
    e.stopPropagation();
    if (onMore) {
      onMore();
    } else {
      setPopoverOpen(true);
    }
  };

  // Calculate how many empty slots to show - badges fill slots first, then show remaining empty slots
  const slotsToShow = showEmptySlots ? Math.max(0, emptySlotCount - visible.length) : 0;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visible.map((item) => (
        <TooltipProvider key={item.code}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex items-center gap-1.5 rounded-lg font-medium bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm cursor-default backdrop-blur-sm ${
                  size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
                }`}
              >
                {item.customIcon ? (
                  <img 
                    src={item.customIcon} 
                    alt={`${item.label} Badge`}
                    className={size === 'sm' ? 'w-4 h-4 object-contain' : 'w-5 h-5 object-contain'}
                    data-no-filter="true"
                    loading="lazy"
                  />
                ) : QUEST_BADGE_IMAGES[item.code] ? (
                  <img 
                    src={QUEST_BADGE_IMAGES[item.code]} 
                    alt={`${item.label} Badge`}
                    className={size === 'sm' ? 'w-4 h-4 object-contain' : 'w-5 h-5 object-contain'}
                    data-no-filter="true"
                    loading="lazy"
                  />
                ) : (
                  <BadgeIcon iconKey={item.iconKey} section={item.section} size={size === 'sm' ? 12 : 14} />
                )}
                <span className="capitalize">{item.label}</span>
                {item.subtitle && size !== 'sm' && (
                  <span className="text-[10px] text-slate-500">• {item.subtitle}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-xs p-0 border-0 bg-transparent shadow-none overflow-visible"
            >
              <div>
                <div className="h-[2px] rounded-t-xl bg-gradient-to-r from-emerald-400 via-[#00ff88] to-teal-400 dark:from-[#00ff88] dark:via-emerald-400 dark:to-[#00ff88]" />
                <div className="rounded-b-xl rounded-tr-xl overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 dark:from-[#050505]/95 dark:via-[#0a0a0a]/95 dark:to-emerald-950/80 backdrop-blur-xl border border-t-0 border-emerald-500/30 dark:border-[#00ff88]/25 shadow-[0_8px_32px_rgba(0,0,0,0.15),_0_0_20px_rgba(16,185,129,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),_0_0_30px_rgba(0,255,136,0.1)] p-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.label}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.definition}</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {/* Empty badge slots */}
      {Array.from({ length: slotsToShow }).map((_, idx) => (
        <TooltipProvider key={`empty-${idx}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/60 dark:bg-slate-900/80 border border-slate-600/30 dark:border-[#00ff88]/20 cursor-default"
              >
                <Award className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-xs p-0 border-0 bg-transparent shadow-none overflow-visible"
            >
              <div>
                <div className="h-[2px] rounded-t-xl bg-gradient-to-r from-emerald-400 via-[#00ff88] to-teal-400 dark:from-[#00ff88] dark:via-emerald-400 dark:to-[#00ff88]" />
                <div className="rounded-b-xl rounded-tr-xl overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 dark:from-[#050505]/95 dark:via-[#0a0a0a]/95 dark:to-emerald-950/80 backdrop-blur-xl border border-t-0 border-emerald-500/30 dark:border-[#00ff88]/25 shadow-[0_8px_32px_rgba(0,0,0,0.15),_0_0_20px_rgba(16,185,129,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),_0_0_30px_rgba(0,255,136,0.1)] p-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Empty Slot</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">Earn badges to fill this slot</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remaining > 0 && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              +{remaining} more
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs font-medium text-slate-500 mb-2">Additional Badges ({hiddenItems.length})</div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {hiddenItems.map((item) => (
                <TooltipProvider key={item.code}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-default"
                      >
                        {item.customIcon ? (
                          <img 
                            src={item.customIcon} 
                            alt={`${item.label} Badge`}
                            className="w-5 h-5 object-contain"
                            data-no-filter="true"
                            loading="lazy"
                          />
                        ) : QUEST_BADGE_IMAGES[item.code] ? (
                          <img 
                            src={QUEST_BADGE_IMAGES[item.code]} 
                            alt={`${item.label} Badge`}
                            className="w-5 h-5 object-contain"
                            data-no-filter="true"
                            loading="lazy"
                          />
                        ) : (
                          <BadgeIcon iconKey={item.iconKey} section={item.section} size={14} />
                        )}
                        <span className="capitalize">{item.label}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="max-w-xs p-0 border-0 bg-transparent shadow-none overflow-visible"
                    >
                      <div>
                        <div className="h-[2px] rounded-t-xl bg-gradient-to-r from-emerald-400 via-[#00ff88] to-teal-400 dark:from-[#00ff88] dark:via-emerald-400 dark:to-[#00ff88]" />
                        <div className="rounded-b-xl rounded-tr-xl overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 dark:from-[#050505]/95 dark:via-[#0a0a0a]/95 dark:to-emerald-950/80 backdrop-blur-xl border border-t-0 border-emerald-500/30 dark:border-[#00ff88]/25 shadow-[0_8px_32px_rgba(0,0,0,0.15),_0_0_20px_rgba(16,185,129,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),_0_0_30px_rgba(0,255,136,0.1)] p-3">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.label}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.definition}</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}