import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Realistic GGG values by rank (much lower, based on actual earning rates)
const RANK_GGG_RANGES = {
  'seeker': { min: 0.1, max: 0.5 },
  'initiate': { min: 0.3, max: 1.2 },
  'adept': { min: 0.8, max: 2.5 },
  'practitioner': { min: 1.5, max: 4.0 },
  'master': { min: 3.0, max: 8.0 },
  'sage': { min: 5.0, max: 12.0 },
  'oracle': { min: 8.0, max: 18.0 },
  'ascended': { min: 12.0, max: 25.0 },
  'guardian': { min: 18.0, max: 35.0 }
};

// Realistic influence/expertise by rank
const RANK_SCORE_RANGES = {
  'seeker': { influence: [5, 15], expertise: [5, 15] },
  'initiate': { influence: [10, 25], expertise: [10, 25] },
  'adept': { influence: [20, 40], expertise: [20, 40] },
  'practitioner': { influence: [30, 50], expertise: [30, 50] },
  'master': { influence: [40, 60], expertise: [40, 60] },
  'sage': { influence: [50, 70], expertise: [50, 70] },
  'oracle': { influence: [55, 75], expertise: [55, 75] },
  'ascended': { influence: [60, 80], expertise: [60, 80] },
  'guardian': { influence: [65, 85], expertise: [65, 85] }
};

function randomInRange(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function randomIntInRange(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all demo user profiles
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
    const demoProfiles = allProfiles.filter(p => 
      p.is_demo === true || 
      p.user_id?.includes('demo') || 
      p.display_name?.toLowerCase().includes('demo') ||
      p.sa_number?.includes('Demo')
    );

    const updates = [];

    for (const profile of demoProfiles) {
      const rank = profile.rank_code || 'seeker';
      const gggRange = RANK_GGG_RANGES[rank] || RANK_GGG_RANGES['seeker'];
      const scoreRange = RANK_SCORE_RANGES[rank] || RANK_SCORE_RANGES['seeker'];

      const newGGG = randomInRange(gggRange.min, gggRange.max);
      const newInfluence = randomIntInRange(scoreRange.influence[0], scoreRange.influence[1]);
      const newExpertise = randomIntInRange(scoreRange.expertise[0], scoreRange.expertise[1]);

      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        ggg_balance: newGGG,
        influence_score: newInfluence,
        expertise_score: newExpertise
      });

      updates.push({
        userId: profile.user_id,
        name: profile.display_name,
        rank,
        oldGGG: profile.ggg_balance,
        newGGG,
        oldInfluence: profile.influence_score,
        newInfluence,
        oldExpertise: profile.expertise_score,
        newExpertise
      });
    }

    return Response.json({
      success: true,
      demoUsersUpdated: updates.length,
      updates
    });

  } catch (error) {
    console.error('Fix demo values error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});