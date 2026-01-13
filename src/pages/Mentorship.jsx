import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProfileSetup from '@/components/mentorship/ProfileSetup';
import MentorCard from '@/components/mentorship/MentorCard';
import SessionForm from '@/components/mentorship/SessionForm';
import SessionList from '@/components/mentorship/SessionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

function useUserAndProfiles() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: myProf = [] } = useQuery({ queryKey: ['mentorshipProfile', user?.email], queryFn: async () => user?.email ? base44.entities.MentorshipProfile.filter({ user_id: user.email }) : [], enabled: !!user?.email });
  const meProf = myProf?.[0];
  const { data: allProfiles = [] } = useQuery({ queryKey: ['mentorshipProfilesAll'], queryFn: () => base44.entities.MentorshipProfile.list('-updated_date', 200) });
  const { data: allUserProfiles = [] } = useQuery({ queryKey: ['userProfilesAll'], queryFn: () => base44.entities.UserProfile.list('-updated_date', 500) });
  const userProfileMap = React.useMemo(() => Object.fromEntries((allUserProfiles || []).map(p => [p.user_id, p])), [allUserProfiles]);
  return { user, meProf, allProfiles, userProfileMap };
}

function scoreMatch(meProf, otherProf, userProfileMap) {
  if (!meProf || !otherProf) return 0;
  // mentee -> mentor match by default
  const seeker = meProf.role === 'mentee' ? meProf.skills_seeking || [] : meProf.skills_offering || [];
  const provider = otherProf.role === 'mentor' ? otherProf.skills_offering || [] : otherProf.skills_seeking || [];
  const overlap = seeker.filter(s => provider.map(p => p.toLowerCase()).includes(s.toLowerCase()));
  let score = overlap.length * 15; // skills weight
  if (meProf.goals && otherProf.goals) score += 10; // simple goals presence
  const rp = userProfileMap[otherProf.user_id]?.rp_points || 0;
  score += Math.min(25, rp / 100); // reputation weight
  return Math.max(0, Math.min(100, score));
}

export default function Mentorship() {
  const qc = useQueryClient();
  const { user, meProf, allProfiles, userProfileMap } = useUserAndProfiles();

  const others = (allProfiles || []).filter(p => p.user_id !== user?.email && p.status !== 'inactive');
  const candidates = meProf?.role === 'mentee' ? others.filter(p => p.role === 'mentor') : others.filter(p => p.role === 'mentee');
  const ranked = candidates.map(p => ({ profile: p, score: scoreMatch(meProf, p, userProfileMap) })).sort((a,b) => b.score - a.score).slice(0, 20);

  const createSession = useMutation({
    mutationFn: async ({ mentorId, menteeId, data }) => base44.entities.MentorshipSession.create({
      mentor_id: mentorId,
      mentee_id: menteeId,
      mentor_name: userProfileMap[mentorId]?.display_name,
      mentee_name: userProfileMap[menteeId]?.display_name,
      mentor_avatar: userProfileMap[mentorId]?.avatar_url,
      mentee_avatar: userProfileMap[menteeId]?.avatar_url,
      requested_time: new Date().toISOString(),
      status: data.scheduled_time ? 'scheduled' : 'requested',
      scheduled_time: data.scheduled_time || undefined,
      duration_minutes: data.duration_minutes || 60,
      objectives: data.objectives || ''
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorshipSessions'] })
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/004244915_ideogram-v30_Heres_a_clean_high-concept_image_prompt_for_a_gamification_hub_that_fits_sain-4.jpg"
          alt="Mentorship"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <Users className="w-8 h-8 text-violet-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                Mentorship
              </h1>
              <ForwardButton currentPage="Mentorship" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.04] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-violet-200/90 text-base tracking-wider drop-shadow-lg">
                Find Mentors · Share Knowledge · Grow Together
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <ProfileSetup />
        </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="discover">
          {!meProf && <p className="text-sm text-slate-500">Create your mentorship profile to get matches.</p>}
          {meProf && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ranked.length === 0 && <p className="text-sm text-slate-500">No matches yet</p>}
              {ranked.map(({ profile, score }) => {
                const up = userProfileMap[profile.user_id];
                return (
                  <MentorCard
                    key={profile.id}
                    profile={profile}
                    userProfile={up}
                    score={score}
                    onRequest={() => {
                      const mentorId = meProf.role === 'mentee' ? profile.user_id : meProf.user_id;
                      const menteeId = meProf.role === 'mentee' ? meProf.user_id : profile.user_id;
                      createSession.mutate({ mentorId, menteeId, data: {} });
                    }}
                    action={
                      <SessionForm
                        trigger={<Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700">Request Session</Button>}
                        onSubmit={(data) => {
                          const mentorId = meProf.role === 'mentee' ? profile.user_id : meProf.user_id;
                          const menteeId = meProf.role === 'mentee' ? meProf.user_id : profile.user_id;
                          createSession.mutate({ mentorId, menteeId, data });
                        }}
                      />
                    }
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions">
          <SessionList />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}