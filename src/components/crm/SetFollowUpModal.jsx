import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Bell, Loader2 } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

const QUICK_OPTIONS = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '1 Month', days: 30 },
];

export default function SetFollowUpModal({ open, onClose, contact }) {
  const [followupDate, setFollowupDate] = useState(
    contact?.next_followup_date || format(addDays(new Date(), 3), 'yyyy-MM-dd')
  );
  const [followupNote, setFollowupNote] = useState(contact?.followup_note || '');
  const queryClient = useQueryClient();

  const updateFollowUpMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.update(contact.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      onClose();
    }
  });

  const handleQuickSelect = (days) => {
    setFollowupDate(format(addDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    updateFollowUpMutation.mutate({
      next_followup_date: followupDate,
      followup_note: followupNote || null
    });
  };

  const handleClear = () => {
    updateFollowUpMutation.mutate({
      next_followup_date: null,
      followup_note: null
    });
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Set Follow-Up Reminder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Set a reminder to follow up with <strong>{contact.name}</strong>
          </p>

          {/* Quick Select */}
          <div>
            <Label className="mb-2 block">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_OPTIONS.map(option => (
                <Button
                  key={option.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(option.days)}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <Label htmlFor="followup-date">Follow-up Date</Label>
            <Input
              id="followup-date"
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="mt-1"
            />
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="followup-note">Reminder Note (optional)</Label>
            <Textarea
              id="followup-note"
              placeholder="What do you want to follow up about?"
              value={followupNote}
              onChange={(e) => setFollowupNote(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            {contact.next_followup_date && (
              <Button 
                variant="ghost" 
                onClick={handleClear}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Clear Reminder
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!followupDate || updateFollowUpMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 gap-2"
              >
                {updateFollowUpMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Bell className="w-4 h-4 text-white" />
                )}
                <span className="text-white">Set Reminder</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}