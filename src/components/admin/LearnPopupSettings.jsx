import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Save, Loader2, Coins, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const SETTING_KEY = 'learn_popup_config';

const FREQUENCY_OPTIONS = [
  { value: 'every_visit', label: 'Every Visit', description: 'Shows on each page load (with 5s delay)' },
  { value: 'once_per_hour', label: 'Once Per Hour', description: 'Maximum once every 60 minutes' },
  { value: 'once_per_day', label: 'Once Per Day', description: 'Maximum once every 24 hours' },
  { value: 'three_per_week', label: '3 Times Per Week', description: 'Maximum 3 times in 7 days' },
  { value: 'once_per_week', label: 'Once Per Week', description: 'Maximum once every 7 days' },
  { value: 'three_per_month', label: '3 Times Per Month', description: 'Maximum 3 times in 30 days' },
  { value: 'once_per_month', label: 'Once Per Month', description: 'Maximum once every 30 days' },
];

const DEFAULT_CONFIG = {
  enabled: true,
  frequency: 'once_per_day',
  reward_amount: 0.20,
  delay_seconds: 5,
  max_tutorials_shown: 3,
};

export default function LearnPopupSettings() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['platformSetting', SETTING_KEY],
    queryFn: () => base44.entities.PlatformSetting.filter({ key: SETTING_KEY }),
    staleTime: 60000,
  });

  const existingRecord = settings[0];

  useEffect(() => {
    if (existingRecord?.value) {
      try {
        const parsed = JSON.parse(existingRecord.value);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch {}
    }
  }, [existingRecord]);

  const handleSave = async () => {
    setSaving(true);
    const value = JSON.stringify(config);
    if (existingRecord) {
      await base44.entities.PlatformSetting.update(existingRecord.id, { value });
    } else {
      await base44.entities.PlatformSetting.create({ key: SETTING_KEY, value });
    }
    queryClient.invalidateQueries({ queryKey: ['platformSetting', SETTING_KEY] });
    toast.success('Learn popup settings saved');
    setSaving(false);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <GraduationCap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Learn & Earn Popup</h2>
            <p className="text-sm text-slate-500">Control the tutorial popup frequency and rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enable/Disable */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Global Toggle</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Popup Enabled</Label>
              <p className="text-xs text-slate-500 mt-0.5">When disabled, the popup won't show for any user</p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
          <Badge className={config.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
            {config.enabled ? 'Active' : 'Disabled'}
          </Badge>
        </div>

        {/* Frequency */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Show Frequency
          </h3>
          <Select
            value={config.frequency}
            onValueChange={(v) => setConfig(prev => ({ ...prev, frequency: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div>
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-slate-400 ml-2">— {opt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            This controls how often the popup appears for each user (users can still permanently hide it)
          </p>
        </div>

        {/* Reward Amount */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            GGG Reward Per Tutorial
          </h3>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={config.reward_amount}
              onChange={(e) => setConfig(prev => ({ ...prev, reward_amount: parseFloat(e.target.value) || 0 }))}
              className="w-32"
            />
            <span className="text-sm text-slate-500 font-medium">GGG</span>
          </div>
          <p className="text-xs text-slate-400">
            Amount of GGG awarded when a user completes a tutorial. Currently 6 tutorials available = max {(config.reward_amount * 6).toFixed(2)} GGG total per user.
          </p>
        </div>

        {/* Popup Delay */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Popup Delay</h3>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              max="60"
              value={config.delay_seconds}
              onChange={(e) => setConfig(prev => ({ ...prev, delay_seconds: parseInt(e.target.value) || 5 }))}
              className="w-32"
            />
            <span className="text-sm text-slate-500 font-medium">seconds</span>
          </div>
          <p className="text-xs text-slate-400">
            How many seconds after page load before the popup appears
          </p>
        </div>

        {/* Max tutorials shown */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Tutorials Shown Per Visit</h3>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              max="6"
              value={config.max_tutorials_shown}
              onChange={(e) => setConfig(prev => ({ ...prev, max_tutorials_shown: parseInt(e.target.value) || 3 }))}
              className="w-32"
            />
            <span className="text-sm text-slate-500 font-medium">tutorials visible in the popup</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="p-5 rounded-xl border border-amber-200 bg-amber-50 space-y-2">
        <h3 className="text-sm font-bold text-amber-800">Current Configuration Summary</h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• Popup is <strong>{config.enabled ? 'enabled' : 'disabled'}</strong></li>
          <li>• Shows <strong>{FREQUENCY_OPTIONS.find(o => o.value === config.frequency)?.label || config.frequency}</strong></li>
          <li>• Rewards <strong>{config.reward_amount} GGG</strong> per completed tutorial</li>
          <li>• Appears after <strong>{config.delay_seconds}s</strong> delay</li>
          <li>• Shows <strong>{config.max_tutorials_shown}</strong> tutorials per popup</li>
        </ul>
      </div>
    </div>
  );
}