import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, CheckCircle, Clock, Users, Mail, MessageSquare,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

const eventTypeConfig = {
  task_completed: { label: 'Task Completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  deadline_reminder: { label: 'Deadline Reminder', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  join_request_approved: { label: 'Request Approved', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  join_request_rejected: { label: 'Request Declined', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  mission: { label: 'Mission Update', icon: Bell, color: 'text-violet-600', bg: 'bg-violet-50' },
};

export default function MissionNotificationsLog({ mission, currentUser }) {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['missionNotifications', mission?.id],
    queryFn: async () => {
      const allNotifs = await base44.entities.Notification.filter(
        { type: 'mission' }, 
        '-created_date', 
        100
      );
      // Filter to this mission
      return allNotifs.filter(n => 
        n.metadata?.mission_id === mission.id ||
        n.action_url?.includes(mission.id)
      );
    },
    enabled: !!mission?.id,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="font-medium text-slate-600 text-sm">No notifications yet</h4>
          <p className="text-xs text-slate-400 mt-1">
            Notifications will appear here when tasks are completed, deadlines approach, or join requests are processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-500" />
          Notification History
        </h4>
        <Badge variant="outline" className="text-xs">{notifications.length} total</Badge>
      </div>

      <div className="space-y-2">
        {notifications.map(notif => {
          const eventType = notif.metadata?.event_type || 'mission';
          const config = eventTypeConfig[eventType] || eventTypeConfig.mission;
          const Icon = config.icon;

          return (
            <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className={`p-1.5 rounded-lg ${config.bg} shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(parseISO(notif.created_date), { addSuffix: true })}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4">
                    <MessageSquare className="w-2.5 h-2.5 mr-0.5" /> In-App
                  </Badge>
                  {notif.is_read && (
                    <Badge variant="outline" className="text-[10px] py-0 h-4 text-emerald-600 border-emerald-200">
                      Read
                    </Badge>
                  )}
                  {!notif.is_read && (
                    <Badge className="text-[10px] py-0 h-4 bg-blue-100 text-blue-700">
                      Unread
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                → {notif.user_id?.split('@')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}