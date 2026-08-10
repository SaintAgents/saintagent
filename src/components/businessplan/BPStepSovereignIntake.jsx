import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Landmark, Coins, TreePine, X } from 'lucide-react';

const FUNDING_TRACKS = [
  { value: 'humanitarian', label: 'Humanitarian Initiative', desc: '10% allocation model, non-profit focus', icon: '🤝' },
  { value: 'infrastructure', label: 'Resource-Backed Infrastructure', desc: 'Asset-backed development, RWA integration', icon: '🏗️' },
  { value: 'commercial', label: 'Sustainable Commercial', desc: 'Revenue-generating with regenerative goals', icon: '🌱' },
  { value: 'hybrid', label: 'Hybrid Model', desc: 'Blended humanitarian + commercial', icon: '⚡' },
];

const RWA_TYPES = [
  'Land/Real Estate', 'Mineral Rights', 'Water Rights', 'Timber/Forestry',
  'Agricultural Yield', 'Solar/Wind Assets', 'Infrastructure', 'IP/Patents',
  'Carbon Credits', 'Biodiversity Credits', 'Cultural Heritage', 'Other',
];

const PROJECT_TYPES = [
  { value: 'eco_agriculture', label: 'Eco-Agriculture' },
  { value: 'clean_energy', label: 'Clean Energy' },
  { value: 'local_infrastructure', label: 'Local Infrastructure' },
  { value: 'technology_platform', label: 'Technology Platform' },
  { value: 'water_stewardship', label: 'Water Stewardship' },
  { value: 'housing', label: 'Housing' },
  { value: 'healing_wellness', label: 'Healing & Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'governance', label: 'Governance' },
  { value: 'other', label: 'Other' },
];

export default function BPStepSovereignIntake({ data, onChange }) {
  const sovereign = data.sovereign_intake || {};
  const updateSovereign = (updates) => {
    onChange({ sovereign_intake: { ...sovereign, ...updates } });
  };

  const toggleRWA = (type) => {
    const current = sovereign.rwa_types || [];
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    updateSovereign({ rwa_types: updated });
  };

  return (
    <div className="space-y-6">
      {/* Funding Track */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-3 block flex items-center gap-2">
          <Landmark className="w-4 h-4 text-amber-600" /> Funding Track Classification
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUNDING_TRACKS.map(t => (
            <button
              key={t.value}
              onClick={() => onChange({ funding_track: t.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.funding_track === t.value
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{t.icon}</span>
                <span className="font-semibold text-sm text-slate-900">{t.label}</span>
              </div>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Project Type */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-2 block">Project Type</Label>
        <Select value={data.project_type || ''} onValueChange={v => onChange({ project_type: v })}>
          <SelectTrigger><SelectValue placeholder="Select project type..." /></SelectTrigger>
          <SelectContent>
            {PROJECT_TYPES.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Mission Statement */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-2 block flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" /> Mission Statement
        </Label>
        <textarea
          value={sovereign.mission_statement || ''}
          onChange={e => updateSovereign({ mission_statement: e.target.value })}
          placeholder="Describe how your venture interfaces with the GGT ecosystem and its core mission..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          rows={4}
        />
      </div>

      {/* Asset & Legacy Mapping */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-2 block flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-600" /> Real-World Assets (RWA)
        </Label>
        <p className="text-xs text-slate-500 mb-3">Select all asset types relevant to your project for tokenization or digital twin integration.</p>
        <div className="flex flex-wrap gap-2">
          {RWA_TYPES.map(type => (
            <Badge
              key={type}
              variant={sovereign.rwa_types?.includes(type) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                sovereign.rwa_types?.includes(type)
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'hover:bg-slate-100'
              }`}
              onClick={() => toggleRWA(type)}
            >
              {type}
              {sovereign.rwa_types?.includes(type) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Asset Description */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-2 block">Asset & Collateral Description</Label>
        <textarea
          value={sovereign.asset_description || ''}
          onChange={e => updateSovereign({ asset_description: e.target.value })}
          placeholder="Describe existing collateral, land/resource stewardship rights, or assets..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Collateral Value (USD)</Label>
          <Input
            type="number"
            value={sovereign.collateral_value || ''}
            onChange={e => updateSovereign({ collateral_value: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div className="flex items-end gap-3 pb-1">
          <div className="flex items-center gap-2">
            <Switch
              checked={sovereign.tokenization_ready || false}
              onCheckedChange={v => updateSovereign({ tokenization_ready: v })}
            />
            <Label className="text-xs text-slate-600">Tokenization Ready</Label>
          </div>
        </div>
      </div>

      {/* GGRR Alignment */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-2 block flex items-center gap-2">
          <TreePine className="w-4 h-4 text-green-600" /> GGRR Alignment
        </Label>
        <textarea
          value={sovereign.ggrr_alignment || ''}
          onChange={e => updateSovereign({ ggrr_alignment: e.target.value })}
          placeholder="How does this project align with the Gaia Global Resource Repository?"
          className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          rows={2}
        />
      </div>
    </div>
  );
}