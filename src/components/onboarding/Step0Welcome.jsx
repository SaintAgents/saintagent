import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Rocket, 
  GraduationCap, 
  Users, 
  DollarSign, 
  Calendar, 
  Target,
  TrendingUp,
  Sparkles
} from "lucide-react";

const INTENTIONS = [
  { code: "build_project", label: "Build a project/company", icon: Rocket },
  { code: "learn_skills", label: "Learn skills", icon: GraduationCap },
  { code: "teach_mentor", label: "Teach / mentor", icon: Users },
  { code: "find_collaborators", label: "Find collaborators", icon: Users },
  { code: "earn_income", label: "Earn income", icon: DollarSign },
  { code: "host_events", label: "Host/attend events", icon: Calendar },
  { code: "join_missions", label: "Join missions", icon: Target },
  { code: "grow_influence", label: "Grow influence", icon: TrendingUp },
  { code: "spiritual_growth", label: "Spiritual growth / consciousness", icon: Sparkles }
];

export default function Step0Welcome({ data, onComplete }) {
  const [selected, setSelected] = useState(data.intentions || []);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const toggleIntention = (code) => {
    if (selected.includes(code)) {
      setSelected(selected.filter(c => c !== code));
    } else if (selected.length < 7) {
      setSelected([...selected, code]);
    }
  };

  const handleContinue = () => {
    onComplete({ intentions: selected });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Why are you here?</h2>
        <p className="text-slate-600">Select up to 7 intentions that resonate with you</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {INTENTIONS.map((intention) => {
          const Icon = intention.icon;
          const isSelected = selected.includes(intention.code);
          
          return (
            <button
              key={intention.code}
              onClick={() => toggleIntention(intention.code)}
              disabled={!isSelected && selected.length >= 7}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                "hover:border-violet-300 hover:shadow-md",
                isSelected 
                  ? "border-violet-500 bg-violet-50 shadow-md" 
                  : "border-slate-200 bg-white",
                !isSelected && selected.length >= 7 && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 mb-2",
                isSelected ? "text-violet-600" : "text-slate-400"
              )} />
              <p className={cn(
                "text-sm font-medium",
                isSelected ? "text-violet-900" : "text-slate-700"
              )}>
                {intention.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Terms acceptance */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(!!checked)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
          I agree to the{' '}
          <Link to={createPageUrl('Terms')} className="text-violet-600 hover:underline" target="_blank">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to={createPageUrl('Terms')} className="text-violet-600 hover:underline" target="_blank">
            Privacy Policy
          </Link>
        </label>
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-slate-500">
          {selected.length}/7 selected
        </p>
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0 || !acceptTerms}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Continue
        </Button>
      </div>
      
      {selected.length === 0 && (
        <p className="text-xs text-amber-600 text-center">Please select at least one intention to continue</p>
      )}
    </div>
  );
}