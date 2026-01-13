import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function padSix(n) {
  return String(n).padStart(6, '0');
}

function isDemoUser(email) {
  if (!email) return false;
  return email.toLowerCase().includes('demo');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all profiles ordered by created_date (oldest first)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('created_date', 1000);
    
    if (!allProfiles || allProfiles.length === 0) {
      return Response.json({ error: 'No profiles found' }, { status: 404 });
    }

    // Separate: find creator first, then real users, then demo users
    const creatorEmail = 'germaintrust@gmail.com';
    const creatorProfile = allProfiles.find(p => p.user_id?.toLowerCase() === creatorEmail.toLowerCase());
    const realUsers = allProfiles.filter(p => 
      p.user_id?.toLowerCase() !== creatorEmail.toLowerCase() && !isDemoUser(p.user_id)
    );
    const demoUsers = allProfiles.filter(p => isDemoUser(p.user_id));

    const updates = [];
    let counter = 0;

    // 1. Creator gets SA#000001
    if (creatorProfile) {
      counter = 1;
      updates.push(
        base44.asServiceRole.entities.UserProfile.update(creatorProfile.id, { sa_number: padSix(counter) })
      );
    }

    // 2. Real users get incremental numbers
    for (const profile of realUsers) {
      counter++;
      updates.push(
        base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: padSix(counter) })
      );
    }

    // 3. Demo users get "Demo" and " - Demo" appended to name
    for (const profile of demoUsers) {
      const nameUpdate = {};
      nameUpdate.sa_number = 'Demo';
      
      // Add " - Demo" to display_name if not already there
      if (profile.display_name && !profile.display_name.toLowerCase().includes('demo')) {
        nameUpdate.display_name = profile.display_name + ' - Demo';
      }
      
      updates.push(
        base44.asServiceRole.entities.UserProfile.update(profile.id, nameUpdate)
      );
    }
    
    // Execute updates in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      await Promise.all(updates.slice(i, i + batchSize));
    }

    // Update the counter in PlatformSetting (only count real SA numbers)
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    const setting = settings?.[0];
    
    if (setting) {
      await base44.asServiceRole.entities.PlatformSetting.update(setting.id, { value: String(counter) });
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: String(counter) });
    }

    return Response.json({ 
      success: true, 
      totalAssigned: counter,
      demoUsers: demoUsers.length,
      nextNumber: counter + 1
    });
  } catch (error) {
    console.error('Reset SA error:', error);
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});