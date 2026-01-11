import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import HelpHint from '@/components/hud/HelpHint';
import AIProfileEnhancer from '@/components/profile/AIProfileEnhancer';

export default function DatingSettings({ currentUser }) {
  const qc = useQueryClient();
  const [showSaved, setShowSaved] = useState(false);

  const { data: records = [] } = useQuery({
    queryKey: ['datingProfile', currentUser?.email],
    queryFn: async () => {
      const me = await base44.auth.me();
      return base44.entities.DatingProfile.filter({ user_id: me.email });
    },
    enabled: !!currentUser?.email
  });
  const existing = records?.[0];

  const defaultForm = {
    opt_in: false,
    visible: true,
    gender: '',
    interested_in: [],
    domains_enabled: {
      identity_values: true,
      emotional_stability: true,
      communication: true,
      growth: true,
      lifestyle: true,
      synchronicity: false
    },
    core_values_ranked: [],
    life_priorities: [],
    ethical_boundaries: [],
    dealbreakers: [],
    regulation_style: 'adaptive',
    conflict_response: 'direct_repair',
    stress_tolerance: 'medium',
    comm_depth: 'balanced',
    comm_frequency: 'daily',
    responsiveness_boundaries: '',
    feedback_receptivity: 'medium',
    growth_orientation: 'steady',
    learning_mindset: 'intermediate',
    long_term_vision: '',
    relationship_intent: 'companionship',
    location_mobility: 'flexible',
    daily_rhythm: 'ambivert',
    work_life_balance: 'balanced',
    health_lifestyle: '',
    synchronicity_enabled: false
  };

  const [form, setForm] = React.useState(defaultForm);

  // Sync form state when existing record loads
  React.useEffect(() => {
    if (existing) {
      setForm({
        ...defaultForm,
        ...existing,
        opt_in: existing.opt_in === true, // Ensure boolean
        visible: existing.visible !== false, // Default to true
        domains_enabled: { ...defaultForm.domains_enabled, ...(existing.domains_enabled || {}) }
      });
    }
  }, [existing?.id, existing?.opt_in, existing?.visible]);

  const upsert = useMutation({
    mutationFn: async (overridePayload) => {
      const me = await base44.auth.me();
      const payload = { ...(overridePayload || form), user_id: me.email };
      if (existing?.id) return base44.entities.DatingProfile.update(existing.id, payload);
      return base44.entities.DatingProfile.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['datingProfile'] });
      qc.invalidateQueries({ queryKey: ['datingProfilesCount'] });
      qc.invalidateQueries({ queryKey: ['allDatingProfiles'] });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
    }
  });

  // Auto-save when opt_in or visible toggles change
  const handleOptInChange = (v) => {
    const newForm = { ...form, opt_in: v };
    setForm(newForm);
    upsert.mutate(newForm);
  };

  const handleVisibleChange = (v) => {
    const newForm = { ...form, visible: v };
    setForm(newForm);
    upsert.mutate(newForm);
  };

  const toArray = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
  const fromArray = (a) => (a || []).join(', ');

  // Fetch user profile for AI enhancer
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email
  });
  const userProfile = userProfiles?.[0];

  return (
    <div className="space-y-4">
      {/* AI Profile Enhancer */}
      <AIProfileEnhancer 
        userProfile={userProfile} 
        datingProfile={existing}
        onUpdate={() => qc.invalidateQueries({ queryKey: ['datingProfile'] })}
      />

      <div className="bg-violet-50 dark:bg-slate-800/80 p-4 rounded-xl border border-violet-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.opt_in} onCheckedChange={handleOptInChange} />
          <Label className="text-slate-900 dark:text-slate-100">Opt-in to Dating & Compatibility</Label>
        </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.visible} onCheckedChange={handleVisibleChange} />
            <Label className="text-slate-900 dark:text-slate-100">Visible to compatible users</Label>
          </div>
        </div>
        <Link to={createPageUrl('MatchSettings')}>
          <Button variant="outline" size="sm" className="rounded-lg gap-2">
            <Settings className="w-4 h-4" />
            Match Weights
          </Button>
        </Link>
      </div>

      {/* Gender & Interested In - Critical for matching */}
      <div className="grid md:grid-cols-2 gap-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800/30">
        <div className="space-y-3">
          <Label className="text-slate-900 dark:text-slate-100 font-medium">I am a...</Label>
          <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue placeholder="Select your gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="man">Man</SelectItem>
              <SelectItem value="woman">Woman</SelectItem>
              <SelectItem value="non_binary">Non-binary</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-slate-900 dark:text-slate-100 font-medium">I'm interested in...</Label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'women', label: 'Women' },
              { value: 'men', label: 'Men' },
              { value: 'non_binary', label: 'Non-binary' },
              { value: 'all', label: 'Everyone' }
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.interested_in.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    if (opt.value === 'all') {
                      setForm({ ...form, interested_in: checked ? ['all'] : [] });
                    } else {
                      const newInterests = checked
                        ? [...form.interested_in.filter(v => v !== 'all'), opt.value]
                        : form.interested_in.filter(v => v !== opt.value);
                      setForm({ ...form, interested_in: newInterests });
                    }
                  }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-slate-900 dark:text-slate-100">Core Values (comma-separated)</Label>
          <Input value={fromArray(form.core_values_ranked)} onChange={(e) => setForm({ ...form, core_values_ranked: toArray(e.target.value) })} className="bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600" />
          <Label className="text-slate-900 dark:text-slate-100">Life Priorities (comma-separated)</Label>
          <Input value={fromArray(form.life_priorities)} onChange={(e) => setForm({ ...form, life_priorities: toArray(e.target.value) })} className="bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600" />
          <Label className="text-slate-900 dark:text-slate-100">Dealbreakers (comma-separated)</Label>
          <Input value={fromArray(form.dealbreakers)} onChange={(e) => setForm({ ...form, dealbreakers: toArray(e.target.value) })} className="bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600" />
          <Label className="text-slate-900 dark:text-slate-100">Ethical Boundaries (comma-separated)</Label>
          <Input value={fromArray(form.ethical_boundaries)} onChange={(e) => setForm({ ...form, ethical_boundaries: toArray(e.target.value) })} className="bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600" />
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Regulation Style</Label>
              <Select value={form.regulation_style} onValueChange={(v) => setForm({ ...form, regulation_style: v })}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm_regulator">Calm Regulator</SelectItem>
                  <SelectItem value="expressive_processor">Expressive Processor</SelectItem>
                  <SelectItem value="internal_processor">Internal Processor</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Conflict Response</Label>
              <Select value={form.conflict_response} onValueChange={(v) => setForm({ ...form, conflict_response: v })}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_repair">Direct Repair</SelectItem>
                  <SelectItem value="reflective_space">Reflective Space</SelectItem>
                  <SelectItem value="avoidant">Avoidant</SelectItem>
                  <SelectItem value="assertive">Assertive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Stress Tolerance</Label>
              <Select value={form.stress_tolerance} onValueChange={(v) => setForm({ ...form, stress_tolerance: v })}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Feedback Receptivity</Label>
              <Select value={form.feedback_receptivity} onValueChange={(v) => setForm({ ...form, feedback_receptivity: v })}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Comm. Depth</Label>
              <Select value={form.comm_depth} onValueChange={(v) => setForm({ ...form, comm_depth: v })}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-900 dark:text-slate-100">Comm. Frequency</Label>
              <Select value={form.comm_frequency} onValueChange={(v) => setForm({ ...form, comm_frequency: v })}>
                <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="few_times_week">Few times/week</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Label className="inline-flex items-center gap-1 text-slate-900 dark:text-slate-100">
              Responsiveness Boundaries
              <HelpHint content="Share your digital boundaries to ensure conscious and respectful communication with your matches. E.g., 'Within 24 hours' or 'Weekdays only'." />
            </Label>
          <Input value={form.responsiveness_boundaries} onChange={(e) => setForm({ ...form, responsiveness_boundaries: e.target.value })} className="bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-slate-900 dark:text-slate-100">Growth Orientation</Label>
          <Select value={form.growth_orientation} onValueChange={(v) => setForm({ ...form, growth_orientation: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="steady">Steady</SelectItem>
              <SelectItem value="accelerated">Accelerated</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-900 dark:text-slate-100">Relationship Intent</Label>
          <Select value={form.relationship_intent} onValueChange={(v) => setForm({ ...form, relationship_intent: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="companionship">Companionship</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="co_creation">Co-creation</SelectItem>
              <SelectItem value="undecided">Undecided</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-900 dark:text-slate-100">Learning Mindset</Label>
          <Select value={form.learning_mindset} onValueChange={(v) => setForm({ ...form, learning_mindset: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label className="text-slate-900 dark:text-slate-100">Location/Mobility</Label>
          <Select value={form.location_mobility} onValueChange={(v) => setForm({ ...form, location_mobility: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="nomadic">Nomadic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-900 dark:text-slate-100">Daily Rhythm</Label>
          <Select value={form.daily_rhythm} onValueChange={(v) => setForm({ ...form, daily_rhythm: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="introvert">Introvert</SelectItem>
              <SelectItem value="ambivert">Ambivert</SelectItem>
              <SelectItem value="extrovert">Extrovert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-900 dark:text-slate-100">Work/Life Balance</Label>
          <Select value={form.work_life_balance} onValueChange={(v) => setForm({ ...form, work_life_balance: v })}>
            <SelectTrigger className="dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="work_leaning">Work-leaning</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="life_leaning">Life-leaning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-slate-900 dark:text-slate-100">Health & Lifestyle (optional)</Label>
        <Textarea rows={2} value={form.health_lifestyle} onChange={(e) => setForm({ ...form, health_lifestyle: e.target.value })} className="bg-white dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600" />
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={form.synchronicity_enabled} onCheckedChange={(v) => setForm({ ...form, synchronicity_enabled: v })} />
        <Label className="text-slate-900 dark:text-slate-100">Enable Synchronicity Signals</Label>
      </div>

      <div className="flex items-center justify-end gap-3">
        {showSaved && (
          <span className="flex items-center gap-1 text-sm text-teal-600 font-medium animate-in fade-in duration-200">
            <Check className="w-4 h-4" />
            Settings Saved
          </span>
        )}
        <Button 
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9" 
          onClick={() => upsert.mutate()}
          disabled={upsert.isPending}
        >
          {upsert.isPending ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
      </div>
    </div>);

}