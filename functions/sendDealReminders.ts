import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get all active deals with reminders enabled
    const allDeals = await base44.asServiceRole.entities.Deal.list('-created_date', 1000);
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    const remindersToSend = [];
    const overdueDeals = [];
    
    for (const deal of allDeals) {
      // Skip closed deals
      if (['closed_won', 'closed_lost'].includes(deal.stage)) continue;
      
      // Skip if reminders disabled
      if (deal.reminder_enabled === false) continue;
      
      // Skip if no expected close date
      if (!deal.expected_close_date) continue;
      
      const closeDate = new Date(deal.expected_close_date);
      const daysUntilClose = Math.ceil((closeDate - now) / oneDayMs);
      const reminderDays = deal.reminder_days_before || 7;
      
      // Check if already sent reminder today
      if (deal.last_reminder_sent) {
        const lastReminder = new Date(deal.last_reminder_sent);
        const hoursSinceReminder = (now - lastReminder) / (1000 * 60 * 60);
        if (hoursSinceReminder < 24) continue;
      }
      
      // Check for overdue deals
      if (daysUntilClose < 0) {
        overdueDeals.push({
          deal,
          daysOverdue: Math.abs(daysUntilClose)
        });
      }
      // Check for approaching close date
      else if (daysUntilClose <= reminderDays && daysUntilClose >= 0) {
        remindersToSend.push({
          deal,
          daysUntilClose
        });
      }
    }
    
    const notificationsSent = [];
    const emailsSent = [];
    
    // Send approaching deadline reminders
    for (const { deal, daysUntilClose } of remindersToSend) {
      // Get owner's notification preferences
      const ownerProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: deal.owner_id });
      const ownerProfile = ownerProfiles[0];
      const prefs = ownerProfile?.notification_prefs || { email: true, in_app: true };
      
      const message = daysUntilClose === 0
        ? `Deal "${deal.title}" is due TODAY!`
        : `Deal "${deal.title}" is due in ${daysUntilClose} day${daysUntilClose > 1 ? 's' : ''}`;
      
      // In-app notification
      if (prefs.in_app !== false) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: deal.owner_id,
          title: daysUntilClose === 0 ? '⚠️ Deal Due Today!' : '📅 Deal Closing Soon',
          message,
          type: 'warning',
          action_url: `/Deals?id=${deal.id}`
        });
        notificationsSent.push(deal.id);
      }
      
      // Email notification
      if (prefs.email !== false && ownerProfile?.user_id) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: deal.owner_id,
            subject: daysUntilClose === 0 ? `⚠️ Deal Due Today: ${deal.title}` : `📅 Deal Reminder: ${deal.title}`,
            body: `
Hi ${deal.owner_name || 'SaintAgent'},

${message}

Deal Details:
- Title: ${deal.title}
- Value: $${(deal.amount || 0).toLocaleString()}
- Company: ${deal.company_name || 'Not specified'}
- Stage: ${deal.stage}
- Expected Close: ${deal.expected_close_date}

Take action now to keep this deal on track!

Best regards,
SaintAgent Deal Management
            `.trim()
          });
          emailsSent.push(deal.id);
        } catch (emailError) {
          console.error(`Failed to send email for deal ${deal.id}:`, emailError);
        }
      }
      
      // Update last reminder sent
      await base44.asServiceRole.entities.Deal.update(deal.id, {
        last_reminder_sent: now.toISOString()
      });
    }
    
    // Send overdue deal notifications
    for (const { deal, daysOverdue } of overdueDeals) {
      const ownerProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: deal.owner_id });
      const ownerProfile = ownerProfiles[0];
      const prefs = ownerProfile?.notification_prefs || { email: true, in_app: true };
      
      // Check if we already sent an overdue reminder recently
      if (deal.last_reminder_sent) {
        const lastReminder = new Date(deal.last_reminder_sent);
        const daysSinceReminder = Math.floor((now - lastReminder) / oneDayMs);
        if (daysSinceReminder < 3) continue; // Only remind every 3 days for overdue
      }
      
      const message = `Deal "${deal.title}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`;
      
      if (prefs.in_app !== false) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: deal.owner_id,
          title: '🚨 Deal Overdue',
          message,
          type: 'error',
          action_url: `/Deals?id=${deal.id}`
        });
        notificationsSent.push(deal.id);
      }
      
      if (prefs.email !== false) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: deal.owner_id,
            subject: `🚨 OVERDUE: ${deal.title}`,
            body: `
Hi ${deal.owner_name || 'SaintAgent'},

Your deal "${deal.title}" is now ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} past its expected close date.

Deal Details:
- Title: ${deal.title}
- Value: $${(deal.amount || 0).toLocaleString()}
- Company: ${deal.company_name || 'Not specified'}
- Stage: ${deal.stage}
- Expected Close: ${deal.expected_close_date}

Please update the expected close date or take action to close this deal.

Best regards,
SaintAgent Deal Management
            `.trim()
          });
          emailsSent.push(deal.id);
        } catch (emailError) {
          console.error(`Failed to send overdue email for deal ${deal.id}:`, emailError);
        }
      }
      
      await base44.asServiceRole.entities.Deal.update(deal.id, {
        last_reminder_sent: now.toISOString()
      });
    }
    
    return Response.json({
      success: true,
      approaching_deadline: remindersToSend.length,
      overdue: overdueDeals.length,
      notifications_sent: notificationsSent.length,
      emails_sent: emailsSent.length
    });
    
  } catch (error) {
    console.error('Deal reminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});