import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, MapPin, Users } from 'lucide-react';

export default function IntakeStepImpact({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-pink-500" /> Who Does This Project Benefit? *
        </Label>
        <Textarea
          value={formData.impact_beneficiaries || ''}
          onChange={(e) => update('impact_beneficiaries', e.target.value)}
          placeholder="Describe the communities, groups, or populations this project serves..."
          className="mt-1 min-h-20"
        />
      </div>

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-500" /> What Is the Scale of Impact? *
        </Label>
        <Textarea
          value={formData.impact_scale || ''}
          onChange={(e) => update('impact_scale', e.target.value)}
          placeholder="e.g., 10,000 families in the first year, expanding to 100,000 globally..."
          className="mt-1 min-h-20"
        />
      </div>

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Geographic Focus
        </Label>
        <Input
          value={formData.geographic_focus || ''}
          onChange={(e) => update('geographic_focus', e.target.value)}
          placeholder="e.g., North America, Sub-Saharan Africa, Global..."
          className="mt-1"
        />
      </div>
    </div>
  );
}