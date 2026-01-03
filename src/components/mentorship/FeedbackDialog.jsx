import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FeedbackDialog({ trigger, onSubmit, initialRating }) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(initialRating || '5');
  const [comment, setComment] = React.useState('');

  const handleSave = async () => {
    await onSubmit({ rating: Number(rating), comment });
    setOpen(false); setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-600">Rating</label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="w-28 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Comments</label>
            <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the session?" className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSave}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}