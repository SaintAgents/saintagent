import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

const impactColors = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600'
};

export default function SuggestedParameters({ analysis, currentConfig, onApply }) {
  const [showDiff, setShowDiff] = useState(false);

  if (!analysis?.suggestions?.length && analysis?.healthScore >= 80) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-emerald-700 text-lg">Looking Good!</h3>
          <p className="text-sm text-emerald-600 mt-1">
            No critical issues detected. Your cache settings appear well-tuned.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleApplyAll = () => {
    if (analysis?.optimizedConfig && onApply) {
      onApply(analysis.optimizedConfig);
    }
  };

  // Build diff between current and suggested
  const configDiff = [];
  if (currentConfig?.groups && analysis?.optimizedConfig?.groups) {
    Object.keys(currentConfig.groups).forEach(key => {
      const curr = currentConfig.groups[key];
      const suggested = analysis.optimizedConfig.groups[key];
      if (!suggested) return;
      
      const changes = [];
      if (curr.staleMinutes !== suggested.staleMinutes) {
        changes.push({ field: 'staleMinutes', from: curr.staleMinutes, to: suggested.staleMinutes });
      }
      if (curr.refetchOnFocus !== suggested.refetchOnFocus) {
        changes.push({ field: 'refetchOnFocus', from: curr.refetchOnFocus, to: suggested.refetchOnFocus });
      }
      if (curr.refetchOnMount !== suggested.refetchOnMount) {
        changes.push({ field: 'refetchOnMount', from: curr.refetchOnMount, to: suggested.refetchOnMount });
      }
      if (changes.length > 0) {
        configDiff.push({ key, label: curr.label || key, changes });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Suggestions List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-amber-500" />
            Recommendations ({analysis.suggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                <Badge className={`${impactColors[s.impact]} text-xs shrink-0 mt-0.5`}>
                  {s.impact}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{s.reason}</p>
                  {s.current !== undefined && s.suggested !== undefined && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded font-mono">
                        {s.current}min
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-mono">
                        {s.suggested}min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Config Diff */}
      {configDiff.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Optimized Configuration
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setShowDiff(!showDiff)}
                >
                  {showDiff ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showDiff ? 'Hide' : 'Show'} Diff
                </Button>
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  onClick={handleApplyAll}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Apply All
                </Button>
              </div>
            </div>
          </CardHeader>
          {showDiff && (
            <CardContent>
              <div className="space-y-3">
                {configDiff.map((d, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="font-medium text-sm text-slate-700 mb-2">{d.label}</div>
                    <div className="space-y-1">
                      {d.changes.map((c, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 w-32">{c.field}:</span>
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded font-mono line-through">
                            {String(c.from)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-mono font-semibold">
                            {String(c.to)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}