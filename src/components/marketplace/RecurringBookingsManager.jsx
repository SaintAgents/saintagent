import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, CheckCircle, XCircle, Pause, Play, Calendar, Clock, User } from "lucide-react";

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-slate-100 text-slate-600',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const freqLabels = { weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' };

export default function RecurringBookingsManager() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['recurringBookings', currentUser?.email],
    queryFn: async () => {
      const [asBuyer, asSeller] = await Promise.all([
        base44.entities.RecurringBooking.filter({ buyer_id: currentUser.email }, '-created_date', 50),
        base44.entities.RecurringBooking.filter({ seller_id: currentUser.email }, '-created_date', 50),
      ]);
      // Deduplicate
      const map = new Map();
      [...asBuyer, ...asSeller].forEach(b => map.set(b.id, b));
      return Array.from(map.values()).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!currentUser?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RecurringBooking.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurringBookings'] }),
  });

  const handleAction = (booking, action) => {
    const statusMap = {
      approve: 'active',
      pause: 'paused',
      resume: 'active',
      cancel: 'cancelled',
    };
    updateMutation.mutate({ id: booking.id, data: { status: statusMap[action] } });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Repeat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No recurring bookings yet</p>
          <p className="text-xs text-slate-400 mt-1">Book a recurring session from any listing that offers it</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map(booking => {
        const isSeller = booking.seller_id === currentUser?.email;
        const otherName = isSeller ? booking.buyer_name : booking.seller_name;
        const dayLabel = booking.frequency === 'monthly'
          ? `${booking.day_of_month}th of each month`
          : `${DAYS[booking.day_of_week]}s`;

        return (
          <Card key={booking.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{booking.listing_title}</h4>
                    <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Repeat className="w-3 h-3" />
                      {freqLabels[booking.frequency]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {isSeller ? 'Client' : 'Provider'}: {otherName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dayLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.time_slot} · {booking.duration_minutes}min
                    </span>
                  </div>
                  {booking.next_session_date && booking.status === 'active' && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Next: {new Date(booking.next_session_date).toLocaleDateString()} at {booking.time_slot}
                    </p>
                  )}
                  {booking.sessions_completed > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {booking.sessions_completed} session{booking.sessions_completed > 1 ? 's' : ''} completed
                      {booking.total_sessions ? ` / ${booking.total_sessions}` : ''}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSeller && booking.status === 'pending' && (
                    <>
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => handleAction(booking, 'approve')}>
                        <CheckCircle className="w-3 h-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600" onClick={() => handleAction(booking, 'cancel')}>
                        <XCircle className="w-3 h-3" /> Decline
                      </Button>
                    </>
                  )}
                  {booking.status === 'active' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAction(booking, 'pause')}>
                      <Pause className="w-3 h-3" /> Pause
                    </Button>
                  )}
                  {booking.status === 'paused' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleAction(booking, 'resume')}>
                      <Play className="w-3 h-3" /> Resume
                    </Button>
                  )}
                  {(booking.status === 'active' || booking.status === 'paused') && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600" onClick={() => handleAction(booking, 'cancel')}>
                      <XCircle className="w-3 h-3" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}