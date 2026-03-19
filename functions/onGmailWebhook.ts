import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // 1. Decode Pub/Sub notification
    const decoded = JSON.parse(atob(body.data.message.data));
    const currentHistoryId = String(decoded.historyId);
    const userEmail = decoded.emailAddress;

    // 2. Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // 3. Load previous historyId from SyncState
    const existing = await base44.asServiceRole.entities.SyncState.filter({ sync_type: 'gmail' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    if (!syncRecord) {
      // First run: save baseline historyId
      await base44.asServiceRole.entities.SyncState.create({
        sync_type: 'gmail',
        history_id: currentHistoryId,
        last_synced_at: new Date().toISOString()
      });
      return Response.json({ status: 'initialized' });
    }

    // 4. Fetch changes since last known historyId
    const prevHistoryId = syncRecord.history_id;
    const historyUrl = `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${prevHistoryId}&historyTypes=messageAdded`;
    const historyRes = await fetch(historyUrl, { headers: authHeader });

    if (!historyRes.ok) {
      const errText = await historyRes.text();
      console.error('History API error:', historyRes.status, errText);
      return Response.json({ status: 'history_error', detail: errText });
    }

    const historyData = await historyRes.json();

    if (!historyData.history) {
      // No new changes
      await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
        history_id: currentHistoryId,
        last_synced_at: new Date().toISOString()
      });
      return Response.json({ status: 'no_changes' });
    }

    // 5. Collect unique message IDs
    const messageIds = new Set();
    for (const entry of historyData.history) {
      if (entry.messagesAdded) {
        for (const msg of entry.messagesAdded) {
          messageIds.add(msg.message.id);
        }
      }
    }

    // 6. Load all contacts for email matching
    const contacts = await base44.asServiceRole.entities.Contact.list('-created_date', 5000);
    const contactByEmail = {};
    for (const c of contacts) {
      if (c.email) {
        contactByEmail[c.email.toLowerCase()] = c;
      }
    }

    // 7. Process each message
    let created = 0;
    for (const msgId of messageIds) {
      // Check if we already have this interaction
      const existingInteractions = await base44.asServiceRole.entities.ContactInteraction.filter({
        external_id: `gmail_${msgId}`
      });
      if (existingInteractions.length > 0) continue;

      // Fetch message metadata
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: authHeader }
      );
      if (!msgRes.ok) continue;

      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];
      const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('From');
      const to = getHeader('To');
      const subject = getHeader('Subject');
      const dateStr = getHeader('Date');

      // Extract email addresses
      const extractEmail = (str) => {
        const match = str.match(/<([^>]+)>/);
        return match ? match[1].toLowerCase() : str.toLowerCase().trim();
      };

      const fromEmail = extractEmail(from);
      const toEmails = to.split(',').map(e => extractEmail(e.trim()));

      // Determine direction and find matching contact
      const isSent = fromEmail === userEmail.toLowerCase();
      let matchedContact = null;
      let matchedEmail = '';

      if (isSent) {
        // Outbound: match To addresses against contacts
        for (const toEmail of toEmails) {
          if (contactByEmail[toEmail]) {
            matchedContact = contactByEmail[toEmail];
            matchedEmail = toEmail;
            break;
          }
        }
      } else {
        // Inbound: match From address against contacts
        if (contactByEmail[fromEmail]) {
          matchedContact = contactByEmail[fromEmail];
          matchedEmail = fromEmail;
        }
      }

      // Only create interaction if we found a matching contact
      if (matchedContact) {
        await base44.asServiceRole.entities.ContactInteraction.create({
          contact_id: matchedContact.id,
          contact_name: matchedContact.name,
          contact_email: matchedEmail,
          interaction_type: isSent ? 'email_sent' : 'email_received',
          direction: isSent ? 'outbound' : 'inbound',
          subject: subject,
          snippet: msgData.snippet || '',
          occurred_at: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
          source: 'gmail',
          external_id: `gmail_${msgId}`,
          owner_id: matchedContact.owner_id || ''
        });

        // Update contact's last_contact_date and email_outreach_count
        const updateData = {
          last_contact_date: new Date().toISOString().split('T')[0]
        };
        if (isSent) {
          updateData.email_outreach_count = (matchedContact.email_outreach_count || 0) + 1;
          updateData.last_email_date = new Date().toISOString();
        }
        await base44.asServiceRole.entities.Contact.update(matchedContact.id, updateData);
        created++;
      }
    }

    // 8. Update stored historyId
    await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
      history_id: currentHistoryId,
      last_synced_at: new Date().toISOString()
    });

    console.log(`Gmail sync complete: processed ${messageIds.size} messages, created ${created} interactions`);
    return Response.json({ status: 'ok', processed: messageIds.size, created });

  } catch (error) {
    console.error('Gmail webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});