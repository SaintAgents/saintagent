import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, mission_id, task_index, milestone_index, join_request_id, new_status } = await req.json();

    if (action === 'task_completed') {
      // Notify all participants when a task is marked completed
      const missions = await base44.asServiceRole.entities.Mission.filter({ id: mission_id });
      const mission = missions?.[0];
      if (!mission) return Response.json({ error: 'Mission not found' }, { status: 404 });

      const taskTitle = milestone_index !== undefined 
        ? mission.milestones?.[milestone_index]?.tasks?.[task_index]?.title 
        : mission.tasks?.[task_index]?.title;

      const recipients = (mission.participant_ids || []).filter(id => id !== user.email);
      if (mission.creator_id && mission.creator_id !== user.email && !recipients.includes(mission.creator_id)) {
        recipients.push(mission.creator_id);
      }

      const notifications = [];
      for (const recipientId of recipients) {
        // Check notification preferences
        const prefs = await base44.asServiceRole.entities.UserProfile.filter({ user_id: recipientId });
        const profile = prefs?.[0];
        const notifPrefs = profile?.notification_prefs || {};

        // In-app notification
        notifications.push(
          base44.asServiceRole.entities.Notification.create({
            user_id: recipientId,
            type: 'mission',
            title: 'Task Completed',
            message: `"${taskTitle || 'A task'}" was completed in "${mission.title}" by ${user.full_name || user.email}`,
            action_url: `/MissionDetail?id=${mission_id}`,
            priority: 'normal',
            metadata: { mission_id, task_index, milestone_index, actor_id: user.email, event_type: 'task_completed' }
          })
        );

        // Email notification if enabled
        if (notifPrefs.email !== false) {
          notifications.push(
            base44.asServiceRole.integrations.Core.SendEmail({
              to: recipientId,
              subject: `Task Completed: ${mission.title}`,
              body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                <h2 style="color:#7c3aed;">Task Completed ✓</h2>
                <p><strong>"${taskTitle || 'A task'}"</strong> was marked as completed in <strong>${mission.title}</strong>.</p>
                <p>Completed by: ${user.full_name || user.email}</p>
                <div style="margin-top:20px;">
                  <a href="/MissionDetail?id=${mission_id}" 
                     style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
                    View Mission
                  </a>
                </div>
              </div>`
            }).catch(e => console.warn('Email send failed for', recipientId, e.message))
          );
        }
      }

      await Promise.allSettled(notifications);
      return Response.json({ success: true, notified: recipients.length });
    }

    if (action === 'join_request_status_changed') {
      // Notify the requester when their join request status changes
      const missions = await base44.asServiceRole.entities.Mission.filter({ id: mission_id });
      const mission = missions?.[0];
      if (!mission) return Response.json({ error: 'Mission not found' }, { status: 404 });

      const requests = await base44.asServiceRole.entities.MissionJoinRequest.filter({ id: join_request_id });
      const joinReq = requests?.[0];
      if (!joinReq) return Response.json({ error: 'Join request not found' }, { status: 404 });

      const statusMessages = {
        approved: { title: 'Mission Request Approved!', msg: `You've been approved to join "${mission.title}"` },
        rejected: { title: 'Mission Request Update', msg: `Your request to join "${mission.title}" was not approved` },
      };

      const info = statusMessages[new_status];
      if (!info) return Response.json({ error: 'Unknown status' }, { status: 400 });

      const promises = [
        base44.asServiceRole.entities.Notification.create({
          user_id: joinReq.user_id,
          type: 'mission',
          title: info.title,
          message: info.msg,
          action_url: new_status === 'approved' ? `/MissionDetail?id=${mission_id}` : '/Missions',
          priority: 'high',
          metadata: { mission_id, join_request_id, event_type: 'join_request_' + new_status, actor_id: user.email }
        })
      ];

      // Send email too
      const prefs = await base44.asServiceRole.entities.UserProfile.filter({ user_id: joinReq.user_id });
      const profile = prefs?.[0];
      if (profile?.notification_prefs?.email !== false) {
        promises.push(
          base44.asServiceRole.integrations.Core.SendEmail({
            to: joinReq.user_id,
            subject: info.title,
            body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#7c3aed;">${info.title}</h2>
              <p>${info.msg}</p>
              <div style="margin-top:20px;">
                <a href="/MissionDetail?id=${mission_id}" 
                   style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">
                  View Mission
                </a>
              </div>
            </div>`
          }).catch(e => console.warn('Email failed:', e.message))
        );
      }

      await Promise.allSettled(promises);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('MissionNotificationEngine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});