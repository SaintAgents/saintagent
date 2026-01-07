import React from 'react';
import { ACTIONS, GGG_TO_USD, formatGGGSmart } from '@/components/earnings/gggMatrix';
import { Badge } from '@/components/ui/badge';

// Category labels and order
const CATEGORY_ORDER = ['engagement', 'content', 'mission', 'leadership', 'agent', 'learning'];
const CATEGORY_LABELS = {
  engagement: 'Micro-Engagement Actions',
  content: 'Content Creation',
  mission: 'Quest, Team & Mission Activities',
  leadership: 'Leadership & Governance',
  agent: 'Agent Development',
  learning: 'Learning & Teaching'
};

export default function ActionsEarningsTable() {
  // Group actions by category
  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    actions: ACTIONS.filter(a => a.category === cat)
  })).filter(g => g.actions.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">{group.label}</h3>
          <div className="space-y-2">
            {group.actions.map((action) => {
              const usdVal = action.base * GGG_TO_USD;
              return (
                <div 
                  key={action.key} 
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="font-semibold text-slate-900 text-sm">{action.title}</div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <Badge className="bg-amber-600 text-white font-mono text-xs">
                        {formatGGGSmart(action.base)} GGG
                      </Badge>
                      <span className="text-xs text-emerald-600 font-medium">
                        (USD {usdVal < 1 ? usdVal.toFixed(2) : usdVal.toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{action.definition}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}