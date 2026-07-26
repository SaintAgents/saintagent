import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Radio, Plus, Play, Pause, Trash2, Calendar, Clock, Users, Video, Mic, ExternalLink, Eye, Zap
} from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";
import { Link } from 'react-router-dom';
import CreateBroadcastModal from '@/components/broadcast/CreateBroadcastModal';

const TYPE_COLORS = {
  podcast: 'bg-violet-100 text-violet-700',
  webinar: 'bg-blue-100 text-blue-700',
  town_hall: 'bg-amber-100 text-amber-700',
  interview: 'bg-emerald-100 text-emerald-700',
  workshop: 'bg-pink-100 text-pink-700',
  ama: 'bg-cyan-100 text-cyan-700'
};

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700',
  ended: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-rose-100 text-rose-600'
};

export default function AdminBroadcastTab() {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: settingsList = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
    staleTime: 30000,
  });
  const platformSetting = settingsList[0];
  const broadcastsEnabled = platformSetting?.broadcasts_enabled !== false;

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['adminBroadcasts'],
    queryFn: () => base44.entities.Broadcast.list('-scheduled_time', 200)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Broadcast.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Broadcast.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] })
  });

  const now = new Date();
  const live = broadcasts.filter(b => b.status === 'live');
  const upcoming = broadcasts.filter(b => b.status === 'scheduled' && b.scheduled_time && isAfter(parseISO(b.scheduled_time), now));
  const past = broadcasts.filter(b => b.status === 'ended' || b.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Broadcast Management</h2>
          <p className="text-slate-500 mt-1">Create, manage, and control live broadcasts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/Broadcast">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              View Page
            </Button>
          </Link>
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Schedule Broadcast
          </Button>
        </div>
      </div>

      {/* Live Broadcast Banner Kill Switch */}
      <Card className={`border-2 ${broadcastsEnabled ? 'border-emerald-400 bg-emerald-50/50' : 'border-red-400 bg-red-50/50'}`}>
        <CardContent className="flex items-center justify-between py-5 px-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${broadcastsEnabled ? 'bg-emerald-100' : 'bg-red-100'}`}>
              <Zap className={`w-5 h-5 ${broadcastsEnabled ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Live Broadcast Banner — Kill Switch</p>
              <p className="text-xs text-slate-500">Toggle the red LIVE pill in the top bar on/off globally</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${broadcastsEnabled ? 'text-emerald-700' : 'text-red-700'}`}>
              {broadcastsEnabled ? 'ON' : 'OFF'}
            </span>
            <Switch checked={broadcastsEnabled} onCheckedChange={(v) => {
              if (platformSetting?.id) {
                base44.entities.PlatformSetting.update(platformSetting.id, { broadcasts_enabled: v })
                  .then(() => queryClient.invalidateQueries({ queryKey: ['platformSettings'] }));
              }
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><Radio className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{live.length}</p><p className="text-sm text-slate-500">Live Now</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><Calendar className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{upcoming.length}</p><p className="text-sm text-slate-500">Upcoming</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100"><Video className="w-5 h-5 text-slate-600" /></div>
            <div><p className="text-2xl font-bold">{past.length}</p><p className="text-sm text-slate-500">Past</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100"><Users className="w-5 h-5 text-violet-600" /></div>
            <div><p className="text-2xl font-bold">{broadcasts.reduce((sum, b) => sum + (b.going_count || 0), 0)}</p><p className="text-sm text-slate-500">Total RSVPs</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcasts List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : broadcasts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-900">No broadcasts yet</p>
            <p className="text-slate-500 mt-1">Schedule your first broadcast to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {broadcasts.map(b => (
            <Card key={b.id} className={cn(b.status === 'live' && "ring-2 ring-red-400")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-900 truncate">{b.title}</h3>
                      <Badge className={cn("text-xs", STATUS_COLORS[b.status])}>{b.status}</Badge>
                      <Badge className={cn("text-xs", TYPE_COLORS[b.broadcast_type])}>{b.broadcast_type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {b.host_name && <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5" />{b.host_name}</span>}
                      {b.scheduled_time && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(parseISO(b.scheduled_time), 'MMM d, yyyy h:mm a')}</span>}
                      {b.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.duration_minutes}m</span>}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(b.going_count || 0)} going · {(b.interested_count || 0)} interested</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {b.status === 'scheduled' && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateMutation.mutate({ id: b.id, data: { status: 'live' } })}>
                        <Play className="w-3.5 h-3.5" /> Go Live
                      </Button>
                    )}
                    {b.status === 'live' && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-slate-600" onClick={() => updateMutation.mutate({ id: b.id, data: { status: 'ended' } })}>
                        <Pause className="w-3.5 h-3.5" /> End
                      </Button>
                    )}
                    {b.live_stream_url && (
                      <Button size="sm" variant="ghost" onClick={() => window.open(b.live_stream_url, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => { if (confirm('Delete this broadcast?')) deleteMutation.mutate(b.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateBroadcastModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}