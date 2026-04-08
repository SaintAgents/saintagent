import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function padSix(n) {
  return String(n).padStart(6, '0');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default to dry run

    // Fetch all profiles
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
    
    const withSa = allProfiles
      .filter(p => p.sa_number && /^\d+$/.test(String(p.sa_number)))
      .map(p => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name,
        sa_number: String(p.sa_number),
        sa_int: parseInt(String(p.sa_number), 10),
        created_date: p.created_date
      }))
      .sort((a, b) => a.sa_int - b.sa_int);

    // Find gaps
    const gaps = [];
    for (let i = 1; i < withSa.length; i++) {
      const expected = withSa[i-1].sa_int + 1;
      const actual = withSa[i].sa_int;
      if (actual !== expected) {
        gaps.push({ after_sa: withSa[i-1].sa_int, next_sa: actual, skipped: actual - expected });
      }
    }

    // List profiles around the gap area
    const aroundGap = withSa
      .filter(p => p.sa_int >= 85)
      .map(p => ({ sa: p.sa_number, name: p.display_name, created: p.created_date }));

    console.log('Total profiles with SA:', withSa.length);
    console.log('Max SA:', withSa[withSa.length - 1]?.sa_int);
    console.log('Gaps:', JSON.stringify(gaps));
    console.log('Profiles 85+:', JSON.stringify(aroundGap));

    if (gaps.length === 0) {
      // No gaps found - but counter might be ahead of actual max
      const maxSa = withSa[withSa.length - 1]?.sa_int || 0;
      const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
      const counter = Number(settings?.[0]?.value || 0);
      
      return Response.json({
        status: 'no_gaps_found',
        total_profiles: withSa.length,
        max_sa: maxSa,
        counter_value: counter,
        counter_drift: counter - maxSa,
        profiles_85_plus: aroundGap,
        message: counter > maxSa 
          ? `Counter (${counter}) is ${counter - maxSa} ahead of max SA# (${maxSa}). Numbers are sequential but counter burned ${counter - maxSa} numbers.`
          : 'Everything looks good.'
      });
    }

    // There are gaps - fix them by reassigning everything after the first gap
    const firstGapAfter = gaps[0].after_sa;
    const goodProfiles = withSa.filter(p => p.sa_int <= firstGapAfter);
    const needsFix = withSa.filter(p => p.sa_int > firstGapAfter);
    
    // Sort by created_date to maintain chronological order
    needsFix.sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());

    let nextSa = firstGapAfter + 1;
    const fixes = [];

    for (const p of needsFix) {
      const newSa = padSix(nextSa);
      fixes.push({
        id: p.id,
        name: p.display_name,
        old_sa: p.sa_number,
        new_sa: newSa
      });
      
      if (!dryRun) {
        await base44.asServiceRole.entities.UserProfile.update(p.id, { sa_number: newSa });
        console.log(`Fixed: ${p.display_name}: SA#${p.sa_number} -> SA#${newSa}`);
      }
      nextSa++;
    }

    // Update counter
    const finalCounter = nextSa - 1;
    if (!dryRun) {
      const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
      const setting = settings?.[0];
      if (setting) {
        await base44.asServiceRole.entities.PlatformSetting.update(setting.id, { value: String(finalCounter) });
      }
    }

    return Response.json({
      status: dryRun ? 'DRY_RUN' : 'APPLIED',
      gaps_found: gaps,
      first_gap_after: firstGapAfter,
      profiles_to_fix: fixes.length,
      new_counter: finalCounter,
      fixes
    });
  } catch (error) {
    console.error('fixSaNumberGap error:', error?.message);
    return Response.json({ error: error?.message }, { status: 500 });
  }
});