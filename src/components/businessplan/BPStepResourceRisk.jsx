import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle, Lock, Plus, Trash2, X } from 'lucide-react';

const RISK_CATEGORIES = {
  supply_chain: ['Raw Material Scarcity', 'Supplier Dependency', 'Logistics Disruption', 'Cost Volatility', 'Import/Export Barriers'],
  climate: ['Drought', 'Flooding', 'Extreme Heat', 'Wildfire', 'Sea Level Rise', 'Storm Damage'],
  regulatory: ['Policy Changes', 'Tax Reform', 'Licensing Requirements', 'Environmental Regulations', 'Cross-Border Compliance', 'Sanctions Risk'],
};

export default function BPStepResourceRisk({ data, onChange }) {
  const resource = data.resource_calculator || {};
  const risk = data.risk_assessment || {};
  const milestones = data.escrow_milestones || [];

  const updateResource = (updates) => {
    const merged = { ...resource, ...updates };
    // Auto-calculate total
    merged.total_estimated_cost = (merged.material_costs || 0) + (merged.labor_cost_monthly || 0) * 12 + (merged.energy_requirements_kwh || 0) * 0.12;
    onChange({ resource_calculator: merged });
  };

  const updateRisk = (updates) => {
    onChange({ risk_assessment: { ...risk, ...updates } });
  };

  const toggleRisk = (category, item) => {
    const current = risk[category] || [];
    const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    updateRisk({ [category]: updated });
  };

  const addMilestone = () => {
    const ms = { id: Date.now().toString(), title: '', amount: 0, target_date: '', verification_method: '', status: 'pending' };
    onChange({ escrow_milestones: [...milestones, ms] });
  };

  const updateMilestone = (id, updates) => {
    onChange({ escrow_milestones: milestones.map(m => m.id === id ? { ...m, ...updates } : m) });
  };

  const removeMilestone = (id) => {
    onChange({ escrow_milestones: milestones.filter(m => m.id !== id) });
  };

  const totalEscrow = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Interactive Resource Calculator */}
      <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/30">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-cyan-600" /> Interactive Resource Calculator
        </h4>
        <p className="text-xs text-slate-500 mb-4">Dynamically calculates project viability based on resource inputs.</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Land Area (acres)</Label>
            <Input type="number" value={resource.land_area_acres || ''} onChange={e => updateResource({ land_area_acres: parseFloat(e.target.value) || 0 })} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Material Costs ($)</Label>
            <Input type="number" value={resource.material_costs || ''} onChange={e => updateResource({ material_costs: parseFloat(e.target.value) || 0 })} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Energy (kWh/month)</Label>
            <Input type="number" value={resource.energy_requirements_kwh || ''} onChange={e => updateResource({ energy_requirements_kwh: parseFloat(e.target.value) || 0 })} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Labor Headcount</Label>
            <Input type="number" value={resource.labor_headcount || ''} onChange={e => updateResource({ labor_headcount: parseInt(e.target.value) || 0 })} placeholder="0" />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Labor Cost ($/month)</Label>
            <Input type="number" value={resource.labor_cost_monthly || ''} onChange={e => updateResource({ labor_cost_monthly: parseFloat(e.target.value) || 0 })} placeholder="0" />
          </div>
          <div className="flex items-end">
            <div className="p-3 rounded-lg bg-cyan-100 border border-cyan-200 w-full text-center">
              <div className="text-xs text-cyan-700 font-medium">Est. Annual Cost</div>
              <div className="text-lg font-bold text-cyan-900">${(resource.total_estimated_cost || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone-Based Escrow Planner */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" /> Milestone-Based Escrow Planner
          </h4>
          <Button variant="outline" size="sm" onClick={addMilestone} className="gap-1">
            <Plus className="w-3 h-3" /> Add Milestone
          </Button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Capital is released upon verified milestone completion (Proof-of-Execution), not lump-sum.</p>

        {milestones.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No milestones added yet. Click "Add Milestone" to begin planning escrow releases.
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((ms, i) => (
              <div key={ms.id} className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700">Milestone {i + 1}</span>
                  <button onClick={() => removeMilestone(ms.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <Input value={ms.title} onChange={e => updateMilestone(ms.id, { title: e.target.value })} placeholder="Milestone title..." className="text-sm" />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-500">Amount ($)</Label>
                    <Input type="number" value={ms.amount || ''} onChange={e => updateMilestone(ms.id, { amount: parseFloat(e.target.value) || 0 })} className="text-sm" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500">Target Date</Label>
                    <Input type="date" value={ms.target_date || ''} onChange={e => updateMilestone(ms.id, { target_date: e.target.value })} className="text-sm" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500">Verification</Label>
                    <Input value={ms.verification_method || ''} onChange={e => updateMilestone(ms.id, { verification_method: e.target.value })} placeholder="How to verify" className="text-sm" />
                  </div>
                </div>
              </div>
            ))}
            <div className="text-right text-sm font-semibold text-amber-800">
              Total Escrow: ${totalEscrow.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Risk & Resiliency Stress Test */}
      <div className="p-4 rounded-xl border border-red-200 bg-red-50/30">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-600" /> Risk & Resiliency Stress Test
        </h4>

        {Object.entries(RISK_CATEGORIES).map(([catKey, items]) => (
          <div key={catKey} className="mb-4">
            <Label className="text-xs font-semibold text-slate-700 mb-2 block capitalize">{catKey.replace('_', ' ')} Risks</Label>
            <div className="flex flex-wrap gap-1.5">
              {items.map(item => (
                <Badge
                  key={item}
                  variant={(risk[catKey + '_risks'] || risk[catKey] || []).includes(item) ? 'default' : 'outline'}
                  className={`cursor-pointer text-xs transition-all ${
                    (risk[catKey + '_risks'] || risk[catKey] || []).includes(item)
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => toggleRisk(catKey === 'supply_chain' ? 'supply_chain_risks' : catKey === 'climate' ? 'climate_factors' : 'regulatory_risks', item)}
                >
                  {item}
                  {(risk[catKey + '_risks'] || risk[catKey] || []).includes(item) && <X className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Mitigation Strategies</Label>
          <textarea
            value={risk.mitigation_strategies || ''}
            onChange={e => updateRisk({ mitigation_strategies: e.target.value })}
            placeholder="Describe your risk mitigation and resiliency strategies..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            rows={3}
          />
        </div>
      </div>

      <div>
        <Label className="text-xs text-slate-600 mb-1 block">Project Timeline (months)</Label>
        <Input type="number" value={data.timeline_months || ''} onChange={e => onChange({ timeline_months: parseInt(e.target.value) || 0 })} placeholder="12" />
      </div>
    </div>
  );
}