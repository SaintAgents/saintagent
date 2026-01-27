import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Copy, AlertCircle, Clock, Star, AlertTriangle,
  Sparkles, Trash2, ChevronRight, Calculator, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { calculateContactScore, getScoreColor, getScoreLabel } from './ContactScoringEngine';

export default function ContactSummaryHeader({ 
  contacts, 
  onOpenCleanup, 
  onOpenEnrich,
  onFilterByCategory,
  onOpenScoring
}) {
  // Calculate contact categories
  const summary = useMemo(() => {
    if (!contacts?.length) return null;

    // Find duplicates
    const seen = new Map();
    let duplicateCount = 0;
    contacts.forEach(c => {
      const nameKey = c.name?.toLowerCase().trim();
      const emailKey = c.email?.toLowerCase().trim();
      if ((nameKey && seen.has(nameKey)) || (emailKey && seen.has(emailKey))) {
        duplicateCount++;
      }
      if (nameKey) seen.set(nameKey, true);
      if (emailKey) seen.set(emailKey, true);
    });

    const incomplete = contacts.filter(c => !c.email || !c.phone).length;
    const inactive = contacts.filter(c => {
      if (!c.last_contact_date) return true;
      return differenceInDays(new Date(), new Date(c.last_contact_date)) > 180;
    }).length;
    const highValue = contacts.filter(c => (c.relationship_strength || 0) >= 4).length;
    const needsAttention = contacts.filter(c => (c.relationship_strength || 0) <= 2).length;
    const enriched = contacts.filter(c => c.notes?.includes('AI Intelligence Report')).length;
    
    // Calculate average quality score
    const scores = contacts.map(c => c.quality_score || calculateContactScore(c));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      total: contacts.length,
      duplicates: duplicateCount,
      incomplete,
      inactive,
      highValue,
      needsAttention,
      enriched,
      avgScore
    };
  }, [contacts]);

  if (!summary) return null;

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  const categories = [
    { key: 'total', label: 'Total', value: summary.total, icon: Users, color: 'bg-slate-100 text-slate-700', darkColor: 'bg-slate-700 text-slate-200' },
    { key: 'duplicates', label: 'Duplicates', value: summary.duplicates, icon: Copy, color: 'bg-amber-100 text-amber-700', darkColor: 'bg-amber-900/50 text-amber-300', alert: summary.duplicates > 0 },
    { key: 'incomplete', label: 'Incomplete', value: summary.incomplete, icon: AlertCircle, color: 'bg-rose-100 text-rose-700', darkColor: 'bg-rose-900/50 text-rose-300', alert: summary.incomplete > 0 },
    { key: 'inactive', label: 'Inactive 6mo+', value: summary.inactive, icon: Clock, color: 'bg-slate-100 text-slate-600', darkColor: 'bg-slate-700 text-slate-300' },
    { key: 'highValue', label: 'High Value', value: summary.highValue, icon: Star, color: 'bg-emerald-100 text-emerald-700', darkColor: 'bg-emerald-900/50 text-emerald-300' },
    { key: 'needsAttention', label: 'Needs Attention', value: summary.needsAttention, icon: AlertTriangle, color: 'bg-orange-100 text-orange-700', darkColor: 'bg-orange-900/50 text-orange-300', alert: summary.needsAttention > 5 },
  ];

  return (
    <div className="rounded-xl border p-4 space-y-4" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155' } : { backgroundColor: 'white' }}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => cat.key !== 'total' && onFilterByCategory?.(cat.key)}
              className={cn(
                "p-3 rounded-lg text-left transition-all hover:scale-105",
                cat.key !== 'total' && "cursor-pointer hover:shadow-md",
                isDark ? cat.darkColor : cat.color
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{cat.label}</span>
                {cat.alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <div className="text-2xl font-bold">{cat.value}</div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t" style={isDark ? { borderColor: '#334155' } : {}}>
        <div className="flex items-center gap-2">
          <Badge className={isDark ? "bg-violet-900/50 text-violet-300" : "bg-violet-100 text-violet-700"}>
            <Sparkles className="w-3 h-3 mr-1" />
            {summary.enriched} enriched
          </Badge>
          {(summary.duplicates > 0 || summary.incomplete > 0) && (
            <Badge className={isDark ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-700"}>
              {summary.duplicates + summary.incomplete} need cleanup
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getScoreColor(summary.avgScore)} flex items-center gap-1`}>
            <TrendingUp className="w-3 h-3" />
            Avg Score: {summary.avgScore}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenScoring}
            className="gap-2"
          >
            <Calculator className="w-4 h-4" />
            Scoring
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenCleanup}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup
          </Button>
          <Button 
            size="sm" 
            onClick={onOpenEnrich}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-white">AI Enrich All</span>
          </Button>
        </div>
      </div>
    </div>
  );
}