import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Basic Info' },
  { num: 2, label: 'Overview' },
  { num: 3, label: 'Funding' },
  { num: 4, label: 'Financial' },
  { num: 5, label: 'Impact' },
  { num: 6, label: 'Readiness' },
  { num: 7, label: 'Documents' },
  { num: 8, label: 'Alignment' },
];

export default function IntakeStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {STEPS.map((s, i) => {
        const isCompleted = currentStep > s.num;
        const isCurrent = currentStep === s.num;
        return (
          <React.Fragment key={s.num}>
            {i > 0 && (
              <div className={`hidden sm:block h-px flex-1 min-w-2 max-w-8 ${isCompleted ? 'bg-violet-500' : 'bg-slate-200'}`} />
            )}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-violet-600 text-white'
                    : isCurrent
                    ? 'bg-violet-600 text-white ring-2 ring-violet-300'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${isCurrent ? 'text-violet-700 font-medium' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}