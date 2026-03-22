import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Landmark, TrendingUp, Wallet, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FUNDING_TYPES = [
  { value: 'grant', label: 'Grant', desc: 'Nonprofit / No repayment required', icon: Landmark },
  { value: 'investment', label: 'Investment', desc: 'For-profit / ROI-based return', icon: TrendingUp },
  { value: 'bridge_funding', label: 'Bridge Funding', desc: 'Short-term capital to bridge a gap', icon: Wallet },
];

export default function IntakeStepFunding({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });
  const [aiLoading, setAiLoading] = useState(false);

  const generateUseOfFunds = async () => {
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a funding advisor. Based on the following project details, suggest a realistic "Use of Funds" breakdown with percentage allocations.

Project title: ${formData.title || 'Untitled'}
Description: ${formData.description || 'No description provided'}
Funding type: ${formData.funding_type || 'Not specified'}
Amount requested: ${formData.amount_requested ? '$' + Number(formData.amount_requested).toLocaleString() : 'Not specified'}
Stage: ${formData.stage || 'idea'}
Problem statement: ${formData.problem_statement || ''}

Return a concise breakdown like:
40% Product Development - Engineering, prototyping, testing
25% Operations - Staffing, facilities, equipment
20% Marketing & Outreach - Community engagement, branding
10% Legal & Compliance - Licensing, permits, insurance
5% Reserve - Contingency fund

Tailor it specifically to this project type and stage. Be specific, not generic. Keep it under 8 lines.`,
    });
    update('use_of_funds', res);
    setAiLoading(false);
  };

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
        <div className="flex items-center justify-between mb-1">
          <Label className="text-sm font-medium">Use of Funds (Breakdown) *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            disabled={aiLoading}
            onClick={generateUseOfFunds}
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {aiLoading ? 'Generating...' : 'AI Suggest'}
          </Button>
        </div>
        <Textarea
          value={formData.use_of_funds || ''}
          onChange={(e) => update('use_of_funds', e.target.value)}
          placeholder="e.g., 40% Product Development, 30% Marketing, 20% Operations, 10% Reserve..."
          className="min-h-20"
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