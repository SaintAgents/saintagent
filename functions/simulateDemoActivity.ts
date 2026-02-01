import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEMO_USERS = [
  { email: 'aurora.lightweaver@demo.sa', name: 'Aurora Lightweaver', handle: 'aurora_light' },
  { email: 'marcus.starforge@demo.sa', name: 'Marcus Starforge', handle: 'marcus_star' },
  { email: 'luna.moonwhisper@demo.sa', name: 'Luna Moonwhisper', handle: 'luna_moon' },
  { email: 'kai.sunwalker@demo.sa', name: 'Kai Sunwalker', handle: 'kai_sun' },
  { email: 'maya.crystalheart@demo.sa', name: 'Maya Crystalheart', handle: 'maya_crystal' },
  { email: 'orion.flameguard@demo.sa', name: 'Orion Flameguard', handle: 'orion_flame' },
  { email: 'sage.windrunner@demo.sa', name: 'Sage Windrunner', handle: 'sage_wind' },
  { email: 'nova.stardust@demo.sa', name: 'Nova Stardust', handle: 'nova_dust' },
];

const POST_CONTENT = [
  "Just completed an incredible meditation session. The energy today is powerful! ✨",
  "Looking for collaborators on a community healing project. DM if interested!",
  "Grateful for this amazing community. The connections here are life-changing.",
  "New moon intentions set. Ready to manifest abundance for all! 🌙",
  "Had an amazing meeting with fellow lightworkers today. Big things coming!",
  "Reminder: You are exactly where you need to be on your journey. 💫",
  "Excited to announce my new mentorship offering! Check out my profile.",
  "The synchronicities today have been off the charts. Trust the process!",
  "Just joined a new mission to spread consciousness. Who's with me?",
  "Beautiful sunrise meditation this morning. Nature is the best teacher.",
  "Reached a new milestone in my spiritual practice. Feeling blessed!",
  "Community call was incredible! So much wisdom shared.",
  "Working on aligning my chakras. Day 21 of the challenge! 🔥",
  "Found my soul tribe here. Thank you all for your light.",
  "New collaboration opportunity in the marketplace. Excited to serve!",
];

const SKILLS = ['meditation', 'energy_healing', 'breathwork', 'yoga', 'sound_healing', 'reiki', 'astrology', 'tarot', 'coaching', 'writing', 'art', 'music', 'leadership', 'community_building'];
const VALUES = ['authenticity', 'compassion', 'growth', 'service', 'wisdom', 'connection', 'love', 'truth', 'balance', 'abundance'];
const PRACTICES = ['meditation', 'yoga', 'breathwork', 'prayer', 'energy_work', 'sound_mantra', 'qigong', 'contemplative_silence'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function calculateMatchScore(profile1, profile2) {
  let score = 50; // Base score
  
  // Skills overlap
  const skills1 = profile1?.skills || [];
  const skills2 = profile2?.skills || [];
  const skillOverlap = skills1.filter(s => skills2.includes(s)).length;
  score += skillOverlap * 5;
  
  // Values overlap
  const values1 = profile1?.values_tags || [];
  const values2 = profile2?.values_tags || [];
  const valueOverlap = values1.filter(v => values2.includes(v)).length;
  score += valueOverlap * 7;
  
  // Practices overlap
  const practices1 = profile1?.spiritual_practices || [];
  const practices2 = profile2?.spiritual_practices || [];
  const practiceOverlap = practices1.filter(p => practices2.includes(p)).length;
  score += practiceOverlap * 6;
  
  // Intentions alignment
  const intentions1 = profile1?.intentions || [];
  const intentions2 = profile2?.intentions || [];
  const intentionOverlap = intentions1.filter(i => intentions2.includes(i)).length;
  score += intentionOverlap * 8;
  
  // Random variance
  score += Math.floor(Math.random() * 15) - 5;
  
  return Math.min(100, Math.max(40, score));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for all operations
    const results = {
      profiles_updated: 0,
      posts_created: 0,
      matches_created: 0,
      meetings_created: 0,
      messages_created: 0,
      notifications_created: 0,
      ggg_transactions: 0,
    };
    
    // 1. Ensure demo profiles exist with rich data
    const existingProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 100);
    const demoProfiles = [];
    
    for (const demo of DEMO_USERS) {
      let profile = existingProfiles.find(p => p.user_id === demo.email);
      
      if (!profile) {
        // Create demo profile
        profile = await base44.asServiceRole.entities.UserProfile.create({
          user_id: demo.email,
          handle: demo.handle,
          display_name: demo.name,
          bio: `${demo.name} - Dedicated lightworker and community builder. Here to connect, grow, and serve.`,
          skills: randomItems(SKILLS, 4),
          values_tags: randomItems(VALUES, 4),
          spiritual_practices: randomItems(PRACTICES, 3),
          intentions: randomItems(['service', 'healing', 'build', 'teach', 'learn'], 2),
          rank_code: randomItem(['initiate', 'adept', 'practitioner', 'master']),
          rp_points: Math.floor(Math.random() * 500) + 100,
          ggg_balance: Math.floor(Math.random() * 1000) + 50,
          trust_score: Math.floor(Math.random() * 40) + 60,
          follower_count: Math.floor(Math.random() * 200) + 20,
          following_count: Math.floor(Math.random() * 150) + 10,
          status: randomItem(['online', 'online', 'online', 'focus', 'offline']),
          practice_frequency: randomItem(['daily', 'few_times_week', 'weekly']),
          practice_depth: randomItem(['developing', 'established', 'teaching']),
        });
        results.profiles_updated++;
      } else {
        // Update existing profile with activity
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          last_seen_at: new Date().toISOString(),
          status: randomItem(['online', 'online', 'focus']),
          rp_points: (profile.rp_points || 0) + Math.floor(Math.random() * 10),
        });
        results.profiles_updated++;
      }
      
      demoProfiles.push(profile);
    }
    
    // 2. Create community posts (limited to avoid rate limits)
    const postsToCreate = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < postsToCreate; i++) {
      const author = randomItem(DEMO_USERS);
      const authorProfile = demoProfiles.find(p => p.user_id === author.email);
      
      await base44.asServiceRole.entities.Post.create({
        author_id: author.email,
        author_name: author.name,
        author_avatar: authorProfile?.avatar_url,
        content: randomItem(POST_CONTENT),
        likes_count: Math.floor(Math.random() * 30),
        comments_count: Math.floor(Math.random() * 10),
        visibility: 'public',
      });
      results.posts_created++;
    }
    
    // 3. Create matches between users (cross-checking variables) - limited to avoid rate limits
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 20);
    const existingMatches = await base44.asServiceRole.entities.Match.list('-created_date', 100);
    
    // Only process a few profiles per run to avoid rate limits
    const profilesToProcess = allProfiles.slice(0, 3);
    for (const profile of profilesToProcess) {
      // Find potential matches based on overlapping criteria
      const potentialMatches = allProfiles.filter(p => {
        if (p.user_id === profile.user_id) return false;
        
        // Check if match already exists
        const existsAlready = existingMatches.some(m => 
          (m.user_id === profile.user_id && m.target_id === p.user_id) ||
          (m.user_id === p.user_id && m.target_id === profile.user_id)
        );
        if (existsAlready) return false;
        
        // Cross-check variables for compatibility
        const skillMatch = (profile.skills || []).some(s => (p.skills || []).includes(s));
        const valueMatch = (profile.values_tags || []).some(v => (p.values_tags || []).includes(v));
        const practiceMatch = (profile.spiritual_practices || []).some(pr => (p.spiritual_practices || []).includes(pr));
        const intentionMatch = (profile.intentions || []).some(i => (p.intentions || []).includes(i));
        
        // Require at least 2 areas of overlap
        const overlapCount = [skillMatch, valueMatch, practiceMatch, intentionMatch].filter(Boolean).length;
        return overlapCount >= 2;
      });
      
      // Create matches for top candidates (limit to 1 per profile per run)
      for (const target of potentialMatches.slice(0, 1)) {
        const score = calculateMatchScore(profile, target);
        
        // Generate conversation starters based on shared interests
        const sharedSkills = (profile.skills || []).filter(s => (target.skills || []).includes(s));
        const sharedValues = (profile.values_tags || []).filter(v => (target.values_tags || []).includes(v));
        const sharedPractices = (profile.spiritual_practices || []).filter(p => (target.spiritual_practices || []).includes(p));
        
        const starters = [];
        if (sharedSkills.length > 0) starters.push(`I noticed we both practice ${sharedSkills[0]}. How did you get started?`);
        if (sharedValues.length > 0) starters.push(`${sharedValues[0]} is important to both of us. What does it mean in your journey?`);
        if (sharedPractices.length > 0) starters.push(`Fellow ${sharedPractices[0]} practitioner! Would love to share experiences.`);
        
        await base44.asServiceRole.entities.Match.create({
          user_id: profile.user_id,
          target_type: 'person',
          target_id: target.user_id,
          target_name: target.display_name,
          target_avatar: target.avatar_url,
          target_subtitle: target.bio?.slice(0, 100),
          match_score: score,
          intent_alignment: Math.floor(Math.random() * 30) + 70,
          skill_complementarity: Math.floor(Math.random() * 30) + 70,
          spiritual_alignment_score: Math.floor(Math.random() * 30) + 70,
          shared_values: sharedValues,
          complementary_skills: sharedSkills,
          spiritual_synergies: sharedPractices,
          conversation_starters: starters,
          ai_reasoning: `Strong alignment detected in ${[sharedSkills.length > 0 && 'skills', sharedValues.length > 0 && 'values', sharedPractices.length > 0 && 'practices'].filter(Boolean).join(', ')}. ${score}% compatibility score suggests meaningful collaboration potential.`,
          status: 'active',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        results.matches_created++;
      }
    }
    
    // 4. Create some meetings between demo users (limited)
    const meetingsToCreate = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < meetingsToCreate; i++) {
      const [host, guest] = randomItems(DEMO_USERS, 2);
      const hostProfile = demoProfiles.find(p => p.user_id === host.email);
      const guestProfile = demoProfiles.find(p => p.user_id === guest.email);
      
      await base44.asServiceRole.entities.Meeting.create({
        title: randomItem(['Collaboration Discussion', 'Mentorship Session', 'Project Planning', 'Introduction Call']),
        host_id: host.email,
        guest_id: guest.email,
        host_name: host.name,
        guest_name: guest.name,
        host_avatar: hostProfile?.avatar_url,
        guest_avatar: guestProfile?.avatar_url,
        scheduled_time: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: randomItem([30, 45, 60]),
        status: randomItem(['scheduled', 'scheduled', 'completed']),
        meeting_type: randomItem(['collaboration', 'mentorship', 'casual']),
      });
      results.meetings_created++;
    }
    
    // 5. Create some messages/conversations (limited)
    const messagesToCreate = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < messagesToCreate; i++) {
      const [sender, receiver] = randomItems(DEMO_USERS, 2);
      const senderProfile = demoProfiles.find(p => p.user_id === sender.email);
      
      const conversationId = [sender.email, receiver.email].sort().join('_');
      
      await base44.asServiceRole.entities.Message.create({
        conversation_id: conversationId,
        from_user_id: sender.email,
        to_user_id: receiver.email,
        from_name: sender.name,
        from_avatar: senderProfile?.avatar_url,
        content: randomItem([
          "Hey! Loved your recent post. Would love to connect!",
          "Thanks for the great session today! Looking forward to more.",
          "Saw we have similar interests. Want to collaborate on something?",
          "Your energy is amazing! Let's chat soon.",
          "Just checking in. Hope you're having a great day! ✨",
        ]),
        is_read: Math.random() > 0.5,
      });
      results.messages_created++;
    }
    
    // 6. Create notifications for real users (limited)
    const realUsers = allProfiles.filter(p => !p.user_id?.includes('@demo.'));
    for (const user of realUsers.slice(0, 2)) {
      const demoUser = randomItem(DEMO_USERS);
      
      // Random notification type
      const notifType = randomItem(['match', 'follow', 'message']);
      
      if (notifType === 'match') {
        await base44.asServiceRole.entities.Notification.create({
          user_id: user.user_id,
          type: 'match',
          title: 'New Match Found!',
          message: `${demoUser.name} is a ${Math.floor(Math.random() * 20) + 80}% match based on your shared interests.`,
          source_user_id: demoUser.email,
          source_user_name: demoUser.name,
          priority: 'normal',
        });
      } else if (notifType === 'follow') {
        await base44.asServiceRole.entities.Notification.create({
          user_id: user.user_id,
          type: 'follow',
          title: 'New Follower',
          message: `${demoUser.name} started following you!`,
          source_user_id: demoUser.email,
          source_user_name: demoUser.name,
          priority: 'low',
        });
      }
      results.notifications_created++;
    }
    
    // 7. Create some GGG transactions for activity (limited)
    // Fetch actual GGG rules to use proper amounts
    const gggRules = await base44.asServiceRole.entities.GGGRewardRule.filter({ is_active: true });
    const activeRules = gggRules.filter(r => r.ggg_amount > 0);
    
    for (const demo of DEMO_USERS.slice(0, 2)) {
      const profile = demoProfiles.find(p => p.user_id === demo.email);
      if (!profile) continue;
      
      // Pick a random rule to simulate
      const rule = randomItem(activeRules);
      const amount = rule?.ggg_amount || 0.01; // Default to 0.01 if no rules
      const newBalance = Math.round(((profile.ggg_balance || 0) + amount) * 10000) / 10000;
      
      await base44.asServiceRole.entities.GGGTransaction.create({
        user_id: demo.email,
        source_type: rule?.category || 'reward',
        delta: amount,
        reason_code: rule?.action_type || 'activity_reward',
        description: rule?.description || 'Activity reward',
        balance_after: newBalance,
      });
      results.ggg_transactions++;
      
      // Update profile balance
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        ggg_balance: newBalance
      });
    }
    
    return Response.json({ 
      success: true, 
      message: 'Demo activity simulation complete',
      results 
    });
    
  } catch (error) {
    console.error('Simulation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});