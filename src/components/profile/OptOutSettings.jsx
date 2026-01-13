import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Bell, 
  BellOff, 
  Users, 
  Search, 
  MessageSquare, 
  Sparkles, 
  Trophy, 
  TrendingUp,
  MapPin,
  Heart,
  Zap,
  Save,
  Crown
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Ranks that have access to opt-out settings (master and above)
const ELIGIBLE_RANKS = ['master', 'sage', 'oracle', 'ascended', 'guardian'];

export default function OptOutSettings({ profile }) {
  const queryClient = useQueryClient();
  const currentRank = profile?.rp_rank_code || 'seeker';
  const isEligible = ELIGIBLE_RANKS.includes(currentRank);

  // Initialize opt-out settings from profile or defaults
  const [settings, setSettings] = useState({
    // Visibility
    hide_from_search: false,
    hide_from_matches: false,
    hide_profile_publicly: false,
    hide_location: false,
    hide_online_status: false,
    
    // Leaderboards & Rankings
    opt_out_leaderboards: false,
    hide_rank_badge: false,
    hide_rp_points: false,
    hide_ggg_balance: false,
    
    // Social Features
    disable_dms: false,
    disable_follow_requests: false,
    hide_follower_count: false,
    hide_following_list: false,
    
    // Matching & Discovery
    disable_synchronicity_engine: false,
    disable_ai_matching: false,
    disable_dating_matches: false,
    
    // Notifications
    disable_match_notifications: false,
    disable_mission_notifications: false,
    disable_community_notifications: false,
    disable_email_notifications: false,
    
    // Gamification
    opt_out_challenges: false,
    opt_out_quests: false,
    opt_out_seasonal_events: false,
    
    // Creator/Monetization
    hide_earnings: false,
    hide_tip_button: false,
    disable_boost_visibility: false
  });

  // Load existing settings from profile
  useEffect(() => {
    if (profile?.opt_out_settings) {
      setSettings(prev => ({ ...prev, ...profile.opt_out_settings }));
    }
  }, [profile?.opt_out_settings]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({ opt_out_settings: settings });
  };

  if (!isEligible) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Master Rank Required</h3>
            <p className="text-slate-600 mb-4">
              Opt-out settings are available for members who have achieved <strong>Master</strong> rank or higher.
            </p>
            <Badge className="bg-amber-100 text-amber-700 capitalize">
              Current Rank: {currentRank}
            </Badge>
            <p className="text-sm text-slate-500 mt-4">
              Continue earning RP to unlock advanced privacy controls.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const SettingRow = ({ icon: Icon, label, description, settingKey, iconColor = "text-slate-500" }) => (
    <div className="flex items-start justify-between py-3">
      <div className="flex items-start gap-3 flex-1">
        <Icon className={cn("w-5 h-5 mt-0.5", iconColor)} />
        <div>
          <Label className="text-sm font-medium text-slate-900">{label}</Label>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[settingKey]}
        onCheckedChange={() => handleToggle(settingKey)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100">
              <Shield className="w-8 h-8 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Opt-Out Settings</h2>
              <p className="text-slate-600">
                As a <span className="font-semibold capitalize text-violet-600">{currentRank}</span>, 
                you have full control over your visibility and participation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="w-5 h-5 text-blue-500" />
            Visibility & Privacy
          </CardTitle>
          <CardDescription>Control who can see your profile and activity</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={Search}
            iconColor="text-blue-500"
            label="Hide from Search"
            description="Your profile won't appear in search results"
            settingKey="hide_from_search"
          />
          <SettingRow
            icon={Sparkles}
            iconColor="text-purple-500"
            label="Hide from Matches"
            description="Don't appear as a match suggestion to others"
            settingKey="hide_from_matches"
          />
          <SettingRow
            icon={EyeOff}
            iconColor="text-slate-500"
            label="Private Profile"
            description="Only followers can view your full profile"
            settingKey="hide_profile_publicly"
          />
          <SettingRow
            icon={MapPin}
            iconColor="text-emerald-500"
            label="Hide Location"
            description="Don't display your region or location"
            settingKey="hide_location"
          />
          <SettingRow
            icon={Zap}
            iconColor="text-green-500"
            label="Hide Online Status"
            description="Others won't see when you're online"
            settingKey="hide_online_status"
          />
        </CardContent>
      </Card>

      {/* Leaderboards & Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboards & Rankings
          </CardTitle>
          <CardDescription>Control your visibility on leaderboards</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={Trophy}
            iconColor="text-amber-500"
            label="Opt Out of Leaderboards"
            description="Don't appear on any public leaderboards"
            settingKey="opt_out_leaderboards"
          />
          <SettingRow
            icon={Shield}
            iconColor="text-violet-500"
            label="Hide Rank Badge"
            description="Don't display your rank badge publicly"
            settingKey="hide_rank_badge"
          />
          <SettingRow
            icon={TrendingUp}
            iconColor="text-blue-500"
            label="Hide RP Points"
            description="Keep your reputation points private"
            settingKey="hide_rp_points"
          />
          <SettingRow
            icon={TrendingUp}
            iconColor="text-amber-500"
            label="Hide GGG Balance"
            description="Don't display your GGG earnings"
            settingKey="hide_ggg_balance"
          />
        </CardContent>
      </Card>

      {/* Social Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-rose-500" />
            Social Features
          </CardTitle>
          <CardDescription>Manage social interactions</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={MessageSquare}
            iconColor="text-blue-500"
            label="Disable Direct Messages"
            description="Only allow messages from people you follow"
            settingKey="disable_dms"
          />
          <SettingRow
            icon={Users}
            iconColor="text-violet-500"
            label="Disable Follow Requests"
            description="Prevent others from following you"
            settingKey="disable_follow_requests"
          />
          <SettingRow
            icon={Users}
            iconColor="text-slate-500"
            label="Hide Follower Count"
            description="Don't display how many followers you have"
            settingKey="hide_follower_count"
          />
          <SettingRow
            icon={Heart}
            iconColor="text-rose-500"
            label="Hide Following List"
            description="Keep who you follow private"
            settingKey="hide_following_list"
          />
        </CardContent>
      </Card>

      {/* Matching & Discovery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Matching & Discovery
          </CardTitle>
          <CardDescription>Control AI-powered matching features</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={Sparkles}
            iconColor="text-purple-500"
            label="Disable Synchronicity Engine"
            description="Opt out of all synchronicity-based matching"
            settingKey="disable_synchronicity_engine"
          />
          <SettingRow
            icon={Zap}
            iconColor="text-blue-500"
            label="Disable AI Matching"
            description="Don't use AI to suggest collaborators"
            settingKey="disable_ai_matching"
          />
          <SettingRow
            icon={Heart}
            iconColor="text-rose-500"
            label="Disable Dating Matches"
            description="Opt out of romantic matching entirely"
            settingKey="disable_dating_matches"
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5 text-orange-500" />
            Notifications
          </CardTitle>
          <CardDescription>Silence specific notification types</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={Sparkles}
            iconColor="text-purple-500"
            label="Disable Match Notifications"
            description="Don't notify me about new matches"
            settingKey="disable_match_notifications"
          />
          <SettingRow
            icon={Trophy}
            iconColor="text-amber-500"
            label="Disable Mission Notifications"
            description="Don't notify me about missions"
            settingKey="disable_mission_notifications"
          />
          <SettingRow
            icon={Users}
            iconColor="text-blue-500"
            label="Disable Community Notifications"
            description="Silence community activity alerts"
            settingKey="disable_community_notifications"
          />
          <SettingRow
            icon={BellOff}
            iconColor="text-slate-500"
            label="Disable Email Notifications"
            description="Don't send any email notifications"
            settingKey="disable_email_notifications"
          />
        </CardContent>
      </Card>

      {/* Gamification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-yellow-500" />
            Gamification
          </CardTitle>
          <CardDescription>Opt out of gamification features</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={Trophy}
            iconColor="text-amber-500"
            label="Opt Out of Challenges"
            description="Don't participate in daily/weekly challenges"
            settingKey="opt_out_challenges"
          />
          <SettingRow
            icon={Sparkles}
            iconColor="text-violet-500"
            label="Opt Out of Quests"
            description="Don't receive or participate in quests"
            settingKey="opt_out_quests"
          />
          <SettingRow
            icon={Zap}
            iconColor="text-yellow-500"
            label="Opt Out of Seasonal Events"
            description="Don't participate in seasonal competitions"
            settingKey="opt_out_seasonal_events"
          />
        </CardContent>
      </Card>

      {/* Creator/Monetization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Creator & Monetization
          </CardTitle>
          <CardDescription>Control monetization visibility</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <SettingRow
            icon={TrendingUp}
            iconColor="text-emerald-500"
            label="Hide Earnings"
            description="Don't display total earnings on profile"
            settingKey="hide_earnings"
          />
          <SettingRow
            icon={Heart}
            iconColor="text-rose-500"
            label="Hide Tip Button"
            description="Remove the tip button from your profile"
            settingKey="hide_tip_button"
          />
          <SettingRow
            icon={Zap}
            iconColor="text-amber-500"
            label="Disable Boost Visibility"
            description="Don't show boosted status on profile"
            settingKey="disable_boost_visibility"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Opt-Out Settings'}
        </Button>
      </div>
    </div>
  );
}