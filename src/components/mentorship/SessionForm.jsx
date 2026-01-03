import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SessionForm({ trigger, onSubmit }) {
  const [open, setOpen] = React.useState(false);
  const [when, setWhen] = React.useState('');
  const [duration, setDuration] = React.useState(60);
  const [objectives, setObjectives] = React.useState('');

  const handleCreate = async () => {
    await onSubmit({ scheduled_time: when ? new Date(when).toISOString() : null, duration_minutes: Number(duration) || 60, objectives });
    setOpen(false);
    setWhen(''); setDuration(60); setObjectives('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Mentorship Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">When (optional)</label>
            <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Duration (minutes)</label>
            <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Objectives</label>
            <Textarea rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="What would you like to focus on?" className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleCreate}>Send Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}