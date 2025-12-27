import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  UserMinus,
  Coins,
  TrendingUp,
  Users,
  Crown,
  ShoppingBag,
  CircleDot
} from "lucide-react";
import { createPageUrl } from '@/utils';

export default function ProfileDrawer({ userId, onClose }) {
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId
  });
  const profile = profiles?.[0];

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => base44.entities.Listing.filter({ owner_id: userId }),
    enabled: !!userId
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['userTestimonials', userId],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId, visibility: 'public' }),
    enabled: !!userId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isOwnProfile = currentUser?.email === userId;

  const handleMessage = () => {
    window.location.href = createPageUrl('Messages');
  };

  const handleBook = () => {
    window.location.href = createPageUrl('Marketplace');
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-violet-500 to-purple-600">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 -mt-16">
          {/* Avatar */}
          <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl mx-auto mb-4">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              {profile.display_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Name & Handle */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{profile.display_name}</h2>
              {profile.leader_tier === 'verified144k' && (
                <Badge className="bg-amber-100 text-amber-700">
                  <Crown className="w-3 h-3 mr-1" />
                  144K
                </Badge>
              )}
            </div>
            <p className="text-slate-500">@{profile.handle}</p>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button onClick={handleMessage} className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
              <Button onClick={handleBook} variant="outline" className="rounded-xl gap-2">
                <Calendar className="w-4 h-4" />
                Book
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900">{profile.ggg_balance || 0}</p>
              <p className="text-xs text-slate-500">GGG</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <TrendingUp className="w-5 h-5 text-violet-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900 capitalize">{profile.rank_code || 'Seeker'}</p>
              <p className="text-xs text-slate-500">Rank</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900">{profile.follower_count || 0}</p>
              <p className="text-xs text-slate-500">Followers</p>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">About</h3>
              <p className="text-sm text-slate-600">{profile.bio}</p>
            </div>
          )}

          {/* Intentions */}
          {profile.intentions?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Intentions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.intentions.map((i, idx) => (
                  <Badge key={idx} className="bg-violet-100 text-violet-700 capitalize">{i}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Offers */}
          {listings.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Offerings ({listings.length})
              </h3>
              <div className="space-y-2">
                {listings.slice(0, 3).map(listing => (
                  <div key={listing.id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <p className="font-medium text-sm text-slate-900">{listing.title}</p>
                    <p className="text-xs text-slate-500">{listing.is_free ? 'Free' : `$${listing.price_amount}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Testimonials</h3>
              <div className="space-y-3">
                {testimonials.slice(0, 2).map(t => (
                  <div key={t.id} className="p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={t.from_avatar} />
                        <AvatarFallback className="text-xs">{t.from_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{t.from_name}</p>
                      <div className="ml-auto flex">
                        {[...Array(t.rating)].map((_, i) => (
                          <span key={i} className="text-amber-400">★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}