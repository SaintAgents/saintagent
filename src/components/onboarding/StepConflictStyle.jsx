import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Info, Zap, Clock, Shield, Target } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const conflictStyles = [
  {
    value: 'direct_repair',
    label: 'Direct Repair',
    icon: Zap,
    color: 'emerald',
    description: 'Address issues head-on and work to resolve quickly',
    details: 'You prefer to tackle conflicts directly and find resolution as soon as possible. You believe in clearing the air and moving forward together.',
    strengths: ['Quick resolution', 'Clear communication', 'Proactive problem-solving'],
    considerations: ['Partner may need time to process', 'Avoid overwhelming with intensity']
  },
  {
    value: 'reflective_space',
    label: 'Reflective Space',
    icon: Clock,
    color: 'blue',
    description: 'Need time to process before discussing',
    details: 'You prefer to take time to understand your feelings before engaging in conflict resolution. This helps you respond thoughtfully rather than reactively.',
    strengths: ['Thoughtful responses', 'Emotional regulation', 'Measured approach'],
    considerations: ['Communicate need for space', 'Set timeline for reconnection']
  },
  {
    value: 'avoidant',
    label: 'Harmony-Seeking',
    icon: Shield,
    color: 'amber',
    description: 'Prefer to minimize conflict when possible',
    details: 'You value peace and tend to avoid confrontation. You may let small issues go or try to smooth things over to maintain harmony.',
    strengths: ['Picks battles wisely', 'Maintains peace', 'Flexible and adaptive'],
    considerations: ['Ensure important issues are addressed', 'Practice asserting needs']
  },
  {
    value: 'assertive',
    label: 'Assertive Dialogue',
    icon: Target,
    color: 'violet',
    description: 'Express needs clearly while respecting others',
    details: 'You communicate your perspective firmly but fairly, seeking win-win solutions. You balance advocating for yourself with listening to your partner.',
    strengths: ['Balanced approach', 'Clear boundaries', 'Mutual respect'],
    considerations: ['Ensure partner feels heard', 'Stay open to compromise']
  }
];

export default function StepConflictStyle({ data = {}, onChange, onComplete }) {
  const [showInfo, setShowInfo] = useState(false);
  const setData = onChange || (() => {});

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Conflict Resolution Style</h2>
        <p className="text-slate-600">How you handle disagreements impacts relationship health</p>
      </div>

      <Collapsible open={showInfo} onOpenChange={setShowInfo}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 rounded-lg bg-orange-50 border border-orange-100 flex items-center gap-2 text-left hover:bg-orange-100 transition-colors">
            <Info className="w-5 h-5 text-orange-600 shrink-0" />
            <span className="text-sm text-orange-800 font-medium">Why does conflict style matter?</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Conflict resolution style</strong> describes how you naturally respond to disagreements. 
            Understanding this helps partners navigate challenges together.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Research shows that couples with compatible or complementary conflict styles report:
          </p>
          <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
            <li>Higher relationship satisfaction</li>
            <li>Better communication during stress</li>
            <li>Faster repair after disagreements</li>
            <li>More effective problem-solving</li>
          </ul>
          <p className="text-xs text-slate-500 mt-3 italic">
            Different styles can work well together with mutual understanding and respect.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <div>
        <Label className="text-base font-semibold mb-4 block">When conflicts arise, I typically:</Label>
        <RadioGroup 
          value={data.conflict_response} 
          onValueChange={(value) => setData({ ...data, conflict_response: value })}
        >
          <div className="space-y-3">
            {conflictStyles.map(({ value, label, icon: Icon, color, description, details, strengths, considerations }) => {
              const isSelected = data.conflict_response === value;
              const colorClasses = {
                emerald: 'border-emerald-500 bg-emerald-50',
                blue: 'border-blue-500 bg-blue-50',
                amber: 'border-amber-500 bg-amber-50',
                violet: 'border-violet-500 bg-violet-50'
              };
              const iconColors = {
                emerald: 'text-emerald-600',
                blue: 'text-blue-600',
                amber: 'text-amber-600',
                violet: 'text-violet-600'
              };

              return (
                <div key={value}>
                  <div 
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected ? colorClasses[color] : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setData({ ...data, conflict_response: value })}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={value} id={`conflict-${value}`} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${isSelected ? iconColors[color] : 'text-slate-400'}`} />
                          <Label htmlFor={`conflict-${value}`} className="font-semibold cursor-pointer">{label}</Label>
                        </div>
                        <p className="text-sm text-slate-600">{description}</p>
                        
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                            <p className="text-sm text-slate-700">{details}</p>
                            <div>
                              <p className="text-xs font-medium text-emerald-700 mb-1">Strengths:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {strengths.map((s, i) => (
                                  <Badge key={i} className="text-xs bg-emerald-100 text-emerald-700">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-amber-700 mb-1">Things to remember:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {considerations.map((c, i) => (
                                  <Badge key={i} className="text-xs bg-amber-100 text-amber-700">
                                    {c}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      <Button 
        className="w-full bg-violet-600 hover:bg-violet-700 mt-4" 
        onClick={() => onComplete && onComplete(data)}
        disabled={!data.conflict_response}
      >
        Continue
      </Button>
    </div>
  );
}