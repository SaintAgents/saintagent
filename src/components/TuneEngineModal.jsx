import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Save, X, Plus, Target, Users, Briefcase, Heart, Brain, Zap, Globe, Clock } from "lucide-react";

const SKILL_SUGGESTIONS = [
  'Web Development', 'AI/ML', 'Design', 'Marketing', 'Writing', 'Video Production',
  'Coaching', 'Healing', 'Meditation', 'Yoga', 'Business Strategy', 'Finance',
  'Community Building', 'Event Planning', 'Music', 'Art', 'Photography', 'Teaching'
];

const INTEREST_SUGGESTIONS = [
  'Spirituality', 'Technology', 'Sustainability', 'Health & Wellness', 'Personal Growth',
  'Social Impact', 'Entrepreneurship', 'Creative Arts', 'Science', 'Philosophy',
  'Conscious Leadership', 'Alternative Medicine', 'Sacred Geometry', 'Astrology'
];

const GOAL_SUGGESTIONS = [
  'Find collaborators', 'Learn new skills', 'Teach others', 'Build a project',
  'Grow my network', 'Find mentors', 'Offer mentorship', 'Create abundance',
  'Spiritual growth', 'Launch a business', 'Make impact', 'Find community'
];

const COLLABORATION_STYLES = [
  { value: 'structured', label: 'Structured', desc: 'Clear roles & timelines' },
  { value: 'flexible', label: 'Flexible', desc: 'Adaptable approach' },
  { value: 'spontaneous', label: 'Spontaneous', desc: 'Go with the flow' },
  { value: 'long_term', label: 'Long-term', desc: 'Ongoing partnerships' },
  { value: 'project_based', label: 'Project-based', desc: 'Specific goals' },
  { value: 'mentorship', label: 'Mentorship', desc: 'Teaching/learning' },
  { value: 'peer_to_peer', label: 'Peer-to-peer', desc: 'Equal collaboration' }
];

const TagInput = ({ value = [], onChange, suggestions = [], placeholder, maxTags = 10 }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const addTag = (tag) => {
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
    }
    setInput('');
    setShowSuggestions(false);
  };
  
  const removeTag = (tag) => {
    onChange(value.filter(t => t !== tag));
  };
  
  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input) {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder={placeholder}
          className="h-9"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border rounded-lg shadow-lg max-h-32 overflow-auto">
            {filteredSuggestions.slice(0, 6).map(s => (
              <button
                key={s}
                onClick={() => addTag(s)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function TuneEngineModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles[0];
    },
    enabled: !!user?.email
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ['enginePrefs'],
    queryFn: () => base44.entities.EnginePreference.filter({ user_id: user?.email }),
    enabled: !!user
  });
  const currentPref = prefs[0];

  const [settings, setSettings] = useState({
    priority: 'balanced',
    meeting_vs_offer_slider: 50,
    prefer_local: true,
    quiet_mode: false,
    show_leaders_only: false,
    // Granular preferences
    skills_seeking: [],
    skills_offering: [],
    interests_filter: [],
    goals_filter: [],
    commitment_level: 'contributor',
    time_availability: '5-10_hours_week',
    collaboration_style: [],
    distance_preference: 'global',
    // Weights
    spiritual_alignment_importance: 5,
    value_alignment_importance: 7,
    skill_complement_weight: 5,
    mission_alignment_weight: 5,
    // Deep match
    deep_match_enabled: false,
    serendipity_level: 'balanced',
    energy_compatibility: true,
    minimum_match_score: 70
  });

  // Load existing preferences
  useEffect(() => {
    if (currentPref) {
      setSettings({
        priority: currentPref.priority || 'balanced',
        meeting_vs_offer_slider: currentPref.meeting_vs_offer_slider || 50,
        prefer_local: currentPref.prefer_local !== false,
        quiet_mode: currentPref.quiet_mode || false,
        show_leaders_only: currentPref.show_leaders_only || false,
        skills_seeking: currentPref.skills_seeking || [],
        skills_offering: currentPref.skills_offering || [],
        interests_filter: currentPref.deep_match_preferences?.shared_values_filter || [],
        goals_filter: currentPref.deep_match_preferences?.mission_interests_filter || [],
        commitment_level: currentPref.commitment_level || 'contributor',
        time_availability: currentPref.time_availability || '5-10_hours_week',
        collaboration_style: currentPref.collaboration_style || [],
        distance_preference: currentPref.distance_preference || 'global',
        spiritual_alignment_importance: currentPref.spiritual_alignment_importance ?? 5,
        value_alignment_importance: currentPref.value_alignment_importance ?? 7,
        skill_complement_weight: currentPref.deep_match_preferences?.skill_complement_weight ?? 5,
        mission_alignment_weight: currentPref.deep_match_preferences?.mission_alignment_weight ?? 5,
        deep_match_enabled: currentPref.deep_match_enabled || false,
        serendipity_level: currentPref.deep_match_preferences?.serendipity_level || 'balanced',
        energy_compatibility: currentPref.energy_compatibility !== false,
        minimum_match_score: currentPref.minimum_match_score || 70
      });
    }
  }, [currentPref]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        user_id: user.email,
        priority: data.priority,
        meeting_vs_offer_slider: data.meeting_vs_offer_slider,
        prefer_local: data.prefer_local,
        quiet_mode: data.quiet_mode,
        show_leaders_only: data.show_leaders_only,
        skills_seeking: data.skills_seeking,
        skills_offering: data.skills_offering,
        commitment_level: data.commitment_level,
        time_availability: data.time_availability,
        collaboration_style: data.collaboration_style,
        distance_preference: data.distance_preference,
        spiritual_alignment_importance: data.spiritual_alignment_importance,
        value_alignment_importance: data.value_alignment_importance,
        deep_match_enabled: data.deep_match_enabled,
        energy_compatibility: data.energy_compatibility,
        minimum_match_score: data.minimum_match_score,
        deep_match_preferences: {
          serendipity_level: data.serendipity_level,
          skill_complement_weight: data.skill_complement_weight,
          mission_alignment_weight: data.mission_alignment_weight,
          shared_values_filter: data.interests_filter,
          mission_interests_filter: data.goals_filter,
          analyze_past_interactions: true,
          include_declared_intentions: true
        }
      };

      if (currentPref) {
        return base44.entities.EnginePreference.update(currentPref.id, payload);
      } else {
        return base44.entities.EnginePreference.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enginePrefs'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      onClose();
    }
  });

  const toggleCollabStyle = (style) => {
    setSettings(prev => ({
      ...prev,
      collaboration_style: prev.collaboration_style.includes(style)
        ? prev.collaboration_style.filter(s => s !== style)
        : [...prev.collaboration_style, style]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Tune Synchronicity Engine
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs">Skills & Goals</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">Advanced AI</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div>
                <Label>Priority Mode</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {['earn', 'learn', 'build', 'teach', 'balanced'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSettings({ ...settings, priority: mode })}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                        settings.priority === mode
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Match Type Balance</Label>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>More Meetings</span>
                    <span>Balanced</span>
                    <span>More Offers</span>
                  </div>
                  <Slider
                    value={[settings.meeting_vs_offer_slider]}
                    onValueChange={([v]) => setSettings({ ...settings, meeting_vs_offer_slider: v })}
                    min={0}
                    max={100}
                    step={10}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Prioritize Local Matches</p>
                    <p className="text-sm text-slate-500">Prefer matches in your bioregion</p>
                  </div>
                  <Switch
                    checked={settings.prefer_local}
                    onCheckedChange={(v) => setSettings({ ...settings, prefer_local: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quiet Mode</p>
                    <p className="text-sm text-slate-500">Limit match frequency</p>
                  </div>
                  <Switch
                    checked={settings.quiet_mode}
                    onCheckedChange={(v) => setSettings({ ...settings, quiet_mode: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Leaders Only</p>
                    <p className="text-sm text-slate-500">Filter for verified leaders</p>
                  </div>
                  <Switch
                    checked={settings.show_leaders_only}
                    onCheckedChange={(v) => setSettings({ ...settings, show_leaders_only: v })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Skills I'm Seeking
                </Label>
                <p className="text-xs text-slate-500 mb-2">Match me with people who have these skills</p>
                <TagInput
                  value={settings.skills_seeking}
                  onChange={(v) => setSettings({ ...settings, skills_seeking: v })}
                  suggestions={SKILL_SUGGESTIONS}
                  placeholder="Add skills you're looking for..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Skills I'm Offering
                </Label>
                <p className="text-xs text-slate-500 mb-2">Match me with people who need these skills</p>
                <TagInput
                  value={settings.skills_offering}
                  onChange={(v) => setSettings({ ...settings, skills_offering: v })}
                  suggestions={SKILL_SUGGESTIONS}
                  placeholder="Add skills you can offer..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Shared Interests
                </Label>
                <p className="text-xs text-slate-500 mb-2">Find people with similar interests</p>
                <TagInput
                  value={settings.interests_filter}
                  onChange={(v) => setSettings({ ...settings, interests_filter: v })}
                  suggestions={INTEREST_SUGGESTIONS}
                  placeholder="Add interests to match on..."
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Goals & Intentions
                </Label>
                <p className="text-xs text-slate-500 mb-2">Match with people who share your goals</p>
                <TagInput
                  value={settings.goals_filter}
                  onChange={(v) => setSettings({ ...settings, goals_filter: v })}
                  suggestions={GOAL_SUGGESTIONS}
                  placeholder="Add goals you're working towards..."
                />
              </div>

              <div className="pt-3 border-t">
                <Label className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-violet-500" />
                  Collaboration Style
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {COLLABORATION_STYLES.map(style => (
                    <button
                      key={style.value}
                      onClick={() => toggleCollabStyle(style.value)}
                      className={cn(
                        "p-2 rounded-lg text-left transition-all border",
                        settings.collaboration_style.includes(style.value)
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <p className="text-sm font-medium">{style.label}</p>
                      <p className="text-xs text-slate-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Time Availability
                  </Label>
                  <Select
                    value={settings.time_availability}
                    onValueChange={(v) => setSettings({ ...settings, time_availability: v })}
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

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    Distance Preference
                  </Label>
                  <Select
                    value={settings.distance_preference}
                    onValueChange={(v) => setSettings({ ...settings, distance_preference: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local_only">Local Only</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-600" />
                    <span className="font-semibold text-violet-900 dark:text-violet-100">AI Deep Matching</span>
                  </div>
                  <Switch
                    checked={settings.deep_match_enabled}
                    onCheckedChange={(v) => setSettings({ ...settings, deep_match_enabled: v })}
                  />
                </div>
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  Enable AI to analyze your activity, past interactions, and profile to suggest highly personalized matches.
                </p>
              </div>

              <div>
                <Label>Minimum Match Score</Label>
                <p className="text-xs text-slate-500 mb-2">Only show matches above this threshold</p>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.minimum_match_score]}
                    onValueChange={([v]) => setSettings({ ...settings, minimum_match_score: v })}
                    min={50}
                    max={95}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{settings.minimum_match_score}%</span>
                </div>
              </div>

              <div>
                <Label>Serendipity Level</Label>
                <p className="text-xs text-slate-500 mb-2">How adventurous should AI be with suggestions?</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'conservative', label: 'Conservative', desc: 'Safe, highly compatible' },
                    { value: 'balanced', label: 'Balanced', desc: 'Mix of safe & new' },
                    { value: 'adventurous', label: 'Adventurous', desc: 'Surprise me!' }
                  ].map(level => (
                    <button
                      key={level.value}
                      onClick={() => setSettings({ ...settings, serendipity_level: level.value })}
                      className={cn(
                        "p-3 rounded-lg text-center transition-all border",
                        settings.serendipity_level === level.value
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <p className="text-sm font-medium">{level.label}</p>
                      <p className="text-xs text-slate-500">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t">
                <Label>Matching Weights</Label>
                <p className="text-xs text-slate-500 mb-3">Adjust importance of different factors (0-10)</p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spiritual Alignment</span>
                      <span className="font-medium">{settings.spiritual_alignment_importance}</span>
                    </div>
                    <Slider
                      value={[settings.spiritual_alignment_importance]}
                      onValueChange={([v]) => setSettings({ ...settings, spiritual_alignment_importance: v })}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Value Alignment</span>
                      <span className="font-medium">{settings.value_alignment_importance}</span>
                    </div>
                    <Slider
                      value={[settings.value_alignment_importance]}
                      onValueChange={([v]) => setSettings({ ...settings, value_alignment_importance: v })}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Skill Complementarity</span>
                      <span className="font-medium">{settings.skill_complement_weight}</span>
                    </div>
                    <Slider
                      value={[settings.skill_complement_weight]}
                      onValueChange={([v]) => setSettings({ ...settings, skill_complement_weight: v })}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mission Alignment</span>
                      <span className="font-medium">{settings.mission_alignment_weight}</span>
                    </div>
                    <Slider
                      value={[settings.mission_alignment_weight]}
                      onValueChange={([v]) => setSettings({ ...settings, mission_alignment_weight: v })}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <p className="font-medium">Energy Compatibility</p>
                  <p className="text-sm text-slate-500">Include mystical/astrological matching</p>
                </div>
                <Switch
                  checked={settings.energy_compatibility}
                  onCheckedChange={(v) => setSettings({ ...settings, energy_compatibility: v })}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate(settings)}
            disabled={saveMutation.isPending}
            className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}