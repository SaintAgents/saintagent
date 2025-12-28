import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight } from "lucide-react";
import ListingCard from '@/components/hud/ListingCard';

export default function MarketplaceEarnLearn({ listings = [], onAction }) {
  return (
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
          listings.filter(l => l.listing_type === 'offer').slice(0, 2).map((listing) => (
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
        {listings.slice(0, 2).map((listing) => (
          <ListingCard 
            key={listing.id} 
            listing={listing} 
            onAction={onAction}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}