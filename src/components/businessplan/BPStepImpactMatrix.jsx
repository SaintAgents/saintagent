import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Target, Heart, X } from 'lucide-react';

const SDG_GOALS = [
  { num: 1, label: 'No Poverty', color: '#E5243B' },
  { num: 2, label: 'Zero Hunger', color: '#DDA63A' },
  { num: 3, label: 'Good Health', color: '#4C9F38' },
  { num: 4, label: 'Quality Education', color: '#C5192D' },
  { num: 5, label: 'Gender Equality', color: '#FF3A21' },
  { num: 6, label: 'Clean Water', color: '#26BDE2' },
  { num: 7, label: 'Clean Energy', color: '#FCC30B' },
  { num: 8, label: 'Decent Work', color: '#A21942' },
  { num: 9, label: 'Industry & Innovation', color: '#FD6925' },
  { num: 10, label: 'Reduced Inequalities', color: '#DD1367' },
  { num: 11, label: 'Sustainable Cities', color: '#FD9D24' },
  { num: 12, label: 'Responsible Consumption', color: '#BF8B2E' },
  { num: 13, label: 'Climate Action', color: '#3F7E44' },
  { num: 14, label: 'Life Below Water', color: '#0A97D9' },
  { num: 15, label: 'Life on Land', color: '#56C02B' },
  { num: 16, label: 'Peace & Justice', color: '#00689D' },
  { num: 17, label: 'Partnerships', color: '#19486A' },
];

const PLANETARY_INDICATORS = [
  'Climate Change', 'Biodiversity Loss', 'Ocean Acidification', 'Ozone Depletion',
  'Freshwater Use', 'Land System Change', 'Biogeochemical Flows',
  'Atmospheric Aerosols', 'Novel Entities',
];

export default function BPStepImpactMatrix({ data, onChange }) {
  const impact = data.impact_matrix || {};
  const updateImpact = (updates) => {
    onChange({ impact_matrix: { ...impact, ...updates } });
  };

  const toggleSDG = (goal) => {
    const current = impact.sdg_goals || [];
    const key = `SDG ${goal.num}`;
    const updated = current.includes(key) ? current.filter(g => g !== key) : [...current, key];
    updateImpact({ sdg_goals: updated });
  };

  const toggleIndicator = (ind) => {
    const current = impact.planetary_health_indicators || [];
    const updated = current.includes(ind) ? current.filter(i => i !== ind) : [...current, ind];
    updateImpact({ planetary_health_indicators: updated });
  };

  const allocationPct = impact.humanitarian_allocation_pct ?? 10;
  const totalBudget = data.amount_requested || 0;
  const allocationAmount = totalBudget * (allocationPct / 100);

  return (
    <div className="space-y-6">
      {/* UN SDG Mapping */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-3 block flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" /> UN SDG Alignment
        </Label>
        <p className="text-xs text-slate-500 mb-3">Select which Sustainable Development Goals your project addresses.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {SDG_GOALS.map(g => {
            const selected = (impact.sdg_goals || []).includes(`SDG ${g.num}`);
            return (
              <button
                key={g.num}
                onClick={() => toggleSDG(g)}
                className={`p-2 rounded-lg border-2 text-left transition-all text-xs ${
                  selected ? 'shadow-md scale-[1.02]' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: selected ? g.color : '#e2e8f0',
                  background: selected ? g.color + '15' : 'white',
                }}
              >
                <div className="font-bold" style={{ color: g.color }}>{g.num}</div>
                <div className="text-[10px] text-slate-700 leading-tight mt-0.5">{g.label}</div>
              </button>
            );
          })}
        </div>
        {(impact.sdg_goals || []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(impact.sdg_goals || []).map(g => (
              <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Planetary Health Indicators */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-3 block">Planetary Health Boundary Indicators</Label>
        <p className="text-xs text-slate-500 mb-3">Which planetary boundaries does your project positively affect?</p>
        <div className="flex flex-wrap gap-2">
          {PLANETARY_INDICATORS.map(ind => (
            <Badge
              key={ind}
              variant={(impact.planetary_health_indicators || []).includes(ind) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                (impact.planetary_health_indicators || []).includes(ind)
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'hover:bg-slate-100'
              }`}
              onClick={() => toggleIndicator(ind)}
            >
              {ind}
              {(impact.planetary_health_indicators || []).includes(ind) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* 10% Humanitarian Allocation Tracker */}
      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
        <Label className="text-sm font-semibold text-slate-800 mb-3 block flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-600" /> Humanitarian Allocation Tracker
        </Label>
        <p className="text-xs text-slate-500 mb-4">GGT requires a minimum 10% humanitarian/community dividend embedded in the project budget.</p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">Allocation: {allocationPct}%</span>
              <span className="text-xs font-mono text-rose-700">
                ${allocationAmount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[allocationPct]}
              min={5}
              max={50}
              step={1}
              onValueChange={([v]) => updateImpact({ humanitarian_allocation_pct: v, humanitarian_allocation_amount: totalBudget * (v / 100) })}
            />
            {allocationPct < 10 && (
              <p className="text-xs text-amber-600 mt-1">⚠ Below the recommended 10% minimum</p>
            )}
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Beneficiary Communities</Label>
            <textarea
              value={impact.beneficiary_communities || ''}
              onChange={e => updateImpact({ beneficiary_communities: e.target.value })}
              placeholder="Describe the communities and populations that will benefit..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Impact Measurement Method</Label>
            <Input
              value={impact.impact_measurement_method || ''}
              onChange={e => updateImpact({ impact_measurement_method: e.target.value })}
              placeholder="How will impact be measured and verified?"
            />
          </div>
        </div>
      </div>

      {/* Funding Amount */}
      <div>
        <Label className="text-xs text-slate-600 mb-1 block">Total Funding Requested (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
          <Input
            type="number"
            value={data.amount_requested || ''}
            onChange={e => onChange({ amount_requested: parseFloat(e.target.value) || 0 })}
            placeholder="0"
            className="pl-7"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">This value feeds into the humanitarian allocation calculator above.</p>
      </div>
    </div>
  );
}