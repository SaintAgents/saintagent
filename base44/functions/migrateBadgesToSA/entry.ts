import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all user profiles with SA numbers
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 1000);
    
    // Create email -> SA# lookup map
    const emailToSA = {};
    profiles.forEach(p => {
      if (p.user_id && p.sa_number) {
        emailToSA[p.user_id] = p.sa_number;
      }
    });

    // Get all badges
    const allBadges = await base44.asServiceRole.entities.Badge.list('-created_date', 1000);
    
    let updated = 0;
    let skipped = 0;

    for (const badge of allBadges) {
      const userId = badge.user_id;
      
      // If user_id is an email and we have an SA# for it, update
      if (userId && userId.includes('@') && emailToSA[userId]) {
        await base44.asServiceRole.entities.Badge.update(badge.id, {
          user_id: emailToSA[userId]
        });
        updated++;
      } else {
        skipped++;
      }
    }

    return Response.json({
      success: true,
      message: `Migration complete: ${updated} badges updated, ${skipped} skipped`,
      updated,
      skipped,
      totalProfiles: profiles.length,
      mappingsCreated: Object.keys(emailToSA).length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});