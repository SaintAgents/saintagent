import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Tag, Star, MessageSquare, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function WAContactDetail({ contact, messages = [] }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(contact || {});
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.WAContact.update(contact.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waContacts'] });
      setEditing(false);
    }
  });

  if (!contact) return null;

  const contactMsgs = messages.filter(m => m.contact_phone === contact.phone);
  const inbound = contactMsgs.filter(m => m.direction === 'inbound').length;
  const outbound = contactMsgs.filter(m => m.direction === 'outbound').length;

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = [...(form.tags || []), tagInput.trim()];
    setForm({ ...form, tags });
    setTagInput('');
  };

  const removeTag = (t) => setForm({ ...form, tags: (form.tags || []).filter(x => x !== t) });

  return (
    <div className="p-4 space-y-4">
      {/* Profile */}
      <div className="text-center">
        <Avatar className="w-16 h-16 mx-auto mb-2">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
            {(contact.name || contact.phone)?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-slate-900">{contact.name || 'Unknown'}</h3>
        <p className="text-sm text-slate-500">{contact.phone}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-lg font-bold text-slate-900">{inbound}</p>
          <p className="text-[10px] text-slate-500">Received</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-lg font-bold text-slate-900">{outbound}</p>
          <p className="text-[10px] text-slate-500">Sent</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-lg font-bold text-slate-900">{contact.lead_score || 0}</p>
          <p className="text-[10px] text-slate-500">Lead Score</p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-xs">Tags</Label>
        <div className="flex flex-wrap gap-1 mt-1 mb-2">
          {(form.tags || []).map(t => (
            <Badge key={t} variant="outline" className="text-xs cursor-pointer hover:bg-red-50" onClick={() => editing && removeTag(t)}>
              {t} {editing && '×'}
            </Badge>
          ))}
        </div>
        {editing && (
          <div className="flex gap-1">
            <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag" className="h-8 text-xs" />
            <Button onClick={addTag} size="sm" variant="outline" className="h-8"><Tag className="w-3 h-3" /></Button>
          </div>
        )}
      </div>

      {/* Editable Fields */}
      <div>
        <Label className="text-xs">Name</Label>
        <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} disabled={!editing} className="h-8 text-sm" />
      </div>
      <div>
        <Label className="text-xs">Status</Label>
        <Select value={form.status || 'active'} onValueChange={v => setForm({ ...form, status: v })} disabled={!editing}>
          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="opted_out">Opted Out</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} disabled={!editing} rows={3} className="text-sm" />
      </div>

      {contact.last_message_at && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Last message: {format(new Date(contact.last_message_at), 'MMM d, yyyy HH:mm')}
        </p>
      )}

      <div className="flex gap-2">
        {editing ? (
          <>
            <Button onClick={() => updateMutation.mutate(form)} className="flex-1 bg-violet-600 hover:bg-violet-700 gap-1" size="sm">
              <Save className="w-3 h-3" /> Save
            </Button>
            <Button variant="outline" onClick={() => { setForm(contact); setEditing(false); }} size="sm">Cancel</Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setEditing(true)} className="w-full" size="sm">Edit Contact</Button>
        )}
      </div>
    </div>
  );
}