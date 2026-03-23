import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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
        // Get busy times for a date range
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
        // Create a Google Calendar event
        const { summary, description, startTime, endTime, attendeeEmails } = params;
        
        const eventBody = {
          summary,
          description: description || '',
          start: {
            dateTime: startTime,
            timeZone: 'UTC'
          },
          end: {
            dateTime: endTime,
            timeZone: 'UTC'
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

      default:
        return Response.json({ error: 'Invalid action. Use: getFreeBusy, createEvent' }, { status: 400 });
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});