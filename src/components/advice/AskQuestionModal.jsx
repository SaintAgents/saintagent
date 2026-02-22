import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Sparkles, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  { value: 'relationships', label: 'Relationships' },
  { value: 'business', label: 'Business' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'health', label: 'Health' },
  { value: 'family', label: 'Family' },
  { value: 'personal_growth', label: 'Personal Growth' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' }
];

export default function AskQuestionModal({ open, onClose, currentUser, profile }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    is_anonymous: false,
    request_ai_insight: true,
    allow_public_replies: true
  });

  const showWarning = formData.category === 'health' || formData.category === 'legal';

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const question = await base44.entities.AdviceQuestion.create({
        ...data,
        author_id: currentUser.email,
        author_name: data.is_anonymous ? 'Anonymous' : (profile?.display_name || currentUser.full_name),
        author_avatar: data.is_anonymous ? null : profile?.avatar_url
      });

      // Update wisdom score
      const scores = await base44.entities.WisdomScore.filter({ user_id: currentUser.email });
      if (scores.length > 0) {
        await base44.entities.WisdomScore.update(scores[0].id, {
          questions_asked: (scores[0].questions_asked || 0) + 1
        });
      } else {
        await base44.entities.WisdomScore.create({
          user_id: currentUser.email,
          questions_asked: 1
        });
      }

      return question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adviceQuestions'] });
      queryClient.invalidateQueries({ queryKey: ['wisdomScores'] });
      setFormData({
        title: '',
        description: '',
        category: 'other',
        is_anonymous: false,
        request_ai_insight: true,
        allow_public_replies: true
      });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#faf9f6]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-slate-900">Ask for Guidance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {showWarning && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {formData.category === 'health' 
                  ? 'Health advice provided here does not constitute medical professional counsel. Please consult a licensed healthcare provider.'
                  : 'Legal advice provided here does not constitute professional legal counsel. Please consult a licensed attorney.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700">Question Title</Label>
            <Input
              id="title"
              placeholder="What guidance do you seek?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700">Full Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your situation in detail. The more context you provide, the better guidance you'll receive..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white border-slate-200 min-h-[150px]"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                {formData.is_anonymous ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-indigo-500" />}
                <div>
                  <p className="text-sm font-medium text-slate-900">Post Anonymously</p>
                  <p className="text-xs text-slate-500">Your identity will be hidden</p>
                </div>
              </div>
              <Switch
                checked={formData.is_anonymous}
                onCheckedChange={(v) => setFormData({ ...formData, is_anonymous: v })}
                className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-300"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Request AI Insight</p>
                  <p className="text-xs text-slate-500">SaintAgent AI will provide structured guidance</p>
                </div>
              </div>
              <Switch
                checked={formData.request_ai_insight}
                onCheckedChange={(v) => setFormData({ ...formData, request_ai_insight: v })}
                className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-slate-300"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Allow Public Replies</p>
                  <p className="text-xs text-slate-500">Community members can offer advice</p>
                </div>
              </div>
              <Switch
                checked={formData.allow_public_replies}
                onCheckedChange={(v) => setFormData({ ...formData, allow_public_replies: v })}
                className="data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={createMutation.isPending || !formData.title.trim() || !formData.description.trim()}
            >
              {createMutation.isPending ? 'Posting...' : 'Post Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}