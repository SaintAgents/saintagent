import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Plus } from 'lucide-react';
import PeerReviewSummary from './PeerReviewSummary';
import PeerReviewsList from './PeerReviewsList';
import PeerReviewForm from './PeerReviewForm';

export default function PeerReviewsTab({ project, currentUser, profile }) {
  const [formOpen, setFormOpen] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['projectReviews', project?.id],
    queryFn: () => base44.entities.Review.filter({ project_id: project.id }, '-created_date', 100),
    enabled: !!project?.id
  });

  const hasReviewed = reviews.some(r => r.reviewer_id === currentUser?.email);
  const isOwner = project?.owner_id === currentUser?.email;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Peer Reviews ({reviews.length})
        </h3>
        {!isOwner && !hasReviewed && currentUser && (
          <Button
            onClick={() => setFormOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Write Review
          </Button>
        )}
        {hasReviewed && (
          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
            ✓ You've reviewed this project
          </span>
        )}
      </div>

      {/* Summary */}
      <PeerReviewSummary reviews={reviews} />

      {/* Individual Reviews */}
      <PeerReviewsList reviews={reviews} />

      {/* Review Form Modal */}
      <PeerReviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={project?.id}
        currentUser={currentUser}
        profile={profile}
      />
    </div>
  );
}