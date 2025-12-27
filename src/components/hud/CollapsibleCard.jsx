import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown, Pin, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CollapsibleCard({ 
  title, 
  icon: Icon,
  children, 
  defaultOpen = true,
  badge,
  badgeColor = "slate",
  actions,
  className,
  onPin,
  isPinned
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const badgeColors = {
    slate: "bg-slate-100 text-slate-700",
    violet: "bg-violet-100 text-violet-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300",
      isPinned && "ring-2 ring-violet-500/20",
      className
    )}>
      <div 
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-slate-100">
              <Icon className="w-4 h-4 text-slate-600" />
            </div>
          )}
          <h3 className="font-semibold text-slate-900 tracking-tight">{title}</h3>
          {badge && (
            <span className={cn(
              "px-2.5 py-0.5 text-xs font-medium rounded-full",
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onPin && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
            >
              <Pin className={cn(
                "w-4 h-4 transition-colors",
                isPinned ? "text-violet-500 fill-violet-500" : "text-slate-400"
              )} />
            </Button>
          )}
          {actions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((action, i) => (
                  <DropdownMenuItem key={i} onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}>
                    {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ChevronDown className={cn(
            "w-5 h-5 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}