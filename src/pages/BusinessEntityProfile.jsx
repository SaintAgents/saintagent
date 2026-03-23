import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Globe, MapPin, Mail, Phone, Star, Shield, Users, Eye, TrendingUp, 
  Sparkles, ArrowLeft, ExternalLink, Edit, UserPlus, Heart, Share2,
  Target, Award, Calendar, Briefcase, MessageCircle
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import BusinessDashboardTab from '@/components/business/BusinessDashboardTab';
import BusinessTeamTab from '@/components/business/BusinessTeamTab';
import BusinessServicesTab from '@/components/business/BusinessServicesTab';
import EditBusinessModal from '@/components/business/EditBusinessModal';
import AddTeamMemberModal from '@/components/business/AddTeamMemberModal';

const HERO_FALLBACK = "https://media.base44.com/images/public/694f3e0401b05e6e8a042002/6ba2b63c4_universal_upscale_0_d50f73c9-693f-450b-977e-64eea1b7922d_02.jpg";

const CATEGORIES = {
  healing_wellness: { label: 'Healing & Wellness', color: 'bg-emerald-100 text-emerald-700' },
  conscious_technology: { label: 'Conscious Technology', color: 'bg-blue-100 text-blue-700' },
  sustainable_living: { label: 'Sustainable Living', color: 'bg-green-100 text-green-700' },
  spiritual_education: { label: 'Spiritual Education', color: 'bg-purple-100 text-purple-700' },
  sacred_arts: { label: 'Sacred Arts', color: 'bg-pink-100 text-pink-700' },
  regenerative_finance: { label: 'Regenerative Finance', color: 'bg-amber-100 text-amber-700' },
  community_building: { label: 'Community Building', color: 'bg-cyan-100 text-cyan-700' },
  earth_stewardship: { label: 'Earth Stewardship', color: 'bg-lime-100 text-lime-700' },
  media_publishing: { label: 'Media & Publishing', color: 'bg-orange-100 text-orange-700' },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-700' }
};

const VERIFICATION = {
  unverified: { label: 'Unverified', color: 'text-slate-400', bg: 'bg-slate-100' },
  basic: { label: 'Basic', color: 'text-blue-500', bg: 'bg-blue-50' },
  verified: { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  premium: { label: 'Premium', color: 'text-amber-500', bg: 'bg-amber-50' },
};

export default function BusinessEntityProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const entityId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: entity, isLoading } = useQuery({
    queryKey: ['businessEntity5D', entityId],
    queryFn: async () => {
      const results = await base44.entities.BusinessEntity5D.filter({ id: entityId });
      return results[0];
    },
    enabled: !!entityId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Globe className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Entity not found</h2>
        <Button variant="outline" onClick={() => window.location.href = createPageUrl('BusinessEntities')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </div>
    );
  }

  const isOwner = currentUser?.email === entity.owner_id;
  const isTeamMember = entity.team_member_ids?.includes(currentUser?.email);
  const cat = CATEGORIES[entity.category] || CATEGORIES.other;
  const ver = VERIFICATION[entity.verification_level] || VERIFICATION.unverified;
  const impact = entity.impact_metrics || {};

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Cover */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={entity.cover_image_url || HERO_FALLBACK}
          alt={entity.name}
          className="absolute inset-0 w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Button variant="outline" size="sm" className="bg-black/30 border-white/30 text-white hover:bg-black/50 rounded-xl" onClick={() => window.location.href = createPageUrl('BusinessEntities')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Directory
          </Button>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button size="sm" variant="outline" className="bg-black/30 border-white/30 text-white hover:bg-black/50 rounded-xl gap-1" onClick={() => setEditOpen(true)}>
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="bg-black/30 border-white/30 text-white hover:bg-black/50 rounded-xl gap-1" onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="w-3.5 h-3.5" /> Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg shrink-0 -mt-16 md:-mt-12">
              <AvatarImage src={entity.logo_url} />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-700 text-white text-3xl font-bold">
                {entity.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{entity.name}</h1>
                <div className="flex items-center gap-2">
                  {entity.verification_level !== 'unverified' && (
                    <Badge className={`${ver.bg} ${ver.color} gap-1`}>
                      <Shield className="w-3 h-3" /> {ver.label}
                    </Badge>
                  )}
                  <Badge className={cat.color}>{cat.label}</Badge>
                  {entity.is_featured && <Badge className="bg-amber-500 text-white gap-1"><Star className="w-3 h-3" /> Featured</Badge>}
                </div>
              </div>
              
              {entity.tagline && <p className="text-lg text-slate-600 mb-3">{entity.tagline}</p>}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {entity.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{entity.location}</span>}
                {entity.website_url && (
                  <a href={entity.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 hover:underline">
                    <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {entity.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{entity.email}</span>}
                {entity.founding_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Founded {entity.founding_date}</span>}
              </div>

              {/* Focus areas */}
              {entity.focus_areas?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entity.focus_areas.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
                <Heart className="w-4 h-4" /> Follow
              </Button>
              <Button variant="outline" className="rounded-xl gap-2">
                <MessageCircle className="w-4 h-4" /> Contact
              </Button>
              <Button variant="outline" className="rounded-xl gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="text-center p-3 rounded-xl bg-violet-50">
              <p className="text-xl font-bold text-violet-700">{entity.follower_count || 0}</p>
              <p className="text-xs text-slate-500">Followers</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-50">
              <p className="text-xl font-bold text-blue-700">{entity.team_member_ids?.length || 0}</p>
              <p className="text-xs text-slate-500">Team Members</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50">
              <p className="text-xl font-bold text-emerald-700">{impact.people_served || 0}</p>
              <p className="text-xs text-slate-500">People Served</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50">
              <p className="text-xl font-bold text-amber-700">{impact.projects_completed || 0}</p>
              <p className="text-xs text-slate-500">Projects</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-cyan-50">
              <p className="text-xl font-bold text-cyan-700">{entity.view_count || 0}</p>
              <p className="text-xs text-slate-500">Views</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="team">Team ({entity.team_roles?.length || 0})</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <BusinessDashboardTab entity={entity} isOwner={isOwner} />
          </TabsContent>

          <TabsContent value="team">
            <BusinessTeamTab entity={entity} isOwner={isOwner} onAddMember={() => setAddMemberOpen(true)} />
          </TabsContent>

          <TabsContent value="services">
            <BusinessServicesTab entity={entity} isOwner={isOwner} />
          </TabsContent>

          <TabsContent value="about">
            <div className="space-y-6">
              {entity.description && (
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">About</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{entity.description}</p>
                </div>
              )}
              {entity.mission_statement && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-6">
                  <h3 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" /> Mission Statement
                  </h3>
                  <p className="text-violet-800 text-lg italic">"{entity.mission_statement}"</p>
                </div>
              )}
              {entity.vision && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> Vision
                  </h3>
                  <p className="text-amber-800">{entity.vision}</p>
                </div>
              )}
              {/* Social links */}
              {entity.social_links && Object.values(entity.social_links).some(Boolean) && (
                <div className="bg-white rounded-2xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Connect</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(entity.social_links).filter(([,v]) => v).map(([platform, url]) => (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-violet-100 text-sm font-medium text-slate-700 hover:text-violet-700 transition-colors capitalize">
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Owner info */}
              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Founded By</h3>
                <div className="flex items-center gap-3 cursor-pointer" data-user-id={entity.owner_id}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entity.owner_avatar} />
                    <AvatarFallback>{entity.owner_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">{entity.owner_name}</p>
                    <p className="text-sm text-slate-500">Founder & Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {editOpen && <EditBusinessModal entity={entity} open={editOpen} onClose={() => setEditOpen(false)} />}
      {addMemberOpen && <AddTeamMemberModal entity={entity} open={addMemberOpen} onClose={() => setAddMemberOpen(false)} />}
    </div>
  );
}