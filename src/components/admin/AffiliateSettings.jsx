import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Users, 
  Percent, 
  Gift, 
  TrendingUp, 
  Calendar,
  Zap,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  setting_key: 'global',
  program_enabled: true,
  base_commission_percent: 10,
  tier_1_commission: 10,
  tier_2_commission: 12,
  tier_3_commission: 15,
  tier_4_commission: 18,
  tier_5_commission: 20,
  tier_2_threshold: 10,
  tier_3_threshold: 25,
  tier_4_threshold: 50,
  tier_5_threshold: 100,
  signup_bonus_ggg: 0.25,
  attribution_window_days: 30,
  commission_duration_days: 365,
  promotion_active: false,
  promotion_multiplier: 1.5,
  promotion_name: ''
};

export default function AffiliateSettings() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch global settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['affiliateSettings'],
    queryFn: async () => {
      const settings = await base44.entities.AffiliateSetting.filter({ setting_key: 'global' });
      return settings[0] || null;
    }
  });

  // Fetch affiliate stats
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['allAffiliateCodes'],
    queryFn: () => base44.entities.AffiliateCode.list()
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['allReferrals'],
    queryFn: () => base44.entities.Referral.list()
  });

  useEffect(() => {
    if (settingsData) {
      setLocalSettings({ ...DEFAULT_SETTINGS, ...settingsData });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settingsData?.id) {
        return base44.entities.AffiliateSetting.update(settingsData.id, data);
      } else {
        return base44.entities.AffiliateSetting.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliateSettings'] });
      setHasChanges(false);
    }
  });

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(localSettings);
  };

  // Calculate stats
  const totalAffiliates = affiliateCodes.length;
  const activeAffiliates = affiliateCodes.filter(a => a.status === 'active').length;
  const totalReferrals = referrals.length;
  const activatedReferrals = referrals.filter(r => r.status === 'activated' || r.status === 'earning').length;
  const totalCommissionPaid = referrals.reduce((sum, r) => sum + (r.total_commission_earned || 0), 0);

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading affiliate settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            Affiliate Program Settings
          </h2>
          <p className="text-slate-500 mt-1">Configure commission rates, tiers, and promotions</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge className="bg-amber-100 text-amber-700">Unsaved changes</Badge>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saveMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{totalAffiliates}</p>
            <p className="text-xs text-slate-500">Total Affiliates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{activeAffiliates}</p>
            <p className="text-xs text-slate-500">Active Affiliates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{totalReferrals}</p>
            <p className="text-xs text-slate-500">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{activatedReferrals}</p>
            <p className="text-xs text-slate-500">Activated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Percent className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{totalCommissionPaid.toFixed(2)}</p>
            <p className="text-xs text-slate-500">GGG Paid Out</p>
          </CardContent>
        </Card>
      </div>

      {/* Program Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Program Status</CardTitle>
              <CardDescription>Enable or disable the affiliate program</CardDescription>
            </div>
            <Switch
              checked={localSettings.program_enabled}
              onCheckedChange={(v) => handleChange('program_enabled', v)}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Commission Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-violet-600" />
            Commission Tiers
          </CardTitle>
          <CardDescription>
            Affiliates earn a percentage of their referred users' GGG earnings. Higher tiers = higher commission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5].map(tier => (
            <div key={tier} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50">
              <div>
                <Label className="text-sm font-semibold">Tier {tier} Commission %</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider
                    value={[localSettings[`tier_${tier}_commission`]]}
                    onValueChange={([v]) => handleChange(`tier_${tier}_commission`, v)}
                    min={0}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-violet-600 w-12">
                    {localSettings[`tier_${tier}_commission`]}%
                  </span>
                </div>
              </div>
              {tier > 1 && (
                <div>
                  <Label className="text-sm font-semibold">Referrals Needed</Label>
                  <Input
                    type="number"
                    value={localSettings[`tier_${tier}_threshold`]}
                    onChange={(e) => handleChange(`tier_${tier}_threshold`, parseInt(e.target.value) || 0)}
                    className="mt-2"
                    min={1}
                  />
                </div>
              )}
              <div className="flex items-end">
                <Badge className={tier === 1 ? 'bg-slate-200 text-slate-700' : 'bg-violet-100 text-violet-700'}>
                  {tier === 1 ? 'Default' : `${localSettings[`tier_${tier}_threshold`]}+ referrals`}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bonus Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-600" />
            Bonus & Attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Signup Bonus (GGG)</Label>
              <Input
                type="number"
                step="0.01"
                value={localSettings.signup_bonus_ggg}
                onChange={(e) => handleChange('signup_bonus_ggg', parseFloat(e.target.value) || 0)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">One-time bonus per activated referral</p>
            </div>
            <div>
              <Label>Attribution Window (days)</Label>
              <Input
                type="number"
                value={localSettings.attribution_window_days}
                onChange={(e) => handleChange('attribution_window_days', parseInt(e.target.value) || 30)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Days after click referral is valid</p>
            </div>
            <div>
              <Label>Commission Duration (days)</Label>
              <Input
                type="number"
                value={localSettings.commission_duration_days}
                onChange={(e) => handleChange('commission_duration_days', parseInt(e.target.value) || 365)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">0 = lifetime commission</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Settings */}
      <Card className={localSettings.promotion_active ? 'border-2 border-amber-400 bg-amber-50/30' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Promotion Mode
                {localSettings.promotion_active && (
                  <Badge className="bg-amber-500 text-white animate-pulse">ACTIVE</Badge>
                )}
              </CardTitle>
              <CardDescription>Temporarily boost commission rates</CardDescription>
            </div>
            <Switch
              checked={localSettings.promotion_active}
              onCheckedChange={(v) => handleChange('promotion_active', v)}
            />
          </div>
        </CardHeader>
        {localSettings.promotion_active && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Promotion Name</Label>
                <Input
                  value={localSettings.promotion_name || ''}
                  onChange={(e) => handleChange('promotion_name', e.target.value)}
                  placeholder="e.g., Launch Week Bonus"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Commission Multiplier</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider
                    value={[localSettings.promotion_multiplier]}
                    onValueChange={([v]) => handleChange('promotion_multiplier', v)}
                    min={1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-amber-600 w-12">
                    {localSettings.promotion_multiplier}x
                  </span>
                </div>
              </div>
            </div>
            <div>
              <Label>Promotion End Date</Label>
              <Input
                type="datetime-local"
                value={localSettings.promotion_end_date?.slice(0, 16) || ''}
                onChange={(e) => handleChange('promotion_end_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-2 max-w-xs"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}