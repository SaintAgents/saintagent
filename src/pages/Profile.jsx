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
  SelectValue } from
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
  MessageSquare } from
  "lucide-react";

import ProgressRing from '@/components/hud/ProgressRing';
import RPRing from '@/components/reputation/RPRing';
import { getRPRank } from '@/components/reputation/rpUtils';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import PhotoViewer from '@/components/profile/PhotoViewer';
import TrustScoreCard from '@/components/trust/TrustScoreCard';
import ReputationScoresCard from '@/components/reputation/ReputationScoresCard';
import UserRolesPanel from '@/components/roles/UserRolesPanel';
import MetricTile from '@/components/hud/MetricTile';
import BadgesBar from '@/components/badges/BadgesBar';
import BadgesGlossaryModal from '@/components/badges/BadgesGlossaryModal';
import Step7Dating from '@/components/onboarding/Step7Dating';
import { createPageUrl } from '@/utils';

export default function Profile() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [skillsPickerOpen, setSkillsPickerOpen] = useState(false);
  const [editingSpiritualProfile, setEditingSpiritualProfile] = useState(false);
  const [editingMysticalProfile, setEditingMysticalProfile] = useState(false);
  const [editingIntentions, setEditingIntentions] = useState(false);
  const [intentionsData, setIntentionsData] = useState([]);
  const [newIntention, setNewIntention] = useState('');
  const [badgeGlossaryOpen, setBadgeGlossaryOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
              const user = await base44.auth.me();
              return base44.entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1);
            }
  });
  const profile = profiles?.[0];

  const [datingData, setDatingData] = useState(null);
  const showDatingTab = !!(profile && (
    profile.relationship_status === 'single' ||
    profile.relationship_status === 'open' ||
    (profile.relationship_type_seeking || []).includes('polyamorous') ||
    (profile.relationship_type_seeking || []).includes('open')
  ));

  useEffect(() => {
    if (profile) {
      setDatingData({
        relationship_status: profile.relationship_status,
        relationship_type_seeking: profile.relationship_type_seeking || [],
        dating_preferences: profile.dating_preferences || {},
        qualities_seeking: profile.qualities_seeking || [],
        qualities_providing: profile.qualities_providing || [],
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
    queryKey: ['skills', profile?.user_id],
    queryFn: () => base44.entities.Skill.filter({ user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch desires
  const { data: desires = [] } = useQuery({
    queryKey: ['desires', profile?.user_id],
    queryFn: () => base44.entities.UserDesire.filter({ user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch hopes
  const { data: hopes = [] } = useQuery({
    queryKey: ['hopes', profile?.user_id],
    queryFn: () => base44.entities.UserHope.filter({ user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch intentions
  const { data: intentions = [] } = useQuery({
    queryKey: ['intentions', profile?.user_id],
    queryFn: () => base44.entities.UserIntention.filter({ user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch badges
  const { data: profileBadges = [] } = useQuery({
    queryKey: ['userBadges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  // Active roles (for Founder badge)
  const { data: activeRoles = [] } = useQuery({
    queryKey: ['userRoles', profile?.user_id],
    queryFn: () => base44.entities.UserRole.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  // Fetch testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ['userTestimonials', profile?.user_id],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch followers
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', profile?.user_id],
    queryFn: () => base44.entities.Follow.filter({ following_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Fetch following
  const { data: following = [] } = useQuery({
    queryKey: ['following', profile?.user_id],
    queryFn: () => base44.entities.Follow.filter({ follower_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: (followId) => base44.entities.Follow.delete(followId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditing(false);
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
    await updateMutation.mutateAsync(spiritualData);
    setEditingSpiritualProfile(false);
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

  // Wallet query - only run if profile exists
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', profile?.user_id],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('walletEngine', {
          action: 'getWallet',
          payload: { user_id: profile.user_id }
        });
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!profile?.user_id,
    retry: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-violet-500 to-purple-600 group">
            {profile?.hero_image_url &&
            <img
              src={profile.hero_image_url}
              alt="Profile hero"
              className="w-full h-full object-cover" />

            }
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
          </div>
          <CardContent className="bg-purple-100 text-zinc-500 pt-0 p-6 relative">
            <div className="flex items-end gap-6 -mt-12">
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
                />
              </div>
              <div className="flex-1 pb-2 mt-8">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="bg-transparent text-blue-950 text-2xl font-bold">{(['mathues','adam','peaceday'].includes((profile?.handle || '').toLowerCase()) ? (profile?.display_name || '') : `${profile?.display_name || ''} (demo)`)}</h1>
                  {profile?.leader_tier === 'verified144k' && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <Crown className="w-3 h-3 mr-1" />
                      144K Leader
                    </Badge>
                  )}
                  {profile?.leader_tier === 'candidate' && (
                    <Badge variant="outline">Leader Candidate</Badge>
                  )}

                  {/* Render all active roles as badges */}
                  {activeRoles?.map?.(r => (
                    <Badge key={r.id} variant="secondary" className="capitalize">
                      {ROLE_LABELS[r.role_code] || r.role_code.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {typeof profile?.influence_score === 'number' && (
                    <Badge className="bg-violet-100 text-violet-700">
                      <TrendingUp className="w-3 h-3 mr-1" /> {Math.round(profile.influence_score)}
                    </Badge>
                  )}
                  {typeof profile?.expertise_score === 'number' && (
                    <Badge className="bg-blue-100 text-blue-700">
                      <BadgeCheck className="w-3 h-3 mr-1" /> {Math.round(profile.expertise_score)}
                    </Badge>
                  )}
                </div>
                <p className="text-blue-950">@{profile?.handle} {profile?.sa_number ? `• SA#${profile.sa_number}` : ''}</p>
              </div>
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
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className={cn(
            "flex flex-nowrap overflow-x-auto w-full max-w-3xl gap-1",
            showDatingTab ? "grid-cols-7" : "grid-cols-6"
          )}>
            <TabsTrigger value="basic" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Basic Info</span>
              <User className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Details</span>
              <Compass className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="spiritual" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Spiritual</span>
              <Star className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Stats</span>
              <TrendingUp className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Roles</span>
              <Crown className="sm:hidden w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Friends</span>
              <Users className="sm:hidden w-4 h-4" />
              {following.length > 0 && (
                <Badge className="ml-1 bg-violet-600 text-white h-4 px-1.5 text-[10px]">{following.length}</Badge>
              )}
            </TabsTrigger>
            {showDatingTab && (
              <TabsTrigger value="dating" className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3">
                <span className="hidden sm:inline">Dating</span>
                <Heart className="sm:hidden w-4 h-4" />
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Uploader */}
              <div>
                <AvatarUploader
                  currentAvatar={profile?.avatar_url}
                  displayName={profile?.display_name}
                  onAvatarUpdate={handleAvatarUpdate} />

              </div>

              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
            {/* Bio & Details */}
            <Card>
              <CardHeader className="bg-purple-100 p-6 flex flex-col space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-500" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-purple-100 pt-0 p-6 space-y-4">
                {isEditing ?
                    <>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                          value={editData.display_name}
                          onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                          className="mt-2" />

                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          className="mt-2 min-h-24" />

                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Region</Label>
                        <Input
                            value={editData.region}
                            onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                            className="mt-2" />

                      </div>
                      <div>
                        <Label>Timezone</Label>
                        <Input
                            value={editData.timezone}
                            onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
                            className="mt-2" />

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
                    <p className="bg-purple-100 text-slate-800">{profile?.bio || 'No bio yet'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
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
                    </div>
                  </>
                    }
              </CardContent>
            </Card>

            {/* Intentions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Intentions</span>
                  {!editingIntentions ?
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
                    </div>
                      }
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                          }} />

                      <Button onClick={addIntention} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {intentionsData.map((intention, i) =>
                        <Badge key={i} className="bg-violet-100 text-violet-700 gap-2 pr-1 capitalize">
                          {intention}
                          <button onClick={() => removeIntention(intention)} className="hover:bg-violet-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                        )}
                    </div>
                  </div> :

                    <div className="flex flex-wrap gap-2">
                    {profile?.intentions?.map((intention, i) =>
                      <Badge key={i} className="bg-violet-100 text-violet-700 capitalize">
                        {intention}
                      </Badge>
                      )}
                    {(!profile?.intentions || profile.intentions.length === 0) &&
                      <p className="text-slate-400">No intentions set</p>
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
                        }}
                      >
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

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Badges</span>
                  <Button
                        variant="ghost"
                        size="sm"
                        className="text-violet-600"
                        onClick={() => setBadgeGlossaryOpen(true)}>

                    View Glossary
                  </Button>
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
                  <Button
                        variant="ghost"
                        size="sm"
                        className="text-violet-600"
                        onClick={() => setSkillsPickerOpen(true)}>

                    <Plus className="w-4 h-4 mr-1" />
                    Add Skills
                  </Button>
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
                  </div>
                  </div>
                  </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <OnboardingDataEditor
              profile={profile}
              desires={desires}
              hopes={hopes}
              intentions={intentions} />

            <ConnectionPreferencesEditor profile={profile} />
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-6">
            {editingSpiritualProfile ?
            <SpiritualProfileEditor
              profile={profile}
              onSave={handleSpiritualProfileSave}
              onCancel={() => setEditingSpiritualProfile(false)} /> :


            <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Spiritual Profile</h2>
                    <p className="text-slate-500 mt-1">Your mystical identifiers and practices</p>
                  </div>
                  <Button
                  onClick={() => setEditingSpiritualProfile(true)}
                  className="bg-violet-600 hover:bg-violet-700 gap-2">

                    <Edit className="w-4 h-4" />
                    Edit Spiritual Profile
                  </Button>
                </div>

                {/* Mystical Profile */}
                {editingMysticalProfile ?
              <MysticalProfileEditor
                profile={profile}
                onSave={handleMysticalProfileSave}
                onCancel={() => setEditingMysticalProfile(false)} /> :


              <Card>
                    <CardHeader className="flex items-center justify-between">
                      <CardTitle className="text-base">Mystical Profile</CardTitle>
                      <Button
                    variant="ghost"
                    size="sm"
                    className="text-violet-600"
                    onClick={() => setEditingMysticalProfile(true)}>

                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Mystical ID</span>
                          <div className="font-medium text-slate-900">{profile?.mystical_identifier || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Sun</span>
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
                          <span className="text-slate-500">Personality</span>
                          <div className="font-medium text-slate-900">{profile?.numerology_personality ?? 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Birth Card</span>
                          <div className="font-medium text-slate-900">{profile?.birth_card || 'Not set'}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Sun Card</span>
                          <div className="font-medium text-slate-900">{profile?.sun_card || 'Not set'}</div>
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

          {showDatingTab && (
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
                    qualities_providing: data.qualities_providing,
                  };
                  await updateMutation.mutateAsync(payload);
                }}
              />
            </TabsContent>
          )}

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Right Column - Stats */}
              <div className="space-y-6">
                <TrustScoreCard userId={profile?.user_id} />
                <ReputationScoresCard userId={profile?.user_id} />
            {/* Rank Progress */}
            <Card>
              <CardContent className="pt-6 text-center">
                <RPRing rpPoints={rpPoints} className="mx-auto mb-4" />
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 capitalize">{rpInfo.title}</h3>
                  <AscensionLadderPopover />
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {rpInfo.nextMin ? `${rpInfo.nextMin - rpPoints} RP to next rank (${rpInfo.nextTitle})` : 'Max rank'}
                </p>
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

          <TabsContent value="roles" className="space-y-6">
            <UserRolesPanel profile={profile} />

            {/* Quick view of current active roles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Roles</CardTitle>
              </CardHeader>
              <CardContent>
                {activeRoles?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {activeRoles.map((r) => (
                      <Badge key={r.id} variant="secondary" className="capitalize">
                        {ROLE_LABELS[r.role_code] || r.role_code.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No active roles assigned</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="friends" className="space-y-6">
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
                {followers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {followers.map((follow) => (
                      <div
                        key={follow.id}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                        data-user-id={follow.follower_id}
                      >
                        <RankedAvatar src={follow.follower_avatar} name={follow.follower_name} userId={follow.follower_id} size={48} />
                        <p className="text-sm font-medium text-slate-900 text-center line-clamp-1">
                          {follow.follower_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">No followers yet</p>
                )}
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
                {following.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {following.map((follow) => (
                      <div
                        key={follow.id}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors relative group"
                      >
                        <div
                          className="cursor-pointer"
                          data-user-id={follow.following_id}
                        >
                          <RankedAvatar src={follow.following_avatar} name={follow.following_name} userId={follow.following_id} size={48} />
                        </div>
                        <p
                          className="text-sm font-medium text-slate-900 text-center line-clamp-1 cursor-pointer"
                          data-user-id={follow.following_id}
                        >
                          {follow.following_name}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => unfollowMutation.mutate(follow.id)}
                        >
                          Unfollow
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">Not following anyone yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
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
        images={[profile?.avatar_url, ...(profile?.gallery_images || [])].filter(Boolean).slice(0,5)}
        startIndex={0}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}