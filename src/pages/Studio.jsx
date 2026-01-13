import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye,
  ShoppingBag,
  Calendar,
  BarChart3,
  Zap,
  HelpCircle
} from "lucide-react";
import HelpHint from '@/components/hud/HelpHint';
import MetricTile from '@/components/hud/MetricTile';
import TierManager from '@/components/creator/TierManager';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import { canAccessAdvancedAnalytics, canAccessOptOutControls, getPerformanceNudge } from '@/components/merit/MeritScoreUtils';

const CREATOR_HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/740e4858f_universal_upscale_0_1b9b7ded-4214-49b8-8dd1-4839388dd21a_0.jpg";

export default function Studio() {
  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Listing.filter({ owner_id: user.email });
    }
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Booking.filter({ seller_id: user.email });
    }
  });

  const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
  const totalRequests = listings.reduce((sum, l) => sum + (l.requests_count || 0), 0);
  const totalBookings = listings.reduce((sum, l) => sum + (l.bookings_count || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="page-hero relative h-48 md:h-56 overflow-hidden">
        <img
          src={CREATOR_HERO_IMAGE}
          alt="Creator Studio"
          className="hero-image w-full h-full object-cover"
          style={{ filter: 'none', WebkitFilter: 'none', opacity: 1, display: 'block', visibility: 'visible' }}
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 hero-content">
          <div className="flex items-center gap-3 mb-2">
            <HeroGalleryTrigger startIndex={1} className="text-white/80" />
            <LoopStartIndicator currentPage="Studio" className="text-white/80 hover:text-emerald-300" />
            <BarChart3 className="w-7 h-7 text-violet-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              Creator Studio
            </h1>
            <ForwardButton currentPage="Studio" className="text-white/80 hover:text-white" />
          </div>
          <p className="text-white/80 flex items-center gap-1.5">
            Your business command center
            <HelpHint
              content={
                <div className="space-y-3">
                  <div>
                    <div className="text-violet-400 font-bold text-sm mb-1">Welcome to Your Creator Studio</div>
                    <div className="text-amber-400 text-xs font-semibold">"The Ultimate Command Center for High-Frequency Impact"</div>
                  </div>
                  <ul className="space-y-2 text-xs">
                    <li><span className="text-emerald-400 font-semibold">Patreon on Steroids:</span> <span className="text-slate-300">Your decentralized economic engine where content and service translate directly into gold-pegged value.</span></li>
                    <li><span className="text-emerald-400 font-semibold">Total Sovereignty:</span> <span className="text-slate-300">Manage your entire business ecosystem—from mentorship tiers and activation sessions to advanced monetization funnels—all in one high-performance dashboard.</span></li>
                    <li><span className="text-emerald-400 font-semibold">Performance Tracking:</span> <span className="text-slate-300">Gain deep insights into your Revenue, Conversion Rates, and Audience Resonance to see exactly how your frequency is moving the needle.</span></li>
                    <li><span className="text-emerald-400 font-semibold">The ULTRANET Advantage:</span> <span className="text-slate-300">Leverage AI-driven discovery to find the exact collaborators and students who are already Grid Aligned with your specific mission.</span></li>
                    <li><span className="text-emerald-400 font-semibold">Scale Your Influence:</span> <span className="text-slate-300">This is more than a profile; it is your launchpad for planetary-scale growth, designed to reward your integrity as much as your output.</span></li>
                  </ul>
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <div className="text-cyan-400 font-bold text-xs mb-2">✨ First Steps Checklist</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">1.</span> Create your first Listing in the Marketplace
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">2.</span> Set up your Mentorship Tiers below
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">3.</span> Review your Conversion Funnel metrics
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">4.</span> Explore the Earnings Matrix to understand GGG flows
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">5.</span> Connect with collaborators via the Synchronicity Engine
                      </li>
                    </ul>
                  </div>
                </div>
              }
            />
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricTile
            label="Revenue"
            value={`$${profile?.total_earnings || 0}`}
            icon={DollarSign}
            color="emerald"
            valueClassName="text-emerald-500"
          />
          <MetricTile
            label="Views"
            value={totalViews}
            icon={Eye}
            color="blue"
            valueClassName="text-emerald-500"
          />
          <MetricTile
            label="Bookings"
            value={totalBookings}
            icon={Calendar}
            color="violet"
            valueClassName="text-emerald-500"
          />
          <MetricTile
            label="Conversion"
            value={`${conversionRate}%`}
            icon={TrendingUp}
            color="amber"
            valueClassName="text-emerald-500"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full grid grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="boosts">Boosts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Impressions</p>
                      <p className="text-2xl font-bold text-blue-900">{totalViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50">
                    <div>
                      <p className="text-sm text-amber-600 font-medium">Requests</p>
                      <p className="text-2xl font-bold text-amber-900">{totalRequests}</p>
                    </div>
                    <Users className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Bookings</p>
                      <p className="text-2xl font-bold text-emerald-900">{totalBookings}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {listings.slice(0, 5).map(listing => (
                    <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">{listing.title}</p>
                        <p className="text-sm text-slate-500">{listing.bookings_count || 0} bookings</p>
                      </div>
                      <p className="font-bold text-emerald-600">${listing.price_amount * (listing.bookings_count || 0)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-6">
            <TierManager profile={profile} />
          </TabsContent>

          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>Your Offers ({listings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {listings.map(listing => (
                    <div key={listing.id} className="p-4 rounded-xl border hover:border-violet-200 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{listing.title}</h4>
                          <p className="text-sm text-slate-500">{listing.category}</p>
                        </div>
                        <p className="font-bold text-lg">${listing.price_amount}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Views</p>
                          <p className="font-semibold">{listing.views_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Requests</p>
                          <p className="font-semibold">{listing.requests_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Bookings</p>
                          <p className="font-semibold text-emerald-600">{listing.bookings_count || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div key={booking.id} className="p-4 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{booking.buyer_name}</p>
                          <p className="text-sm text-slate-500">{booking.status}</p>
                        </div>
                        <p className="font-bold text-emerald-600">${booking.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50">
                    <Users className="w-8 h-8 text-blue-500 mb-3" />
                    <p className="text-3xl font-bold text-blue-900">{profile?.follower_count || 0}</p>
                    <p className="text-blue-600">Total Followers</p>
                  </div>
                  <div className="p-4 rounded-xl bg-violet-50">
                    <TrendingUp className="w-8 h-8 text-violet-500 mb-3" />
                    <p className="text-3xl font-bold text-violet-900">{profile?.reach_score || 0}</p>
                    <p className="text-violet-600">Reach Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boosts">
            <Card>
              <CardHeader>
                <CardTitle>Active Boosts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No active boosts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Note: Hero image preserves across themes via data-no-filter attribute