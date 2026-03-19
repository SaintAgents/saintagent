import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // Decode Pub/Sub notification
    const decoded = JSON.parse(atob(body.data.message.data));
    const currentHistoryId = String(decoded.historyId);
    const emailAddress = decoded.emailAddress;

    console.log(`Gmail webhook: historyId=${currentHistoryId}, email=${emailAddress}`);

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Load previous sync state
    const existing = await base44.asServiceRole.entities.SyncState.filter({ sync_type: 'gmail' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    if (!syncRecord) {
      // First run — save baseline historyId
      await base44.asServiceRole.entities.SyncState.create({
        sync_type: 'gmail',
        history_id: currentHistoryId,
        owner_email: emailAddress,
        last_synced_at: new Date().toISOString()
      });
      console.log('Gmail sync initialized with baseline historyId');
      return Response.json({ status: 'initialized' });
    }

    const prevHistoryId = syncRecord.history_id;

    // Fetch changes since last known historyId
    const historyUrl = `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${prevHistoryId}&historyTypes=messageAdded&labelId=SENT`;
    const historyRes = await fetch(historyUrl, { headers: authHeader });

    if (!historyRes.ok) {
      const errText = await historyRes.text();
      console.error('History API error:', historyRes.status, errText);
      // If 404, the historyId is too old — reset
      if (historyRes.status === 404) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
          history_id: currentHistoryId,
          last_synced_at: new Date().toISOString()
        });
        return Response.json({ status: 'history_reset' });
      }
      return Response.json({ status: 'history_error' });
    }

    const historyData = await historyRes.json();
    const messageIds = new Set();

    if (historyData.history) {
      for (const entry of historyData.history) {
        if (entry.messagesAdded) {
          for (const msg of entry.messagesAdded) {
            // Only process sent emails
            if (msg.message.labelIds?.includes('SENT')) {
              messageIds.add(msg.message.id);
            }
          }
        }
      }
    }

    console.log(`Found ${messageIds.size} new sent messages`);

    // Load all contacts for email matching
    const contacts = await base44.asServiceRole.entities.Contact.filter({});

    // Build email -> contact map
    const emailToContact = {};
    for (const c of contacts) {
      if (c.email) {
        emailToContact[c.email.toLowerCase()] = c;
      }
    }

    let matched = 0;

    // Process each message
    for (const msgId of messageIds) {
      // Check if already processed
      const existingInteraction = await base44.asServiceRole.entities.ContactInteraction.filter({ external_id: `gmail_${msgId}` });
      if (existingInteraction.length > 0) continue;

      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: authHeader }
      );

      if (!msgRes.ok) continue;
      const msgData = await msgRes.json();

      const headers = msgData.payload?.headers || [];
      const toHeader = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
      const dateHeader = headers.find(h => h.name === 'Date')?.value;

      // Parse recipient emails
      const recipientEmails = toHeader
        .split(',')
        .map(e => {
          const match = e.match(/<([^>]+)>/);
          return (match ? match[1] : e).trim().toLowerCase();
        })
        .filter(Boolean);

      // Match recipients to contacts
      for (const recipEmail of recipientEmails) {
        const contact = emailToContact[recipEmail];
        if (contact) {
          await base44.asServiceRole.entities.ContactInteraction.create({
            contact_id: contact.id,
            contact_name: contact.name,
            contact_email: recipEmail,
            owner_id: contact.owner_id,
            type: 'email_sent',
            subject: subject,
            summary: `Sent email: "${subject}"`,
            external_id: `gmail_${msgId}`,
            occurred_at: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
            attendees: recipientEmails,
            source: 'gmail'
          });

          // Update contact last_contact_date and email count
          const updates = {
            last_contact_date: new Date().toISOString().split('T')[0],
            email_outreach_count: (contact.email_outreach_count || 0) + 1,
            last_email_date: new Date().toISOString()
          };
          await base44.asServiceRole.entities.Contact.update(contact.id, updates);
          matched++;
        }
      }
    }

    // Update sync state
    await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
      history_id: currentHistoryId,
      last_synced_at: new Date().toISOString()
    });

    console.log(`Gmail sync complete: ${messageIds.size} messages, ${matched} matched to contacts`);
    return Response.json({ status: 'ok', processed: messageIds.size, matched });
  } catch (error) {
    console.error('Gmail webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});