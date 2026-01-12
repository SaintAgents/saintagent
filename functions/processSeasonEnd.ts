import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find active season that has ended
    const now = new Date().toISOString();
    const seasons = await base44.asServiceRole.entities.Season.filter({ status: 'active' });
    const endedSeason = seasons.find(s => new Date(s.end_date) <= new Date(now));

    if (!endedSeason) {
      return Response.json({ message: 'No season to process', processed: false });
    }

    // Mark as processing
    await base44.asServiceRole.entities.Season.update(endedSeason.id, { status: 'processing' });

    // Get all profiles with seasonal data
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-ggg_earned_season', 1000);
    const activeProfiles = profiles.filter(p => 
      (p.ggg_earned_season || 0) > 0 ||
      (p.missions_completed_season || 0) > 0 ||
      (p.new_connections_season || 0) > 0 ||
      (p.mentorship_hours_season || 0) > 0
    );

    const top10PercentCount = Math.max(1, Math.ceil(activeProfiles.length * 0.1));

    // Calculate rankings for each category
    const categories = {
      titans: [...activeProfiles]
        .sort((a, b) => (b.ggg_earned_season || 0) - (a.ggg_earned_season || 0))
        .slice(0, top10PercentCount)
        .map(p => p.user_id),
      
      pathfinders: [...activeProfiles]
        .sort((a, b) => (b.missions_completed_season || 0) - (a.missions_completed_season || 0))
        .slice(0, top10PercentCount)
        .map(p => p.user_id),
      
      connectors: [...activeProfiles]
        .sort((a, b) => (b.new_connections_season || 0) - (a.new_connections_season || 0))
        .slice(0, top10PercentCount)
        .map(p => p.user_id),
      
      mystics: [...activeProfiles]
        .sort((a, b) => {
          const scoreA = (a.mentorship_hours_season || 0) + (a.mentorship_upvotes_season || 0) * 10;
          const scoreB = (b.mentorship_hours_season || 0) + (b.mentorship_upvotes_season || 0) * 10;
          return scoreB - scoreA;
        })
        .slice(0, top10PercentCount)
        .map(p => p.user_id)
    };

    const rewardConfig = endedSeason.reward_config || {};
    const rewardsDistributed = { titans: 0, pathfinders: 0, connectors: 0, mystics: 0 };

    // Distribute rewards
    for (const profile of profiles) {
      const updates = {};
      const notifications = [];
      let gggBonus = 0;

      // Titans - Profile Aura
      if (categories.titans.includes(profile.user_id)) {
        updates.leaderboard_aura = rewardConfig.titans_aura || 'titans';
        notifications.push({
          user_id: profile.user_id,
          type: 'rank',
          title: '🏆 Season Reward: The Titans',
          message: `You finished in the top 10% of GGG earners! You've earned an exclusive profile aura.`,
          priority: 'high'
        });
        rewardsDistributed.titans++;
      }

      // Pathfinders - Early Access (stored as achievement)
      if (categories.pathfinders.includes(profile.user_id)) {
        const currentAchievements = profile.achievements || [];
        if (!currentAchievements.includes('early_quest_access')) {
          updates.achievements = [...currentAchievements, 'early_quest_access'];
        }
        notifications.push({
          user_id: profile.user_id,
          type: 'rank',
          title: '🗺️ Season Reward: The Pathfinders',
          message: `You finished in the top 10% of mission completers! You've earned early access to new quests.`,
          priority: 'high'
        });
        rewardsDistributed.pathfinders++;
      }

      // Connectors - Referral Multiplier (stored in profile)
      if (categories.connectors.includes(profile.user_id)) {
        // Note: The multiplier would be applied in referral processing logic
        const currentAchievements = profile.achievements || [];
        if (!currentAchievements.includes('referral_multiplier_2x')) {
          updates.achievements = [...currentAchievements, 'referral_multiplier_2x'];
        }
        notifications.push({
          user_id: profile.user_id,
          type: 'rank',
          title: '🤝 Season Reward: The Connectors',
          message: `You finished in the top 10% of connectors! You've earned 2x GGG on referrals.`,
          priority: 'high'
        });
        rewardsDistributed.connectors++;
      }

      // Mystics - Badge + GGG Bonus
      if (categories.mystics.includes(profile.user_id)) {
        gggBonus = rewardConfig.mystics_ggg_bonus || 500;
        updates.ggg_balance = (profile.ggg_balance || 0) + gggBonus;
        
        // Create Top Mentor badge
        await base44.asServiceRole.entities.Badge.create({
          user_id: profile.user_id,
          badge_code: 'top_mentor_season',
          badge_name: 'Top Mentor',
          description: `Earned by finishing in the top 10% of The Mystics in ${endedSeason.name}`,
          status: 'active',
          earned_date: now
        });

        notifications.push({
          user_id: profile.user_id,
          type: 'ggg',
          title: '✨ Season Reward: The Mystics',
          message: `You finished in the top 10% of mentors! You've earned the Top Mentor badge and ${gggBonus} GGG.`,
          priority: 'high'
        });
        rewardsDistributed.mystics++;

        // Record GGG transaction
        await base44.asServiceRole.entities.GGGTransaction.create({
          user_id: profile.user_id,
          source_type: 'reward',
          delta: gggBonus,
          reason_code: 'season_mystics_bonus',
          description: `Top Mystics bonus for ${endedSeason.name}`,
          balance_after: updates.ggg_balance
        });
      }

      // Reset seasonal metrics
      updates.ggg_earned_season = 0;
      updates.missions_completed_season = 0;
      updates.new_connections_season = 0;
      updates.mentorship_hours_season = 0;
      updates.mentorship_upvotes_season = 0;

      // Clear aura for non-titans (auras are seasonal)
      if (!categories.titans.includes(profile.user_id) && profile.leaderboard_aura) {
        updates.leaderboard_aura = 'none';
      }

      // Update profile
      if (Object.keys(updates).length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, updates);
      }

      // Create notifications
      for (const notif of notifications) {
        await base44.asServiceRole.entities.Notification.create(notif);
      }
    }

    // Update season as completed
    await base44.asServiceRole.entities.Season.update(endedSeason.id, {
      status: 'completed',
      rewards_processed: true,
      top_performers: categories
    });

    // Check for upcoming season and activate it
    const upcomingSeasons = await base44.asServiceRole.entities.Season.filter({ status: 'upcoming' });
    const nextSeason = upcomingSeasons.find(s => new Date(s.start_date) <= new Date(now));
    if (nextSeason) {
      await base44.asServiceRole.entities.Season.update(nextSeason.id, { status: 'active' });
    }

    return Response.json({
      success: true,
      processed: true,
      season: endedSeason.name,
      totalProfiles: profiles.length,
      activeProfiles: activeProfiles.length,
      top10PercentCount,
      rewardsDistributed
    });

  } catch (error) {
    console.error('Season processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});