import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Users, 
  Calendar, 
  Target, 
  MessageCircle, 
  Coins,
  TrendingUp,
  Settings,
  Check,
  X
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function NotificationBell({ notifications = [], onAction }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeIcons = {
    match: Users,
    meeting: Calendar,
    mission: Target,
    booking: Calendar,
    message: MessageCircle,
    follow: Users,
    ggg: Coins,
    rank: TrendingUp,
    system: Settings,
  };

  const typeColors = {
    match: "text-violet-500 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400",
    meeting: "text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    mission: "text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
    booking: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400",
    message: "text-pink-500 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400",
    follow: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400",
    ggg: "text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
    rank: "text-purple-500 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400",
    system: "text-slate-500 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-400",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-rose-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={() => onAction?.('markAllRead')}
              >
                Mark all read
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 text-rose-600 hover:text-rose-700"
              onClick={() => onAction?.('clearAll')}
            >
              Clear all
            </Button>
          </div>
            
          </div>
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <Bell className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {notifications.map((notif) => {
                const Icon = typeIcons[notif.type] || Settings;
                return (
                  <div 
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors",
                      !notif.is_read && "bg-violet-50/30 dark:bg-violet-900/20"
                    )}
                    onClick={() => onAction?.('click', notif)}
                  >
                    <div className={cn(
                      "shrink-0 p-2 rounded-lg",
                      typeColors[notif.type]
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm text-slate-900 dark:text-slate-100",
                        !notif.is_read && "font-medium"
                      )}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {notif.created_date && formatDistanceToNow(parseISO(notif.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}