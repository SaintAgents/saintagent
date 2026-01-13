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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  Percent, 
  Gift, 
  TrendingUp, 
  Zap,
  Save,
  HelpCircle,
  Coins,
  Star,
  ChevronRight,
  X,
  Edit2,
  Shield
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
  promotion_name: '',
  ggg_multiplier_enabled: true,
  ggg_multiplier_tier_1_threshold: 10,
  ggg_multiplier_tier_1_value: 2,
  ggg_multiplier_tier_2_threshold: 50,
  ggg_multiplier_tier_2_value: 3,
  ggg_multiplier_tier_3_threshold: 100,
  ggg_multiplier_tier_3_value: 4,
  rp_multiplier_enabled: true,
  rp_multiplier_tier_1_threshold: 10,
  rp_multiplier_tier_1_value: 2,
  rp_multiplier_tier_2_threshold: 50,
  rp_multiplier_tier_2_value: 3,
  rp_multiplier_tier_3_threshold: 100,
  rp_multiplier_tier_3_value: 4
};

function AffiliateHelpTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 p-1 rounded-full hover:bg-violet-100 transition-colors">
            <HelpCircle className="w-5 h-5 text-violet-500" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm p-4 bg-slate-900 text-white border-violet-500/30">
          <h4 className="font-bold text-amber-400 mb-2">🚀 The Power of Affiliate Marketing</h4>
          <p className="text-sm text-slate-200 mb-3">
            The affiliate program is a powerful growth engine that rewards members for expanding our community:
          </p>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <Coins className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span><strong>Commission Earnings:</strong> Earn a percentage of all GGG your referrals earn - forever!</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span><strong>GGG Multiplier:</strong> Bring 10 people = 2x earnings. 50 people = 3x. Network effect!</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
              <span><strong>RP Multiplier:</strong> Same tiers apply to Reputation Points - rise faster in rank!</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <span><strong>Tier System:</strong> More referrals = higher commission rates (10% → 20%)</span>
            </li>
          </ul>
          <p className="text-xs text-amber-300 mt-3 font-medium">
            💡 Top affiliates can earn passive income while helping build the 144,000!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ReferredUsersList({ affiliateUserId, onClose }) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  
  const { data: referrals = [] } = useQuery({
    queryKey: ['affiliateReferrals', affiliateUserId],
    queryFn: () => base44.entities.Referral.filter({ affiliate_user_id: affiliateUserId }, '-created_date'),
    enabled: !!affiliateUserId
  });

  const { data: referredProfiles = [] } = useQuery({
    queryKey: ['referredProfiles', referrals.map(r => r.referred_user_id)],
    queryFn: async () => {
      if (referrals.length === 0) return [];
      const profiles = await Promise.all(
        referrals.map(r => base44.entities.UserProfile.filter({ user_id: r.referred_user_id }))
      );
      return profiles.flat();
    },
    enabled: referrals.length > 0
  });

  const updateReferralMutation = useMutation({
    mutationFn: async ({ referralId, data }) => {
      return base44.entities.Referral.update(referralId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliateReferrals'] });
      setSelectedUser(null);
    }
  });

  const updateUserMultiplierMutation = useMutation({
    mutationFn: async ({ profileId, data }) => {
      return base44.entities.UserProfile.update(profileId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referredProfiles'] });
      setSelectedUser(null);
    }
  });

  const getProfileForReferral = (referral) => {
    return referredProfiles.find(p => p.user_id === referral.referred_user_id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Referred Users ({referrals.length})</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {referrals.map(referral => {
            const profile = getProfileForReferral(referral);
            return (
              <div 
                key={referral.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.display_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">{profile?.display_name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>SA#{profile?.sa_number || '---'}</span>
                      <Badge className={
                        referral.status === 'earning' ? 'bg-emerald-100 text-emerald-700' :
                        referral.status === 'activated' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }>
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-slate-500">Earned</p>
                    <p className="font-semibold text-amber-600">{(referral.total_referred_earnings || 0).toFixed(2)} GGG</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-500">Commission</p>
                    <p className="font-semibold text-violet-600">{(referral.total_commission_earned || 0).toFixed(2)} GGG</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedUser({ referral, profile })}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {referrals.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No referrals yet
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Referral</DialogTitle>
            <DialogDescription>
              Adjust referral status and user multipliers
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedUser.profile?.avatar_url} />
                  <AvatarFallback>{selectedUser.profile?.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.profile?.display_name}</p>
                  <p className="text-sm text-slate-500">SA#{selectedUser.profile?.sa_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Referral Status</Label>
                  <select
                    className="w-full mt-2 p-2 border rounded-lg"
                    value={selectedUser.referral.status}
                    onChange={(e) => updateReferralMutation.mutate({
                      referralId: selectedUser.referral.id,
                      data: { status: e.target.value }
                    })}
                  >
                    <option value="pending">Pending</option>
                    <option value="activated">Activated</option>
                    <option value="earning">Earning</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <Label>Commission %</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    value={selectedUser.referral.commission_percent || 10}
                    onChange={(e) => updateReferralMutation.mutate({
                      referralId: selectedUser.referral.id,
                      data: { commission_percent: parseFloat(e.target.value) || 10 }
                    })}
                  />
                </div>
              </div>

              {selectedUser.profile && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-violet-600" />
                      User Multipliers (Override)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>GGG Multiplier</Label>
                        <Input
                          type="number"
                          step="0.5"
                          className="mt-2"
                          value={selectedUser.profile.ggg_multiplier || 1}
                          onChange={(e) => updateUserMultiplierMutation.mutate({
                            profileId: selectedUser.profile.id,
                            data: { ggg_multiplier: parseFloat(e.target.value) || 1 }
                          })}
                        />
                      </div>
                      <div>
                        <Label>RP Multiplier</Label>
                        <Input
                          type="number"
                          step="0.5"
                          className="mt-2"
                          value={selectedUser.profile.rp_multiplier || 1}
                          onChange={(e) => updateUserMultiplierMutation.mutate({
                            profileId: selectedUser.profile.id,
                            data: { rp_multiplier: parseFloat(e.target.value) || 1 }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AffiliateSettings() {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['affiliateSettings'],
    queryFn: async () => {
      const settings = await base44.entities.AffiliateSetting.filter({ setting_key: 'global' });
      return settings[0] || null;
    }
  });

  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['allAffiliateCodes'],
    queryFn: () => base44.entities.AffiliateCode.list()
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['allReferrals'],
    queryFn: () => base44.entities.Referral.list()
  });

  const { data: affiliateProfiles = [] } = useQuery({
    queryKey: ['affiliateProfiles'],
    queryFn: async () => {
      if (affiliateCodes.length === 0) return [];
      const profiles = await Promise.all(
        affiliateCodes.map(a => base44.entities.UserProfile.filter({ user_id: a.user_id }))
      );
      return profiles.flat();
    },
    enabled: affiliateCodes.length > 0
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

  const getProfileForAffiliate = (affiliate) => {
    return affiliateProfiles.find(p => p.user_id === affiliate.user_id);
  };

  const getReferralCountForAffiliate = (affiliate) => {
    return referrals.filter(r => r.affiliate_user_id === affiliate.user_id && (r.status === 'activated' || r.status === 'earning')).length;
  };

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
        <div className="flex items-center">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            Affiliate Program Settings
          </h2>
          <AffiliateHelpTooltip />
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

      {/* Affiliates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            All Affiliates
          </CardTitle>
          <CardDescription>Click on an affiliate to view and manage their referred users</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {affiliateCodes.map(affiliate => {
                const profile = getProfileForAffiliate(affiliate);
                const refCount = getReferralCountForAffiliate(affiliate);
                return (
                  <div 
                    key={affiliate.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedAffiliate(affiliate)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>{profile?.display_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{profile?.display_name || affiliate.code}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>SA#{affiliate.sa_number || affiliate.code}</span>
                          <Badge className={affiliate.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                            {affiliate.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-violet-600">{refCount} referrals</p>
                        <p className="text-xs text-slate-500">{(affiliate.total_ggg_earned || 0).toFixed(2)} GGG earned</p>
                      </div>
                      {profile?.ggg_multiplier > 1 && (
                        <Badge className="bg-amber-100 text-amber-700">{profile.ggg_multiplier}x GGG</Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
              {affiliateCodes.length === 0 && (
                <div className="text-center py-8 text-slate-500">No affiliates yet</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selected Affiliate's Referrals */}
      {selectedAffiliate && (
        <Card className="border-2 border-violet-200">
          <CardContent className="pt-6">
            <ReferredUsersList 
              affiliateUserId={selectedAffiliate.user_id} 
              onClose={() => setSelectedAffiliate(null)}
            />
          </CardContent>
        </Card>
      )}

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

      {/* GGG Multiplier Tiers */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                GGG Earning Multiplier Tiers
                <AffiliateHelpTooltip />
              </CardTitle>
              <CardDescription>
                Affiliates earn multiplied GGG on ALL platform activities based on referral count
              </CardDescription>
            </div>
            <Switch
              checked={localSettings.ggg_multiplier_enabled}
              onCheckedChange={(v) => handleChange('ggg_multiplier_enabled', v)}
            />
          </div>
        </CardHeader>
        {localSettings.ggg_multiplier_enabled && (
          <CardContent className="space-y-4">
            {[1, 2, 3].map(tier => (
              <div key={tier} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-white/60">
                <div>
                  <Label className="text-sm font-semibold">Tier {tier}: Referrals Needed</Label>
                  <Input
                    type="number"
                    value={localSettings[`ggg_multiplier_tier_${tier}_threshold`]}
                    onChange={(e) => handleChange(`ggg_multiplier_tier_${tier}_threshold`, parseInt(e.target.value) || 10)}
                    className="mt-2"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">GGG Multiplier</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider
                      value={[localSettings[`ggg_multiplier_tier_${tier}_value`]]}
                      onValueChange={([v]) => handleChange(`ggg_multiplier_tier_${tier}_value`, v)}
                      min={1}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-amber-600 w-12">
                      {localSettings[`ggg_multiplier_tier_${tier}_value`]}x
                    </span>
                  </div>
                </div>
                <div className="flex items-end">
                  <Badge className="bg-amber-100 text-amber-700">
                    {localSettings[`ggg_multiplier_tier_${tier}_threshold`]}+ referrals = {localSettings[`ggg_multiplier_tier_${tier}_value`]}x GGG
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* RP Multiplier Tiers */}
      <Card className="border-2 border-violet-200 bg-violet-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-violet-600" />
                RP (Reputation) Multiplier Tiers
              </CardTitle>
              <CardDescription>
                Affiliates earn multiplied RP on ALL platform activities based on referral count
              </CardDescription>
            </div>
            <Switch
              checked={localSettings.rp_multiplier_enabled}
              onCheckedChange={(v) => handleChange('rp_multiplier_enabled', v)}
            />
          </div>
        </CardHeader>
        {localSettings.rp_multiplier_enabled && (
          <CardContent className="space-y-4">
            {[1, 2, 3].map(tier => (
              <div key={tier} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-white/60">
                <div>
                  <Label className="text-sm font-semibold">Tier {tier}: Referrals Needed</Label>
                  <Input
                    type="number"
                    value={localSettings[`rp_multiplier_tier_${tier}_threshold`]}
                    onChange={(e) => handleChange(`rp_multiplier_tier_${tier}_threshold`, parseInt(e.target.value) || 10)}
                    className="mt-2"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">RP Multiplier</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider
                      value={[localSettings[`rp_multiplier_tier_${tier}_value`]]}
                      onValueChange={([v]) => handleChange(`rp_multiplier_tier_${tier}_value`, v)}
                      min={1}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-violet-600 w-12">
                      {localSettings[`rp_multiplier_tier_${tier}_value`]}x
                    </span>
                  </div>
                </div>
                <div className="flex items-end">
                  <Badge className="bg-violet-100 text-violet-700">
                    {localSettings[`rp_multiplier_tier_${tier}_threshold`]}+ referrals = {localSettings[`rp_multiplier_tier_${tier}_value`]}x RP
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        )}
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