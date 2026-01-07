import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem } from
"@/components/ui/select";
import {
  ShoppingBag,
  Search,
  Plus,
  Filter,
  Grid3X3,
  List } from
"lucide-react";

import ListingCard from '@/components/hud/ListingCard';
import CreateListingModal from '@/components/marketplace/CreateListingModal';
import EarningsMatrixModal from '@/components/earnings/EarningsMatrixModal';
import BackButton from '@/components/hud/BackButton';

const MARKETPLACE_HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/580eea501_Screenshot2026-01-06215246.png";

export default function Marketplace() {
  const [tab, setTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [createOpen, setCreateOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date', 50),
    staleTime: 2 * 60 * 1000,
  });
  const queryClient = useQueryClient();

  const filteredListings = listings.filter((l) => {
    // Only show active listings
    if (l.status !== 'active') return false;
    const matchesSearch = !searchQuery ||
    l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = tab === 'offers' ? l.listing_type === 'offer' : tab === 'requests' ? l.listing_type === 'request' : true;
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    const matchesDelivery = deliveryFilter === 'all' || l.delivery_mode === deliveryFilter;
    return matchesSearch && matchesType && matchesCategory && matchesDelivery;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={MARKETPLACE_HERO_IMAGE}
          alt="Marketplace Hero"
          className="w-full h-full object-cover object-center hero-image"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BackButton />
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
              Marketplace
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 ml-9">Offer your skills, find mentors, and grow together</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Create Listing
            </Button>
            <Button variant="outline" className="bg-slate-50 text-stone-950 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9" onClick={() => setMatrixOpen(true)}>
              Earnings Matrix
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search listings..."
              className="pl-12 h-12 rounded-xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />

          </div>
          <Button variant="outline" className="bg-slate-50 text-stone-950 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-12 gap-2" onClick={() => setShowFilters((v) => !v)}>
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <div className="flex items-center bg-white rounded-xl border p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon" className="bg-secondary text-slate-50 text-sm font-medium rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm hover:bg-secondary/80 h-9 w-9"

              onClick={() => setViewMode('grid')}>

              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-lg"
              onClick={() => setViewMode('list')}>

              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showFilters &&
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="healing">Healing</SelectItem>
                  <SelectItem value="mutual_aid">Mutual Aid</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Delivery</label>
              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in-person">In-person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-white rounded-xl border">
            <TabsTrigger value="browse" className="rounded-lg">
              All Listings
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-lg">
              Offers ({listings.filter((l) => l.listing_type === 'offer').length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg">
              Requests ({listings.filter((l) => l.listing_type === 'request').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Listings Grid */}
        {isLoading ?
        <div className={cn(
          "gap-6",
          viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}>
            {[1, 2, 3, 4, 5, 6].map((i) =>
          <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
          )}
          </div> :
        filteredListings.length === 0 ?
        <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No listings found</h3>
            <p className="text-slate-500 mb-6">Be the first to create an offer or request</p>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => setCreateOpen(true)}>
              Create Listing
            </Button>
          </div> :

        <div className={cn(
          "gap-6",
          viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
        )}>
            {filteredListings.map((listing) =>
          <ListingCard
            key={listing.id}
            listing={listing}
            onAction={handleAction} />

          )}
          </div>
        }
      <EarningsMatrixModal open={matrixOpen} onOpenChange={setMatrixOpen} />

      <CreateListingModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreate={async (data) => {
            if (!currentUser) return;
            await base44.entities.Listing.create({
              owner_id: currentUser.email,
              owner_name: currentUser.full_name,
              owner_avatar: undefined,
              listing_type: data.listing_type || 'offer',
              category: data.category || 'session',
              title: data.title,
              description: data.description || '',
              price_amount: data.is_free ? 0 : Number(data.price_amount || 0),
              is_free: !!data.is_free,
              duration_minutes: Number(data.duration_minutes || 60),
              delivery_mode: data.delivery_mode || 'online',
              status: 'active',
              image_url: data.image_url || undefined
            });
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            setCreateOpen(false);
            }} />
            </div>
            </div>
            );

}