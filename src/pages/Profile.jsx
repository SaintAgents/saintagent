import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkillsPicker from '@/components/SkillsPicker';
import SpiritualProfileEditor from '@/components/profile/SpiritualProfileEditor';
import AvatarUploader from '@/components/profile/AvatarUploader';
import OnboardingDataEditor from '@/components/profile/OnboardingDataEditor';
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
  SelectValue,
} from "@/components/ui/select";
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
  Compass
} from "lucide-react";

import ProgressRing from '@/components/hud/ProgressRing';
import MetricTile from '@/components/hud/MetricTile';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [skillsPickerOpen, setSkillsPickerOpen] = useState(false);
  const [editingSpiritualProfile, setEditingSpiritualProfile] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

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
      timezone: profile?.timezone || '',
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

  const rankProgress = profile?.rank_points || 0;
  const nextRankAt = 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardContent className="relative pt-0">
            <div className="flex items-end gap-6 -mt-12">
              <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {profile?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{profile?.display_name}</h1>
                  {profile?.leader_tier === 'verified144k' && (
                    <Badge className="bg-amber-100 text-amber-700">
                      <Crown className="w-3 h-3 mr-1" />
                      144K Leader
                    </Badge>
                  )}
                  {profile?.leader_tier === 'candidate' && (
                    <Badge variant="outline">Leader Candidate</Badge>
                  )}
                </div>
                <p className="text-slate-500">@{profile?.handle}</p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-xl gap-2"
                onClick={isEditing ? () => setIsEditing(false) : handleEdit}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="onboarding">Profile Details</TabsTrigger>
            <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Uploader */}
              <div>
                <AvatarUploader 
                  currentAvatar={profile?.avatar_url}
                  displayName={profile?.display_name}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </div>

              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
            {/* Bio & Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-slate-500" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label>Display Name</Label>
                      <Input 
                        value={editData.display_name}
                        onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea 
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="mt-2 min-h-24"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Region</Label>
                        <Input 
                          value={editData.region}
                          onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Timezone</Label>
                        <Input 
                          value={editData.timezone}
                          onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleSave} 
                      className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                      disabled={updateMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600">{profile?.bio || 'No bio yet'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      {profile?.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.region}
                        </span>
                      )}
                      {profile?.timezone && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {profile.timezone}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Intentions */}
            <Card>
              <CardHeader>
                <CardTitle>Intentions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile?.intentions?.map((intention, i) => (
                    <Badge key={i} className="bg-violet-100 text-violet-700 capitalize">
                      {intention}
                    </Badge>
                  ))}
                  {(!profile?.intentions || profile.intentions.length === 0) && (
                    <p className="text-slate-400">No intentions set</p>
                  )}
                </div>
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
                    onClick={() => setSkillsPickerOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Skills
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skills.filter(s => s.type === 'offer').length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">I Offer</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.filter(s => s.type === 'offer').map((skill) => (
                          <Badge key={skill.id} className="bg-violet-100 text-violet-700">
                            {skill.skill_name}
                            <span className="ml-1 text-amber-600">
                              {'★'.repeat(skill.proficiency || 3)}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {skills.filter(s => s.type === 'seek').length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">I Seek</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.filter(s => s.type === 'seek').map((skill) => (
                          <Badge key={skill.id} className="bg-blue-100 text-blue-700">
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {skills.length === 0 && (
                    <p className="text-slate-400">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            <OnboardingDataEditor 
              profile={profile}
              desires={desires}
              hopes={hopes}
              intentions={intentions}
            />
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-6">
            {editingSpiritualProfile ? (
              <SpiritualProfileEditor
                profile={profile}
                onSave={handleSpiritualProfileSave}
                onCancel={() => setEditingSpiritualProfile(false)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Spiritual Profile</h2>
                    <p className="text-slate-500 mt-1">Your mystical identifiers and practices</p>
                  </div>
                  <Button 
                    onClick={() => setEditingSpiritualProfile(true)}
                    className="bg-violet-600 hover:bg-violet-700 gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Spiritual Profile
                  </Button>
                </div>

                <div className="grid gap-6">
                  {/* Spiritual Practices */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Spiritual Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.spiritual_practices?.length > 0 ? (
                        <>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {profile.spiritual_practices.map((practice, i) => (
                              <Badge key={i} className="bg-purple-100 text-purple-700 capitalize">
                                {practice.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                          {profile?.practices_description && (
                            <p className="text-sm text-slate-600 mt-3">{profile.practices_description}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-slate-400">No practices selected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Lineage / Tradition */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Lineage / Tradition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.lineage_tradition ? (
                        <>
                          <Badge className="bg-blue-100 text-blue-700 capitalize mb-2">
                            {profile.lineage_tradition.replace(/_/g, ' ')}
                          </Badge>
                          {profile?.lineage_custom && (
                            <p className="text-sm text-slate-600 mt-2">{profile.lineage_custom}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-slate-400">No tradition specified</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Symbolic Groups */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Symbolic Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.symbolic_groups?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.symbolic_groups.map((group, i) => (
                            <Badge key={i} className="bg-amber-100 text-amber-700 capitalize">
                              {group === '144000' ? '144,000' : group.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">No groups selected</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Consciousness Orientation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Consciousness Orientation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile?.consciousness_orientation?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.consciousness_orientation.map((orientation, i) => (
                            <Badge key={i} className="bg-emerald-100 text-emerald-700 capitalize">
                              {orientation.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400">No orientation selected</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Intentions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Intentions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile?.intentions?.map((intention, i) => (
                        <Badge key={i} className="bg-violet-100 text-violet-700 capitalize">
                          {intention}
                        </Badge>
                      ))}
                      {(!profile?.intentions || profile.intentions.length === 0) && (
                        <p className="text-slate-400">No intentions set</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((skill, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {skill}
                        </Badge>
                      ))}
                      {(!profile?.skills || profile.skills.length === 0) && (
                        <p className="text-slate-400">No skills added</p>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-violet-600"
                        onClick={() => setSkillsPickerOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Skills
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats */}
              <div className="space-y-6">
            {/* Rank Progress */}
            <Card>
              <CardContent className="pt-6 text-center">
                <ProgressRing 
                  value={rankProgress} 
                  max={nextRankAt} 
                  size={120}
                  strokeWidth={8}
                  color="violet"
                  className="mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-slate-900 capitalize">
                  {profile?.rank_code || 'Seeker'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {nextRankAt - rankProgress} points to next rank
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
                size="compact"
              />
              <MetricTile 
                label="Reach" 
                value={profile?.reach_score || 0} 
                icon={TrendingUp}
                color="violet"
                size="compact"
              />
              <MetricTile 
                label="Followers" 
                value={profile?.follower_count || 0} 
                icon={Users}
                color="blue"
                size="compact"
              />
              <MetricTile 
                label="Meetings" 
                value={profile?.meetings_completed || 0} 
                icon={Calendar}
                color="emerald"
                size="compact"
              />
            </div>

            {/* Values */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile?.values_tags?.map((value, i) => (
                    <Badge key={i} className="bg-emerald-100 text-emerald-700 capitalize">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Skills Picker Modal */}
        <SkillsPicker
          open={skillsPickerOpen}
          onClose={() => setSkillsPickerOpen(false)}
          userId={profile?.user_id}
        />
      </div>
    </div>
  );
}