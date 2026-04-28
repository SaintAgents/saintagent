import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Target, Send } from 'lucide-react';

export default function SessionForm({ trigger, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState('');
  const [duration, setDuration] = useState('60');
  const [objectives, setObjectives] = useState('');

  const handleCreate = async () => {
    await onSubmit({
      scheduled_time: when ? new Date(when).toISOString() : null,
      duration_minutes: Number(duration) || 60,
      objectives,
    });
    setOpen(false);
    setWhen(''); setDuration('60'); setObjectives('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Book a Session
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Date & Time
            </Label>
            <Input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} />
            <p className="text-[11px] text-slate-400 mt-1">Leave empty to let the mentor suggest a time</p>
          </div>
          <div>
            <Label className="text-sm flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm flex items-center gap-1.5 mb-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" /> What would you like to focus on?
            </Label>
            <Textarea rows={3} value={objectives} onChange={e => setObjectives(e.target.value)}
              placeholder="Describe your goals for this session..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-violet-600 hover:bg-violet-700 gap-1.5" onClick={handleCreate}>
            <Send className="w-3.5 h-3.5" /> Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}