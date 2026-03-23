import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function padSix(n) {
  return String(n).padStart(6, '0');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get ALL profiles
    const allProfiles = await base44.asServiceRole.entities.UserProfile.filter({}, '-created_date', 500);
    
    // Find profiles missing SA numbers (null, empty, undefined)
    const missing = allProfiles.filter(p => !p.sa_number || String(p.sa_number).trim() === '');
    
    if (missing.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'All profiles have SA numbers!', 
        total_profiles: allProfiles.length,
        missing_count: 0 
      });
    }

    // Get current counter
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    const setting = settings?.[0];
    let counter = Number(setting?.value || 0) || 0;

    // Sort missing profiles by created_date ascending (oldest first)
    missing.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    const assigned = [];
    for (const profile of missing) {
      counter++;
      const saStr = padSix(counter);
      await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
      assigned.push({ 
        name: profile.display_name || profile.handle, 
        email: profile.user_id,
        sa: saStr 
      });
    }

    // Update counter
    if (setting) {
      await base44.asServiceRole.entities.PlatformSetting.update(setting.id, { value: String(counter) });
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: String(counter) });
    }

    return Response.json({ 
      success: true, 
      total_profiles: allProfiles.length,
      missing_found: missing.length,
      assigned,
      new_counter: counter
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});