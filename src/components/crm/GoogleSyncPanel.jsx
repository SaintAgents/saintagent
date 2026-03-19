import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Calendar, RefreshCw, Loader2, CheckCircle, 
  Clock, AlertCircle, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function GoogleSyncPanel({ contacts }) {
  const queryClient = useQueryClient();

  const { data: syncStates = [] } = useQuery({
    queryKey: ['syncStates'],
    queryFn: () => base44.entities.SyncState.list('-updated_date', 10)
  });

  const { data: recentInteractions = [] } = useQuery({
    queryKey: ['recentInteractions'],
    queryFn: () => base44.entities.ContactInteraction.list('-occurred_at', 50)
  });

  const gmailState = syncStates.find(s => s.sync_type === 'gmail');
  const calendarState = syncStates.find(s => s.sync_type === 'google_calendar');

  const syncMutation = useMutation({
    mutationFn: async (syncType) => {
      const res = await base44.functions.invoke('manualGoogleSync', { sync_type: syncType });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['syncStates'] });
      queryClient.invalidateQueries({ queryKey: ['recentInteractions'] });
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      const gmail = data.results?.gmail;
      const cal = data.results?.calendar;
      const parts = [];
      if (gmail && !gmail.error) parts.push(`Gmail: ${gmail.matched} matched of ${gmail.total}`);
      if (cal && !cal.error) parts.push(`Calendar: ${cal.matched} matched of ${cal.total}`);
      toast.success(parts.join(' | ') || 'Sync complete');
    },
    onError: (err) => {
      toast.error('Sync failed: ' + err.message);
    }
  });

  const emailInteractions = recentInteractions.filter(i => i.source === 'gmail');
  const calInteractions = recentInteractions.filter(i => i.source === 'google_calendar');

  return (
    <div className="space-y-6">
      {/* Sync Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Gmail Sync</p>
                  <p className="text-xs text-blue-600">Sent emails → contact history</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Zap className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
            {gmailState?.last_synced_at && (
              <p className="text-xs text-blue-500 mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last synced: {format(new Date(gmailState.last_synced_at), 'MMM d, h:mm a')}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => syncMutation.mutate('gmail')}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Calendar Sync</p>
                  <p className="text-xs text-emerald-600">Meetings → contact history</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Zap className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
            {calendarState?.last_synced_at && (
              <p className="text-xs text-emerald-500 mb-3 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last synced: {format(new Date(calendarState.last_synced_at), 'MMM d, h:mm a')}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              onClick={() => syncMutation.mutate('calendar')}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-violet-900">Sync All</p>
                  <p className="text-xs text-violet-600">Gmail + Calendar at once</p>
                </div>
              </div>
            </div>
            <div className="text-xs text-violet-500 mb-3">
              <p><span className="font-medium">{emailInteractions.length}</span> emails captured</p>
              <p><span className="font-medium">{calInteractions.length}</span> meetings captured</p>
            </div>
            <Button
              size="sm"
              className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
              onClick={() => syncMutation.mutate('all')}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync Everything
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Auto-Captured Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentInteractions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Mail className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No interactions captured yet</p>
              <p className="text-xs mt-1">Run a sync to pull in recent emails and meetings</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentInteractions.map(interaction => (
                <div key={interaction.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                  <div className={`p-1.5 rounded-lg ${
                    interaction.interaction_type === 'email_sent' ? 'bg-blue-100' : 
                    interaction.interaction_type === 'meeting' ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {interaction.interaction_type === 'email_sent' ? (
                      <Mail className="w-4 h-4 text-blue-600" />
                    ) : interaction.interaction_type === 'meeting' ? (
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{interaction.subject}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {interaction.source === 'gmail' ? 'Gmail' : 'Calendar'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {interaction.contact_name || interaction.contact_email}
                    </p>
                    {interaction.occurred_at && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {format(new Date(interaction.occurred_at), 'MMM d, yyyy h:mm a')}
                        {interaction.duration_minutes > 0 && ` · ${interaction.duration_minutes}min`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}