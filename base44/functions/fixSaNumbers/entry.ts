import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function padSix(n) {
  return String(n).padStart(6, '0');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const batch = payload.batch || 0; // 0 = real users only, 1+ = demo user batches

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

    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('created_date', 500);
    const realUsers = allProfiles.filter(p => !isDemoUser(p.user_id));
    const demoUsers = allProfiles.filter(p => isDemoUser(p.user_id));

    // Sort both by created_date ascending
    realUsers.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    demoUsers.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    // Force creator to position 1
    const creatorEmail = 'germaintrust@gmail.com';
    const creatorIdx = realUsers.findIndex(p => p.user_id === creatorEmail);
    if (creatorIdx > 0) {
      const [creator] = realUsers.splice(creatorIdx, 1);
      realUsers.unshift(creator);
    }

    const realCount = realUsers.length;

    if (batch === 0) {
      // BATCH 0: Only assign real users (should be < 30 so no rate limit issues)
      const results = [];
      for (let i = 0; i < realUsers.length; i++) {
        const profile = realUsers[i];
        const saStr = padSix(i + 1);
        try {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
          results.push({ name: profile.display_name, email: profile.user_id, sa: saStr, old: profile.sa_number || 'null' });
          // Throttle: 200ms between each
          if (i < realUsers.length - 1) await delay(200);
        } catch (err) {
          results.push({ name: profile.display_name, error: err.message });
        }
      }
      return Response.json({
        success: true,
        batch: 0,
        realUsersAssigned: results,
        realCount,
        demoCount: demoUsers.length,
        nextStep: 'Run with batch=1 to assign demo users (they start at SA#' + padSix(realCount + 1) + ')'
      });
    } else {
      // BATCH 1+: Assign demo users in chunks of 20
      const chunkSize = 20;
      const startIdx = (batch - 1) * chunkSize;
      const chunk = demoUsers.slice(startIdx, startIdx + chunkSize);
      
      if (chunk.length === 0) {
        // Update counter to final value
        const total = realCount + demoUsers.length;
        const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
        if (settings?.[0]) {
          await base44.asServiceRole.entities.PlatformSetting.update(settings[0].id, { value: String(total) });
        }
        return Response.json({ success: true, message: 'All done! Counter set to ' + total, batch });
      }

      const results = [];
      for (let i = 0; i < chunk.length; i++) {
        const profile = chunk[i];
        const globalIdx = realCount + startIdx + i + 1;
        const saStr = padSix(globalIdx);
        try {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, { sa_number: saStr });
          results.push({ name: profile.display_name, sa: saStr });
          if (i < chunk.length - 1) await delay(250);
        } catch (err) {
          results.push({ name: profile.display_name, error: err.message });
        }
      }

      const remaining = demoUsers.length - (startIdx + chunk.length);
      return Response.json({
        success: true,
        batch,
        assigned: results,
        remaining,
        nextStep: remaining > 0 ? 'Run with batch=' + (batch + 1) : 'Done! Run batch=' + (batch + 1) + ' to finalize counter'
      });
    }
  } catch (error) {
    console.error('fixSaNumbers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});