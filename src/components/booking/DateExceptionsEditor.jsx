import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";
import { format, parseISO } from 'date-fns';

function TimeRangeRow({ slot, onChange, onRemove }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const formatTime = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={`${slot.start_hour}:${slot.start_minute || 0}`} onValueChange={(v) => {
        const [h, m] = v.split(':').map(Number);
        onChange({ ...slot, start_hour: h, start_minute: m });
      }}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map(h => minutes.map(m => (
            <SelectItem key={`${h}:${m}`} value={`${h}:${m}`}>{formatTime(h, m)}</SelectItem>
          )))}
        </SelectContent>
      </Select>
      <span className="text-xs text-slate-400">to</span>
      <Select value={`${slot.end_hour}:${slot.end_minute || 0}`} onValueChange={(v) => {
        const [h, m] = v.split(':').map(Number);
        onChange({ ...slot, end_hour: h, end_minute: m });
      }}>
        <SelectTrigger className="w-28 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map(h => minutes.map(m => (
            <SelectItem key={`${h}:${m}`} value={`${h}:${m}`}>{formatTime(h, m)}</SelectItem>
          )))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={onRemove}>
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

export default function DateExceptionsEditor({ exceptions = [], onChange }) {
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState('blocked');
  const [newLabel, setNewLabel] = useState('');

  const addException = () => {
    if (!newDate) return;
    const exists = exceptions.find(e => e.date === newDate);
    if (exists) return;

    const entry = {
      date: newDate,
      type: newType,
      label: newLabel || (newType === 'blocked' ? 'Blocked' : 'Custom hours'),
      slots: newType === 'custom' ? [{ start_hour: 9, start_minute: 0, end_hour: 12, end_minute: 0 }] : []
    };
    onChange([...exceptions, entry].sort((a, b) => a.date.localeCompare(b.date)));
    setNewDate('');
    setNewLabel('');
  };

  const removeException = (date) => {
    onChange(exceptions.filter(e => e.date !== date));
  };

  const updateException = (date, updates) => {
    onChange(exceptions.map(e => e.date === date ? { ...e, ...updates } : e));
  };

  const addSlot = (date) => {
    const exc = exceptions.find(e => e.date === date);
    if (!exc) return;
    const newSlots = [...(exc.slots || []), { start_hour: 13, start_minute: 0, end_hour: 17, end_minute: 0 }];
    updateException(date, { slots: newSlots });
  };

  const updateSlot = (date, idx, slot) => {
    const exc = exceptions.find(e => e.date === date);
    if (!exc) return;
    const newSlots = [...(exc.slots || [])];
    newSlots[idx] = slot;
    updateException(date, { slots: newSlots });
  };

  const removeSlot = (date, idx) => {
    const exc = exceptions.find(e => e.date === date);
    if (!exc) return;
    const newSlots = (exc.slots || []).filter((_, i) => i !== idx);
    updateException(date, { slots: newSlots });
  };

  const formatDateLabel = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'EEE, MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Filter out past exceptions
  const today = new Date().toISOString().split('T')[0];
  const activeExceptions = exceptions.filter(e => e.date >= today);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
        <Calendar className="w-4 h-4 text-violet-600" />
        Date Exceptions
      </div>
      <p className="text-xs text-slate-500">Block specific dates or set custom hours that override your weekly schedule.</p>

      {/* Add New Exception */}
      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={today}
              className="h-8 text-sm"
            />
          </div>
          <div className="w-32">
            <Label className="text-xs">Type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blocked">Blocked (off)</SelectItem>
                <SelectItem value="custom">Custom hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <Label className="text-xs">Label (optional)</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g., Vacation"
              className="h-8 text-sm"
            />
          </div>
          <Button size="sm" className="h-8 gap-1 bg-violet-600 hover:bg-violet-700" onClick={addException} disabled={!newDate}>
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      {/* Existing Exceptions */}
      {activeExceptions.length === 0 && (
        <p className="text-xs text-slate-400 italic">No date exceptions set. Your weekly schedule applies to all dates.</p>
      )}

      <div className="space-y-2">
        {activeExceptions.map((exc) => (
          <div key={exc.date} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={exc.type === 'blocked' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}>
                  {exc.type === 'blocked' ? 'Blocked' : 'Custom'}
                </Badge>
                <span className="text-sm font-medium text-slate-800">{formatDateLabel(exc.date)}</span>
                {exc.label && <span className="text-xs text-slate-500">— {exc.label}</span>}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:text-rose-700" onClick={() => removeException(exc.date)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {exc.type === 'custom' && (
              <div className="pl-4 space-y-2">
                {(exc.slots || []).map((slot, idx) => (
                  <TimeRangeRow
                    key={idx}
                    slot={slot}
                    onChange={(s) => updateSlot(exc.date, idx, s)}
                    onRemove={() => removeSlot(exc.date, idx)}
                  />
                ))}
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-violet-600" onClick={() => addSlot(exc.date)}>
                  <Plus className="w-3 h-3" /> Add time window
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}