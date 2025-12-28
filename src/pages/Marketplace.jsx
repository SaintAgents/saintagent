import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ShoppingBag,
  Search,
  Plus,
  Filter,
  Grid3X3,
  List
} from "lucide-react";

import ListingCard from '@/components/hud/ListingCard';

export default function Marketplace() {
  const [tab, setTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 50)
  });

  const filteredListings = listings.filter(l => {
    const matchesSearch = !searchQuery || 
      l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (tab === 'offers') return l.listing_type === 'offer' && matchesSearch;
    if (tab === 'requests') return l.listing_type === 'request' && matchesSearch;
    return matchesSearch;
  });

  const handleAction = async (action, listing) => {
    if (action === 'book') {
      if (!currentUser) return;
      await base44.entities.Booking.create({
        listing_id: listing.id,
        buyer_id: currentUser.email,
        seller_id: listing.owner_id,
        buyer_name: currentUser.full_name,
        seller_name: listing.owner_name,
        status: 'pending'
      });
      window.location.href = createPageUrl('Meetings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              Marketplace
            </h1>
            <p className="text-slate-500 mt-1">Offer your skills, find mentors, and grow together</p>
          </div>
          <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" />
            Create Listing
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search listings..."
              className="pl-12 h-12 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 rounded-xl gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <div className="flex items-center bg-white rounded-xl border p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-lg"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-lg"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-white rounded-xl border">
            <TabsTrigger value="browse" className="rounded-lg">
              All Listings
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg">
              Offers ({listings.filter(l => l.listing_type === 'offer').length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg">
              Requests ({listings.filter(l => l.listing_type === 'request').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Listings Grid */}
        {isLoading ? (
          <div className={cn(
            "gap-6",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
          )}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
            <p className="text-slate-500 mb-6">Be the first to create an offer or request</p>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
              Create Listing
            </Button>
          </div>
        ) : (
          <div className={cn(
            "gap-6",
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
          )}>
            {filteredListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}