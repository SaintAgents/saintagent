import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CATEGORIES = [
  { value: 'rewards', label: 'Rewards' },
  { value: 'platform', label: 'Platform' },
  { value: 'governance', label: 'Governance' },
  { value: 'community', label: 'Community' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

export default function CreateProposalModal({ open, onClose, profile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'platform',
    duration_days: 7,
    required_votes: 50,
    pass_threshold: 60,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + form.duration_days);
      
      return base44.entities.Proposal.create({
        ...form,
        creator_id: profile?.user_id,
        creator_name: profile?.display_name || profile?.handle,
        creator_avatar: profile?.avatar_url,
        status: 'active',
        votes_for: 0,
        votes_against: 0,
        total_votes: 0,
        ends_at: endsAt.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal submitted!');
      setForm({ title: '', description: '', category: 'platform', duration_days: 7, required_votes: 50, pass_threshold: 60 });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What are you proposing?"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explain the proposal in detail..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Voting Duration (days)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={form.duration_days}
                onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 7 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quorum (min votes)</Label>
              <Input
                type="number"
                min={5}
                value={form.required_votes}
                onChange={(e) => setForm({ ...form, required_votes: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div>
              <Label>Pass Threshold (%)</Label>
              <Input
                type="number"
                min={50}
                max={100}
                value={form.pass_threshold}
                onChange={(e) => setForm({ ...form, pass_threshold: parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!form.title || !form.description || createMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}