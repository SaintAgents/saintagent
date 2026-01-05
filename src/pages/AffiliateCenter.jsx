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
  AlertCircle,
  Award,
  Crown,
  Star,
  Gift,
  Lock,
  Zap,
  Plus,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import CreateCampaignModal from '@/components/affiliate/CreateCampaignModal';
import CampaignAnalytics from '@/components/affiliate/CampaignAnalytics';

// Affiliate Tier System
const AFFILIATE_TIERS = [
  { 
    id: 'bronze', 
    name: 'Bronze', 
    minPaid: 0, 
    commission: 0.25, 
    color: 'from-amber-600 to-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    icon: Award,
    benefits: ['Base 0.25 GGG per referral', 'Personal invite link', 'Basic analytics']
  },
  { 
    id: 'silver', 
    name: 'Silver', 
    minPaid: 5, 
    commission: 0.35, 
    color: 'from-slate-400 to-slate-500',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-300',
    icon: Star,
    benefits: ['0.35 GGG per referral (+40%)', 'Offer-specific links', 'Priority support', 'Early feature access']
  },
  { 
    id: 'gold', 
    name: 'Gold', 
    minPaid: 20, 
    commission: 0.50, 
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    icon: Crown,
    benefits: ['0.50 GGG per referral (+100%)', 'Custom promo materials', 'Exclusive leader channel', 'Co-marketing opportunities', 'VIP badge on profile']
  }
];

function getAffiliateTier(paidReferrals) {
  if (paidReferrals >= 20) return AFFILIATE_TIERS[2]; // Gold
  if (paidReferrals >= 5) return AFFILIATE_TIERS[1]; // Silver
  return AFFILIATE_TIERS[0]; // Bronze
}

function getNextTier(paidReferrals) {
  if (paidReferrals >= 20) return null; // Already Gold
  if (paidReferrals >= 5) return AFFILIATE_TIERS[2]; // Next is Gold
  return AFFILIATE_TIERS[1]; // Next is Silver
}

export default function AffiliateCenter() {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('links');
  const queryClient = useQueryClient();

  // Fetch current user first
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user profile
  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  // Fetch or create affiliate code
  const { data: affiliateCodes = [], isLoading: codeLoading } = useQuery({
    queryKey: ['affiliateCodes', currentUser?.email, profile?.handle],
    queryFn: async () => {
      let codes = await base44.entities.AffiliateCode.filter({ user_id: currentUser.email });
      
      // Ensure primary code exists
      const primaryCode = codes.find(c => !c.campaign_name);
      if (!primaryCode && profile?.handle) {
        const newCode = await base44.entities.AffiliateCode.create({
          user_id: currentUser.email,
          code: profile.handle,
          target_type: 'general',
          status: 'active'
        });
        codes = [newCode, ...codes];
      }
      
      return codes;
    },
    enabled: !!currentUser?.email && !!profile?.handle
  });
  const affiliateCode = affiliateCodes.find(c => !c.campaign_name) || affiliateCodes[0];

  // Fetch clicks for analytics
  const { data: clicks = [] } = useQuery({
    queryKey: ['affiliateClicks', currentUser?.email],
    queryFn: () => base44.entities.AffiliateClick.filter({ affiliate_code: affiliateCode?.code }, '-created_date', 500),
    enabled: !!affiliateCode?.code
  });

  // Fetch events for campaign creation
  const { data: events = [] } = useQuery({
    queryKey: ['myEvents', currentUser?.email],
    queryFn: () => base44.entities.Event.filter({ host_id: currentUser.email, status: 'upcoming' }),
    enabled: !!currentUser?.email
  });

  // Fetch missions for campaign creation
  const { data: missions = [] } = useQuery({
    queryKey: ['myMissions', currentUser?.email],
    queryFn: () => base44.entities.Mission.filter({ creator_id: currentUser.email, status: 'active' }),
    enabled: !!currentUser?.email
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: (campaignId) => base44.entities.AffiliateCode.delete(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliateCodes'] });
      toast.success('Campaign deleted');
    }
  });

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', currentUser?.email],
    queryFn: () => base44.entities.Referral.filter({ affiliate_user_id: currentUser.email }, '-created_date'),
    enabled: !!currentUser?.email
  });

  // Fetch listings for offer-level links
  const { data: listings = [] } = useQuery({
    queryKey: ['myListings', currentUser?.email],
    queryFn: () => base44.entities.Listing.filter({ owner_id: currentUser.email, status: 'active' }),
    enabled: !!currentUser?.email
  });

  // Get the proper base URL for affiliate links
  const getBaseUrl = () => {
    const origin = window.location.origin;
    // Replace sandbox prefix with live domain
    if (origin.includes('sandbox.base44.app')) {
      return origin.replace('sandbox.base44.app', 'base44.app');
    }
    return origin;
  };

  const affiliateUrl = affiliateCode 
    ? `${getBaseUrl()}/Join?ref=${affiliateCode.code}`
    : '';

  const offerUrl = selectedOffer
    ? `${getBaseUrl()}/ListingDetail?id=${selectedOffer.id}&ref=${affiliateCode?.code}`
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

  // Calculate tier
  const currentTier = getAffiliateTier(stats.paid);
  const nextTier = getNextTier(stats.paid);
  const progressToNext = nextTier 
    ? ((stats.paid - (currentTier.minPaid)) / (nextTier.minPaid - currentTier.minPaid)) * 100
    : 100;

  // Show loading state - wait for user and profile to load
  const isLoading = userLoading || (currentUser && profileLoading) || (profile?.handle && codeLoading);
  
  // If still loading, show spinner
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading affiliate data...</p>
        </div>
      </div>
    );
  }

  // If no profile/handle yet - show message to complete profile
  if (!profile?.handle) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Profile Required</h2>
            <p className="text-sm mb-4">
              Complete your profile and set a handle to access your affiliate link.
            </p>
            <Button onClick={() => window.location.href = '/Profile'}>
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Affiliate Center</h1>
            <p className="text-slate-600">
              Invite people who would genuinely benefit. Earn 0.25 GGG ($36.25) when they complete their first paid action.
            </p>
          </div>
          <Button 
            onClick={() => setCreateCampaignOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>

        {/* Tier Status Card */}
        <Card className={cn("mb-8 border-2", currentTier.borderColor)}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn("w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center", currentTier.color)}>
                  <currentTier.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Your Affiliate Tier</p>
                  <h2 className={cn("text-2xl font-bold", currentTier.textColor)}>{currentTier.name} Affiliate</h2>
                  <p className="text-sm">
                    Earning <span className="font-semibold text-emerald-600">{currentTier.commission} GGG</span> per referral (${(currentTier.commission * 145).toFixed(2)})
                  </p>
                </div>
              </div>
              
              {nextTier && (
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{stats.paid} paid referrals</span>
                    <span className={nextTier.textColor}>{nextTier.name} at {nextTier.minPaid}</span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                  <p className="text-xs mt-1 text-slate-500">
                    {nextTier.minPaid - stats.paid} more to unlock {nextTier.name}
                  </p>
                </div>
              )}
              
              {!nextTier && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-white">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Max Tier Achieved!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.clicks}</p>
                <p className="text-xs mt-1">Clicks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.signups}</p>
                <p className="text-xs mt-1">Signups</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{stats.activated}</p>
                <p className="text-xs mt-1">Activated</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
                <p className="text-xs mt-1">Paid</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.gggEarned.toFixed(2)}</p>
                <p className="text-xs mt-1">GGG Earned</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs mt-1">Conversion</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="links" className="flex-1 gap-2">
              <Link2 className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex-1 gap-2">
              <Users className="w-4 h-4" />
              Referrals
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Content based on tab */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'links' && (
              <>
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
                      <label className="text-sm font-medium mb-2 block">
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
                      <p className="text-xs mt-2 text-slate-500">
                        Share this link anywhere. When someone signs up through it, you'll be credited.
                      </p>
                    </div>

                    {/* Offer-Specific Links */}
                    {listings.length > 0 && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Quick Offer Links
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                          Click an offer to generate a trackable link.
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
                                  <p className="font-medium text-sm">{listing.title}</p>
                                  <p className="text-xs text-slate-500">${listing.price_amount}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedOffer && (
                          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                            <p className="text-xs font-medium mb-2">
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

                {/* Campaign Links Summary */}
                {affiliateCodes.filter(c => c.campaign_name).length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-600" />
                          Campaign Links
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setActiveTab('analytics')}
                          className="text-violet-600"
                        >
                          View All
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {affiliateCodes.filter(c => c.campaign_name).slice(0, 3).map(campaign => (
                          <div key={campaign.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                            <div>
                              <p className="text-sm font-medium">{campaign.campaign_name}</p>
                              <p className="text-xs text-slate-500">{campaign.target_name || campaign.target_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{campaign.total_clicks || 0} clicks</p>
                              <p className="text-xs text-emerald-600">{campaign.total_paid || 0} paid</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {activeTab === 'analytics' && (
              <CampaignAnalytics
                campaigns={affiliateCodes}
                clicks={clicks}
                referrals={referrals}
                onDelete={(id) => deleteCampaignMutation.mutate(id)}
                baseUrl={getBaseUrl()}
              />
            )}

            {activeTab === 'referrals' && (
              <Card>
                <CardHeader>
                  <CardTitle>All Referrals</CardTitle>
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
                              <p className="text-sm font-medium">
                                {ref.referred_user_id}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-slate-500">
                                  {ref.status === 'pending' ? 'Signed up' : 'Onboarding complete'}
                                </p>
                                {ref.campaign_name && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                                    {ref.campaign_name}
                                  </span>
                                )}
                                {ref.target_name && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                    {ref.target_name}
                                  </span>
                                )}
                              </div>
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
                              <p className="text-sm font-medium">
                                {ref.referred_user_id}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-slate-600">
                                  {ref.qualifying_action}
                                </p>
                                {ref.campaign_name && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                                    {ref.campaign_name}
                                  </span>
                                )}
                                {ref.target_name && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                    {ref.target_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-emerald-600">
                                +{ref.ggg_amount} GGG
                              </p>
                              <p className="text-xs text-slate-600">
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
            )}
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
                    <p className="text-sm font-medium">Share Your Link</p>
                    <p className="text-xs">Send to people who'd benefit</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">They Sign Up</p>
                    <p className="text-xs">Create account & complete onboarding</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-violet-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">First Paid Action</p>
                    <p className="text-xs">Booking, event, or mission</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">You Earn 0.25 GGG</p>
                    <p className="text-xs">Worth $36.25</p>
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
                  Affiliate Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {AFFILIATE_TIERS.map((tier, idx) => {
                  const isCurrentTier = tier.id === currentTier.id;
                  const isLocked = tier.minPaid > stats.paid;
                  const TierIcon = tier.icon;
                  
                  return (
                    <div 
                      key={tier.id}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all",
                        isCurrentTier ? cn(tier.borderColor, tier.bgColor) : "border-slate-200",
                        isLocked && "opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isLocked ? "bg-slate-200" : `bg-gradient-to-br ${tier.color}`
                        )}>
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-slate-400" />
                          ) : (
                            <TierIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-semibold text-sm", isCurrentTier && tier.textColor)}>
                              {tier.name}
                            </span>
                            {isCurrentTier && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-600 text-white">CURRENT</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {tier.minPaid === 0 ? 'Starting tier' : `${tier.minPaid}+ paid referrals`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-bold text-sm", isLocked ? "text-slate-400" : "text-emerald-600")}>
                            {tier.commission} GGG
                          </p>
                          <p className="text-[10px] text-slate-500">per referral</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        {tier.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {isLocked ? (
                              <Lock className="w-3 h-3 text-slate-300" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                            <span className={isLocked ? "text-slate-400" : "text-slate-600"}>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
                    Referrals also boost your <span className="font-medium">Connector</span> rank and <span className="font-medium">Reach</span> score
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        open={createCampaignOpen}
        onOpenChange={setCreateCampaignOpen}
        userId={currentUser?.email}
        userHandle={profile?.handle}
        listings={listings}
        events={events}
        missions={missions}
      />
    </div>
  );
}