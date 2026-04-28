import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap, BookOpen, ArrowLeftRight, Star, Clock, Coins, DollarSign, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import MentorReviewsList from './MentorReviewsList';

const ROLE_CONFIG = {
  mentor: { icon: GraduationCap, label: 'Mentor', color: 'bg-violet-100 text-violet-700' },
  mentee: { icon: BookOpen, label: 'Mentee', color: 'bg-blue-100 text-blue-700' },
  both: { icon: ArrowLeftRight, label: 'Mentor & Mentee', color: 'bg-amber-100 text-amber-700' },
};

const CATEGORY_COLORS = {
  business: 'bg-blue-100 text-blue-700', technology: 'bg-indigo-100 text-indigo-700',
  leadership: 'bg-amber-100 text-amber-700', spirituality: 'bg-purple-100 text-purple-700',
  healing: 'bg-emerald-100 text-emerald-700', finance: 'bg-green-100 text-green-700',
  creative: 'bg-pink-100 text-pink-700', marketing: 'bg-orange-100 text-orange-700',
  personal_growth: 'bg-teal-100 text-teal-700', other: 'bg-slate-100 text-slate-700',
};

export default function MentorDetailSheet({ profile, userProfile, action, children }) {
  const roleConfig = ROLE_CONFIG[profile.role] || ROLE_CONFIG.mentee;
  const RoleIcon = roleConfig.icon;
  const catColor = CATEGORY_COLORS[profile.category] || CATEGORY_COLORS.other;
  const initials = (userProfile?.display_name || 'U').slice(0, 2).toUpperCase();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-2 border-violet-200">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-violet-100 text-violet-700 font-bold text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{userProfile?.display_name || profile.user_id}</h2>
                {userProfile?.handle && <p className="text-sm text-slate-500">@{userProfile.handle}</p>}
                <div className="flex gap-2 mt-1">
                  <Badge className={`${roleConfig.color} text-xs gap-1`}><RoleIcon className="w-3 h-3" /> {roleConfig.label}</Badge>
                  <Badge className={`${catColor} text-xs capitalize`}>{profile.category?.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{profile.experience_years || 0}</p>
                <p className="text-[10px] text-slate-500">Years Exp</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <MessageSquare className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{profile.sessions_completed || 0}</p>
                <p className="text-[10px] text-slate-500">Sessions</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-700">{profile.average_rating > 0 ? profile.average_rating.toFixed(1) : '—'}</p>
                <p className="text-[10px] text-slate-500">Rating</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Goals */}
            {profile.goals && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Goals</h3>
                <p className="text-sm text-slate-700">{profile.goals}</p>
              </div>
            )}

            {/* Skills */}
            {(profile.skills_offering || []).length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Skills Offered</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills_offering.map((s, i) => (
                    <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {(profile.skills_seeking || []).length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Skills Seeking</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills_seeking.map((s, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pricing</h3>
              {profile.is_free ? (
                <Badge className="bg-emerald-100 text-emerald-700">Free Mentorship</Badge>
              ) : (
                <div className="flex gap-3">
                  {profile.hourly_rate_ggg > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 gap-1"><Coins className="w-3 h-3" /> {profile.hourly_rate_ggg} GGG/session</Badge>
                  )}
                  {profile.session_rate_usd > 0 && (
                    <Badge className="bg-green-100 text-green-700 gap-1"><DollarSign className="w-3 h-3" /> ${profile.session_rate_usd}/session</Badge>
                  )}
                </div>
              )}
              {profile.availability && (
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {profile.availability}</p>
              )}
            </div>

            {/* Action */}
            <div className="mb-6">{action}</div>

            {/* Reviews */}
            {(profile.role === 'mentor' || profile.role === 'both') && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Reviews</h3>
                <MentorReviewsList mentorId={profile.user_id} />
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}