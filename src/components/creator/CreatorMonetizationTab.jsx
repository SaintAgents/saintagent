import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Package, 
  Heart, 
  Coins, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";
import TierManager from './TierManager';
import DigitalProductManager from './DigitalProductManager';
import { format } from 'date-fns';

export default function CreatorMonetizationTab({ profile }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch creator stats
  const { data: tiers = [] } = useQuery({
    queryKey: ['creatorTiers', profile?.user_id],
    queryFn: () => base44.entities.CreatorTier.filter({ creator_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['creatorSubscriptions', profile?.user_id],
    queryFn: () => base44.entities.Subscription.filter({ creator_id: profile?.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  const { data: products = [] } = useQuery({
    queryKey: ['digitalProducts', profile?.user_id],
    queryFn: () => base44.entities.DigitalProduct.filter({ creator_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const { data: tips = [] } = useQuery({
    queryKey: ['creatorTips', profile?.user_id],
    queryFn: () => base44.entities.Tip.filter({ to_user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['creatorProductSales', profile?.user_id],
    queryFn: () => base44.entities.ProductPurchase.filter({ creator_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Calculate stats
  const totalSubscribers = subscriptions.length;
  const monthlySubscriptionRevenue = subscriptions.reduce((sum, s) => {
    if (s.billing_cycle === 'monthly') return sum + (s.price_paid_ggg || 0);
    return sum + ((s.price_paid_ggg || 0) / 12);
  }, 0);
  const totalTips = tips.reduce((sum, t) => sum + (t.amount_ggg || 0), 0);
  const totalProductSales = purchases.reduce((sum, p) => sum + (p.price_paid_ggg || 0), 0);
  const totalEarnings = profile?.total_earnings || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Creator Monetization</h2>
        <p className="text-slate-500 mt-1">Manage your revenue streams and digital products</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEarnings.toFixed(1)}</p>
                <p className="text-xs text-slate-500">Total GGG Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubscribers}</p>
                <p className="text-xs text-slate-500">Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTips.toFixed(1)}</p>
                <p className="text-xs text-slate-500">Tips Received</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProductSales.toFixed(1)}</p>
                <p className="text-xs text-slate-500">Product Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <Crown className="w-4 h-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="tips" className="gap-2">
            <Heart className="w-4 h-4" />
            Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="font-medium">Subscriptions</p>
                      <p className="text-xs text-slate-500">{totalSubscribers} active subscribers</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-violet-600">
                    ~{monthlySubscriptionRevenue.toFixed(1)} GGG/mo
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Product Sales</p>
                      <p className="text-xs text-slate-500">{purchases.length} total sales</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">
                    {totalProductSales.toFixed(1)} GGG
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-rose-600" />
                    <div>
                      <p className="font-medium">Tips</p>
                      <p className="text-xs text-slate-500">{tips.length} tips received</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-rose-600">
                    {totalTips.toFixed(1)} GGG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...tips.slice(0, 3), ...purchases.slice(0, 3), ...subscriptions.slice(0, 3)]
                  .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                  .slice(0, 5)
                  .map((item, i) => {
                    const isTip = 'amount_ggg' in item;
                    const isPurchase = 'product_title' in item;
                    const isSubscription = 'tier_name' in item;

                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          {isTip && <Heart className="w-4 h-4 text-rose-500" />}
                          {isPurchase && <Package className="w-4 h-4 text-emerald-500" />}
                          {isSubscription && <Crown className="w-4 h-4 text-violet-500" />}
                          <div>
                            <p className="text-sm font-medium">
                              {isTip && `Tip from ${item.is_anonymous ? 'Anonymous' : item.from_name}`}
                              {isPurchase && `${item.buyer_name} purchased "${item.product_title}"`}
                              {isSubscription && `${item.subscriber_name} subscribed to ${item.tier_name}`}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.created_date && format(new Date(item.created_date), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-medium">
                          +{(isTip ? item.amount_ggg : item.price_paid_ggg)?.toFixed(1)} GGG
                        </Badge>
                      </div>
                    );
                  })}
                {tips.length === 0 && purchases.length === 0 && subscriptions.length === 0 && (
                  <p className="text-center text-slate-400 py-4">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <TierManager profile={profile} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <DigitalProductManager profile={profile} />
        </TabsContent>

        <TabsContent value="tips" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Tips Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tips.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No tips received yet</p>
                  <p className="text-sm mt-1">Share your profile to start receiving tips!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tips.map((tip) => (
                    <div key={tip.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-3">
                        {tip.from_avatar && !tip.is_anonymous ? (
                          <img src={tip.from_avatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {tip.is_anonymous ? 'Anonymous' : tip.from_name}
                          </p>
                          {tip.message && (
                            <p className="text-sm text-slate-500">"{tip.message}"</p>
                          )}
                          <p className="text-xs text-slate-400">
                            {tip.created_date && format(new Date(tip.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-rose-100 text-rose-700 text-lg font-bold">
                        {tip.amount_ggg} GGG
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}