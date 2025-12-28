import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import CollaboratorCard from './CollaboratorCard';

export default function CollaboratorFinder() {
  const [skillsText, setSkillsText] = React.useState('');
  const [selectedMissionId, setSelectedMissionId] = React.useState('');

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: myMissions = [] } = useQuery({
    queryKey: ['myMissions', user?.email],
    queryFn: async () => base44.entities.Mission.filter({ creator_id: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const neededSkills = React.useMemo(() => {
    const fromText = skillsText.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const fromMission = (myMissions.find(m => m.id === selectedMissionId)?.roles_needed || [])
      .map(r => String(r).toLowerCase());
    return Array.from(new Set([...fromText, ...fromMission]));
  }, [skillsText, selectedMissionId, myMissions]);

  const { data: candidates = [], isFetching, refetch } = useQuery({
    queryKey: ['collabCandidates', neededSkills],
    enabled: false,
    queryFn: async () => {
      // 1) Fetch offer skills (limit for performance)
      const allOfferSkills = await base44.entities.Skill.filter({ type: 'offer' }, '-updated_date', 200);
      const matching = allOfferSkills.filter(s => neededSkills.length === 0 || neededSkills.some(ns => s.skill_name?.toLowerCase().includes(ns)));
      const byUser = matching.reduce((acc, s) => { (acc[s.user_id] ||= []).push(s); return acc; }, {});
      const userIds = Object.keys(byUser);
      // 2) Fetch profiles for these users
      const profiles = await Promise.all(userIds.map(async (uid) => {
        const res = await base44.entities.UserProfile.filter({ user_id: uid });
        return res?.[0];
      }));
      // 3) Score
      const results = profiles.filter(Boolean).map(p => {
        const skills = byUser[p.user_id] || [];
        const score = neededSkills.length === 0 ? 50 : Math.min(100, (skills.length / neededSkills.length) * 100);
        return { profile: p, score };
      }).sort((a,b) => b.score - a.score);
      return results;
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ missionId, userId }) => {
      const mission = myMissions.find(m => m.id === missionId);
      const next = Array.from(new Set([...(mission?.participant_ids || []), userId]));
      await base44.entities.Mission.update(missionId, { participant_ids: next, participant_count: next.length });
    }
  });

  const handleSearch = () => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Skills or roles needed</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9 mt-2"
              placeholder="e.g., design, react, marketing"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Invite to Mission (optional)</Label>
          <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a mission" />
            </SelectTrigger>
            <SelectContent>
              {myMissions.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button className="w-full rounded-xl bg-violet-600 hover:bg-violet-700" onClick={handleSearch}>
            {isFetching ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Searching...</>) : 'Find Collaborators'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {candidates.length === 0 && !isFetching && (
          <p className="text-sm text-slate-500">No suggestions yet. Try adding skills or choose a mission.</p>
        )}
        {candidates.map(({ profile, score }) => (
          <CollaboratorCard
            key={profile.id}
            profile={profile}
            score={score}
            onMessage={() => {
              const evt = new CustomEvent('openFloatingChat', {
                detail: { recipientId: profile.user_id, recipientName: profile.display_name, recipientAvatar: profile.avatar_url }
              });
              document.dispatchEvent(evt);
            }}
            onInvite={() => selectedMissionId && inviteMutation.mutate({ missionId: selectedMissionId, userId: profile.user_id })}
          />
        ))}
      </div>
    </div>
  );
}