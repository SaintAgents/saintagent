import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Heart, Info, Shield, Users, Zap, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const attachmentStyles = [
  {
    value: 'secure',
    label: 'Secure',
    icon: Shield,
    color: 'emerald',
    description: 'Comfortable with intimacy and independence',
    details: 'You feel comfortable with emotional closeness and are able to depend on others while also being dependable. You communicate needs openly and handle conflict constructively.',
    traits: ['Trusting', 'Open communication', 'Comfortable with closeness', 'Independent yet connected']
  },
  {
    value: 'anxious',
    label: 'Anxious-Preoccupied',
    icon: Heart,
    color: 'rose',
    description: 'Seeks closeness, may worry about relationship security',
    details: 'You value deep emotional connection and may sometimes worry about your partner\'s feelings or commitment. You tend to be very attuned to your partner\'s emotions.',
    traits: ['Highly attuned to partners', 'Values emotional depth', 'Seeks reassurance', 'Very loving and giving']
  },
  {
    value: 'avoidant',
    label: 'Dismissive-Avoidant',
    icon: Zap,
    color: 'blue',
    description: 'Values independence, may need more space',
    details: 'You highly value your independence and self-sufficiency. You may prefer to handle stress on your own and need time to process emotions before sharing.',
    traits: ['Self-reliant', 'Values independence', 'Needs space to process', 'Strong boundaries']
  },
  {
    value: 'fearful',
    label: 'Fearful-Avoidant',
    icon: AlertCircle,
    color: 'amber',
    description: 'Desires closeness but may feel conflicted',
    details: 'You desire close relationships but may also feel apprehensive about them. You might oscillate between seeking connection and needing distance.',
    traits: ['Complex emotional needs', 'Deeply feeling', 'Growing self-awareness', 'Working toward security']
  }
];

export default function StepAttachmentStyle({ data = {}, onChange, onComplete }) {
  const [showInfo, setShowInfo] = useState(false);
  const setData = onChange || (() => {});

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Attachment Style</h2>
        <p className="text-slate-600">Understanding how you connect helps us find compatible matches</p>
      </div>

      <Collapsible open={showInfo} onOpenChange={setShowInfo}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-2 text-left hover:bg-blue-100 transition-colors">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-sm text-blue-800 font-medium">Why does attachment style matter?</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-700 mb-3">
            <strong>Attachment style</strong> describes how you relate to others in close relationships. 
            It's shaped by early experiences but can evolve over time.
          </p>
          <p className="text-sm text-slate-600 mb-3">
            Understanding your attachment style helps you:
          </p>
          <ul className="text-sm text-slate-600 list-disc ml-5 space-y-1">
            <li>Recognize your relationship patterns</li>
            <li>Communicate needs more effectively</li>
            <li>Find partners with compatible attachment styles</li>
            <li>Build healthier, more secure connections</li>
          </ul>
          <p className="text-xs text-slate-500 mt-3 italic">
            No style is "bad" - each has strengths. The goal is awareness and growth.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <div>
        <Label className="text-base font-semibold mb-4 block">Which best describes you?</Label>
        <RadioGroup 
          value={data.attachment_style} 
          onValueChange={(value) => setData({ ...data, attachment_style: value })}
        >
          <div className="space-y-3">
            {attachmentStyles.map(({ value, label, icon: Icon, color, description, details, traits }) => {
              const isSelected = data.attachment_style === value;
              const colorClasses = {
                emerald: 'border-emerald-500 bg-emerald-50',
                rose: 'border-rose-500 bg-rose-50',
                blue: 'border-blue-500 bg-blue-50',
                amber: 'border-amber-500 bg-amber-50'
              };
              const iconColors = {
                emerald: 'text-emerald-600',
                rose: 'text-rose-600',
                blue: 'text-blue-600',
                amber: 'text-amber-600'
              };

              return (
                <div key={value}>
                  <div 
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected ? colorClasses[color] : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setData({ ...data, attachment_style: value })}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={value} id={value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-5 h-5 ${isSelected ? iconColors[color] : 'text-slate-400'}`} />
                          <Label htmlFor={value} className="font-semibold cursor-pointer">{label}</Label>
                        </div>
                        <p className="text-sm text-slate-600">{description}</p>
                        
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-sm text-slate-700 mb-2">{details}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {traits.map((trait, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {trait}
                                </Badge>
                              ))}
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
        disabled={!data.attachment_style}
      >
        Continue
      </Button>
    </div>
  );
}