import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquarePlus } from 'lucide-react';

export default function AddNoteModal({ open, onClose, entityType, entityId }) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      const profile = profiles?.[0];
      
      if (entityType === 'deal') {
        await base44.entities.DealNote.create({
          deal_id: entityId,
          content: note,
          author_id: user.email,
          author_name: user.full_name,
          author_avatar: profile?.avatar_url
        });
        await base44.entities.DealActivity.create({
          deal_id: entityId,
          activity_type: 'note_added',
          description: note.substring(0, 100) + (note.length > 100 ? '...' : ''),
          actor_id: user.email,
          actor_name: user.full_name
        });
        queryClient.invalidateQueries({ queryKey: ['dealNotes', entityId] });
        queryClient.invalidateQueries({ queryKey: ['dealActivities', entityId] });
      } else {
        await base44.entities.ProjectComment.create({
          project_id: entityId,
          content: note,
          author_id: user.email,
          author_name: user.full_name,
          author_avatar: profile?.avatar_url
        });
        await base44.entities.ProjectActivity.create({
          project_id: entityId,
          activity_type: 'comment_added',
          description: note.substring(0, 100) + (note.length > 100 ? '...' : ''),
          actor_id: user.email,
          actor_name: user.full_name
        });
        queryClient.invalidateQueries({ queryKey: ['projectComments', entityId] });
        queryClient.invalidateQueries({ queryKey: ['projectActivities', entityId] });
      }
      
      onClose();
      setNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-amber-500" />
            Add Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Add your note or comment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !note.trim()}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? 'Saving...' : 'Add Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}