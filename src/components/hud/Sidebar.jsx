import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LayoutDashboard,
  Users,
  Calendar,
  Target,
  ShoppingBag,
  Radio,
  CircleDot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Wifi,
  Moon,
  Focus
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NAV_ITEMS = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck' },
  { id: 'matches', label: 'Matches', icon: Sparkles, page: 'Matches', badge: 5 },
  { id: 'meetings', label: 'Meetings', icon: Calendar, page: 'Meetings', badge: 2 },
  { id: 'missions', label: 'Missions', icon: Target, page: 'Missions' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, page: 'Marketplace' },
  { id: 'leader', label: 'Leader Channel', icon: Radio, page: 'LeaderChannel', locked: true },
  { id: 'circles', label: 'Circles & Regions', icon: CircleDot, page: 'Circles' },
  { id: 'studio', label: 'Creator Studio', icon: Users, page: 'Studio' },
];

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online', icon: Wifi, color: 'bg-emerald-500' },
  { value: 'focus', label: 'Focus', icon: Focus, color: 'bg-amber-500' },
  { value: 'dnd', label: 'Do Not Disturb', icon: Moon, color: 'bg-rose-500' },
];

const DM_POLICY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'followers', label: 'Followers' },
  { value: 'mutual', label: 'Mutual Only' },
  { value: 'none', label: 'Nobody' },
];

export default function Sidebar({ 
  isCollapsed, 
  onToggle, 
  currentPage,
  profile,
  onStatusChange,
  onDMPolicyChange
}) {
  const [status, setStatus] = useState(profile?.status || 'online');
  const [dmPolicy, setDMPolicy] = useState(profile?.dm_policy || 'everyone');

  const handleStatusChange = (value) => {
    setStatus(value);
    onStatusChange?.(value);
  };

  const handleDMChange = (value) => {
    setDMPolicy(value);
    onDMPolicyChange?.(value);
  };

  const statusOption = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-slate-900">SaintAgent</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("shrink-0", isCollapsed && "hidden")}
          onClick={onToggle}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <Link
              key={item.id}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                isActive 
                  ? "bg-violet-100 text-violet-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                item.locked && "opacity-50 pointer-events-none"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!isCollapsed && (
                <>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-violet-600 text-white text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.locked && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Locked
                    </Badge>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Status Controls */}
      <div className={cn(
        "border-t border-slate-100 p-4 space-y-3",
        isCollapsed && "px-2"
      )}>
        {/* Status Light */}
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            statusOption?.color
          )} />
          {!isCollapsed && (
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* DM Policy */}
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <MessageCircle className="w-4 h-4 text-slate-400" />
            <Select value={dmPolicy} onValueChange={handleDMChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DM_POLICY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    DMs: {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Settings */}
        <Link
          to={createPageUrl('Settings')}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="w-5 h-5 text-slate-400" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>

        {/* Collapse Toggle (when collapsed) */}
        {isCollapsed && (
          <Button 
            variant="ghost" 
            size="icon"
            className="w-full"
            onClick={onToggle}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}