import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Clock, AlertTriangle, Calendar, Loader2 } from 'lucide-react';

const REMINDER_TYPES = [
  {
    type: 'close_date_approaching',
    label: 'Close Date Approaching',
    description: 'Remind me when deals are approaching their expected close date',
    icon: Calendar,
    color: 'text-blue-500'
  },
  {
    type: 'overdue_close_date',
    label: 'Overdue Close Date',
    description: 'Alert me when deals pass their expected close date',
    icon: AlertTriangle,
    color: 'text-red-500'
  },
  {
    type: 'stale_deal',
    label: 'Stale Deal Alert',
    description: 'Notify me when deals have no activity for a period',
    icon: Clock,
    color: 'text-amber-500'
  }
];

export default function DealReminderSettings({ currentUser }) {
  const queryClient = useQueryClient();

  const { data: reminderConfigs = [], isLoading } = useQuery({
    queryKey: ['dealReminderConfigs', currentUser?.email],
    queryFn: () => base44.entities.DealReminderConfig.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const saveMutation = useMutation({
    mutationFn: async ({ type, config }) => {
      const existing = reminderConfigs.find(r => r.reminder_type === type);
      if (existing) {
        await base44.entities.DealReminderConfig.update(existing.id, config);
      } else {
        await base44.entities.DealReminderConfig.create({
          user_id: currentUser.email,
          reminder_type: type,
          ...config
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealReminderConfigs'] });
    }
  });

  const getConfigForType = (type) => {
    return reminderConfigs.find(r => r.reminder_type === type) || {
      is_active: false,
      days_before: 7,
      stale_days: 14,
      notify_email: true,
      notify_in_app: true
    };
  };

  const handleToggle = (type, field, value) => {
    const existing = getConfigForType(type);
    saveMutation.mutate({
      type,
      config: { ...existing, [field]: value }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-violet-500" />
          Deal Reminder Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {REMINDER_TYPES.map(({ type, label, description, icon: Icon, color }) => {
          const config = getConfigForType(type);
          
          return (
            <div key={type} className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{label}</h4>
                    <p className="text-sm text-slate-500">{description}</p>
                  </div>
                </div>
                <Switch
                  checked={config.is_active}
                  onCheckedChange={(checked) => handleToggle(type, 'is_active', checked)}
                />
              </div>

              {config.is_active && (
                <div className="ml-8 space-y-4 pt-3 border-t">
                  {/* Days Configuration */}
                  {type === 'close_date_approaching' && (
                    <div className="flex items-center gap-3">
                      <Label className="text-sm text-slate-600 dark:text-slate-400">
                        Remind me
                      </Label>
                      <Input
                        type="number"
                        value={config.days_before}
                        onChange={(e) => handleToggle(type, 'days_before', parseInt(e.target.value) || 7)}
                        className="w-16 h-8"
                        min={1}
                        max={30}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        days before close date
                      </span>
                    </div>
                  )}

                  {type === 'stale_deal' && (
                    <div className="flex items-center gap-3">
                      <Label className="text-sm text-slate-600 dark:text-slate-400">
                        Alert after
                      </Label>
                      <Input
                        type="number"
                        value={config.stale_days}
                        onChange={(e) => handleToggle(type, 'stale_days', parseInt(e.target.value) || 14)}
                        className="w-16 h-8"
                        min={1}
                        max={60}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        days without activity
                      </span>
                    </div>
                  )}

                  {/* Notification Channels */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.notify_in_app}
                        onCheckedChange={(checked) => handleToggle(type, 'notify_in_app', checked)}
                        id={`${type}-in-app`}
                      />
                      <Label htmlFor={`${type}-in-app`} className="flex items-center gap-1 text-sm">
                        <Bell className="w-3 h-3" />
                        In-App
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.notify_email}
                        onCheckedChange={(checked) => handleToggle(type, 'notify_email', checked)}
                        id={`${type}-email`}
                      />
                      <Label htmlFor={`${type}-email`} className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        Email
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <p className="text-xs text-slate-500">
            Reminders are checked daily and sent based on your preferences. You can also configure team-wide reminders in admin settings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}