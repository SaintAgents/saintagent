import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  MessageCircle,
  Eye,
  Save,
  Check } from
"lucide-react";
import NotificationSettings from '@/components/notifications/NotificationSettings';
import BackButton from '@/components/hud/BackButton';
import { trackUpdateProfile } from '@/components/gamification/challengeTracker';

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  React.useEffect(() => {
    if (!profile) return;
    setSettings((prev) => ({
      ...prev,
      dm_policy: profile.dm_policy || 'everyone',
      status: profile.status || 'online',
      status_message: profile.status_message || '',
      profile_visibility: profile.profile_visibility || 'public',
      visibility_settings: profile.visibility_settings || prev.visibility_settings,
      notification_prefs: profile.notification_prefs || prev.notification_prefs,
      theme_preference: profile.theme_preference || prev.theme_preference,
      custom_theme_colors: profile.custom_theme_colors || prev.custom_theme_colors,
      command_deck_layout: profile.command_deck_layout || prev.command_deck_layout
    }));
  }, [profile?.id]);

  const [settings, setSettings] = useState({
    dm_policy: profile?.dm_policy || 'everyone',
    status: profile?.status || 'online',
    status_message: profile?.status_message || '',
    profile_visibility: profile?.profile_visibility || 'public',
    visibility_settings: profile?.visibility_settings || { show_email: false, show_location: true, show_earnings: false },
    notification_prefs: profile?.notification_prefs || { email: true, in_app: true, push: false },
    theme_preference: profile?.theme_preference || (typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'),
    custom_theme_colors: profile?.custom_theme_colors || {
      primary: typeof window !== 'undefined' ? localStorage.getItem('custom_primary') || '#7c3aed' : '#7c3aed',
      accent: typeof window !== 'undefined' ? localStorage.getItem('custom_accent') || '#f59e0b' : '#f59e0b'
    },
    command_deck_layout: profile?.command_deck_layout || { view_mode: 'standard', show_side_panel: true },
    zfold_mode: typeof window !== 'undefined' ? localStorage.getItem('zfold_mode') === 'true' : false
  });

  // Initialize Z Fold mode on mount
  React.useEffect(() => {
    try {
      const zfold = localStorage.getItem('zfold_mode') === 'true';
      if (zfold) {
        document.documentElement.setAttribute('data-zfold', 'true');
      }
    } catch {}
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Track challenge progress for updating profile
      if (profile?.user_id) {
        trackUpdateProfile(profile.user_id);
      }
    }
  });

  const handleSave = () => {
    // Apply theme locally for instant feedback
    try {
      localStorage.setItem('theme', settings.theme_preference || 'light');
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', settings.theme_preference || 'light');
      }
      if (settings.theme_preference === 'custom') {
        const p = settings.custom_theme_colors?.primary || '#7c3aed';
        const a = settings.custom_theme_colors?.accent || '#f59e0b';
        localStorage.setItem('custom_primary', p);
        localStorage.setItem('custom_accent', a);
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--primary', p);
          document.documentElement.style.setProperty('--accent', a);
        }
      }
    } catch {}

    updateMutation.mutate({
      dm_policy: settings.dm_policy,
      status: settings.status,
      status_message: settings.status_message,
      profile_visibility: settings.profile_visibility,
      visibility_settings: settings.visibility_settings,
      notification_prefs: settings.notification_prefs,
      theme_preference: settings.theme_preference,
      custom_theme_colors: settings.custom_theme_colors,
      command_deck_layout: settings.command_deck_layout
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-[#050505] dark:via-[#050505] dark:to-[#050505]">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/39d5258fa_settings.jpg"
          alt="Settings"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide flex items-center justify-center gap-3"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
              <SettingsIcon className="w-10 h-10 text-amber-300 drop-shadow-lg" />
              Settings
            </h1>
            <p className="text-violet-200/90 mt-2 text-lg tracking-wider drop-shadow-lg">
              Manage your account preferences and privacy
            </p>
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <BackButton className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="w-full grid grid-cols-4 h-11 bg-white dark:bg-[#0a0a0a] rounded-xl border dark:border-[#00ff88]/30">
            <TabsTrigger value="account" className="rounded-lg gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-lg gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg gap-2">
              <Eye className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={profile?.user_id} disabled className="mt-2 bg-slate-50" />
                </div>
                <div>
                  <Label>Handle</Label>
                  <Input value={`@${profile?.handle}`} disabled className="mt-2 bg-slate-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Set your current availability status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={settings.status}
                  onValueChange={(v) => setSettings({ ...settings, status: v })}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Online
                      </div>
                    </SelectItem>
                    <SelectItem value="focus">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Focus Mode
                      </div>
                    </SelectItem>
                    <SelectItem value="dnd">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        Do Not Disturb
                      </div>
                    </SelectItem>
                    <SelectItem value="offline">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        Appear Offline
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Label>Status Message</Label>
                  </div>
                  <Input
                    value={settings.status_message || ''}
                    onChange={(e) => setSettings({ ...settings, status_message: e.target.value })}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="What's on your mind?"
                    maxLength={100}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">This message shows when others hover over your avatar</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Direct Messages</CardTitle>
                <CardDescription>Control who can send you direct messages</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={settings.dm_policy}
                  onValueChange={(v) => setSettings({ ...settings, dm_policy: v })}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="mutual">Mutual Connections</SelectItem>
                    <SelectItem value="none">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
                <CardDescription>Control what others can see on your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Overall visibility</Label>
                  <Select
                    value={settings.profile_visibility}
                    onValueChange={(v) => setSettings({ ...settings, profile_visibility: v })}>

                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="members_only">Members Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show email</p>
                    <p className="text-sm text-slate-500">Allow others to see your email address</p>
                  </div>
                  <Switch
                    checked={!!settings.visibility_settings?.show_email}
                    onCheckedChange={(checked) => setSettings({ ...settings, visibility_settings: { ...settings.visibility_settings, show_email: !!checked } })}
                    className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />

                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show location</p>
                    <p className="text-sm text-slate-500">Display your region on your profile</p>
                  </div>
                  <Switch
                    checked={!!settings.visibility_settings?.show_location}
                    onCheckedChange={(checked) => setSettings({ ...settings, visibility_settings: { ...settings.visibility_settings, show_location: !!checked } })}
                    className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />

                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show earnings</p>
                    <p className="text-sm text-slate-500">Display your total earnings publicly</p>
                  </div>
                  <Switch
                    checked={!!settings.visibility_settings?.show_earnings}
                    onCheckedChange={(checked) => setSettings({ ...settings, visibility_settings: { ...settings.visibility_settings, show_earnings: !!checked } })}
                    className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings
              settings={settings.notification_prefs}
              onChange={(newPrefs) => setSettings({ ...settings, notification_prefs: newPrefs })} />

          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Select light, dark, or custom colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={settings.theme_preference}
                    onValueChange={(v) => setSettings({ ...settings, theme_preference: v })}>

                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark (Neon)</SelectItem>
                      <SelectItem value="hacker">Hacker (Matrix)</SelectItem>
                      <SelectItem value="custom">Custom Colors</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    {settings.theme_preference === 'dark' && "Obsidian black with neon green/teal accents"}
                    {settings.theme_preference === 'hacker' && "Pure green on black terminal style"}
                    {settings.theme_preference === 'custom' && "Choose your own primary and accent colors"}
                  </p>
                </div>
                {settings.theme_preference === 'custom' &&
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Primary color</Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Input
                          type="color"
                          className="h-10 w-16 p-1 cursor-pointer"
                          value={settings.custom_theme_colors?.primary || '#7c3aed'}
                          onChange={(e) => setSettings({ ...settings, custom_theme_colors: { ...settings.custom_theme_colors, primary: e.target.value } })} />

                          <Input
                          type="text"
                          className="flex-1 font-mono text-sm"
                          value={settings.custom_theme_colors?.primary || '#7c3aed'}
                          onChange={(e) => setSettings({ ...settings, custom_theme_colors: { ...settings.custom_theme_colors, primary: e.target.value } })}
                          placeholder="#7c3aed" />

                        </div>
                      </div>
                      <div>
                        <Label>Accent color</Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Input
                          type="color"
                          className="h-10 w-16 p-1 cursor-pointer"
                          value={settings.custom_theme_colors?.accent || '#f59e0b'}
                          onChange={(e) => setSettings({ ...settings, custom_theme_colors: { ...settings.custom_theme_colors, accent: e.target.value } })} />

                          <Input
                          type="text"
                          className="flex-1 font-mono text-sm"
                          value={settings.custom_theme_colors?.accent || '#f59e0b'}
                          onChange={(e) => setSettings({ ...settings, custom_theme_colors: { ...settings.custom_theme_colors, accent: e.target.value } })}
                          placeholder="#f59e0b" />

                        </div>
                      </div>
                    </div>
                    {/* Color Preview */}
                    <div className="p-4 rounded-lg border" style={{
                    background: `linear-gradient(135deg, ${settings.custom_theme_colors?.primary || '#7c3aed'}20, ${settings.custom_theme_colors?.accent || '#f59e0b'}20)`,
                    borderColor: settings.custom_theme_colors?.primary || '#7c3aed'
                  }}>
                      <p className="font-medium" style={{ color: settings.custom_theme_colors?.primary || '#7c3aed' }}>Preview of your theme</p>
                      <p className="text-sm" style={{ color: settings.custom_theme_colors?.accent || '#f59e0b' }}>Accent text color</p>
                    </div>
                  </div>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Optimization</CardTitle>
                <CardDescription>Optimize for your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Optimize for Samsung Z Fold</p>
                    <p className="text-sm text-slate-500">Adjust layout for foldable screens</p>
                  </div>
                  <Switch
                    checked={settings.zfold_mode}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, zfold_mode: checked });
                      try {
                        localStorage.setItem('zfold_mode', checked ? 'true' : 'false');
                        document.documentElement.setAttribute('data-zfold', checked ? 'true' : 'false');
                      } catch {}
                    }}
                    className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Command Deck Layout</CardTitle>
                <CardDescription>Set your default layout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>View mode</Label>
                  <Select
                    value={settings.command_deck_layout?.view_mode}
                    onValueChange={(v) => setSettings({ ...settings, command_deck_layout: { ...settings.command_deck_layout, view_mode: v } })}>

                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show side panel by default</p>
                    <p className="text-sm text-slate-500">When opening the Command Deck</p>
                  </div>
                  <Switch
                    checked={!!settings.command_deck_layout?.show_side_panel}
                    onCheckedChange={(checked) => setSettings({ ...settings, command_deck_layout: { ...settings.command_deck_layout, show_side_panel: !!checked } })}
                    className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />

                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Synchronicity Engine</CardTitle>
                <CardDescription>Tune your matching preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Prioritize local matches</p>
                    <p className="text-sm text-slate-500">Prefer matches in your bioregion</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Include global missions</p>
                    <p className="text-sm text-slate-500">Show platform-wide mission matches</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show timing windows</p>
                    <p className="text-sm text-slate-500">Display optimal timing for connections</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            className="bg-violet-600 hover:bg-violet-700 dark:bg-[#00ff88] dark:hover:bg-[#00dd77] dark:text-black rounded-xl gap-2"
            disabled={updateMutation.isPending}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>);

}