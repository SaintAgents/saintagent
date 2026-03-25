import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all scheduled and live broadcasts
    const [scheduled, live] = await Promise.all([
      base44.asServiceRole.entities.Broadcast.filter({ status: 'scheduled' }),
      base44.asServiceRole.entities.Broadcast.filter({ status: 'live' }),
    ]);

    const allBroadcasts = [...scheduled, ...live];
    const now = Date.now();
    let endedCount = 0;

    for (const b of allBroadcasts) {
      if (!b.scheduled_time) continue;
      
      const startTime = new Date(b.scheduled_time).getTime();
      const durationMs = (b.duration_minutes || 60) * 60 * 1000;
      const endTime = startTime + durationMs;

      // If the broadcast's time window has fully passed, mark it as ended
      if (now > endTime) {
        await base44.asServiceRole.entities.Broadcast.update(b.id, { status: 'ended' });
        endedCount++;
        console.log(`Ended broadcast: "${b.title}" (ID: ${b.id})`);
      }
    }

    return Response.json({ 
      success: true, 
      checked: allBroadcasts.length, 
      ended: endedCount 
    });
  } catch (error) {
    console.error('autoEndBroadcasts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});