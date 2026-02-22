import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function padSix(n) {
  try { return String(n).padStart(6, '0'); } catch { return String(n); }
}

// Entity automation triggered when UserProfile is created
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get the event payload from the automation
    const payload = await req.json();
    console.log('autoAssignSaNumber triggered with payload:', JSON.stringify(payload));
    
    const { event, data } = payload;
    
    if (!data || !data.id) {
      console.log('No profile data in payload, skipping');
      return Response.json({ skipped: true, reason: 'No profile data' });
    }
    
    const profile = data;
    const userId = profile.user_id;
    
    console.log('Processing profile:', profile.id, 'user_id:', userId);
    
    // If already has SA number, skip
    if (profile.sa_number && /^\d{1,10}$/.test(String(profile.sa_number))) {
      console.log('Profile already has SA number:', profile.sa_number);
      return Response.json({ sa_number: profile.sa_number, assigned: false, reason: 'already_assigned' });
    }
    
    // Check if this is the creator account
    const isCreator = String(userId).toLowerCase() === 'germaintrust@gmail.com';
    
    // Creator: force #000001
    if (isCreator) {
      const desired = 1;
      const saStr = padSix(desired);
      await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
      
      const counterSettings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
      const existing = counterSettings?.[0];
      const currentVal = Number(existing?.value || 0) || 0;
      if (existing) {
        if (currentVal < desired) {
          await base44.asServiceRole.entities.PlatformSetting.update(existing.id, { value: String(desired) });
        }
      } else {
        await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: String(desired) });
      }
      console.log('Assigned SA#000001 to creator');
      return Response.json({ sa_number: saStr, assigned: true });
    }
    
    // Get or initialize the SA counter in PlatformSetting
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    let setting = settings?.[0] || null;
    let current = Number(setting?.value || 0) || 0;
    
    const next = setting ? current + 1 : 1;
    const saStr = padSix(next);
    
    console.log('Assigning SA#' + saStr + ' to profile:', profile.id);
    
    await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
    
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