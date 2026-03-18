import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain, Zap, AlertTriangle, TrendingUp, Clock, RefreshCw,
  Loader2, Eye, Send, Sparkles, Target, ThermometerSun,
  UserCheck, ArrowUpRight, Flame, Snowflake, ChevronRight
} from 'lucide-react';
import StaleDealReviver from './StaleDealReviver';
import SentimentMonitor from './SentimentMonitor';
import IntentSignalPanel from './IntentSignalPanel';

export default function SynchronicityEngine({ contacts = [], currentUserId }) {
  const [enrichingAll, setEnrichingAll] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const queryClient = useQueryClient();

  // Calculate pipeline stats
  const staleContacts = contacts.filter(c => {
    if (!c.last_contact_date) return true;
    const daysSince = Math.floor((Date.now() - new Date(c.last_contact_date).getTime()) / 86400000);
    return daysSince > 30;
  });

  const hotContacts = contacts.filter(c => c.sentiment_label === 'hot' || c.priority_tier === 'critical');
  const frustratedContacts = contacts.filter(c => c.sentiment_label === 'frustrated');
  const needsEnrichment = contacts.filter(c => !c.ai_dossier || !c.last_enriched_at);

  const handleEnrichAll = async () => {
    setEnrichingAll(true);
    setEnrichProgress(0);
    const toEnrich = needsEnrichment.slice(0, 10); // Max 10 at a time

    for (let i = 0; i < toEnrich.length; i++) {
      const contact = toEnrich[i];
      try {
        const dossier = await base44.integrations.Core.InvokeLLM({
          prompt: `Research this business contact and generate a sales intelligence dossier:
Name: ${contact.name}
Company: ${contact.company || 'Unknown'}
Role: ${contact.role || 'Unknown'}
Industry: ${contact.domain || 'Unknown'}
Location: ${contact.location || 'Unknown'}
Notes: ${contact.notes || 'None'}
Tags: ${(contact.tags || []).join(', ') || 'None'}

Generate practical intelligence for a business development professional.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              pain_point: { type: 'string', description: 'Likely current pain point based on role/industry' },
              recent_win: { type: 'string', description: 'Recent positive development for their company' },
              value_prop: { type: 'string', description: 'Suggested value proposition to lead with' },
              talking_points: { type: 'array', items: { type: 'string' }, description: '3 conversation starters' },
              company_intel: { type: 'string', description: 'Brief company intelligence summary' },
              recommended_approach: { type: 'string', description: 'Best approach strategy for this contact' },
              priority_tier: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              sentiment_label: { type: 'string', enum: ['cold', 'neutral', 'warm', 'hot'] }
            }
          }
        });

        await base44.entities.Contact.update(contact.id, {
          ai_dossier: {
            pain_point: dossier.pain_point,
            recent_win: dossier.recent_win,
            value_prop: dossier.value_prop,
            talking_points: dossier.talking_points,
            company_intel: dossier.company_intel,
            recommended_approach: dossier.recommended_approach
          },
          priority_tier: dossier.priority_tier || 'medium',
          sentiment_label: dossier.sentiment_label || 'neutral',
          last_enriched_at: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Failed to enrich ${contact.name}:`, err);
      }
      setEnrichProgress(((i + 1) / toEnrich.length) * 100);
    }

    setEnrichingAll(false);
    queryClient.invalidateQueries({ queryKey: ['myContacts'] });
  };

  return (
    <div className="space-y-6">
      {/* Engine Status Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard
          icon={Flame}
          label="Hot Leads"
          value={hotContacts.length}
          color="text-orange-600"
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
        />
        <StatusCard
          icon={AlertTriangle}
          label="Needs Attention"
          value={frustratedContacts.length}
          color="text-red-600"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
        <StatusCard
          icon={Clock}
          label="Stale (30d+)"
          value={staleContacts.length}
          color="text-amber-600"
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
        />
        <StatusCard
          icon={Brain}
          label="Needs Enrichment"
          value={needsEnrichment.length}
          color="text-violet-600"
          bgColor="bg-violet-50"
          borderColor="border-violet-200"
        />
      </div>

      {/* Bulk Enrichment */}
      {needsEnrichment.length > 0 && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="font-medium text-slate-900">
                    {needsEnrichment.length} contact{needsEnrichment.length > 1 ? 's' : ''} need AI enrichment
                  </p>
                  <p className="text-xs text-slate-500">
                    Auto-generate dossiers with pain points, value props, and talking points
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEnrichAll}
                disabled={enrichingAll}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {enrichingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enriching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enrich All ({Math.min(needsEnrichment.length, 10)})
                  </>
                )}
              </Button>
            </div>
            {enrichingAll && (
              <div className="mt-3">
                <Progress value={enrichProgress} className="h-2" />
                <p className="text-xs text-slate-500 mt-1">{Math.round(enrichProgress)}% complete</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="intent">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="intent" className="gap-1.5 text-xs">
            <Zap className="w-3.5 h-3.5" />
            Intent Signals
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="gap-1.5 text-xs">
            <ThermometerSun className="w-3.5 h-3.5" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="stale" className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Revive Stale
          </TabsTrigger>
          <TabsTrigger value="dossiers" className="gap-1.5 text-xs">
            <Brain className="w-3.5 h-3.5" />
            Dossiers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intent">
          <IntentSignalPanel contacts={contacts} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="sentiment">
          <SentimentMonitor contacts={contacts} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="stale">
          <StaleDealReviver contacts={contacts} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="dossiers">
          <DossiersList contacts={contacts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, color, bgColor, borderColor }) {
  return (
    <Card className={`${borderColor}`}>
      <CardContent className="py-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DossiersList({ contacts }) {
  const enriched = contacts.filter(c => c.ai_dossier && c.last_enriched_at)
    .sort((a, b) => new Date(b.last_enriched_at) - new Date(a.last_enriched_at));

  if (enriched.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 mb-2">No dossiers yet</h3>
          <p className="text-sm text-slate-500">Use the "Enrich All" button above to generate AI dossiers</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {enriched.map(contact => (
        <Card key={contact.id}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-900">{contact.name}</h4>
                <p className="text-xs text-slate-500">
                  {contact.role}{contact.company ? ` at ${contact.company}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {contact.priority_tier && (
                  <Badge className={
                    contact.priority_tier === 'critical' ? 'bg-red-100 text-red-700' :
                    contact.priority_tier === 'high' ? 'bg-orange-100 text-orange-700' :
                    contact.priority_tier === 'medium' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {contact.priority_tier}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {new Date(contact.last_enriched_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contact.ai_dossier?.pain_point && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs font-medium text-red-700 mb-1">Pain Point</p>
                  <p className="text-sm text-red-900">{contact.ai_dossier.pain_point}</p>
                </div>
              )}
              {contact.ai_dossier?.recent_win && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Recent Win</p>
                  <p className="text-sm text-emerald-900">{contact.ai_dossier.recent_win}</p>
                </div>
              )}
              {contact.ai_dossier?.value_prop && (
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <p className="text-xs font-medium text-violet-700 mb-1">Value Proposition</p>
                  <p className="text-sm text-violet-900">{contact.ai_dossier.value_prop}</p>
                </div>
              )}
            </div>

            {contact.ai_dossier?.talking_points?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Talking Points</p>
                <ul className="space-y-1">
                  {contact.ai_dossier.talking_points.map((tp, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-1 text-violet-400 flex-shrink-0" />
                      {tp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}