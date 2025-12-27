import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Crown
} from "lucide-react";

import ProgressRing from '@/components/hud/ProgressRing';
import MetricTile from '@/components/hud/MetricTile';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <Button variant="ghost" size="sm" className="text-violet-600">
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
      </div>
    </div>
  );
}