import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Coins, Award, Target, Volume2, VolumeX, Monitor, Save, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

const DEFAULTS = {
  live_toasts_enabled: true,
  live_toasts_show_ggg: true,
  live_toasts_show_badges: true,
  live_toasts_show_missions: true,
  live_toasts_duration_ms: 6000,
  live_toasts_cooldown_ms: 3000,
  live_toasts_max_visible: 3,
  live_toasts_position: 'top-right',
  live_toasts_include_self: false,
  live_toasts_min_ggg: 0,
  live_toasts_sound: false,
};

export default function LiveToastsAdmin() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULTS);

  const { data: settings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list('-updated_date', 1),
    staleTime: 60000,
  });

  const setting = settings?.[0];

  useEffect(() => {
    if (setting) {
      setForm({
        live_toasts_enabled: setting.live_toasts_enabled ?? DEFAULTS.live_toasts_enabled,
        live_toasts_show_ggg: setting.live_toasts_show_ggg ?? DEFAULTS.live_toasts_show_ggg,
        live_toasts_show_badges: setting.live_toasts_show_badges ?? DEFAULTS.live_toasts_show_badges,
        live_toasts_show_missions: setting.live_toasts_show_missions ?? DEFAULTS.live_toasts_show_missions,
        live_toasts_duration_ms: setting.live_toasts_duration_ms ?? DEFAULTS.live_toasts_duration_ms,
        live_toasts_cooldown_ms: setting.live_toasts_cooldown_ms ?? DEFAULTS.live_toasts_cooldown_ms,
        live_toasts_max_visible: setting.live_toasts_max_visible ?? DEFAULTS.live_toasts_max_visible,
        live_toasts_position: setting.live_toasts_position ?? DEFAULTS.live_toasts_position,
        live_toasts_include_self: setting.live_toasts_include_self ?? DEFAULTS.live_toasts_include_self,
        live_toasts_min_ggg: setting.live_toasts_min_ggg ?? DEFAULTS.live_toasts_min_ggg,
        live_toasts_sound: setting.live_toasts_sound ?? DEFAULTS.live_toasts_sound,
      });
    }
  }, [setting]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (setting?.id) {
        await base44.entities.PlatformSetting.update(setting.id, form);
      } else {
        await base44.entities.PlatformSetting.create(form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      queryClient.invalidateQueries({ queryKey: ['liveToastConfig'] });
      toast.success('Live toast settings saved');
    },
  });

  const sendTestToast = () => {
    window.dispatchEvent(new CustomEvent('testLiveToast', {
      detail: {
        type: 'ggg',
        title: 'TestAgent SA007 just earned GGG!',
        message: 'Completed a challenge',
        amount: 42,
      }
    }));
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Live Achievement Toasts
          </h2>
          <p className="text-sm text-slate-500">Configure the real-time achievement popups everyone sees</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={sendTestToast} className="gap-2">
            <Eye className="w-4 h-4" />
            Test Toast
          </Button>
          <Button variant="outline" size="sm" onClick={() => setForm(DEFAULTS)} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Master Switch */}
      <Card className={form.live_toasts_enabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${form.live_toasts_enabled ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <Zap className={`w-5 h-5 ${form.live_toasts_enabled ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Live Toasts {form.live_toasts_enabled ? 'Enabled' : 'Disabled'}</p>
              <p className="text-xs text-slate-500">Master switch — turns toasts on/off for all users</p>
            </div>
          </div>
          <Switch checked={form.live_toasts_enabled} onCheckedChange={(v) => update('live_toasts_enabled', v)} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Event Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <Label>GGG Earnings</Label>
              </div>
              <Switch checked={form.live_toasts_show_ggg} onCheckedChange={(v) => update('live_toasts_show_ggg', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-500" />
                <Label>Badge Earned</Label>
              </div>
              <Switch checked={form.live_toasts_show_badges} onCheckedChange={(v) => update('live_toasts_show_badges', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                <Label>Mission Completed</Label>
              </div>
              <Switch checked={form.live_toasts_show_missions} onCheckedChange={(v) => update('live_toasts_show_missions', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                <Label>Include Own Events</Label>
              </div>
              <Switch checked={form.live_toasts_include_self} onCheckedChange={(v) => update('live_toasts_include_self', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Timing & Display */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Timing & Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Toast Duration (ms)</Label>
              <Input type="number" min={2000} max={30000} step={1000}
                value={form.live_toasts_duration_ms}
                onChange={(e) => update('live_toasts_duration_ms', parseInt(e.target.value) || 6000)} />
              <p className="text-xs text-slate-400 mt-1">{(form.live_toasts_duration_ms / 1000).toFixed(1)}s per toast</p>
            </div>
            <div>
              <Label>Cooldown Between Toasts (ms)</Label>
              <Input type="number" min={1000} max={30000} step={500}
                value={form.live_toasts_cooldown_ms}
                onChange={(e) => update('live_toasts_cooldown_ms', parseInt(e.target.value) || 3000)} />
              <p className="text-xs text-slate-400 mt-1">{(form.live_toasts_cooldown_ms / 1000).toFixed(1)}s gap</p>
            </div>
            <div>
              <Label>Max Visible Toasts</Label>
              <Input type="number" min={1} max={10}
                value={form.live_toasts_max_visible}
                onChange={(e) => update('live_toasts_max_visible', parseInt(e.target.value) || 3)} />
            </div>
          </CardContent>
        </Card>

        {/* Position & Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Screen Position</Label>
              <Select value={form.live_toasts_position} onValueChange={(v) => update('live_toasts_position', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minimum GGG Amount</Label>
              <Input type="number" min={0} max={1000}
                value={form.live_toasts_min_ggg}
                onChange={(e) => update('live_toasts_min_ggg', parseInt(e.target.value) || 0)} />
              <p className="text-xs text-slate-400 mt-1">{form.live_toasts_min_ggg === 0 ? 'Show all GGG earnings' : `Only show ≥${form.live_toasts_min_ggg} GGG`}</p>
            </div>
          </CardContent>
        </Card>

        {/* Sound */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sound</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {form.live_toasts_sound ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <Label>Play Sound on Toast</Label>
              </div>
              <Switch checked={form.live_toasts_sound} onCheckedChange={(v) => update('live_toasts_sound', v)} />
            </div>
            <p className="text-xs text-slate-400 mt-2">A subtle chime when achievements pop up</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}