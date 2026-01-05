import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Heart, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Home,
  Save,
  RotateCcw,
  Loader2,
  Check,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import HelpHint from '@/components/hud/HelpHint';

const DOMAIN_CONFIG = [
  {
    key: 'identity_values',
    label: 'Identity & Values',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    description: 'Core values alignment, life priorities, and ethical boundaries',
    examples: 'Integrity, honesty, compassion, spiritual growth'
  },
  {
    key: 'emotional_stability',
    label: 'Emotional Stability',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Emotional regulation style, conflict response, and stress tolerance',
    examples: 'How you process emotions, handle disagreements, manage pressure'
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Communication depth, frequency preferences, and feedback receptivity',
    examples: 'Deep vs light conversation, daily vs weekly check-ins'
  },
  {
    key: 'growth',
    label: 'Growth & Intent',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Growth orientation, learning mindset, and relationship intent',
    examples: 'Partnership goals, personal development pace, long-term vision'
  },
  {
    key: 'lifestyle',
    label: 'Lifestyle',
    icon: Home,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Location mobility, daily rhythm, and work-life balance',
    examples: 'Introvert/extrovert energy, fixed vs nomadic lifestyle'
  }
];

const DEFAULT_WEIGHTS = {
  identity_values: 30,
  emotional_stability: 25,
  communication: 20,
  growth: 15,
  lifestyle: 10
};

export default function MatchSettings() {
  const queryClient = useQueryClient();
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [strictDealbreakers, setStrictDealbreakers] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: datingProfiles = [] } = useQuery({
    queryKey: ['datingProfile', currentUser?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });
  const datingProfile = datingProfiles?.[0];

  // Load saved weights
  useEffect(() => {
    if (datingProfile?.domain_weights) {
      setWeights({
        identity_values: (datingProfile.domain_weights.identity_values || 0.3) * 100,
        emotional_stability: (datingProfile.domain_weights.emotional_stability || 0.25) * 100,
        communication: (datingProfile.domain_weights.communication || 0.2) * 100,
        growth: (datingProfile.domain_weights.growth || 0.15) * 100,
        lifestyle: (datingProfile.domain_weights.lifestyle || 0.1) * 100
      });
    }
    if (datingProfile?.strict_dealbreakers !== undefined) {
      setStrictDealbreakers(datingProfile.strict_dealbreakers);
    }
  }, [datingProfile?.id]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const normalizedWeights = {
        identity_values: weights.identity_values / 100,
        emotional_stability: weights.emotional_stability / 100,
        communication: weights.communication / 100,
        growth: weights.growth / 100,
        lifestyle: weights.lifestyle / 100
      };

      if (datingProfile?.id) {
        return base44.entities.DatingProfile.update(datingProfile.id, {
          domain_weights: normalizedWeights,
          strict_dealbreakers: strictDealbreakers
        });
      } else {
        return base44.entities.DatingProfile.create({
          user_id: currentUser.email,
          opt_in: false,
          domain_weights: normalizedWeights,
          strict_dealbreakers: strictDealbreakers
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
    }
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isBalanced = Math.abs(totalWeight - 100) < 1;

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: value[0] }));
  };

  const resetToDefaults = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  const normalizeWeights = () => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total === 0) {
      setWeights(DEFAULT_WEIGHTS);
      return;
    }
    const normalized = {};
    Object.keys(weights).forEach(key => {
      normalized[key] = Math.round((weights[key] / total) * 100);
    });
    // Adjust for rounding errors
    const newTotal = Object.values(normalized).reduce((a, b) => a + b, 0);
    if (newTotal !== 100) {
      normalized.identity_values += (100 - newTotal);
    }
    setWeights(normalized);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/30 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            Match Preferences
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Customize how the AI weighs different compatibility factors
          </p>
        </div>

        {/* Weight Distribution Overview */}
        <Card className="mb-6 border-violet-200 dark:border-violet-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Weight Distribution
                <HelpHint content="These weights determine how much each domain influences your compatibility scores. Higher weight = more importance in matching." />
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isBalanced && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={normalizeWeights}
                    className="text-xs rounded-lg"
                  >
                    Normalize to 100%
                  </Button>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    isBalanced ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600"
                  )}
                >
                  Total: {Math.round(totalWeight)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {DOMAIN_CONFIG.map((domain, idx) => (
                <div
                  key={domain.key}
                  className={cn(
                    "h-full transition-all",
                    domain.key === 'identity_values' && "bg-rose-500",
                    domain.key === 'emotional_stability' && "bg-purple-500",
                    domain.key === 'communication' && "bg-blue-500",
                    domain.key === 'growth' && "bg-emerald-500",
                    domain.key === 'lifestyle' && "bg-amber-500"
                  )}
                  style={{ width: `${(weights[domain.key] / totalWeight) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {DOMAIN_CONFIG.map(domain => (
                <div key={domain.key} className="flex items-center gap-1 text-xs">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    domain.key === 'identity_values' && "bg-rose-500",
                    domain.key === 'emotional_stability' && "bg-purple-500",
                    domain.key === 'communication' && "bg-blue-500",
                    domain.key === 'growth' && "bg-emerald-500",
                    domain.key === 'lifestyle' && "bg-amber-500"
                  )} />
                  <span className="text-slate-600 dark:text-slate-400">{domain.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domain Sliders */}
        <div className="space-y-4 mb-6">
          {DOMAIN_CONFIG.map(domain => {
            const Icon = domain.icon;
            return (
              <Card 
                key={domain.key} 
                className={cn("border", domain.borderColor)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg", domain.bgColor)}>
                      <Icon className={cn("w-5 h-5", domain.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="font-semibold text-slate-900 dark:text-slate-100">
                          {domain.label}
                        </Label>
                        <span className={cn("text-lg font-bold", domain.color)}>
                          {weights[domain.key]}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {domain.description}
                      </p>
                      <Slider
                        value={[weights[domain.key]]}
                        onValueChange={(v) => handleWeightChange(domain.key, v)}
                        min={0}
                        max={50}
                        step={5}
                        className="mb-2"
                      />
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        <span className="font-medium">Examples:</span> {domain.examples}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Additional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400" />
                <div>
                  <Label className="font-medium text-slate-900 dark:text-slate-100">Strict Dealbreakers</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Completely exclude matches that trigger your dealbreakers
                  </p>
                </div>
              </div>
              <Switch
                checked={strictDealbreakers}
                onCheckedChange={setStrictDealbreakers}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="rounded-xl gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <div className="flex items-center gap-3">
            {showSaved && (
              <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium animate-in fade-in">
                <Check className="w-4 h-4" />
                Saved!
              </span>
            )}
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}