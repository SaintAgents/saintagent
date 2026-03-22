import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, Sparkles } from 'lucide-react';

export default function IntakeStepAlignment({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-violet-500" /> Why Does This Project Align With Our Funding Mission? *
        </Label>
        <Textarea
          value={formData.alignment_statement || ''}
          onChange={(e) => update('alignment_statement', e.target.value)}
          placeholder="Explain how your project aligns with our values, mission, and strategic objectives..."
          className="mt-1 min-h-24"
        />
      </div>

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> What Does Success Look Like for You? *
        </Label>
        <Textarea
          value={formData.success_definition || ''}
          onChange={(e) => update('success_definition', e.target.value)}
          placeholder="Describe your vision of success — milestones, outcomes, and the ultimate goal..."
          className="mt-1 min-h-24"
        />
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Disclaimer:</strong> Submission of this form does not guarantee funding. All projects are subject 
          to review, due diligence, and structuring based on funding category. Our team will review your 
          submission and follow up within 5–7 business days.
        </p>
      </div>
    </div>
  );
}