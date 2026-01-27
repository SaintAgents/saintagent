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
  X,
  Sparkles,
  Send,
  Loader2,
  Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, parseISO } from "date-fns";
import { createPageUrl } from "@/utils";

export default function NotificationBell({ notifications = [], onAction }) {
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
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
    collaboration: Users,
    post: MessageCircle,
    event: Calendar,
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
    collaboration: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400",
    post: "text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
    event: "text-rose-500 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-8 h-8 md:w-9 md:h-9" style={{ zIndex: 10001, pointerEvents: 'auto' }}>
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs font-bold text-white bg-rose-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-1rem)] md:w-96 max-w-96 p-0 dark:bg-slate-800 dark:border-slate-700" style={{ zIndex: 10002 }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
              disabled={isClearing}
              onClick={async () => {
                setIsClearing(true);
                try {
                  await onAction?.('clearAll');
                  // Force close popover and reset count display
                  setTimeout(() => {
                    setIsClearing(false);
                    setOpen(false);
                  }, 500);
                } catch (err) {
                  console.error('Failed to clear notifications:', err);
                  setIsClearing(false);
                }
              }}
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </>
              )}
            </Button>
          )}
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
                    onClick={() => {
                      // Navigate to action_url if available, otherwise use smart routing based on type
                      if (notif.action_url) {
                        window.location.href = notif.action_url;
                      } else {
                        // Smart routing based on notification type
                        const routes = {
                          match: createPageUrl('Matches'),
                          meeting: createPageUrl('Meetings'),
                          mission: createPageUrl('Missions'),
                          booking: createPageUrl('Meetings'),
                          message: createPageUrl('Messages'),
                          follow: notif.source_user_id ? createPageUrl('Profile') + `?id=${notif.source_user_id}` : createPageUrl('Profiles'),
                          ggg: createPageUrl('CommandDeck'),
                          rank: createPageUrl('Gamification'),
                          collaboration: createPageUrl('FindCollaborators'),
                          post: createPageUrl('CommunityFeed'),
                          event: createPageUrl('Events'),
                          system: createPageUrl('CommandDeck'),
                        };
                        const targetUrl = routes[notif.type];
                        if (targetUrl) {
                          window.location.href = targetUrl;
                        }
                      }
                      onAction?.('click', notif);
                      setOpen(false);
                    }}
                  >
                    {notif.source_user_avatar ? (
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={notif.source_user_avatar} />
                        <AvatarFallback className={cn("text-xs", typeColors[notif.type])}>
                          {notif.source_user_name?.charAt(0) || <Icon className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={cn(
                        "shrink-0 p-2 rounded-lg",
                        typeColors[notif.type]
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                    )}
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {notif.created_date && formatDistanceToNow(parseISO(notif.created_date), { addSuffix: true })}
                        </p>
                        {notif.priority === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">High priority</span>
                        )}
                        {notif.priority === 'urgent' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Urgent</span>
                        )}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-2" />
                    )}
                    {notif.type === 'collaboration' && notif.metadata?.request_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = createPageUrl('FindCollaborators');
                        }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        View
                      </Button>
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