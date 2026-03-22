import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DollarSign, Landmark, TrendingUp, Wallet } from 'lucide-react';

const FUNDING_TYPES = [
  { value: 'grant', label: 'Grant', desc: 'Nonprofit / No repayment required', icon: Landmark },
  { value: 'investment', label: 'Investment', desc: 'For-profit / ROI-based return', icon: TrendingUp },
  { value: 'bridge_funding', label: 'Bridge Funding', desc: 'Short-term capital to bridge a gap', icon: Wallet },
];

export default function IntakeStepFunding({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium mb-2 block">Which Type of Funding Are You Seeking? *</Label>
        <div className="grid grid-cols-1 gap-2">
          {FUNDING_TYPES.map((ft) => {
            const Icon = ft.icon;
            const selected = formData.funding_type === ft.value;
            return (
              <button
                key={ft.value}
                type="button"
                onClick={() => update('funding_type', ft.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  selected
                    ? 'border-violet-600 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${selected ? 'bg-violet-100' : 'bg-slate-100'}`}>
                  <Icon className={`w-5 h-5 ${selected ? 'text-violet-600' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className={`font-medium text-sm ${selected ? 'text-violet-700' : 'text-slate-700'}`}>{ft.label}</div>
                  <div className="text-xs text-slate-500">{ft.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" /> Amount Requested *
        </Label>
        <Input
          type="number"
          value={formData.amount_requested || ''}
          onChange={(e) => update('amount_requested', e.target.value)}
          placeholder="Enter amount in USD"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Use of Funds (Breakdown) *</Label>
        <Textarea
          value={formData.use_of_funds || ''}
          onChange={(e) => update('use_of_funds', e.target.value)}
          placeholder="e.g., 40% Product Development, 30% Marketing, 20% Operations, 10% Reserve..."
          className="mt-1 min-h-20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Timeline for Use of Funds</Label>
          <Input
            value={formData.funding_timeline || ''}
            onChange={(e) => update('funding_timeline', e.target.value)}
            placeholder="e.g., 12 months"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Other Funding Sources</Label>
          <Input
            value={formData.other_funding_sources || ''}
            onChange={(e) => update('other_funding_sources', e.target.value)}
            placeholder="e.g., SBA loan, angel investors..."
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}