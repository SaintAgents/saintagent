import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Scale, Eye, X } from 'lucide-react';

const ENTITY_STRUCTURES = [
  { value: '508c1a', label: '508(c)(1)(a) Church/Ministry', desc: 'Tax-exempt religious organization' },
  { value: 'sovereign_trust', label: 'Sovereign Trust', desc: 'Asset protection and stewardship trust' },
  { value: 'public_benefit_corp', label: 'Public Benefit Corporation', desc: 'For-profit with social mission mandate' },
  { value: 'decentralized_association', label: 'Decentralized Association', desc: 'DAO or distributed governance' },
  { value: 'llc', label: 'LLC', desc: 'Limited liability company' },
  { value: 'cooperative', label: 'Cooperative', desc: 'Member-owned cooperative' },
  { value: 'ngo', label: 'NGO / Non-Profit', desc: 'Non-governmental organization' },
  { value: 'other', label: 'Other', desc: 'Custom structure' },
];

const TRANSPARENCY_MEASURES = [
  'Public Ledger', 'Quarterly Reports', 'Real-Time Dashboard', 'Annual Audit',
  'Community Board Oversight', 'Multi-Sig Treasury', 'Whistleblower Protocol',
  'Open-Source Codebase', 'Third-Party Verification',
];

export default function BPStepGovernance({ data, onChange }) {
  const gov = data.governance || {};
  const updateGov = (updates) => {
    onChange({ governance: { ...gov, ...updates } });
  };

  const toggleTransparency = (measure) => {
    const current = gov.transparency_measures || [];
    const updated = current.includes(measure) ? current.filter(m => m !== measure) : [...current, measure];
    updateGov({ transparency_measures: updated });
  };

  return (
    <div className="space-y-6">
      {/* Entity Structuring */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-3 block flex items-center gap-2">
          <Scale className="w-4 h-4 text-violet-600" /> Entity Structure
        </Label>
        <Select value={data.entity_structure || ''} onValueChange={v => onChange({ entity_structure: v })}>
          <SelectTrigger><SelectValue placeholder="Select legal structure..." /></SelectTrigger>
          <SelectContent>
            {ENTITY_STRUCTURES.map(es => (
              <SelectItem key={es.value} value={es.value}>
                <div>
                  <div className="font-medium">{es.label}</div>
                  <div className="text-xs text-slate-500">{es.desc}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-slate-600 mb-1 block">Entity Structure Notes</Label>
        <textarea
          value={gov.entity_structure_notes || ''}
          onChange={e => updateGov({ entity_structure_notes: e.target.value })}
          placeholder="Additional notes about your chosen legal structure, jurisdictions, or hybrid arrangements..."
          className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[60px] focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
          rows={2}
        />
      </div>

      {/* Multi-Sig & Governance */}
      <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/30">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-violet-600" /> Governance & Multi-Sig Charter
        </h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-slate-700">Multi-Signature Treasury</Label>
              <p className="text-xs text-slate-500">Requires multiple approvals for fund disbursement</p>
            </div>
            <Switch checked={gov.multi_sig_required || false} onCheckedChange={v => updateGov({ multi_sig_required: v })} />
          </div>

          {gov.multi_sig_required && (
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Number of Required Signatories</Label>
              <Input
                type="number"
                min={2}
                max={10}
                value={gov.signatories_count || ''}
                onChange={e => updateGov({ signatories_count: parseInt(e.target.value) || 0 })}
                placeholder="3"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-slate-700">Independent Oversight Board</Label>
              <p className="text-xs text-slate-500">External advisory or oversight committee</p>
            </div>
            <Switch checked={gov.oversight_board || false} onCheckedChange={v => updateGov({ oversight_board: v })} />
          </div>

          <div>
            <Label className="text-xs text-slate-600 mb-1 block">Custody Protocol</Label>
            <Input
              value={gov.custody_protocol || ''}
              onChange={e => updateGov({ custody_protocol: e.target.value })}
              placeholder="How are funds and assets custodied?"
            />
          </div>
        </div>
      </div>

      {/* Transparency Measures */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-3 block flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-600" /> Transparency Measures
        </Label>
        <p className="text-xs text-slate-500 mb-3">Select all transparency and accountability measures you will implement.</p>
        <div className="flex flex-wrap gap-2">
          {TRANSPARENCY_MEASURES.map(m => (
            <Badge
              key={m}
              variant={(gov.transparency_measures || []).includes(m) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                (gov.transparency_measures || []).includes(m)
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : 'hover:bg-slate-100'
              }`}
              onClick={() => toggleTransparency(m)}
            >
              {m}
              {(gov.transparency_measures || []).includes(m) && <X className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Compliance Jurisdictions */}
      <div>
        <Label className="text-xs text-slate-600 mb-1 block">Compliance Jurisdictions</Label>
        <Input
          value={(gov.compliance_jurisdictions || []).join(', ')}
          onChange={e => updateGov({ compliance_jurisdictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="e.g., United States, EU, Singapore (comma separated)"
        />
      </div>

      {/* Team & Geography */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Team Size</Label>
          <Input type="number" value={data.team_size || ''} onChange={e => onChange({ team_size: parseInt(e.target.value) || 0 })} placeholder="0" />
        </div>
        <div>
          <Label className="text-xs text-slate-600 mb-1 block">Geographic Focus</Label>
          <Input value={data.geographic_focus || ''} onChange={e => onChange({ geographic_focus: e.target.value })} placeholder="Region, country, or global" />
        </div>
      </div>
    </div>
  );
}