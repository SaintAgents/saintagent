import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // Get Google Calendar access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    if (action === 'getFreeBusy') {
      // Get free/busy info for a date range
      const { dateFrom, dateTo } = body;
      
      const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          timeMin: dateFrom,
          timeMax: dateTo,
          items: [{ id: 'primary' }]
        })
      });

      if (!freeBusyRes.ok) {
        const err = await freeBusyRes.text();
        console.error('FreeBusy API error:', err);
        return Response.json({ error: 'Failed to fetch calendar availability' }, { status: 500 });
      }

      const freeBusyData = await freeBusyRes.json();
      const busySlots = freeBusyData.calendars?.primary?.busy || [];
      
      return Response.json({ success: true, busySlots });
    }

    if (action === 'createEvent') {
      // Create a Google Calendar event
      const { summary, description, startTime, endTime, attendeeEmail, location, meetingLink } = body;

      const event = {
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
        attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 }
          ]
        }
      };

      if (location) event.location = location;
      if (meetingLink) {
        event.description = (event.description ? event.description + '\n\n' : '') + 
          `Join meeting: ${meetingLink}`;
      }

      const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(event)
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error('Create event error:', err);
        return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
      }

      const createdEvent = await createRes.json();
      return Response.json({ 
        success: true, 
        event: {
          id: createdEvent.id,
          htmlLink: createdEvent.htmlLink,
          hangoutLink: createdEvent.hangoutLink
        }
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Calendar booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});