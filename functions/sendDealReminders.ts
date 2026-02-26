import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send deal reminders based on user configurations
 * Should be run daily via scheduled automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Verify admin access for scheduled tasks
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const results = {
      closeApproaching: [],
      overdue: [],
      stale: []
    };

    // Get all active reminder configurations
    const reminderConfigs = await base44.asServiceRole.entities.DealReminderConfig.filter({
      is_active: true
    });

    // Get all active deals
    const deals = await base44.asServiceRole.entities.Deal.filter({});
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));

    // Group configs by user
    const configsByUser = {};
    reminderConfigs.forEach(config => {
      if (!configsByUser[config.user_id]) {
        configsByUser[config.user_id] = [];
      }
      configsByUser[config.user_id].push(config);
    });

    // Process reminders for each user
    for (const [userId, configs] of Object.entries(configsByUser)) {
      // Get user's deals
      const userDeals = activeDeals.filter(d => d.owner_id === userId);
      
      for (const config of configs) {
        if (config.reminder_type === 'close_date_approaching') {
          // Find deals approaching close date
          const approachingDeals = userDeals.filter(d => {
            if (!d.expected_close_date) return false;
            const closeDate = new Date(d.expected_close_date);
            const daysUntilClose = Math.ceil((closeDate - now) / (1000 * 60 * 60 * 24));
            return daysUntilClose > 0 && daysUntilClose <= (config.days_before || 7);
          });

          for (const deal of approachingDeals) {
            const closeDate = new Date(deal.expected_close_date);
            const daysUntilClose = Math.ceil((closeDate - now) / (1000 * 60 * 60 * 24));

            if (config.notify_in_app) {
              await base44.asServiceRole.entities.Notification.create({
                user_id: userId,
                title: '📅 Deal Closing Soon',
                message: `"${deal.title}" is expected to close in ${daysUntilClose} day(s)`,
                type: 'deal_reminder',
                action_url: `/Deals?id=${deal.id}`,
                is_read: false
              });
            }

            if (config.notify_email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: userId,
                subject: `Deal Reminder: "${deal.title}" closing in ${daysUntilClose} days`,
                body: `Your deal "${deal.title}" (${deal.company_name || 'Unknown Company'}) is expected to close in ${daysUntilClose} day(s).\n\nDeal Value: $${(deal.amount || 0).toLocaleString()}\nCurrent Stage: ${deal.stage}\n\nPlease review and take necessary action.`
              });
            }

            results.closeApproaching.push({ deal: deal.title, user: userId, daysLeft: daysUntilClose });
          }
        }

        if (config.reminder_type === 'overdue_close_date') {
          // Find overdue deals
          const overdueDeals = userDeals.filter(d => {
            if (!d.expected_close_date) return false;
            const closeDate = new Date(d.expected_close_date);
            return closeDate < now;
          });

          for (const deal of overdueDeals) {
            const closeDate = new Date(deal.expected_close_date);
            const daysOverdue = Math.ceil((now - closeDate) / (1000 * 60 * 60 * 24));

            if (config.notify_in_app) {
              await base44.asServiceRole.entities.Notification.create({
                user_id: userId,
                title: '⚠️ Deal Overdue',
                message: `"${deal.title}" is ${daysOverdue} day(s) past expected close date`,
                type: 'deal_reminder',
                action_url: `/Deals?id=${deal.id}`,
                is_read: false
              });
            }

            if (config.notify_email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: userId,
                subject: `OVERDUE: Deal "${deal.title}" past close date`,
                body: `Your deal "${deal.title}" is ${daysOverdue} day(s) past its expected close date.\n\nDeal Value: $${(deal.amount || 0).toLocaleString()}\nExpected Close: ${deal.expected_close_date}\n\nPlease update the deal status or close date.`
              });
            }

            results.overdue.push({ deal: deal.title, user: userId, daysOverdue });
          }
        }

        if (config.reminder_type === 'stale_deal') {
          // Find stale deals (no activity for X days)
          const staleDays = config.stale_days || 14;
          
          for (const deal of userDeals) {
            // Get last activity
            const activities = await base44.asServiceRole.entities.DealActivity.filter({
              deal_id: deal.id
            }, '-created_date', 1);
            
            const lastActivityDate = activities[0]?.created_date 
              ? new Date(activities[0].created_date) 
              : new Date(deal.created_date);
            
            const daysSinceActivity = Math.ceil((now - lastActivityDate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceActivity >= staleDays) {
              if (config.notify_in_app) {
                await base44.asServiceRole.entities.Notification.create({
                  user_id: userId,
                  title: '💤 Stale Deal Alert',
                  message: `"${deal.title}" has had no activity for ${daysSinceActivity} days`,
                  type: 'deal_reminder',
                  action_url: `/Deals?id=${deal.id}`,
                  is_read: false
                });
              }

              if (config.notify_email) {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: userId,
                  subject: `Stale Deal: "${deal.title}" needs attention`,
                  body: `Your deal "${deal.title}" has had no activity for ${daysSinceActivity} days.\n\nDeal Value: $${(deal.amount || 0).toLocaleString()}\nCurrent Stage: ${deal.stage}\n\nConsider updating the deal or reaching out to the contact.`
                });
              }

              results.stale.push({ deal: deal.title, user: userId, daysSinceActivity });
            }
          }
        }
      }
    }

    return Response.json({
      success: true,
      results,
      summary: {
        closeApproaching: results.closeApproaching.length,
        overdue: results.overdue.length,
        stale: results.stale.length
      }
    });

  } catch (error) {
    console.error('Error sending deal reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});