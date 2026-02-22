import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Bell, CheckCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function FollowUpReminderPanel({ contacts, onContactClick }) {
  const queryClient = useQueryClient();

  // Filter contacts with upcoming follow-ups
  const followUps = contacts
    .filter(c => c.next_followup_date)
    .sort((a, b) => new Date(a.next_followup_date) - new Date(b.next_followup_date));

  const overdue = followUps.filter(c => isPast(new Date(c.next_followup_date)) && !isToday(new Date(c.next_followup_date)));
  const today = followUps.filter(c => isToday(new Date(c.next_followup_date)));
  const tomorrow = followUps.filter(c => isTomorrow(new Date(c.next_followup_date)));
  const upcoming = followUps.filter(c => {
    const date = new Date(c.next_followup_date);
    return !isPast(date) && !isToday(date) && !isTomorrow(date);
  }).slice(0, 5);

  const markCompleteMutation = useMutation({
    mutationFn: (contact) => base44.entities.Contact.update(contact.id, {
      next_followup_date: null,
      followup_note: null,
      last_contact_date: format(new Date(), 'yyyy-MM-dd')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
    }
  });

  const snoozeFollowUpMutation = useMutation({
    mutationFn: ({ contact, days }) => base44.entities.Contact.update(contact.id, {
      next_followup_date: format(addDays(new Date(), days), 'yyyy-MM-dd')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
    }
  });

  const FollowUpItem = ({ contact, isOverdue = false }) => {
    const followupDate = new Date(contact.next_followup_date);
    
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50",
        isOverdue && "border-rose-200 bg-rose-50/50"
      )}
        onClick={() => onContactClick?.(contact)}
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={contact.avatar_url} />
          <AvatarFallback className="bg-violet-100 text-violet-600">
            {contact.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{contact.name}</p>
          {contact.followup_note && (
            <p className="text-xs text-slate-500 truncate">{contact.followup_note}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge className={cn(
              "text-xs",
              isOverdue ? "bg-rose-100 text-rose-700" :
              isToday(followupDate) ? "bg-amber-100 text-amber-700" :
              "bg-blue-100 text-blue-700"
            )}>
              <Clock className="w-3 h-3 mr-1" />
              {isOverdue ? 'Overdue' :
               isToday(followupDate) ? 'Today' :
               isTomorrow(followupDate) ? 'Tomorrow' :
               format(followupDate, 'MMM d')}
            </Badge>
            {contact.company && (
              <span className="text-xs text-slate-400">{contact.company}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              snoozeFollowUpMutation.mutate({ contact, days: 1 });
            }}
            title="Snooze 1 day"
          >
            <Clock className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              markCompleteMutation.mutate(contact);
            }}
            title="Mark complete"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </Button>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    );
  };

  if (followUps.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-600" />
          Follow-Up Reminders
          {(overdue.length + today.length) > 0 && (
            <Badge className="bg-amber-500 text-white">
              {overdue.length + today.length} due
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue */}
        {overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium text-rose-700">Overdue ({overdue.length})</span>
            </div>
            <div className="space-y-2">
              {overdue.map(contact => (
                <FollowUpItem key={contact.id} contact={contact} isOverdue />
              ))}
            </div>
          </div>
        )}

        {/* Today */}
        {today.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Today ({today.length})</span>
            </div>
            <div className="space-y-2">
              {today.map(contact => (
                <FollowUpItem key={contact.id} contact={contact} />
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow */}
        {tomorrow.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Tomorrow ({tomorrow.length})</span>
            </div>
            <div className="space-y-2">
              {tomorrow.map(contact => (
                <FollowUpItem key={contact.id} contact={contact} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Upcoming</span>
            </div>
            <div className="space-y-2">
              {upcoming.map(contact => (
                <FollowUpItem key={contact.id} contact={contact} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}