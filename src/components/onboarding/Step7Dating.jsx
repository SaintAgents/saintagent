import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Sparkles, X } from "lucide-react";

const relationshipTypes = [
  { value: 'monogamous', label: 'Monogamous', icon: Heart },
  { value: 'polyamorous', label: 'Polyamorous', icon: Users },
  { value: 'open', label: 'Open Relationship', icon: Sparkles },
  { value: 'casual', label: 'Casual Dating', icon: Heart },
  { value: 'long_term', label: 'Long-term', icon: Heart },
  { value: 'friendship', label: 'Friendship First', icon: Users },
  { value: 'life_partner', label: 'Life Partner', icon: Heart },
  { value: 'not_seeking', label: 'Not Seeking', icon: X }
];

const qualityOptions = [
  'Emotionally Intelligent', 'Spiritually Aware', 'Adventurous', 'Grounded',
  'Creative', 'Ambitious', 'Compassionate', 'Honest', 'Playful', 'Authentic',
  'Growth-Oriented', 'Empathetic', 'Mindful', 'Passionate', 'Loyal',
  'Independent', 'Communicative', 'Supportive', 'Open-Minded', 'Humorous'
];

export default function Step7Dating({ data = {}, onChange, onUpdate, onComplete }) {
  const [customQualitySeeking, setCustomQualitySeeking] = useState('');
  const [customQualityProviding, setCustomQualityProviding] = useState('');

  const setData = onChange || onUpdate || (() => {});

  const handleStatusChange = (status) => {
    if (!status) return;
    setData({ ...data, relationship_status: status });
  };

  const handleTypeToggle = (type) => {
    if (!type) return;
    const types = data.relationship_type_seeking || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    setData({ ...data, relationship_type_seeking: newTypes });
  };

  const handleInterestedInToggle = (value) => {
    if (!value) return;
    const prefs = data.dating_preferences || {};
    const interested = prefs.interested_in || [];
    const newInterested = interested.includes(value)
      ? interested.filter(i => i !== value)
      : [...interested, value];
    setData({ 
      ...data, 
      dating_preferences: { ...prefs, interested_in: newInterested }
    });
  };

  const handleQualitySeekingToggle = (quality) => {
    if (!quality) return;
    const qualities = data.qualities_seeking || [];
    const newQualities = qualities.includes(quality)
      ? qualities.filter(q => q !== quality)
      : [...qualities, quality];
    setData({ ...data, qualities_seeking: newQualities });
  };

  const handleQualityProvidingToggle = (quality) => {
    if (!quality) return;
    const qualities = data.qualities_providing || [];
    const newQualities = qualities.includes(quality)
      ? qualities.filter(q => q !== quality)
      : [...qualities, quality];
    setData({ ...data, qualities_providing: newQualities });
  };

  const addCustomQualitySeeking = () => {
    if (customQualitySeeking.trim()) {
      const qualities = data.qualities_seeking || [];
      setData({ ...data, qualities_seeking: [...qualities, customQualitySeeking.trim()] });
      setCustomQualitySeeking('');
    }
  };

  const addCustomQualityProviding = () => {
    if (customQualityProviding.trim()) {
      const qualities = data.qualities_providing || [];
      setData({ ...data, qualities_providing: [...qualities, customQualityProviding.trim()] });
      setCustomQualityProviding('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection & Relationships</h2>
        <p className="text-slate-600">Share what you're seeking in connections (completely optional)</p>
      </div>

      {/* Relationship Status */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Current Relationship Status</Label>
        <RadioGroup value={data.relationship_status} onValueChange={handleStatusChange}>
          <div className="grid grid-cols-2 gap-3">
            {['single', 'dating', 'committed', 'married', 'open', 'complicated', 'prefer_not_to_say'].map(status => (
              <div key={status} className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <RadioGroupItem value={status} id={status} />
                <Label htmlFor={status} className="capitalize cursor-pointer flex-1">
                  {status.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Relationship Types Seeking */}
      <div>
        <Label className="text-base font-semibold mb-3 block">What type(s) of relationships are you open to?</Label>
        <div className="grid grid-cols-2 gap-3">
          {relationshipTypes.map(({ value, label, icon: Icon }) => {
            const isSelected = (data.relationship_type_seeking || []).includes(value);
            return (
              <button
                key={value}
                onClick={() => handleTypeToggle(value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                <p className="font-medium text-slate-900">{label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interested In */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Interested in connecting with</Label>
        <div className="flex flex-wrap gap-3">
          {['men', 'women', 'non_binary', 'all'].map(value => {
            const isSelected = (data.dating_preferences?.interested_in || []).includes(value);
            return (
              <button
                key={value}
                onClick={() => handleInterestedInToggle(value)}
                className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {value === 'non_binary' ? 'Non-Binary' : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Age Range Preference</Label>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            placeholder="Min"
            value={data.dating_preferences?.age_range_min || ''}
            onChange={(e) => setData({
              ...data,
              dating_preferences: {
                ...data.dating_preferences,
                age_range_min: parseInt(e.target.value) || undefined
              }
            })}
            className="w-24"
          />
          <span className="text-slate-500">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={data.dating_preferences?.age_range_max || ''}
            onChange={(e) => setData({
              ...data,
              dating_preferences: {
                ...data.dating_preferences,
                age_range_max: parseInt(e.target.value) || undefined
              }
            })}
            className="w-24"
          />
        </div>
      </div>

      {/* Qualities Seeking */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Qualities I'm Seeking</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {qualityOptions.map(quality => {
            const isSelected = (data.qualities_seeking || []).includes(quality);
            return (
              <Badge
                key={quality}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 ${isSelected ? 'bg-rose-500' : ''}`}
                onClick={() => handleQualitySeekingToggle(quality)}
              >
                {quality}
              </Badge>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add custom quality..."
            value={customQualitySeeking}
            onChange={(e) => setCustomQualitySeeking(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomQualitySeeking()}
          />
          <Button onClick={addCustomQualitySeeking} variant="outline">Add</Button>
        </div>
      </div>

      {/* Qualities Providing */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Qualities I Provide</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {qualityOptions.map(quality => {
            const isSelected = (data.qualities_providing || []).includes(quality);
            return (
              <Badge
                key={quality}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 ${isSelected ? 'bg-violet-500' : ''}`}
                onClick={() => handleQualityProvidingToggle(quality)}
              >
                {quality}
              </Badge>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add custom quality..."
            value={customQualityProviding}
            onChange={(e) => setCustomQualityProviding(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomQualityProviding()}
          />
          <Button onClick={addCustomQualityProviding} variant="outline">Add</Button>
        </div>
      </div>
    </div>
  );
}