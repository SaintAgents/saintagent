import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EndorsementsSection({ profile, currentUser }) {
  const queryClient = useQueryClient();
  const isSelf = currentUser?.email === profile?.user_id;

  // Skills offered by user (prefer Skill entity, fallback to profile.skills)
  const { data: skillRows = [] } = useQuery({
    queryKey: ['skills', profile?.user_id],
    queryFn: () => base44.entities.Skill.filter({ user_id: profile.user_id, type: 'offer' }, 'skill_name', 100),
    enabled: !!profile?.user_id,
  });
  const skills = useMemo(() => {
    const list = (skillRows?.length ? skillRows.map(s => s.skill_name) : (profile?.skills || [])) || [];
    // unique
    return Array.from(new Set(list.filter(Boolean))).sort((a,b) => a.localeCompare(b));
  }, [skillRows, profile?.skills]);

  const { data: endorsements = [] } = useQuery({
    queryKey: ['endorsements', profile?.user_id],
    queryFn: () => base44.entities.SkillEndorsement.filter({ to_user_id: profile.user_id }, '-created_date', 200),
    enabled: !!profile?.user_id,
    refetchInterval: 10000,
  });

  const myBySkill = useMemo(() => {
    const map = new Map();
    for (const e of endorsements) {
      map.set(e.skill_name, (map.get(e.skill_name) || 0) + 1);
    }
    return map;
  }, [endorsements]);

  const existingMine = useMemo(() => {
    const set = new Set((endorsements || []).filter(e => e.from_user_id === currentUser?.email).map(e => `${e.skill_name}`));
    return set;
  }, [endorsements, currentUser?.email]);

  const endorseMutation = useMutation({
    mutationFn: ({ skill }) => base44.entities.SkillEndorsement.create({ to_user_id: profile.user_id, from_user_id: currentUser.email, skill_name: skill }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['endorsements', profile.user_id] })
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <div className="text-lg font-semibold text-slate-900">Skills Endorsements</div>
          <div className="text-xs text-slate-500">Endorse skills to vouch for expertise</div>
        </div>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <div className="text-sm text-slate-500">No skills listed.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((skill) => {
              const count = myBySkill.get(skill) || 0;
              const iEndorsed = existingMine.has(skill);
              return (
                <div key={skill} className="flex items-center justify-between p-3 rounded-xl border bg-white">
                  <div>
                    <div className="font-medium text-slate-900">{skill}</div>
                    <div className="text-xs text-slate-500">{count} endorsement{count === 1 ? '' : 's'}</div>
                  </div>
                  {isSelf ? (
                    <div className="text-xs text-slate-400">Your skill</div>
                  ) : (
                    <Button
                      size="sm"
                      variant={iEndorsed ? 'outline' : 'default'}
                      className={iEndorsed ? '' : 'bg-violet-600 hover:bg-violet-700'}
                      disabled={iEndorsed || endorseMutation.isPending}
                      onClick={() => endorseMutation.mutate({ skill })}
                    >
                      {iEndorsed ? 'Endorsed' : 'Endorse'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}