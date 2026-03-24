import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send } from 'lucide-react';
import { toast } from "sonner";

function StarInput({ value, onChange, label }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="p-0.5"
          >
            <Star className={`w-6 h-6 transition-colors ${
              i <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BusinessReviewForm({ entity, onSubmitted }) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    overall_rating: 0,
    transparency_rating: 0,
    impact_rating: 0,
    communication_rating: 0,
    title: '',
    content: '',
    service_name: '',
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfileForReview', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1),
    enabled: !!currentUser?.email
  });

  const profile = myProfile?.[0];
  const services = entity.services_offered || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.overall_rating) {
      toast.error('Please provide an overall rating');
      return;
    }
    setSubmitting(true);

    // Check if user has interacted with entity (follower, team member, etc.)
    const isVerified = entity.team_member_ids?.includes(currentUser?.email) ||
      entity.going_user_ids?.includes(currentUser?.email);

    await base44.entities.BusinessReview.create({
      entity_id: entity.id,
      reviewer_id: currentUser.email,
      reviewer_name: profile?.display_name || currentUser.full_name,
      reviewer_avatar: profile?.avatar_url || '',
      overall_rating: form.overall_rating,
      transparency_rating: form.transparency_rating || undefined,
      impact_rating: form.impact_rating || undefined,
      communication_rating: form.communication_rating || undefined,
      title: form.title,
      content: form.content,
      service_name: form.service_name || undefined,
      is_verified: isVerified,
      status: 'published'
    });

    queryClient.invalidateQueries({ queryKey: ['businessReviews', entity.id] });
    toast.success('Review submitted!');
    setForm({ overall_rating: 0, transparency_rating: 0, impact_rating: 0, communication_rating: 0, title: '', content: '', service_name: '' });
    setSubmitting(false);
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Leave a Review</h3>

      <StarInput label="Overall Rating *" value={form.overall_rating} onChange={v => setForm(f => ({ ...f, overall_rating: v }))} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StarInput label="Transparency" value={form.transparency_rating} onChange={v => setForm(f => ({ ...f, transparency_rating: v }))} />
        <StarInput label="Impact" value={form.impact_rating} onChange={v => setForm(f => ({ ...f, impact_rating: v }))} />
        <StarInput label="Communication" value={form.communication_rating} onChange={v => setForm(f => ({ ...f, communication_rating: v }))} />
      </div>

      {services.length > 0 && (
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Service (optional)</label>
          <Select value={form.service_name} onValueChange={v => setForm(f => ({ ...f, service_name: v }))}>
            <SelectTrigger><SelectValue placeholder="Select a service..." /></SelectTrigger>
            <SelectContent>
              {services.map((s, i) => (
                <SelectItem key={i} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Input
        placeholder="Review title"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
      />

      <Textarea
        placeholder="Share your experience with this organization..."
        value={form.content}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        rows={3}
      />

      <Button type="submit" disabled={submitting || !form.overall_rating} className="bg-violet-600 hover:bg-violet-700 gap-2">
        <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}