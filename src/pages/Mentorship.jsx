import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, GraduationCap, BookOpen, ArrowLeftRight, Search, Plus, SlidersHorizontal, Sparkles, CalendarDays, Star } from 'lucide-react';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';
import MentorshipProfileForm from '@/components/mentorship/MentorshipProfileForm';
import MentorshipCard from '@/components/mentorship/MentorshipCard';
import SessionForm from '@/components/mentorship/SessionForm';
import SessionList from '@/components/mentorship/SessionList';

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'spirituality', label: 'Spirituality' },
  { value: 'healing', label: 'Healing & Wellness' },
  { value: 'finance', label: 'Finance & Crypto' },
  { value: 'creative', label: 'Creative Arts' },
  { value: 'marketing', label: 'Marketing & Growth' },
  { value: 'personal_growth', label: 'Personal Growth' },
];

function scoreMatch(meProf, otherProf, userProfileMap) {
  if (!meProf || !otherProf) return 0;
  const seeker = meProf.role === 'mentee' ? meProf.skills_seeking || [] : meProf.skills_offering || [];
  const provider = otherProf.role === 'mentor' ? otherProf.skills_offering || [] : otherProf.skills_seeking || [];
  const overlap = seeker.filter(s => provider.map(p => p.toLowerCase()).includes(s.toLowerCase()));
  let score = overlap.length * 15;
  if (meProf.goals && otherProf.goals) score += 10;
  const rp = userProfileMap[otherProf.user_id]?.rp_points || 0;
  score += Math.min(25, rp / 100);
  if (meProf.category === otherProf.category) score += 15;
  return Math.max(0, Math.min(100, score));
}

export default function Mentorship() {
  const qc = useQueryClient();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: myProf = [] } = useQuery({
    queryKey: ['mentorshipProfile', user?.email],
    queryFn: () => base44.entities.MentorshipProfile.filter({ user_id: user.email }),
    enabled: !!user?.email,
  });
  const meProf = myProf?.[0];

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['mentorshipProfilesAll'],
    queryFn: () => base44.entities.MentorshipProfile.filter({ status: 'active' }, '-updated_date', 200),
  });

  const { data: allUserProfiles = [] } = useQuery({
    queryKey: ['userProfilesAll'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 500),
  });

  const userProfileMap = React.useMemo(
    () => Object.fromEntries((allUserProfiles || []).map(p => [p.user_id, p])),
    [allUserProfiles]
  );

  const others = (allProfiles || []).filter(p => p.user_id !== user?.email);

  const filtered = others.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const up = userProfileMap[p.user_id];
      const text = [up?.display_name, up?.handle, p.bio, p.goals, ...(p.skills_offering || []), ...(p.skills_seeking || [])].join(' ').toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  const ranked = filtered
    .map(p => ({ profile: p, score: meProf ? scoreMatch(meProf, p, userProfileMap) : 0 }))
    .sort((a, b) => b.score - a.score);

  const mentors = ranked.filter(r => r.profile.role === 'mentor' || r.profile.role === 'both');
  const mentees = ranked.filter(r => r.profile.role === 'mentee' || r.profile.role === 'both');

  const createSession = useMutation({
    mutationFn: async ({ mentorId, menteeId, data }) => base44.entities.MentorshipSession.create({
      mentor_id: mentorId, mentee_id: menteeId,
      mentor_name: userProfileMap[mentorId]?.display_name,
      mentee_name: userProfileMap[menteeId]?.display_name,
      mentor_avatar: userProfileMap[mentorId]?.avatar_url,
      mentee_avatar: userProfileMap[menteeId]?.avatar_url,
      requested_time: new Date().toISOString(),
      status: data.scheduled_time ? 'scheduled' : 'requested',
      scheduled_time: data.scheduled_time || undefined,
      duration_minutes: data.duration_minutes || 60,
      objectives: data.objectives || '',
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorshipSessions'] }),
  });

  const makeAction = (profile) => {
    if (!meProf) return <Button size="sm" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setShowProfileForm(true); }}>Create Profile First</Button>;
    const mentorId = profile.role === 'mentor' ? profile.user_id : meProf.user_id;
    const menteeId = profile.role === 'mentee' ? profile.user_id : meProf.user_id;
    return (
      <div onClick={e => e.stopPropagation()}>
        <SessionForm
          trigger={<Button className="w-full bg-violet-600 hover:bg-violet-700 gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Book Session</Button>}
          onSubmit={(data) => createSession.mutate({ mentorId, menteeId, data })}
        />
      </div>
    );
  };

  const totalMentors = allProfiles.filter(p => p.role === 'mentor' || p.role === 'both').length;
  const totalMentees = allProfiles.filter(p => p.role === 'mentee' || p.role === 'both').length;
  const totalSessions = allProfiles.reduce((s, p) => s + (p.sessions_completed || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 relative">
      {/* Hero */}
      <div className="page-hero relative overflow-hidden">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c7e50f7bf_universal_upscale_0_616bb1f7-8a11-4de2-bec2-b326e9e4b195_0.jpg"
          alt="Mentorship" className="w-full h-full object-cover object-center hero-image" data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-slate-50" />
        <HeroGalleryTrigger startIndex={0} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3" />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <GraduationCap className="w-8 h-8 text-violet-300" />
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                Mentorship
              </h1>
              <ForwardButton currentPage="Mentorship" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <p className="text-violet-200/90 text-sm md:text-base tracking-wider">
              Find Mentors · Share Knowledge · Grow Together
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: GraduationCap, label: 'Mentors', value: totalMentors, color: 'text-violet-500' },
            { icon: BookOpen, label: 'Mentees', value: totalMentees, color: 'text-blue-500' },
            { icon: CalendarDays, label: 'Sessions', value: totalSessions, color: 'text-emerald-500' },
            { icon: Star, label: 'Avg Rating', value: '4.8', color: 'text-amber-500' },
          ].map((s, i) => (
            <Card key={i} className="border-slate-200/80">
              <CardContent className="p-3 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Profile CTA */}
        {!meProf && !showProfileForm && (
          <Card className="border-dashed border-2 border-violet-300 bg-violet-50/50">
            <CardContent className="p-6 text-center">
              <GraduationCap className="w-10 h-10 text-violet-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 mb-1">Join the Mentorship Network</h3>
              <p className="text-sm text-slate-500 mb-3">Create your profile to connect as a mentor, mentee, or both.</p>
              <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={() => setShowProfileForm(true)}>
                <Plus className="w-4 h-4" /> Create Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {meProf && !showProfileForm && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-violet-100 text-violet-700 capitalize gap-1">
                {meProf.role === 'both' ? 'Mentor & Mentee' : meProf.role}
              </Badge>
              <Badge variant="outline" className="capitalize">{meProf.category?.replace(/_/g, ' ')}</Badge>
              {meProf.is_free && <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowProfileForm(true)}>Edit Profile</Button>
          </div>
        )}

        {showProfileForm && (
          <div>
            <MentorshipProfileForm onComplete={() => setShowProfileForm(false)} />
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowProfileForm(false)}>Cancel</Button>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="mentors">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="mentors" className="gap-1 text-xs"><GraduationCap className="w-3.5 h-3.5" /> Mentors</TabsTrigger>
              <TabsTrigger value="mentees" className="gap-1 text-xs"><BookOpen className="w-3.5 h-3.5" /> Mentees</TabsTrigger>
              <TabsTrigger value="all" className="gap-1 text-xs"><Users className="w-3.5 h-3.5" /> All</TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1 text-xs"><CalendarDays className="w-3.5 h-3.5" /> My Sessions</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search mentors, skills..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-9"><SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-slate-400" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_FILTERS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {['mentors', 'mentees', 'all'].map(tab => {
            const list = tab === 'mentors' ? mentors : tab === 'mentees' ? mentees : ranked;
            return (
              <TabsContent key={tab} value={tab}>
                {list.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No profiles found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map(({ profile, score }) => (
                      <MentorshipCard key={profile.id} profile={profile} userProfile={userProfileMap[profile.user_id]} score={meProf ? score : undefined} action={makeAction(profile)} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}

          <TabsContent value="sessions">
            <SessionList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}