import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, TrendingUp } from "lucide-react";
import ListingCard from '@/components/hud/ListingCard';
import HelpHint from '@/components/hud/HelpHint';

export default function MarketplaceEarnLearn({ listings = [], onAction }) {
  // Fetch top trending listings (most viewed or most bookings)
  const { data: allListings = [] } = useQuery({
    queryKey: ['allListings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }),
    staleTime: 60000
  });
  
  const trendingListings = React.useMemo(() => {
    return [...allListings]
      .sort((a, b) => {
        const scoreA = (a.views_count || 0) + (a.bookings_count || 0) * 3 + (a.requests_count || 0) * 2;
        const scoreB = (b.views_count || 0) + (b.bookings_count || 0) * 3 + (b.requests_count || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [allListings]);
  return (
    <div>
      <div className="flex justify-end mb-2">
        <HelpHint content="Marketplace: Value Exchange. Offerings: List your skills (Mentorship, Healing, Consulting) for a GGG price. Bookings: Users spend GGG to book your time—the system automatically handles scheduling and payment. Mutual Aid: Listings can be set to 'Free' to support the community without GGG exchange. Create offers to earn GGG, or browse to find services from other agents." />
      </div>
    <Tabs defaultValue="offers" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="offers" className="text-xs">My Offers</TabsTrigger>
        <TabsTrigger value="requests" className="text-xs">Requests</TabsTrigger>
        <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
      </TabsList>
      <TabsContent value="offers" className="space-y-3">
        {listings.filter(l => l.listing_type === 'offer').length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No offers yet</p>
            <Button className="mt-3 rounded-xl bg-violet-600 hover:bg-violet-700">
              Create your first offer
            </Button>
          </div>
        ) : (
          listings.filter(l => l.listing_type === 'offer').map((listing) => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              isOwner={true}
              onAction={onAction}
            />
          ))
        )}
      </TabsContent>
      <TabsContent value="requests" className="space-y-3">
        <div className="text-center py-6">
          <p className="text-sm text-slate-500">No pending requests</p>
        </div>
      </TabsContent>
      <TabsContent value="browse" className="space-y-3">
        {/* Trending Section */}
        {trendingListings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 [data-theme='hacker']_&:text-[#00ff00] uppercase tracking-wide">Trending Now</span>
            </div>
            {trendingListings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onAction={onAction}
              />
            ))}
          </div>
        )}
        
        {listings.length === 0 && trendingListings.length === 0 && (
          <div className="text-center py-6">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No listings available yet</p>
            <Button 
              variant="outline"
              className="mt-3 rounded-xl" 
              onClick={() => window.location.href = '/Marketplace'}
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Browse Marketplace
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
    </div>
  );
}