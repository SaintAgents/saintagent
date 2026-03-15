import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingDown, Link2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SlippageConfigPanel({ projectId }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['alertConfig', projectId],
    queryFn: () => base44.entities.ProjectAlertConfig.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const config = configs[0];

  const [form, setForm] = React.useState(null);

  React.useEffect(() => {
    if (config) {
      setForm({
        slippage_threshold_days: config.slippage_threshold_days ?? 5,
        notify_project_owner: config.notify_project_owner ?? true,
        notify_team_members: config.notify_team_members ?? false,
        is_enabled: config.is_enabled ?? true,
      });
    } else if (!isLoading) {
      setForm({
        slippage_threshold_days: 5,
        notify_project_owner: true,
        notify_team_members: false,
        is_enabled: true,
      });
    }
  }, [config, isLoading]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      if (config) {
        await base44.entities.ProjectAlertConfig.update(config.id, form);
      } else {
        const user = await base44.auth.me();
        await base44.entities.ProjectAlertConfig.create({
          project_id: projectId,
          user_id: user.email,
          ...form,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['alertConfig', projectId] });
      toast.success('Slippage alert settings saved');
    } catch (e) {
      toast.error('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !form) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Slippage Alert Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Monitoring Enabled</Label>
          <Switch
            checked={form.is_enabled}
            onCheckedChange={(v) => setForm({ ...form, is_enabled: v })}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Slippage Threshold (days)
          </Label>
          <p className="text-[11px] text-slate-400">
            Alert when projected end date exceeds planned end date by this many days
          </p>
          <Input
            type="number"
            min={1}
            max={90}
            value={form.slippage_threshold_days}
            onChange={(e) => setForm({ ...form, slippage_threshold_days: parseInt(e.target.value) || 5 })}
            className="w-24"
          />
        </div>

        <div className="space-y-2 border-t pt-3">
          <Label className="text-xs text-slate-500">Notify</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm">Project Owner</span>
            <Switch
              checked={form.notify_project_owner}
              onCheckedChange={(v) => setForm({ ...form, notify_project_owner: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">All Team Members</span>
            <Switch
              checked={form.notify_team_members}
              onCheckedChange={(v) => setForm({ ...form, notify_team_members: v })}
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-medium text-slate-600">What gets monitored daily:</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] gap-1">
              <TrendingDown className="w-2.5 h-2.5" /> Velocity Trends
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Link2 className="w-2.5 h-2.5" /> Dependency Delays
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Clock className="w-2.5 h-2.5" /> End-Date Projection
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}