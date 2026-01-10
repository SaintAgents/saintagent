import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, Video, MapPin, Send, Loader2, ShoppingBag, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

export default function BookingModal({ open, onClose, match }) {
  const [tab, setTab] = useState('listings');
  const [selectedListing, setSelectedListing] = useState(null);
  const [meetingNote, setMeetingNote] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfileForBooking', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  // Fetch listings from the matched user
  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['userListings', match?.target_id],
    queryFn: () => base44.entities.Listing.filter({ owner_id: match.target_id, status: 'active' }),
    enabled: !!match?.target_id && open
  });

  // Create meeting request mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (data) => {
      const meeting = await base44.entities.Meeting.create(data);
      // Send notification to the target user
      await base44.entities.Notification.create({
        user_id: match.target_id,
        type: 'meeting',
        title: 'New Meeting Request',
        message: `${currentUser.full_name} wants to meet with you${selectedListing ? ` for "${selectedListing.title}"` : ''}`,
        action_url: `/Meetings`,
        source_user_id: currentUser.email,
        source_user_name: currentUser.full_name,
        source_user_avatar: myProfile?.[0]?.avatar_url
      });
      return meeting;
    },
    onSuccess: () => {
      toast.success('Meeting request sent!');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to send request: ' + error.message);
    }
  });

  const resetForm = () => {
    setSelectedListing(null);
    setMeetingNote('');
    setProposedTime('');
    setTab('listings');
  };

  const handleSendRequest = () => {
    if (!proposedTime) {
      toast.error('Please select a proposed time');
      return;
    }

    createMeetingMutation.mutate({
      title: selectedListing ? selectedListing.title : `Meeting with ${match.target_name}`,
      host_id: match.target_id,
      guest_id: currentUser.email,
      host_name: match.target_name,
      guest_name: currentUser.full_name,
      host_avatar: match.target_avatar,
      guest_avatar: myProfile?.[0]?.avatar_url,
      scheduled_time: proposedTime,
      duration_minutes: selectedListing?.duration_minutes || 30,
      status: 'pending',
      meeting_type: selectedListing?.category || 'casual',
      notes: meetingNote,
      online_link: selectedListing?.delivery_mode === 'online' ? 'TBD' : ''
    });
  };

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    setTab('request');
  };

  const handleDirectRequest = () => {
    setSelectedListing(null);
    setTab('request');
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={match.target_avatar} />
              <AvatarFallback>{match.target_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div>Book with {match.target_name}</div>
              <p className="text-sm font-normal text-slate-500">{match.target_subtitle}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="listings" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Their Offerings
            </TabsTrigger>
            <TabsTrigger value="request" className="gap-2">
              <CalendarPlus className="w-4 h-4" />
              Send Request
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-4 space-y-3">
            {listingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-2">No active listings</p>
                <p className="text-sm text-slate-500 mb-4">
                  You can still send a direct meeting request
                </p>
                <Button onClick={handleDirectRequest} className="gap-2">
                  <CalendarPlus className="w-4 h-4" />
                  Send Meeting Request
                </Button>
              </div>
            ) : (
              <>
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="p-4 border rounded-xl hover:border-violet-300 hover:bg-violet-50/50 cursor-pointer transition-all"
                    onClick={() => handleSelectListing(listing)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900">{listing.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {listing.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {listing.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {listing.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        {listing.delivery_mode === 'online' ? (
                          <Video className="w-3.5 h-3.5" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5" />
                        )}
                        {listing.delivery_mode}
                      </span>
                      {listing.is_free ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <DollarSign className="w-3.5 h-3.5" />
                          {listing.price_amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <Button variant="outline" onClick={handleDirectRequest} className="w-full gap-2">
                    <CalendarPlus className="w-4 h-4" />
                    Or Send a General Meeting Request
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="request" className="mt-4 space-y-4">
            {selectedListing && (
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                <p className="text-sm text-violet-700">
                  <span className="font-medium">Booking:</span> {selectedListing.title}
                </p>
                <p className="text-xs text-violet-600 mt-1">
                  {selectedListing.duration_minutes} min • {selectedListing.delivery_mode}
                  {!selectedListing.is_free && ` • $${selectedListing.price_amount}`}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Proposed Time *
              </label>
              <Input
                type="datetime-local"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Message (optional)
              </label>
              <Textarea
                placeholder="Add a note about what you'd like to discuss..."
                value={meetingNote}
                onChange={(e) => setMeetingNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setTab('listings')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSendRequest}
                disabled={createMeetingMutation.isPending || !proposedTime}
                className="flex-1 bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {createMeetingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Request
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}