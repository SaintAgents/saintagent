import React from 'react';
import { ACTIONS, GGG_TO_USD, formatGGGSmart } from '@/components/earnings/gggMatrix';
import { Badge } from '@/components/ui/badge';

// Smart USD formatting: 3 decimals for values < $1, 2 decimals otherwise
const formatUSDSmart = (val) => {
  if (val < 1) {
    return val.toFixed(3);
  }
  return val.toFixed(2);
};

export default function ActionsEarningsTable() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions and base earnings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <div 
            key={action.key} 
            className="p-3 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-semibold text-slate-900 text-sm">{action.title}</div>
              <Badge className="bg-amber-600 text-white font-mono shrink-0">
                {formatGGGSmart(action.base)} GGG
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{action.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}