import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { RANK_BADGE_IMAGES } from '@/components/reputation/rankBadges';
import { formatDistanceToNow } from 'date-fns';
import CommunityStatsCard from '@/components/profile/CommunityStatsCard';

export default function ProfileDrawer({ userId, onClose, offsetIndex = 0 }) {
  const queryClient = useQueryClient();

  // Always call hooks unconditionally with stable keys
  const { data: profiles } = useQuery({
    queryKey: ['profile', userId || 'none'],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId
  });
  const profile = profiles?.[0];

  // Wallet for this user (authoritative GGG)
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', userId || 'none'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: userId }
      });
      return data;
    },
    enabled: !!userId,
    refetchInterval: 5000
  });
  const walletAvailable = walletRes?.wallet?.available_balance ?? profile?.ggg_balance ?? 0;

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings', userId || 'none'],
    queryFn: () => base44.entities.Listing.filter({ owner_id: userId }),
    enabled: !!userId
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['userTestimonials', userId || 'none'],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId, visibility: 'public' }),
    enabled: !!userId
  });

  const { data: creatorTiers = [] } = useQuery({
    queryKey: ['creatorTiers', userId || 'none'],
    queryFn: () => base44.entities.CreatorTier.filter({ creator_id: userId, status: 'active' }),
    enabled: !!userId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', currentUser?.email || 'none', userId || 'none'],
    queryFn: () => base44.entities.Subscription.filter({
      subscriber_id: currentUser?.email,
      creator_id: userId,
      status: 'active'
    }),
    enabled: !!currentUser?.email && !!userId
  });

  const isOwnProfile = currentUser?.email === userId;
  const statusColors = { online: 'text-emerald-500', focus: 'text-amber-500', dnd: 'text-rose-500', offline: 'text-slate-400' };

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
    // Open floating chat with this user
    const event = new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: userId,
        recipientName: profile?.display_name || 'User',
        recipientAvatar: profile?.avatar_url || ''
      },
      bubbles: true
    });
    console.log('Dispatching openFloatingChat event:', event.detail);
    document.dispatchEvent(event);
  };

  const handleBook = () => {
    // Navigate to marketplace with this user's listings
    window.location.href = createPageUrl('Marketplace') + `?seller=${userId}`;
  };

  if (!profile) return null;

  return (
    <div
      id="profile-drawer"
      ref={containerRef}
      className="fixed bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] rounded-2xl shadow-2xl dark:shadow-[0_0_30px_rgba(0,255,136,0.15)] z-[100] pointer-events-auto flex flex-col overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 text-slate-600 dark:text-[#00ff88] hover:bg-slate-100 dark:hover:bg-[rgba(0,255,136,0.1)]"
        onClick={onClose}>

        <X className="w-5 h-5" />
      </Button>

      <div
        onMouseDown={startDrag}
        className="h-9 w-full border-b border-slate-200 dark:border-[rgba(0,255,136,0.2)] bg-slate-50/80 dark:bg-[#050505] backdrop-blur-sm cursor-grab active:cursor-grabbing select-none flex items-center px-3 pr-12 text-xs font-medium text-slate-500 dark:text-[#00ff88]">

        Drag to move
      </div>

      <ScrollArea className="flex-1">
        {/* Hero Background */}
        <div className="relative h-32 bg-gradient-to-r from-violet-500 to-purple-600">
          {/* Rank Badge - Top Left */}
          <div className="absolute top-2 left-3 z-10">
            <img
              src={RANK_BADGE_IMAGES[profile.rp_rank_code] || RANK_BADGE_IMAGES.seeker}
              alt={profile.rp_rank_code || 'seeker'}
              className="w-20 h-20 object-contain drop-shadow-lg"
              data-no-filter="true" />

          </div>
          {/* SA Shield Badge - Top Right */}
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/42cf00ae0_5650186ed_SA_shield.png"
            alt="Saint Agent"
            className="absolute top-2 right-3 w-20 h-20 object-contain z-10 drop-shadow-lg"
            data-no-filter="true" />

          {profile.hero_image_url ? (
            <img
              src={profile.hero_image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-[#0a0a0a]/90 to-transparent" />
        </div>

        <div className="px-6 pb-6 pt-4 relative flex gap-4">
          {/* Left Column - Avatar, Status, Badge, Photo Icon */}
          <div className="flex flex-col items-center gap-2 pt-2">
            {/* Avatar */}
            <div
              className="cursor-pointer"
              onClick={() => window.location.href = createPageUrl('Profile') + `?id=${profile.user_id}`}>

              <RankedAvatar
                src={profile.avatar_url}
                name={profile.display_name}
                size={72}
                userId={profile.user_id}
                status={profile.status}
                leaderTier={profile.leader_tier}
                rpRankCode={profile.rp_rank_code}
                rpPoints={profile.rp_points}
                showPhotoIcon={false}
                galleryImages={profile.gallery_images || []} />

            </div>
            
            {/* Online Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-[rgba(0,255,136,0.1)]">
              <CircleDot className={`w-3 h-3 ${statusColors[profile.status] || 'text-slate-400'}`} />
              <span className="text-[10px] font-medium text-slate-600 dark:text-[#00ff88] capitalize">{profile.status || 'offline'}</span>
            </div>
            
            {/* Leader Badge */}
            {profile.leader_tier === 'verified144k' &&
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-2 py-0.5">
                <Crown className="w-3 h-3 mr-1" />
                144K
              </Badge>
            }
            
            {/* Photo Gallery Icon */}
            {(profile.gallery_images?.length > 0 || profile.avatar_url) &&
            <button
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[rgba(0,255,136,0.1)] hover:bg-slate-200 dark:hover:bg-[rgba(0,255,136,0.2)] transition-colors"
              onClick={() => {
                const event = new CustomEvent('openPhotoViewer', {
                  detail: { images: [profile.avatar_url, ...(profile.gallery_images || [])].filter(Boolean) }
                });
                document.dispatchEvent(event);
              }}
              title="View photos">

                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500 dark:text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </button>
            }
          </div>

          {/* Right Column - Name, Handle, Info */}
          <div className="flex-1 min-w-0">
            {/* Name & Handle */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.display_name}</h2>
              <p className="text-slate-500 dark:text-[#00d4ff]">@{profile.handle} {profile?.sa_number ? `• SA#${profile.sa_number}` : ''}</p>
              {profile.last_seen_at &&
              <p className="text-xs text-slate-500 dark:text-[#00ff88]/70 mt-1">
                  Last online {formatDistanceToNow(new Date(profile.last_seen_at), { addSuffix: true })}
                </p>
              }
            </div>

            {/* Actions */}
            {!isOwnProfile &&
            <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleMessage} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                  <Button onClick={handleBook} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
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
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[rgba(0,255,136,0.05)] dark:border dark:border-[rgba(0,255,136,0.2)]">
              <Coins className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900 dark:text-white">{walletAvailable || 0}</p>
              <p className="text-xs text-slate-500 dark:text-[#00ff88]">GGG</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[rgba(0,255,136,0.05)] dark:border dark:border-[rgba(0,255,136,0.2)]">
              <TrendingUp className="w-5 h-5 text-violet-500 dark:text-[#a855f7] mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900 dark:text-white capitalize">{profile.rp_rank_code || profile.rank_code || 'Seeker'}</p>
              <p className="text-xs text-slate-500 dark:text-[#00ff88]">Rank</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-[rgba(0,255,136,0.05)] dark:border dark:border-[rgba(0,255,136,0.2)]">
              <Users className="w-5 h-5 text-blue-500 dark:text-[#00d4ff] mx-auto mb-1" />
              <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.follower_count || 0}</p>
              <p className="text-xs text-slate-500 dark:text-[#00ff88]">Followers</p>
            </div>
          </div>

          {/* Bio */}
          {profile.bio &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{profile.bio}</p>
            </div>
          }

          {/* Location */}
          {profile.location &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{profile.location}</p>
            </div>
          }

          {/* Relationship Status */}
          {profile.relationship_status && profile.relationship_status !== 'prefer_not_to_say' &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Connection Preferences
              </h3>
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 capitalize mb-2">
                {profile.relationship_status.replace('_', ' ')}
              </Badge>
              {profile.relationship_type_seeking?.length > 0 &&
            <div className="mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Open to:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.relationship_type_seeking.map((type, idx) =>
                <Badge key={idx} variant="outline" className="bg-purple-100 dark:bg-[rgba(168,85,247,0.2)] text-foreground dark:text-[#a855f7] px-2.5 py-0.5 text-xs font-semibold capitalize rounded-md inline-flex items-center border dark:border-[#a855f7]/50">
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
              <Badge key={idx} variant="outline" className="bg-purple-100 text-foreground px-2.5 py-0.5 text-xs font-semibold capitalize rounded-md inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {practice.replace('_', ' ')}
                  </Badge>
              )}
              </div>
            </div>
          }

          {/* Mystical Identifiers */}
          {(profile.mystical_identifier || profile.astrological_sign || profile.birth_card) &&
          <div className="mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Mystical Profile</h3>
              <div className="space-y-2 text-sm">
                {profile.mystical_identifier &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Mystical ID:</span>
                    <span className="font-medium dark:text-white">{profile.mystical_identifier}</span>
                  </div>
              }
                {profile.astrological_sign &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sun:</span>
                    <span className="font-medium dark:text-white">{profile.astrological_sign}</span>
                  </div>
              }
                {profile.rising_sign &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Rising:</span>
                    <span className="font-medium dark:text-white">{profile.rising_sign}</span>
                  </div>
              }
                {profile.moon_sign &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Moon:</span>
                    <span className="font-medium dark:text-white">{profile.moon_sign}</span>
                  </div>
              }
                {profile.numerology_life_path &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Life Path:</span>
                    <span className="font-medium dark:text-white">{profile.numerology_life_path}</span>
                  </div>
              }
                {profile.numerology_personality &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Personality:</span>
                    <span className="font-medium dark:text-white">{profile.numerology_personality}</span>
                  </div>
              }
                {profile.birth_card &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Birth Card:</span>
                    <span className="font-medium dark:text-white">{profile.birth_card}</span>
                  </div>
              }
                {profile.sun_card &&
              <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sun Card:</span>
                    <span className="font-medium dark:text-white">{profile.sun_card}</span>
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

          {/* Community Stats & Achievements */}
          <div className="mb-6">
            <CommunityStatsCard userId={userId} compact={false} />
          </div>

          {/* Testimonials */}
          {testimonials.length > 0 &&
          <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Testimonials</h3>
              <div className="space-y-3">
                {testimonials.slice(0, 2).map((t) =>
              <div key={t.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={t.from_avatar} />
                        <AvatarFallback className="text-xs">{t.from_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium dark:text-white">{t.from_name}</p>
                      <div className="ml-auto flex">
                        {[...Array(t.rating)].map((_, i) =>
                    <span key={i} className="text-amber-400">★</span>
                    )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{t.text}</p>
                  </div>
              )}
              </div>
            </div>
          }
        </div>
      </ScrollArea>
      {/* Resize handles */}
      <div onMouseDown={startResize('right')} className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize z-10" />
      <div onMouseDown={startResize('bottom')} className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-10" />
      <div onMouseDown={startResize('bottom-right')} className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize z-20" />
    </div>);

}