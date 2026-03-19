import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Telescope, Loader2, CheckCircle, AlertCircle, RefreshCw, TrendingUp, Target, Lightbulb, Shield, Users, Globe } from 'lucide-react';

export default function DeepDiveAIModal({ open, onClose, contact }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  if (!contact) return null;

  const isReResearch = !!contact.notes?.includes('AI Intelligence Report') || !!contact.ai_dossier;

  const handleDeepDive = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `You are a world-class intelligence analyst. Conduct an EXHAUSTIVE deep-dive research on this person. Search broadly and deeply.

SUBJECT:
- Name: ${contact.name || 'Unknown'}
- Email: ${contact.email || 'Unknown'}
- Company: ${contact.company || 'Unknown'}
- Role: ${contact.role || 'Unknown'}
- Location: ${contact.location || 'Unknown'}
- Domain: ${contact.domain || 'Unknown'}
- Tags: ${(contact.tags || []).join(', ') || 'None'}

EXISTING INTEL (if any):
${contact.notes?.substring(0, 500) || 'None'}
${contact.ai_dossier?.recommended_approach || ''}

RESEARCH MANDATE:
1. PROFESSIONAL DEEP DIVE: Full career history, current responsibilities, decision-making authority, team size, budget authority
2. COMPANY ANALYSIS: Market position, recent funding/M&A, competitor landscape, growth trajectory, technology stack, key partnerships
3. DIGITAL FOOTPRINT: Publications, speaking engagements, podcast appearances, conference talks, thought leadership content
4. NETWORK MAP: Key professional connections, board memberships, advisory roles, industry associations
5. RECENT DEVELOPMENTS: Last 90 days of news, social media activity, company announcements, job changes
6. STRATEGIC OPPORTUNITIES: Pain points, budget cycles, buying signals, competitive threats they face
7. OUTREACH STRATEGY: Best channels, optimal timing, conversation hooks, mutual connections to leverage
8. RISK ASSESSMENT: Red flags, potential objections, political dynamics, decision process complexity

Be thorough. If you can't find specific info, note "Research gap - needs manual verification" rather than guessing.`;

    try {
      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            executive_summary: { type: 'string', description: '2-3 sentence overview' },
            professional_profile: {
              type: 'object', properties: {
                career_history: { type: 'string' },
                current_scope: { type: 'string' },
                decision_authority: { type: 'string' },
                specializations: { type: 'array', items: { type: 'string' } }
              }
            },
            company_analysis: {
              type: 'object', properties: {
                market_position: { type: 'string' },
                recent_news: { type: 'string' },
                growth_trajectory: { type: 'string' },
                tech_stack: { type: 'string' },
                key_partnerships: { type: 'string' }
              }
            },
            digital_footprint: {
              type: 'object', properties: {
                publications: { type: 'array', items: { type: 'string' } },
                speaking: { type: 'array', items: { type: 'string' } },
                social_activity: { type: 'string' }
              }
            },
            network_map: { type: 'array', items: { type: 'string' }, description: 'Key connections and affiliations' },
            recent_developments: { type: 'array', items: { type: 'string' }, description: 'Last 90 days' },
            strategic_opportunities: {
              type: 'object', properties: {
                pain_points: { type: 'array', items: { type: 'string' } },
                buying_signals: { type: 'array', items: { type: 'string' } },
                competitive_threats: { type: 'array', items: { type: 'string' } }
              }
            },
            outreach_strategy: {
              type: 'object', properties: {
                best_channels: { type: 'array', items: { type: 'string' } },
                conversation_hooks: { type: 'array', items: { type: 'string' } },
                timing_recommendation: { type: 'string' },
                recommended_approach: { type: 'string' }
              }
            },
            risk_assessment: {
              type: 'object', properties: {
                red_flags: { type: 'array', items: { type: 'string' } },
                potential_objections: { type: 'array', items: { type: 'string' } }
              }
            },
            confidence_score: { type: 'number' }
          }
        }
      });

      setResult(aiResult);

      // Save deep dive to contact notes and ai_dossier
      const timestamp = new Date().toLocaleDateString();
      const deepDiveNotes = `\n\n🔬 AI Deep Dive Intel Report\nGenerated: ${timestamp}\n\n**Executive Summary:**\n${aiResult.executive_summary || 'N/A'}\n\n**Professional Profile:**\n- Career: ${aiResult.professional_profile?.career_history || 'N/A'}\n- Current Scope: ${aiResult.professional_profile?.current_scope || 'N/A'}\n- Decision Authority: ${aiResult.professional_profile?.decision_authority || 'N/A'}\n\n**Company Analysis:**\n- Market Position: ${aiResult.company_analysis?.market_position || 'N/A'}\n- Recent News: ${aiResult.company_analysis?.recent_news || 'N/A'}\n- Growth: ${aiResult.company_analysis?.growth_trajectory || 'N/A'}\n\n**Digital Footprint:**\n${aiResult.digital_footprint?.publications?.length ? aiResult.digital_footprint.publications.map(p => `- ${p}`).join('\n') : '- No publications found'}\n\n**Recent Developments:**\n${aiResult.recent_developments?.length ? aiResult.recent_developments.map(d => `- ${d}`).join('\n') : '- None found'}\n\n**Outreach Strategy:**\n${aiResult.outreach_strategy?.recommended_approach || 'Standard outreach'}\n\n---\nDeep Dive Confidence: ${aiResult.confidence_score || 0}%`;

      const updateData = {
        notes: contact.notes ? `${contact.notes}\n\n---${deepDiveNotes}` : deepDiveNotes.trim(),
        ai_dossier: {
          ...contact.ai_dossier,
          pain_point: aiResult.strategic_opportunities?.pain_points?.[0] || contact.ai_dossier?.pain_point,
          value_prop: aiResult.outreach_strategy?.conversation_hooks?.[0] || contact.ai_dossier?.value_prop,
          recommended_approach: aiResult.outreach_strategy?.recommended_approach || contact.ai_dossier?.recommended_approach,
          talking_points: aiResult.outreach_strategy?.conversation_hooks || contact.ai_dossier?.talking_points,
          company_intel: aiResult.company_analysis?.market_position || contact.ai_dossier?.company_intel,
        },
        last_enriched_at: new Date().toISOString(),
      };
      await base44.entities.Contact.update(contact.id, updateData);
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const Section = ({ icon: Icon, title, children, color = 'text-violet-500' }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <div className="ml-6 text-sm text-slate-600">{children}</div>
    </div>
  );

  const ListItems = ({ items }) => {
    if (!items?.length) return <p className="text-slate-400 italic text-xs">No data found</p>;
    return <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-xs">• {item}</li>)}</ul>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Telescope className="w-5 h-5 text-violet-500" />
            Deep Dive AI Research — {contact.name}
          </DialogTitle>
          <DialogDescription>
            {isReResearch ? 'Re-research for latest intel and updates' : 'Comprehensive AI-powered intelligence gathering'}
          </DialogDescription>
        </DialogHeader>

        {!result && !loading && (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="p-4 rounded-full bg-violet-100">
              <Telescope className="w-10 h-10 text-violet-600" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="font-semibold text-slate-900 mb-1">
                {isReResearch ? 'Re-Research This Contact' : 'Launch Deep Dive Research'}
              </h3>
              <p className="text-sm text-slate-500">
                AI will search the web extensively for career history, company analysis, digital footprint, 
                strategic opportunities, and craft a personalized outreach strategy.
              </p>
            </div>
            <Button onClick={handleDeepDive} className="bg-violet-600 hover:bg-violet-700 gap-2">
              {isReResearch ? <RefreshCw className="w-4 h-4" /> : <Telescope className="w-4 h-4" />}
              <span className="text-white">{isReResearch ? 'Re-Research for Updates' : 'Start Deep Dive'}</span>
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-500 animate-pulse">Conducting deep research across the web...</p>
            <Progress value={45} className="w-48 h-2" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span className="text-sm text-rose-700">{error}</span>
          </div>
        )}

        {result && (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {/* Confidence */}
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-100 text-violet-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Confidence: {result.confidence_score || 0}%
                </Badge>
                <Badge variant="outline" className="text-xs">Saved to contact</Badge>
              </div>

              {/* Executive Summary */}
              {result.executive_summary && (
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                  <p className="text-sm font-medium text-violet-900">{result.executive_summary}</p>
                </div>
              )}

              <Section icon={Users} title="Professional Profile" color="text-blue-500">
                <p><strong>Career:</strong> {result.professional_profile?.career_history || 'N/A'}</p>
                <p><strong>Current Scope:</strong> {result.professional_profile?.current_scope || 'N/A'}</p>
                <p><strong>Decision Authority:</strong> {result.professional_profile?.decision_authority || 'N/A'}</p>
                {result.professional_profile?.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.professional_profile.specializations.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}
              </Section>

              <Section icon={Globe} title="Company Analysis" color="text-emerald-500">
                <p><strong>Market:</strong> {result.company_analysis?.market_position || 'N/A'}</p>
                <p><strong>News:</strong> {result.company_analysis?.recent_news || 'N/A'}</p>
                <p><strong>Growth:</strong> {result.company_analysis?.growth_trajectory || 'N/A'}</p>
                {result.company_analysis?.tech_stack && <p><strong>Tech:</strong> {result.company_analysis.tech_stack}</p>}
                {result.company_analysis?.key_partnerships && <p><strong>Partners:</strong> {result.company_analysis.key_partnerships}</p>}
              </Section>

              <Section icon={TrendingUp} title="Recent Developments (90 days)">
                <ListItems items={result.recent_developments} />
              </Section>

              <Section icon={Target} title="Strategic Opportunities" color="text-amber-500">
                <p className="font-medium text-xs text-slate-700 mb-1">Pain Points:</p>
                <ListItems items={result.strategic_opportunities?.pain_points} />
                <p className="font-medium text-xs text-slate-700 mt-2 mb-1">Buying Signals:</p>
                <ListItems items={result.strategic_opportunities?.buying_signals} />
              </Section>

              <Section icon={Lightbulb} title="Outreach Strategy" color="text-cyan-500">
                <p><strong>Approach:</strong> {result.outreach_strategy?.recommended_approach || 'N/A'}</p>
                <p><strong>Timing:</strong> {result.outreach_strategy?.timing_recommendation || 'N/A'}</p>
                <p className="font-medium text-xs text-slate-700 mt-2 mb-1">Conversation Hooks:</p>
                <ListItems items={result.outreach_strategy?.conversation_hooks} />
                <p className="font-medium text-xs text-slate-700 mt-2 mb-1">Best Channels:</p>
                <ListItems items={result.outreach_strategy?.best_channels} />
              </Section>

              <Section icon={Shield} title="Risk Assessment" color="text-rose-500">
                <p className="font-medium text-xs text-slate-700 mb-1">Red Flags:</p>
                <ListItems items={result.risk_assessment?.red_flags} />
                <p className="font-medium text-xs text-slate-700 mt-2 mb-1">Potential Objections:</p>
                <ListItems items={result.risk_assessment?.potential_objections} />
              </Section>

              {result.network_map?.length > 0 && (
                <Section icon={Users} title="Network Map" color="text-indigo-500">
                  <ListItems items={result.network_map} />
                </Section>
              )}

              {/* Re-research button */}
              <div className="pt-2 border-t flex justify-center">
                <Button variant="outline" size="sm" onClick={handleDeepDive} className="gap-2">
                  <RefreshCw className="w-3 h-3" /> Research Again for Updates
                </Button>
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end pt-3 border-t">
          <Button variant="outline" onClick={onClose}>
            {result ? 'Done' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}