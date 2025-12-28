import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function PlatformSettings() {
  const qc = useQueryClient();

  const { data: settingsList = [], isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
  });
  const current = settingsList[0];

  const [form, setForm] = React.useState({
    site_name: 'Saint Agents',
    support_email: 'support@saintagents.app',
    terms_url: '',
    faq_url: '',
    logo_url: '',
    branding_primary_color: '#6d28d9',
    announcement_banner: '',
    maintenance_mode: false,
    referrals_enabled: true,
    marketplace_enabled: true,
    messages_enabled: true,
    synchronicity_engine_enabled: true,
  });

  React.useEffect(() => {
    if (current) setForm({ ...form, ...current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (current?.id) return base44.entities.PlatformSetting.update(current.id, payload);
      return base44.entities.PlatformSetting.create(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platformSettings'] })
  });

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => saveMutation.mutate(form);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Platform Settings</h2>
        <p className="text-sm text-slate-600">Configure global platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input value={form.site_name} onChange={(e) => handleChange('site_name', e.target.value)} />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={(e) => handleChange('logo_url', e.target.value)} />
            </div>
            <div>
              <Label>Primary Color</Label>
              <Input value={form.branding_primary_color} onChange={(e) => handleChange('branding_primary_color', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links & Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Support Email</Label>
              <Input value={form.support_email} onChange={(e) => handleChange('support_email', e.target.value)} />
            </div>
            <div>
              <Label>Terms URL</Label>
              <Input value={form.terms_url} onChange={(e) => handleChange('terms_url', e.target.value)} />
            </div>
            <div>
              <Label>FAQ URL</Label>
              <Input value={form.faq_url} onChange={(e) => handleChange('faq_url', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow label="Referrals Enabled" value={form.referrals_enabled} onChange={(v) => handleChange('referrals_enabled', v)} />
            <ToggleRow label="Marketplace Enabled" value={form.marketplace_enabled} onChange={(v) => handleChange('marketplace_enabled', v)} />
            <ToggleRow label="Messaging Enabled" value={form.messages_enabled} onChange={(v) => handleChange('messages_enabled', v)} />
            <ToggleRow label="Synchronicity Engine Enabled" value={form.synchronicity_engine_enabled} onChange={(v) => handleChange('synchronicity_engine_enabled', v)} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Announcement Banner</Label>
              <Input value={form.announcement_banner} onChange={(e) => handleChange('announcement_banner', e.target.value)} placeholder="Optional announcement shown across the app" />
            </div>
            <ToggleRow label="Maintenance Mode" value={form.maintenance_mode} onChange={(v) => handleChange('maintenance_mode', v)} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700" disabled={isLoading || saveMutation.isPending}>
          {current ? 'Save Changes' : 'Create Settings'}
        </Button>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
      <div className="text-sm text-slate-800">{label}</div>
      <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
  );
}