import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users, Star, Shield, Globe, ArrowRight, Eye } from 'lucide-react';
import { createPageUrl } from '@/utils';

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

const VERIFICATION_BADGES = {
  verified: { icon: Shield, color: 'text-emerald-500', label: 'Verified' },
  premium: { icon: Star, color: 'text-amber-500', label: 'Premium' },
  basic: { icon: Shield, color: 'text-blue-400', label: 'Basic' },
};

export default function BusinessEntityCard({ entity, featured = false }) {
  const cat = CATEGORIES[entity.category] || CATEGORIES.other;
  const vBadge = VERIFICATION_BADGES[entity.verification_level];
  const teamCount = entity.team_member_ids?.length || entity.team_roles?.length || 0;

  return (
    <div
      className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        featured ? 'border-amber-300 shadow-lg shadow-amber-100/50' : 'border-slate-200 bg-white'
      }`}
      onClick={() => window.location.href = createPageUrl('BusinessEntityProfile') + `?id=${entity.id}`}
    >
      {/* Cover */}
      <div className="relative h-40 overflow-hidden">
        {entity.cover_image_url ? (
          <img src={entity.cover_image_url} alt={entity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${cat.color} text-xs`}>{cat.label}</Badge>
        </div>
        
        {/* Featured badge */}
        {(featured || entity.is_featured) && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-500 text-white text-xs gap-1"><Star className="w-3 h-3" /> Featured</Badge>
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-6 left-4">
          <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
            <AvatarImage src={entity.logo_url} />
            <AvatarFallback className="bg-violet-600 text-white font-bold text-lg">
              {entity.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate flex items-center gap-1.5">
              {entity.name}
              {vBadge && <vBadge.icon className={`w-4 h-4 ${vBadge.color} shrink-0`} />}
            </h3>
            {entity.tagline && (
              <p className="text-sm text-slate-500 truncate">{entity.tagline}</p>
            )}
          </div>
        </div>

        {entity.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{entity.description}</p>
        )}

        {/* Focus areas */}
        {entity.focus_areas?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entity.focus_areas.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
            ))}
            {entity.focus_areas.length > 3 && (
              <Badge variant="outline" className="text-xs">+{entity.focus_areas.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {entity.location && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entity.location}</span>
            )}
            {teamCount > 0 && (
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{teamCount}</span>
            )}
            {entity.view_count > 0 && (
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{entity.view_count}</span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}