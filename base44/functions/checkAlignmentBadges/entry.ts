import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    // Called by entity automation on JournalEntry create
    const { data, event } = body;
    if (!data?.user_id) {
      return Response.json({ skipped: true, reason: 'no user_id' });
    }

    const entryType = data.entry_type;
    // Only process alignment-related entries
    if (!entryType || entryType === 'general') {
      return Response.json({ skipped: true, reason: 'general entry' });
    }

    const userId = data.user_id;

    // Fetch all journal entries for this user
    const entries = await base44.asServiceRole.entities.JournalEntry.filter({ user_id: userId }, '-created_date', 500);

    // Fetch existing badges
    const badges = await base44.asServiceRole.entities.Badge.filter({ user_id: userId, status: 'active' });
    const badgeCodes = new Set(badges.map(b => b.badge_code || b.code));

    const awarded = [];

    // --- Grid Aligned Badge ---
    if (!badgeCodes.has('alignment_grid_aligned')) {
      const gridMissions = entries.filter(e => e.entry_type === 'grid_mission' || e.entry_type === 'alignment').length;
      const coherenceSessions = entries.filter(e => e.entry_type === 'heart_coherence').length;

      if (gridMissions >= 8 && coherenceSessions >= 10) {
        await base44.asServiceRole.entities.Badge.create({
          user_id: userId,
          badge_code: 'alignment_grid_aligned',
          badge_name: 'Grid Aligned',
          category: 'alignment',
          description: 'Achieved heart-mind coherence through grid missions and coherence practices',
          earned_date: new Date().toISOString(),
          status: 'active',
          rarity: 'rare'
        });

        // Notify user
        await base44.asServiceRole.entities.Notification.create({
          user_id: userId,
          title: '🏅 Badge Earned: Grid Aligned',
          message: 'Your dedication to grid missions and heart coherence has earned you the Grid Aligned badge!',
          type: 'badge',
          is_read: false,
          action_url: '/Profile'
        });

        awarded.push('alignment_grid_aligned');
      }
    }

    // --- Sacred Flame Badge ---
    if (!badgeCodes.has('alignment_sacred_flame')) {
      const transformativeEntries = entries.filter(e => e.entry_type === 'transformative');
      
      if (transformativeEntries.length >= 12) {
        // Check span of at least 180 days
        const dates = transformativeEntries.map(e => new Date(e.created_date)).sort((a, b) => a - b);
        const spanMs = dates[dates.length - 1] - dates[0];
        const spanDays = Math.floor(spanMs / (1000 * 60 * 60 * 24));

        if (spanDays >= 180) {
          await base44.asServiceRole.entities.Badge.create({
            user_id: userId,
            badge_code: 'alignment_sacred_flame',
            badge_name: 'Sacred Flame',
            category: 'alignment',
            description: 'Sustained transformative practice over 180 days with 12+ entries',
            earned_date: new Date().toISOString(),
            status: 'active',
            rarity: 'epic'
          });

          await base44.asServiceRole.entities.Notification.create({
            user_id: userId,
            title: '🔥 Badge Earned: Sacred Flame',
            message: 'Your sustained transformative journey over 180 days has ignited the Sacred Flame badge!',
            type: 'badge',
            is_read: false,
            action_url: '/Profile'
          });

          awarded.push('alignment_sacred_flame');
        }
      }
    }

    return Response.json({ success: true, awarded });
  } catch (error) {
    console.error('Badge check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});