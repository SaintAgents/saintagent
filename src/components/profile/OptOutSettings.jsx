import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Users,
  Search,
  Bell,
  Database,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { canAccessOptOutControls, RANK_HIERARCHY } from '@/components/merit/MeritScoreUtils';

export default function OptOutSettings({ profile }) {
  const queryClient = useQueryClient();
  const rankCode = profile?.rp_rank_code || profile?.rank_code || 'seeker';
  const canAccess = canAccessOptOutControls(rankCode);

  const [settings, setSettings] = useState({
    profile_visibility: profile?.profile_visibility || 'public',
    show_in_search: profile?.visibility_settings?.show_in_search !== false,
    show_in_matches: profile?.visibility_settings?.show_in_matches !== false,
    show_performance_score: profile?.visibility_settings?.show_performance_score !== false,
    allow_dm_requests: profile?.dm_policy !== 'none',
    share_activity_data: profile?.visibility_settings?.share_activity_data !== false,
    show_online_status: profile?.visibility_settings?.show_online_status !== false,
    block_shares: profile?.block_shares || false
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings) => {
      await base44.entities.UserProfile.update(profile.id, {
        profile_visibility: newSettings.profile_visibility,
        block_shares: newSettings.block_shares,
        dm_policy: newSettings.allow_dm_requests ? 'everyone' : 'none',
        visibility_settings: {
          ...profile.visibility_settings,
          show_in_search: newSettings.show_in_search,
          show_in_matches: newSettings.show_in_matches,
          show_performance_score: newSettings.show_performance_score,
          share_activity_data: newSettings.share_activity_data,
          show_online_status: newSettings.show_online_status
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  // Show locked state for users below Sage rank
  if (!canAccess) {
    const currentRankLevel = RANK_HIERARCHY[rankCode] || 0;
    const sageLevel = RANK_HIERARCHY['sage'];
    const ranksToGo = sageLevel - currentRankLevel;

    return (
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-5 h-5 text-slate-400" />
            <span>Visibility & Data Controls</span>
            <Badge variant="outline" className="ml-2">Sage+</Badge>
          </CardTitle>
          <CardDescription>
            Manage your platform visibility and data sovereignty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-900/20 dark:to-cyan-900/20 border border-violet-100 dark:border-violet-800">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-violet-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Data Sovereignty Awaits
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  At <span className="font-semibold text-violet-600">Sage rank</span>, you'll unlock full control over your visibility and platform data. This is a taste of the sovereignty that comes with deeper commitment.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {ranksToGo > 0 
                    ? `${ranksToGo} rank${ranksToGo > 1 ? 's' : ''} away from unlocking these controls.`
                    : 'Keep building your legend to unlock.'}
                </p>
              </div>
            </div>
          </div>

          {/* Preview of what's coming */}
          <div className="space-y-3 opacity-50">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Profile Visibility</span>
              </div>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Search Visibility</span>
              </div>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Activity Data Sharing</span>
              </div>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-300">
              "The path of mastery is walked one quest at a time."
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full opt-out controls for Sage+ users
  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-violet-500" />
          <span>Visibility & Data Controls</span>
          <Badge className="ml-2 bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
            Unlocked
          </Badge>
        </CardTitle>
        <CardDescription>
          You've earned sovereignty over your platform presence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Profile Visibility</Label>
          <div className="flex gap-2">
            {['public', 'members_only', 'private'].map((option) => (
              <Button
                key={option}
                variant={settings.profile_visibility === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('profile_visibility', option)}
                className={cn(
                  settings.profile_visibility === option && 
                  "bg-violet-600 hover:bg-violet-700"
                )}
              >
                {option === 'public' && <Eye className="w-4 h-4 mr-1" />}
                {option === 'members_only' && <Users className="w-4 h-4 mr-1" />}
                {option === 'private' && <EyeOff className="w-4 h-4 mr-1" />}
                {option.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <Label htmlFor="show_in_search" className="text-sm">Show in Search Results</Label>
            </div>
            <Switch 
              id="show_in_search"
              checked={settings.show_in_search}
              onCheckedChange={(v) => handleChange('show_in_search', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <Label htmlFor="show_in_matches" className="text-sm">Appear in Match Suggestions</Label>
            </div>
            <Switch 
              id="show_in_matches"
              checked={settings.show_in_matches}
              onCheckedChange={(v) => handleChange('show_in_matches', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500" />
              <Label htmlFor="show_performance_score" className="text-sm">Display Performance Score</Label>
            </div>
            <Switch 
              id="show_performance_score"
              checked={settings.show_performance_score}
              onCheckedChange={(v) => handleChange('show_performance_score', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <Label htmlFor="allow_dm_requests" className="text-sm">Allow DM Requests</Label>
            </div>
            <Switch 
              id="allow_dm_requests"
              checked={settings.allow_dm_requests}
              onCheckedChange={(v) => handleChange('allow_dm_requests', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              <Label htmlFor="share_activity_data" className="text-sm">Share Activity Data for Matching</Label>
            </div>
            <Switch 
              id="share_activity_data"
              checked={settings.share_activity_data}
              onCheckedChange={(v) => handleChange('share_activity_data', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <Label htmlFor="show_online_status" className="text-sm">Show Online Status</Label>
            </div>
            <Switch 
              id="show_online_status"
              checked={settings.show_online_status}
              onCheckedChange={(v) => handleChange('show_online_status', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <Label htmlFor="block_shares" className="text-sm">Block Content Shares to Me</Label>
            </div>
            <Switch 
              id="block_shares"
              checked={settings.block_shares}
              onCheckedChange={(v) => handleChange('block_shares', v)}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700"
        >
          {updateMutation.isPending ? (
            'Saving...'
          ) : updateMutation.isSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            'Save Privacy Settings'
          )}
        </Button>

        {/* Wisdom note */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-50 to-amber-50 dark:from-violet-900/20 dark:to-amber-900/20 text-xs text-center">
          <span className="text-slate-600 dark:text-slate-400">
            "With great rank comes great sovereignty. Use it wisely."
          </span>
        </div>
      </CardContent>
    </Card>
  );
}