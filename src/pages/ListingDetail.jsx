import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MiniProfile from '@/components/profile/MiniProfile';
import { Clock, Share2, MapPin, Video, Zap, CheckCircle2 } from 'lucide-react';
import Breadcrumb from '@/components/hud/Breadcrumb';

export default function ListingDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!listingId) return [];
      return base44.entities.Listing.filter({ id: listingId });
    },
    enabled: !!listingId
  });
  const listing = listings?.[0];

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !listing) return;
      await base44.entities.Booking.create({
        listing_id: listing.id,
        buyer_id: currentUser.email,
        seller_id: listing.owner_id,
        buyer_name: currentUser.full_name,
        seller_name: listing.owner_name,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      window.location.href = createPageUrl('Meetings');
    }
  });

  const DeliveryIcon = (listing?.delivery_mode === 'in-person') ? MapPin : Video;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="flex items-start gap-4">
              <div className="w-40 h-40 bg-slate-200 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-100 rounded animate-pulse" />
                <div className="flex gap-3 mt-4">
                  <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Listing not found</h2>
          <Button onClick={() => window.location.href = createPageUrl('Marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Breadcrumb items={[
            { label: 'Marketplace', page: 'Marketplace' },
            { label: listing?.title || 'Listing Details' }
          ]} />
          <div className="flex items-start gap-4">
            {listing.image_url && (
              <img src={listing.image_url} alt={listing.title} className="w-40 h-40 object-cover rounded-xl border" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {listing.category && <Badge variant="secondary" className="capitalize">{listing.category}</Badge>}
                {listing.is_free && <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">{listing.description}</p>
              <div className="flex items-center gap-3 mt-3 text-sm text-slate-600">
                <Clock className="w-4 h-4" /> {listing.duration_minutes} min
                <span className="inline-flex items-center gap-1"><DeliveryIcon className="w-4 h-4" /> {listing.delivery_mode}</span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                {!listing.is_free && (
                  <div className="text-xl font-bold text-slate-900">${listing.price_amount}</div>
                )}
                <Button className="bg-violet-600 hover:bg-violet-700 rounded-lg" onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending}>
                  {bookMutation.isPending ? 'Sending Request…' : listing.listing_type === 'request' ? 'Offer to Help' : 'Request to Book'}
                </Button>
                <p className="text-xs text-slate-500 max-w-[200px]">
                  {listing.listing_type === 'request' 
                    ? 'The host will be notified and can accept your offer' 
                    : 'A booking request will be sent to the host for confirmation'}
                </p>
                <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Hosted by</h3>
          <MiniProfile userId={listing.owner_id} name={listing.owner_name} avatar={listing.owner_avatar} size={40} />
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Zap className="w-4 h-4" />
              <span>Usually responds within 2 hours</span>
            </div>
            {(listing.bookings_count || 0) > 0 && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{listing.bookings_count} successful booking{listing.bookings_count > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}