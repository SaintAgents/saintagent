import React from 'react';
import { AlertTriangle, Leaf, Heart, Shield, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

const VIOLATION_ICONS = {
  planetary_wellbeing_below_floor: Leaf,
  human_wellbeing_below_floor: Heart,
  extractive_model_detected: Scale,
  governance_floor_violation: Shield
};

const SEVERITY_STYLES = {
  critical: 'bg-rose-50 border-rose-300 text-rose-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800'
};

export default function EthicalFloorIndicator({ violations }) {
  if (!violations || violations.length === 0) return null;

  const critical = violations.filter(v => v.severity === 'critical');
  const warnings = violations.filter(v => v.severity === 'warning');

  return (
    <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-rose-600" />
        <span className="font-bold text-rose-800">
          Ethical Floor Violation{violations.length > 1 ? 's' : ''} Detected
        </span>
      </div>
      <p className="text-sm text-rose-700 mb-3">
        This project falls below the minimum ethical thresholds required for funding consideration. 
        An RFI has been automatically generated.
      </p>
      <div className="space-y-2">
        {violations.map((v, i) => {
          const Icon = VIOLATION_ICONS[v.type] || AlertTriangle;
          return (
            <div key={i} className={cn(
              "p-3 rounded-lg border flex items-start gap-3",
              SEVERITY_STYLES[v.severity]
            )}>
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm capitalize">
                  {v.type.replace(/_/g, ' ')}
                </div>
                <div className="text-sm opacity-90">{v.message}</div>
                <div className="text-xs mt-1 opacity-70">
                  Score: {v.score}/10 — Threshold: {v.threshold}/10
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}