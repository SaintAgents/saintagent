import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function padSix(n) {
  return String(n).padStart(6, '0');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get ALL profiles, sorted by creation date (oldest first = lowest SA#)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('created_date', 500);
    
    // Known demo email patterns
    const isDemoUser = (email) => {
      if (!email) return true;
      const lower = email.toLowerCase();
      return lower.includes('demo') || 
             lower.includes('test.sa') ||
             lower.startsWith('demo_') ||
             lower.includes('@example.com') ||
             lower.includes('fake') ||
             lower.includes('seed');
    };

    // Separate real users from demo users
    const realUsers = allProfiles.filter(p => !isDemoUser(p.user_id));
    const demoUsers = allProfiles.filter(p => isDemoUser(p.user_id));

    // Sort real users by created_date ascending
    realUsers.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    // Force creator to be #000001
    const creatorEmail = 'germaintrust@gmail.com';
    const creatorIdx = realUsers.findIndex(p => p.user_id === creatorEmail);
    if (creatorIdx > 0) {
      const [creator] = realUsers.splice(creatorIdx, 1);
      realUsers.unshift(creator);
    }

    const results = { realAssigned: [], demoAssigned: [], errors: [] };
    let counter = 0;

    // Assign SA#s to real users first (1, 2, 3, ...)
    for (const profile of realUsers) {
      counter++;
      const saStr = padSix(counter);
      try {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
        results.realAssigned.push({ 
          display_name: profile.display_name, 
          email: profile.user_id, 
          sa_number: saStr,
          old_sa: profile.sa_number || 'null'
        });
      } catch (err) {
        results.errors.push({ email: profile.user_id, error: err.message });
      }
    }

    const realCount = counter;

    // Now assign SA#s to demo users (continuing from where real users left off)
    demoUsers.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    for (const profile of demoUsers) {
      counter++;
      const saStr = padSix(counter);
      try {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
        results.demoAssigned.push({ 
          display_name: profile.display_name, 
          sa_number: saStr 
        });
      } catch (err) {
        results.errors.push({ email: profile.user_id, error: err.message });
      }
    }

    // Update the counter
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    if (settings?.[0]) {
      await base44.asServiceRole.entities.PlatformSetting.update(settings[0].id, { value: String(counter) });
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: String(counter) });
    }

    return Response.json({ 
      success: true,
      realUsersCount: realCount,
      demoUsersCount: counter - realCount,
      totalAssigned: counter,
      realAssigned: results.realAssigned,
      demoAssignedCount: results.demoAssigned.length,
      errors: results.errors
    });
  } catch (error) {
    console.error('fixSaNumbers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});