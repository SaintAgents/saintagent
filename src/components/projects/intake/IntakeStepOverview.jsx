import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function IntakeStepOverview({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Brief Description of the Project *</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe what this project does, its goals, and key deliverables..."
          className="mt-1 min-h-24"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">What Problem Does This Solve? *</Label>
        <Textarea
          value={formData.problem_statement || ''}
          onChange={(e) => update('problem_statement', e.target.value)}
          placeholder="Describe the core problem or need this project addresses..."
          className="mt-1 min-h-20"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Current Stage *</Label>
        <Select
          value={formData.stage || 'idea'}
          onValueChange={(v) => update('stage', v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="idea">Idea — Concept phase, no product yet</SelectItem>
            <SelectItem value="prototype">Early Stage — Prototype or MVP in progress</SelectItem>
            <SelectItem value="pilot">Active — Operating and generating traction</SelectItem>
            <SelectItem value="scaling">Scaling — Growing and expanding operations</SelectItem>
            <SelectItem value="mature_ops">Mature — Established and optimizing</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}