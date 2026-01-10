import React, { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown, Pin, MoreHorizontal, ExternalLink, Eye, EyeOff, Maximize2, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Custom icon images
const ICON_SAVE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/593339f18_save_light_iconcopy.png";
const ICON_RESET = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/a64e30bd5_Screenshot2026-01-04224148.png";
const ICON_COLLAPSE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8fe1dd4e9_downcopy.png";
const ICON_EXPAND = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/79872c01d_upcopy.png";

export default function CollapsibleCard({
  title,
  cardId,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
  badgeColor = "slate",
  actions,
  className,
  onPin,
  isPinned,
  backgroundImage,
  onPopout,
  forceOpen,
  isHidden,
  onToggleHide,
  onTossToSidePanel // Prop for toss functionality (button only)
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const cardRef = useRef(null);

  React.useEffect(() => {
    if (typeof forceOpen === 'boolean') setIsOpen(forceOpen);
  }, [forceOpen]);

  const badgeColors = {
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-100 text-violet-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700"
  };

  // If hidden, render nothing (card is stored in side panel or hidden)
  if (isHidden) {
    return null;
  }

  return (
    <div 
      ref={cardRef}
      className={cn(
        "relative bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300",
        isPinned && "ring-2 ring-violet-500/20",
        className
      )}
    >
      {/* Background Image */}
      {backgroundImage &&
      <div
        className="absolute inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${backgroundImage})` }} />

      }
      
      <div className="bg-violet-100 px-5 py-4 relative z-10 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors border-b border-slate-200/60"

      onClick={() => setIsOpen(!isOpen)}>

        <div className="flex items-center gap-3 min-w-0">
          {onPopout &&
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -ml-2 hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              onPopout();
            }}
            aria-label="Pop out"
            title="Pop out">

              <ExternalLink className="w-4 h-4 text-slate-500" />
            </Button>
          }
          {Icon && typeof Icon === 'function' &&
          <div className="bg-fuchsia-100 p-2 rounded-xl shrink-0 flex items-center">
              <Icon className="w-4 h-4 text-slate-600" />
            </div>
          }
          <h3 className="font-semibold text-slate-900 tracking-tight hidden md:block truncate">{title}</h3>
          {badge &&
          <span className={cn(
            "px-2.5 py-0.5 text-xs font-medium rounded-full shrink-0",
            badgeColors[badgeColor]
          )}>
              {badge}
            </span>
          }
        </div>
        <div className="flex items-center gap-1">
          {onTossToSidePanel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-violet-100"
              onClick={(e) => {
                e.stopPropagation();
                onTossToSidePanel(cardId, title);
              }}
              title="Send to side panel"
            >
              <PanelRight className="w-4 h-4 text-slate-400 hover:text-violet-600" />
            </Button>
          )}
          {onToggleHide && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                onToggleHide();
              }}
              title="Hide card"
            >
              <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </Button>
          )}
          {onPin &&
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}>

              <Pin className={cn(
              "w-4 h-4 transition-colors",
              isPinned ? "text-violet-500 fill-violet-500" : "text-slate-400"
            )} />
            </Button>
          }
          {actions &&
          <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, i) =>
              <DropdownMenuItem key={i} onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}>
                    {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
              )}
              </DropdownMenuContent>
            </DropdownMenu>
          }

          <img 
            src={isOpen ? ICON_COLLAPSE : ICON_EXPAND} 
            alt={isOpen ? "Collapse" : "Expand"}
            className="w-6 h-6 transition-transform duration-200"
          />
        </div>
      </div>
      <div className={cn(
        "relative overflow-hidden transition-all duration-300",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>);

}