import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Leaf, TrendingUp } from 'lucide-react';

function CurrencyInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <Label className="text-xs text-slate-600 mb-1 block">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
        <Input
          type="number"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder || '0'}
          className="pl-7"
        />
      </div>
    </div>
  );
}

export default function BPStepFinancialModel({ data, onChange }) {
  const fin = data.financial_model || { traditional: {}, regenerative: {} };
  const trad = fin.traditional || {};
  const regen = fin.regenerative || {};

  const updateTrad = (updates) => {
    onChange({ financial_model: { ...fin, traditional: { ...trad, ...updates } } });
  };
  const updateRegen = (updates) => {
    onChange({ financial_model: { ...fin, regenerative: { ...regen, ...updates } } });
  };

  const profit1 = (trad.revenue_year1 || 0) - (trad.costs_year1 || 0);
  const profit2 = (trad.revenue_year2 || 0) - (trad.costs_year2 || 0);
  const profit3 = (trad.revenue_year3 || 0) - (trad.costs_year3 || 0);

  return (
    <div className="space-y-6">
      {/* Traditional Financial Ledger */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-blue-600" /> Traditional Liquidity & Ledger
        </h4>
        <p className="text-xs text-slate-500 mb-4">Standard P&L, cash flow projection, and operational runway.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center text-xs font-semibold text-slate-500 pb-1">Year 1</div>
            <div className="text-center text-xs font-semibold text-slate-500 pb-1">Year 2</div>
            <div className="text-center text-xs font-semibold text-slate-500 pb-1">Year 3</div>
          </div>

          <div>
            <Label className="text-xs text-slate-700 font-medium mb-2 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Projected Revenue
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <CurrencyInput label="" value={trad.revenue_year1} onChange={v => updateTrad({ revenue_year1: v })} />
              <CurrencyInput label="" value={trad.revenue_year2} onChange={v => updateTrad({ revenue_year2: v })} />
              <CurrencyInput label="" value={trad.revenue_year3} onChange={v => updateTrad({ revenue_year3: v })} />
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-700 font-medium mb-2 block">Operating Costs</Label>
            <div className="grid grid-cols-3 gap-3">
              <CurrencyInput label="" value={trad.costs_year1} onChange={v => updateTrad({ costs_year1: v })} />
              <CurrencyInput label="" value={trad.costs_year2} onChange={v => updateTrad({ costs_year2: v })} />
              <CurrencyInput label="" value={trad.costs_year3} onChange={v => updateTrad({ costs_year3: v })} />
            </div>
          </div>

          {/* Auto-calculated P&L */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <Label className="text-xs text-slate-700 font-medium mb-2 block">Net Profit / (Loss)</Label>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[profit1, profit2, profit3].map((p, i) => (
                <div key={i} className={`text-sm font-bold ${p >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ${p.toLocaleString()}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput label="Capital Expenditure (CapEx)" value={trad.capex} onChange={v => updateTrad({ capex: v })} />
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Runway (months)</Label>
              <Input type="number" value={trad.runway_months || ''} onChange={e => updateTrad({ runway_months: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Break-Even Month</Label>
            <Input type="number" value={trad.break_even_month || ''} onChange={e => updateTrad({ break_even_month: parseInt(e.target.value) || 0 })} placeholder="Month #" />
          </div>
        </div>
      </div>

      {/* Regenerative & Resource Yield Ledger */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <Leaf className="w-4 h-4 text-emerald-600" /> Regenerative & Resource Yield Ledger
        </h4>
        <p className="text-xs text-slate-500 mb-4">Tracks ecological yield, community ROI, and non-monetary value metrics.</p>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Ecological Yield Description</Label>
            <textarea
              value={regen.ecological_yield || ''}
              onChange={e => updateRegen({ ecological_yield: e.target.value })}
              placeholder="Describe ecological outputs: soil restoration, water purification, habitat creation..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Carbon Offset (tons/yr)</Label>
              <Input type="number" value={regen.carbon_offset_tons || ''} onChange={e => updateRegen({ carbon_offset_tons: parseFloat(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Biodiversity Score (1-100)</Label>
              <Input type="number" min={0} max={100} value={regen.biodiversity_score || ''} onChange={e => updateRegen({ biodiversity_score: parseFloat(e.target.value) || 0 })} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Jobs Created</Label>
              <Input type="number" value={regen.jobs_created || ''} onChange={e => updateRegen({ jobs_created: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Lives Impacted</Label>
              <Input type="number" value={regen.lives_impacted || ''} onChange={e => updateRegen({ lives_impacted: parseInt(e.target.value) || 0 })} placeholder="0" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Community ROI Description</Label>
            <textarea
              value={regen.community_roi || ''}
              onChange={e => updateRegen({ community_roi: e.target.value })}
              placeholder="How does this project return value to the local community?"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Local Economic Velocity</Label>
            <Input
              value={regen.local_economic_velocity || ''}
              onChange={e => updateRegen({ local_economic_velocity: e.target.value })}
              placeholder="How does revenue circulate locally?"
            />
          </div>
        </div>
      </div>
    </div>
  );
}