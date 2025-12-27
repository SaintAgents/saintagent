import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TestimonialModal({ 
  open, 
  onClose, 
  toUserId,
  toUserName,
  toUserAvatar,
  context,
  contextId,
  existingTestimonial 
}) {
  const [rating, setRating] = useState(existingTestimonial?.rating || 5);
  const [text, setText] = useState(existingTestimonial?.text || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (existingTestimonial) {
        return base44.entities.Testimonial.update(existingTestimonial.id, data);
      }
      return base44.entities.Testimonial.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      from_user_id: currentUser.email,
      from_name: profile?.display_name,
      from_avatar: profile?.avatar_url,
      to_user_id: toUserId,
      to_name: toUserName,
      to_avatar: toUserAvatar,
      rating,
      text,
      context,
      context_id: contextId,
      visibility: 'public'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            {existingTestimonial ? 'Edit' : 'Write'} Testimonial
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rate your experience</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-all",
                      (hoveredRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Your testimonial</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience..."
              className="mt-2 min-h-32"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              {context && `About: ${context}`}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-violet-600 hover:bg-violet-700"
              disabled={createMutation.isPending || !text.trim()}
            >
              {existingTestimonial ? 'Update' : 'Submit'} Testimonial
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}