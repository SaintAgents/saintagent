import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, level = 1, badges_count = 0, meetings_completed = 0 } = await req.json();

    // Check existing active challenges to avoid duplicates
    const existingChallenges = await base44.entities.Challenge.filter({ 
      user_id: user_id || user.email, 
      status: 'active' 
    });

    // Define challenge templates
    const dailyTemplates = [
      { title: 'Daily Check-in', description: 'Log your daily activity', category: 'profile', target_action: 'daily_login', target_count: 1, reward_points: 10 },
      { title: 'Send a Message', description: 'Reach out to someone new', category: 'social', target_action: 'send_message', target_count: 1, reward_points: 15 },
      { title: 'Browse Marketplace', description: 'Check out new listings', category: 'marketplace', target_action: 'view_listing', target_count: 3, reward_points: 10 },
      { title: 'Update Profile', description: 'Add something new to your profile', category: 'profile', target_action: 'update_profile', target_count: 1, reward_points: 20 },
      { title: 'Connect with Others', description: 'Follow 2 new people', category: 'social', target_action: 'follow_user', target_count: 2, reward_points: 20 },
    ];

    const weeklyTemplates = [
      { title: 'Meeting Master', description: 'Complete 3 meetings this week', category: 'meetings', target_action: 'complete_meeting', target_count: 3, reward_points: 75, reward_ggg: 0.01 },
      { title: 'Mission Contributor', description: 'Join and contribute to 2 missions', category: 'missions', target_action: 'join_mission', target_count: 2, reward_points: 100 },
      { title: 'Community Builder', description: 'Send 10 messages this week', category: 'social', target_action: 'send_message', target_count: 10, reward_points: 50 },
      { title: 'Marketplace Explorer', description: 'Interact with 5 listings', category: 'marketplace', target_action: 'interact_listing', target_count: 5, reward_points: 40 },
      { title: 'Network Expander', description: 'Gain 5 new followers', category: 'social', target_action: 'gain_follower', target_count: 5, reward_points: 60 },
    ];

    // Get tomorrow and next week dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const createdChallenges = [];

    // Create 3 daily challenges
    const existingDailyActions = existingChallenges
      .filter(c => c.challenge_type === 'daily')
      .map(c => c.target_action);

    const availableDaily = dailyTemplates.filter(t => !existingDailyActions.includes(t.target_action));
    const selectedDaily = availableDaily.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const template of selectedDaily) {
      // Scale rewards based on level
      const scaledPoints = Math.round(template.reward_points * (1 + (level - 1) * 0.1));
      
      const challenge = await base44.entities.Challenge.create({
        user_id: user_id || user.email,
        title: template.title,
        description: template.description,
        category: template.category,
        target_action: template.target_action,
        target_count: template.target_count,
        current_count: 0,
        reward_points: scaledPoints,
        reward_ggg: template.reward_ggg || 0,
        challenge_type: 'daily',
        status: 'active',
        expires_at: tomorrow.toISOString()
      });
      createdChallenges.push(challenge);
    }

    // Create 2 weekly challenges if user has fewer than 2 active weekly
    const existingWeeklyCount = existingChallenges.filter(c => c.challenge_type === 'weekly').length;
    
    if (existingWeeklyCount < 2) {
      const existingWeeklyActions = existingChallenges
        .filter(c => c.challenge_type === 'weekly')
        .map(c => c.target_action);

      const availableWeekly = weeklyTemplates.filter(t => !existingWeeklyActions.includes(t.target_action));
      const selectedWeekly = availableWeekly.sort(() => Math.random() - 0.5).slice(0, 2 - existingWeeklyCount);

      for (const template of selectedWeekly) {
        const scaledPoints = Math.round(template.reward_points * (1 + (level - 1) * 0.15));
        
        const challenge = await base44.entities.Challenge.create({
          user_id: user_id || user.email,
          title: template.title,
          description: template.description,
          category: template.category,
          target_action: template.target_action,
          target_count: template.target_count,
          current_count: 0,
          reward_points: scaledPoints,
          reward_ggg: template.reward_ggg || 0,
          challenge_type: 'weekly',
          status: 'active',
          expires_at: nextWeek.toISOString()
        });
        createdChallenges.push(challenge);
      }
    }

    // Create milestone challenges based on user progress
    if (meetings_completed >= 5 && !existingChallenges.some(c => c.target_action === 'become_mentor')) {
      await base44.entities.Challenge.create({
        user_id: user_id || user.email,
        title: 'Top Mentor',
        description: 'Complete 5 mentorship sessions to become a Top Mentor',
        category: 'meetings',
        target_action: 'become_mentor',
        target_count: 5,
        current_count: meetings_completed,
        reward_points: 250,
        reward_badge: 'top_mentor',
        challenge_type: 'milestone',
        status: 'active'
      });
    }

    return Response.json({ 
      success: true, 
      challenges_created: createdChallenges.length,
      challenges: createdChallenges 
    });
  } catch (error) {
    console.error('Generate challenges error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});