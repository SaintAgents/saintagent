import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Bell } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function RecentActivityFeed({ notifications }) {
  const recent = notifications
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 20);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[340px] px-6 pb-4">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map(n => (
                <a
                  key={n.id}
                  href={n.action_url || '#'}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                    <AvatarImage src={n.source_user_avatar} />
                    <AvatarFallback className="text-[10px] bg-slate-100">
                      {n.source_user_name?.charAt(0) || n.type?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 line-clamp-2">
                      <span className="font-medium">{n.title}</span>
                      {n.message && <span className="text-slate-500"> — {n.message}</span>}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {n.created_date && formatDistanceToNow(parseISO(n.created_date), { addSuffix: true })}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}