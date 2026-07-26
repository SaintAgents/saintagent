import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ClipboardCheck, Star, Send, AlertTriangle, CheckCircle2,
  TrendingUp, HelpCircle, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const RECOMMENDATION_CONFIG = {
  fund: { label: 'Fund', icon: CheckCircle2, color: 'emerald' },
  incubate: { label: 'Incubate', icon: TrendingUp, color: 'amber' },
  needs_more_info: { label: 'Needs More Info', icon: HelpCircle, color: 'blue' },
  decline: { label: 'Decline', icon: XCircle, color: 'rose' },
};

const REVIEW_AREAS = [
  { id: 'team', label: 'Team & Leadership' },
  { id: 'financials', label: 'Financials & Budget' },
  { id: 'impact', label: 'Impact & Mission Alignment' },
  { id: 'feasibility', label: 'Feasibility & Readiness' },
  { id: 'documentation', label: 'Documentation Quality' },
  { id: 'community', label: 'Community Benefit' },
];

export default function CoordinatorReviewPanel({ project }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [score, setScore] = useState(5);
  const [recommendation, setRecommendation] = useState('');
  const [comment, setComment] = useState('');
  const [areasReviewed, setAreasReviewed] = useState([]);
  const [flags, setFlags] = useState('');

  // Fetch existing reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['coordinatorReviews', project?.id],
    queryFn: () => base44.entities.CoordinatorReview.filter({ project_id: project.id }, '-created_date'),
    enabled: !!project?.id,
  });

  // Fetch reviewer's profile for name/avatar
  const { data: myProfiles = [] } = useQuery({
    queryKey: ['myProfileForReview', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user.email }),
    enabled: !!user?.email,
    staleTime: 300000,
  });
  const myProfile = myProfiles[0];

  const existingReview = reviews.find(r => r.reviewer_id === user?.email);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      if (existingReview) {
        return base44.entities.CoordinatorReview.update(existingReview.id, data);
      }
      return base44.entities.CoordinatorReview.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coordinatorReviews', project.id] });
      toast.success(existingReview ? 'Review updated' : 'Review submitted');
      if (!existingReview) {
        setComment('');
        setScore(5);
        setRecommendation('');
        setAreasReviewed([]);
        setFlags('');
      }
    },
  });

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast.error('Please add a comment');
      return;
    }
    submitMutation.mutate({
      project_id: project.id,
      reviewer_id: user.email,
      reviewer_name: myProfile?.display_name || user.full_name || user.email,
      reviewer_avatar: myProfile?.avatar_url || '',
      score,
      recommendation: recommendation || undefined,
      comment: comment.trim(),
      areas_reviewed: areasReviewed,
      flags: flags.trim() ? flags.split('\n').map(f => f.trim()).filter(Boolean) : [],
    });
  };

  const toggleArea = (areaId) => {
    setAreasReviewed(prev =>
      prev.includes(areaId) ? prev.filter(a => a !== areaId) : [...prev, areaId]
    );
  };

  // Load existing review into form when editing
  React.useEffect(() => {
    if (existingReview) {
      setScore(existingReview.score);
      setRecommendation(existingReview.recommendation || '');
      setComment(existingReview.comment || '');
      setAreasReviewed(existingReview.areas_reviewed || []);
      setFlags((existingReview.flags || []).join('\n'));
    }
  }, [existingReview?.id]);

  const avgScore = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 border border-violet-200">
        <ClipboardCheck className="w-6 h-6 text-violet-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-violet-900">Coordinator Reviews</h3>
          <p className="text-sm text-violet-700">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted
            {avgScore && <> • Average score: <span className="font-bold">{avgScore}/10</span></>}
          </p>
        </div>
      </div>

      {/* Existing Reviews */}
      {isLoading ? (
        <div className="text-center py-6 text-slate-400">Loading reviews...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(review => {
            const rec = review.recommendation ? RECOMMENDATION_CONFIG[review.recommendation] : null;
            const RecIcon = rec?.icon || HelpCircle;
            return (
              <div key={review.id} className="p-4 rounded-xl border bg-white space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={review.reviewer_avatar} />
                      <AvatarFallback className="text-xs">{review.reviewer_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{review.reviewer_name}</p>
                      <p className="text-xs text-slate-500">
                        {review.created_date && formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec && (
                      <Badge className={cn(
                        'text-xs',
                        rec.color === 'emerald' && 'bg-emerald-100 text-emerald-700',
                        rec.color === 'amber' && 'bg-amber-100 text-amber-700',
                        rec.color === 'blue' && 'bg-blue-100 text-blue-700',
                        rec.color === 'rose' && 'bg-rose-100 text-rose-700',
                      )}>
                        <RecIcon className="w-3 h-3 mr-1" />
                        {rec.label}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-700 text-sm">{review.score}/10</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.comment}</p>

                {review.areas_reviewed?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.areas_reviewed.map(area => (
                      <Badge key={area} variant="outline" className="text-xs capitalize">
                        {area.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                )}

                {review.flags?.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <p className="text-xs font-medium text-rose-700 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3" /> Flags
                    </p>
                    {review.flags.map((flag, i) => (
                      <p key={i} className="text-xs text-rose-600">• {flag}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Submit / Edit Review Form */}
      <div className="p-4 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 space-y-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-violet-600" />
          {existingReview ? 'Update Your Review' : 'Submit Your Review'}
        </h4>

        {/* Score Slider */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Project Score: <span className="text-violet-600 font-bold">{score}/10</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-bold transition-all',
                  n <= score
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Recommendation</label>
          <Select value={recommendation} onValueChange={setRecommendation}>
            <SelectTrigger>
              <SelectValue placeholder="Select recommendation..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fund">Fund — Ready for funding</SelectItem>
              <SelectItem value="incubate">Incubate — Needs support first</SelectItem>
              <SelectItem value="needs_more_info">Needs More Info — Awaiting details</SelectItem>
              <SelectItem value="decline">Decline — Does not meet criteria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Areas Reviewed */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Areas Reviewed</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {REVIEW_AREAS.map(area => (
              <label
                key={area.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm',
                  areasReviewed.includes(area.id)
                    ? 'bg-violet-100 border-violet-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}
              >
                <Checkbox
                  checked={areasReviewed.includes(area.id)}
                  onCheckedChange={() => toggleArea(area.id)}
                />
                {area.label}
              </label>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Review Comment *</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your assessment of this project's readiness, strengths, concerns, and overall positioning for funding..."
            rows={4}
          />
        </div>

        {/* Flags */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-500" />
            Flags / Concerns (one per line, optional)
          </label>
          <Textarea
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="e.g. Missing financial projections&#10;Team lacks technical lead"
            rows={2}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || !comment.trim()}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
}