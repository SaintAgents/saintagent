import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Heart, Target } from 'lucide-react';

const REL_STATUS = [
  'single', 'dating', 'committed', 'married', 'open', 'complicated', 'prefer_not_to_say'
];

const REL_TYPES = [
  'monogamous','polyamorous','open','casual','long_term','friendship','life_partner','not_seeking'
];

export default function ConnectionPreferencesEditor({ profile }) {
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [status, setStatus] = useState(profile?.relationship_status || 'prefer_not_to_say');
  const [types, setTypes] = useState(profile?.relationship_type_seeking || []);
  const [seeking, setSeeking] = useState(profile?.qualities_seeking || []);
  const [providing, setProviding] = useState(profile?.qualities_providing || []);
  const [newSeek, setNewSeek] = useState('');
  const [newProvide, setNewProvide] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(profile.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userProfile'] });
      setEdit(false);
    }
  });

  const toggleType = (t) => {
    setTypes((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };
  const addSeek = () => {
    const v = newSeek.trim();
    if (!v) return; if (seeking.includes(v)) return; setSeeking([...seeking, v]); setNewSeek('');
  };
  const addProvide = () => {
    const v = newProvide.trim();
    if (!v) return; if (providing.includes(v)) return; setProviding([...providing, v]); setNewProvide('');
  };

  const save = () => {
    updateMutation.mutate({
      relationship_status: status,
      relationship_type_seeking: types,
      qualities_seeking: seeking,
      qualities_providing: providing
    });
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          Connection Preferences
        </CardTitle>
        <div className="flex gap-2">
          {edit ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEdit(false)}>Cancel</Button>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={save} disabled={updateMutation.isPending}>Save</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEdit(true)}>Edit</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!edit ? (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-500">Status</Label>
              <div className="mt-1">
                <Badge className="bg-rose-100 text-rose-700 capitalize">{(profile.relationship_status || 'prefer_not_to_say').replace(/_/g, ' ')}</Badge>
              </div>
            </div>
            {profile.relationship_type_seeking?.length > 0 && (
              <div>
                <Label className="text-slate-500">Open to</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.relationship_type_seeking.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs capitalize">{t.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.qualities_seeking?.length > 0 && (
              <div>
                <Label className="text-slate-500">Seeking in Others</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.qualities_seeking.map((q, i) => (
                    <Badge key={i} className="bg-rose-50 text-rose-700">{q}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.qualities_providing?.length > 0 && (
              <div>
                <Label className="text-slate-500">What I Provide</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {profile.qualities_providing.map((q, i) => (
                    <Badge key={i} className="bg-violet-50 text-violet-700">{q}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-2 w-full"><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {REL_STATUS.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Open to</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {REL_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={types.includes(t)} onCheckedChange={() => toggleType(t)} />
                    <span className="capitalize">{t.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Seeking in Others</Label>
              <div className="mt-2 flex gap-2">
                <Input value={newSeek} onChange={(e) => setNewSeek(e.target.value)} placeholder="Add quality..." onKeyDown={(e) => { if (e.key === 'Enter') addSeek(); }} />
                <Button variant="outline" onClick={addSeek}>Add</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {seeking.map((q, i) => (
                  <Badge key={i} className="bg-rose-50 text-rose-700 gap-1 pr-1">
                    {q}
                    <button className="rounded-full hover:bg-rose-100 px-1" onClick={() => setSeeking(seeking.filter((x, idx) => idx !== i))}>×</button>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>What I Provide</Label>
              <div className="mt-2 flex gap-2">
                <Input value={newProvide} onChange={(e) => setNewProvide(e.target.value)} placeholder="Add quality..." onKeyDown={(e) => { if (e.key === 'Enter') addProvide(); }} />
                <Button variant="outline" onClick={addProvide}>Add</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {providing.map((q, i) => (
                  <Badge key={i} className="bg-violet-50 text-violet-700 gap-1 pr-1">
                    {q}
                    <button className="rounded-full hover:bg-violet-100 px-1" onClick={() => setProviding(providing.filter((x, idx) => idx !== i))}>×</button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}