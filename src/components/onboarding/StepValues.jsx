import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

const VALUES = [
  {
    id: 'integrity',
    label: 'Integrity',
    description: "I do what I say I'll do, even when it's inconvenient."
  },
  {
    id: 'accountability',
    label: 'Accountability',
    description: "I take ownership of outcomes and fix what I break."
  },
  {
    id: 'service',
    label: 'Service',
    description: "I'm motivated by helping others and solving real needs."
  },
  {
    id: 'mastery',
    label: 'Mastery',
    description: "I care about skill, craft, and getting better over time."
  },
  {
    id: 'excellence',
    label: 'Excellence',
    description: "I aim for high standards and high-quality results."
  },
  {
    id: 'curiosity',
    label: 'Curiosity',
    description: "I explore, ask questions, and enjoy learning new things."
  },
  {
    id: 'innovation',
    label: 'Innovation',
    description: "I like building new approaches and improving systems."
  },
  {
    id: 'resilience',
    label: 'Resilience',
    description: "I keep going through setbacks and adapt quickly."
  },
  {
    id: 'courage',
    label: 'Courage',
    description: "I'm willing to act despite fear and speak the truth."
  },
  {
    id: 'discretion',
    label: 'Discretion',
    description: "I value privacy, confidentiality, and secure handling of information."
  },
  {
    id: 'transparency',
    label: 'Transparency',
    description: "I communicate clearly, honestly, and without hidden agendas."
  },
  {
    id: 'community',
    label: 'Community',
    description: "I value belonging, collaboration, and uplifting the group."
  },
  {
    id: 'justice',
    label: 'Justice',
    description: "I care about fairness, equal treatment, and doing what's right."
  },
  {
    id: 'stewardship',
    label: 'Stewardship',
    description: "I protect resources, systems, and people for the long term."
  },
  {
    id: 'freedom',
    label: 'Freedom',
    description: "I value independence, self-direction, and personal sovereignty."
  }
];

export default function StepValues({ profile, onUpdate, onNext }) {
  const [selected, setSelected] = useState(profile?.values_tags || []);

  const toggleValue = (valueId) => {
    setSelected(prev => 
      prev.includes(valueId) 
        ? prev.filter(id => id !== valueId)
        : [...prev, valueId]
    );
  };

  const handleNext = async () => {
    await onUpdate({ values_tags: selected });
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          What values guide you?
        </h2>
        <p className="text-slate-600">
          Select the values that resonate most with who you are. These help us match you with aligned people and opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {VALUES.map((value) => {
          const isSelected = selected.includes(value.id);
          return (
            <button
              key={value.id}
              onClick={() => toggleValue(value.id)}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900">{value.label}</p>
                  </div>
                  <p className="text-sm text-slate-600">{value.description}</p>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "border-violet-500 bg-violet-500"
                    : "border-slate-300 bg-white"
                )}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {selected.length} value{selected.length !== 1 ? 's' : ''} selected
        </p>
        <Button
          onClick={handleNext}
          disabled={selected.length === 0}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Continue
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}