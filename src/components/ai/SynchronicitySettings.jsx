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
  X,
  Plus,
  Clock,
  Compass
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    mystical_matching: preferences?.mystical_matching ?? true,
    skills_seeking: preferences?.skills_seeking ?? [],
    skills_offering: preferences?.skills_offering ?? [],
    commitment_level: preferences?.commitment_level ?? 'contributor',
    time_availability: preferences?.time_availability ?? '5-10_hours_week',
    spiritual_alignment_importance: preferences?.spiritual_alignment_importance ?? 5,
    value_alignment_importance: preferences?.value_alignment_importance ?? 7,
    practices_alignment: preferences?.practices_alignment ?? [],
    consciousness_level_preference: preferences?.consciousness_level_preference ?? ['any'],
    collaboration_style: preferences?.collaboration_style ?? [],
    seeking_roles: preferences?.seeking_roles ?? [],
    offering_roles: preferences?.offering_roles ?? [],
    energy_compatibility: preferences?.energy_compatibility ?? true,
    distance_preference: preferences?.distance_preference ?? 'global'
  });

  const [newSkillSeeking, setNewSkillSeeking] = useState('');
  const [newSkillOffering, setNewSkillOffering] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newOfferingRole, setNewOfferingRole] = useState('');

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

            {/* Skills Seeking */}
            <div>
              <Label className="mb-3 block">Skills Seeking in Collaborators</Label>
              <p className="text-xs text-slate-500 mb-3">
                Specific skills you're looking for in potential collaborators
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Web Development, Coaching, Design"
                  value={newSkillSeeking}
                  onChange={(e) => setNewSkillSeeking(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSkillSeeking.trim()) {
                      setSettings({
                        ...settings,
                        skills_seeking: [...settings.skills_seeking, newSkillSeeking.trim()]
                      });
                      setNewSkillSeeking('');
                    }
                  }}
                  disabled={!settings.synchronicity_engine_enabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (newSkillSeeking.trim()) {
                      setSettings({
                        ...settings,
                        skills_seeking: [...settings.skills_seeking, newSkillSeeking.trim()]
                      });
                      setNewSkillSeeking('');
                    }
                  }}
                  disabled={!settings.synchronicity_engine_enabled}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.skills_seeking.map((skill, i) => (
                  <Badge key={i} className="bg-blue-100 text-blue-700 gap-2 pr-1">
                    {skill}
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        skills_seeking: settings.skills_seeking.filter((_, idx) => idx !== i)
                      })}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills Offering */}
            <div>
              <Label className="mb-3 block">Skills You're Offering</Label>
              <p className="text-xs text-slate-500 mb-3">
                Your skills available to share with collaborators
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Marketing, Teaching, Healing"
                  value={newSkillOffering}
                  onChange={(e) => setNewSkillOffering(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSkillOffering.trim()) {
                      setSettings({
                        ...settings,
                        skills_offering: [...settings.skills_offering, newSkillOffering.trim()]
                      });
                      setNewSkillOffering('');
                    }
                  }}
                  disabled={!settings.synchronicity_engine_enabled}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (newSkillOffering.trim()) {
                      setSettings({
                        ...settings,
                        skills_offering: [...settings.skills_offering, newSkillOffering.trim()]
                      });
                      setNewSkillOffering('');
                    }
                  }}
                  disabled={!settings.synchronicity_engine_enabled}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.skills_offering.map((skill, i) => (
                  <Badge key={i} className="bg-emerald-100 text-emerald-700 gap-2 pr-1">
                    {skill}
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        skills_offering: settings.skills_offering.filter((_, idx) => idx !== i)
                      })}
                      className="hover:bg-emerald-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Commitment Level */}
            <div>
              <Label className="mb-3 block">Desired Commitment Level</Label>
              <p className="text-xs text-slate-500 mb-3">How engaged you want to be</p>
              <Select
                value={settings.commitment_level}
                onValueChange={(value) => setSettings({ ...settings, commitment_level: value })}
                disabled={!settings.synchronicity_engine_enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="explorer">Explorer - Exploring possibilities</SelectItem>
                  <SelectItem value="contributor">Contributor - Active participation</SelectItem>
                  <SelectItem value="dedicated">Dedicated - Serious commitment</SelectItem>
                  <SelectItem value="full_time">Full-Time - Primary focus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Availability */}
            <div>
              <Label className="mb-3 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Availability (Weekly)
              </Label>
              <Select
                value={settings.time_availability}
                onValueChange={(value) => setSettings({ ...settings, time_availability: value })}
                disabled={!settings.synchronicity_engine_enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5_hours_week">1-5 hours/week</SelectItem>
                  <SelectItem value="5-10_hours_week">5-10 hours/week</SelectItem>
                  <SelectItem value="10-20_hours_week">10-20 hours/week</SelectItem>
                  <SelectItem value="20+_hours_week">20+ hours/week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spiritual Alignment Importance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Spiritual Alignment Importance
                </Label>
                <Badge variant="outline">{settings.spiritual_alignment_importance}/10</Badge>
              </div>
              <Slider
                value={[settings.spiritual_alignment_importance]}
                onValueChange={([value]) => setSettings({ ...settings, spiritual_alignment_importance: value })}
                min={0}
                max={10}
                step={1}
                disabled={!settings.synchronicity_engine_enabled}
              />
            </div>

            {/* Value Alignment Importance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Shared Values Importance
                </Label>
                <Badge variant="outline">{settings.value_alignment_importance}/10</Badge>
              </div>
              <Slider
                value={[settings.value_alignment_importance]}
                onValueChange={([value]) => setSettings({ ...settings, value_alignment_importance: value })}
                min={0}
                max={10}
                step={1}
                disabled={!settings.synchronicity_engine_enabled}
              />
            </div>

            {/* Consciousness Level Preference */}
            <div>
              <Label className="mb-3 block flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Preferred Consciousness Orientation
              </Label>
              <p className="text-xs text-slate-500 mb-3">
                Types of spiritual orientation you resonate with
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['grounded_practical', 'heart_centered', 'contemplative', 'service_oriented', 'nondual_awareness', 'integrative', 'exploratory', 'any'].map((level) => {
                  const isSelected = settings.consciousness_level_preference.includes(level);
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        if (level === 'any') {
                          setSettings({ ...settings, consciousness_level_preference: ['any'] });
                        } else {
                          const filtered = settings.consciousness_level_preference.filter(l => l !== 'any');
                          if (isSelected) {
                            const newPrefs = filtered.filter(l => l !== level);
                            setSettings({
                              ...settings,
                              consciousness_level_preference: newPrefs.length > 0 ? newPrefs : ['any']
                            });
                          } else {
                            setSettings({
                              ...settings,
                              consciousness_level_preference: [...filtered, level]
                            });
                          }
                        }
                      }}
                      disabled={!settings.synchronicity_engine_enabled}
                      className={`p-2 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50 text-violet-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                    >
                      {level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance Preference */}
            <div>
              <Label className="mb-3 block flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Geographic Preference
              </Label>
              <Select
                value={settings.distance_preference}
                onValueChange={(value) => setSettings({ ...settings, distance_preference: value })}
                disabled={!settings.synchronicity_engine_enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local_only">Local Only - Same city/area</SelectItem>
                  <SelectItem value="regional">Regional - Same state/region</SelectItem>
                  <SelectItem value="national">National - Same country</SelectItem>
                  <SelectItem value="global">Global - Worldwide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Energy Compatibility */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <Label htmlFor="energy" className="cursor-pointer">Energy Compatibility</Label>
                <p className="text-xs text-slate-500 mt-1">
                  Consider astrological and energetic compatibility
                </p>
              </div>
              <Switch
                id="energy"
                checked={settings.energy_compatibility}
                onCheckedChange={(checked) => setSettings({ ...settings, energy_compatibility: checked })}
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