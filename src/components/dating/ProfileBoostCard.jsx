import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Clock, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BOOST_OPTIONS = [
  { duration: 1, cost: 2, label: '1 Hour', multiplier: '2x' },
  { duration: 6, cost: 4, label: '6 Hours', multiplier: '2x' },
  { duration: 24, cost: 6, label: '24 Hours', multiplier: '3x' },
  { duration: 72, cost: 9, label: '3 Days', multiplier: '3x' }
];

export default function ProfileBoostCard({ datingProfile, userProfile, walletBalance = 0 }) {
  const [selectedDuration, setSelectedDuration] = useState('24');
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const queryClient = useQueryClient();

  const isCurrentlyBoosted = datingProfile?.is_boosted && 
    datingProfile?.boost_expires_at && 
    new Date(datingProfile.boost_expires_at) > new Date();

  const boostExpiresAt = isCurrentlyBoosted ? new Date(datingProfile.boost_expires_at) : null;
  const timeRemaining = boostExpiresAt ? Math.max(0, boostExpiresAt - new Date()) : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  // Live countdown timer
  useEffect(() => {
    if (!isCurrentlyBoosted || !boostExpiresAt) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, boostExpiresAt - now);
      setCountdown({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isCurrentlyBoosted, boostExpiresAt]);

  const selectedOption = BOOST_OPTIONS.find(o => o.duration === parseInt(selectedDuration));
  const canAfford = walletBalance >= (selectedOption?.cost || 0);

  const boostMutation = useMutation({
    mutationFn: async () => {
      const option = BOOST_OPTIONS.find(o => o.duration === parseInt(selectedDuration));
      if (!option) throw new Error('Invalid option');
      
      // Deduct GGG
      await base44.functions.invoke('walletEngine', {
        action: 'debit',
        payload: {
          user_id: userProfile.user_id,
          amount: option.cost,
          reason: `Profile boost for ${option.label}`,
          source_type: 'boost'
        }
      });

      // Update dating profile with boost
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + option.duration);

      await base44.entities.DatingProfile.update(datingProfile.id, {
        is_boosted: true,
        boost_expires_at: expiresAt.toISOString(),
        boost_multiplier: parseFloat(option.multiplier)
      });

      // Create boost record
      await base44.entities.Boost.create({
        user_id: userProfile.user_id,
        boost_type: 'profile',
        target_id: datingProfile.id,
        budget_ggg: option.cost,
        duration_hours: option.duration,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      const option = BOOST_OPTIONS.find(o => o.duration === parseInt(selectedDuration));
      queryClient.invalidateQueries({ queryKey: ['datingProfile'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      // Show success toast
      toast.success(`Profile Boost Active!`, {
        description: `Your visibility is now increased ${option?.multiplier || '3x'} for ${option?.label || '24 Hours'}.`,
        duration: 5000,
        icon: <Zap className="w-5 h-5 text-amber-500" />
      });
      
      // Dispatch event for avatar glow effect in navbar
      window.dispatchEvent(new CustomEvent('boostActivated', {
        detail: { multiplier: option?.multiplier, duration: option?.duration }
      }));
    }
  });

  if (!datingProfile?.opt_in) {
    return null;
  }

  return (
    <Card className={cn(
      "border-2 transition-all",
      isCurrentlyBoosted 
        ? "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700" 
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Zap className={cn("w-5 h-5", isCurrentlyBoosted ? "text-amber-500" : "text-slate-400")} />
            Profile Boost
          </span>
          {isCurrentlyBoosted && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 gap-1">
              <Sparkles className="w-3 h-3" /> Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCurrentlyBoosted ? (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Your Profile is Boosted!</h3>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                You're appearing at the top of match suggestions
              </p>
            </div>

            {/* Live Countdown Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Time Remaining
                </span>
              </div>
              
              {/* Digital countdown display */}
              <div className="flex justify-center gap-2">
                <div className="text-center px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <p className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-300">
                    {String(countdown.hours).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] uppercase text-amber-600 dark:text-amber-400">Hours</p>
                </div>
                <span className="text-2xl font-bold text-amber-600 self-center">:</span>
                <div className="text-center px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <p className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-300">
                    {String(countdown.minutes).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] uppercase text-amber-600 dark:text-amber-400">Mins</p>
                </div>
                <span className="text-2xl font-bold text-amber-600 self-center">:</span>
                <div className="text-center px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <p className="text-2xl font-mono font-bold text-amber-800 dark:text-amber-300">
                    {String(countdown.seconds).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] uppercase text-amber-600 dark:text-amber-400">Secs</p>
                </div>
              </div>
              
              <Progress 
                value={(timeRemaining / (datingProfile.boost_multiplier === 3 ? 72 : 24) / (1000 * 60 * 60)) * 100} 
                className="h-2 bg-amber-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/30">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{datingProfile.boost_multiplier || 2}x</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Visibility</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/30">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-lg font-bold text-amber-800 dark:text-amber-300">Top</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Priority</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Boost your profile to appear at the top of AI match suggestions and increase your visibility.
            </p>

            <div className="space-y-3">
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {BOOST_OPTIONS.map(option => (
                    <SelectItem key={option.duration} value={String(option.duration)}>
                      <span className="flex items-center justify-between w-full gap-4">
                        <span>{option.label}</span>
                        <span className="text-violet-600">{option.cost} GGG • {option.multiplier}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedOption && (
                <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-violet-700 dark:text-violet-400">Cost</span>
                    <span className="font-semibold text-violet-900 dark:text-violet-300">{selectedOption.cost} GGG</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-violet-700 dark:text-violet-400">Duration</span>
                    <span className="font-semibold text-violet-900 dark:text-violet-300">{selectedOption.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-violet-700 dark:text-violet-400">Visibility Boost</span>
                    <span className="font-semibold text-violet-900 dark:text-violet-300">{selectedOption.multiplier}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Your Balance</span>
                <span className={cn("font-semibold", canAfford ? "text-emerald-600" : "text-red-500")}>
                  {walletBalance} GGG
                </span>
              </div>

              <Button
                onClick={() => boostMutation.mutate()}
                disabled={!canAfford || boostMutation.isPending}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl gap-2"
              >
                {boostMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Boosting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Boost Profile
                  </>
                )}
              </Button>

              {!canAfford && (
                <p className="text-xs text-center text-red-500">
                  Insufficient GGG balance. Earn more through missions and meetings.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}