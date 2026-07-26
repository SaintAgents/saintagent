import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, Bug, Lightbulb, MessageCircle, HelpCircle, X, Upload } from "lucide-react";
import { toast } from "sonner";

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-500' },
  { value: 'comment', label: 'Comment', icon: MessageCircle, color: 'text-blue-500' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-slate-500' }
];

export default function BetaFeedbackModal({ open, onClose, initialType }) {
  const [feedbackType, setFeedbackType] = useState(initialType || 'comment');
  const fileInputRef = useRef(null);

  // Update feedbackType when initialType changes
  React.useEffect(() => {
    if (initialType) {
      setFeedbackType(initialType);
    }
  }, [initialType]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [images, setImages] = useState([]); // array of data URLs or object URLs
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) { toast.error('Maximum 5 images allowed'); return; }
    const toAdd = files.slice(0, remaining);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    if (files.length > remaining) toast.info(`Only ${remaining} more image(s) allowed`);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl = null;

      // Upload all images
      const uploadedUrls = [];
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const blob = await fetch(images[i]).then(r => r.blob());
          const file = new File([blob], `feedback-${Date.now()}-${i}.png`, { type: 'image/png' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          uploadedUrls.push(file_url);
        }
        screenshotUrl = uploadedUrls[0];
      }

      // Create feedback entry
      await base44.entities.BetaFeedback.create({
        reporter_id: currentUser?.email,
        reporter_name: currentUser?.full_name,
        feedback_type: feedbackType,
        description: description.trim(),
        screenshot_url: screenshotUrl,
        image_urls: uploadedUrls,
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
    setImages([]);
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

          {/* Severity */}
          {(feedbackType === 'bug' || feedbackType === 'suggestion') && (
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

          {/* Images Section */}
          <div>
            <Label>Images (optional, up to 5)</Label>
            <div className="mt-1 space-y-2">
              {/* Image thumbnails */}
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg border overflow-hidden group">
                      <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {images.length < 5 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
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