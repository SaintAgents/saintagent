import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Crown, Check, Sparkles, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { addMonths, addYears } from 'date-fns';

export default function SubscriptionCard({ tier, currentSubscription, profile }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles[0];
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data) => {
      // Check balance
      if (userProfile.ggg_balance < data.price_paid_ggg) {
        throw new Error('Insufficient GGG balance');
      }

      // Create subscription
      const subscription = await base44.entities.Subscription.create(data);

      // Deduct GGG from subscriber
      await base44.entities.UserProfile.update(userProfile.id, {
        ggg_balance: userProfile.ggg_balance - data.price_paid_ggg
      });

      // Add GGG to creator (85% after 15% platform fee)
      const creatorEarning = data.price_paid_ggg * 0.85;
      const creatorProfile = await base44.entities.UserProfile.filter({ user_id: tier.creator_id });
      if (creatorProfile[0]) {
        await base44.entities.UserProfile.update(creatorProfile[0].id, {
          ggg_balance: (creatorProfile[0].ggg_balance || 0) + creatorEarning,
          total_earnings: (creatorProfile[0].total_earnings || 0) + creatorEarning
        });
      }

      // Update tier subscriber count
      await base44.entities.CreatorTier.update(tier.id, {
        current_subscribers: (tier.current_subscribers || 0) + 1
      });

      // Create transaction record
      await base44.entities.GGGTransaction.create({
        user_id: currentUser.email,
        source_type: 'subscription',
        source_id: subscription.id,
        delta: -data.price_paid_ggg,
        reason_code: 'tier_subscription',
        description: `Subscribed to ${tier.creator_name}'s ${tier.tier_name}`,
        balance_after: userProfile.ggg_balance - data.price_paid_ggg
      });

      return subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['creatorTiers'] });
      setModalOpen(false);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId) => {
      await base44.entities.Subscription.update(subscriptionId, {
        status: 'cancelled',
        cancelled_date: new Date().toISOString()
      });

      // Update tier subscriber count
      await base44.entities.CreatorTier.update(tier.id, {
        current_subscribers: Math.max(0, (tier.current_subscribers || 1) - 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['creatorTiers'] });
    }
  });

  const handleSubscribe = () => {
    const price = billingCycle === 'annual' && tier.annual_price_ggg > 0
      ? tier.annual_price_ggg
      : tier.monthly_price_ggg;

    const nextBilling = billingCycle === 'annual'
      ? addYears(new Date(), 1).toISOString()
      : addMonths(new Date(), 1).toISOString();

    subscribeMutation.mutate({
      subscriber_id: currentUser.email,
      subscriber_name: userProfile.display_name,
      subscriber_avatar: userProfile.avatar_url,
      creator_id: tier.creator_id,
      creator_name: tier.creator_name,
      tier_id: tier.id,
      tier_name: tier.tier_name,
      billing_cycle: billingCycle,
      price_paid_ggg: price,
      status: 'active',
      started_date: new Date().toISOString(),
      next_billing_date: nextBilling,
      total_paid_ggg: price,
      months_active: billingCycle === 'annual' ? 12 : 1
    });
  };

  const isSubscribed = currentSubscription?.status === 'active';
  const isFull = tier.max_subscribers && tier.current_subscribers >= tier.max_subscribers;
  const canSubscribe = !isSubscribed && !isFull;

  return (
    <>
      <Card className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        isSubscribed && "ring-2 ring-violet-500"
      )}>
        <CardHeader className="bg-gradient-to-br from-violet-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {tier.tier_name}
                {isSubscribed && (
                  <Badge className="bg-violet-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">{tier.description}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-violet-600">
                {tier.monthly_price_ggg}
              </span>
              <span className="text-slate-500">GGG/month</span>
            </div>
            {tier.annual_price_ggg > 0 && (
              <p className="text-sm text-emerald-600 mt-1">
                {tier.annual_price_ggg} GGG/year (Save {Math.round((1 - tier.annual_price_ggg / (tier.monthly_price_ggg * 12)) * 100)}%)
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3 mb-6">
            {tier.perks?.map((perk, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700">{perk}</span>
              </div>
            ))}
          </div>

          {tier.max_subscribers && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <Sparkles className="w-4 h-4" />
                Limited: {tier.current_subscribers || 0} / {tier.max_subscribers} spots filled
              </div>
            </div>
          )}

          {isSubscribed ? (
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => cancelMutation.mutate(currentSubscription.id)}
            >
              Cancel Subscription
            </Button>
          ) : (
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
              onClick={() => setModalOpen(true)}
              disabled={isFull}
            >
              <Crown className="w-4 h-4" />
              {isFull ? 'Tier Full' : 'Subscribe'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {tier.tier_name}</DialogTitle>
            <DialogDescription>
              Choose your billing cycle and confirm subscription
            </DialogDescription>
          </DialogHeader>

          <Tabs value={billingCycle} onValueChange={setBillingCycle}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual" disabled={!tier.annual_price_ggg}>
                Annual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Monthly Price</span>
                  <span className="text-lg font-bold text-violet-600">
                    {tier.monthly_price_ggg} GGG
                  </span>
                </div>
                <p className="text-xs text-slate-500">Billed monthly, cancel anytime</p>
              </div>
            </TabsContent>

            <TabsContent value="annual" className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Annual Price</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {tier.annual_price_ggg} GGG
                  </span>
                </div>
                <p className="text-xs text-emerald-600">
                  Save {Math.round((1 - tier.annual_price_ggg / (tier.monthly_price_ggg * 12)) * 100)}% vs monthly
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Your Balance</span>
              <span className="text-lg font-bold flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-500" />
                {userProfile?.ggg_balance?.toLocaleString() || 0} GGG
              </span>
            </div>
            {userProfile?.ggg_balance < (billingCycle === 'annual' ? tier.annual_price_ggg : tier.monthly_price_ggg) && (
              <p className="text-xs text-rose-600">Insufficient balance</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={subscribeMutation.isPending || userProfile?.ggg_balance < (billingCycle === 'annual' ? tier.annual_price_ggg : tier.monthly_price_ggg)}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              Confirm Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}