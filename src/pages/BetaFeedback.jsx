import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, Bug, Lightbulb, HelpCircle, Plus, CheckCircle2, Clock
} from "lucide-react";
import { format } from 'date-fns';
import BackButton from '@/components/hud/BackButton';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';

const TYPE_CONFIG = {
  bug: { icon: Bug, color: 'bg-red-100 text-red-700', label: 'Bug' },
  suggestion: { icon: Lightbulb, color: 'bg-amber-100 text-amber-700', label: 'Suggestion' },
  comment: { icon: MessageSquare, color: 'bg-blue-100 text-blue-700', label: 'Comment' },
  other: { icon: HelpCircle, color: 'bg-slate-100 text-slate-700', label: 'Other' }
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
  reviewed: { color: 'bg-blue-100 text-blue-700', label: 'Reviewed' },
  in_progress: { color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
  resolved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Resolved' },
  dismissed: { color: 'bg-slate-100 text-slate-700', label: 'Dismissed' }
};

export default function BetaFeedback() {
  const queryClient = useQueryClient();
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch only the current user's feedback
  const { data: myFeedback = [], isLoading } = useQuery({
    queryKey: ['myBetaFeedback', currentUser?.email],
    queryFn: () => base44.entities.BetaFeedback.filter({ reporter_id: currentUser.email }, '-created_date', 100),
    enabled: !!currentUser?.email
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-violet-600" />
                Beta Feedback
              </h1>
              <p className="text-slate-600 mt-1">Help us improve by sharing your feedback</p>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <Card className="mb-6 border-violet-200 bg-violet-50/50">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-10 h-10 text-violet-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Found a bug? Have a suggestion?</h2>
            <p className="text-slate-600 mb-4">Your feedback helps us build a better platform for everyone.</p>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={() => setSubmitModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        {/* My Previous Submissions */}
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Previous Submissions</h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : myFeedback.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">You haven't submitted any feedback yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myFeedback.map((feedback) => {
              const typeConfig = TYPE_CONFIG[feedback.feedback_type] || TYPE_CONFIG.other;
              const statusConfig = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;
              const TypeIcon = typeConfig.icon;

              return (
                <Card key={feedback.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={typeConfig.color} variant="secondary">{typeConfig.label}</Badge>
                          <Badge className={statusConfig.color} variant="secondary">{statusConfig.label}</Badge>
                        </div>
                        <p className="text-slate-700 text-sm line-clamp-2">{feedback.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {format(new Date(feedback.created_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Submit Feedback Modal */}
        <BetaFeedbackModal 
          open={submitModalOpen} 
          onClose={() => {
            setSubmitModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['myBetaFeedback'] });
          }} 
        />
      </div>
    </div>
  );
}