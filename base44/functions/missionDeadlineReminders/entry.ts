import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const missions = await base44.asServiceRole.entities.Mission.filter({ status: 'active' });
    
    const reminderOffsets = [
      { hours: 168, label: '7 days', key: '7d' },
      { hours: 72, label: '3 days', key: '3d' },
      { hours: 24, label: '24 hours', key: '24h' },
      { hours: 1, label: '1 hour', key: '1h' },
    ];

    let totalNotified = 0;

    for (const mission of missions) {
      if (!mission.end_time) continue;

      const deadline = new Date(mission.end_time);
      const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

      if (hoursUntilDeadline <= 0) continue; // Already past

      for (const offset of reminderOffsets) {
        // Check if we're within the reminder window (± 3 hours for daily check)
        if (hoursUntilDeadline <= offset.hours && hoursUntilDeadline > (offset.hours - 6)) {
          // Check if we already sent this reminder (use metadata to track)
          const idempotencyKey = `deadline_${mission.id}_${offset.key}`;
          const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
            type: 'mission'
          });
          const alreadySent = existingNotifs.some(n => 
            n.metadata?.idempotency_key === idempotencyKey
          );

          if (alreadySent) continue;

          // Notify all participants + creator
          const recipients = new Set([
            ...(mission.participant_ids || []),
            mission.creator_id
          ].filter(Boolean));

          const promises = [];
          for (const recipientId of recipients) {
            promises.push(
              base44.asServiceRole.entities.Notification.create({
                user_id: recipientId,
                type: 'mission',
                title: `Mission deadline in ${offset.label}`,
                message: `"${mission.title}" ends in ${offset.label}. Make sure to complete your tasks!`,
                action_url: `/MissionDetail?id=${mission.id}`,
                priority: offset.hours <= 24 ? 'high' : 'normal',
                metadata: { 
                  mission_id: mission.id, 
                  event_type: 'deadline_reminder', 
                  deadline: mission.end_time,
                  offset_key: offset.key,
                  idempotency_key: idempotencyKey
                }
              })
            );

            // Send email for 24h and 1h reminders
            if (offset.hours <= 24) {
              promises.push(
                base44.asServiceRole.integrations.Core.SendEmail({
                  to: recipientId,
                  subject: `⏰ Mission "${mission.title}" ends in ${offset.label}`,
                  body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                    <h2 style="color:#f59e0b;">⏰ Deadline Approaching</h2>
                    <p><strong>"${mission.title}"</strong> ends in <strong>${offset.label}</strong>.</p>
                    <p>Make sure all your tasks are completed before the deadline.</p>
                    <div style="margin-top:20px;">
                      <a href="/MissionDetail?id=${mission.id}" 
                         style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
                        View Mission
                      </a>
                    </div>
                  </div>`
                }).catch(e => console.warn('Email failed:', e.message))
              );
            }
          }

          await Promise.allSettled(promises);
          totalNotified += recipients.size;
        }
      }
    }

    return Response.json({ 
      success: true, 
      missions_checked: missions.length, 
      total_notified: totalNotified 
    });
  } catch (error) {
    console.error('MissionDeadlineReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});