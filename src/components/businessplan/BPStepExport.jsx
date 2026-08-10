import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Presentation, Globe, Loader2, Sparkles, CheckCircle2, Download } from 'lucide-react';

const SDG_LABELS = {
  'SDG 1': 'No Poverty', 'SDG 2': 'Zero Hunger', 'SDG 3': 'Good Health', 'SDG 4': 'Quality Education',
  'SDG 5': 'Gender Equality', 'SDG 6': 'Clean Water', 'SDG 7': 'Clean Energy', 'SDG 8': 'Decent Work',
  'SDG 9': 'Industry & Innovation', 'SDG 10': 'Reduced Inequalities', 'SDG 11': 'Sustainable Cities',
  'SDG 12': 'Responsible Consumption', 'SDG 13': 'Climate Action', 'SDG 14': 'Life Below Water',
  'SDG 15': 'Life on Land', 'SDG 16': 'Peace & Justice', 'SDG 17': 'Partnerships',
};

function CompletionCheck({ label, done }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${done ? 'text-emerald-700' : 'text-slate-400'}`}>
      <CheckCircle2 className={`w-4 h-4 ${done ? 'text-emerald-500' : 'text-slate-300'}`} />
      {label}
    </div>
  );
}

export default function BPStepExport({ data, onChange }) {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(data.ai_generated_summary || '');

  const sovereign = data.sovereign_intake || {};
  const fin = data.financial_model || {};
  const impact = data.impact_matrix || {};
  const gov = data.governance || {};
  const risk = data.risk_assessment || {};

  const checks = [
    { label: 'Funding Track Selected', done: !!data.funding_track },
    { label: 'Mission Statement', done: !!sovereign.mission_statement },
    { label: 'Financial Model (Revenue)', done: !!(fin.traditional?.revenue_year1) },
    { label: 'Regenerative Metrics', done: !!(fin.regenerative?.ecological_yield) },
    { label: 'SDG Goals Selected', done: (impact.sdg_goals || []).length > 0 },
    { label: 'Humanitarian Allocation', done: (impact.humanitarian_allocation_pct ?? 0) >= 10 },
    { label: 'Entity Structure', done: !!data.entity_structure },
    { label: 'Governance Framework', done: !!(gov.transparency_measures?.length) },
    { label: 'Risk Assessment', done: !!(risk.supply_chain_risks?.length || risk.climate_factors?.length) },
    { label: 'Escrow Milestones', done: (data.escrow_milestones || []).length > 0 },
  ];
  const completionPct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  const generateAISummary = async () => {
    setGenerating(true);
    try {
      const prompt = `You are a professional business plan analyst for the Gaia Global Treasury (GGT). Generate a comprehensive executive summary for this project:

Title: ${data.title}
Funding Track: ${data.funding_track || 'Not specified'}
Project Type: ${data.project_type || 'Not specified'}
Mission: ${sovereign.mission_statement || 'Not provided'}
Entity Structure: ${data.entity_structure || 'Not specified'}
Amount Requested: $${(data.amount_requested || 0).toLocaleString()}
Geographic Focus: ${data.geographic_focus || 'Not specified'}
Timeline: ${data.timeline_months || '?'} months
Team Size: ${data.team_size || '?'}

Financial Model:
- Year 1 Revenue: $${(fin.traditional?.revenue_year1 || 0).toLocaleString()}
- Year 1 Costs: $${(fin.traditional?.costs_year1 || 0).toLocaleString()}
- CapEx: $${(fin.traditional?.capex || 0).toLocaleString()}

Regenerative Metrics:
- Carbon Offset: ${fin.regenerative?.carbon_offset_tons || 0} tons/yr
- Jobs Created: ${fin.regenerative?.jobs_created || 0}
- Lives Impacted: ${fin.regenerative?.lives_impacted || 0}
- Ecological Yield: ${fin.regenerative?.ecological_yield || 'Not specified'}

SDG Alignment: ${(impact.sdg_goals || []).join(', ') || 'None selected'}
Humanitarian Allocation: ${impact.humanitarian_allocation_pct || 10}%
Transparency Measures: ${(gov.transparency_measures || []).join(', ') || 'None specified'}

Assets: ${sovereign.asset_description || 'Not described'}
RWA Types: ${(sovereign.rwa_types || []).join(', ') || 'None'}
Collateral Value: $${(sovereign.collateral_value || 0).toLocaleString()}

Risk Factors: ${[...(risk.supply_chain_risks || []), ...(risk.climate_factors || []), ...(risk.regulatory_risks || [])].join(', ') || 'None identified'}
Mitigation: ${risk.mitigation_strategies || 'Not provided'}

Generate a 3-4 paragraph executive summary suitable for an institutional/sovereign dossier. Include: project overview, financial viability, impact potential, governance structure, and a recommendation tier (Strong Candidate / Promising / Needs Development / Incomplete).`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setSummary(result);
      onChange({ ai_generated_summary: result, completion_pct: completionPct });
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Completion Checklist */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm text-slate-900">Plan Completion</h4>
          <div className={`text-sm font-bold ${completionPct >= 80 ? 'text-emerald-600' : completionPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {completionPct}%
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
          <div className="h-2 rounded-full transition-all" style={{ width: `${completionPct}%`, background: completionPct >= 80 ? '#10b981' : completionPct >= 50 ? '#f59e0b' : '#ef4444' }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {checks.map((c, i) => <CompletionCheck key={i} {...c} />)}
        </div>
      </div>

      {/* AI Summary Generator */}
      <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/30">
        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-600" /> AI Executive Summary
        </h4>
        <p className="text-xs text-slate-500 mb-3">Generate a professional executive summary for your dossier using AI analysis.</p>

        <Button onClick={generateAISummary} disabled={generating} className="w-full bg-violet-600 hover:bg-violet-700 gap-2 mb-3">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating...' : summary ? 'Regenerate Summary' : 'Generate Executive Summary'}
        </Button>

        {summary && (
          <div className="p-4 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
            {summary}
          </div>
        )}
      </div>

      {/* Export Options */}
      <div>
        <Label className="text-sm font-semibold text-slate-800 mb-3 block">Export Options</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-slate-900">Sovereign Dossier</div>
            <p className="text-xs text-slate-500 mt-1 mb-3">Formal whitepaper for treasury review</p>
            <Button variant="outline" size="sm" className="gap-1 w-full" disabled>
              <Download className="w-3 h-3" /> Coming Soon
            </Button>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
            <Presentation className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-slate-900">Executive Briefing</div>
            <p className="text-xs text-slate-500 mt-1 mb-3">High-impact visual pitch deck</p>
            <Button variant="outline" size="sm" className="gap-1 w-full" disabled>
              <Download className="w-3 h-3" /> Coming Soon
            </Button>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white text-center">
            <Globe className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="font-semibold text-sm text-slate-900">Onboarding Portal</div>
            <p className="text-xs text-slate-500 mt-1 mb-3">Interactive web summary</p>
            <Button variant="outline" size="sm" className="gap-1 w-full" disabled>
              <Download className="w-3 h-3" /> Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}