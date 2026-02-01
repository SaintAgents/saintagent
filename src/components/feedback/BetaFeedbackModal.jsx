import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Send, Loader2, Bug, Lightbulb, MessageCircle, HelpCircle, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500' },
  { value: 'comment', label: 'Comment', icon: MessageCircle, color: 'text-blue-500' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-slate-500' }
];

export default function BetaFeedbackModal({ open, onClose, initialType }) {
  const [feedbackType, setFeedbackType] = useState(initialType || 'comment');

  // Update feedbackType when initialType changes
  React.useEffect(() => {
    if (initialType) {
      setFeedbackType(initialType);
    }
  }, [initialType]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [screenshot, setScreenshot] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      // Temporarily hide the modal for screenshot
      const modalElement = document.querySelector('[role="dialog"]');
      if (modalElement) modalElement.style.visibility = 'hidden';

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 0.8,
        logging: false
      });

      if (modalElement) modalElement.style.visibility = 'visible';

      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
      toast.success('Screenshot captured!');
    } catch (error) {
      console.error('Screenshot failed:', error);
      toast.error('Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl = null;

      // Upload screenshot if captured
      if (screenshot) {
        const blob = await fetch(screenshot).then(r => r.blob());
        const file = new File([blob], `feedback-${Date.now()}.png`, { type: 'image/png' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        screenshotUrl = file_url;
      }

      // Create feedback entry
      await base44.entities.BetaFeedback.create({
        reporter_id: currentUser?.email,
        reporter_name: currentUser?.full_name,
        feedback_type: feedbackType,
        description: description.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        severity,
        status: 'pending'
      });

      // Award GGG for feedback submission (0.03 base, multiplied if bonus active)
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser?.email });
        const profile = profiles?.[0];
        const platformSettings = await base44.entities.PlatformSetting.list();
        const settings = platformSettings?.[0] || {};
        const bonusActive = settings.beta_bonus_active;
        const multiplier = bonusActive ? (settings.beta_bonus_multiplier || 2) : 1;
        const reward = 0.03 * multiplier;
        
        if (profile) {
          const newBalance = (profile.ggg_balance || 0) + reward;
          await base44.entities.UserProfile.update(profile.id, { ggg_balance: newBalance });
          await base44.entities.GGGTransaction.create({
            user_id: currentUser.email,
            delta: reward,
            reason_code: 'feedback_submit',
            description: `Submitted ${feedbackType} feedback${bonusActive ? ' (bonus period)' : ''}`,
            balance_after: newBalance,
            source_type: 'reward'
          });
        }
        toast.success(`Thank you for your feedback! +${reward.toFixed(2)} GGG earned${bonusActive ? ' (bonus!)' : ''}`);
      } catch (e) {
        console.error('Failed to award feedback GGG:', e);
        toast.success('Thank you for your feedback!');
      }
      handleClose();
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedbackType('comment');
    setDescription('');
    setSeverity('medium');
    setScreenshot(null);
    onClose();
  };

  const TypeIcon = FEEDBACK_TYPES.find(t => t.value === feedbackType)?.icon || MessageCircle;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5 text-violet-600" />
            Beta Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feedback Type */}
          <div>
            <Label>Feedback Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity (for bugs) */}
          {feedbackType === 'bug' && (
            <div>
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue, suggestion, or comment..."
              className="mt-1 min-h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Screenshot Section */}
          <div>
            <Label>Screenshot (optional)</Label>
            <div className="mt-1">
              {screenshot ? (
                <div className="relative rounded-lg border overflow-hidden">
                  <img src={screenshot} alt="Screenshot" className="w-full h-40 object-cover object-top" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={captureScreenshot}
                      disabled={isCapturing}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => setScreenshot(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={captureScreenshot}
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
                </Button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}