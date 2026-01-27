import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calculator, Settings, RefreshCw, Loader2, CheckCircle, 
  Star, Mail, Phone, Building, Clock, FileText, Link2, Tag, 
  TrendingUp, AlertCircle, Save
} from 'lucide-react';
import { toast } from "sonner";
import { differenceInDays } from 'date-fns';

// Default scoring criteria weights
const DEFAULT_CRITERIA = {
  hasEmail: { enabled: true, weight: 15, label: 'Has Email', icon: Mail },
  hasPhone: { enabled: true, weight: 10, label: 'Has Phone', icon: Phone },
  hasCompany: { enabled: true, weight: 10, label: 'Has Company', icon: Building },
  hasRole: { enabled: true, weight: 5, label: 'Has Role/Title', icon: Tag },
  hasNotes: { enabled: true, weight: 5, label: 'Has Notes', icon: FileText },
  hasSocialLinks: { enabled: true, weight: 10, label: 'Has Social Links', icon: Link2 },
  relationshipStrength: { enabled: true, weight: 20, label: 'Relationship Strength', icon: Star },
  recentContact: { enabled: true, weight: 15, label: 'Recent Contact (< 90 days)', icon: Clock },
  isFederated: { enabled: true, weight: 10, label: 'Contributed to Network', icon: TrendingUp },
};

// Calculate score for a single contact
export function calculateContactScore(contact, criteria = DEFAULT_CRITERIA) {
  let score = 0;
  let maxScore = 0;

  Object.entries(criteria).forEach(([key, config]) => {
    if (!config.enabled) return;
    maxScore += config.weight;

    switch (key) {
      case 'hasEmail':
        if (contact.email) score += config.weight;
        break;
      case 'hasPhone':
        if (contact.phone) score += config.weight;
        break;
      case 'hasCompany':
        if (contact.company) score += config.weight;
        break;
      case 'hasRole':
        if (contact.role) score += config.weight;
        break;
      case 'hasNotes':
        if (contact.notes && contact.notes.length > 10) score += config.weight;
        break;
      case 'hasSocialLinks':
        if (contact.social_links?.linkedin || contact.social_links?.twitter || contact.social_links?.website) {
          score += config.weight;
        }
        break;
      case 'relationshipStrength':
        const strength = contact.relationship_strength || 1;
        score += Math.round((strength / 5) * config.weight);
        break;
      case 'recentContact':
        if (contact.last_contact_date) {
          const daysSince = differenceInDays(new Date(), new Date(contact.last_contact_date));
          if (daysSince <= 30) score += config.weight;
          else if (daysSince <= 60) score += Math.round(config.weight * 0.7);
          else if (daysSince <= 90) score += Math.round(config.weight * 0.4);
        }
        break;
      case 'isFederated':
        if (contact.is_federated) score += config.weight;
        break;
    }
  });

  // Normalize to 0-100
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

// Get score color class
export function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50';
  if (score >= 60) return 'text-blue-600 bg-blue-50';
  if (score >= 40) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export default function ContactScoringEngine({ open, onClose, contacts, currentUserId }) {
  const queryClient = useQueryClient();
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [scoring, setScoring] = useState(false);
  const [autoScore, setAutoScore] = useState(true);

  // Load saved criteria from platform settings
  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const settings = await base44.entities.PlatformSetting.filter({ key: 'crm_scoring_criteria' });
        if (settings[0]?.value) {
          const saved = JSON.parse(settings[0].value);
          setCriteria(prev => ({ ...prev, ...saved }));
        }
      } catch (e) {
        console.error('Failed to load scoring criteria:', e);
      }
    };
    if (open) loadCriteria();
  }, [open]);

  const updateCriterion = (key, field, value) => {
    setCriteria(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const saveCriteriaMutation = useMutation({
    mutationFn: async () => {
      const existing = await base44.entities.PlatformSetting.filter({ key: 'crm_scoring_criteria' });
      const criteriaToSave = {};
      Object.entries(criteria).forEach(([key, val]) => {
        criteriaToSave[key] = { enabled: val.enabled, weight: val.weight };
      });
      
      if (existing[0]) {
        return base44.entities.PlatformSetting.update(existing[0].id, { 
          value: JSON.stringify(criteriaToSave) 
        });
      } else {
        return base44.entities.PlatformSetting.create({
          key: 'crm_scoring_criteria',
          value: JSON.stringify(criteriaToSave),
          description: 'CRM contact scoring criteria weights'
        });
      }
    },
    onSuccess: () => {
      toast.success('Scoring criteria saved');
    }
  });

  const handleScoreAllContacts = async () => {
    if (!contacts?.length) {
      toast.error('No contacts to score');
      return;
    }

    setScoring(true);
    let updated = 0;

    try {
      for (const contact of contacts) {
        const newScore = calculateContactScore(contact, criteria);
        if (newScore !== contact.quality_score) {
          await base44.entities.Contact.update(contact.id, { quality_score: newScore });
          updated++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      toast.success(`Scored ${contacts.length} contacts, updated ${updated}`);
    } catch (error) {
      console.error('Scoring failed:', error);
      toast.error('Failed to score contacts');
    } finally {
      setScoring(false);
    }
  };

  // Preview scores
  const scorePreview = React.useMemo(() => {
    if (!contacts?.length) return { excellent: 0, good: 0, fair: 0, poor: 0, avg: 0 };
    
    let total = 0;
    let excellent = 0, good = 0, fair = 0, poor = 0;
    
    contacts.forEach(c => {
      const score = calculateContactScore(c, criteria);
      total += score;
      if (score >= 80) excellent++;
      else if (score >= 60) good++;
      else if (score >= 40) fair++;
      else poor++;
    });
    
    return {
      excellent,
      good,
      fair,
      poor,
      avg: Math.round(total / contacts.length)
    };
  }, [contacts, criteria]);

  const totalWeight = Object.values(criteria).reduce((sum, c) => c.enabled ? sum + c.weight : sum, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-violet-600" />
            Contact Quality Scoring
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Score Distribution Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3 text-center">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">{scorePreview.excellent}</p>
                  <p className="text-xs text-emerald-600">Excellent</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold text-blue-600">{scorePreview.good}</p>
                  <p className="text-xs text-blue-600">Good</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50">
                  <p className="text-2xl font-bold text-amber-600">{scorePreview.fair}</p>
                  <p className="text-xs text-amber-600">Fair</p>
                </div>
                <div className="p-2 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-600">{scorePreview.poor}</p>
                  <p className="text-xs text-red-600">Poor</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-100">
                  <p className="text-2xl font-bold text-slate-700">{scorePreview.avg}</p>
                  <p className="text-xs text-slate-600">Average</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Criteria */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Scoring Criteria</Label>
              <Badge variant="outline">Total Weight: {totalWeight}</Badge>
            </div>

            <div className="space-y-3">
              {Object.entries(criteria).map(([key, config]) => {
                const Icon = DEFAULT_CRITERIA[key]?.icon || Settings;
                return (
                  <div key={key} className="flex items-center gap-4 p-3 rounded-lg border bg-white dark:bg-slate-800">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => updateCriterion(key, 'enabled', checked)}
                    />
                    <Icon className={`w-4 h-4 ${config.enabled ? 'text-violet-600' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!config.enabled && 'text-slate-400'}`}>
                        {config.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-48">
                      <Slider
                        value={[config.weight]}
                        onValueChange={([val]) => updateCriterion(key, 'weight', val)}
                        min={0}
                        max={30}
                        step={5}
                        disabled={!config.enabled}
                        className="flex-1"
                      />
                      <span className={`text-sm font-mono w-8 text-right ${!config.enabled && 'text-slate-400'}`}>
                        {config.weight}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-score setting */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50 dark:bg-slate-800">
            <div>
              <p className="text-sm font-medium">Auto-score on contact update</p>
              <p className="text-xs text-slate-500">Automatically recalculate score when contacts are modified</p>
            </div>
            <Switch checked={autoScore} onCheckedChange={setAutoScore} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => saveCriteriaMutation.mutate()}
              disabled={saveCriteriaMutation.isPending}
              className="gap-2"
            >
              {saveCriteriaMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Criteria
            </Button>
            <Button
              onClick={handleScoreAllContacts}
              disabled={scoring || !contacts?.length}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {scoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scoring...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Score All {contacts?.length || 0} Contacts</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}