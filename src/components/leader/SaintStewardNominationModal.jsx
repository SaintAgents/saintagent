import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Crown, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SaintStewardNominationModal({ open, onClose, nominator }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [formData, setFormData] = useState({
    testimonial: '',
    evidence_of_leadership: '',
    missions_led: [],
    community_impact: ''
  });
  const [missionInput, setMissionInput] = useState('');

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.SaintStewardNomination.create({
        nominee_id: selectedNominee.user_id,
        nominee_name: selectedNominee.display_name,
        nominee_avatar: selectedNominee.avatar_url,
        nominator_id: nominator.user_id,
        nominator_name: nominator.display_name,
        nominator_avatar: nominator.avatar_url,
        ...data,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saintStewardNominations'] });
      onClose();
      resetForm();
    }
  });

  const resetForm = () => {
    setSearchQuery('');
    setSelectedNominee(null);
    setFormData({
      testimonial: '',
      evidence_of_leadership: '',
      missions_led: [],
      community_impact: ''
    });
    setMissionInput('');
  };

  const addMission = () => {
    if (missionInput.trim()) {
      setFormData({
        ...formData,
        missions_led: [...formData.missions_led, missionInput.trim()]
      });
      setMissionInput('');
    }
  };

  const removeMission = (index) => {
    setFormData({
      ...formData,
      missions_led: formData.missions_led.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Nominate for Saint Steward Badge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nominee Selection */}
          {!selectedNominee ? (
            <div>
              <Label>Search for User to Nominate</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or handle..."
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Note: In production, this would show a searchable list of eligible users
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedNominee.avatar_url} />
                    <AvatarFallback>{selectedNominee.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedNominee.display_name}</p>
                    <p className="text-sm text-slate-600">@{selectedNominee.handle}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedNominee(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {selectedNominee && (
            <>
              <div>
                <Label className="text-base font-semibold">Leadership Testimonial *</Label>
                <p className="text-xs text-slate-500 mb-2">
                  Describe why this person exemplifies exceptional leadership and should receive the Saint Steward badge
                </p>
                <Textarea
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  placeholder="Share your perspective on their leadership qualities, character, and impact..."
                  className="min-h-32"
                  required
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Evidence of Leadership *</Label>
                <p className="text-xs text-slate-500 mb-2">
                  Provide specific examples of their leadership achievements
                </p>
                <Textarea
                  value={formData.evidence_of_leadership}
                  onChange={(e) => setFormData({ ...formData, evidence_of_leadership: e.target.value })}
                  placeholder="List concrete examples: missions led, conflicts resolved, innovations introduced, etc."
                  className="min-h-32"
                  required
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Missions Led</Label>
                <p className="text-xs text-slate-500 mb-2">
                  Add missions or initiatives they've successfully led
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    placeholder="Mission name or description..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMission())}
                  />
                  <Button type="button" onClick={addMission} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.missions_led.map((mission, i) => (
                    <Badge key={i} className="gap-2 bg-violet-100 text-violet-700">
                      {mission}
                      <button
                        type="button"
                        onClick={() => removeMission(i)}
                        className="hover:bg-violet-200 rounded-full"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Community Impact *</Label>
                <p className="text-xs text-slate-500 mb-2">
                  Describe their broader impact on the community
                </p>
                <Textarea
                  value={formData.community_impact}
                  onChange={(e) => setFormData({ ...formData, community_impact: e.target.value })}
                  placeholder="How have they strengthened the community? What positive changes have they catalyzed?"
                  className="min-h-24"
                  required
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-900 font-medium mb-2">📋 Nomination Process</p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Your nomination will be submitted for peer review</li>
                  <li>• Other leaders can endorse or provide feedback</li>
                  <li>• 5 endorsements required for approval</li>
                  <li>• Badge granted upon successful review</li>
                </ul>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedNominee || submitMutation.isPending || !formData.testimonial || !formData.evidence_of_leadership || !formData.community_impact}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Nomination
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}