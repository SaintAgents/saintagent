import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID');
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID');
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET');

// Send meeting invitation email
async function sendMeetingEmail(base44, { to, toName, topic, startTime, duration, joinUrl, isHost, hostName, guestName }) {
  const formattedTime = startTime ? new Date(startTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }) : 'Instant Meeting';
  
  const otherPerson = isHost ? guestName : hostName;
  
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
    .meeting-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed; }
    .join-btn { display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">📅 Meeting Scheduled</h1>
      <p style="margin:10px 0 0 0; opacity: 0.9;">Saint Agents Platform</p>
    </div>
    <div class="content">
      <p>Hi ${toName || 'there'},</p>
      <p>A meeting has been scheduled ${otherPerson ? `with <strong>${otherPerson}</strong>` : ''}.</p>
      
      <div class="meeting-details">
        <p><strong>📌 Topic:</strong> ${topic || 'Saint Agents Meeting'}</p>
        <p><strong>🕐 When:</strong> ${formattedTime}</p>
        <p><strong>⏱️ Duration:</strong> ${duration || 60} minutes</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${joinUrl}" class="join-btn">Join Meeting</a>
      </div>
      
      <p style="color: #64748b; font-size: 14px;">
        Click the button above or copy this link:<br>
        <a href="${joinUrl}" style="color: #7c3aed; word-break: break-all;">${joinUrl}</a>
      </p>
      
      <div class="footer">
        <p>This is an automated message from Saint Agents.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await base44.integrations.Core.SendEmail({
      to: to,
      subject: `Meeting Scheduled: ${topic || 'Saint Agents Meeting'}`,
      body: emailBody
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

// Get Zoom access token using Server-to-Server OAuth
async function getZoomAccessToken() {
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;
  
  const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`);
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Zoom access token: ${error}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

// Create a Zoom meeting
async function createZoomMeeting(accessToken, meetingDetails) {
  const { topic, start_time, duration, agenda, timezone } = meetingDetails;
  
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: topic || 'Saint Agents Meeting',
      type: start_time ? 2 : 1, // 1 = instant, 2 = scheduled
      start_time: start_time, // ISO 8601 format
      duration: duration || 60, // minutes
      timezone: timezone || 'UTC',
      agenda: agenda || '',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: false,
        waiting_room: false,
        audio: 'both',
        auto_recording: 'none'
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Zoom meeting: ${error}`);
  }
  
  return await response.json();
}

// Get meeting details
async function getZoomMeeting(accessToken, meetingId) {
  const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Zoom meeting: ${error}`);
  }
  
  return await response.json();
}

// Delete a meeting
async function deleteZoomMeeting(accessToken, meetingId) {
  const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok && response.status !== 204) {
    const error = await response.text();
    throw new Error(`Failed to delete Zoom meeting: ${error}`);
  }
  
  return { success: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { action, meetingId, meetingDetails, sendEmails, hostEmail, hostName, guestEmail, guestName } = await req.json();
    
    // Get Zoom access token
    const accessToken = await getZoomAccessToken();
    
    let result;
    
    switch (action) {
      case 'create':
        result = await createZoomMeeting(accessToken, meetingDetails || {});
        // Return useful meeting info
        return Response.json({
          success: true,
          meeting: {
            id: result.id,
            topic: result.topic,
            join_url: result.join_url,
            start_url: result.start_url,
            password: result.password,
            start_time: result.start_time,
            duration: result.duration
          }
        });
        
      case 'get':
        if (!meetingId) {
          return Response.json({ error: 'Meeting ID required' }, { status: 400 });
        }
        result = await getZoomMeeting(accessToken, meetingId);
        return Response.json({
          success: true,
          meeting: {
            id: result.id,
            topic: result.topic,
            join_url: result.join_url,
            start_url: result.start_url,
            password: result.password,
            start_time: result.start_time,
            duration: result.duration,
            status: result.status
          }
        });
        
      case 'delete':
        if (!meetingId) {
          return Response.json({ error: 'Meeting ID required' }, { status: 400 });
        }
        result = await deleteZoomMeeting(accessToken, meetingId);
        return Response.json({ success: true });
        
      default:
        return Response.json({ error: 'Invalid action. Use: create, get, or delete' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Zoom API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});