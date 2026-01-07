import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export default function EventDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const all = await base44.entities.Event.list('-created_date', 200);
      return all.find(e => e.id === eventId);
    },
    enabled: !!eventId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Event not found</h2>
          <Button onClick={() => window.location.href = createPageUrl('Matches')}>Back to Matches</Button>
        </div>
      </div>
    );
  }

  const start = event.start_time ? new Date(event.start_time) : null;
  const end = event.end_time ? new Date(event.end_time) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = createPageUrl('Matches')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-violet-100 text-violet-700 capitalize">{event.status || 'upcoming'}</Badge>
                {event.location && (
                  <Badge variant="outline" className="capitalize">{event.location}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
              {event.description && (
                <p className="text-slate-700 max-w-2xl">{event.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {event.image_url && (
            <Card>
              <CardContent className="p-0">
                <img src={event.image_url} alt={event.title} className="w-full h-64 object-cover rounded-xl" />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 space-y-4">
              {start && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Starts</p>
                    <p className="text-sm font-semibold text-slate-800">{start.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {end && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Ends</p>
                    <p className="text-sm font-semibold text-slate-800">{end.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-800">{event.location}</p>
                </div>
              )}
              {event.online_link && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-slate-500" />
                  <a href={event.online_link} target="_blank" rel="noreferrer" className="text-sm text-violet-700 hover:underline">
                    Join link
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs text-slate-600 font-medium mb-2">Hosted by</p>
              <p className="font-semibold text-slate-800">{event.host_name || 'Unknown'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}