import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CONNECTOR_ID = '69dbcf881caf2b2b6b9102df';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeMin, timeMax } = await req.json();

    // Get the app user's Google Calendar connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    // Fetch free/busy info from Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ id: 'primary' }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Google Calendar API error:', err);
      return Response.json({ error: 'Failed to fetch calendar data', connected: false }, { status: 502 });
    }

    const data = await response.json();
    const busySlots = data.calendars?.primary?.busy || [];

    return Response.json({ 
      connected: true,
      busy: busySlots 
    });
  } catch (error) {
    // If the error is about no connection, return connected: false
    if (error.message?.includes('not connected') || error.message?.includes('No connection') || error.message?.includes('not found')) {
      return Response.json({ connected: false, busy: [] });
    }
    console.error('Error:', error.message);
    return Response.json({ error: error.message, connected: false }, { status: 500 });
  }
});