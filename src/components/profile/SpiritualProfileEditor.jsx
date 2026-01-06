import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Info } from "lucide-react";

const SPIRITUAL_PRACTICES = [
  { value: "meditation", label: "Meditation" },
  { value: "yoga", label: "Yoga" },
  { value: "breathwork", label: "Breathwork" },
  { value: "prayer", label: "Prayer" },
  { value: "contemplative_silence", label: "Contemplative Silence" },
  { value: "energy_work", label: "Energy Work" },
  { value: "martial_arts_internal", label: "Martial Arts (Internal)" },
  { value: "shamanic_practice", label: "Shamanic Practice" },
  { value: "sound_mantra", label: "Sound / Mantra" },
  { value: "ritual_ceremony", label: "Ritual / Ceremony" },
  { value: "study_philosophy", label: "Study / Philosophy" },
  { value: "plant_medicine", label: "Plant Medicine" },
  { value: "fasting", label: "Fasting / Cleansing" },
  { value: "pilgrimage", label: "Pilgrimage / Sacred Travel" },
  { value: "dream_work", label: "Dream Work / Lucid Dreaming" },
  { value: "channeling", label: "Channeling / Mediumship" },
  { value: "astral_projection", label: "Astral Projection / OBE" },
  { value: "qigong", label: "Qigong" },
  { value: "tai_chi", label: "Tai Chi" },
  { value: "reiki", label: "Reiki / Healing Touch" },
  { value: "dance_movement", label: "Sacred Dance / Movement" },
  { value: "journaling", label: "Journaling / Reflection" },
  { value: "nature_connection", label: "Nature Connection / Earthing" },
  { value: "service_karma_yoga", label: "Service / Karma Yoga" },
  { value: "devotional_bhakti", label: "Devotional / Bhakti" },
  { value: "tantra", label: "Tantra" },
  { value: "oracle_divination", label: "Oracle / Divination" },
  { value: "crystal_work", label: "Crystal Work" },
  { value: "ancestor_work", label: "Ancestor Work" },
  { value: "other", label: "Other" }
];

const LINEAGE_OPTIONS = [
  { value: "buddhist", label: "Buddhist" },
  { value: "hindu_yogic", label: "Hindu / Yogic" },
  { value: "christian_mysticism", label: "Christian Mysticism" },
  { value: "sufi", label: "Sufi" },
  { value: "indigenous_ancestral", label: "Indigenous / Ancestral" },
  { value: "hermetic_esoteric", label: "Hermetic / Esoteric" },
  { value: "nondual_advaita", label: "Non-dual / Advaita" },
  { value: "eclectic_personal", label: "Eclectic / Personal Path" },
  { value: "prefer_not_to_say", label: "Prefer Not to Say" }
];

const SYMBOLIC_GROUPS = [
  { value: "144000", label: "144,000 (symbolic / archetypal)" },
  { value: "lightworkers", label: "Lightworkers" },
  { value: "wayshowers", label: "Way-showers" },
  { value: "builders", label: "Builders" },
  { value: "healers", label: "Healers" },
  { value: "starseeds", label: "Starseeds" },
  { value: "earth_keepers", label: "Earth Keepers" },
  { value: "grid_workers", label: "Grid Workers" },
  { value: "transmuters", label: "Transmuters" },
  { value: "gatekeepers", label: "Gatekeepers" },
  { value: "messengers", label: "Messengers / Scribes" },
  { value: "dream_walkers", label: "Dream Walkers" },
  { value: "seers", label: "Seers / Visionaries" },
  { value: "bridge_builders", label: "Bridge Builders" },
  { value: "peace_weavers", label: "Peace Weavers" },
  { value: "truth_speakers", label: "Truth Speakers" },
  { value: "wisdom_keepers", label: "Wisdom Keepers" },
  { value: "none", label: "None" },
  { value: "prefer_not_to_say", label: "Prefer Not to Say" }
];

const CONSCIOUSNESS_ORIENTATIONS = [
  { value: "grounded_practical", label: "Grounded / Practical" },
  { value: "heart_centered", label: "Heart-centered" },
  { value: "contemplative", label: "Contemplative" },
  { value: "service_oriented", label: "Service-oriented" },
  { value: "nondual_awareness", label: "Non-dual awareness" },
  { value: "integrative", label: "Integrative (mind–body–spirit)" },
  { value: "exploratory", label: "Exploratory" },
  { value: "prefer_not_to_label", label: "Prefer Not to Label" }
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "members_only", label: "Members Only" },
  { value: "private", label: "Private (self only)" }
];

export default function SpiritualProfileEditor({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    spiritual_practices: profile?.spiritual_practices || [],
    practices_description: profile?.practices_description || '',
    lineage_tradition: profile?.lineage_tradition || '',
    lineage_custom: profile?.lineage_custom || '',
    symbolic_groups: profile?.symbolic_groups || [],
    consciousness_orientation: profile?.consciousness_orientation || [],
    profile_visibility: profile?.profile_visibility || 'public',
    visibility_settings: profile?.visibility_settings || {
      spiritual_practices: 'public',
      lineage_tradition: 'public',
      symbolic_groups: 'public',
      consciousness_orientation: 'public'
    }
  });

  const togglePractice = (practice) => {
    const current = formData.spiritual_practices || [];
    const newPractices = current.includes(practice)
      ? current.filter(p => p !== practice)
      : [...current, practice];
    setFormData({ ...formData, spiritual_practices: newPractices });
  };

  const toggleSymbolicGroup = (group) => {
    const current = formData.symbolic_groups || [];
    const newGroups = current.includes(group)
      ? current.filter(g => g !== group)
      : [...current, group];
    setFormData({ ...formData, symbolic_groups: newGroups });
  };

  const toggleOrientation = (orientation) => {
    const current = formData.consciousness_orientation || [];
    const newOrientations = current.includes(orientation)
      ? current.filter(o => o !== orientation)
      : [...current, orientation];
    setFormData({ ...formData, consciousness_orientation: newOrientations });
  };

  const setFieldVisibility = (field, visibility) => {
    setFormData({
      ...formData,
      visibility_settings: {
        ...formData.visibility_settings,
        [field]: visibility
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Voluntary Self-Expression</p>
          <p className="text-blue-700">
            All mystical identifiers are symbolic and personal. They do not imply rank, status, or authority. 
            Each field is optional and can be kept private.
          </p>
        </div>
      </div>

      {/* Overall Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overall Profile Visibility</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={formData.profile_visibility}
            onValueChange={(value) => setFormData({ ...formData, profile_visibility: value })}
          >
            {VISIBILITY_OPTIONS.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`vis-${opt.value}`} />
                <Label htmlFor={`vis-${opt.value}`} className="font-normal">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Spiritual Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Spiritual Practices
          </CardTitle>
          <CardDescription>Select all that apply (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {SPIRITUAL_PRACTICES.map(practice => (
              <div key={practice.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`practice-${practice.value}`}
                  checked={formData.spiritual_practices?.includes(practice.value)}
                  onCheckedChange={() => togglePractice(practice.value)}
                />
                <Label htmlFor={`practice-${practice.value}`} className="font-normal">
                  {practice.label}
                </Label>
              </div>
            ))}
          </div>
          
          <div>
            <Label>Additional Description (max 250 characters)</Label>
            <Textarea
              value={formData.practices_description}
              onChange={(e) => setFormData({ ...formData, practices_description: e.target.value })}
              maxLength={250}
              className="mt-2 h-20"
              placeholder="Describe your practice in your own words..."
            />
          </div>

          <div>
            <Label className="text-xs text-slate-500">Visibility</Label>
            <Select
              value={formData.visibility_settings?.spiritual_practices || 'public'}
              onValueChange={(value) => setFieldVisibility('spiritual_practices', value)}
            >
              <SelectTrigger className="w-48 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lineage / Tradition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lineage / Tradition</CardTitle>
          <CardDescription>Optional spiritual background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Tradition</Label>
            <Select
              value={formData.lineage_tradition}
              onValueChange={(value) => setFormData({ ...formData, lineage_tradition: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a tradition..." />
              </SelectTrigger>
              <SelectContent>
                {LINEAGE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Custom Description (optional)</Label>
            <Textarea
              value={formData.lineage_custom}
              onChange={(e) => setFormData({ ...formData, lineage_custom: e.target.value })}
              className="mt-2 h-20"
              placeholder="Describe your lineage or tradition..."
            />
          </div>

          <div>
            <Label className="text-xs text-slate-500">Visibility</Label>
            <Select
              value={formData.visibility_settings?.lineage_tradition || 'public'}
              onValueChange={(value) => setFieldVisibility('lineage_tradition', value)}
            >
              <SelectTrigger className="w-48 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Symbolic Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Symbolic Spiritual Groups</CardTitle>
          <CardDescription>
            Do you resonate with any symbolic spiritual groups? (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {SYMBOLIC_GROUPS.map(group => (
              <div key={group.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${group.value}`}
                  checked={formData.symbolic_groups?.includes(group.value)}
                  onCheckedChange={() => toggleSymbolicGroup(group.value)}
                />
                <Label htmlFor={`group-${group.value}`} className="font-normal">
                  {group.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
            <strong>Note:</strong> These identifiers are symbolic and personal. They do not imply rank, status, or authority.
          </div>

          <div>
            <Label className="text-xs text-slate-500">Visibility</Label>
            <Select
              value={formData.visibility_settings?.symbolic_groups || 'public'}
              onValueChange={(value) => setFieldVisibility('symbolic_groups', value)}
            >
              <SelectTrigger className="w-48 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consciousness Orientation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consciousness Orientation</CardTitle>
          <CardDescription>
            Self-perceived spiritual orientation (non-hierarchical)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {CONSCIOUSNESS_ORIENTATIONS.map(orientation => (
              <div key={orientation.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`orient-${orientation.value}`}
                  checked={formData.consciousness_orientation?.includes(orientation.value)}
                  onCheckedChange={() => toggleOrientation(orientation.value)}
                />
                <Label htmlFor={`orient-${orientation.value}`} className="font-normal">
                  {orientation.label}
                </Label>
              </div>
            ))}
          </div>

          <div>
            <Label className="text-xs text-slate-500">Visibility</Label>
            <Select
              value={formData.visibility_settings?.consciousness_orientation || 'public'}
              onValueChange={(value) => setFieldVisibility('consciousness_orientation', value)}
            >
              <SelectTrigger className="w-48 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => onSave(formData)}
        >
          Save Spiritual Profile
        </Button>
      </div>
    </div>
  );
}