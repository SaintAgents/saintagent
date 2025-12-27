import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";

export default function LeaderApplicationModal({ open, onClose, profile }) {
  const [formData, setFormData] = useState({
    reason: '',
    mission_types: '',
    experience: '',
    video_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.LeaderApplication.create({
        user_id: profile.user_id,
        applicant_name: profile.display_name,
        applicant_avatar: profile.avatar_url,
        reason: data.reason,
        experience: data.experience,
        contribution_plan: data.mission_types,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderApplication'] });
      onClose();
      setFormData({
        reason: '',
        mission_types: '',
        experience: '',
        video_url: ''
      });
    }
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, video_url: file_url });
      } catch (error) {
        console.error('Upload failed:', error);
      }
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Leadership Application</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Why do you want to lead on SaintAgent?</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Share your motivation and vision..."
              className="mt-2 min-h-24"
              required
            />
          </div>

          <div>
            <Label className="text-base font-semibold">What type of missions do you want to host?</Label>
            <Textarea
              value={formData.mission_types}
              onChange={(e) => setFormData({ ...formData, mission_types: e.target.value })}
              placeholder="Describe the missions you'd like to create and lead..."
              className="mt-2 min-h-24"
              required
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Describe a time you brought a group to success</Label>
            <Textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Share a specific example of your leadership experience..."
              className="mt-2 min-h-32"
              required
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Video Introduction (Optional)</Label>
            <p className="text-sm text-slate-500 mb-2">Upload a short video or audio message</p>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.preventDefault();
                    e.currentTarget.previousElementSibling.click();
                  }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.video_url ? 'Change Video' : 'Upload Video'}
                    </>
                  )}
                </Button>
              </label>
            </div>
            {formData.video_url && (
              <p className="text-xs text-green-600 mt-2">✓ Video uploaded successfully</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitMutation.isPending || !formData.reason || !formData.mission_types || !formData.experience}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {submitMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}