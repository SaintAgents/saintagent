import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info, PartyPopper, Bell, Save, Eye, EyeOff, Zap, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

const ALERT_TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: 'bg-blue-500' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500' },
  { value: 'critical', label: 'Critical', icon: AlertTriangle, color: 'bg-red-500' },
  { value: 'celebration', label: 'Celebration', icon: PartyPopper, color: 'bg-pink-500' },
];

export default function GlobalAlertManager() {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list('-updated_date', 1)
  });

  const setting = settings?.[0];

  const [form, setForm] = useState({
    global_alert_enabled: false,
    global_alert_title: '',
    global_alert_message: '',
    global_alert_type: 'info',
    global_alert_flash: false,
    global_alert_repeat: false,
    global_alert_dismissable: true
  });

  useEffect(() => {
    if (setting) {
      setForm({
        global_alert_enabled: setting.global_alert_enabled || false,
        global_alert_title: setting.global_alert_title || '',
        global_alert_message: setting.global_alert_message || '',
        global_alert_type: setting.global_alert_type || 'info',
        global_alert_flash: setting.global_alert_flash || false,
        global_alert_repeat: setting.global_alert_repeat || false,
        global_alert_dismissable: setting.global_alert_dismissable !== false
      });
    }
  }, [setting]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (setting?.id) {
        return base44.entities.PlatformSetting.update(setting.id, data);
      } else {
        return base44.entities.PlatformSetting.create({ key: 'main', ...data });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('Global alert settings saved');
    },
    onError: () => {
      toast.error('Failed to save settings');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const handleQuickDisable = () => {
    const updated = { ...form, global_alert_enabled: false };
    setForm(updated);
    saveMutation.mutate(updated);
  };

  const selectedType = ALERT_TYPES.find(t => t.value === form.global_alert_type);
  const TypeIcon = selectedType?.icon || Info;

  if (isLoading) {
    return <div className="p-4 text-center text-slate-500">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-500" />
            Global Alert Popup
          </CardTitle>
          <div className="flex items-center gap-2">
            {form.global_alert_enabled && (
              <Badge className="bg-green-500 text-white gap-1">
                <Eye className="w-3 h-3" /> Live
              </Badge>
            )}
            {!form.global_alert_enabled && (
              <Badge variant="outline" className="gap-1">
                <EyeOff className="w-3 h-3" /> Disabled
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Enable Global Alert</Label>
            <p className="text-sm text-slate-500">Show alert popup to all users</p>
          </div>
          <Switch
            checked={form.global_alert_enabled}
            onCheckedChange={(v) => setForm({ ...form, global_alert_enabled: v })}
          />
        </div>

        {/* Alert Type */}
        <div className="space-y-2">
          <Label>Alert Type</Label>
          <Select value={form.global_alert_type} onValueChange={(v) => setForm({ ...form, global_alert_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALERT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`} />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label>Alert Title</Label>
          <Input
            value={form.global_alert_title}
            onChange={(e) => setForm({ ...form, global_alert_title: e.target.value })}
            placeholder="Important Announcement"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label>Alert Message</Label>
          <Textarea
            value={form.global_alert_message}
            onChange={(e) => setForm({ ...form, global_alert_message: e.target.value })}
            placeholder="Enter your alert message here..."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-slate-500">{form.global_alert_message.length} characters</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <Label className="text-sm">Flash/Animate</Label>
            </div>
            <Switch
              checked={form.global_alert_flash}
              onCheckedChange={(v) => setForm({ ...form, global_alert_flash: v })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <Label className="text-sm">Repeat on Load</Label>
            </div>
            <Switch
              checked={form.global_alert_repeat}
              onCheckedChange={(v) => setForm({ ...form, global_alert_repeat: v })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-slate-500" />
              <Label className="text-sm">Dismissable</Label>
            </div>
            <Switch
              checked={form.global_alert_dismissable}
              onCheckedChange={(v) => setForm({ ...form, global_alert_dismissable: v })}
            />
          </div>
        </div>

        {/* Preview */}
        {form.global_alert_message && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className={`p-4 rounded-lg text-white ${selectedType?.color || 'bg-blue-500'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon className="w-5 h-5" />
                <span className="font-bold">{form.global_alert_title || 'Alert Title'}</span>
              </div>
              <p className="text-sm opacity-90 whitespace-pre-wrap line-clamp-3">{form.global_alert_message}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Alert Settings'}
          </Button>
          {form.global_alert_enabled && (
            <Button variant="outline" onClick={handleQuickDisable} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <EyeOff className="w-4 h-4" />
              Disable Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}