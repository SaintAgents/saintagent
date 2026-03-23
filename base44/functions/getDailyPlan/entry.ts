import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Google Calendar events (next 3 days)
    let calendarEvents = [];
    try {
      const { accessToken: calToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const calRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${threeDaysLater.toISOString()}&maxResults=30&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${calToken}` } }
      );
      if (calRes.ok) {
        const calData = await calRes.json();
        calendarEvents = (calData.items || []).map(e => ({
          title: e.summary || '(No title)',
          start: e.start?.dateTime || e.start?.date || '',
          end: e.end?.dateTime || e.end?.date || '',
          location: e.location || '',
          description: (e.description || '').substring(0, 200),
          allDay: !!e.start?.date && !e.start?.dateTime
        }));
      }
    } catch (e) {
      console.log('Calendar fetch error:', e.message);
    }

    // 2. Fetch recent Gmail messages (last 24h, max 15)
    let emails = [];
    try {
      const { accessToken: gmailToken } = await base44.asServiceRole.connectors.getConnection('gmail');
      const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=after:${oneDayAgo} is:unread`,
        { headers: { Authorization: `Bearer ${gmailToken}` } }
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const messageIds = (listData.messages || []).map(m => m.id);

        for (const id of messageIds.slice(0, 10)) {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${gmailToken}` } }
          );
          if (msgRes.ok) {
            const msg = await msgRes.json();
            const headers = msg.payload?.headers || [];
            const getH = (name) => headers.find(h => h.name === name)?.value || '';
            emails.push({
              subject: getH('Subject'),
              from: getH('From'),
              date: getH('Date'),
              snippet: (msg.snippet || '').substring(0, 150)
            });
          }
        }
      }
    } catch (e) {
      console.log('Gmail fetch error:', e.message);
    }

    // 3. Use LLM to create prioritized daily plan
    const prompt = `You are a productivity assistant. Given the user's upcoming calendar events and recent emails, create a prioritized daily plan for today and tomorrow.

CALENDAR EVENTS (next 3 days):
${calendarEvents.length > 0 ? JSON.stringify(calendarEvents, null, 2) : 'No upcoming events'}

RECENT UNREAD EMAILS (last 24h):
${emails.length > 0 ? JSON.stringify(emails, null, 2) : 'No unread emails'}

Create a structured daily plan with:
1. High-priority tasks (meetings to prepare for, urgent emails to respond to)
2. Medium-priority tasks (follow-ups, non-urgent items)
3. Low-priority tasks (nice-to-have, optional)

For each task, include a brief reason why it's prioritized that way. Also include 2-3 suggested tasks that aren't directly from the calendar/email but would be productive given the context.

Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;

    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Brief 1-2 sentence overview of the day" },
          high_priority: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                reason: { type: "string" },
                time: { type: "string" },
                source: { type: "string", enum: ["calendar", "email", "suggested"] }
              }
            }
          },
          medium_priority: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                reason: { type: "string" },
                time: { type: "string" },
                source: { type: "string", enum: ["calendar", "email", "suggested"] }
              }
            }
          },
          low_priority: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                reason: { type: "string" },
                source: { type: "string", enum: ["calendar", "email", "suggested"] }
              }
            }
          },
          suggested_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({
      plan,
      raw: { calendarEvents, emailCount: emails.length },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('getDailyPlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});