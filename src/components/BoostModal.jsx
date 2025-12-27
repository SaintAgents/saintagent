import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Coins, TrendingUp } from "lucide-react";

export default function BoostModal({ open, onClose, targetType, targetId }) {
  const [budget, setBudget] = useState(500);
  const [duration, setDuration] = useState(24);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  const boostMutation = useMutation({
    mutationFn: async (data) => {
      // Deduct GGG
      await base44.entities.GGGTransaction.create({
        user_id: profile.user_id,
        source_type: 'boost',
        delta: -budget,
        reason_code: 'boost_spent',
        description: `Boost ${targetType}`,
        balance_after: (profile.ggg_balance || 0) - budget
      });
      
      // Create boost
      return base44.entities.Boost.create({
        user_id: profile.user_id,
        boost_type: targetType,
        target_id: targetId,
        budget_ggg: budget,
        duration_hours: duration,
        status: 'active',
        start_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      onClose();
    }
  });

  const estimatedReach = Math.round(budget * 2);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Boost Your {targetType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <Label>Budget (GGG)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[budget]}
                onValueChange={([v]) => setBudget(v)}
                min={100}
                max={profile?.ggg_balance || 1000}
                step={50}
                className="flex-1"
              />
              <div className="flex items-center gap-1 min-w-[80px] px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-amber-900">{budget}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Available: {profile?.ggg_balance || 0} GGG
            </p>
          </div>

          <div>
            <Label>Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-violet-900">Estimated Reach</span>
            </div>
            <p className="text-2xl font-bold text-violet-900">{estimatedReach.toLocaleString()}</p>
            <p className="text-sm text-violet-600">impressions over {duration}h</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={() => boostMutation.mutate()}
              disabled={budget > (profile?.ggg_balance || 0)}
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Launch Boost
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}