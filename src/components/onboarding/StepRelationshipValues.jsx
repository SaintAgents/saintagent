import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Info, Star, Sparkles, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const coreValues = [
  { value: 'honesty', label: 'Honesty', description: 'Truth and transparency' },
  { value: 'loyalty', label: 'Loyalty', description: 'Commitment and dedication' },
  { value: 'growth', label: 'Growth', description: 'Personal development together' },
  { value: 'adventure', label: 'Adventure', description: 'Exploring life together' },
  { value: 'stability', label: 'Stability', description: 'Security and consistency' },
  { value: 'independence', label: 'Independence', description: 'Individual autonomy' },
  { value: 'family', label: 'Family', description: 'Building family bonds' },
  { value: 'spirituality', label: 'Spirituality', description: 'Shared spiritual path' },
  { value: 'creativity', label: 'Creativity', description: 'Creative expression' },
  { value: 'service', label: 'Service', description: 'Helping others together' },
  { value: 'intimacy', label: 'Intimacy', description: 'Deep emotional connection' },
  { value: 'humor', label: 'Humor', description: 'Laughter and lightness' },
  { value: 'respect', label: 'Respect', description: 'Mutual honor and regard' },
  { value: 'communication', label: 'Communication', description: 'Open dialogue' },
  { value: 'passion', label: 'Passion', description: 'Intensity and desire' },
  { value: 'partnership', label: 'Partnership', description: 'True teamwork' }
];

const dealbreakers = [
  'Dishonesty',
  'Substance abuse',
  'Lack of ambition',
  'Different life goals',
  'Incompatible values',
  'Poor communication',
  'Controlling behavior',
  'Disrespect',
  'Infidelity history',
  'No growth mindset',
  'Emotional unavailability',
  'Financial irresponsibility'
];

export default function StepRelationshipValues({ data = {}, onChange, onComplete }) {
  const [showInfo, setShowInfo] = useState(false);
  const setData = onChange || (() => {});

  const selectedValues = data.core_values_ranked || [];
  const selectedDealbreakers = data.dealbreakers || [];

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      setData({ ...data, core_values_ranked: selectedValues.filter(v => v !== value) });
    } else if (selectedValues.length < 5) {
      setData({ ...data, core_values_ranked: [...selectedValues, value] });
    }
  };

  const toggleDealbreaker = (value) => {
    if (selectedDealbreakers.includes(value)) {
      setData({ ...data, dealbreakers: selectedDealbreakers.filter(v => v !== value) });
    } else if (selectedDealbreakers.length < 5) {
      setData({ ...data, dealbreakers: [...selectedDealbreakers, value] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Relationship Values</h2>
        <p className="text-slate-600">What matters most to you in a relationship?</p>
      </div>

      <Collapsible open={showInfo} onOpenChange={setShowInfo}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-2 text-left hover:bg-rose-100 transition-colors">
            <Info className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm text-rose-800 font-medium">Why do values matter in matching?</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Shared values</strong> are one of the strongest predictors of long-term relationship success. 
            They form the foundation of how you'll make decisions together.
          </p>
          <p className="text-sm text-slate-600">
            We weight your top 5 values heavily in matching. Partners with 3+ shared values 
            in their top 5 tend to report significantly higher compatibility scores.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Core Values Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-semibold">
            <Star className="w-4 h-4 inline mr-1 text-amber-500" />
            Top 5 Relationship Values
          </Label>
          <span className="text-sm text-slate-500">{selectedValues.length}/5 selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {coreValues.map(({ value, label, description }) => {
            const isSelected = selectedValues.includes(value);
            const rank = selectedValues.indexOf(value) + 1;
            return (
              <button
                key={value}
                onClick={() => toggleValue(value)}
                disabled={!isSelected && selectedValues.length >= 5}
                className={`group relative px-3 py-2 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-rose-500 bg-rose-50' 
                    : selectedValues.length >= 5 
                      ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' 
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
                      {rank}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${isSelected ? 'text-rose-700' : 'text-slate-700'}`}>
                    {label}
                  </span>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {description}
                </div>
              </button>
            );
          })}
        </div>
        {selectedValues.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-100">
            <p className="text-sm text-rose-800 font-medium mb-2">Your ranked values:</p>
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((v, i) => (
                <Badge key={v} className="bg-rose-100 text-rose-700 gap-1">
                  <span className="font-bold">{i + 1}.</span> {coreValues.find(cv => cv.value === v)?.label}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleValue(v); }}
                    className="ml-1 hover:text-rose-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dealbreakers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-semibold">
            <X className="w-4 h-4 inline mr-1 text-red-500" />
            Dealbreakers (up to 5)
          </Label>
          <span className="text-sm text-slate-500">{selectedDealbreakers.length}/5 selected</span>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          These help us filter out incompatible matches. Be selective - too many limits options.
        </p>
        <div className="flex flex-wrap gap-2">
          {dealbreakers.map((db) => {
            const isSelected = selectedDealbreakers.includes(db);
            return (
              <button
                key={db}
                onClick={() => toggleDealbreaker(db)}
                disabled={!isSelected && selectedDealbreakers.length >= 5}
                className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
                  isSelected 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : selectedDealbreakers.length >= 5 
                      ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed text-slate-400' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {db}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vision Statement */}
      <div>
        <Label className="text-base font-semibold mb-2 block">
          <Sparkles className="w-4 h-4 inline mr-1 text-violet-500" />
          Relationship Vision (optional)
        </Label>
        <p className="text-sm text-slate-500 mb-2">
          Describe what your ideal relationship looks like in 2-3 sentences.
        </p>
        <Textarea
          value={data.long_term_vision || ''}
          onChange={(e) => setData({ ...data, long_term_vision: e.target.value })}
          placeholder="e.g., I envision a partnership where we support each other's growth while building a life of adventure and purpose together..."
          className="min-h-24"
          maxLength={500}
        />
        <p className="text-xs text-slate-400 mt-1 text-right">
          {(data.long_term_vision || '').length}/500
        </p>
      </div>

      <Button 
        className="w-full bg-violet-600 hover:bg-violet-700 mt-4" 
        onClick={() => onComplete && onComplete(data)}
        disabled={selectedValues.length < 3}
      >
        Continue
      </Button>
      {selectedValues.length < 3 && (
        <p className="text-xs text-center text-slate-500">Select at least 3 values to continue</p>
      )}
    </div>
  );
}