import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import TestimonialModal from './TestimonialModal';

export default function TestimonialButton({ 
  toUserId,
  toUserName,
  toUserAvatar,
  context,
  contextId,
  variant = "outline",
  size = "sm",
  className
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials', toUserId, contextId],
    queryFn: () => base44.entities.Testimonial.filter({ 
      to_user_id: toUserId,
      context_id: contextId 
    }),
    enabled: !!toUserId
  });

  const existingTestimonial = testimonials.find(
    t => t.from_user_id === currentUser?.email
  );

  if (currentUser?.email === toUserId) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={() => setModalOpen(true)}
      >
        <Heart className={cn(
          "w-4 h-4",
          existingTestimonial && "fill-current text-rose-500"
        )} />
        {existingTestimonial ? 'Edit Testimonial' : 'Give Testimonial'}
      </Button>

      <TestimonialModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        toUserId={toUserId}
        toUserName={toUserName}
        toUserAvatar={toUserAvatar}
        context={context}
        contextId={contextId}
        existingTestimonial={existingTestimonial}
      />
    </>
  );
}