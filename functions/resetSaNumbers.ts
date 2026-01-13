import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function padSix(n) {
  return String(n).padStart(6, '0');
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

    // Reset all SA numbers in order
    let counter = 0;
    const updates = [];
    for (const profile of allProfiles) {
      counter++;
      const saNumber = padSix(counter);
      updates.push(
        base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saNumber })
      );
    }
    
    // Execute updates in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      await Promise.all(updates.slice(i, i + batchSize));
    }

    // Update the counter in PlatformSetting
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
      nextNumber: counter + 1
    });
  } catch (error) {
    console.error('Reset SA error:', error);
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});