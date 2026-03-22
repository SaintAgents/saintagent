import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Wrench, Handshake, Scale } from 'lucide-react';

const READINESS_OPTIONS = [
  { value: 'team', label: 'Team in Place', desc: 'Core team assembled and committed', icon: Users },
  { value: 'prototype', label: 'Prototype / Product', desc: 'Working MVP, prototype, or finished product', icon: Wrench },
  { value: 'partnerships', label: 'Partnerships', desc: 'Strategic partners, letters of intent, or MoUs', icon: Handshake },
  { value: 'legal_structure', label: 'Legal Structure', desc: 'Registered entity, LLC, nonprofit, or incorporation', icon: Scale },
];

export default function IntakeStepReadiness({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  const toggleItem = (val) => {
    const current = formData.readiness_items || [];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    update('readiness_items', updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">What Do You Currently Have in Place?</Label>
        <div className="grid grid-cols-1 gap-2">
          {READINESS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const checked = (formData.readiness_items || []).includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  checked
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleItem(opt.value)}
                />
                <div className={`p-1.5 rounded-md ${checked ? 'bg-violet-100' : 'bg-slate-100'}`}>
                  <Icon className={`w-4 h-4 ${checked ? 'text-violet-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className={`text-sm font-medium ${checked ? 'text-violet-700' : 'text-slate-700'}`}>{opt.label}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}