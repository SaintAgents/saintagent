import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function padSix(n) {
  try { return String(n).padStart(6, '0'); } catch { return String(n); }
}

// Entity automation triggered when UserProfile is created
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const payload = await req.json();
    console.log('autoAssignSaNumber triggered');
    
    const { data } = payload;
    
    if (!data || !data.id) {
      console.log('No profile data in payload, skipping');
      return Response.json({ skipped: true, reason: 'No profile data' });
    }
    
    const profileId = data.id;
    const userId = data.user_id;
    
    // Re-fetch the profile fresh to avoid stale data
    const freshProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: userId });
    const profile = freshProfiles?.[0];
    
    if (!profile) {
      console.log('Profile not found for user:', userId);
      return Response.json({ skipped: true, reason: 'profile_not_found' });
    }
    
    // If already has a valid SA number, skip
    if (profile.sa_number && /^\d{6}$/.test(String(profile.sa_number))) {
      console.log('Profile already has SA number:', profile.sa_number);
      return Response.json({ sa_number: profile.sa_number, assigned: false });
    }
    
    // Check if this is the creator account
    const isCreator = String(userId).toLowerCase() === 'germaintrust@gmail.com';
    
    if (isCreator) {
      const saStr = padSix(1);
      await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
      
      const counterSettings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
      const existing = counterSettings?.[0];
      if (existing) {
        const currentVal = Number(existing.value || 0) || 0;
        if (currentVal < 1) {
          await base44.asServiceRole.entities.PlatformSetting.update(existing.id, { value: '1' });
        }
      } else {
        await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: '1' });
      }
      console.log('Assigned SA#000001 to creator');
      return Response.json({ sa_number: saStr, assigned: true });
    }
    
    // --- SAFE COUNTER INCREMENT ---
    // 1. Read counter
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    let setting = settings?.[0] || null;
    let current = Number(setting?.value || 0) || 0;
    
    // 2. Scan existing profiles to find actual max SA# to prevent gaps/dupes
    //    This is the safety net — if counter got out of sync, we correct it
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
    let maxSa = current;
    for (const p of allProfiles) {
      if (p.sa_number && /^\d+$/.test(String(p.sa_number))) {
        const num = parseInt(String(p.sa_number), 10);
        if (num > maxSa) maxSa = num;
      }
    }
    
    // Use the higher of counter vs actual max to avoid duplicates
    const next = Math.max(current, maxSa) + 1;
    const saStr = padSix(next);
    
    console.log(`Counter was ${current}, max existing SA# is ${maxSa}, assigning SA#${saStr}`);
    
    // 3. Update profile with new SA number
    await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
    
    // 4. Update counter
    if (setting) {
      await base44.asServiceRole.entities.PlatformSetting.update(setting.id, { value: String(next) });
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: String(next) });
    }
    
    console.log('Successfully assigned SA#' + saStr);
    return Response.json({ sa_number: saStr, assigned: true });
  } catch (error) {
    console.error('autoAssignSaNumber error:', error?.message || error);
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});