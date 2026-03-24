import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REASONS = [
  { value: 'spam', label: 'Spam', description: 'Unsolicited or promotional content' },
  { value: 'harassment', label: 'Abuse / Harassment', description: 'Bullying, threats, or personal attacks' },
  { value: 'misinformation', label: 'Misinformation', description: 'Dangerously false or misleading advice' },
  { value: 'inappropriate', label: 'Inappropriate', description: 'Offensive, explicit, or harmful content' },
  { value: 'off_topic', label: 'Off-Topic', description: 'Not relevant to the question or category' },
  { value: 'other', label: 'Other', description: 'Another reason not listed above' },
];

export default function FlagContentModal({ open, onClose, targetType, targetId, targetAuthorId, targetAuthorName, contentPreview, currentUser }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const flagMutation = useMutation({
    mutationFn: () => base44.entities.ForumReport.create({
      reporter_id: currentUser?.email,
      reporter_name: currentUser?.full_name,
      target_type: targetType,
      target_id: targetId,
      target_author_id: targetAuthorId,
      target_author_name: targetAuthorName,
      content_preview: contentPreview?.slice(0, 300),
      reason,
      details,
      status: 'pending'
    }),
    onSuccess: () => {
      toast.success('Content flagged for review. Thank you for helping keep our community safe.');
      setReason('');
      setDetails('');
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            Report {targetType === 'question' ? 'Question' : 'Answer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Why are you reporting this?</Label>
            <div className="space-y-2">
              {REASONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    reason === r.value
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="font-medium text-sm text-slate-900">{r.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Additional details (optional)</Label>
            <Textarea
              placeholder="Provide any extra context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="h-20"
            />
          </div>

          {contentPreview && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Content being reported:</p>
              <p className="text-sm text-slate-700 line-clamp-3">{contentPreview}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => flagMutation.mutate()}
            disabled={!reason || flagMutation.isPending}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {flagMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}