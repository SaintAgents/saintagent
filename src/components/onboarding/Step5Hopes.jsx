import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const HOPES = [
  { code: "financial_freedom", label: "Financial freedom" },
  { code: "meaningful_wealth", label: "Build meaningful wealth" },
  { code: "recognized_teacher", label: "Become a recognized teacher" },
  { code: "community_leader", label: "Become a community leader" },
  { code: "launch_movement", label: "Launch a movement" },
  { code: "find_mission", label: "Find my life mission" },
  { code: "heal_patterns", label: "Heal major life patterns" },
  { code: "conscious_community", label: "Build a conscious family/community" },
  { code: "master_craft", label: "Master my craft" },
  { code: "serve_humanity", label: "Serve humanity at scale" },
  { code: "create_legacy", label: "Create a legacy system" }
];

export default function Step5Hopes({ data, onComplete, user }) {
  const [formData, setFormData] = useState({
    hopes: data.hopes || [],
    time_horizon: data.time_horizon || '1_year',
    commitment_level: data.commitment_level || 'builder'
  });

  const toggleHope = (code) => {
    const hopes = formData.hopes.includes(code)
      ? formData.hopes.filter(c => c !== code)
      : formData.hopes.length < 5
      ? [...formData.hopes, code]
      : formData.hopes;
    setFormData({ ...formData, hopes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save hopes to database
    for (const code of formData.hopes) {
      await base44.entities.UserHope.create({
        user_id: user.email,
        hope_code: code,
        time_horizon: formData.time_horizon,
        commitment_level: formData.commitment_level
      });
    }
    
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Hopes & North Star</h2>
        <p className="text-slate-600">What outcomes are you reaching for?</p>
      </div>

      <div>
        <Label className="text-base mb-3 block">Pick up to 5 aspirational outcomes</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HOPES.map((hope) => {
            const isSelected = formData.hopes.includes(hope.code);
            
            return (
              <button
                key={hope.code}
                type="button"
                onClick={() => toggleHope(hope.code)}
                disabled={!isSelected && formData.hopes.length >= 5}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected 
                    ? "border-violet-500 bg-violet-50" 
                    : "border-slate-200 bg-white hover:border-violet-200",
                  !isSelected && formData.hopes.length >= 5 && "opacity-50"
                )}
              >
                <p className="text-sm font-medium text-slate-900">{hope.label}</p>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-slate-500 mt-2">{formData.hopes.length}/5 selected</p>
      </div>

      <div>
        <Label className="text-base mb-3 block">Time Horizon</Label>
        <RadioGroup
          value={formData.time_horizon}
          onValueChange={(value) => setFormData({ ...formData, time_horizon: value })}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30_days" id="30_days" />
              <Label htmlFor="30_days" className="font-normal">30 days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="90_days" id="90_days" />
              <Label htmlFor="90_days" className="font-normal">90 days</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1_year" id="1_year" />
              <Label htmlFor="1_year" className="font-normal">1 year</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3_years" id="3_years" />
              <Label htmlFor="3_years" className="font-normal">3 years</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base mb-3 block">Commitment Level</Label>
        <RadioGroup
          value={formData.commitment_level}
          onValueChange={(value) => setFormData({ ...formData, commitment_level: value })}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="explorer" id="explorer" />
              <Label htmlFor="explorer" className="font-normal">Explorer (light exploration)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="builder" id="builder" />
              <Label htmlFor="builder" className="font-normal">Builder (steady progress)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="operator" id="operator" />
              <Label htmlFor="operator" className="font-normal">Operator (serious commitment)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ascender" id="ascender" />
              <Label htmlFor="ascender" className="font-normal">Ascender (full immersion)</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Button
        type="submit"
        disabled={formData.hopes.length === 0}
        className="w-full bg-violet-600 hover:bg-violet-700"
      >
        Continue
      </Button>
    </form>
  );
}