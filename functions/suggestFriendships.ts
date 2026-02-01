import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetUserId, limit = 5 } = body;

    // Fetch all necessary data
    const [userProfiles, friendships, follows, meetings, missions, circles, messages] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.list('-created_date', 500),
      base44.asServiceRole.entities.Friendship.list('-created_date', 1000),
      base44.asServiceRole.entities.Follow.list('-created_date', 1000),
      base44.asServiceRole.entities.Meeting.filter({ status: 'completed' }, '-created_date', 500),
      base44.asServiceRole.entities.Mission.list('-created_date', 200),
      base44.asServiceRole.entities.Circle.list('-created_date', 200),
      base44.asServiceRole.entities.Message.list('-created_date', 1000)
    ]);

    // Build lookup maps
    const profileMap = {};
    userProfiles.forEach(p => { profileMap[p.user_id] = p; });

    // Build friendship graph (both directions)
    const friendsOf = {};
    friendships.forEach(f => {
      if (f.status === 'accepted') {
        if (!friendsOf[f.user_id]) friendsOf[f.user_id] = new Set();
        if (!friendsOf[f.friend_id]) friendsOf[f.friend_id] = new Set();
        friendsOf[f.user_id].add(f.friend_id);
        friendsOf[f.friend_id].add(f.user_id);
      }
    });

    // Build follow graph
    const followsOf = {};
    follows.forEach(f => {
      if (!followsOf[f.follower_id]) followsOf[f.follower_id] = new Set();
      followsOf[f.follower_id].add(f.following_id);
    });

    // Build interaction history (who met/messaged whom)
    const interactedWith = {};
    meetings.forEach(m => {
      if (!interactedWith[m.host_id]) interactedWith[m.host_id] = new Set();
      if (!interactedWith[m.guest_id]) interactedWith[m.guest_id] = new Set();
      interactedWith[m.host_id].add(m.guest_id);
      interactedWith[m.guest_id].add(m.host_id);
    });

    // Build circle membership
    const circlesOf = {};
    circles.forEach(c => {
      (c.member_ids || []).forEach(memberId => {
        if (!circlesOf[memberId]) circlesOf[memberId] = new Set();
        circlesOf[memberId].add(c.id);
      });
    });

    // Build mission participation
    const missionsOf = {};
    missions.forEach(m => {
      (m.participant_ids || []).forEach(pid => {
        if (!missionsOf[pid]) missionsOf[pid] = new Set();
        missionsOf[pid].add(m.id);
      });
    });

    // Get users to process (either specific user or all active non-demo users)
    const usersToProcess = targetUserId 
      ? [profileMap[targetUserId]].filter(Boolean)
      : userProfiles.filter(p => !p.is_demo && p.user_id);

    const allSuggestions = [];

    for (const userProfile of usersToProcess) {
      const userId = userProfile.user_id;
      const myFriends = friendsOf[userId] || new Set();
      const myFollows = followsOf[userId] || new Set();
      const myCircles = circlesOf[userId] || new Set();
      const myMissions = missionsOf[userId] || new Set();
      const myInteractions = interactedWith[userId] || new Set();

      // Score all other users
      const candidates = [];

      for (const candidate of userProfiles) {
        if (candidate.user_id === userId) continue;
        if (candidate.is_demo) continue;
        if (myFriends.has(candidate.user_id)) continue; // Already friends

        let score = 0;
        const reasons = [];

        // 1. Mutual friends (strongest signal - "people you may know")
        const theirFriends = friendsOf[candidate.user_id] || new Set();
        const mutualFriends = [...myFriends].filter(f => theirFriends.has(f));
        if (mutualFriends.length > 0) {
          score += mutualFriends.length * 25;
          const mutualNames = mutualFriends.slice(0, 3).map(f => profileMap[f]?.display_name || 'Someone').join(', ');
          reasons.push(`${mutualFriends.length} mutual friend${mutualFriends.length > 1 ? 's' : ''}: ${mutualNames}`);
        }

        // 2. Same circles
        const theirCircles = circlesOf[candidate.user_id] || new Set();
        const sharedCircles = [...myCircles].filter(c => theirCircles.has(c));
        if (sharedCircles.length > 0) {
          score += sharedCircles.length * 15;
          reasons.push(`${sharedCircles.length} shared circle${sharedCircles.length > 1 ? 's' : ''}`);
        }

        // 3. Same missions
        const theirMissions = missionsOf[candidate.user_id] || new Set();
        const sharedMissions = [...myMissions].filter(m => theirMissions.has(m));
        if (sharedMissions.length > 0) {
          score += sharedMissions.length * 12;
          reasons.push(`${sharedMissions.length} shared mission${sharedMissions.length > 1 ? 's' : ''}`);
        }

        // 4. Shared skills
        const mySkills = new Set(userProfile.skills || []);
        const theirSkills = new Set(candidate.skills || []);
        const sharedSkills = [...mySkills].filter(s => theirSkills.has(s));
        if (sharedSkills.length > 0) {
          score += sharedSkills.length * 8;
          reasons.push(`Shared skills: ${sharedSkills.slice(0, 3).join(', ')}`);
        }

        // 5. Shared values
        const myValues = new Set(userProfile.values_tags || []);
        const theirValues = new Set(candidate.values_tags || []);
        const sharedValues = [...myValues].filter(v => theirValues.has(v));
        if (sharedValues.length > 0) {
          score += sharedValues.length * 10;
          reasons.push(`Shared values: ${sharedValues.slice(0, 3).join(', ')}`);
        }

        // 6. Shared spiritual practices
        const myPractices = new Set(userProfile.spiritual_practices || []);
        const theirPractices = new Set(candidate.spiritual_practices || []);
        const sharedPractices = [...myPractices].filter(p => theirPractices.has(p));
        if (sharedPractices.length > 0) {
          score += sharedPractices.length * 8;
          reasons.push(`Shared practices: ${sharedPractices.slice(0, 2).join(', ')}`);
        }

        // 7. Same region/location
        if (userProfile.region && candidate.region && userProfile.region === candidate.region) {
          score += 10;
          reasons.push(`Same region: ${candidate.region}`);
        }

        // 8. They follow me (interested in me)
        const theirFollows = followsOf[candidate.user_id] || new Set();
        if (theirFollows.has(userId)) {
          score += 15;
          reasons.push('They follow you');
        }

        // 9. I follow them (I'm interested)
        if (myFollows.has(candidate.user_id)) {
          score += 10;
          reasons.push('You follow them');
        }

        // 10. Previous interaction (met or messaged)
        if (myInteractions.has(candidate.user_id)) {
          score += 20;
          reasons.push('You\'ve interacted before');
        }

        // 11. Same rank tier (peer level)
        if (userProfile.rank_code && candidate.rank_code && userProfile.rank_code === candidate.rank_code) {
          score += 5;
          reasons.push(`Same rank: ${candidate.rank_code}`);
        }

        // Only include if there's meaningful connection
        if (score >= 15 && reasons.length > 0) {
          candidates.push({
            candidateId: candidate.user_id,
            candidateName: candidate.display_name,
            candidateAvatar: candidate.avatar_url,
            candidateHandle: candidate.handle,
            score,
            reasons,
            topReason: reasons[0]
          });
        }
      }

      // Sort by score and take top N
      candidates.sort((a, b) => b.score - a.score);
      const topCandidates = candidates.slice(0, limit);

      // Create notifications for each suggestion
      for (const suggestion of topCandidates) {
        // Check if we already sent this suggestion recently (within 7 days)
        const existingNotifications = await base44.asServiceRole.entities.Notification.filter({
          user_id: userId,
          type: 'friendship_suggestion',
          'metadata.suggested_user_id': suggestion.candidateId
        }, '-created_date', 1);

        const recentlySent = existingNotifications.some(n => {
          const created = new Date(n.created_date);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return created > weekAgo;
        });

        if (!recentlySent) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: userId,
            type: 'follow', // Using existing type that displays well
            title: 'People You May Know',
            message: `${suggestion.candidateName}: ${suggestion.topReason}`,
            action_url: `/Profile?id=${encodeURIComponent(suggestion.candidateId)}`,
            action_label: 'View Profile',
            priority: 'normal',
            source_user_id: suggestion.candidateId,
            source_user_name: suggestion.candidateName,
            source_user_avatar: suggestion.candidateAvatar,
            metadata: {
              suggested_user_id: suggestion.candidateId,
              suggestion_type: 'friendship',
              score: suggestion.score,
              reasons: suggestion.reasons
            }
          });

          allSuggestions.push({
            forUser: userId,
            suggested: suggestion.candidateName,
            score: suggestion.score,
            reasons: suggestion.reasons
          });
        }
      }
    }

    return Response.json({
      success: true,
      suggestionsCreated: allSuggestions.length,
      usersProcessed: usersToProcess.length,
      suggestions: allSuggestions
    });

  } catch (error) {
    console.error('Friendship suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});