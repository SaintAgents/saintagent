import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Star } from 'lucide-react';

function StarRating({ value, onChange, label }) {
  return (
    <div>
      <Label className="text-xs text-slate-500 mb-1 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className="p-0.5 hover:scale-110 transition-transform">
            <Star className={`w-5 h-5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MentorReviewDialog({ trigger, onSubmit, mentorName }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [knowledge, setKnowledge] = useState(5);
  const [helpfulness, setHelpfulness] = useState(5);
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);

  const handleSave = async () => {
    await onSubmit({ rating, communication_rating: communication, knowledge_rating: knowledge, helpfulness_rating: helpfulness, comment, would_recommend: recommend });
    setOpen(false);
    setComment('');
    setRating(5); setCommunication(5); setKnowledge(5); setHelpfulness(5);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review {mentorName || 'Mentor'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <StarRating value={rating} onChange={setRating} label="Overall Rating" />
          <div className="grid grid-cols-3 gap-3">
            <StarRating value={communication} onChange={setCommunication} label="Communication" />
            <StarRating value={knowledge} onChange={setKnowledge} label="Knowledge" />
            <StarRating value={helpfulness} onChange={setHelpfulness} label="Helpfulness" />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Your Review</Label>
            <Textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="What was your experience like?" className="mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Would you recommend this mentor?</Label>
            <Switch checked={recommend} onCheckedChange={setRecommend} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSave}>Submit Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}