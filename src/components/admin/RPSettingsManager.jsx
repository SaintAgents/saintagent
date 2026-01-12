import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  Settings, 
  Save, 
  RefreshCw, 
  Crown, 
  Zap, 
  Target,
  Calendar,
  Shield,
  AlertTriangle,
  Search,
  UserCog
} from "lucide-react";
import { toast } from "sonner";

// Default rank thresholds
const DEFAULT_RANK_THRESHOLDS = [
  { code: 'seeker', name: 'Seeker', minRP: 0, color: '#6b7280' },
  { code: 'initiate', name: 'Initiate', minRP: 100, color: '#60a5fa' },
  { code: 'adept', name: 'Adept', minRP: 500, color: '#34d399' },
  { code: 'practitioner', name: 'Practitioner', minRP: 1500, color: '#10b981' },
  { code: 'master', name: 'Master', minRP: 5000, color: '#f59e0b' },
  { code: 'sage', name: 'Sage', minRP: 15000, color: '#8b5cf6' },
  { code: 'oracle', name: 'Oracle', minRP: 50000, color: '#6366f1' },
  { code: 'ascended', name: 'Ascended', minRP: 150000, color: '#fef3c7' },
  { code: 'guardian', name: 'Guardian', minRP: 500000, color: '#f59e0b' },
];

// Default RP earning rules by activity
const DEFAULT_RP_RULES = [
  { action: 'meeting_completed', label: 'Meeting Completed', rp: 50, category: 'engagement' },
  { action: 'booking_completed', label: 'Booking Completed', rp: 75, category: 'marketplace' },
  { action: 'mission_completed', label: 'Mission Completed', rp: 100, category: 'mission' },
  { action: 'quest_completion', label: 'Quest Completion', rp: 150, category: 'mission' },
  { action: 'event_attended', label: 'Event Attended', rp: 30, category: 'engagement' },
  { action: 'referral_activated', label: 'Referral Activated', rp: 200, category: 'engagement' },
  { action: 'testimonial_given', label: 'Testimonial Given', rp: 25, category: 'engagement' },
  { action: 'post_created', label: 'Post Created', rp: 10, category: 'content' },
  { action: 'profile_completed', label: 'Profile Completed', rp: 100, category: 'profile' },
  { action: 'daily_checkin', label: 'Daily Check-in', rp: 5, category: 'engagement' },
  { action: 'forum_post', label: 'Forum Post', rp: 15, category: 'content' },
  { action: 'mentor_session', label: 'Mentor Session', rp: 75, category: 'leadership' },
  { action: 'team_collaboration', label: 'Team Collaboration', rp: 40, category: 'mission' },
  { action: 'badge_earned', label: 'Badge Earned (base)', rp: 25, category: 'achievement' },
];

export default function RPSettingsManager() {
  const [rankThresholds, setRankThresholds] = useState(DEFAULT_RANK_THRESHOLDS);
  const [rpRules, setRpRules] = useState(DEFAULT_RP_RULES);
  const [globalMultiplier, setGlobalMultiplier] = useState(1.0);
  const [doubleRPEnabled, setDoubleRPEnabled] = useState(false);
  const [dailyCap, setDailyCap] = useState(500);
  const [weeklyCap, setWeeklyCap] = useState(2500);
  const [decayEnabled, setDecayEnabled] = useState(false);
  const [decayRate, setDecayRate] = useState(5);
  const [decayThreshold, setDecayThreshold] = useState('master');
  const [searchUser, setSearchUser] = useState('');
  const [manualRP, setManualRP] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleRankThresholdChange = (index, value) => {
    const updated = [...rankThresholds];
    updated[index].minRP = parseInt(value) || 0;
    setRankThresholds(updated);
  };

  const handleRPRuleChange = (index, value) => {
    const updated = [...rpRules];
    updated[index].rp = parseInt(value) || 0;
    setRpRules(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, save to PlatformSetting entity
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('RP settings saved successfully');
    setSaving(false);
  };

  const handleManualRPGrant = () => {
    if (!searchUser || manualRP === 0) {
      toast.error('Please enter a user email and RP amount');
      return;
    }
    toast.success(`Granted ${manualRP} RP to ${searchUser}`);
    setSearchUser('');
    setManualRP(0);
  };

  const categoryColors = {
    engagement: 'bg-blue-100 text-blue-700',
    marketplace: 'bg-green-100 text-green-700',
    mission: 'bg-purple-100 text-purple-700',
    content: 'bg-orange-100 text-orange-700',
    profile: 'bg-pink-100 text-pink-700',
    leadership: 'bg-amber-100 text-amber-700',
    achievement: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="thresholds" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="thresholds" className="gap-2">
            <Crown className="w-4 h-4" />
            Rank Thresholds
          </TabsTrigger>
          <TabsTrigger value="earning" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Earning Rules
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-2">
            <Settings className="w-4 h-4" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <UserCog className="w-4 h-4" />
            Manual Adjust
          </TabsTrigger>
        </TabsList>

        {/* Rank Thresholds Tab */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Rank Thresholds
              </CardTitle>
              <CardDescription>
                Configure the RP required to reach each rank tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rankThresholds.map((rank, index) => (
                  <div key={rank.code} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: rank.color }}
                    />
                    <div className="w-32 font-medium">{rank.name}</div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={rank.minRP}
                        onChange={(e) => handleRankThresholdChange(index, e.target.value)}
                        className="w-32"
                        disabled={index === 0}
                      />
                    </div>
                    <div className="text-sm text-slate-500">
                      {index < rankThresholds.length - 1 
                        ? `${rank.minRP.toLocaleString()} - ${(rankThresholds[index + 1].minRP - 1).toLocaleString()} RP`
                        : `${rank.minRP.toLocaleString()}+ RP`
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Earning Rules Tab */}
        <TabsContent value="earning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                RP Earning Rules
              </CardTitle>
              <CardDescription>
                Configure how much RP is awarded for each activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid gap-3">
                  {rpRules.map((rule, index) => (
                    <div key={rule.action} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border">
                      <Badge className={categoryColors[rule.category]}>
                        {rule.category}
                      </Badge>
                      <div className="flex-1 font-medium">{rule.label}</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={rule.rp}
                          onChange={(e) => handleRPRuleChange(index, e.target.value)}
                          className="w-24"
                        />
                        <span className="text-sm text-slate-500">RP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Global Multiplier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Global Multiplier
                </CardTitle>
                <CardDescription>
                  Apply a multiplier to all RP earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Double RP Event</Label>
                  <Switch 
                    checked={doubleRPEnabled}
                    onCheckedChange={(checked) => {
                      setDoubleRPEnabled(checked);
                      setGlobalMultiplier(checked ? 2.0 : 1.0);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custom Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={globalMultiplier}
                    onChange={(e) => setGlobalMultiplier(parseFloat(e.target.value) || 1)}
                  />
                  <p className="text-xs text-slate-500">
                    Current: {globalMultiplier}x all RP earnings
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Caps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Earning Caps
                </CardTitle>
                <CardDescription>
                  Set maximum RP limits to prevent abuse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Daily Cap</Label>
                  <Input
                    type="number"
                    value={dailyCap}
                    onChange={(e) => setDailyCap(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weekly Cap</Label>
                  <Input
                    type="number"
                    value={weeklyCap}
                    onChange={(e) => setWeeklyCap(parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Decay Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-500" />
                  RP Decay
                </CardTitle>
                <CardDescription>
                  Optional decay for inactive high-rank users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Decay</Label>
                  <Switch 
                    checked={decayEnabled}
                    onCheckedChange={setDecayEnabled}
                  />
                </div>
                {decayEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Decay Rate (% per month of inactivity)</Label>
                      <Input
                        type="number"
                        value={decayRate}
                        onChange={(e) => setDecayRate(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Applies to ranks above</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={decayThreshold}
                        onChange={(e) => setDecayThreshold(e.target.value)}
                      >
                        {rankThresholds.map(r => (
                          <option key={r.code} value={r.code}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex gap-2 text-amber-700 text-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          Users at {decayThreshold} rank and above will lose {decayRate}% RP per month if inactive for 30+ days.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-violet-500" />
                  Protection Rules
                </CardTitle>
                <CardDescription>
                  Safeguards for the RP system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Prevent negative RP</span>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Rank demotion protection (24h)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">Log all RP transactions</span>
                  <Switch defaultChecked disabled />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Manual Adjustment Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-indigo-500" />
                Manual RP Adjustment
              </CardTitle>
              <CardDescription>
                Grant or revoke RP for specific users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>User Email</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>RP Amount (negative to revoke)</Label>
                <Input
                  type="number"
                  value={manualRP}
                  onChange={(e) => setManualRP(parseInt(e.target.value) || 0)}
                  placeholder="Enter RP amount..."
                />
              </div>
              <Button onClick={handleManualRPGrant} className="w-full">
                {manualRP >= 0 ? 'Grant' : 'Revoke'} {Math.abs(manualRP)} RP
              </Button>
              <p className="text-xs text-slate-500 text-center">
                This action will be logged for audit purposes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => {
          setRankThresholds(DEFAULT_RANK_THRESHOLDS);
          setRpRules(DEFAULT_RP_RULES);
          toast.info('Settings reset to defaults');
        }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}