import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const state = body.data._provider_meta?.['x-goog-resource-state'];
    if (state === 'sync') {
      console.log('Calendar sync ack');
      return Response.json({ status: 'sync_ack' });
    }

    console.log('Calendar webhook:', state);

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load sync token
    const existing = await base44.asServiceRole.entities.SyncState.filter({ sync_type: 'google_calendar' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&singleEvents=true';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      // First sync — get events from last 30 days
      url += '&timeMin=' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    let res = await fetch(url, { headers: authHeader });
    if (res.status === 410) {
      // syncToken expired — fresh sync
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&singleEvents=true'
        + '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error('Calendar API error:', res.status, errText);
      return Response.json({ status: 'api_error' });
    }

    // Drain all pages
    const allItems = [];
    let pageData = await res.json();
    let newSyncToken = null;
    while (true) {
      allItems.push(...(pageData.items || []));
      if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
      if (!pageData.nextPageToken) break;
      const nextRes = await fetch(
        url + `&pageToken=${pageData.nextPageToken}`,
        { headers: authHeader }
      );
      if (!nextRes.ok) break;
      pageData = await nextRes.json();
    }

    console.log(`Calendar: ${allItems.length} changed events`);

    // Load contacts for attendee matching
    const contacts = await base44.asServiceRole.entities.Contact.filter({});
    const emailToContact = {};
    for (const c of contacts) {
      if (c.email) {
        emailToContact[c.email.toLowerCase()] = c;
      }
    }

    let matched = 0;

    for (const event of allItems) {
      if (event.status === 'cancelled') continue;
      if (!event.attendees?.length) continue;

      const eventId = event.id;

      // Check if already processed
      const existingInteraction = await base44.asServiceRole.entities.ContactInteraction.filter({ external_id: `gcal_${eventId}` });
      if (existingInteraction.length > 0) continue;

      const attendeeEmails = event.attendees
        .map(a => a.email?.toLowerCase())
        .filter(Boolean);

      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;
      let durationMinutes = 0;
      if (startTime && endTime) {
        durationMinutes = Math.round((new Date(endTime) - new Date(startTime)) / 60000);
      }

      // Match attendees to contacts
      for (const email of attendeeEmails) {
        const contact = emailToContact[email];
        if (contact) {
          await base44.asServiceRole.entities.ContactInteraction.create({
            contact_id: contact.id,
            contact_name: contact.name,
            contact_email: email,
            owner_id: contact.owner_id,
            interaction_type: 'meeting',
            subject: event.summary || '(No title)',
            summary: `Meeting: "${event.summary || 'Untitled'}" (${durationMinutes}min)`,
            external_id: `gcal_${eventId}`,
            occurred_at: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
            duration_minutes: durationMinutes,
            attendees: attendeeEmails,
            source: 'google_calendar',
            metadata: {
              location: event.location,
              hangout_link: event.hangoutLink,
              event_status: event.status
            }
          });

          // Update contact last_contact_date
          await base44.asServiceRole.entities.Contact.update(contact.id, {
            last_contact_date: new Date(startTime || Date.now()).toISOString().split('T')[0]
          });
          matched++;
        }
      }
    }

    // Save new sync token
    if (newSyncToken) {
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
          sync_token: newSyncToken,
          last_synced_at: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.SyncState.create({
          sync_type: 'google_calendar',
          sync_token: newSyncToken,
          last_synced_at: new Date().toISOString()
        });
      }
    }

    console.log(`Calendar sync complete: ${allItems.length} events, ${matched} matched to contacts`);
    return Response.json({ status: 'ok', processed: allItems.length, matched });
  } catch (error) {
    console.error('Calendar webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});