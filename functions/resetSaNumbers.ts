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
    
    // Reset all SA numbers in order
    let counter = 0;
    for (const profile of allProfiles) {
      counter++;
      const saNumber = padSix(counter);
      await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saNumber });
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
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});