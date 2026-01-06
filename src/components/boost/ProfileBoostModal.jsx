import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Zap, 
  Coins, 
  TrendingUp, 
  Clock, 
  Eye, 
  Sparkles, 
  Crown, 
  Rocket,
  Star,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BOOST_TIERS = [
  {
    id: 'standard',
    name: 'Standard Boost',
    icon: Zap,
    color: 'blue',
    multiplier: 1.5,
    description: 'Increase visibility by 50%',
    features: ['Appear higher in search', 'More match suggestions'],
    durations: [
      { hours: 1, cost: 5, label: '1 hour' },
      { hours: 6, cost: 25, label: '6 hours' },
      { hours: 24, cost: 75, label: '24 hours' },
    ]
  },
  {
    id: 'priority',
    name: 'Priority Boost',
    icon: Star,
    color: 'amber',
    multiplier: 2.5,
    description: 'Increase visibility by 150%',
    features: ['Top of search results', 'Priority in matches', 'Highlighted profile badge'],
    durations: [
      { hours: 1, cost: 15, label: '1 hour' },
      { hours: 6, cost: 60, label: '6 hours' },
      { hours: 24, cost: 150, label: '24 hours' },
    ]
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    icon: Crown,
    color: 'violet',
    multiplier: 4,
    popular: true,
    description: 'Maximum visibility boost',
    features: ['Featured in spotlight section', 'First in all searches', 'Gold profile frame', 'Push notifications to matches'],
    durations: [
      { hours: 1, cost: 30, label: '1 hour' },
      { hours: 6, cost: 120, label: '6 hours' },
      { hours: 24, cost: 300, label: '24 hours' },
    ]
  },
  {
    id: 'superboost',
    name: 'Super Boost',
    icon: Rocket,
    color: 'rose',
    multiplier: 10,
    description: 'Ultimate visibility explosion',
    features: ['10x visibility', 'Featured banner placement', 'Exclusive badge', 'Guaranteed impressions', 'Priority support'],
    durations: [
      { hours: 1, cost: 75, label: '1 hour' },
      { hours: 6, cost: 300, label: '6 hours' },
      { hours: 24, cost: 750, label: '24 hours' },
    ]
  }
];

const TIER_COLORS = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700',
    selected: 'ring-2 ring-blue-500 border-blue-500'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-500',
    button: 'bg-amber-600 hover:bg-amber-700',
    selected: 'ring-2 ring-amber-500 border-amber-500'
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-700',
    text: 'text-violet-700 dark:text-violet-400',
    icon: 'text-violet-500',
    button: 'bg-violet-600 hover:bg-violet-700',
    selected: 'ring-2 ring-violet-500 border-violet-500'
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-700',
    text: 'text-rose-700 dark:text-rose-400',
    icon: 'text-rose-500',
    button: 'bg-rose-600 hover:bg-rose-700',
    selected: 'ring-2 ring-rose-500 border-rose-500'
  }
};

export default function ProfileBoostModal({ open, onClose, boostType = 'profile', targetId }) {
  const [selectedTier, setSelectedTier] = useState('priority');
  const [selectedDuration, setSelectedDuration] = useState(1); // index
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    },
    enabled: open
  });
  const profile = profiles?.[0];

  const { data: activeBoosts = [] } = useQuery({
    queryKey: ['activeBoosts', profile?.user_id],
    queryFn: () => base44.entities.Boost.filter({ 
      user_id: profile.user_id, 
      status: 'active',
      boost_type: boostType 
    }),
    enabled: !!profile?.user_id && open
  });

  const hasActiveBoost = activeBoosts.length > 0;
  const currentBoost = activeBoosts[0];

  const tier = BOOST_TIERS.find(t => t.id === selectedTier);
  const duration = tier?.durations[selectedDuration];
  const cost = duration?.cost || 0;
  const colors = TIER_COLORS[tier?.color || 'blue'];
  const balance = profile?.ggg_balance || 0;
  const canAfford = balance >= cost;

  const boostMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const user = await base44.auth.me();
      const now = new Date();
      const endTime = new Date(now.getTime() + (duration.hours * 60 * 60 * 1000));

      // Deduct GGG
      await base44.entities.GGGTransaction.create({
        user_id: user.email,
        source_type: 'boost',
        delta: -cost,
        reason_code: 'boost_purchase',
        description: `${tier.name} - ${duration.label}`,
        balance_after: balance - cost
      });

      // Update user profile balance
      await base44.entities.UserProfile.update(profile.id, {
        ggg_balance: balance - cost
      });

      // Create boost record
      const boost = await base44.entities.Boost.create({
        user_id: user.email,
        boost_type: boostType,
        target_id: targetId || profile.id,
        budget_ggg: cost,
        duration_hours: duration.hours,
        visibility_level: selectedTier,
        boost_multiplier: tier.multiplier,
        status: 'active',
        start_time: now.toISOString(),
        end_time: endTime.toISOString()
      });

      // If boosting profile, update DatingProfile if it exists
      if (boostType === 'profile') {
        const datingProfiles = await base44.entities.DatingProfile.filter({ user_id: user.email });
        if (datingProfiles[0]) {
          await base44.entities.DatingProfile.update(datingProfiles[0].id, {
            is_boosted: true,
            boost_expires_at: endTime.toISOString(),
            boost_multiplier: tier.multiplier
          });
        }
      }

      return boost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['activeBoosts'] });
      queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      setIsProcessing(false);
      onClose();
    },
    onError: () => {
      setIsProcessing(false);
    }
  });

  const estimatedImpressions = Math.round(tier?.multiplier * duration?.hours * 50);
  const estimatedMatches = Math.round(tier?.multiplier * duration?.hours * 2);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Rocket className="w-6 h-6 text-violet-500" />
            Boost Your Profile
          </DialogTitle>
          <DialogDescription>
            Increase your visibility and get more matches
          </DialogDescription>
        </DialogHeader>

        {hasActiveBoost ? (
          <div className="py-6">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">Boost Active!</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Your {currentBoost.visibility_level} boost is running
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-black/20">
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{currentBoost.impressions || 0}</p>
                  <p className="text-xs text-emerald-600">Impressions</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-black/20">
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{currentBoost.profile_views || 0}</p>
                  <p className="text-xs text-emerald-600">Profile Views</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-black/20">
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{currentBoost.matches_generated || 0}</p>
                  <p className="text-xs text-emerald-600">New Matches</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-emerald-600 mb-1">
                  <span>Time remaining</span>
                  <span>{Math.max(0, Math.round((new Date(currentBoost.end_time) - new Date()) / (1000 * 60 * 60)))}h left</span>
                </div>
                <Progress 
                  value={Math.max(0, 100 - ((new Date(currentBoost.end_time) - new Date()) / (currentBoost.duration_hours * 60 * 60 * 1000) * 100))} 
                  className="h-2"
                />
              </div>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full mt-4 rounded-xl">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Balance Display */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Your Balance</span>
              </div>
              <span className="font-bold text-lg text-amber-600">{balance.toLocaleString()} GGG</span>
            </div>

            {/* Tier Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Boost Level</Label>
              <div className="grid grid-cols-2 gap-3">
                {BOOST_TIERS.map((t) => {
                  const c = TIER_COLORS[t.color];
                  const Icon = t.icon;
                  const isSelected = selectedTier === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all",
                        c.bg,
                        isSelected ? c.selected : c.border
                      )}
                    >
                      {t.popular && (
                        <Badge className="absolute -top-2 right-2 bg-violet-600 text-white text-[10px]">
                          POPULAR
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-1.5 rounded-lg", c.bg)}>
                          <Icon className={cn("w-4 h-4", c.icon)} />
                        </div>
                        <span className={cn("font-semibold text-sm", c.text)}>{t.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{t.description}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{t.multiplier}x visibility</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Duration</Label>
              <RadioGroup 
                value={selectedDuration.toString()} 
                onValueChange={(v) => setSelectedDuration(parseInt(v))}
                className="grid grid-cols-3 gap-3"
              >
                {tier?.durations.map((d, idx) => (
                  <Label
                    key={idx}
                    htmlFor={`duration-${idx}`}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
                      selectedDuration === idx 
                        ? `${colors.selected} ${colors.bg}` 
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <RadioGroupItem value={idx.toString()} id={`duration-${idx}`} className="sr-only" />
                    <Clock className={cn("w-5 h-5 mb-1", selectedDuration === idx ? colors.icon : "text-slate-400")} />
                    <span className="font-semibold text-slate-900 dark:text-white">{d.label}</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Coins className="w-3 h-3 text-amber-500" />
                      <span className="text-sm font-bold text-amber-600">{d.cost}</span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Features List */}
            <div className={cn("p-4 rounded-xl", colors.bg, "border", colors.border)}>
              <p className={cn("text-sm font-medium mb-2", colors.text)}>What you get:</p>
              <ul className="space-y-1.5">
                {tier?.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className={cn("w-4 h-4", colors.icon)} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Estimated Results */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">Est. Impressions</span>
                </div>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{estimatedImpressions.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-violet-600 dark:text-violet-400">Est. Matches</span>
                </div>
                <p className="text-xl font-bold text-violet-900 dark:text-violet-100">+{estimatedMatches}</p>
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {!canAfford && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  Insufficient balance. You need {cost - balance} more GGG.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">
                Cancel
              </Button>
              <Button 
                onClick={() => boostMutation.mutate()}
                disabled={!canAfford || isProcessing}
                className={cn("flex-1 rounded-xl h-12 text-white", colors.button)}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Activating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <tier.icon className="w-5 h-5" />
                    Boost for {cost} GGG
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}