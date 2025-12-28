import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  Heart, 
  Target, 
  Sparkles, 
  Briefcase,
  GraduationCap,
  Users,
  Flame,
  MapPin,
  Moon,
  X
} from "lucide-react";
import { toast } from "sonner";

const MATCH_TYPES = [
  { id: 'spiritual', label: 'Spiritual', icon: Sparkles, color: 'text-violet-600' },
  { id: 'creative', label: 'Creative', icon: Target, color: 'text-blue-600' },
  { id: 'mission', label: 'Mission', icon: Target, color: 'text-emerald-600' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'text-amber-600' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'text-rose-600' },
  { id: 'teaching', label: 'Teaching', icon: GraduationCap, color: 'text-indigo-600' },
  { id: 'twin', label: 'Twin Flame', icon: Flame, color: 'text-orange-600' }
];

export default function SynchronicitySettings({ open, onClose, profile }) {
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['enginePreferences', profile?.user_id],
    queryFn: async () => {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: profile.user_id });
      return prefs[0] || null;
    },
    enabled: !!profile?.user_id
  });

  const { data: blockedUsers = [] } = useQuery({
    queryKey: ['blockedUsers', profile?.user_id],
    queryFn: async () => {
      // Get all matches that are marked as blocked
      const matches = await base44.entities.Match.filter({ 
        user_id: profile.user_id, 
        status: 'blocked'
      });
      return matches;
    },
    enabled: !!profile?.user_id
  });

  const [settings, setSettings] = useState({
    synchronicity_engine_enabled: preferences?.synchronicity_engine_enabled ?? true,
    match_notifications: preferences?.match_notifications ?? true,
    match_types_enabled: preferences?.match_types_enabled ?? ['spiritual', 'creative', 'mission', 'business'],
    minimum_match_score: preferences?.minimum_match_score ?? 70,
    location_sharing: preferences?.location_sharing ?? false,
    mystical_matching: preferences?.mystical_matching ?? true
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return base44.entities.EnginePreference.update(preferences.id, data);
      } else {
        return base44.entities.EnginePreference.create({
          ...data,
          user_id: profile.user_id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enginePreferences'] });
      toast.success('Preferences saved');
      onClose();
    }
  });

  const unblockMutation = useMutation({
    mutationFn: (matchId) => base44.entities.Match.update(matchId, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast.success('User unblocked');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const toggleMatchType = (type) => {
    const enabled = settings.match_types_enabled.includes(type);
    if (enabled) {
      setSettings({
        ...settings,
        match_types_enabled: settings.match_types_enabled.filter(t => t !== type)
      });
    } else {
      setSettings({
        ...settings,
        match_types_enabled: [...settings.match_types_enabled, type]
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-500" />
            Synchronicity Engine Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-violet-50 border border-violet-200">
              <div className="flex-1">
                <Label htmlFor="engine-enabled" className="text-base font-semibold cursor-pointer">
                  Enable Synchronicity Engine
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  Allow AI to scan for deep resonance matches
                </p>
              </div>
              <Switch
                id="engine-enabled"
                checked={settings.synchronicity_engine_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, synchronicity_engine_enabled: checked })}
              />
            </div>

            {/* Match Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="notifications" className="cursor-pointer">Match Notifications</Label>
                <p className="text-xs text-slate-500 mt-1">Receive push notifications for new matches</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.match_notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, match_notifications: checked })}
                disabled={!settings.synchronicity_engine_enabled}
              />
            </div>

            {/* Match Types */}
            <div>
              <Label className="mb-3 block">Preferred Match Types</Label>
              <p className="text-xs text-slate-500 mb-3">Select the types of connections you want to discover</p>
              <div className="grid grid-cols-2 gap-3">
                {MATCH_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isEnabled = settings.match_types_enabled.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleMatchType(type.id)}
                      disabled={!settings.synchronicity_engine_enabled}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isEnabled
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isEnabled ? type.color : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>
                          {type.label}
                        </span>
                      </div>
                      {isEnabled && (
                        <Badge className="text-xs mt-1">Enabled</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Match Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Minimum Match Score</Label>
                <Badge variant="outline">{settings.minimum_match_score}%</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-3">Only show matches with at least this score</p>
              <Slider
                value={[settings.minimum_match_score]}
                onValueChange={([value]) => setSettings({ ...settings, minimum_match_score: value })}
                min={50}
                max={95}
                step={5}
                disabled={!settings.synchronicity_engine_enabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>50% - More matches</span>
                <span>95% - Only perfect matches</span>
              </div>
            </div>

            {/* Location Matching */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <Label htmlFor="location" className="cursor-pointer">Location-Based Matching</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Prioritize nearby users and local synchronicities
                  </p>
                </div>
              </div>
              <Switch
                id="location"
                checked={settings.location_sharing}
                onCheckedChange={(checked) => setSettings({ ...settings, location_sharing: checked })}
                disabled={!settings.synchronicity_engine_enabled}
              />
            </div>

            {/* Mystical Matching */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <Label htmlFor="mystical" className="cursor-pointer">Mystical Matching</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Include astrological, numerological, and spiritual alignments
                  </p>
                </div>
              </div>
              <Switch
                id="mystical"
                checked={settings.mystical_matching}
                onCheckedChange={(checked) => setSettings({ ...settings, mystical_matching: checked })}
                disabled={!settings.synchronicity_engine_enabled}
              />
            </div>

            {/* Blocked Users */}
            {blockedUsers.length > 0 && (
              <div>
                <Label className="mb-3 block">Blocked Users</Label>
                <p className="text-xs text-slate-500 mb-3">
                  These users won't appear in your synchronicity feed
                </p>
                <div className="space-y-2">
                  {blockedUsers.map((match) => (
                    <div key={match.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={match.target_avatar} />
                        <AvatarFallback>{match.target_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{match.target_name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unblockMutation.mutate(match.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}