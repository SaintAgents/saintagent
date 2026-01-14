import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find all demo profiles (sa_number = 'Demo' or display_name contains 'Demo')
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 200);
    
    const demoProfiles = allProfiles.filter(p => 
      p.sa_number === 'Demo' || 
      p.display_name?.toLowerCase().includes('demo') ||
      p.user_id?.includes('demo') ||
      p.user_id?.includes('@saintagent')
    );

    // Sort by created_date for consistent ordering
    demoProfiles.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    const updates = [];
    let counter = 1;

    for (const profile of demoProfiles) {
      const newSaNumber = `Demo-${String(counter).padStart(3, '0')}`;
      
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        sa_number: newSaNumber
      });

      updates.push({
        id: profile.id,
        display_name: profile.display_name,
        user_id: profile.user_id,
        old_sa_number: profile.sa_number,
        new_sa_number: newSaNumber
      });

      counter++;
    }

    return Response.json({
      success: true,
      message: `Assigned SA numbers to ${updates.length} demo profiles`,
      updates
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});