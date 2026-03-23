import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all meetings scheduled in the next hour
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    // Fetch scheduled/accepted meetings
    const meetings = await base44.asServiceRole.entities.Meeting.filter({
      status: { $in: ['scheduled', 'accepted'] }
    }, '-scheduled_time', 100);
    
    // Filter meetings happening in the next 1-2 hours
    const upcomingMeetings = meetings.filter(m => {
      const meetingTime = new Date(m.scheduled_time);
      return meetingTime >= oneHourFromNow && meetingTime <= twoHoursFromNow;
    });
    
    const remindersSent = [];
    
    for (const meeting of upcomingMeetings) {
      const meetingTime = new Date(meeting.scheduled_time);
      const formattedTime = meetingTime.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      // Send email to host
      if (meeting.host_id) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: meeting.host_id,
            subject: `⏰ Meeting Reminder: ${meeting.title}`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="margin: 0;">⏰ Meeting Starting Soon!</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
                  <p>Hi ${meeting.host_name || 'there'},</p>
                  <p>Your meeting is starting in about <strong>1 hour</strong>.</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
                    <p><strong>📌 ${meeting.title}</strong></p>
                    <p><strong>🕐 When:</strong> ${formattedTime}</p>
                    <p><strong>👤 With:</strong> ${meeting.guest_name || 'Guest'}</p>
                    <p><strong>⏱️ Duration:</strong> ${meeting.duration_minutes || 30} minutes</p>
                  </div>
                  ${meeting.online_link ? `
                    <div style="text-align: center;">
                      <a href="${meeting.online_link}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Join Meeting</a>
                    </div>
                  ` : ''}
                </div>
              </div>
            `
          });
          remindersSent.push({ type: 'host', email: meeting.host_id, meeting: meeting.title });
        } catch (err) {
          console.error('Failed to send host reminder:', err);
        }
      }
      
      // Send email to guest
      if (meeting.guest_id) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: meeting.guest_id,
            subject: `⏰ Meeting Reminder: ${meeting.title}`,
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="margin: 0;">⏰ Meeting Starting Soon!</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
                  <p>Hi ${meeting.guest_name || 'there'},</p>
                  <p>Your meeting is starting in about <strong>1 hour</strong>.</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
                    <p><strong>📌 ${meeting.title}</strong></p>
                    <p><strong>🕐 When:</strong> ${formattedTime}</p>
                    <p><strong>👤 With:</strong> ${meeting.host_name || 'Host'}</p>
                    <p><strong>⏱️ Duration:</strong> ${meeting.duration_minutes || 30} minutes</p>
                  </div>
                  ${meeting.online_link ? `
                    <div style="text-align: center;">
                      <a href="${meeting.online_link}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Join Meeting</a>
                    </div>
                  ` : ''}
                </div>
              </div>
            `
          });
          remindersSent.push({ type: 'guest', email: meeting.guest_id, meeting: meeting.title });
        } catch (err) {
          console.error('Failed to send guest reminder:', err);
        }
      }
    }
    
    return Response.json({
      success: true,
      meetingsChecked: meetings.length,
      upcomingMeetings: upcomingMeetings.length,
      remindersSent
    });
    
  } catch (error) {
    console.error('Meeting reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});