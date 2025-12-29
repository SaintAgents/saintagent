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
  CircleDot,
  Heart,
  Target,
  Sparkles,
  MapPin,
  Award } from
"lucide-react";
import { createPageUrl } from '@/utils';
import FollowButton from '@/components/FollowButton';
import TestimonialButton from '@/components/TestimonialButton';
import SubscriptionCard from '@/components/creator/SubscriptionCard';

export default function ProfileDrawer({ userId, onClose, offsetIndex = 0 }) {
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId
  });
  const profile = profiles?.[0];

  // Wallet for this user (authoritative GGG)
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: userId },
      });
      return data;
    },
    enabled: !!userId,
    refetchInterval: 5000,
  });
  const walletAvailable = walletRes?.wallet?.available_balance ?? profile?.ggg_balance ?? 0;

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

  const { data: creatorTiers = [] } = useQuery({
    queryKey: ['creatorTiers', userId],
    queryFn: () => base44.entities.CreatorTier.filter({ creator_id: userId, status: 'active' }),
    enabled: !!userId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', currentUser?.email, userId],
    queryFn: () => base44.entities.Subscription.filter({
      subscriber_id: currentUser?.email,
      creator_id: userId,
      status: 'active'
    }),
    enabled: !!currentUser?.email && !!userId
  });

  const isOwnProfile = currentUser?.email === userId;

  // Drag state for floating window
  const containerRef = React.useRef(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const draggingRef = React.useRef(false);
  const [size, setSize] = React.useState({ w: 384, h: 480 });
  const resizingRef = React.useRef({ active: false, edge: null });
  const startResize = (edge) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = { active: true, edge };
  };

  React.useEffect(() => {
    // Initial position near bottom-right, stagger by offsetIndex
    const width = 384; // w-96
    const defaultHeight = Math.min(window.innerHeight * 0.8, 640);
    const offset = (offsetIndex || 0) * 28; // stagger
    const x = Math.max(8, window.innerWidth - width - 16 - offset);
    const y = Math.max(8, window.innerHeight - defaultHeight - 16 - offset);
    setPos({ x, y });
    setSize({ w: width, h: defaultHeight });
  }, [offsetIndex]);

  React.useEffect(() => {
    const onMouseMove = (e) => {
      if (resizingRef.current.active) {
        const minW = 320,minH = 240;
        const maxW = Math.max(minW, window.innerWidth - pos.x - 8);
        const maxH = Math.max(minH, window.innerHeight - pos.y - 8);
        const edge = resizingRef.current.edge;
        if (edge === 'right') {
          const nextW = Math.min(Math.max(minW, e.clientX - pos.x), maxW);
          setSize((s) => ({ ...s, w: nextW }));
        } else if (edge === 'bottom') {
          const nextH = Math.min(Math.max(minH, e.clientY - pos.y), maxH);
          setSize((s) => ({ ...s, h: nextH }));
        } else if (edge === 'bottom-right') {
          const nextW = Math.min(Math.max(minW, e.clientX - pos.x), maxW);
          const nextH = Math.min(Math.max(minH, e.clientY - pos.y), maxH);
          setSize({ w: nextW, h: nextH });
        }
        return;
      }
      if (!draggingRef.current) return;
      const width = containerRef.current?.offsetWidth || 384;
      const height = containerRef.current?.offsetHeight || Math.min(window.innerHeight * 0.8, 640);
      let newX = e.clientX - dragOffsetRef.current.x;
      let newY = e.clientY - dragOffsetRef.current.y;
      // clamp within viewport
      newX = Math.min(Math.max(8, newX), window.innerWidth - width - 8);
      newY = Math.min(Math.max(8, newY), window.innerHeight - height - 8);
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => {
      draggingRef.current = false;
      resizingRef.current = { active: false, edge: null };
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const startDrag = (e) => {
    draggingRef.current = true;
    dragOffsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMessage = () => {
    window.location.href = createPageUrl('Messages');
  };

  const handleBook = () => {
    window.location.href = createPageUrl('Marketplace');
  };

  if (!profile) return null;

  return (
    <div
      id="profile-drawer"
      ref={containerRef}
      className="fixed bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] pointer-events-auto flex flex-col overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 text-slate-600 hover:bg-slate-100"
        onClick={onClose}>

        <X className="w-5 h-5" />
      </Button>

      <div
        onMouseDown={startDrag}
        className="h-9 w-full border-b bg-slate-50/80 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none flex items-center px-3 pr-12 text-xs font-medium text-slate-500">

        Drag to move
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
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
              {profile.leader_tier === 'verified144k' &&
              <Badge className="bg-amber-100 text-amber-700">
                  <Crown className="w-3 h-3 mr-1" />
                  144K
                </Badge>
              }
            </div>
            <p className="text-slate-500">@{profile.handle} {profile?.sa_number ? `• SA#${profile.sa_number}` : ''}</p>
          </div>

          {/* Actions */}
          {!isOwnProfile &&
          <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleMessage} className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
                <Button onClick={handleBook} variant="outline" className="bg-purple-100 text-neutral-950 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 gap-2">
                  <Calendar className="w-4 h-4" />
                  Book
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FollowButton targetUserId={userId} className="w-full rounded-xl" />
                <TestimonialButton
                toUserId={userId}
                toUserName={profile.display_name}
                toUserAvatar={profile.avatar_url}
                context="profile"
                contextId={profile.id}
                className="w-full rounded-xl" />

              </div>
            </div>
          }

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900">{walletAvailable || 0}</p>
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
          {profile.bio &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">About</h3>
              <p className="text-sm text-slate-600">{profile.bio}</p>
            </div>
          }

          {/* Location */}
          {profile.location &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <p className="text-sm text-slate-600">{profile.location}</p>
            </div>
          }

          {/* Relationship Status */}
          {profile.relationship_status && profile.relationship_status !== 'prefer_not_to_say' &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Connection Preferences
              </h3>
              <Badge className="bg-rose-100 text-rose-700 capitalize mb-2">
                {profile.relationship_status.replace('_', ' ')}
              </Badge>
              {profile.relationship_type_seeking?.length > 0 &&
            <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Open to:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.relationship_type_seeking.map((type, idx) =>
                <Badge key={idx} variant="outline" className="text-xs capitalize">
                        {type.replace('_', ' ')}
                      </Badge>
                )}
                  </div>
                </div>
            }
            </div>
          }

            {/* Dating Preferences */}
            {profile.dating_preferences &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Dating Preferences</h3>
              <div className="space-y-1 text-sm text-slate-700">
                {Array.isArray(profile.dating_preferences.interested_in) && profile.dating_preferences.interested_in.length > 0 &&
              <div>
                    <span className="text-slate-500">Interested in:</span>{' '}
                    <span className="font-medium capitalize">{profile.dating_preferences.interested_in.join(', ').replace(/_/g, ' ')}</span>
                  </div>
              }
                {(profile.dating_preferences.age_range_min || profile.dating_preferences.age_range_max) &&
              <div>
                    <span className="text-slate-500">Age range:</span>{' '}
                    <span className="font-medium">{profile.dating_preferences.age_range_min || '?'} - {profile.dating_preferences.age_range_max || '?'}</span>
                  </div>
              }
                {profile.dating_preferences.distance_max_miles &&
              <div>
                    <span className="text-slate-500">Max distance:</span>{' '}
                    <span className="font-medium">{profile.dating_preferences.distance_max_miles} miles</span>
                  </div>
              }
              </div>
            </div>
          }

            {/* Qualities Seeking */}
          {profile.qualities_seeking?.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Seeking in Others
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.qualities_seeking.map((q, idx) =>
              <Badge key={idx} variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
                    {q}
                  </Badge>
              )}
              </div>
            </div>
          }

          {/* Qualities Providing */}
          {profile.qualities_providing?.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                What I Provide
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.qualities_providing.map((q, idx) =>
              <Badge key={idx} variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                    {q}
                  </Badge>
              )}
              </div>
            </div>
          }

          {/* Skills */}
          {profile.skills?.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, idx) =>
              <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
              )}
              </div>
            </div>
          }

          {/* Intentions */}
          {profile.intentions?.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Intentions</h3>
              <div className="flex flex-wrap gap-2">
                {profile.intentions.map((i, idx) =>
              <Badge key={idx} className="bg-violet-100 text-violet-700 capitalize">{i}</Badge>
              )}
              </div>
            </div>
          }

          {/* Spiritual Practices */}
          {profile.spiritual_practices?.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Spiritual Practices</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.spiritual_practices.map((practice, idx) =>
              <Badge key={idx} variant="outline" className="text-xs capitalize">
                    {practice.replace('_', ' ')}
                  </Badge>
              )}
              </div>
            </div>
          }

          {/* Mystical Identifiers */}
          {(profile.mystical_identifier || profile.astrological_sign || profile.birth_card) &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Mystical Profile</h3>
              <div className="space-y-2 text-sm">
                {profile.mystical_identifier &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Mystical ID:</span>
                    <span className="font-medium">{profile.mystical_identifier}</span>
                  </div>
              }
                {profile.astrological_sign &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Sun:</span>
                    <span className="font-medium">{profile.astrological_sign}</span>
                  </div>
              }
                {profile.rising_sign &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Rising:</span>
                    <span className="font-medium">{profile.rising_sign}</span>
                  </div>
              }
                {profile.moon_sign &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Moon:</span>
                    <span className="font-medium">{profile.moon_sign}</span>
                  </div>
              }
                {profile.numerology_life_path &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Life Path:</span>
                    <span className="font-medium">{profile.numerology_life_path}</span>
                  </div>
              }
                {profile.numerology_personality &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Personality:</span>
                    <span className="font-medium">{profile.numerology_personality}</span>
                  </div>
              }
                {profile.birth_card &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Birth Card:</span>
                    <span className="font-medium">{profile.birth_card}</span>
                  </div>
              }
                {profile.sun_card &&
              <div className="flex justify-between">
                    <span className="text-slate-500">Sun Card:</span>
                    <span className="font-medium">{profile.sun_card}</span>
                  </div>
              }
              </div>
            </div>
          }

          {/* Membership Tiers */}
          {!isOwnProfile && creatorTiers.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-violet-500" />
                Membership Tiers
              </h3>
              <div className="space-y-3">
                {creatorTiers.map((tier) => {
                const currentSubscription = subscriptions.find((s) => s.tier_id === tier.id);
                return (
                  <SubscriptionCard
                    key={tier.id}
                    tier={tier}
                    currentSubscription={currentSubscription}
                    profile={profile} />);


              })}
              </div>
            </div>
          }

          {/* Offers */}
          {listings.length > 0 &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Offerings ({listings.length})
              </h3>
              <div className="space-y-2">
                {listings.slice(0, 3).map((listing) =>
              <div key={listing.id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                    <p className="font-medium text-sm text-slate-900">{listing.title}</p>
                    <p className="text-xs text-slate-500">{listing.is_free ? 'Free' : `$${listing.price_amount}`}</p>
                  </div>
              )}
              </div>
            </div>
          }

          {/* Testimonials */}
          {testimonials.length > 0 &&
          <div>
              <h3 className="font-semibold text-slate-900 mb-2">Testimonials</h3>
              <div className="space-y-3">
                {testimonials.slice(0, 2).map((t) =>
              <div key={t.id} className="p-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={t.from_avatar} />
                        <AvatarFallback className="text-xs">{t.from_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium">{t.from_name}</p>
                      <div className="ml-auto flex">
                        {[...Array(t.rating)].map((_, i) =>
                    <span key={i} className="text-amber-400">★</span>
                    )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{t.text}</p>
                  </div>
              )}
              </div>
            </div>
          }
        </div>
      {/* Resize handles */}
      <div onMouseDown={startResize('right')} className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize z-10" />
      <div onMouseDown={startResize('bottom')} className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-10" />
      <div onMouseDown={startResize('bottom-right')} className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize z-20" />
      </ScrollArea>
      </div>);

}