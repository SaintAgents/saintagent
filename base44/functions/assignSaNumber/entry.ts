import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
    if (profile.sa_number && /^\d{6}$/.test(String(profile.sa_number))) {
      return Response.json({ sa_number: profile.sa_number, assigned: false });
    }

    const isCreator = String(user.email).toLowerCase() === 'germaintrust@gmail.com';

    if (isCreator) {
      const saStr = padSix(1);
      await base44.entities.UserProfile.update(profile.id, { sa_number: saStr });

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
      return Response.json({ sa_number: saStr, assigned: true });
    }

    // --- SAFE COUNTER INCREMENT ---
    // Read counter
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
    let setting = settings?.[0] || null;
    let current = Number(setting?.value || 0) || 0;

    // Scan existing profiles to find actual max SA# to prevent gaps/dupes
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
    let maxSa = current;
    for (const p of allProfiles) {
      if (p.sa_number && /^\d+$/.test(String(p.sa_number))) {
        const num = parseInt(String(p.sa_number), 10);
        if (num > maxSa) maxSa = num;
      }
    }

    const next = Math.max(current, maxSa) + 1;
    const saStr = padSix(next);

    await base44.entities.UserProfile.update(profile.id, { sa_number: saStr });

    if (setting) {
      await base44.asServiceRole.entities.PlatformSetting.update(setting.id, { value: String(next) });
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'sa_counter', value: String(next) });
    }

    return Response.json({ sa_number: saStr, assigned: true });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});