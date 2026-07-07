import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { episodeTitle, episodeId } = await req.json();
    if (!episodeTitle) {
      return Response.json({ error: 'episodeTitle required' }, { status: 400 });
    }

    // Get all user profiles to check notification preferences
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 5000);

    let notified = 0;
    const notifications = [];

    for (const profile of profiles) {
      // Check if user has new_episodes notifications enabled
      const catPrefs = profile.notification_prefs?.categories || {};
      const episodePref = catPrefs.new_episodes;

      // Default: opted-in (since it's marked as priority: high, defaults to email true, in_app true)
      const inAppEnabled = episodePref ? episodePref.in_app !== false : true;

      if (inAppEnabled) {
        notifications.push({
          user_id: profile.user_id,
          type: 'system',
          title: '🎙️ New Episode: ' + episodeTitle,
          message: 'A new Deep Disclosure episode just dropped! Listen now.',
          action_url: '/Broadcast',
          action_label: 'Listen Now',
          priority: 'normal',
        });
        notified++;
      }
    }

    // Bulk create notifications in batches of 50
    for (let i = 0; i < notifications.length; i += 50) {
      const batch = notifications.slice(i, i + 50);
      await base44.asServiceRole.entities.Notification.bulkCreate(batch);
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});