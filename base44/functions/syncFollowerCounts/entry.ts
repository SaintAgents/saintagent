import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Fetch all Follow records
  const follows = await base44.asServiceRole.entities.Follow.list('-created_date', 5000);

  // Count followers and following per user
  const followerCounts = {};
  const followingCounts = {};

  for (const f of follows) {
    const followingId = f.following_id;
    const followerId = f.follower_id;
    if (followingId) {
      followerCounts[followingId] = (followerCounts[followingId] || 0) + 1;
    }
    if (followerId) {
      followingCounts[followerId] = (followingCounts[followerId] || 0) + 1;
    }
  }

  // Fetch all profiles
  const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 5000);

  let updated = 0;
  for (const profile of profiles) {
    const realFollowers = followerCounts[profile.user_id] || 0;
    const realFollowing = followingCounts[profile.user_id] || 0;

    if (profile.follower_count !== realFollowers || profile.following_count !== realFollowing) {
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        follower_count: realFollowers,
        following_count: realFollowing
      });
      updated++;
    }
  }

  return Response.json({ 
    success: true, 
    total_profiles: profiles.length,
    total_follows: follows.length,
    profiles_updated: updated 
  });
});