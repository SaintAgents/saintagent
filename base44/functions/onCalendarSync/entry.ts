import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    
    const state = body.data?._provider_meta?.['x-goog-resource-state'];
    console.info('Calendar webhook received, state:', state);

    // Acknowledge sync notification
    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load sync token from SyncState entity
    const existing = await base44.asServiceRole.entities.SyncState.filter({ sync_type: 'google_calendar' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100';
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      url += '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    let res = await fetch(url, { headers: authHeader });
    if (res.status === 410) {
      // syncToken expired — do a fresh sync
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100'
        + '&timeMin=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }
    
    if (!res.ok) {
      console.error('Calendar API error:', res.status, await res.text());
      return Response.json({ status: 'api_error' });
    }

    // Drain all pages — nextSyncToken only appears on the last page
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

    console.info(`Calendar sync: ${allItems.length} changed events`);

    // Process changed events — update Meeting entities if matched
    for (const event of allItems) {
      if (event.status === 'cancelled') {
        // Try to find and cancel matching meeting
        const meetings = await base44.asServiceRole.entities.Meeting.filter({ 
          google_event_id: event.id 
        });
        for (const m of meetings) {
          await base44.asServiceRole.entities.Meeting.update(m.id, { status: 'cancelled' });
          console.info(`Cancelled meeting ${m.id} from calendar event ${event.id}`);
        }
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
          sync_type: 'google_calendar',
          sync_token: newSyncToken,
          last_synced_at: new Date().toISOString()
        });
      }
    }

    return Response.json({ status: 'ok', events_processed: allItems.length });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});