import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sync_type } = await req.json();
    const results = { gmail: null, calendar: null };

    // Load contacts for matching
    const contacts = await base44.asServiceRole.entities.Contact.filter({ owner_id: user.email });
    const emailToContact = {};
    for (const c of contacts) {
      if (c.email) emailToContact[c.email.toLowerCase()] = c;
    }

    if (sync_type === 'gmail' || sync_type === 'all') {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
        const authHeader = { Authorization: `Bearer ${accessToken}` };

        // Fetch recent sent emails (last 7 days)
        const query = encodeURIComponent('in:sent newer_than:7d');
        const listRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=50`,
          { headers: authHeader }
        );

        if (listRes.ok) {
          const listData = await listRes.json();
          const messages = listData.messages || [];
          let matched = 0;

          for (const msg of messages) {
            // Check dedup
            const existing = await base44.asServiceRole.entities.ContactInteraction.filter({ external_id: `gmail_${msg.id}` });
            if (existing.length > 0) continue;

            const msgRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
              { headers: authHeader }
            );
            if (!msgRes.ok) continue;
            const msgData = await msgRes.json();

            const headers = msgData.payload?.headers || [];
            const toHeader = headers.find(h => h.name === 'To')?.value || '';
            const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
            const dateHeader = headers.find(h => h.name === 'Date')?.value;

            const recipientEmails = toHeader.split(',')
              .map(e => { const m = e.match(/<([^>]+)>/); return (m ? m[1] : e).trim().toLowerCase(); })
              .filter(Boolean);

            for (const recipEmail of recipientEmails) {
              const contact = emailToContact[recipEmail];
              if (contact) {
                await base44.asServiceRole.entities.ContactInteraction.create({
                  contact_id: contact.id,
                  contact_name: contact.name,
                  contact_email: recipEmail,
                  owner_id: user.email,
                  type: 'email_sent',
                  subject,
                  summary: `Sent email: "${subject}"`,
                  external_id: `gmail_${msg.id}`,
                  occurred_at: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
                  attendees: recipientEmails,
                  source: 'gmail'
                });

                await base44.asServiceRole.entities.Contact.update(contact.id, {
                  last_contact_date: new Date().toISOString().split('T')[0],
                  email_outreach_count: (contact.email_outreach_count || 0) + 1,
                  last_email_date: new Date().toISOString()
                });
                matched++;
              }
            }
          }
          results.gmail = { total: messages.length, matched };
        }
      } catch (e) {
        console.error('Gmail sync error:', e);
        results.gmail = { error: e.message };
      }
    }

    if (sync_type === 'calendar' || sync_type === 'all') {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
        const authHeader = { Authorization: `Bearer ${accessToken}` };

        const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const calRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&singleEvents=true&timeMin=${timeMin}`,
          { headers: authHeader }
        );

        if (calRes.ok) {
          const calData = await calRes.json();
          const events = calData.items || [];
          let matched = 0;

          for (const event of events) {
            if (event.status === 'cancelled' || !event.attendees?.length) continue;

            const existing = await base44.asServiceRole.entities.ContactInteraction.filter({ external_id: `gcal_${event.id}` });
            if (existing.length > 0) continue;

            const attendeeEmails = event.attendees.map(a => a.email?.toLowerCase()).filter(Boolean);
            const startTime = event.start?.dateTime || event.start?.date;
            const endTime = event.end?.dateTime || event.end?.date;
            let durationMinutes = 0;
            if (startTime && endTime) {
              durationMinutes = Math.round((new Date(endTime) - new Date(startTime)) / 60000);
            }

            for (const email of attendeeEmails) {
              const contact = emailToContact[email];
              if (contact) {
                await base44.asServiceRole.entities.ContactInteraction.create({
                  contact_id: contact.id,
                  contact_name: contact.name,
                  contact_email: email,
                  owner_id: user.email,
                  type: 'meeting',
                  subject: event.summary || '(No title)',
                  summary: `Meeting: "${event.summary || 'Untitled'}" (${durationMinutes}min)`,
                  external_id: `gcal_${event.id}`,
                  occurred_at: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
                  duration_minutes: durationMinutes,
                  attendees: attendeeEmails,
                  source: 'google_calendar',
                  metadata: { location: event.location, hangout_link: event.hangoutLink }
                });

                await base44.asServiceRole.entities.Contact.update(contact.id, {
                  last_contact_date: new Date(startTime || Date.now()).toISOString().split('T')[0]
                });
                matched++;
              }
            }
          }
          results.calendar = { total: events.length, matched };
        }
      } catch (e) {
        console.error('Calendar sync error:', e);
        results.calendar = { error: e.message };
      }
    }

    return Response.json({ status: 'ok', results });
  } catch (error) {
    console.error('Manual sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});