import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function padSix(n) {
  try { return String(n).padStart(6, '0'); } catch { return String(n); }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Load current user's profile
    const profs = await base44.entities.UserProfile.filter({ user_id: user.email });
    const profile = profs?.[0];
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // If already assigned, return existing
    if (profile.sa_number && /^\d{1,10}$/.test(String(profile.sa_number))) {
      return Response.json({ sa_number: profile.sa_number, assigned: false });
    }

    // Get or initialize the SA counter in PlatformSetting
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    let setting = settings?.[0] || null;
    let current = Number(setting?.value || 0) || 0;

    // Special-case: ensure the creator can be #000001 if counter not initialized yet
    const isCreator = String(user.email).toLowerCase() === 'germaintrust@gmail.com';
    let next;
    if (!setting) {
      // Create the setting record
      if (isCreator) {
        next = 1;
      } else {
        // If first assignment isn't creator, still start at 1 for whoever claims first
        next = 1;
      }
    } else {
      next = current + 1;
    }

    const saStr = padSix(next);
    await base44.entities.UserProfile.update(profile.id, { sa_number: saStr });

    if (setting) {
      await base44.asServiceRole.entities.PlatformSetting.update(setting.id, { value: next });
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: next });
    }

    return Response.json({ sa_number: saStr, assigned: true });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});