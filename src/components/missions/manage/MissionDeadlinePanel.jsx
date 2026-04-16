import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clock, CalendarDays, AlertTriangle, Bell, CheckCircle } from "lucide-react";
import { formatDistanceToNow, parseISO, isPast, format } from "date-fns";

export default function MissionDeadlinePanel({ mission, isCreator }) {
  const queryClient = useQueryClient();
  const [newDeadline, setNewDeadline] = useState('');

  const hasDeadline = !!mission.end_time;
  const deadline = hasDeadline ? parseISO(mission.end_time) : null;
  const isOverdue = deadline && isPast(deadline);
  const timeLeft = deadline && !isOverdue ? formatDistanceToNow(deadline, { addSuffix: true }) : null;

  const updateDeadlineMutation = useMutation({
    mutationFn: async (newDate) => {
      await base44.entities.Mission.update(mission.id, { end_time: new Date(newDate).toISOString() });
    },
    onSuccess: () => {
      toast.success('Deadline updated');
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['myMissions'] });
      setNewDeadline('');
    }
  });

  const reminderSchedule = [
    { offset: '7 days before', status: hasDeadline ? 'scheduled' : 'inactive' },
    { offset: '3 days before', status: hasDeadline ? 'scheduled' : 'inactive' },
    { offset: '24 hours before', status: hasDeadline ? 'scheduled' : 'inactive' },
    { offset: '1 hour before', status: hasDeadline ? 'scheduled' : 'inactive' },
  ];

  return (
    <div className="space-y-4">
      {/* Current Deadline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-violet-500" />
            <h4 className="font-semibold text-sm text-slate-900">Mission Deadline</h4>
          </div>
          {hasDeadline ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">{format(deadline, 'PPP')}</p>
                  <p className="text-xs text-slate-500">{format(deadline, 'h:mm a')}</p>
                </div>
                {isOverdue ? (
                  <Badge className="bg-red-100 text-red-700 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Overdue
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                    <Clock className="w-3 h-3" /> {timeLeft}
                  </Badge>
                )}
              </div>
              {mission.start_time && (
                <p className="text-xs text-slate-500">
                  Started: {format(parseISO(mission.start_time), 'PPP')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No deadline set for this mission.</p>
          )}

          {isCreator && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                {hasDeadline ? 'Change deadline' : 'Set deadline'}
              </label>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={!newDeadline || updateDeadlineMutation.isPending}
                  onClick={() => updateDeadlineMutation.mutate(newDeadline)}
                >
                  {updateDeadlineMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Schedule */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-500" />
            <h4 className="font-semibold text-sm text-slate-900">Reminder Schedule</h4>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Automated reminders are sent to all participants before the deadline.
          </p>
          <div className="space-y-2">
            {reminderSchedule.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700">{r.offset}</span>
                <Badge variant="outline" className={
                  r.status === 'scheduled' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }>
                  {r.status === 'scheduled' ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Auto</>
                  ) : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
          {!hasDeadline && (
            <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded-lg">
              Set a deadline above to enable automated reminders.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}