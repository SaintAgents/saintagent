import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Shield, 
  Loader2,
  Send,
  User,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClaimProjectModal({ project, currentUser, onClose, onUpdate }) {
  const [claimNote, setClaimNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const handleSubmitClaim = async () => {
    if (!currentUser?.email) return;
    setSubmitting(true);
    setResult(null);

    try {
      const response = await base44.functions.invoke('claimProject', {
        project_id: project.id,
        claim_note: claimNote
      });

      setResult(response.data);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['projects_all'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onUpdate?.();
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to submit claim' 
      });
    }
    setSubmitting(false);
  };

  // Check current claim status
  const claimStatus = project.claim_status;
  const isAlreadyClaimed = claimStatus === 'approved';
  const isPendingApproval = claimStatus === 'pending';
  const isClaimedByMe = project.claimed_by === currentUser?.email;

  return (
    <div className="p-6 space-y-6">
      {/* Project Info */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{project.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{project.description}</p>
      </div>

      {/* Current Status Display */}
      {(isAlreadyClaimed || isPendingApproval) && (
        <div className={cn(
          "p-4 rounded-xl border",
          isAlreadyClaimed && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
          isPendingApproval && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
        )}>
          <div className="flex items-start gap-3">
            {isAlreadyClaimed ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
            )}
            <div>
              <h4 className={cn(
                "font-medium",
                isAlreadyClaimed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
              )}>
                {isAlreadyClaimed ? 'Project Claimed' : 'Claim Pending Approval'}
              </h4>
              <p className={cn(
                "text-sm mt-1",
                isAlreadyClaimed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              )}>
                {isAlreadyClaimed 
                  ? (isClaimedByMe 
                      ? 'You own this project and can edit/manage it.' 
                      : `This project is owned by ${project.claimed_by}`)
                  : (isClaimedByMe 
                      ? 'Your claim request has been submitted to Admin for review.' 
                      : `A claim is pending from ${project.claimed_by}`)}
              </p>
              {isPendingApproval && isClaimedByMe && (
                <p className="text-xs text-amber-500 mt-2">
                  You'll be notified once an admin reviews your request.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className={cn(
          "p-4 rounded-xl border",
          result.success && result.auto_approved && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
          result.success && !result.auto_approved && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
          !result.success && "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800"
        )}>
          <div className="flex items-start gap-3">
            {result.success && result.auto_approved && (
              <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
            )}
            {result.success && !result.auto_approved && (
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
            {!result.success && (
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
            )}
            <div>
              <h4 className={cn(
                "font-medium",
                result.success && result.auto_approved && "text-emerald-700 dark:text-emerald-300",
                result.success && !result.auto_approved && "text-blue-700 dark:text-blue-300",
                !result.success && "text-rose-700 dark:text-rose-300"
              )}>
                {result.success 
                  ? (result.auto_approved ? 'Ownership Verified!' : 'Request Submitted to Admin')
                  : 'Claim Failed'}
              </h4>
              <p className={cn(
                "text-sm mt-1",
                result.success && result.auto_approved && "text-emerald-600 dark:text-emerald-400",
                result.success && !result.auto_approved && "text-blue-600 dark:text-blue-400",
                !result.success && "text-rose-600 dark:text-rose-400"
              )}>
                {result.message || result.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Claim Form - only show if not already claimed/pending */}
      {!isAlreadyClaimed && !isPendingApproval && !result?.success && (
        <>
          {/* Info Box */}
          <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-violet-600 mt-0.5" />
              <div className="text-sm text-violet-700 dark:text-violet-300">
                <p className="font-medium mb-1">How Project Claims Work</p>
                <ul className="space-y-1 text-violet-600 dark:text-violet-400">
                  <li>• If your email matches our legacy Saint Agent records, your claim will be <strong>auto-approved</strong></li>
                  <li>• Otherwise, your request will be <strong>submitted to Admin</strong> for verification</li>
                  <li>• You'll receive a notification once your claim is processed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Claim Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Why are you claiming this project? (Optional)
            </label>
            <Textarea
              value={claimNote}
              onChange={(e) => setClaimNote(e.target.value)}
              placeholder="Explain your connection to this project... (helps admins verify your claim)"
              className="min-h-[100px]"
            />
          </div>

          {/* Your Info */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Claiming as:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{currentUser?.email}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitClaim}
              disabled={submitting}
              className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Claim
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Close button when showing result */}
      {(result?.success || isAlreadyClaimed || (isPendingApproval && isClaimedByMe)) && (
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      )}
    </div>
  );
}