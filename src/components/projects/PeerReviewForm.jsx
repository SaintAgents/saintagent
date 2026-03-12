import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const RATING_CATEGORIES = [
  { key: 'overall_rating', label: 'Overall Quality', description: 'Your overall impression of the project' },
  { key: 'feasibility_rating', label: 'Feasibility', description: 'Can this project realistically succeed?' },
  { key: 'impact_rating', label: 'Impact', description: 'Expected positive impact on the community' },
  { key: 'execution_rating', label: 'Execution', description: 'Quality of planning and current progress' },
  { key: 'team_rating', label: 'Team', description: 'Team capability and composition' },
  { key: 'innovation_rating', label: 'Innovation', description: 'Novelty and creative approach' },
];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-transform hover:scale-110"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PeerReviewForm({ open, onClose, projectId, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({
    overall_rating: 0,
    feasibility_rating: 0,
    impact_rating: 0,
    execution_rating: 0,
    team_rating: 0,
    innovation_rating: 0,
  });
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('neutral');

  const submitMutation = useMutation({
    mutationFn: async () => {
      const ratingValues = Object.values(ratings).filter(v => v > 0);
      const weightedScore = ratingValues.length > 0
        ? parseFloat((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(2))
        : 0;

      return base44.entities.Review.create({
        project_id: projectId,
        reviewer_id: currentUser.email,
        reviewer_name: profile?.display_name || currentUser.full_name,
        reviewer_avatar: profile?.avatar_url || '',
        ...ratings,
        strengths,
        improvements,
        comments,
        recommendation,
        weighted_score: weightedScore,
        decision_status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectReviews', projectId] });
      toast.success('Review submitted successfully!');
      onClose();
      // Reset form
      setRatings({ overall_rating: 0, feasibility_rating: 0, impact_rating: 0, execution_rating: 0, team_rating: 0, innovation_rating: 0 });
      setStrengths('');
      setImprovements('');
      setComments('');
      setRecommendation('neutral');
    }
  });

  const allRated = ratings.overall_rating > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Submit Peer Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Rating Categories */}
          {RATING_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm font-medium">{cat.label}</Label>
                <span className="text-xs text-slate-400">{ratings[cat.key] || '-'}/5</span>
              </div>
              <p className="text-xs text-slate-500 mb-1.5">{cat.description}</p>
              <StarRating
                value={ratings[cat.key]}
                onChange={(v) => setRatings(prev => ({ ...prev, [cat.key]: v }))}
              />
            </div>
          ))}

          {/* Recommendation */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Recommendation</Label>
            <Select value={recommendation} onValueChange={setRecommendation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strongly_recommend">Strongly Recommend</SelectItem>
                <SelectItem value="recommend">Recommend</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="not_recommend">Do Not Recommend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Qualitative Feedback */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Strengths</Label>
            <Textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="What does this project do well?"
              className="h-20"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Suggested Improvements</Label>
            <Textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="How could this project improve?"
              className="h-20"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Additional Comments</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any other feedback..."
              className="h-20"
            />
          </div>

          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!allRated || submitMutation.isPending}
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}