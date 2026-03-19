import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // Check resource state from provider metadata
    const state = body.data?._provider_meta?.['x-goog-resource-state'];
    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    // Get Calendar access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load sync token from SyncState
    const existing = await base44.asServiceRole.entities.SyncState.filter({ sync_type: 'googlecalendar' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&singleEvents=true';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      // First sync: get events from last 30 days
      url += '&timeMin=' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    let res = await fetch(url, { headers: authHeader });

    // If syncToken expired (410 Gone), do fresh sync
    if (res.status === 410) {
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&singleEvents=true'
        + '&timeMin=' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error('Calendar API error:', res.status, errText);
      return Response.json({ status: 'api_error', detail: errText });
    }

    // Drain all pages to get nextSyncToken
    const allItems = [];
    let pageData = await res.json();
    let newSyncToken = null;

    while (true) {
      allItems.push(...(pageData.items || []));
      if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
      if (!pageData.nextPageToken) break;

      const nextUrl = url + `&pageToken=${pageData.nextPageToken}`;
      const nextRes = await fetch(nextUrl, { headers: authHeader });
      if (!nextRes.ok) break;
      pageData = await nextRes.json();
    }

    // Load all contacts for email matching
    const contacts = await base44.asServiceRole.entities.Contact.list('-created_date', 5000);
    const contactByEmail = {};
    for (const c of contacts) {
      if (c.email) {
        contactByEmail[c.email.toLowerCase()] = c;
      }
    }

    // Get the authorized user's email for filtering
    const profileRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      headers: authHeader
    });
    const calendarOwnerEmail = profileRes.ok ? (await profileRes.json()).id : '';

    let created = 0;

    for (const event of allItems) {
      // Skip cancelled events, all-day events without attendees
      if (event.status === 'cancelled') continue;
      if (!event.attendees || event.attendees.length === 0) continue;

      const eventId = event.id;
      const externalId = `gcal_${eventId}`;

      // Check if already tracked
      const existingInteractions = await base44.asServiceRole.entities.ContactInteraction.filter({
        external_id: externalId
      });
      if (existingInteractions.length > 0) continue;

      // Find matching contacts from attendees
      const attendeeEmails = event.attendees
        .map(a => a.email?.toLowerCase())
        .filter(e => e && e !== calendarOwnerEmail.toLowerCase());

      for (const attendeeEmail of attendeeEmails) {
        const matchedContact = contactByEmail[attendeeEmail];
        if (!matchedContact) continue;

        // Calculate duration
        let durationMinutes = 30;
        if (event.start?.dateTime && event.end?.dateTime) {
          const start = new Date(event.start.dateTime);
          const end = new Date(event.end.dateTime);
          durationMinutes = Math.round((end - start) / 60000);
        }

        const occurredAt = event.start?.dateTime || event.start?.date || new Date().toISOString();

        await base44.asServiceRole.entities.ContactInteraction.create({
          contact_id: matchedContact.id,
          contact_name: matchedContact.name,
          contact_email: attendeeEmail,
          interaction_type: 'meeting',
          direction: 'outbound',
          subject: event.summary || 'Meeting',
          snippet: event.description?.substring(0, 200) || '',
          body: event.description || '',
          occurred_at: new Date(occurredAt).toISOString(),
          duration_minutes: durationMinutes,
          source: 'gcal',
          external_id: externalId,
          attendees: event.attendees.map(a => a.email).filter(Boolean),
          location: event.location || '',
          meeting_link: event.hangoutLink || '',
          owner_id: matchedContact.owner_id || ''
        });

        // Update contact's last_contact_date
        await base44.asServiceRole.entities.Contact.update(matchedContact.id, {
          last_contact_date: new Date(occurredAt).toISOString().split('T')[0]
        });
        created++;
      }
    }

    // Save the new syncToken
    if (newSyncToken) {
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
          sync_token: newSyncToken,
          last_synced_at: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.SyncState.create({
          sync_type: 'googlecalendar',
          sync_token: newSyncToken,
          last_synced_at: new Date().toISOString()
        });
      }
    }

    console.log(`Calendar sync complete: processed ${allItems.length} events, created ${created} interactions`);
    return Response.json({ status: 'ok', processed: allItems.length, created });

  } catch (error) {
    console.error('Calendar webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});