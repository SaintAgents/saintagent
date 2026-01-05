import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link2, 
  Copy, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  DollarSign,
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AffiliateCenter() {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  // Fetch or create affiliate code
  const { data: affiliateCodes = [], isLoading: codeLoading } = useQuery({
    queryKey: ['affiliateCode', profile?.handle],
    queryFn: async () => {
      const user = await base44.auth.me();
      let codes = await base44.entities.AffiliateCode.filter({ user_id: user.email });
      
      if (codes.length === 0 && profile?.handle) {
        // Create affiliate code
        const newCode = await base44.entities.AffiliateCode.create({
          user_id: user.email,
          code: profile.handle,
          status: 'active'
        });
        codes = [newCode];
      }
      
      return codes;
    },
    enabled: !!profile?.handle
  });
  const affiliateCode = affiliateCodes[0];

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Referral.filter({ affiliate_user_id: user.email }, '-created_date');
    }
  });

  // Fetch listings for offer-level links
  const { data: listings = [] } = useQuery({
    queryKey: ['myListings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Listing.filter({ owner_id: user.email, status: 'active' });
    }
  });

  const affiliateUrl = affiliateCode 
    ? `${window.location.origin}?ref=${affiliateCode.code}`
    : '';

  const offerUrl = selectedOffer
    ? `${window.location.origin}/offer/${selectedOffer.id}?ref=${affiliateCode?.code}`
    : '';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const stats = {
    clicks: affiliateCode?.total_clicks || 0,
    signups: affiliateCode?.total_signups || 0,
    activated: affiliateCode?.total_activated || 0,
    paid: affiliateCode?.total_paid || 0,
    gggEarned: affiliateCode?.total_ggg_earned || 0,
    usdValue: (affiliateCode?.total_ggg_earned || 0) * 145
  };

  const conversionRate = stats.signups > 0 
    ? ((stats.paid / stats.signups) * 100).toFixed(1) 
    : 0;

  const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'activated');
  const paidReferrals = referrals.filter(r => r.status === 'paid');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Affiliate Center</h1>
          <p className="text-slate-600">
            Invite people who would genuinely benefit. Earn 0.25 GGG ($36.25) when they complete their first paid action.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.clicks}</p>
                <p className="text-xs text-slate-500 mt-1">Clicks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.signups}</p>
                <p className="text-xs text-slate-500 mt-1">Signups</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{stats.activated}</p>
                <p className="text-xs text-slate-500 mt-1">Activated</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
                <p className="text-xs text-slate-500 mt-1">Paid</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.gggEarned.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">GGG Earned</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
                <p className="text-xs text-slate-500 mt-1">Conversion</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Links */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Your Affiliate Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Link */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Personal Invite Link
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      value={affiliateUrl} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      onClick={() => copyToClipboard(affiliateUrl)}
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Share this link anywhere. When someone signs up through it, you'll be credited.
                  </p>
                </div>

                {/* Offer-Specific Links */}
                {listings.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Offer-Specific Links
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Create custom links for specific offers to track which promotions work best.
                    </p>
                    <div className="space-y-2">
                      {listings.slice(0, 5).map((listing) => (
                        <div 
                          key={listing.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedOffer?.id === listing.id 
                              ? "border-violet-300 bg-violet-50" 
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => setSelectedOffer(listing)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm">{listing.title}</p>
                              <p className="text-xs text-slate-500">${listing.price_amount}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedOffer && (
                      <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-xs font-medium text-slate-700 mb-2">
                          Link for: {selectedOffer.title}
                        </p>
                        <div className="flex gap-2">
                          <Input 
                            value={offerUrl} 
                            readOnly 
                            className="font-mono text-xs"
                          />
                          <Button 
                            onClick={() => copyToClipboard(offerUrl)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referrals List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="w-full">
                    <TabsTrigger value="pending" className="flex-1">
                      Pending ({pendingReferrals.length})
                    </TabsTrigger>
                    <TabsTrigger value="paid" className="flex-1">
                      Paid ({paidReferrals.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="space-y-3 mt-4">
                    {pendingReferrals.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No pending referrals</p>
                      </div>
                    ) : (
                      pendingReferrals.map((ref) => (
                        <div 
                          key={ref.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {ref.referred_user_id}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ref.status === 'pending' ? 'Signed up' : 'Onboarding complete'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-amber-600">
                              {ref.status === 'pending' ? 'Complete onboarding' : 'Awaiting first action'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="paid" className="space-y-3 mt-4">
                    {paidReferrals.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No paid referrals yet</p>
                      </div>
                    ) : (
                      paidReferrals.map((ref) => (
                        <div 
                          key={ref.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {ref.referred_user_id}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ref.qualifying_action}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">
                              +{ref.ggg_amount} GGG
                            </p>
                            <p className="text-xs text-slate-500">
                              ${ref.credited_value_usd}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Guide & Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Share Your Link</p>
                    <p className="text-xs text-slate-600">Send to people who'd benefit</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">They Sign Up</p>
                    <p className="text-xs text-slate-600">Create account & complete onboarding</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">First Paid Action</p>
                    <p className="text-xs text-slate-600">Booking, event, or mission</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">You Earn 0.25 GGG</p>
                    <p className="text-xs text-slate-600">Worth $36.25</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 mb-1">Keep It Genuine</p>
                    <p className="text-xs text-amber-700">
                      Only share with people who would truly benefit. Quality over quantity builds trust and credibility.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Rank Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">
                  Successful referrals contribute to your rank progression, especially:
                </p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    <span>Connector rank (network growth)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    <span>Facilitator rank (platform contribution)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">•</span>
                    <span>Reach score (influence)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}