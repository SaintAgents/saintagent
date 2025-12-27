import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Edit, Target, Heart, Compass, MapPin, X } from "lucide-react";

const DESIRE_OPTIONS = [
  { code: 'find_mentor', label: 'Find a Mentor' },
  { code: 'find_students', label: 'Find Students' },
  { code: 'build_team', label: 'Build a Team' },
  { code: 'find_investors', label: 'Find Investors' },
  { code: 'launch_product', label: 'Launch a Product' },
  { code: 'grow_audience', label: 'Grow My Audience' },
  { code: 'speak_teach', label: 'Speak & Teach' },
  { code: 'join_mission', label: 'Join a Mission' },
  { code: 'create_mission', label: 'Create a Mission' },
  { code: 'host_meetups', label: 'Host Meetups' },
  { code: 'collaborate_content', label: 'Collaborate on Content' },
  { code: 'deepen_practice', label: 'Deepen My Practice' },
  { code: 'heal_integrate', label: 'Heal & Integrate' },
  { code: 'build_community', label: 'Build Community' },
];

const HOPE_OPTIONS = [
  { code: 'financial_freedom', label: 'Financial Freedom' },
  { code: 'meaningful_wealth', label: 'Meaningful Wealth' },
  { code: 'recognized_teacher', label: 'Recognized Teacher' },
  { code: 'community_leader', label: 'Community Leader' },
  { code: 'launch_movement', label: 'Launch Movement' },
  { code: 'find_mission', label: 'Find My Mission' },
  { code: 'heal_patterns', label: 'Heal Patterns' },
  { code: 'conscious_community', label: 'Conscious Community' },
  { code: 'master_craft', label: 'Master My Craft' },
  { code: 'serve_humanity', label: 'Serve Humanity' },
  { code: 'create_legacy', label: 'Create Legacy' },
];

const INTENTION_OPTIONS = [
  { code: 'build_project', label: 'Build Project' },
  { code: 'learn_skills', label: 'Learn Skills' },
  { code: 'teach_mentor', label: 'Teach/Mentor' },
  { code: 'find_collaborators', label: 'Find Collaborators' },
  { code: 'earn_income', label: 'Earn Income' },
  { code: 'host_events', label: 'Host Events' },
  { code: 'join_missions', label: 'Join Missions' },
  { code: 'grow_influence', label: 'Grow Influence' },
  { code: 'spiritual_growth', label: 'Spiritual Growth' },
];

const REGIONS = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania', 'Other'];

export default function OnboardingDataEditor({ profile, desires, hopes, intentions }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedDesires, setSelectedDesires] = useState(desires?.map(d => d.desire_code) || []);
  const [selectedHopes, setSelectedHopes] = useState(hopes?.map(h => h.hope_code) || []);
  const [selectedIntentions, setSelectedIntentions] = useState(intentions?.map(i => i.intention_code) || []);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const syncDesiresMutation = useMutation({
    mutationFn: async (desireCodes) => {
      // Delete all existing desires
      await Promise.all(desires.map(d => base44.entities.UserDesire.delete(d.id)));
      // Create new ones
      await Promise.all(desireCodes.map(code =>
        base44.entities.UserDesire.create({ user_id: profile.user_id, desire_code: code, priority: 'medium' })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['desires'] })
  });

  const syncHopesMutation = useMutation({
    mutationFn: async (hopeCodes) => {
      await Promise.all(hopes.map(h => base44.entities.UserHope.delete(h.id)));
      await Promise.all(hopeCodes.map(code =>
        base44.entities.UserHope.create({ 
          user_id: profile.user_id, 
          hope_code: code, 
          time_horizon: '90_days',
          commitment_level: 'builder'
        })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hopes'] })
  });

  const syncIntentionsMutation = useMutation({
    mutationFn: async (intentionCodes) => {
      await Promise.all(intentions.map(i => base44.entities.UserIntention.delete(i.id)));
      await Promise.all(intentionCodes.map(code =>
        base44.entities.UserIntention.create({ user_id: profile.user_id, intention_code: code })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['intentions'] })
  });

  const handleEdit = () => {
    setEditData({
      handle: profile?.handle || '',
      alias: profile?.alias || '',
      location: profile?.location || '',
      region: profile?.region || '',
      timezone: profile?.timezone || '',
      values_tags: profile?.values_tags || [],
      intentions: profile?.intentions || [],
    });
    setSelectedDesires(desires?.map(d => d.desire_code) || []);
    setSelectedHopes(hopes?.map(h => h.hope_code) || []);
    setSelectedIntentions(intentions?.map(i => i.intention_code) || []);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfileMutation.mutateAsync(editData);
    await syncDesiresMutation.mutateAsync(selectedDesires);
    await syncHopesMutation.mutateAsync(selectedHopes);
    await syncIntentionsMutation.mutateAsync(selectedIntentions);
    setIsEditing(false);
  };

  const toggleDesire = (code) => {
    setSelectedDesires(prev => 
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  const toggleHope = (code) => {
    setSelectedHopes(prev => 
      prev.includes(code) ? prev.filter(h => h !== code) : [...prev, code]
    );
  };

  const toggleIntention = (code) => {
    setSelectedIntentions(prev => 
      prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
    );
  };

  const addValue = (value) => {
    if (value && !editData.values_tags?.includes(value)) {
      setEditData({ 
        ...editData, 
        values_tags: [...(editData.values_tags || []), value] 
      });
    }
  };

  const removeValue = (value) => {
    setEditData({ 
      ...editData, 
      values_tags: editData.values_tags?.filter(v => v !== value) 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profile Details</h2>
          <p className="text-slate-500 mt-1">Your onboarding information</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Edit className="w-4 h-4" />
            Edit Details
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Identity Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-slate-500" />
            Identity & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Handle</Label>
                  <Input 
                    value={editData.handle}
                    onChange={(e) => setEditData({ ...editData, handle: e.target.value })}
                    className="mt-2"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label>Alias / Call Name</Label>
                  <Input 
                    value={editData.alias}
                    onChange={(e) => setEditData({ ...editData, alias: e.target.value })}
                    className="mt-2"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input 
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="mt-2"
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <Label>Region</Label>
                  <Select value={editData.region} onValueChange={(v) => setEditData({ ...editData, region: v })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input 
                    value={editData.timezone}
                    onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
                    className="mt-2"
                    placeholder="PST, EST, etc."
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-medium">Handle:</span>
                <span>@{profile?.handle || 'Not set'}</span>
              </div>
              {profile?.alias && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-medium">Alias:</span>
                  <span>{profile.alias}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{profile?.location || 'No location set'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-medium">Region:</span>
                <span>{profile?.region || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-medium">Timezone:</span>
                <span>{profile?.timezone || 'Not set'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Core Values
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a value..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addValue(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.values_tags?.map((value, i) => (
                  <Badge key={i} className="bg-emerald-100 text-emerald-700 gap-2 pr-1">
                    {value}
                    <button onClick={() => removeValue(value)} className="hover:bg-emerald-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.values_tags?.map((value, i) => (
                <Badge key={i} className="bg-emerald-100 text-emerald-700">
                  {value}
                </Badge>
              ))}
              {(!profile?.values_tags || profile.values_tags.length === 0) && (
                <p className="text-slate-400">No values set</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-500" />
            Current Desires
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              {DESIRE_OPTIONS.map(option => (
                <div key={option.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.code}
                    checked={selectedDesires.includes(option.code)}
                    onCheckedChange={() => toggleDesire(option.code)}
                  />
                  <label htmlFor={option.code} className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {desires?.map((desire) => {
                const option = DESIRE_OPTIONS.find(o => o.code === desire.desire_code);
                return option ? (
                  <Badge key={desire.id} className="bg-violet-100 text-violet-700">
                    {option.label}
                  </Badge>
                ) : null;
              })}
              {desires?.length === 0 && <p className="text-slate-400">No desires set</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hopes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-500" />
            Future Hopes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              {HOPE_OPTIONS.map(option => (
                <div key={option.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.code}
                    checked={selectedHopes.includes(option.code)}
                    onCheckedChange={() => toggleHope(option.code)}
                  />
                  <label htmlFor={option.code} className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hopes?.map((hope) => {
                const option = HOPE_OPTIONS.find(o => o.code === hope.hope_code);
                return option ? (
                  <Badge key={hope.id} className="bg-amber-100 text-amber-700">
                    {option.label}
                  </Badge>
                ) : null;
              })}
              {hopes?.length === 0 && <p className="text-slate-400">No hopes set</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intentions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500" />
            Platform Intentions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              {INTENTION_OPTIONS.map(option => (
                <div key={option.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.code}
                    checked={selectedIntentions.includes(option.code)}
                    onCheckedChange={() => toggleIntention(option.code)}
                  />
                  <label htmlFor={option.code} className="text-sm cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {intentions?.map((intention) => {
                const option = INTENTION_OPTIONS.find(o => o.code === intention.intention_code);
                return option ? (
                  <Badge key={intention.id} className="bg-blue-100 text-blue-700">
                    {option.label}
                  </Badge>
                ) : null;
              })}
              {intentions?.length === 0 && <p className="text-slate-400">No intentions set</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}