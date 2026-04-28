import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, BookOpen, ArrowLeftRight, Star, Clock, Coins, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import MentorDetailSheet from './MentorDetailSheet';

const CATEGORY_COLORS = {
  business: 'bg-blue-100 text-blue-700', technology: 'bg-indigo-100 text-indigo-700',
  leadership: 'bg-amber-100 text-amber-700', spirituality: 'bg-purple-100 text-purple-700',
  healing: 'bg-emerald-100 text-emerald-700', finance: 'bg-green-100 text-green-700',
  creative: 'bg-pink-100 text-pink-700', marketing: 'bg-orange-100 text-orange-700',
  personal_growth: 'bg-teal-100 text-teal-700', other: 'bg-slate-100 text-slate-700',
};

const ROLE_CONFIG = {
  mentor: { icon: GraduationCap, label: 'Mentor', color: 'bg-violet-100 text-violet-700', gradient: 'from-violet-500 to-purple-500' },
  mentee: { icon: BookOpen, label: 'Mentee', color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-500 to-cyan-500' },
  both: { icon: ArrowLeftRight, label: 'Both', color: 'bg-amber-100 text-amber-700', gradient: 'from-amber-500 to-orange-500' },
};

export default function MentorshipCard({ profile, userProfile, score, action }) {
  const initials = (userProfile?.display_name || 'U').slice(0, 2).toUpperCase();
  const roleConfig = ROLE_CONFIG[profile.role] || ROLE_CONFIG.mentee;
  const RoleIcon = roleConfig.icon;
  const catColor = CATEGORY_COLORS[profile.category] || CATEGORY_COLORS.other;
  const offering = profile.skills_offering || [];
  const seeking = profile.skills_seeking || [];

  return (
    <MentorDetailSheet profile={profile} userProfile={userProfile} action={action}>
      <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden group border-slate-200/80">
        <CardContent className="p-0">
          <div className={`h-1 bg-gradient-to-r ${roleConfig.gradient}`} />
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={userProfile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">{initials}</AvatarFallback>
                </Avatar>
                {profile.average_rating > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <Star className="w-2 h-2 fill-white" /> {profile.average_rating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-slate-900 truncate group-hover:text-violet-600 transition-colors">
                  {userProfile?.display_name || profile.user_id}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge className={`${roleConfig.color} text-[10px] px-1.5 py-0 h-[18px] gap-0.5`}>
                    <RoleIcon className="w-2.5 h-2.5" /> {roleConfig.label}
                  </Badge>
                  <Badge className={`${catColor} text-[10px] px-1.5 py-0 h-[18px] capitalize`}>
                    {profile.category?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              {typeof score === 'number' && score > 0 && (
                <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-[11px]">{Math.round(score)}%</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && <p className="text-xs text-slate-600 line-clamp-2 mb-3">{profile.bio}</p>}

            {/* Skills pills */}
            {offering.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {offering.slice(0, 4).map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                ))}
                {offering.length > 4 && <span className="text-[10px] text-slate-400">+{offering.length - 4}</span>}
              </div>
            )}
            {seeking.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {seeking.slice(0, 4).map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{s}</span>
                ))}
                {seeking.length > 4 && <span className="text-[10px] text-slate-400">+{seeking.length - 4}</span>}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {profile.is_free ? (
                  <span className="text-emerald-600 font-medium">Free</span>
                ) : (
                  <>
                    {profile.hourly_rate_ggg > 0 && <span className="flex items-center gap-0.5"><Coins className="w-3 h-3 text-amber-500" /> {profile.hourly_rate_ggg} GGG</span>}
                    {profile.session_rate_usd > 0 && <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3 text-green-500" /> ${profile.session_rate_usd}</span>}
                  </>
                )}
                {profile.experience_years > 0 && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {profile.experience_years}yr</span>}
                {profile.sessions_completed > 0 && <span>{profile.sessions_completed} sessions</span>}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </MentorDetailSheet>
  );
}