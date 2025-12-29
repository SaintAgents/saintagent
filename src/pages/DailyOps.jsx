import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Plus, Check, Clock, Pencil, Save, Trash2 } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';

export default function DailyOps() {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Auth
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  // Load or create DailyLog for the selected date
  const { data: dailyLogs = [] } = useQuery({
    queryKey: ['dailyLog', user?.email, selectedDate],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.DailyLog.filter({ user_id: user.email, date: selectedDate });
    },
    enabled: !!user?.email
  });
  const dailyLog = dailyLogs?.[0];

  const upsertMutation = useMutation({
    mutationFn: async (payload) => {
      if (dailyLog) {
        return base44.entities.DailyLog.update(dailyLog.id, payload);
      }
      return base44.entities.DailyLog.create({ user_id: user.email, date: selectedDate, ...payload });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dailyLog', user?.email, selectedDate] })
  });

  // Transactions for the day (GGG)
  const { data: allTx = [] } = useQuery({
    queryKey: ['gggTxAll', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.GGGTransaction.filter({ user_id: user.email }, '-created_date', 500);
    },
    enabled: !!user?.email,
    refetchInterval: 60000
  });
  const txToday = useMemo(() => {
    return (allTx || []).filter((t) => {
      const d = parseISO(t.created_date);
      const yyyy = selectedDate;
      return isSameDay(d, parseISO(yyyy));
    }).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [allTx, selectedDate]);

  // Lifetime before/after today for rank progress
  const lifetimeBefore = useMemo(() => {
    const endPrev = new Date(selectedDate + 'T00:00:00');
    return (allTx || []).reduce((sum, t) => {
      const d = new Date(t.created_date);
      return d < endPrev ? sum + (t.delta || 0) : sum;
    }, 0);
  }, [allTx, selectedDate]);
  const earnedToday = useMemo(() => (txToday || []).reduce((s, t) => s + (t.delta || 0), 0), [txToday]);
  const lifetimeAfter = lifetimeBefore + earnedToday;

  // GGG rank thresholds (lifetime GGG)
  const GGG_RANKS = [
    { code: 'seeker', title: 'Seeker', min: 0, next: 700 },
    { code: 'initiate', title: 'Initiate', min: 700, next: 1500 },
    { code: 'adept', title: 'Adept', min: 1500, next: 2500 },
    { code: 'master', title: 'Master', min: 2500, next: 3700 },
    { code: 'sage', title: 'Sage', min: 3700, next: 5200 },
    { code: 'oracle', title: 'Oracle', min: 5200, next: 7000 },
    { code: 'guardian', title: 'Guardian', min: 7000, next: 8800 },
    { code: 'integrator', title: 'Integrator', min: 8800, next: 10000 },
    { code: 'ascended', title: 'Ascended', min: 10000, next: Infinity }
  ];
  const rankFor = (ggg) => {
    const r = [...GGG_RANKS].reverse().find((rk) => ggg >= rk.min) || GGG_RANKS[0];
    const span = (r.next - r.min) || 1;
    const prog = Math.max(0, Math.min(1, (ggg - r.min) / span));
    return { ...r, progress: prog };
  };
  const startRank = rankFor(lifetimeBefore);
  const endRank = rankFor(lifetimeAfter);

  // Meetings and Events (week view)
  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });

  const { data: meetings = [] } = useQuery({
    queryKey: ['meetingsAll'],
    queryFn: () => base44.entities.Meeting.list('-created_date', 200)
  });
  const { data: events = [] } = useQuery({
    queryKey: ['eventsAll'],
    queryFn: () => base44.entities.Event.list('-created_date', 200)
  });
  const eventsWeek = useMemo(() => {
    const inRange = (dt) => isWithinInterval(parseISO(dt), { start: weekStart, end: weekEnd });
    const m = (meetings || []).filter((m) => m.scheduled_time && inRange(m.scheduled_time)).map((m) => ({
      date: m.scheduled_time,
      title: m.title,
      type: 'meeting'
    }));
    const e = (events || []).filter((e) => e.start_time && inRange(e.start_time)).map((e) => ({
      date: e.start_time,
      title: e.title,
      type: 'event'
    }));
    return [...m, ...e].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [meetings, events, weekStart, weekEnd]);

  // Local editing helpers
  const [overview, setOverview] = useState('');
  const [schedDraft, setSchedDraft] = useState({ priority: 'Medium', time_block: '', title: '', note: '', link: '' });
  const [inProgDraft, setInProgDraft] = useState({ title: '', note: '', link: '' });
  const [completedDraft, setCompletedDraft] = useState({ action: '', ggg_earned: '', note: '', link: '' });
  const [fieldDraft, setFieldDraft] = useState({ focus: '', win: '', blocker: '', insight: '' });

  React.useEffect(() => {
    if (dailyLog) {
      setOverview(dailyLog.overview || '');
    } else {
      setOverview('');
    }
  }, [dailyLog]);

  const updateLog = (patch) => upsertMutation.mutate({ ...(dailyLog || {}), ...patch });

  const addSchedule = () => {
    if (!schedDraft.title) return;
    const next = [ ...(dailyLog?.schedule || []), { ...schedDraft } ];
    updateLog({ schedule: next });
    setSchedDraft({ priority: 'Medium', time_block: '', title: '', note: '', link: '' });
  };
  const removeSchedule = (idx) => {
    const next = (dailyLog?.schedule || []).filter((_, i) => i !== idx);
    updateLog({ schedule: next });
  };

  const addInProgress = () => {
    if (!inProgDraft.title) return;
    const next = [ ...(dailyLog?.in_progress || []), { ...inProgDraft } ];
    updateLog({ in_progress: next });
    setInProgDraft({ title: '', note: '', link: '' });
  };
  const removeInProgress = (idx) => {
    const next = (dailyLog?.in_progress || []).filter((_, i) => i !== idx);
    updateLog({ in_progress: next });
  };

  const addCompleted = () => {
    if (!completedDraft.action) return;
    const g = completedDraft.ggg_earned === '' ? undefined : Number(completedDraft.ggg_earned);
    const next = [ ...(dailyLog?.completed || []), { ...completedDraft, ggg_earned: g } ];
    updateLog({ completed: next });
    setCompletedDraft({ action: '', ggg_earned: '', note: '', link: '' });
  };
  const removeCompleted = (idx) => {
    const next = (dailyLog?.completed || []).filter((_, i) => i !== idx);
    updateLog({ completed: next });
  };

  const addFieldUpdate = (type) => {
    const current = dailyLog?.field_update || { focus: '', wins: [], blockers: [], insights: [] };
    if (type === 'focus' && fieldDraft.focus) updateLog({ field_update: { ...current, focus: fieldDraft.focus } });
    if (type === 'wins' && fieldDraft.win) updateLog({ field_update: { ...current, wins: [ ...(current.wins || []), fieldDraft.win ] } });
    if (type === 'blockers' && fieldDraft.blocker) updateLog({ field_update: { ...current, blockers: [ ...(current.blockers || []), fieldDraft.blocker ] } });
    if (type === 'insights' && fieldDraft.insight) updateLog({ field_update: { ...current, insights: [ ...(current.insights || []), fieldDraft.insight ] } });
    setFieldDraft({ focus: '', win: '', blocker: '', insight: '' });
  };
  const removeFieldItem = (type, idx) => {
    const current = dailyLog?.field_update || { wins: [], blockers: [], insights: [] };
    const nextArr = (current[type] || []).filter((_, i) => i !== idx);
    updateLog({ field_update: { ...current, [type]: nextArr } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Date & Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Daily Ops & Progress Tracker</CardTitle>
            <div className="flex items-center gap-3">
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
              <Button onClick={() => updateLog({ overview })} className="gap-2"><Save className="w-4 h-4" /> Save Overview</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600">Date: {selectedDate} ({format(parseISO(selectedDate), 'EEEE')})</div>
            <div className="mt-3">
              <Textarea placeholder="Short overview (1–2 sentences)" value={overview} onChange={(e) => setOverview(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Schedule / To-Do */}
        <Card>
          <CardHeader><CardTitle>Schedule / To-Do</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
              <Select value={schedDraft.priority} onValueChange={(v) => setSchedDraft({ ...schedDraft, priority: v })}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="09:00–10:00" value={schedDraft.time_block} onChange={(e) => setSchedDraft({ ...schedDraft, time_block: e.target.value })} />
              <Input placeholder="Task title" value={schedDraft.title} onChange={(e) => setSchedDraft({ ...schedDraft, title: e.target.value })} />
              <Input placeholder="Note (optional)" value={schedDraft.note} onChange={(e) => setSchedDraft({ ...schedDraft, note: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Link (optional)" value={schedDraft.link} onChange={(e) => setSchedDraft({ ...schedDraft, link: e.target.value })} />
                <Button onClick={addSchedule} className="whitespace-nowrap"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {(dailyLog?.schedule || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border p-3 bg-white">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{it.priority}</Badge>
                      {it.time_block && <span className="text-slate-600">{it.time_block}</span>}
                      <span className="font-medium text-slate-900">{it.title}</span>
                    </div>
                    {it.note && <div className="text-xs text-slate-600">{it.note}</div>}
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-violet-600">Open link</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSchedule(idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                </div>
              ))}
              {(!dailyLog?.schedule || dailyLog.schedule.length === 0) && (
                <div className="text-sm text-slate-500">No to-do items yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader><CardTitle>In Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              <Input placeholder="Work item" value={inProgDraft.title} onChange={(e) => setInProgDraft({ ...inProgDraft, title: e.target.value })} />
              <Input placeholder="Note (optional)" value={inProgDraft.note} onChange={(e) => setInProgDraft({ ...inProgDraft, note: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Link (optional)" value={inProgDraft.link} onChange={(e) => setInProgDraft({ ...inProgDraft, link: e.target.value })} />
                <Button onClick={addInProgress}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {(dailyLog?.in_progress || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border p-3 bg-white">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-slate-900">{it.title}</div>
                    {it.note && <div className="text-xs text-slate-600">{it.note}</div>}
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-violet-600">Open link</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeInProgress(idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                </div>
              ))}
              {(!dailyLog?.in_progress || dailyLog.in_progress.length === 0) && <div className="text-sm text-slate-500">Nothing in progress.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card>
          <CardHeader><CardTitle>Completed Today (What Was Done)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <Input placeholder="Action name" value={completedDraft.action} onChange={(e) => setCompletedDraft({ ...completedDraft, action: e.target.value })} />
              <Input type="number" step="0.01" placeholder="GGG earned" value={completedDraft.ggg_earned} onChange={(e) => setCompletedDraft({ ...completedDraft, ggg_earned: e.target.value })} />
              <Input placeholder="Note (optional)" value={completedDraft.note} onChange={(e) => setCompletedDraft({ ...completedDraft, note: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Link (optional)" value={completedDraft.link} onChange={(e) => setCompletedDraft({ ...completedDraft, link: e.target.value })} />
                <Button onClick={addCompleted}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {(dailyLog?.completed || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border p-3 bg-white">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{it.action} {typeof it.ggg_earned === 'number' && (<span className="text-amber-700 font-semibold">— {it.ggg_earned.toFixed(2)} GGG</span>)}</div>
                    {it.note && <div className="text-xs text-slate-600">{it.note}</div>}
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-violet-600">Open link</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCompleted(idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                </div>
              ))}
              {(!dailyLog?.completed || dailyLog.completed.length === 0) && <div className="text-sm text-slate-500">No completions logged yet.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Daily Transactions */}
        <Card>
          <CardHeader><CardTitle>Daily Transactions (GGG, rank, trust)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {txToday.length === 0 && <div className="text-sm text-slate-500">No GGG transactions for this date.</div>}
              {txToday.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 bg-white text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{format(parseISO(t.created_date), 'HH:mm')}</span>
                    <span className="font-medium text-slate-900">{t.reason_code || t.source_type || 'Action'}</span>
                  </div>
                  <div className="font-semibold {[(t.delta||0)>=0? 'text-emerald-700':'text-rose-700']}">{(t.delta || 0) >= 0 ? '+' : ''}{(t.delta || 0).toFixed(2)} GGG</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm">
              <div>Total GGG earned today: <span className="font-semibold">{earnedToday.toFixed(2)} GGG</span></div>
              <div>Starting rank: {startRank.title} ({Math.round(startRank.progress * 100)}/100)</div>
              <div>Ending rank: {endRank.title} ({Math.round(endRank.progress * 100)}/100)</div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Field Update */}
        <Card>
          <CardHeader><CardTitle>Daily Field Update</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Focus</div>
              <div className="flex gap-2">
                <Input placeholder="Primary focus themes" value={fieldDraft.focus} onChange={(e) => setFieldDraft({ ...fieldDraft, focus: e.target.value })} />
                <Button onClick={() => addFieldUpdate('focus')}><Save className="w-4 h-4 mr-1" /> Save</Button>
              </div>
              {dailyLog?.field_update?.focus && (
                <div className="mt-2 text-sm text-slate-800">{dailyLog.field_update.focus}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Wins</div>
              <div className="flex gap-2">
                <Input placeholder="Add a win" value={fieldDraft.win} onChange={(e) => setFieldDraft({ ...fieldDraft, win: e.target.value })} />
                <Button onClick={() => addFieldUpdate('wins')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {(dailyLog?.field_update?.wins || []).map((w, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span>• {w}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFieldItem('wins', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Blockers</div>
              <div className="flex gap-2">
                <Input placeholder="Add a blocker" value={fieldDraft.blocker} onChange={(e) => setFieldDraft({ ...fieldDraft, blocker: e.target.value })} />
                <Button onClick={() => addFieldUpdate('blockers')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {(dailyLog?.field_update?.blockers || []).map((b, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span>• {b}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFieldItem('blockers', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Insights</div>
              <div className="flex gap-2">
                <Input placeholder="Add an insight" value={fieldDraft.insight} onChange={(e) => setFieldDraft({ ...fieldDraft, insight: e.target.value })} />
                <Button onClick={() => addFieldUpdate('insights')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {(dailyLog?.field_update?.insights || []).map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span>• {i}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFieldItem('insights', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Events Calendar (Week) */}
        <Card>
          <CardHeader><CardTitle>Events Calendar (Week of {format(weekStart, 'yyyy-MM-dd')} to {format(weekEnd, 'yyyy-MM-dd')})</CardTitle></CardHeader>
          <CardContent>
            {eventsWeek.length === 0 ? (
              <div className="text-sm text-slate-500">No events posted for this week.</div>
            ) : (
              <div className="space-y-2">
                {eventsWeek.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-white text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">{format(parseISO(ev.date), 'yyyy-MM-dd — HH:mm')}</span>
                      <span className="font-medium text-slate-900">{ev.title}</span>
                    </div>
                    <Badge variant="outline">{ev.type === 'meeting' ? 'Call' : 'Event'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}