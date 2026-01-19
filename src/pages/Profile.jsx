import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkillsPicker from '@/components/SkillsPicker';
import SpiritualProfileEditor from '@/components/profile/SpiritualProfileEditor';
import MysticalProfileEditor from '@/components/profile/MysticalProfileEditor';
import AvatarUploader from '@/components/profile/AvatarUploader';
import OnboardingDataEditor from '@/components/profile/OnboardingDataEditor';
import ConnectionPreferencesEditor from '@/components/profile/ConnectionPreferencesEditor';
import AscensionLadderPopover from '@/components/profile/AscensionLadderPopover';
import PortfolioSection from '@/components/profile/PortfolioSection';
import EndorsementsSection from '@/components/profile/EndorsementsSection';
import SocialLinksEditor from '@/components/profile/SocialLinksEditor';
import SocialLinksDisplay from '@/components/profile/SocialLinksDisplay';
import DetailedBioEditor from '@/components/profile/DetailedBioEditor';
import FeaturedShowcase from '@/components/profile/FeaturedShowcase';
import TrustNetworkGraph from '@/components/reputation/TrustNetworkGraph';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from
"@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Edit,
  Save,
  X,
  Coins,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Globe,
  Plus,
  Star,
  Crown,
  Target,
  Heart,
  Compass,
  BadgeCheck,
  MessageSquare,
  Shield
} from
"lucide-react";

import ProgressRing from '@/components/hud/ProgressRing';
import RPRing from '@/components/reputation/RPRing';
import { getRPRank } from '@/components/reputation/rpUtils';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import { RANK_BADGE_IMAGES, RankBadge } from '@/components/reputation/rankBadges';
import { AffiliateBadge, getAffiliateTier } from '@/components/reputation/affiliateBadges';
import PhotoViewer from '@/components/profile/PhotoViewer';
import TrustScoreCard from '@/components/trust/TrustScoreCard';
import ReputationScoresCard from '@/components/reputation/ReputationScoresCard';
import UserRolesPanel from '@/components/roles/UserRolesPanel';
import MetricTile from '@/components/hud/MetricTile';
import BadgesBar from '@/components/badges/BadgesBar';
import BadgesGlossaryModal from '@/components/badges/BadgesGlossaryModal';
import Step7Dating from '@/components/onboarding/Step7Dating';
import ProfileMetrics from '@/components/profile/ProfileMetrics';
import QuickBoostButton from '@/components/boost/QuickBoostButton';
import BoostStatusBadge from '@/components/boost/BoostStatusBadge';
import CreatorMonetizationTab from '@/components/creator/CreatorMonetizationTab';
import TipButton from '@/components/creator/TipButton';
import OptOutSettings from '@/components/profile/OptOutSettings';
import PerformanceScoreCard from '@/components/merit/PerformanceScoreCard';
import { createPageUrl } from '@/utils';
import { trackUpdateProfile } from '@/components/gamification/challengeTracker';
import FriendRequestButton from '@/components/friends/FriendRequestButton';
import FriendRequestsPanel from '@/components/friends/FriendRequestsPanel';
import FriendsList from '@/components/friends/FriendsList';
import DestinyCardTooltip from '@/components/destiny/DestinyCardTooltip';
import { getDestinyCardMeaning } from '@/components/destiny/destinyCardsData';

export default function Profile() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [skillsPickerOpen, setSkillsPickerOpen] = useState(false);
  const [editingSpiritualProfile, setEditingSpiritualProfile] = useState(false);
  const [editingMysticalProfile, setEditingMysticalProfile] = useState(false);
  const [editingIntentions, setEditingIntentions] = useState(false);
  const [editingSocialLinks, setEditingSocialLinks] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [intentionsData, setIntentionsData] = useState([]);
  const [newIntention, setNewIntention] = useState('');
  const [badgeGlossaryOpen, setBadgeGlossaryOpen] = useState(false);
  const queryClient = useQueryClient();

  // Check for ?id= URL parameter to view another user's profile
  const urlParams = new URLSearchParams(window.location.search);
  const viewingUserId = urlParams.get('id');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    }
  });

  // Current user's profile (for friend requests)
  const { data: currentUserProfiles } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    },
    enabled: !!currentUser
  });
  const currentUserProfile = currentUserProfiles?.[0];

  // If viewing another user's profile via ?id=, fetch that user's profile
  // Otherwise fetch the current user's own profile
  const targetUserId = viewingUserId || currentUser?.email;
  const isOwnProfile = !viewingUserId || viewingUserId === currentUser?.email;

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', targetUserId],
    queryFn: async () => {
      if (viewingUserId) {
        // Try SA# first, then email
        const bySA = await base44.entities.UserProfile.filter({ sa_number: viewingUserId }, '-updated_date', 1);
        if (bySA.length > 0) return bySA;
        return base44.entities.UserProfile.filter({ user_id: viewingUserId }, '-updated_date', 1);
      }
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1);
    },
    enabled: !!targetUserId
  });

  // Also fetch dating profile for the target user (for demo profiles that may not have UserProfile)
  const { data: datingProfiles } = useQuery({
    queryKey: ['datingProfile', targetUserId],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: targetUserId }, '-updated_date', 1),
    enabled: !!targetUserId && !!viewingUserId
  });
  const datingProfile = datingProfiles?.[0];

  // Build profile from UserProfile, or fall back to DatingProfile for demo profiles
  const rawProfile = profiles?.[0];
  const profile = rawProfile || (datingProfile ? {
    user_id: datingProfile.user_id,
    display_name: datingProfile.display_name,
    avatar_url: datingProfile.avatar_url,
    bio: datingProfile.bio,
    location: datingProfile.location,
    region: datingProfile.location,
    is_demo_dating_profile: true
  } : null);
  
  // Use SA# for all database queries if available, fallback to user_id
  const userIdentifier = profile?.sa_number || profile?.user_id;

  const [datingData, setDatingData] = useState(null);
  const showDatingTab = !!(profile && (
    profile.relationship_status === 'single' ||
    profile.relationship_status === 'open' ||
    (profile.relationship_type_seeking || []).includes('polyamorous') ||
    (profile.relationship_type_seeking || []).includes('open')));


  useEffect(() => {
    if (profile) {
      setDatingData({
        relationship_status: profile.relationship_status,
        relationship_type_seeking: profile.relationship_type_seeking || [],
        dating_preferences: profile.dating_preferences || {},
        qualities_seeking: profile.qualities_seeking || [],
        qualities_providing: profile.qualities_providing || []
      });
    }
  }, [profile?.id]);

  const ROLE_LABELS = {
    member: 'Member',
    contributor: 'Contributor',
    moderator: 'Moderator',
    guardian: 'Guardian',
    reviewer: 'Reviewer',
    council_member: 'Council Member',
    administrator: 'Administrator',
    architect: 'Architect',
    founder_custodian: 'Founder'
  };

  // Fetch user skills
  const { data: skills = [] } = useQuery({
    queryKey: ['skills', userIdentifier],
    queryFn: () => base44.entities.Skill.filter({ user_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Fetch desires
  const { data: desires = [] } = useQuery({
    queryKey: ['desires', userIdentifier],
    queryFn: () => base44.entities.UserDesire.filter({ user_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Fetch hopes
  const { data: hopes = [] } = useQuery({
    queryKey: ['hopes', userIdentifier],
    queryFn: () => base44.entities.UserHope.filter({ user_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Fetch intentions
  const { data: intentions = [] } = useQuery({
    queryKey: ['intentions', userIdentifier],
    queryFn: () => base44.entities.UserIntention.filter({ user_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Fetch badges by SA# (preferred identifier)
  const { data: profileBadges = [] } = useQuery({
    queryKey: ['userBadges', userIdentifier],
    queryFn: () => base44.entities.Badge.filter({ user_id: userIdentifier, status: 'active' }, '-created_date', 500),
    enabled: !!userIdentifier
  });

  // Active roles (for Founder badge)
  const { data: activeRoles = [] } = useQuery({
    queryKey: ['userRoles', userIdentifier],
    queryFn: () => base44.entities.UserRole.filter({ user_id: userIdentifier, status: 'active' }),
    enabled: !!userIdentifier
  });

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['userTestimonials', userIdentifier],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Fetch followers
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', userIdentifier],
    queryFn: () => base44.entities.Follow.filter({ following_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Fetch following
  const { data: following = [] } = useQuery({
    queryKey: ['following', userIdentifier],
    queryFn: () => base44.entities.Follow.filter({ follower_id: userIdentifier }),
    enabled: !!userIdentifier
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (followId) => base44.entities.Follow.delete(followId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (!profile?.id) {
        return Promise.reject(new Error('Profile not loaded'));
      }
      return base44.entities.UserProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
      // Track challenge progress for updating profile
      if (userIdentifier) {
        trackUpdateProfile(userIdentifier);
      }
    }
  });

  const handleEdit = () => {
    setEditData({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      region: profile?.region || '',
      timezone: profile?.timezone || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    await updateMutation.mutateAsync({ avatar_url: avatarUrl });
  };

  const handleSpiritualProfileSave = async (spiritualData) => {
    try {
      await updateMutation.mutateAsync(spiritualData);
      setEditingSpiritualProfile(false);
    } catch (err) {
      console.error('Failed to save spiritual profile:', err);
    }
  };

  const handleMysticalProfileSave = async (data) => {
    await updateMutation.mutateAsync(data);
    setEditingMysticalProfile(false);
  };

  const handleIntentionsEdit = () => {
    setIntentionsData(profile?.intentions || []);
    setEditingIntentions(true);
  };

  const handleIntentionsSave = async () => {
    await updateMutation.mutateAsync({ intentions: intentionsData });
    setEditingIntentions(false);
  };

  const addIntention = () => {
    if (newIntention.trim() && !intentionsData.includes(newIntention.trim())) {
      setIntentionsData([...intentionsData, newIntention.trim()]);
      setNewIntention('');
    }
  };

  const removeIntention = (intention) => {
    setIntentionsData(intentionsData.filter((i) => i !== intention));
  };

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTestimonials'] });
    }
  });

  const rpPoints = profile?.rp_points || 0;
  const rpInfo = getRPRank(rpPoints);

  // Fetch affiliate code for the target user
  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCodes', userIdentifier],
    queryFn: () => base44.entities.AffiliateCode.filter({ user_id: userIdentifier }),
    enabled: !!userIdentifier
  });
  const affiliateCode = affiliateCodes?.[0];
  const affiliatePaidCount = affiliateCode?.total_paid || 0;
  const affiliateTier = getAffiliateTier(affiliatePaidCount);

  // Wallet query - only run if profile exists and is not a demo profile
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', userIdentifier],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('walletEngine', {
          action: 'getWallet',
          payload: { user_id: userIdentifier }
        });
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!userIdentifier && !profile?.is_demo_dating_profile && !userIdentifier?.includes('demo'),
    retry: false
  });

  // Profile not found - show inside main return to avoid hooks order issues
  const profileNotFound = viewingUserId && profiles !== undefined && datingProfiles !== undefined && !profile;

  if (profileNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
            <p className="text-slate-500 mb-6">This user profile doesn't exist or may have been removed.</p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="rounded-xl">

              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-64 bg-gradient-to-r from-violet-500 to-purple-600 group">
            {profile?.hero_image_url ? (
              <img
                src={profile.hero_image_url}
                alt="Profile Hero"
                className="w-full h-full object-cover hero-image"
                data-no-filter="true"
                style={{ filter: 'none' }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-violet-500 to-purple-600" />
            )}
            
            {/* Rank Badge - Top Left */}
            <div className="absolute top-3 left-3 z-10">
              <RankBadge code={profile?.rp_rank_code || 'seeker'} size={48} className="drop-shadow-lg" />
            </div>
            
            {/* SA# Badge - Top Right */}
            {profile?.sa_number && (
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 font-bold text-sm">
                  <Shield className="w-4 h-4" />
                  SA#{profile.sa_number}
                </div>
              </div>
            )}
            
            {/* Badges & Sigils Bar at Bottom of Hero */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
              <BadgesBar badges={profileBadges} defaultIfEmpty={false} maxDisplay={8} size="sm" />
            </div>
            
            {isOwnProfile &&
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    await updateMutation.mutateAsync({ hero_image_url: file_url });
                  }
                }} />
                <div className="text-white text-center">
                  <Edit className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Change Hero Image</p>
                </div>
              </label>
            }
          </div>
          <CardContent className="bg-purple-100 text-zinc-500 pt-4 p-6 relative">
            <div className="flex items-start gap-6">
              <div className="cursor-pointer" onClick={() => setViewerOpen(true)} title="View photos">
                <RankedAvatar
                  src={profile?.avatar_url}
                  name={profile?.display_name}
                  size={96}
                  leaderTier={profile?.leader_tier}
                  rpRankCode={profile?.rp_rank_code}
                  rpPoints={profile?.rp_points}
                  userId={profile?.user_id}
                  status={profile?.status}
                  saNumber={profile?.sa_number}
                  showPhotoIcon={true}
                  galleryImages={profile?.gallery_images} />

              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-slate-900 dark:text-white text-2xl font-bold">{profile?.display_name || currentUser?.full_name || 'User'}</h1>
                  {profile?.tagline &&
                  <span className="text-slate-600 text-sm italic hidden sm:inline">— {profile.tagline}</span>
                  }
                  {profile?.leader_tier === 'verified144k' &&
                  <Badge className="bg-amber-100 text-amber-700">
                      <Crown className="w-3 h-3 mr-1" />
                      144K Leader
                    </Badge>
                  }
                  {profile?.leader_tier === 'candidate' &&
                  <Badge variant="outline">Leader Candidate</Badge>
                  }

                  {/* Render all active roles as badges */}
                  {activeRoles?.map?.((r) =>
                  <Badge key={r.id} variant="secondary" className="capitalize">
                      {ROLE_LABELS[r.role_code] || r.role_code.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {typeof profile?.influence_score === 'number' &&
                  <Badge className="bg-violet-100 text-violet-700">
                      <TrendingUp className="w-3 h-3 mr-1" /> {Math.round(profile.influence_score)}
                    </Badge>
                  }
                  {typeof profile?.expertise_score === 'number' &&
                  <Badge className="bg-blue-100 text-blue-700">
                      <BadgeCheck className="w-3 h-3 mr-1" /> {Math.round(profile.expertise_score)}
                    </Badge>
                  }
                </div>
                <p className="text-blue-950">@{profile?.handle || currentUser?.email?.split('@')[0]} {profile?.sa_number ? `• SA#${profile.sa_number}` : ''}</p>
                {/* Joined Date */}
                {profile?.created_date &&
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="text-slate-400">
                      ({Math.floor((Date.now() - new Date(profile.created_date).getTime()) / (1000 * 60 * 60 * 24))} days ago)
                    </span>
                  </p>
                }
                {/* Social Links */}
                <SocialLinksDisplay socialLinks={profile?.social_links} className="mt-2" />
                </div>
              {isOwnProfile ?
              <div className="flex items-center gap-2">
                                          <BoostStatusBadge userId={profile?.user_id} />
                                          <QuickBoostButton size="sm" variant="outline" />
                                          <Button
                  variant="outline"
                  className="rounded-xl gap-2"
                  onClick={isEditing ? () => setIsEditing(false) : handleEdit}>

                                            {isEditing ?
                  <>
                                                <X className="w-4 h-4" />
                                                Cancel
                                              </> :

                  <>
                                                <Edit className="w-4 h-4" />
                                                Edit Profile
                                              </>
                  }
                                          </Button>
                                        </div> :

              <div className="flex items-center gap-2">
                                          <FriendRequestButton
                    targetUserId={profile?.user_id}
                    targetUserName={profile?.display_name}
                    targetUserAvatar={profile?.avatar_url}
                    currentUser={currentUser}
                    currentUserProfile={currentUserProfile}
                  />
                                          <TipButton
                    toUserId={profile?.user_id}
                    toUserName={profile?.display_name}
                    contextType="profile"
                    contextId={profile?.id} />

                                        </div>
              }
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className={cn(
            "flex flex-nowrap overflow-x-auto w-full max-w-4xl gap-1"
          )}>
            <TabsTrigger value="basic" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Basic Info</span>
              <User className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Showcase</span>
              <Star className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="onboarding" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Details</span>
                <Compass className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            )}
            <TabsTrigger value="spiritual" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Spiritual</span>
              <Star className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="metrics" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Metrics</span>
                <TrendingUp className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            )}
            <TabsTrigger value="stats" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Stats</span>
              <Target className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="trust-network" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Trust Network</span>
                <Users className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            )}
            <TabsTrigger value="roles" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Roles</span>
              <Crown className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="friends" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Friends</span>
                <Heart className="sm:hidden w-4 h-4" />
                {following.length > 0 &&
                <Badge className="ml-1 bg-violet-600 text-white h-4 px-1.5 text-[10px]">{following.length}</Badge>
                }
              </TabsTrigger>
            )}
            {isOwnProfile &&
            <TabsTrigger value="monetization" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Monetization</span>
                <Coins className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            }
            {isOwnProfile &&
            <TabsTrigger value="privacy" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Privacy</span>
                <User className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            }
            {isOwnProfile && showDatingTab &&
            <TabsTrigger value="dating" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Dating</span>
                <Heart className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            }
            </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Uploader - only show for own profile */}
              {isOwnProfile &&
              <div>
                  <AvatarUploader
                  currentAvatar={profile?.avatar_url}
                  displayName={profile?.display_name}
                  onAvatarUpdate={handleAvatarUpdate} />
                </div>
              }

              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
            {/* Status Message (own profile only) */}
            {isOwnProfile &&
                <Card>
                <CardHeader className="bg-purple-100 dark:bg-[#050505] p-4">
                  <CardTitle className="text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <div className={cn(
                        "w-3 h-3 rounded-full",
                        profile?.status === 'online' && "bg-emerald-500",
                        profile?.status === 'focus' && "bg-amber-500",
                        profile?.status === 'dnd' && "bg-rose-500",
                        profile?.status === 'offline' && "bg-slate-400",
                        !profile?.status && "bg-emerald-500"
                      )} />
                    Status Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-purple-100 dark:bg-[#050505] pt-0 p-4">
                  <div className="flex gap-2">
                    <Input
                        placeholder="What's on your mind?"
                        value={profile?.status_message || ''}
                        maxLength={100}
                        onChange={async (e) => {
                          await updateMutation.mutateAsync({ status_message: e.target.value });
                        }}
                        className="flex-1 text-slate-900 dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]" />

                  </div>
                  <p className="text-xs text-slate-400 mt-2">This message shows when others hover over your avatar</p>
                </CardContent>
              </Card>
                }

            {/* Theme Customization (own profile only) */}
            {isOwnProfile &&
                <Card>
                <CardHeader className="bg-purple-100 dark:bg-[#050505] p-4">
                  <CardTitle className="text-sm text-slate-900 dark:text-white">Theme Customization</CardTitle>
                </CardHeader>
                <CardContent className="bg-purple-100 dark:bg-[#050505] pt-0 p-4 space-y-4">
                  <div>
                    <Label className="text-xs text-slate-800 dark:text-slate-400 font-medium">Theme</Label>
                    <Select
                        value={profile?.theme_preference || 'light'}
                        onValueChange={async (v) => {
                          try {
                            localStorage.setItem('theme', v);
                            document.documentElement.setAttribute('data-theme', v);
                          } catch {}
                          await updateMutation.mutateAsync({ theme_preference: v });
                        }}>

                      <SelectTrigger className="mt-1 text-slate-900 dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark (Neon)</SelectItem>
                        <SelectItem value="hacker">Hacker (Matrix)</SelectItem>
                        <SelectItem value="custom">Custom Colors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {profile?.theme_preference === 'custom' &&
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-700 dark:text-slate-400">Primary</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            className="h-8 w-12 p-0.5 cursor-pointer"
                            value={profile?.custom_theme_colors?.primary || '#7c3aed'}
                            onChange={async (e) => {
                              const colors = { ...(profile?.custom_theme_colors || {}), primary: e.target.value };
                              try {
                                localStorage.setItem('custom_primary', e.target.value);
                                document.documentElement.style.setProperty('--primary', e.target.value);
                              } catch {}
                              await updateMutation.mutateAsync({ custom_theme_colors: colors });
                            }} />

                          <span className="text-xs font-mono text-slate-500">{profile?.custom_theme_colors?.primary || '#7c3aed'}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-700 dark:text-slate-400">Accent</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            className="h-8 w-12 p-0.5 cursor-pointer"
                            value={profile?.custom_theme_colors?.accent || '#f59e0b'}
                            onChange={async (e) => {
                              const colors = { ...(profile?.custom_theme_colors || {}), accent: e.target.value };
                              try {
                                localStorage.setItem('custom_accent', e.target.value);
                                document.documentElement.style.setProperty('--accent', e.target.value);
                              } catch {}
                              await updateMutation.mutateAsync({ custom_theme_colors: colors });
                            }} />

                          <span className="text-xs font-mono text-slate-500">{profile?.custom_theme_colors?.accent || '#f59e0b'}</span>
                        </div>
                      </div>
                    </div>
                    }
                </CardContent>
              </Card>
                }

            {/* Show status message for other profiles */}
            {!isOwnProfile && profile?.status_message &&
                <Card>
                <CardContent className="bg-purple-100 dark:bg-[#050505] p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-3 h-3 rounded-full shrink-0",
                        profile?.status === 'online' && "bg-emerald-500",
                        profile?.status === 'focus' && "bg-amber-500",
                        profile?.status === 'dnd' && "bg-rose-500",
                        profile?.status === 'offline' && "bg-slate-400",
                        !profile?.status && "bg-emerald-500"
                      )} />
                    <p className="text-slate-700 dark:text-slate-300 italic">"{profile.status_message}"</p>
                  </div>
                </CardContent>
              </Card>
                }

            {/* Bio & Details */}
            <Card>
              <CardHeader className="bg-purple-100 p-6 flex flex-col space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-500" />
                  About
                </CardTitle>
              </CardHeader>
                  <CardContent className="bg-purple-100 dark:bg-[#050505] pt-0 p-6 space-y-4">
                {isEditing ?
                    <>
                    <div>
                      <Label className="dark:text-slate-300">Display Name</Label>
                      <Input
                          value={editData.display_name}
                          onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                          className="mt-2 dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]" />

                    </div>
                    <div>
                      <Label className="dark:text-slate-300">Bio</Label>
                      <Textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          className="mt-2 min-h-24 dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]" />

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="dark:text-slate-300">Region</Label>
                        <Input
                            value={editData.region}
                            onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                            className="mt-2 dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]" />

                      </div>
                      <div>
                        <Label className="dark:text-slate-300">Timezone</Label>
                        <Input
                            value={editData.timezone}
                            onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
                            className="mt-2 dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]" />

                      </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                        disabled={updateMutation.isPending}>

                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </> :

                    <>
                          <p className="text-slate-700 font-medium">{profile?.bio || 'No bio yet'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:!text-[#b8b8b8]">
                      {profile?.region &&
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.region}
                        </span>
                        }
                      {profile?.timezone &&
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {profile.timezone}
                        </span>
                        }
                      {profile?.created_date &&
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(profile.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        }
                    </div>
                  </>
                    }
              </CardContent>
            </Card>

            {/* Intentions */}
            <Card>
              <CardHeader className="dark:bg-[#050505]">
                <CardTitle className="flex items-center justify-between dark:!text-white">
                  <span>Intentions</span>
                  {isOwnProfile && (
                      !editingIntentions ?
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-violet-600"
                        onClick={handleIntentionsEdit}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button> :
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingIntentions(false)}>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-violet-600"
                          onClick={handleIntentionsSave}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>)
                      }
                </CardTitle>
              </CardHeader>
                  <CardContent className="dark:bg-[#050505]">
                {editingIntentions ?
                    <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                          placeholder="Add intention (e.g., service, healing, build)..."
                          value={newIntention}
                          onChange={(e) => setNewIntention(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addIntention();
                            }
                          }}
                          className="dark:bg-[#0a0a0a] dark:text-white dark:border-[rgba(0,255,136,0.3)]" />

                      <Button onClick={addIntention} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {intentionsData.map((intention, i) =>
                        <Badge key={i} className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 gap-2 pr-1 capitalize">
                          {intention}
                          <button onClick={() => removeIntention(intention)} className="hover:bg-violet-200 dark:hover:bg-violet-800 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                        )}
                    </div>
                  </div> :

                    <div className="flex flex-wrap gap-2">
                    {profile?.intentions?.map((intention, i) =>
                      <Badge key={i} className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-500/50 capitalize font-medium">
                        {intention}
                      </Badge>
                      )}
                    {(!profile?.intentions || profile.intentions.length === 0) &&
                      <p className="text-slate-400 dark:!text-[#a0a0a0]">No intentions set</p>
                      }
                  </div>
                    }
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Testimonials
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testimonials.length === 0 ?
                    <div className="text-center py-4">
                      <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-500 mb-3">No testimonials yet</p>
                      <p className="text-xs text-slate-400 mb-4">Testimonials from collaborators help build your reputation</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          window.location.href = createPageUrl('Messages');
                        }}>

                        <MessageSquare className="w-4 h-4" />
                        Ask a Collaborator for Feedback
                      </Button>
                    </div> :

                    <div className="space-y-3">
                    {testimonials.map((t) =>
                      <div key={t.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <RankedAvatar src={t.from_avatar} name={t.from_name} userId={t.from_user_id} size={32} />
                            <div>
                              <p className="text-sm font-medium">{t.from_name}</p>
                              <div className="flex">
                                {[...Array(t.rating || 5)].map((_, i) =>
                                <span key={i} className="text-amber-400 text-sm">★</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => deleteTestimonialMutation.mutate(t.id)}>

                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600">{t.text}</p>
                        {t.context &&
                        <p className="text-xs text-slate-400 mt-2">{t.context}</p>
                        }
                      </div>
                      )}
                  </div>
                    }
              </CardContent>
            </Card>

            {/* Badges & Sigils */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-violet-700">
                  <span>Badges & Sigils</span>
                  {isOwnProfile &&
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-violet-600"
                        onClick={() => setBadgeGlossaryOpen(true)}>
                      View Glossary
                    </Button>
                      }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgesBar badges={profileBadges} defaultIfEmpty={true} onMore={() => setBadgeGlossaryOpen(true)} />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Skills</span>
                  {isOwnProfile &&
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-violet-600"
                        onClick={() => setSkillsPickerOpen(true)}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Skills
                    </Button>
                      }
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-3">
                  {skills.filter((s) => s.type === 'offer').length > 0 &&
                      <div>
                      <p className="text-xs text-slate-500 mb-2">I Offer</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.filter((s) => s.type === 'offer').map((skill) =>
                          <Badge key={skill.id} className="bg-violet-100 text-violet-700">
                            {skill.skill_name}
                            <span className="ml-1 text-amber-600">
                              {'★'.repeat(skill.proficiency || 3)}
                            </span>
                          </Badge>
                          )}
                      </div>
                    </div>
                      }
                  {skills.filter((s) => s.type === 'seek').length > 0 &&
                      <div>
                      <p className="text-xs text-slate-500 mb-2">I Seek</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.filter((s) => s.type === 'seek').map((skill) =>
                          <Badge key={skill.id} className="bg-blue-100 text-blue-700">
                            {skill.skill_name}
                          </Badge>
                          )}
                      </div>
                    </div>
                      }
                  {skills.length === 0 &&
                      <p className="text-slate-400">No skills added yet</p>
                      }
                  </div>
                  </CardContent>
                  </Card>
                  <PortfolioSection profile={profile} currentUser={currentUser} />
                  <EndorsementsSection profile={profile} currentUser={currentUser} />

                  {/* Social Links Editor - Own Profile Only */}
                  {isOwnProfile && (
                editingSocialLinks ?
                <SocialLinksEditor
                  profile={profile}
                  onSave={async (data) => {
                    await updateMutation.mutateAsync(data);
                    setEditingSocialLinks(false);
                  }}
                  onCancel={() => setEditingSocialLinks(false)} /> :


                <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-sm">Social Links & Website</CardTitle>
                          <Button variant="ghost" size="sm" className="text-violet-600" onClick={() => setEditingSocialLinks(true)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {profile?.social_links && Object.values(profile.social_links).some((v) => v) ?
                    <SocialLinksDisplay socialLinks={profile.social_links} /> :

                    <p className="text-slate-400 text-sm">No social links added yet</p>
                    }
                        </CardContent>
                      </Card>)

                }

                  {/* Detailed Bio Editor - Own Profile Only */}
                  {isOwnProfile && (
                editingBio ?
                <DetailedBioEditor
                  profile={profile}
                  onSave={async (data) => {
                    await updateMutation.mutateAsync(data);
                    setEditingBio(false);
                  }}
                  onCancel={() => setEditingBio(false)} /> :


                <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-sm">Detailed Bio</CardTitle>
                          <Button variant="ghost" size="sm" className="text-violet-600" onClick={() => setEditingBio(true)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </CardHeader>
                        <CardContent>
                          {profile?.detailed_bio ?
                    <p className="text-slate-700 whitespace-pre-wrap">{profile.detailed_bio}</p> :

                    <p className="text-slate-400 text-sm">Add a detailed about section to tell your story</p>
                    }
                        </CardContent>
                      </Card>)

                }

                  {/* Show detailed bio for other profiles */}
                  {!isOwnProfile && profile?.detailed_bio &&
                <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">About</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 whitespace-pre-wrap">{profile.detailed_bio}</p>
                      </CardContent>
                    </Card>
                }
                  </div>
                  </div>
                  </TabsContent>

                  {/* Showcase Tab */}
                  <TabsContent value="showcase" className="space-y-6">
                    <FeaturedShowcase
              profile={profile}
              isOwnProfile={isOwnProfile}
              onUpdate={async (data) => {
                await updateMutation.mutateAsync(data);
              }} />

                  </TabsContent>

          {isOwnProfile && (
            <TabsContent value="onboarding" className="space-y-6">
              <OnboardingDataEditor
                profile={profile}
                desires={desires}
                hopes={hopes}
                intentions={intentions} />

              <ConnectionPreferencesEditor profile={profile} />
            </TabsContent>
          )}

          {isOwnProfile && (
            <TabsContent value="metrics" className="space-y-6">
              <ProfileMetrics profile={profile} />
            </TabsContent>
          )}

          <TabsContent value="spiritual" className="space-y-6">
            {isOwnProfile && editingSpiritualProfile ?
            <SpiritualProfileEditor
              profile={profile}
              onSave={handleSpiritualProfileSave}
              onCancel={() => setEditingSpiritualProfile(false)} /> :


            <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Spiritual Profile</h2>
                    <p className="text-slate-500 mt-1">{isOwnProfile ? 'Your mystical identifiers and practices' : 'Mystical identifiers and practices'}</p>
                  </div>
                  {isOwnProfile && (
                    <Button
                    onClick={() => setEditingSpiritualProfile(true)}
                    className="bg-violet-600 hover:bg-violet-700 gap-2">

                      <Edit className="w-4 h-4" />
                      Edit Spiritual Profile
                    </Button>
                  )}
                </div>

                {/* Mystical Profile */}
                {isOwnProfile && editingMysticalProfile ?
              <MysticalProfileEditor
                profile={profile}
                onSave={handleMysticalProfileSave}
                onCancel={() => setEditingMysticalProfile(false)} /> :


              <Card>
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="text-base">Mystical Profile</CardTitle>
                      {isOwnProfile && (
                        <Button
                      variant="ghost"
                      size="sm"
                      className="text-violet-600"
                      onClick={() => setEditingMysticalProfile(true)}>

                          Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Mystical ID</span>
                          <div className="font-medium text-slate-900">{profile?.mystical_identifier || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Birthday</span>
                          <div className="font-medium text-slate-900">{profile?.birthday || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Sun Sign</span>
                          <div className="font-medium text-slate-900">{profile?.astrological_sign || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Rising</span>
                          <div className="font-medium text-slate-900">{profile?.rising_sign || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Moon</span>
                          <div className="font-medium text-slate-900">{profile?.moon_sign || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Life Path</span>
                          <div className="font-medium text-slate-900">{profile?.numerology_life_path ?? 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Destiny (Expression)</span>
                          <div className="font-medium text-slate-900">{profile?.numerology_destiny ?? 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Soul Urge</span>
                          <div className="font-medium text-slate-900">{profile?.numerology_soul_urge ?? 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Personality</span>
                          <div className="font-medium text-slate-900">{profile?.numerology_personality ?? 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Birth Card</span>
                          {profile?.birth_card ? (
                            <div>
                              <DestinyCardTooltip card={profile.birth_card}>
                                <div className="font-medium text-slate-900 inline-block">{profile.birth_card}</div>
                              </DestinyCardTooltip>
                              {getDestinyCardMeaning(profile.birth_card) && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {getDestinyCardMeaning(profile.birth_card).meaning}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="font-medium text-slate-900">Not set</div>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-500">Planetary Ruling Card</span>
                          {profile?.planetary_ruling_card ? (
                            <div>
                              <DestinyCardTooltip card={profile.planetary_ruling_card}>
                                <div className="font-medium text-slate-900 inline-block">{profile.planetary_ruling_card}</div>
                              </DestinyCardTooltip>
                              {getDestinyCardMeaning(profile.planetary_ruling_card) && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {getDestinyCardMeaning(profile.planetary_ruling_card).meaning}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="font-medium text-slate-900">Not set</div>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-500">Sun Card</span>
                          {profile?.sun_card ? (
                            <div>
                              <DestinyCardTooltip card={profile.sun_card}>
                                <div className="font-medium text-slate-900 inline-block">{profile.sun_card}</div>
                              </DestinyCardTooltip>
                              {getDestinyCardMeaning(profile.sun_card) && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {getDestinyCardMeaning(profile.sun_card).meaning}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="font-medium text-slate-900">Not set</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              }

                <div className="grid gap-6">
                  {/* Spiritual Practices */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Spiritual Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.spiritual_practices?.length > 0 ?
                    <>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {profile.spiritual_practices.map((practice, i) =>
                        <Badge key={i} className="bg-purple-100 text-purple-700 capitalize">
                                {practice.replace(/_/g, ' ')}
                              </Badge>
                        )}
                          </div>
                          {profile?.practices_description &&
                      <p className="text-sm text-slate-600 mt-3">{profile.practices_description}</p>
                      }
                        </> :

                    <p className="text-slate-400">No practices selected</p>
                    }
                    </CardContent>
                  </Card>

                  {/* Lineage / Tradition */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Lineage / Tradition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.lineage_tradition ?
                    <>
                          <Badge className="bg-blue-100 text-blue-700 capitalize mb-2">
                            {profile.lineage_tradition.replace(/_/g, ' ')}
                          </Badge>
                          {profile?.lineage_custom &&
                      <p className="text-sm text-slate-600 mt-2">{profile.lineage_custom}</p>
                      }
                        </> :

                    <p className="text-slate-400">No tradition specified</p>
                    }
                    </CardContent>
                  </Card>

                  {/* Symbolic Groups */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Symbolic Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.symbolic_groups?.length > 0 ?
                    <div className="flex flex-wrap gap-2">
                          {profile.symbolic_groups.map((group, i) =>
                      <Badge key={i} className="bg-amber-100 text-amber-700 capitalize">
                              {group === '144000' ? '144,000' : group.replace(/_/g, ' ')}
                            </Badge>
                      )}
                        </div> :

                    <p className="text-slate-400">No groups selected</p>
                    }
                    </CardContent>
                  </Card>

                  {/* Consciousness Orientation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Consciousness Orientation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.consciousness_orientation?.length > 0 ?
                    <div className="flex flex-wrap gap-2">
                          {profile.consciousness_orientation.map((orientation, i) =>
                      <Badge key={i} className="bg-emerald-100 text-emerald-700 capitalize">
                              {orientation.replace(/_/g, ' ')}
                            </Badge>
                      )}
                        </div> :

                    <p className="text-slate-400">No orientation selected</p>
                    }
                    </CardContent>
                  </Card>
                </div>
              </div>
            }
          </TabsContent>

          {isOwnProfile && showDatingTab &&
          <TabsContent value="dating" className="space-y-6">
              <Step7Dating
              data={datingData || {}}
              onChange={setDatingData}
              onComplete={async (data) => {
                const payload = {
                  relationship_status: data.relationship_status,
                  relationship_type_seeking: data.relationship_type_seeking,
                  dating_preferences: data.dating_preferences,
                  qualities_seeking: data.qualities_seeking,
                  qualities_providing: data.qualities_providing
                };
                await updateMutation.mutateAsync(payload);
              }} />

            </TabsContent>
          }

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Right Column - Stats */}
              <div className="space-y-6">
                <TrustScoreCard userId={profile?.user_id} />
                <ReputationScoresCard userId={profile?.user_id} />
            {/* Rank Progress with Badge */}
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center mb-4">
                  <RankBadge code={rpInfo?.code || 'seeker'} size={80} className="mb-2 drop-shadow-lg" />
                  <RPRing rpPoints={rpPoints} className="mx-auto" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 capitalize">{rpInfo.title}</h3>
                  <AscensionLadderPopover />
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {rpInfo.nextMin ? `${rpInfo.nextMin - rpPoints} RP to next rank (${rpInfo.nextTitle})` : 'Max rank'}
                </p>
              </CardContent>
            </Card>

            {/* Affiliate Tier Badge */}
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center mb-4">
                  <AffiliateBadge tier={affiliateTier} size={80} className="mb-2 drop-shadow-lg" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 capitalize">{affiliateTier} Affiliate</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {affiliatePaidCount} paid referrals
                </p>
                {affiliateTier === 'bronze' && affiliatePaidCount < 5 &&
                    <p className="text-xs text-amber-600 mt-2">{5 - affiliatePaidCount} more to Silver</p>
                    }
                {affiliateTier === 'silver' && affiliatePaidCount < 20 &&
                    <p className="text-xs text-amber-600 mt-2">{20 - affiliatePaidCount} more to Gold</p>
                    }
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <MetricTile
                    label="GGG"
                    value={profile?.ggg_balance?.toLocaleString() || "0"}
                    icon={Coins}
                    color="amber"
                    size="compact" />

              <MetricTile
                    label="Reach"
                    value={profile?.reach_score || 0}
                    icon={TrendingUp}
                    color="violet"
                    size="compact" />

              <MetricTile
                    label="Followers"
                    value={profile?.follower_count || 0}
                    icon={Users}
                    color="blue"
                    size="compact" />

              <MetricTile
                    label="Meetings"
                    value={profile?.meetings_completed || 0}
                    icon={Calendar}
                    color="emerald"
                    size="compact" />

            </div>

            {/* Values */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile?.values_tags?.map((value, i) =>
                      <Badge key={i} className="bg-emerald-100 text-emerald-700 capitalize">
                      {value}
                    </Badge>
                      )}
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="trust-network" className="space-y-6">
              <TrustNetworkGraph 
                userId={profile?.user_id} 
                profile={profile}
              />
            </TabsContent>
          )}

          <TabsContent value="roles" className="space-y-6">
            <UserRolesPanel profile={profile} />

            {/* Quick view of current active roles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Roles</CardTitle>
              </CardHeader>
              <CardContent>
                {activeRoles?.length ?
                <div className="flex flex-wrap gap-2">
                    {activeRoles.map((r) =>
                  <Badge key={r.id} variant="secondary" className="capitalize">
                        {ROLE_LABELS[r.role_code] || r.role_code.replace(/_/g, ' ')}
                      </Badge>
                  )}
                  </div> :

                <p className="text-slate-400 text-sm">No active roles assigned</p>
                }
              </CardContent>
            </Card>
          </TabsContent>

           {/* Monetization Tab */}
           {isOwnProfile &&
          <TabsContent value="monetization" className="space-y-6">
               <CreatorMonetizationTab profile={profile} />
             </TabsContent>
          }

          {/* Privacy & Opt-Out Tab */}
          {isOwnProfile &&
          <TabsContent value="privacy" className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <OptOutSettings profile={profile} />
                 <PerformanceScoreCard profile={profile} showDetailed={true} />
               </div>
             </TabsContent>
          }

          {isOwnProfile && (
            <TabsContent value="friends" className="space-y-6">
              {/* Friend Requests - only show on own profile */}
              <FriendRequestsPanel currentUser={currentUser} />

              {/* Friends List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-500" />
                    Friends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FriendsList userId={profile?.user_id} />
                </CardContent>
              </Card>

              {/* Followers - People who follow you */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Followers ({followers.length})
                    <span className="text-xs font-normal text-slate-500 ml-2">People who follow you</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {followers.length > 0 ?
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {followers.map((follow) =>
                    <div
                      key={follow.id}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      data-user-id={follow.follower_id}>

                          <RankedAvatar src={follow.follower_avatar} name={follow.follower_name} userId={follow.follower_id} size={48} />
                          <p className="text-sm font-medium text-slate-900 text-center line-clamp-1">
                            {follow.follower_name}
                          </p>
                        </div>
                    )}
                    </div> :

                  <p className="text-slate-400 text-sm text-center py-4">No followers yet</p>
                  }
                </CardContent>
              </Card>

              {/* Following - People you follow */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Following ({following.length})
                    <span className="text-xs font-normal text-slate-500 ml-2">People you follow</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {following.length > 0 ?
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {following.map((follow) =>
                    <div
                      key={follow.id}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors relative group">

                          <div
                        className="cursor-pointer"
                        data-user-id={follow.following_id}>

                            <RankedAvatar src={follow.following_avatar} name={follow.following_name} userId={follow.following_id} size={48} />
                          </div>
                          <p
                        className="text-sm font-medium text-slate-900 text-center line-clamp-1 cursor-pointer"
                        data-user-id={follow.following_id}>

                            {follow.following_name}
                          </p>
                          <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => unfollowMutation.mutate(follow.id)}>

                            Unfollow
                          </Button>
                        </div>
                    )}
                    </div> :

                  <p className="text-slate-400 text-sm text-center py-4">Not following anyone yet</p>
                  }
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Skills Picker Modal */}
        <SkillsPicker
          open={skillsPickerOpen}
          onClose={() => setSkillsPickerOpen(false)}
          userId={profile?.user_id} />

      </div>
      <BadgesGlossaryModal open={badgeGlossaryOpen} onOpenChange={setBadgeGlossaryOpen} />
      <PhotoViewer
        open={viewerOpen}
        images={[profile?.avatar_url, ...(profile?.gallery_images || [])].filter(Boolean).slice(0, 5)}
        startIndex={0}
        onClose={() => setViewerOpen(false)} />

    </div>);

}