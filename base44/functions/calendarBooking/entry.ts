import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...params } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    switch (action) {
      case 'getFreeBusy': {
        const { timeMin, timeMax } = params;
        const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timeMin,
            timeMax,
            items: [{ id: 'primary' }]
          })
        });

        if (!res.ok) {
          const err = await res.text();
          console.error('FreeBusy error status:', res.status, 'body:', err);
          return Response.json({ error: 'Failed to fetch calendar availability', details: err }, { status: 500 });
        }

        const data = await res.json();
        const busySlots = data.calendars?.primary?.busy || [];
        return Response.json({ success: true, busySlots });
      }

      case 'createEvent': {
        const { summary, description, startTime, endTime, attendeeEmails, timeZone } = params;
        const tz = timeZone || 'UTC';
        
        const eventBody = {
          summary,
          description: description || '',
          start: {
            dateTime: startTime,
            timeZone: tz
          },
          end: {
            dateTime: endTime,
            timeZone: tz
          },
          attendees: (attendeeEmails || []).map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 30 },
              { method: 'popup', minutes: 10 }
            ]
          }
        };

        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventBody)
          }
        );

        if (!res.ok) {
          const err = await res.text();
          console.error('Create event error:', err);
          return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
        }

        const event = await res.json();
        return Response.json({
          success: true,
          event: {
            id: event.id,
            htmlLink: event.htmlLink,
            summary: event.summary,
            start: event.start,
            end: event.end
          }
        });
      }

      case 'listEvents': {
        // List upcoming events for busy-time blocking
        const { timeMin, timeMax } = params;
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=100`;
        
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!res.ok) {
          const err = await res.text();
          console.error('List events error:', res.status, err);
          return Response.json({ error: 'Failed to list calendar events' }, { status: 500 });
        }

        const data = await res.json();
        const events = (data.items || []).map(e => ({
          id: e.id,
          summary: e.summary || 'Busy',
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          status: e.status
        })).filter(e => e.status !== 'cancelled');

        return Response.json({ success: true, events });
      }

      default:
        return Response.json({ error: 'Invalid action. Use: getFreeBusy, createEvent, listEvents' }, { status: 400 });
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});