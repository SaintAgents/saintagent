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
  Clock,
  Globe,
  Zap,
  Plus
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
  const [newPractice, setNewPractice] = useState('');
  const [newRoleSeeking, setNewRoleSeeking] = useState('');
  const [newRoleOffering, setNewRoleOffering] = useState('');

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

  const addItem = (field, value, setter) => {
    if (value.trim() && !settings[field].includes(value.trim())) {
      setSettings({
        ...settings,
        [field]: [...settings[field], value.trim()]
      });
      setter('');
    }
  };

  const removeItem = (field, value) => {
    setSettings({
      ...settings,
      [field]: settings[field].filter(item => item !== value)
    });
  };

  const toggleArrayItem = (field, value) => {
    const items = settings[field] || [];
    if (items.includes(value)) {
      setSettings({
        ...settings,
        [field]: items.filter(item => item !== value)
      });
    } else {
      setSettings({
        ...settings,
        [field]: [...items, value]
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

            {/* Divider */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Collaboration Preferences</h3>
            </div>

            {/* Skills Seeking */}
            <div>
              <Label className="mb-2 block">Skills I'm Seeking</Label>
              <p className="text-xs text-slate-500 mb-3">What skills do you need in collaborators?</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g., web development, graphic design..."
                  value={newSkillSeeking}
                  onChange={(e) => setNewSkillSeeking(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('skills_seeking', newSkillSeeking, setNewSkillSeeking)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg"
                  disabled={!settings.synchronicity_engine_enabled}
                />
                <Button
                  size="sm"
                  onClick={() => addItem('skills_seeking', newSkillSeeking, setNewSkillSeeking)}
                  disabled={!settings.synchronicity_engine_enabled || !newSkillSeeking.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.skills_seeking.map((skill, idx) => (
                  <Badge key={idx} className="bg-blue-100 text-blue-700 gap-2 pr-1">
                    {skill}
                    <button onClick={() => removeItem('skills_seeking', skill)} className="hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Skills Offering */}
            <div>
              <Label className="mb-2 block">Skills I'm Offering</Label>
              <p className="text-xs text-slate-500 mb-3">What skills can you share with others?</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g., coaching, content writing..."
                  value={newSkillOffering}
                  onChange={(e) => setNewSkillOffering(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('skills_offering', newSkillOffering, setNewSkillOffering)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg"
                  disabled={!settings.synchronicity_engine_enabled}
                />
                <Button
                  size="sm"
                  onClick={() => addItem('skills_offering', newSkillOffering, setNewSkillOffering)}
                  disabled={!settings.synchronicity_engine_enabled || !newSkillOffering.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.skills_offering.map((skill, idx) => (
                  <Badge key={idx} className="bg-emerald-100 text-emerald-700 gap-2 pr-1">
                    {skill}
                    <button onClick={() => removeItem('skills_offering', skill)} className="hover:bg-emerald-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Commitment Level */}
            <div>
              <Label className="mb-2 block">Commitment Level</Label>
              <p className="text-xs text-slate-500 mb-3">How engaged do you want to be?</p>
              <div className="grid grid-cols-2 gap-2">
                {['explorer', 'contributor', 'dedicated', 'full_time'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSettings({ ...settings, commitment_level: level })}
                    disabled={!settings.synchronicity_engine_enabled}
                    className={`p-3 rounded-lg border-2 transition-all text-left capitalize ${
                      settings.commitment_level === level
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <span className="text-sm font-medium">{level.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Availability */}
            <div>
              <Label className="mb-2 block">Time Availability</Label>
              <p className="text-xs text-slate-500 mb-3">How much time can you commit weekly?</p>
              <div className="grid grid-cols-2 gap-2">
                {['1-5_hours_week', '5-10_hours_week', '10-20_hours_week', '20+_hours_week'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSettings({ ...settings, time_availability: time })}
                    disabled={!settings.synchronicity_engine_enabled}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      settings.time_availability === time
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <Clock className="w-4 h-4 mb-1 text-slate-500" />
                    <span className="text-sm font-medium">{time.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Spiritual Alignment</h3>
            </div>

            {/* Spiritual Alignment Importance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Spiritual Alignment Importance</Label>
                <Badge variant="outline">{settings.spiritual_alignment_importance}/10</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-3">How important is spiritual resonance?</p>
              <Slider
                value={[settings.spiritual_alignment_importance]}
                onValueChange={([value]) => setSettings({ ...settings, spiritual_alignment_importance: value })}
                min={0}
                max={10}
                step={1}
                disabled={!settings.synchronicity_engine_enabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Not important</span>
                <span>Essential</span>
              </div>
            </div>

            {/* Value Alignment Importance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Value Alignment Importance</Label>
                <Badge variant="outline">{settings.value_alignment_importance}/10</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-3">How important are shared values?</p>
              <Slider
                value={[settings.value_alignment_importance]}
                onValueChange={([value]) => setSettings({ ...settings, value_alignment_importance: value })}
                min={0}
                max={10}
                step={1}
                disabled={!settings.synchronicity_engine_enabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Not important</span>
                <span>Essential</span>
              </div>
            </div>

            {/* Consciousness Level Preference */}
            <div>
              <Label className="mb-2 block">Consciousness Orientation Preference</Label>
              <p className="text-xs text-slate-500 mb-3">What orientations resonate with you?</p>
              <div className="grid grid-cols-2 gap-2">
                {['grounded_practical', 'heart_centered', 'contemplative', 'service_oriented', 'nondual_awareness', 'integrative', 'exploratory', 'any'].map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleArrayItem('consciousness_level_preference', level)}
                    disabled={!settings.synchronicity_engine_enabled}
                    className={`p-2 rounded-lg border-2 transition-all text-left text-xs capitalize ${
                      settings.consciousness_level_preference.includes(level)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {level.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Collaboration Style */}
            <div>
              <Label className="mb-2 block">Collaboration Style</Label>
              <p className="text-xs text-slate-500 mb-3">How do you prefer to work together?</p>
              <div className="grid grid-cols-2 gap-2">
                {['structured', 'flexible', 'spontaneous', 'long_term', 'project_based', 'mentorship', 'peer_to_peer'].map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleArrayItem('collaboration_style', style)}
                    disabled={!settings.synchronicity_engine_enabled}
                    className={`p-2 rounded-lg border-2 transition-all text-left text-xs capitalize ${
                      settings.collaboration_style.includes(style)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {style.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Preference */}
            <div>
              <Label className="mb-2 block">Distance Preference</Label>
              <p className="text-xs text-slate-500 mb-3">Geographic scope for connections</p>
              <div className="grid grid-cols-2 gap-2">
                {['local_only', 'regional', 'national', 'global'].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setSettings({ ...settings, distance_preference: dist })}
                    disabled={!settings.synchronicity_engine_enabled}
                    className={`p-3 rounded-lg border-2 transition-all text-left capitalize ${
                      settings.distance_preference === dist
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${!settings.synchronicity_engine_enabled && 'opacity-50 cursor-not-allowed'}`}
                  >
                    <Globe className="w-4 h-4 mb-1 text-slate-500" />
                    <span className="text-sm font-medium">{dist.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Compatibility */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <Label htmlFor="energy" className="cursor-pointer">Energy Compatibility</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Consider energetic and astrological compatibility
                  </p>
                </div>
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