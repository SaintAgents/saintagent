import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CALL_PURPOSES = [
  { value: 'casual', label: 'Casual Chat', desc: 'General conversation, getting to know each other' },
  { value: 'collaboration', label: 'Collaboration', desc: 'Discuss working together on a project' },
  { value: 'mentorship', label: 'Mentorship', desc: 'Seek or offer guidance and mentoring' },
  { value: 'consultation', label: 'Consultation', desc: 'Professional advice or consulting session' },
  { value: 'mission', label: 'Mission Planning', desc: 'Plan or coordinate a mission together' },
  { value: 'in_person', label: 'In-Person Meetup', desc: 'Coordinate a face-to-face meeting' },
];

const TOPICS = [
  'Business Strategy', 'Spiritual Growth', 'Technology', 'Creative Projects',
  'Community Building', 'Healing & Wellness', 'Finance & Investment',
  'Leadership', 'Education', 'Personal Development', 'Other'
];

export default function CallIntakeForm({ form, onChange, hostName }) {
  const updateField = (field, value) => {
    onChange({ ...form, [field]: value });
  };

  const toggleTopic = (topic) => {
    const current = form.topics || [];
    const next = current.includes(topic)
      ? current.filter(t => t !== topic)
      : [...current, topic];
    updateField('topics', next);
  };

  return (
    <div className="space-y-5">
      {/* Meeting Title */}
      <div>
        <Label>Meeting Title</Label>
        <Input
          placeholder={`Meeting with ${hostName || 'Host'}`}
          value={form.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Call Purpose - visual cards */}
      <div>
        <Label className="mb-2 block">What is this call about?</Label>
        <div className="grid grid-cols-2 gap-2">
          {CALL_PURPOSES.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateField('meetingType', p.value)}
              className={cn(
                "text-left p-3 rounded-lg border transition-all",
                form.meetingType === p.value
                  ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                  : "border-slate-200 hover:border-violet-300 bg-white"
              )}
            >
              <p className="font-medium text-sm text-slate-900">{p.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div>
        <Label className="mb-2 block">Topics to discuss <span className="text-slate-400 font-normal">(optional)</span></Label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(topic => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                (form.topics || []).includes(topic)
                  ? "bg-violet-100 text-violet-700 border-violet-300"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-200"
              )}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Brief background / context */}
      <div>
        <Label>What would you like to discuss?</Label>
        <Textarea
          placeholder="Share some context so the host can prepare. e.g., 'I'd like to discuss my project idea around sustainable energy and get your input on the business model...'"
          value={form.message || ''}
          onChange={(e) => updateField('message', e.target.value)}
          rows={4}
          className="mt-1"
        />
        <p className="text-xs text-slate-400 mt-1">This will be included in the meeting notes and calendar invite</p>
      </div>

      {/* Anything else the host should know */}
      <div>
        <Label>Anything else the host should know? <span className="text-slate-400 font-normal">(optional)</span></Label>
        <Input
          placeholder="e.g., I'm in a different timezone, or I have a hard stop at..."
          value={form.additionalNotes || ''}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}