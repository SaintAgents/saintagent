import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, BookOpen, ArrowLeftRight, Star, Clock, Coins, DollarSign, MapPin, Calendar } from 'lucide-react';

const CATEGORY_COLORS = {
  business: 'bg-blue-100 text-blue-700',
  technology: 'bg-indigo-100 text-indigo-700',
  leadership: 'bg-amber-100 text-amber-700',
  spirituality: 'bg-purple-100 text-purple-700',
  healing: 'bg-emerald-100 text-emerald-700',
  finance: 'bg-green-100 text-green-700',
  creative: 'bg-pink-100 text-pink-700',
  marketing: 'bg-orange-100 text-orange-700',
  personal_growth: 'bg-teal-100 text-teal-700',
  other: 'bg-slate-100 text-slate-700',
};

const ROLE_CONFIG = {
  mentor: { icon: GraduationCap, label: 'Mentor', color: 'bg-violet-100 text-violet-700' },
  mentee: { icon: BookOpen, label: 'Mentee', color: 'bg-blue-100 text-blue-700' },
  both: { icon: ArrowLeftRight, label: 'Mentor & Mentee', color: 'bg-amber-100 text-amber-700' },
};

export default function MentorshipCard({ profile, userProfile, score, action }) {
  const initials = (userProfile?.display_name || 'U').slice(0, 2).toUpperCase();
  const roleConfig = ROLE_CONFIG[profile.role] || ROLE_CONFIG.mentee;
  const RoleIcon = roleConfig.icon;
  const catColor = CATEGORY_COLORS[profile.category] || CATEGORY_COLORS.other;
  const catLabel = profile.category?.replace(/_/g, ' ');

  const offering = profile.skills_offering || [];
  const seeking = profile.skills_seeking || [];

  return (
    <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardContent className="p-0">
        {/* Top color bar */}
        <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative cursor-pointer" data-user-id={profile.user_id}>
              <Avatar className="w-14 h-14 border-2 border-violet-200">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-violet-100 text-violet-700 font-bold text-lg">{initials}</AvatarFallback>
              </Avatar>
              {profile.average_rating > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-white" /> {profile.average_rating.toFixed(1)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 truncate cursor-pointer hover:text-violet-600" data-user-id={profile.user_id}>
                  {userProfile?.display_name || profile.user_id}
                </h3>
                <Badge className={`${roleConfig.color} text-[10px] px-2 py-0 h-5 gap-1`}>
                  <RoleIcon className="w-3 h-3" /> {roleConfig.label}
                </Badge>
              </div>
              {userProfile?.handle && (
                <p className="text-xs text-slate-500">@{userProfile.handle}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={`${catColor} text-[10px] px-2 py-0 h-5 capitalize`}>{catLabel}</Badge>
                {profile.experience_years > 0 && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {profile.experience_years}yr exp
                  </span>
                )}
                {profile.sessions_completed > 0 && (
                  <span className="text-[11px] text-slate-500">{profile.sessions_completed} sessions</span>
                )}
              </div>
            </div>
            {/* Match Score */}
            {typeof score === 'number' && score > 0 && (
              <div className="text-center shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{Math.round(score)}%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Match</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{profile.bio}</p>
          )}

          {/* Skills Offering */}
          {offering.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Offering</p>
              <div className="flex flex-wrap gap-1">
                {offering.slice(0, 5).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0">{s}</Badge>
                ))}
                {offering.length > 5 && <span className="text-[11px] text-slate-400">+{offering.length - 5}</span>}
              </div>
            </div>
          )}

          {/* Skills Seeking */}
          {seeking.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Seeking</p>
              <div className="flex flex-wrap gap-1">
                {seeking.slice(0, 5).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200 px-2 py-0">{s}</Badge>
                ))}
                {seeking.length > 5 && <span className="text-[11px] text-slate-400">+{seeking.length - 5}</span>}
              </div>
            </div>
          )}

          {/* Pricing & Availability */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {profile.is_free ? (
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">Free</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  {profile.hourly_rate_ggg > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs gap-1">
                      <Coins className="w-3 h-3" /> {profile.hourly_rate_ggg} GGG
                    </Badge>
                  )}
                  {profile.session_rate_usd > 0 && (
                    <Badge className="bg-green-100 text-green-700 text-xs gap-1">
                      <DollarSign className="w-3 h-3" /> ${profile.session_rate_usd}
                    </Badge>
                  )}
                </div>
              )}
              {profile.availability && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {profile.availability}
                </span>
              )}
            </div>
            <div>
              {action}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}