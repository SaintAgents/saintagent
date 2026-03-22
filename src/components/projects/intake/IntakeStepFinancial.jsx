import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const STRUCTURE_OPTIONS = [
  { value: 'equity', label: 'Equity' },
  { value: 'revenue_share', label: 'Revenue Share' },
  { value: 'structured_return', label: 'Structured Return' },
  { value: 'success_fee', label: 'Success Fee' },
];

export default function IntakeStepFinancial({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  const toggleStructure = (val) => {
    const current = formData.open_to_structures || [];
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    update('open_to_structures', updated);
  };

  // Only show this step for investment or bridge funding
  const isGrantOnly = formData.funding_type === 'grant';

  if (isGrantOnly) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700 font-medium">Grant Funding Selected</p>
          <p className="text-xs text-emerald-600 mt-1">
            Since you are seeking grant funding, detailed financial structuring is not required. 
            You may still provide revenue information if applicable.
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">Revenue Model (if applicable)</Label>
          <Input
            value={formData.revenue_model || ''}
            onChange={(e) => update('revenue_model', e.target.value)}
            placeholder="How does or will the project sustain itself?"
            className="mt-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Revenue Model *</Label>
        <Input
          value={formData.revenue_model || ''}
          onChange={(e) => update('revenue_model', e.target.value)}
          placeholder="e.g., SaaS subscriptions, service fees, product sales..."
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Current Revenue</Label>
          <Input
            value={formData.current_revenue || ''}
            onChange={(e) => update('current_revenue', e.target.value)}
            placeholder="e.g., $5,000/month or Pre-revenue"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Projected Revenue</Label>
          <Input
            value={formData.projected_revenue || ''}
            onChange={(e) => update('projected_revenue', e.target.value)}
            placeholder="e.g., $50,000/month within 12 months"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Exit or Repayment Plan *</Label>
        <Textarea
          value={formData.exit_repayment_plan || ''}
          onChange={(e) => update('exit_repayment_plan', e.target.value)}
          placeholder="How will investors be repaid? Describe your exit strategy or repayment timeline..."
          className="mt-1 min-h-20"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Are You Open To:</Label>
        <div className="grid grid-cols-2 gap-3">
          {STRUCTURE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:border-violet-300 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={(formData.open_to_structures || []).includes(opt.value)}
                onCheckedChange={() => toggleStructure(opt.value)}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}