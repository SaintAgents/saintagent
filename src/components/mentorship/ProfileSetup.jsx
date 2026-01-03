import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileSetup() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: profs = [] } = useQuery({
    queryKey: ['mentorshipProfile', user?.email],
    queryFn: async () => user?.email ? base44.entities.MentorshipProfile.filter({ user_id: user.email }) : [],
    enabled: !!user?.email
  });
  const existing = profs?.[0];

  const [form, setForm] = React.useState({
    role: existing?.role || 'mentee',
    skills_offering: (existing?.skills_offering || []).join(', '),
    skills_seeking: (existing?.skills_seeking || []).join(', '),
    goals: existing?.goals || '',
    bio: existing?.bio || '',
    availability: existing?.availability || ''
  });

  React.useEffect(() => {
    if (existing) {
      setForm({
        role: existing.role || 'mentee',
        skills_offering: (existing.skills_offering || []).join(', '),
        skills_seeking: (existing.skills_seeking || []).join(', '),
        goals: existing.goals || '',
        bio: existing.bio || '',
        availability: existing.availability || ''
      });
    }
  }, [existing?.id]);

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user.email,
        role: form.role,
        skills_offering: form.skills_offering.split(',').map(s => s.trim()).filter(Boolean),
        skills_seeking: form.skills_seeking.split(',').map(s => s.trim()).filter(Boolean),
        goals: form.goals,
        bio: form.bio,
        availability: form.availability,
        status: 'active'
      };
      if (existing?.id) return base44.entities.MentorshipProfile.update(existing.id, payload);
      return base44.entities.MentorshipProfile.create(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorshipProfile'] })
  });

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Mentorship Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Role</label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="mentee">Mentee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Availability</label>
            <Input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g., Weeknights, PST" className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Skills Offering (mentor)</label>
            <Input value={form.skills_offering} onChange={(e) => setForm({ ...form, skills_offering: e.target.value })} placeholder="e.g., React, Leadership" className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Skills Seeking (mentee)</label>
            <Input value={form.skills_seeking} onChange={(e) => setForm({ ...form, skills_seeking: e.target.value })} placeholder="e.g., Product Strategy" className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-600">Goals</label>
          <Textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} placeholder="What do you want to learn or offer?" className="mt-1" rows={3} />
        </div>
        <div>
          <label className="text-sm text-slate-600">Short Bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Share a short background" className="mt-1" rows={3} />
        </div>
        <div className="text-right">
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => upsert.mutate()} disabled={upsert.isPending}>
            {existing ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}