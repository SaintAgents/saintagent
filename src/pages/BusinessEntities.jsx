import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Star, Users, Globe, MapPin, Shield, TrendingUp, Sparkles, ArrowRight, Eye } from 'lucide-react';
import BusinessEntityCard from '@/components/business/BusinessEntityCard';
import CreateBusinessModal from '@/components/business/CreateBusinessModal';
import AdminBusinessPanel from '@/components/business/AdminBusinessPanel';

const HERO_IMAGE = "https://media.base44.com/images/public/694f3e0401b05e6e8a042002/6ba2b63c4_universal_upscale_0_d50f73c9-693f-450b-977e-64eea1b7922d_02.jpg";

const CATEGORIES = {
  healing_wellness: { label: 'Healing & Wellness', color: 'bg-emerald-100 text-emerald-700' },
  conscious_technology: { label: 'Conscious Technology', color: 'bg-blue-100 text-blue-700' },
  sustainable_living: { label: 'Sustainable Living', color: 'bg-green-100 text-green-700' },
  spiritual_education: { label: 'Spiritual Education', color: 'bg-purple-100 text-purple-700' },
  sacred_arts: { label: 'Sacred Arts', color: 'bg-pink-100 text-pink-700' },
  regenerative_finance: { label: 'Regenerative Finance', color: 'bg-amber-100 text-amber-700' },
  fintech: { label: 'Fintech', color: 'bg-indigo-100 text-indigo-700' },
  financial_services: { label: 'Financial Services', color: 'bg-teal-100 text-teal-700' },
  community_building: { label: 'Community Building', color: 'bg-cyan-100 text-cyan-700' },
  earth_stewardship: { label: 'Earth Stewardship', color: 'bg-lime-100 text-lime-700' },
  media_publishing: { label: 'Media & Publishing', color: 'bg-orange-100 text-orange-700' },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-700' }
};

export default function BusinessEntities() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tab, setTab] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['businessEntities5D'],
    queryFn: () => base44.entities.BusinessEntity5D.list('-created_date', 100),
    staleTime: 60000
  });

  const filtered = entities.filter(e => {
    const q = search.toLowerCase();
    const textMatch = !q || e.name?.toLowerCase().includes(q) || e.tagline?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q);
    const catMatch = categoryFilter === 'all' || e.category === categoryFilter;
    const tabMatch = tab === 'all' || 
      (tab === 'featured' && (e.is_featured || e.status === 'featured')) ||
      (tab === 'mine' && e.owner_id === currentUser?.email);
    return textMatch && catMatch && tabMatch;
  });

  const featuredEntities = entities.filter(e => e.is_featured || e.status === 'featured').slice(0, 3);

  return (
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <div className="relative h-96 md:h-[432px] overflow-hidden">
        <img src={HERO_IMAGE} alt="5D Business Entities" className="absolute inset-0 w-full h-full object-cover hero-image" data-no-filter="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium uppercase tracking-wider">5th Dimension</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            5D Business Entities
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mb-6">
            Leaders of transformational solutions — conscious businesses building the new paradigm.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button data-walkthrough-register className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Register Your Entity
            </Button>
            <Button variant="outline" className="rounded-xl gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Globe className="w-4 h-4" /> Explore Directory
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-700">{entities.length}</p>
              <p className="text-xs text-slate-500">Entities Registered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-700">{entities.filter(e => e.status === 'active' || e.status === 'featured').length}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">{Object.keys(CATEGORIES).filter(c => entities.some(e => e.category === c)).length}</p>
              <p className="text-xs text-slate-500">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-700">{entities.reduce((sum, e) => sum + (e.team_member_ids?.length || 0), 0)}</p>
              <p className="text-xs text-slate-500">Team Members</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Featured Section */}
        {featuredEntities.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Featured Entities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEntities.map(entity => (
                <BusinessEntityCard key={entity.id} entity={entity} featured />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search entities..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORIES).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Entities</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="mine">My Entities</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="admin" className="gap-1">
                <Shield className="w-3.5 h-3.5" /> Admin
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {/* Admin Panel */}
        {tab === 'admin' && currentUser?.role === 'admin' && (
          <AdminBusinessPanel />
        )}

        {/* Grid */}
        {tab !== 'admin' && isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : tab !== 'admin' && filtered.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No entities found</h3>
            <p className="text-slate-500 mb-6">Be the first to register a 5D Business Entity!</p>
            <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Register Entity
            </Button>
          </div>
        ) : tab !== 'admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(entity => (
              <BusinessEntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        ) : null}
      </div>

      <CreateBusinessModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}