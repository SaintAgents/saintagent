import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, X, GraduationCap, BookOpen, ArrowLeftRight, Plus } from 'lucide-react';

const CATEGORIES = [
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'spirituality', label: 'Spirituality' },
  { value: 'healing', label: 'Healing & Wellness' },
  { value: 'finance', label: 'Finance & Crypto' },
  { value: 'creative', label: 'Creative Arts' },
  { value: 'marketing', label: 'Marketing & Growth' },
  { value: 'personal_growth', label: 'Personal Growth' },
  { value: 'other', label: 'Other' },
];

const ROLE_OPTIONS = [
  { value: 'mentor', label: 'Mentor', icon: GraduationCap, desc: 'I want to teach & guide others' },
  { value: 'mentee', label: 'Mentee', icon: BookOpen, desc: 'I want to learn & grow' },
  { value: 'both', label: 'Both', icon: ArrowLeftRight, desc: 'I can teach some things & learn others' },
];

export default function MentorshipProfileForm({ onComplete }) {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: profs = [] } = useQuery({
    queryKey: ['mentorshipProfile', user?.email],
    queryFn: () => base44.entities.MentorshipProfile.filter({ user_id: user.email }),
    enabled: !!user?.email,
  });
  const existing = profs?.[0];

  const [form, setForm] = useState({
    role: 'mentee',
    skills_offering: '',
    skills_seeking: '',
    goals: '',
    bio: '',
    availability: '',
    hourly_rate_ggg: 0,
    session_rate_usd: 0,
    is_free: true,
    category: 'other',
    experience_years: 0,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        role: existing.role || 'mentee',
        skills_offering: (existing.skills_offering || []).join(', '),
        skills_seeking: (existing.skills_seeking || []).join(', '),
        goals: existing.goals || '',
        bio: existing.bio || '',
        availability: existing.availability || '',
        hourly_rate_ggg: existing.hourly_rate_ggg || 0,
        session_rate_usd: existing.session_rate_usd || 0,
        is_free: existing.is_free ?? true,
        category: existing.category || 'other',
        experience_years: existing.experience_years || 0,
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
        hourly_rate_ggg: Number(form.hourly_rate_ggg) || 0,
        session_rate_usd: Number(form.session_rate_usd) || 0,
        is_free: form.is_free,
        category: form.category,
        experience_years: Number(form.experience_years) || 0,
        status: 'active',
      };
      if (existing?.id) return base44.entities.MentorshipProfile.update(existing.id, payload);
      return base44.entities.MentorshipProfile.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mentorshipProfile'] });
      qc.invalidateQueries({ queryKey: ['mentorshipProfilesAll'] });
      onComplete?.();
    },
  });

  const showOffering = form.role === 'mentor' || form.role === 'both';
  const showSeeking = form.role === 'mentee' || form.role === 'both';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-violet-600" />
          {existing ? 'Edit Mentorship Profile' : 'Create Mentorship Profile'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selection - Visual Cards */}
        <div>
          <Label className="text-sm font-medium mb-3 block">I want to be a...</Label>
          <div className="grid grid-cols-3 gap-3">
            {ROLE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const active = form.role === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    active ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${active ? 'text-violet-600' : 'text-slate-400'}`} />
                  <p className={`font-semibold text-sm ${active ? 'text-violet-700' : 'text-slate-700'}`}>{opt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Category</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Years of Experience</Label>
            <Input type="number" min={0} value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} className="mt-1" />
          </div>
        </div>

        {/* Skills */}
        {showOffering && (
          <div>
            <Label className="text-sm">Skills I Offer <span className="text-slate-400">(comma separated)</span></Label>
            <Input value={form.skills_offering} onChange={e => setForm({ ...form, skills_offering: e.target.value })} placeholder="e.g., React, Leadership, Meditation" className="mt-1" />
          </div>
        )}
        {showSeeking && (
          <div>
            <Label className="text-sm">Skills I'm Seeking <span className="text-slate-400">(comma separated)</span></Label>
            <Input value={form.skills_seeking} onChange={e => setForm({ ...form, skills_seeking: e.target.value })} placeholder="e.g., Product Strategy, Public Speaking" className="mt-1" />
          </div>
        )}

        {/* Pricing */}
        {showOffering && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Offer Free Mentorship</Label>
              <Switch checked={form.is_free} onCheckedChange={v => setForm({ ...form, is_free: v })} />
            </div>
            {!form.is_free && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">Rate per session (GGG)</Label>
                  <Input type="number" min={0} value={form.hourly_rate_ggg} onChange={e => setForm({ ...form, hourly_rate_ggg: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Rate per session (USD)</Label>
                  <Input type="number" min={0} step={5} value={form.session_rate_usd} onChange={e => setForm({ ...form, session_rate_usd: e.target.value })} className="mt-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bio & Goals */}
        <div>
          <Label className="text-sm">Bio</Label>
          <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell potential mentors/mentees about yourself..." className="mt-1" rows={3} />
        </div>
        <div>
          <Label className="text-sm">Goals</Label>
          <Textarea value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} placeholder="What do you hope to achieve?" className="mt-1" rows={2} />
        </div>
        <div>
          <Label className="text-sm">Availability</Label>
          <Input value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} placeholder="e.g., Weekday evenings, MST" className="mt-1" />
        </div>

        <Button className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={() => upsert.mutate()} disabled={upsert.isPending}>
          <Save className="w-4 h-4" />
          {existing ? 'Update Profile' : 'Create Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}