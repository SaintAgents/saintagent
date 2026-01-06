import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Settings, MapPin, Users, Heart, Sliders, 
  Globe, Home, Plane, Info, Sparkles
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const communicationPrefs = [
  { value: 'daily', label: 'Daily', desc: 'Regular check-ins every day' },
  { value: 'few_times_week', label: 'Few times/week', desc: 'Every 2-3 days' },
  { value: 'weekly', label: 'Weekly', desc: 'Once a week is enough' }
];

const locationPrefs = [
  { value: 'fixed', label: 'Settled', icon: Home, desc: 'I prefer staying in one place' },
  { value: 'flexible', label: 'Flexible', icon: Globe, desc: 'Open to relocating for the right person' },
  { value: 'nomadic', label: 'Nomadic', icon: Plane, desc: 'I travel frequently / location-independent' }
];

export default function StepPartnerPreferences({ data = {}, onChange, onComplete }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const setData = onChange || (() => {});

  const prefs = data.dating_preferences || {};
  const domainWeights = data.domain_weights || {
    identity_values: 0.3,
    emotional_stability: 0.25,
    communication: 0.2,
    growth: 0.15,
    lifestyle: 0.1
  };

  const updatePrefs = (key, value) => {
    setData({ 
      ...data, 
      dating_preferences: { ...prefs, [key]: value }
    });
  };

  const updateDomainWeight = (domain, value) => {
    const newWeights = { ...domainWeights, [domain]: value / 100 };
    // Normalize weights to sum to 1
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    Object.keys(newWeights).forEach(k => {
      newWeights[k] = newWeights[k] / total;
    });
    setData({ ...data, domain_weights: newWeights });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Partner Preferences</h2>
        <p className="text-slate-600">Fine-tune who you'd like to meet</p>
      </div>

      {/* Basic Preferences */}
      <div className="space-y-5">
        {/* Interested In */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            <Users className="w-4 h-4 inline mr-1" />
            Interested in connecting with
          </Label>
          <div className="flex flex-wrap gap-2">
            {['men', 'women', 'non_binary', 'all'].map(value => {
              const isSelected = (prefs.interested_in || []).includes(value);
              return (
                <button
                  key={value}
                  onClick={() => {
                    const current = prefs.interested_in || [];
                    const newVal = isSelected 
                      ? current.filter(i => i !== value)
                      : [...current, value];
                    updatePrefs('interested_in', newVal);
                  }}
                  className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
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
          <Label className="text-base font-semibold mb-3 block">Age Range</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min age"
                value={prefs.age_range_min || ''}
                onChange={(e) => updatePrefs('age_range_min', parseInt(e.target.value) || undefined)}
                min={18}
                max={99}
              />
            </div>
            <span className="text-slate-500">to</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max age"
                value={prefs.age_range_max || ''}
                onChange={(e) => updatePrefs('age_range_max', parseInt(e.target.value) || undefined)}
                min={18}
                max={99}
              />
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            <MapPin className="w-4 h-4 inline mr-1" />
            Maximum Distance
          </Label>
          <div className="space-y-3">
            <Slider
              value={[prefs.distance_max_miles || 100]}
              onValueChange={([val]) => updatePrefs('distance_max_miles', val)}
              max={500}
              step={10}
              className="py-4"
            />
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Nearby</span>
              <span className="font-medium text-indigo-600">
                {prefs.distance_max_miles || 100} miles
                {(prefs.distance_max_miles || 100) >= 500 && ' (Anywhere)'}
              </span>
              <span className="text-slate-500">Anywhere</span>
            </div>
          </div>
        </div>

        {/* Location Mobility */}
        <div>
          <Label className="text-base font-semibold mb-3 block">My Location Flexibility</Label>
          <RadioGroup 
            value={data.location_mobility || 'flexible'} 
            onValueChange={(val) => setData({ ...data, location_mobility: val })}
          >
            <div className="grid grid-cols-3 gap-3">
              {locationPrefs.map(({ value, label, icon: Icon, desc }) => {
                const isSelected = (data.location_mobility || 'flexible') === value;
                return (
                  <div 
                    key={value}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setData({ ...data, location_mobility: value })}
                  >
                    <RadioGroupItem value={value} id={`loc-${value}`} className="sr-only" />
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <Label htmlFor={`loc-${value}`} className="font-medium text-sm cursor-pointer block">{label}</Label>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Communication Frequency */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Preferred Communication Frequency</Label>
          <RadioGroup 
            value={data.comm_frequency || 'daily'} 
            onValueChange={(val) => setData({ ...data, comm_frequency: val })}
          >
            <div className="space-y-2">
              {communicationPrefs.map(({ value, label, desc }) => {
                const isSelected = (data.comm_frequency || 'daily') === value;
                return (
                  <div 
                    key={value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setData({ ...data, comm_frequency: value })}
                  >
                    <RadioGroupItem value={value} id={`comm-${value}`} />
                    <div>
                      <Label htmlFor={`comm-${value}`} className="font-medium cursor-pointer">{label}</Label>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Advanced Settings */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">Advanced Matching Settings</span>
            </div>
            <Badge variant="outline">Optional</Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Adjust how much weight each compatibility domain has in your matches. 
              Default weights are based on relationship research.
            </p>
          </div>

          {/* Domain Weights */}
          <div className="space-y-4">
            {[
              { key: 'identity_values', label: 'Values & Identity', default: 30 },
              { key: 'emotional_stability', label: 'Emotional Style', default: 25 },
              { key: 'communication', label: 'Communication', default: 20 },
              { key: 'growth', label: 'Growth Orientation', default: 15 },
              { key: 'lifestyle', label: 'Lifestyle', default: 10 }
            ].map(({ key, label, default: def }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <Label className="text-sm">{label}</Label>
                  <span className="text-sm font-medium text-indigo-600">
                    {Math.round((domainWeights[key] || def / 100) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[Math.round((domainWeights[key] || def / 100) * 100)]}
                  onValueChange={([val]) => updateDomainWeight(key, val)}
                  max={50}
                  min={5}
                  step={5}
                />
              </div>
            ))}
          </div>

          {/* Strict Dealbreakers */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div>
              <Label className="font-medium">Strict Dealbreakers</Label>
              <p className="text-xs text-slate-500">
                Only show matches with zero dealbreaker overlaps
              </p>
            </div>
            <Switch
              checked={data.strict_dealbreakers !== false}
              onCheckedChange={(val) => setData({ ...data, strict_dealbreakers: val })}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="pt-4">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 mb-4 flex items-start gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            You can always adjust these preferences later in your profile settings.
          </p>
        </div>
        <Button 
          className="w-full bg-violet-600 hover:bg-violet-700" 
          onClick={() => onComplete && onComplete(data)}
        >
          Save Preferences & Continue
        </Button>
      </div>
    </div>
  );
}