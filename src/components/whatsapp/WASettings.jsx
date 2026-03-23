import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Bot, Clock, Shield, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = [
  { value: 'mon', label: 'Mon' }, { value: 'tue', label: 'Tue' }, { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' }, { value: 'fri', label: 'Fri' }, { value: 'sat', label: 'Sat' }, { value: 'sun', label: 'Sun' },
];

export default function WASettings({ config }) {
  const [form, setForm] = useState(config || {});
  const queryClient = useQueryClient();

  useEffect(() => { if (config) setForm(config); }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) return base44.entities.WAConfig.update(data.id, data);
      return base44.entities.WAConfig.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waConfig'] });
      toast.success('Settings saved!');
    }
  });

  const toggleDay = (day) => {
    const days = form.business_days || [];
    setForm({ ...form, business_days: days.includes(day) ? days.filter(d => d !== day) : [...days, day] });
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          {form.webhook_connected ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
          Connection Status
        </h3>
        <div className="flex items-center gap-3">
          <Badge className={form.webhook_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
            {form.webhook_connected ? 'Connected' : 'Not Connected'}
          </Badge>
          <p className="text-sm text-slate-500">
            {form.webhook_connected 
              ? 'WhatsApp webhook is active and receiving messages.' 
              : 'Set your WhatsApp API secrets in dashboard settings to connect.'}
          </p>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-violet-600" /> AI Auto-Reply
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Auto-Reply</Label>
            <Switch checked={form.auto_reply_enabled || false} onCheckedChange={v => setForm({ ...form, auto_reply_enabled: v })} />
          </div>
          <div>
            <Label>AI Personality / System Prompt</Label>
            <Textarea value={form.ai_personality || ''} onChange={e => setForm({ ...form, ai_personality: e.target.value })} rows={3} placeholder="Describe how the AI should respond..." />
          </div>
          <div>
            <Label>Business Name</Label>
            <Input value={form.business_name || ''} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="Your Business Name" />
          </div>
          <div>
            <Label>Default Approval Mode</Label>
            <Select value={form.default_approval_mode || 'review_low_confidence'} onValueChange={v => setForm({ ...form, default_approval_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto_send">Auto-send all AI replies</SelectItem>
                <SelectItem value="review_first">Review all before sending</SelectItem>
                <SelectItem value="review_low_confidence">Review only low-confidence replies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Max AI Replies Per Thread (then escalate)</Label>
            <Input type="number" value={form.max_ai_replies_per_thread || 5} onChange={e => setForm({ ...form, max_ai_replies_per_thread: parseInt(e.target.value) || 5 })} />
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" /> Business Hours
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(d => (
              <button
                key={d.value}
                onClick={() => toggleDay(d.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  (form.business_days || []).includes(d.value)
                    ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={form.business_hours_start || '09:00'} onChange={e => setForm({ ...form, business_hours_start: e.target.value })} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={form.business_hours_end || '17:00'} onChange={e => setForm({ ...form, business_hours_end: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>After-Hours Auto-Reply</Label>
            <Textarea value={form.after_hours_message || ''} onChange={e => setForm({ ...form, after_hours_message: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>Welcome Message (first contact)</Label>
            <Textarea value={form.welcome_message || ''} onChange={e => setForm({ ...form, welcome_message: e.target.value })} rows={2} />
          </div>
        </div>
      </div>

      {/* Escalation */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-red-600" /> Escalation Keywords
        </h3>
        <p className="text-sm text-slate-500 mb-3">Messages with these words will immediately be flagged for human review.</p>
        <Input 
          value={(form.escalation_keywords || []).join(', ')} 
          onChange={e => setForm({ ...form, escalation_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
          placeholder="urgent, emergency, help, manager"
        />
      </div>

      <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="w-full bg-violet-600 hover:bg-violet-700">
        {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}