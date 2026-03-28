import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const VALID_SECTORS = ['water','food','housing','power','healing','mining','environment','education','technology','infrastructure','governance','other'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const projects = body.projects;

    if (!Array.isArray(projects) || projects.length === 0) {
      return Response.json({ error: 'Send { projects: [{id, sector}, ...] }' }, { status: 400 });
    }

    let classified = 0;
    const errors = [];

    for (const p of projects) {
      if (!p.id || !p.sector || !VALID_SECTORS.includes(p.sector)) {
        errors.push({ id: p.id, reason: 'invalid sector: ' + p.sector });
        continue;
      }
      try {
        await base44.asServiceRole.entities.Project.update(p.id, { sector: p.sector });
        classified++;
      } catch (e) {
        errors.push({ id: p.id, reason: e.message });
      }
    }

    return Response.json({
      success: true,
      classified,
      errors: errors.length > 0 ? errors.slice(0, 20) : undefined,
      message: `Saved sector for ${classified} projects`
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});