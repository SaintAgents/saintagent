import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Heart, Send } from "lucide-react";

export default function MissionReflectionModal({ open, onClose, mission, onSubmit }) {
  const [reflection, setReflection] = useState('');
  const [allowTestimonial, setAllowTestimonial] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        reflection,
        allowTestimonial,
        missionId: mission?.id,
        missionTitle: mission?.title
      });
      onClose();
    } catch (e) {
      console.error('Reflection submit failed:', e);
    }
    setSubmitting(false);
  };

  const prompts = [
    "What did you learn about yourself?",
    "How did this align with your purpose?",
    "What surprised you during this mission?",
    "How will you carry this forward?"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Mission Complete! 🎉</DialogTitle>
              <DialogDescription className="text-violet-600 font-medium">
                {mission?.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
            <p className="text-lg font-medium text-violet-900 mb-2">
              How did this mission serve you?
            </p>
            <p className="text-sm text-violet-600">
              Take a moment to reflect on your experience and growth.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReflection(prev => prev ? `${prev}\n\n${prompt}` : prompt)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Share your thoughts, insights, and how this mission impacted your journey..."
            className="min-h-[120px] resize-none"
          />

          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <Checkbox
              id="testimonial"
              checked={allowTestimonial}
              onCheckedChange={setAllowTestimonial}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="testimonial" className="text-sm font-medium text-amber-900 cursor-pointer">
                Allow as testimonial
              </Label>
              <p className="text-xs text-amber-700 mt-0.5">
                I consent to my reflection being used (anonymously or with attribution) to inspire others.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!reflection.trim() || submitting}
              className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Share Reflection
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}