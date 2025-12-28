import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RescheduleDialog({ open, meeting, onClose, onSave }) {
  const [when, setWhen] = useState('');

  useEffect(() => {
    if (meeting?.scheduled_time) {
      // Convert ISO -> datetime-local value
      const d = new Date(meeting.scheduled_time);
      const pad = (n) => String(n).padStart(2, '0');
      const v = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setWhen(v);
    } else {
      setWhen('');
    }
  }, [meeting]);

  const handleSave = () => {
    if (!when) return;
    const iso = new Date(when).toISOString();
    onSave?.(iso);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Meeting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">New date & time</label>
            <Input type="datetime-local" className="mt-2" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}