import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Plus, Check, Clock, Pencil, Save, Trash2, Sparkles, Lightbulb, Target } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [aiAssistOpen, setAiAssistOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  React.useEffect(() => {
    if (dailyLog) {
      setOverview(dailyLog.overview || '');
    } else {
      setOverview('');
    }
  }, [dailyLog]);

  const updateLog = (patch) => upsertMutation.mutate(patch);

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

  // Fetch recent past logs for AI context
  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recentDailyLogs', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.DailyLog.filter({ user_id: user.email }, '-date', 7);
    },
    enabled: !!user?.email
  });

  const generateAISuggestions = async () => {
    setAiLoading(true);
    setAiAssistOpen(true);
    try {
      // Build context from past logs
      const pastLogsContext = recentLogs
        .filter(log => log.date !== selectedDate)
        .slice(0, 5)
        .map(log => `
Date: ${log.date}
Overview: ${log.overview || 'N/A'}
In Progress: ${JSON.stringify(log.in_progress || [])}
Completed: ${JSON.stringify(log.completed || [])}
Blockers: ${JSON.stringify(log.field_update?.blockers || [])}
        `).join('\n---\n');

      const context = `
User: ${user?.full_name}
Selected Date: ${selectedDate}
Current Overview: ${overview || 'Not set'}
Schedule: ${JSON.stringify(dailyLog?.schedule || [])}
In Progress: ${JSON.stringify(dailyLog?.in_progress || [])}
Completed: ${JSON.stringify(dailyLog?.completed || [])}
Wins: ${JSON.stringify(dailyLog?.field_update?.wins || [])}
Blockers: ${JSON.stringify(dailyLog?.field_update?.blockers || [])}

=== RECENT PAST LOGS (for continuity) ===
${pastLogsContext || 'No past logs available'}

=== TODAY'S TRANSACTIONS ===
${txToday.map(t => `${t.reason_code || t.source_type}: ${t.delta} GGG`).join(', ') || 'None yet'}
      `.trim();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant helping a user manage their daily operations. Based on the context below, provide comprehensive suggestions.

${context}

Generate the following:
1. priority_tasks: 2-3 specific priority tasks they should focus on (based on past incomplete items and current blockers)
2. blocker_tips: Tips to overcome any current blockers
3. motivation: A motivational insight based on their progress
4. suggested_in_progress: Items that should be marked as "In Progress" based on past logs showing incomplete work or carried-over tasks (array of {title, note})
5. suggested_completed: Items that appear to have been completed based on context/transactions but not logged (array of {action, note, ggg_earned})
6. draft_overview: A 1-2 sentence overview summarizing what the user should focus on today, based on their schedule, past progress, and current priorities

Return JSON with this exact structure:
{
  "priority_tasks": ["string"],
  "blocker_tips": ["string"],
  "motivation": "string",
  "suggested_in_progress": [{"title": "string", "note": "string"}],
  "suggested_completed": [{"action": "string", "note": "string", "ggg_earned": number or null}],
  "draft_overview": "string"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            priority_tasks: { type: 'array', items: { type: 'string' } },
            blocker_tips: { type: 'array', items: { type: 'string' } },
            motivation: { type: 'string' },
            suggested_in_progress: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  note: { type: 'string' }
                }
              } 
            },
            suggested_completed: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  note: { type: 'string' },
                  ggg_earned: { type: 'number' }
                }
              } 
            },
            draft_overview: { type: 'string' }
          }
        }
      });
      
      setAiSuggestions(response);
    } catch (error) {
      console.error('AI assist failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (task) => {
    setSchedDraft({ ...schedDraft, title: task, priority: 'High' });
    setAiAssistOpen(false);
  };

  const applyDraftOverview = (draft) => {
    setOverview(draft);
    setAiAssistOpen(false);
  };

  const addSuggestedInProgress = (item) => {
    const next = [...(dailyLog?.in_progress || []), { title: item.title, note: item.note || '', link: '' }];
    updateLog({ in_progress: next });
  };

  const addSuggestedCompleted = (item) => {
    const next = [...(dailyLog?.completed || []), { action: item.action, note: item.note || '', ggg_earned: item.ggg_earned || undefined, link: '' }];
    updateLog({ completed: next });
  };

  const applyAllSuggested = (type) => {
    if (type === 'in_progress' && aiSuggestions?.suggested_in_progress) {
      const current = dailyLog?.in_progress || [];
      const newItems = aiSuggestions.suggested_in_progress.map(item => ({ title: item.title, note: item.note || '', link: '' }));
      updateLog({ in_progress: [...current, ...newItems] });
    }
    if (type === 'completed' && aiSuggestions?.suggested_completed) {
      const current = dailyLog?.completed || [];
      const newItems = aiSuggestions.suggested_completed.map(item => ({ action: item.action, note: item.note || '', ggg_earned: item.ggg_earned || undefined, link: '' }));
      updateLog({ completed: [...current, ...newItems] });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Date & Overview */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-slate-100"><CalendarDays className="w-5 h-5" /> Daily Ops & Progress Tracker</CardTitle>
            <div className="flex items-center gap-3">
              <Button 
                onClick={generateAISuggestions}
                variant="outline"
                className="gap-2 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-300 hover:from-violet-100 hover:to-purple-100"
              >
                <Sparkles className="w-4 h-4 text-violet-600" />
                AI Assist
              </Button>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
              <Button onClick={() => updateLog({ overview })} className="gap-2"><Save className="w-4 h-4" /> Save Overview</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 dark:text-slate-400">Date: {selectedDate} ({format(parseISO(selectedDate), 'EEEE')})</div>
            <div className="mt-3">
              <Textarea placeholder="Short overview (1–2 sentences)" value={overview} onChange={(e) => setOverview(e.target.value)} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
            </div>
          </CardContent>
        </Card>

        {/* Schedule / To-Do */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader><CardTitle className="text-violet-700 dark:text-slate-100">Schedule / To-Do</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
              <Select value={schedDraft.priority} onValueChange={(v) => setSchedDraft({ ...schedDraft, priority: v })}>
                <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="09:00–10:00" value={schedDraft.time_block} onChange={(e) => setSchedDraft({ ...schedDraft, time_block: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <Input placeholder="Task title" value={schedDraft.title} onChange={(e) => setSchedDraft({ ...schedDraft, title: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <Input placeholder="Note (optional)" value={schedDraft.note} onChange={(e) => setSchedDraft({ ...schedDraft, note: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <div className="flex gap-2">
                <Input placeholder="Link (optional)" value={schedDraft.link} onChange={(e) => setSchedDraft({ ...schedDraft, link: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={addSchedule} className="whitespace-nowrap"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {(dailyLog?.schedule || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border p-3 bg-white dark:bg-slate-700/50 dark:border-slate-600">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="dark:border-slate-500 dark:text-slate-300">{it.priority}</Badge>
                      {it.time_block && <span className="text-slate-600 dark:text-slate-400">{it.time_block}</span>}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{it.title}</span>
                    </div>
                    {it.note && <div className="text-xs text-slate-600 dark:text-slate-400">{it.note}</div>}
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-violet-600 dark:text-violet-400">Open link</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSchedule(idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                </div>
              ))}
              {(!dailyLog?.schedule || dailyLog.schedule.length === 0) && (
                <div className="text-sm text-slate-500 dark:text-slate-400">No to-do items yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader><CardTitle className="text-emerald-700 dark:text-slate-100">In Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              <Input placeholder="Work item" value={inProgDraft.title} onChange={(e) => setInProgDraft({ ...inProgDraft, title: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <Input placeholder="Note (optional)" value={inProgDraft.note} onChange={(e) => setInProgDraft({ ...inProgDraft, note: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <div className="flex gap-2">
                <Input placeholder="Link (optional)" value={inProgDraft.link} onChange={(e) => setInProgDraft({ ...inProgDraft, link: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={addInProgress}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {(dailyLog?.in_progress || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border p-3 bg-white dark:bg-slate-700/50 dark:border-slate-600">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{it.title}</div>
                    {it.note && <div className="text-xs text-slate-600 dark:text-slate-400">{it.note}</div>}
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-violet-600 dark:text-violet-400">Open link</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeInProgress(idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                </div>
              ))}
              {(!dailyLog?.in_progress || dailyLog.in_progress.length === 0) && <div className="text-sm text-slate-500 dark:text-slate-400">Nothing in progress.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader><CardTitle className="text-emerald-700 dark:text-slate-100">Completed Today (What Was Done)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <Input placeholder="Action name" value={completedDraft.action} onChange={(e) => setCompletedDraft({ ...completedDraft, action: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <Input type="number" step="0.01" placeholder="GGG earned" value={completedDraft.ggg_earned} onChange={(e) => setCompletedDraft({ ...completedDraft, ggg_earned: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <Input placeholder="Note (optional)" value={completedDraft.note} onChange={(e) => setCompletedDraft({ ...completedDraft, note: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
              <div className="flex gap-2">
                <Input placeholder="Link (optional)" value={completedDraft.link} onChange={(e) => setCompletedDraft({ ...completedDraft, link: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={addCompleted}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="space-y-2">
              {(dailyLog?.completed || []).map((it, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-lg border p-3 bg-white dark:bg-slate-700/50 dark:border-slate-600">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{it.action} {typeof it.ggg_earned === 'number' && (<span className="text-amber-700 dark:text-amber-400 font-semibold">— {it.ggg_earned.toFixed(2)} GGG</span>)}</div>
                    {it.note && <div className="text-xs text-slate-600 dark:text-slate-400">{it.note}</div>}
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-violet-600 dark:text-violet-400">Open link</a>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCompleted(idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                </div>
              ))}
              {(!dailyLog?.completed || dailyLog.completed.length === 0) && <div className="text-sm text-slate-500 dark:text-slate-400">No completions logged yet.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Daily Transactions */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader><CardTitle className="text-amber-700 dark:text-slate-100">Daily Transactions (GGG, rank, trust)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {txToday.length === 0 && <div className="text-sm text-slate-500 dark:text-slate-400">No GGG transactions for this date.</div>}
              {txToday.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-700/50 dark:border-slate-600 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{format(parseISO(t.created_date), 'HH:mm')}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{t.reason_code || t.source_type || 'Action'}</span>
                  </div>
                  <div className={`font-semibold ${(t.delta || 0) >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{(t.delta || 0) >= 0 ? '+' : ''}{(t.delta || 0).toFixed(2)} GGG</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              <div>Total GGG earned today: <span className="font-semibold">{earnedToday.toFixed(2)} GGG</span></div>
              <div>Starting rank: {startRank.title} ({Math.round(startRank.progress * 100)}/100)</div>
              <div>Ending rank: {endRank.title} ({Math.round(endRank.progress * 100)}/100)</div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Field Update */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader><CardTitle className="text-blue-700 dark:text-slate-100">Daily Field Update</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Focus</div>
              <div className="flex gap-2">
                <Input placeholder="Primary focus themes" value={fieldDraft.focus} onChange={(e) => setFieldDraft({ ...fieldDraft, focus: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={() => addFieldUpdate('focus')}><Save className="w-4 h-4 mr-1" /> Save</Button>
              </div>
              {dailyLog?.field_update?.focus && (
                <div className="mt-2 text-sm text-slate-800 dark:text-slate-200">{dailyLog.field_update.focus}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Wins</div>
              <div className="flex gap-2">
                <Input placeholder="Add a win" value={fieldDraft.win} onChange={(e) => setFieldDraft({ ...fieldDraft, win: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={() => addFieldUpdate('wins')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {(dailyLog?.field_update?.wins || []).map((w, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>• {w}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFieldItem('wins', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Blockers</div>
              <div className="flex gap-2">
                <Input placeholder="Add a blocker" value={fieldDraft.blocker} onChange={(e) => setFieldDraft({ ...fieldDraft, blocker: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={() => addFieldUpdate('blockers')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {(dailyLog?.field_update?.blockers || []).map((b, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>• {b}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFieldItem('blockers', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Insights</div>
              <div className="flex gap-2">
                <Input placeholder="Add an insight" value={fieldDraft.insight} onChange={(e) => setFieldDraft({ ...fieldDraft, insight: e.target.value })} className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400" />
                <Button onClick={() => addFieldUpdate('insights')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {(dailyLog?.field_update?.insights || []).map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>• {i}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFieldItem('insights', idx)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Events Calendar (Week) */}
        <Card className="dark:bg-slate-800/50 dark:border-slate-700">
          <CardHeader><CardTitle className="text-indigo-700 dark:text-slate-100">Events Calendar (Week of {format(weekStart, 'yyyy-MM-dd')} to {format(weekEnd, 'yyyy-MM-dd')})</CardTitle></CardHeader>
          <CardContent>
            {eventsWeek.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">No events posted for this week.</div>
            ) : (
              <div className="space-y-2">
                {eventsWeek.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-700/50 dark:border-slate-600 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 dark:text-slate-400">{format(parseISO(ev.date), 'yyyy-MM-dd — HH:mm')}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{ev.title}</span>
                    </div>
                    <Badge variant="outline" className="dark:border-slate-500 dark:text-slate-300">{ev.type === 'meeting' ? 'Call' : 'Event'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Modal */}
      <Dialog open={aiAssistOpen} onOpenChange={setAiAssistOpen}>
        <DialogContent className="max-w-2xl dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
              <Sparkles className="w-5 h-5" />
              AI Daily Ops Assistant
            </DialogTitle>
          </DialogHeader>
          
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Analyzing your day...</p>
            </div>
          ) : aiSuggestions ? (
            <div className="space-y-6">
              {/* Priority Tasks */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-600" />
                  Recommended Priority Tasks
                </h4>
                <div className="space-y-2">
                  {aiSuggestions.priority_tasks?.map((task, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 rounded-lg border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20">
                      <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{task}</p>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => applyAISuggestion(task)}
                        className="ml-2 text-violet-600 hover:text-violet-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blocker Tips */}
              {aiSuggestions.blocker_tips?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Tips to Overcome Blockers
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.blocker_tips.map((tip, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivation */}
              {aiSuggestions.motivation && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-300 dark:border-violet-600">
                  <p className="text-sm font-medium text-violet-900 dark:text-violet-200 text-center italic">
                    "{aiSuggestions.motivation}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Click "AI Assist" to get personalized suggestions
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}