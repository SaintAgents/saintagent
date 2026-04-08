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
    const dryRun = body.dry_run !== false;

    const allProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);

    const withSa = allProfiles
      .filter(p => p.sa_number && /^\d+$/.test(String(p.sa_number)))
      .map(p => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name || '',
        handle: p.handle || '',
        sa_number: String(p.sa_number),
        sa_int: parseInt(String(p.sa_number), 10),
        created_date: p.created_date,
        is_demo: (p.display_name || '').toLowerCase().includes('demo') || (p.handle || '').toLowerCase().includes('demo')
      }))
      .sort((a, b) => a.sa_int - b.sa_int);

    // PHASE 1: Identify demo users occupying SA# 92-140 range
    const demoInGap = withSa.filter(p => p.is_demo && p.sa_int >= 92 && p.sa_int <= 140);
    
    // PHASE 2: Identify real users above 91 that need to be renumbered down
    const realAbove91 = withSa.filter(p => !p.is_demo && p.sa_int > 91);
    realAbove91.sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());

    // Also check: are there demo users below 92 we should clear?
    const demoBelow92 = withSa.filter(p => p.is_demo && p.sa_int <= 91);

    console.log(`Total SA profiles: ${withSa.length}`);
    console.log(`Demo in gap (92-140): ${demoInGap.length}`, JSON.stringify(demoInGap.map(p => `SA#${p.sa_number}=${p.display_name}`)));
    console.log(`Demo below 92: ${demoBelow92.length}`, JSON.stringify(demoBelow92.map(p => `SA#${p.sa_number}=${p.display_name}`)));
    console.log(`Real above 91: ${realAbove91.length}`, JSON.stringify(realAbove91.map(p => `SA#${p.sa_number}=${p.display_name}`)));

    // Clear SA# from demo users in the gap
    const demosCleared = [];
    for (const p of demoInGap) {
      demosCleared.push({ id: p.id, name: p.display_name, old_sa: p.sa_number });
      if (!dryRun) {
        await base44.asServiceRole.entities.UserProfile.update(p.id, { sa_number: '' });
      }
    }

    // Renumber real users above 91 starting at 92
    let nextSa = 92;
    const fixes = [];
    for (const p of realAbove91) {
      const newSa = padSix(nextSa);
      if (newSa !== p.sa_number) {
        fixes.push({ id: p.id, name: p.display_name, old_sa: p.sa_number, new_sa: newSa });
        if (!dryRun) {
          await base44.asServiceRole.entities.UserProfile.update(p.id, { sa_number: newSa });
        }
      }
      nextSa++;
    }

    const finalCounter = nextSa - 1;
    if (!dryRun) {
      const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'sa_counter' });
      if (settings?.[0]) {
        await base44.asServiceRole.entities.PlatformSetting.update(settings[0].id, { value: String(finalCounter) });
      }
    }

    return Response.json({
      status: dryRun ? 'DRY_RUN' : 'APPLIED',
      demos_in_gap_cleared: demosCleared.length,
      demos_in_gap: demosCleared,
      demos_below_92_warning: demoBelow92.map(p => ({ sa: p.sa_number, name: p.display_name })),
      real_users_renumbered: fixes.length,
      fixes,
      new_counter: finalCounter
    });
  } catch (error) {
    console.error('fixSaNumberGap error:', error?.message);
    return Response.json({ error: error?.message }, { status: 500 });
  }
});