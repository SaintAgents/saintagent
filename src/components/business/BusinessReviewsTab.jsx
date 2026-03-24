import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, Shield, Plus } from 'lucide-react';
import BusinessTrustScore from './BusinessTrustScore';
import moment from 'moment';

function StarRating({ value, onChange, size = 'md' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange?.(star)} className="focus:outline-none">
          <Star className={`${sz} transition-colors ${star <= value ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-9 h-9">
          <AvatarImage src={review.reviewer_avatar} />
          <AvatarFallback className="text-xs">{review.reviewer_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-slate-900" data-user-id={review.reviewer_id}>{review.reviewer_name}</span>
            {review.is_verified && <Badge className="bg-emerald-100 text-emerald-700 text-[10px] gap-0.5"><Shield className="w-2.5 h-2.5" /> Verified</Badge>}
            <span className="text-xs text-slate-400">{moment(review.created_date).fromNow()}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating value={review.overall_rating} size="sm" />
            {review.service_name && <Badge variant="outline" className="text-[10px]">{review.service_name}</Badge>}
          </div>
        </div>
      </div>
      {review.title && <p className="font-semibold text-sm text-slate-900 mb-1">{review.title}</p>}
      {review.content && <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>}
      
      {/* Sub-ratings */}
      {(review.transparency_rating || review.impact_rating || review.communication_rating) && (
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500">
          {review.transparency_rating && <span>Transparency: {review.transparency_rating}/5</span>}
          {review.impact_rating && <span>Impact: {review.impact_rating}/5</span>}
          {review.communication_rating && <span>Communication: {review.communication_rating}/5</span>}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.helpful_count || 0})
        </button>
      </div>
    </div>
  );
}

function WriteReviewForm({ entityId, services, onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    overall_rating: 0, transparency_rating: 0, impact_rating: 0, communication_rating: 0,
    title: '', content: '', service_name: ''
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1);
      const profile = profiles?.[0];
      return base44.entities.BusinessReview.create({
        ...data,
        entity_id: entityId,
        reviewer_id: user.email,
        reviewer_name: profile?.display_name || user.full_name,
        reviewer_avatar: profile?.avatar_url || '',
        is_verified: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessReviews', entityId] });
      onSuccess?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.overall_rating === 0) return;
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1">Overall Rating *</label>
        <StarRating value={form.overall_rating} onChange={(v) => setForm(p => ({ ...p, overall_rating: v }))} />
      </div>
      {services?.length > 0 && (
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Service (optional)</label>
          <Select value={form.service_name} onValueChange={(v) => setForm(p => ({ ...p, service_name: v }))}>
            <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
            <SelectContent>
              {services.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Transparency</label>
          <StarRating value={form.transparency_rating} onChange={(v) => setForm(p => ({ ...p, transparency_rating: v }))} size="sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Impact</label>
          <StarRating value={form.impact_rating} onChange={(v) => setForm(p => ({ ...p, impact_rating: v }))} size="sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Communication</label>
          <StarRating value={form.communication_rating} onChange={(v) => setForm(p => ({ ...p, communication_rating: v }))} size="sm" />
        </div>
      </div>
      <Input placeholder="Review title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
      <Textarea placeholder="Share your experience..." value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} className="min-h-[100px]" />
      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={form.overall_rating === 0 || mutation.isPending}>
        {mutation.isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

export default function BusinessReviewsTab({ entity }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['businessReviews', entity.id],
    queryFn: () => base44.entities.BusinessReview.filter({ entity_id: entity.id }, '-created_date', 50),
    enabled: !!entity.id
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trust Score sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <BusinessTrustScore entityId={entity.id} />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review {entity.name}</DialogTitle>
            </DialogHeader>
            <WriteReviewForm entityId={entity.id} services={entity.services_offered} onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Reviews ({reviews.length})</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Star className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience</p>
          </div>
        ) : (
          reviews.map(review => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
}