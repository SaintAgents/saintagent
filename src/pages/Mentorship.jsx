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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mentorship</h1>
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
  );
}