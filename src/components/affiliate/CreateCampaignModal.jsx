import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateCampaignModal({ 
  open, 
  onOpenChange, 
  userId, 
  userHandle,
  listings = [],
  events = [],
  missions = []
}) {
  const [campaignName, setCampaignName] = useState('');
  const [targetType, setTargetType] = useState('general');
  const [targetId, setTargetId] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      // Generate a unique code for this campaign
      const campaignCode = `${userHandle}-${campaignName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      
      // Find target name if applicable
      let targetName = '';
      if (targetType === 'listing') {
        targetName = listings.find(l => l.id === targetId)?.title || '';
      } else if (targetType === 'event') {
        targetName = events.find(e => e.id === targetId)?.title || '';
      } else if (targetType === 'mission') {
        targetName = missions.find(m => m.id === targetId)?.title || '';
      }

      return base44.entities.AffiliateCode.create({
        user_id: userId,
        code: campaignCode,
        campaign_name: campaignName,
        target_type: targetType,
        target_id: targetType !== 'general' ? targetId : undefined,
        target_name: targetName,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliateCodes'] });
      toast.success('Campaign link created!');
      onOpenChange(false);
      setCampaignName('');
      setTargetType('general');
      setTargetId('');
    },
    onError: (error) => {
      toast.error('Failed to create campaign: ' + error.message);
    }
  });

  const getTargetOptions = () => {
    switch (targetType) {
      case 'listing':
        return listings.map(l => ({ id: l.id, name: l.title }));
      case 'event':
        return events.map(e => ({ id: e.id, name: e.title }));
      case 'mission':
        return missions.map(m => ({ id: m.id, name: m.title }));
      default:
        return [];
    }
  };

  const targetOptions = getTargetOptions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            Create Campaign Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="e.g., twitter-promo, summer-launch"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              This helps you track which campaigns perform best
            </p>
          </div>

          <div className="space-y-2">
            <Label>Link Target</Label>
            <Select value={targetType} onValueChange={(v) => { setTargetType(v); setTargetId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General (Join Page)</SelectItem>
                <SelectItem value="listing">Specific Listing</SelectItem>
                <SelectItem value="event">Specific Event</SelectItem>
                <SelectItem value="mission">Specific Mission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType !== 'general' && targetOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Select {targetType}</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${targetType}`} />
                </SelectTrigger>
                <SelectContent>
                  {targetOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetType !== 'general' && targetOptions.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              You don't have any {targetType}s yet. Create one first or use a general link.
            </p>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!campaignName.trim() || (targetType !== 'general' && !targetId) || createMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}