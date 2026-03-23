import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, hostEmail, date, startTime, endTime, title, description, guestEmail, guestName, duration } = await req.json();

    // Get Google Calendar access token via connector
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    switch (action) {
      case 'getFreeBusy': {
        // Fetch free/busy for a given date range
        if (!date) {
          return Response.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
        }

        const dayStart = new Date(date + 'T00:00:00Z');
        const dayEnd = new Date(date + 'T23:59:59Z');

        const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timeMin: dayStart.toISOString(),
            timeMax: dayEnd.toISOString(),
            items: [{ id: 'primary' }]
          })
        });

        if (!fbRes.ok) {
          const errText = await fbRes.text();
          console.error('FreeBusy API error:', fbRes.status, errText);
          return Response.json({ error: 'Failed to fetch calendar data', details: errText }, { status: 500 });
        }

        const fbData = await fbRes.json();
        const busySlots = fbData.calendars?.primary?.busy || [];

        return Response.json({ success: true, busySlots, date });
      }

      case 'createEvent': {
        // Create a Google Calendar event
        if (!startTime || !endTime || !title) {
          return Response.json({ error: 'startTime, endTime, and title are required' }, { status: 400 });
        }

        const eventBody = {
          summary: title,
          description: description || '',
          start: {
            dateTime: startTime,
            timeZone: 'UTC'
          },
          end: {
            dateTime: endTime,
            timeZone: 'UTC'
          },
          attendees: []
        };

        if (guestEmail) {
          eventBody.attendees.push({ email: guestEmail, displayName: guestName || '' });
        }

        const eventRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventBody)
        });

        if (!eventRes.ok) {
          const errText = await eventRes.text();
          console.error('Create event error:', errText);
          return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
        }

        const eventData = await eventRes.json();

        return Response.json({
          success: true,
          event: {
            id: eventData.id,
            htmlLink: eventData.htmlLink,
            summary: eventData.summary,
            start: eventData.start,
            end: eventData.end
          }
        });
      }

      case 'getEvents': {
        // Fetch events for a date range
        if (!date) {
          return Response.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
        }

        const timeMin = new Date(date + 'T00:00:00Z').toISOString();
        const timeMax = new Date(date + 'T23:59:59Z').toISOString();

        const eventsRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=50`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        if (!eventsRes.ok) {
          const errText = await eventsRes.text();
          console.error('Get events error:', errText);
          return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
        }

        const eventsData = await eventsRes.json();
        const events = (eventsData.items || []).map(e => ({
          id: e.id,
          summary: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          status: e.status
        }));

        return Response.json({ success: true, events, date });
      }

      default:
        return Response.json({ error: 'Invalid action. Use: getFreeBusy, createEvent, getEvents' }, { status: 400 });
    }

  } catch (error) {
    console.error('Calendar booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});