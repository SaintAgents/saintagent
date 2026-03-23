import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing demo project titles
    const existing = await base44.entities.Project.list('-created_date', 200);
    const existingTitles = new Set((existing || []).map((p) => (p.title || '').trim()));

    const demos = [
      {
        title: 'Clean Water Initiative (demo)',
        description: 'Deploy low-cost purification systems to rural communities.',
        budget: 250000,
        industrial_value: 4,
        humanitarian_score: 9,
        status: 'pending_review',
        impact_tags: ['health', 'water'],
        strategic_intent: 'Improve public health outcomes via access to clean water',
        negative_environmental_impact: false,
      },
      {
        title: 'Solar Microgrid Expansion (demo)',
        description: 'Community-owned solar microgrids with battery storage.',
        budget: 500000,
        industrial_value: 7,
        humanitarian_score: 8,
        status: 'approved',
        impact_tags: ['energy', 'infrastructure'],
        strategic_intent: 'Energy resilience and reduced emissions',
        negative_environmental_impact: false,
      },
      {
        title: 'Industrial Mining Upgrade (demo)',
        description: 'Automation and capacity increase for regional mine.',
        budget: 1200000,
        industrial_value: 9,
        humanitarian_score: 3,
        status: 'rejected',
        impact_tags: ['industry'],
        strategic_intent: 'Economic growth with notable tradeoffs',
        negative_environmental_impact: true,
      },
      {
        title: 'Rural Telemedicine Network (demo)',
        description: 'Remote diagnostics and consultations for remote areas.',
        budget: 180000,
        industrial_value: 5,
        humanitarian_score: 9,
        status: 'pending_review',
        impact_tags: ['health', 'technology'],
        strategic_intent: 'Increase healthcare access and early intervention',
        negative_environmental_impact: false,
      },
      {
        title: 'Reforestation & Carbon Credits (demo)',
        description: 'Native species reforestation with verified carbon credits.',
        budget: 320000,
        industrial_value: 6,
        humanitarian_score: 8,
        status: 'approved',
        impact_tags: ['environment', 'climate'],
        strategic_intent: 'Climate mitigation and local livelihood support',
        negative_environmental_impact: false,
      },
      {
        title: 'Emergency Housing Units (demo)',
        description: 'Rapid-deploy modular shelters for disaster response.',
        budget: 400000,
        industrial_value: 6,
        humanitarian_score: 9,
        status: 'flagged',
        impact_tags: ['shelter', 'disaster_response'],
        strategic_intent: 'Increase emergency readiness and safety',
        negative_environmental_impact: false,
      },
    ];

    const toCreate = demos.filter((d) => !existingTitles.has(d.title));

    if (toCreate.length > 0) {
      // Prefer bulk create if available
      if (typeof base44.entities.Project.bulkCreate === 'function') {
        await base44.entities.Project.bulkCreate(toCreate);
      } else {
        for (const d of toCreate) await base44.entities.Project.create(d);
      }
    }

    return Response.json({ created: toCreate.length, total_demo_titles: demos.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});