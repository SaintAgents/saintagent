import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const VALID_SECTORS = ['water','food','housing','power','healing','mining','environment','education','technology','infrastructure','governance','other'];

const SECTOR_KEYWORDS = {
  water: ['water', 'desalination', 'irrigation', 'aqua', 'hydro', 'well', 'purification', 'ocean', 'marine', 'fish', 'aquaculture'],
  food: ['food', 'agriculture', 'farming', 'permaculture', 'biodynamic', 'harvest', 'crop', 'seed', 'nutrition', 'organic', 'livestock'],
  housing: ['housing', 'shelter', 'home', 'building', 'construction', 'vaastu', 'architecture', 'temple', 'garbha', 'residential', 'modular'],
  power: ['power', 'energy', 'solar', 'wind', 'electric', 'grid', 'battery', 'renewable', 'generator', 'tesla', 'microgrid', 'fuel'],
  healing: ['healing', 'health', 'wellness', 'therapy', 'holistic', 'medicine', 'meditation', 'consciousness', 'sanctuary', 'mental health', 'clinic'],
  mining: ['mining', 'mineral', 'extraction', 'ore', 'gold', 'lithium', 'rare earth', 'geological'],
  environment: ['environment', 'climate', 'regenerative', 'sustainability', 'eco', 'conservation', 'reforestation', 'biodiversity', 'waste', 'recycling', 'pollution'],
  education: ['education', 'school', 'academy', 'learning', 'training', 'course', 'teach', 'curriculum', 'literacy', 'university', 'student'],
  technology: ['technology', 'tech', 'ai', 'software', 'platform', 'digital', 'blockchain', 'app', 'web3', 'data', 'cyber', 'fintech', 'saas'],
  infrastructure: ['infrastructure', 'road', 'bridge', 'transport', 'logistics', 'supply chain', 'network', 'telecom', 'rail', 'port'],
  governance: ['governance', 'cooperative', 'council', 'sovereign', 'alliance', 'policy', 'legal', 'democracy', 'voting', 'constitution'],
};

function classifyByKeywords(project) {
  const text = [
    project.title || '',
    project.description || '',
    project.problem_statement || '',
    project.use_of_funds || '',
    project.alignment_statement || '',
    project.strategic_intent || '',
    project.impact_beneficiaries || '',
    ...(project.derived_tags || []),
    ...(project.impact_tags || []),
    ...(project.lane_secondary || []),
  ].join(' ').toLowerCase();

  for (const [key, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return key;
    }
  }
  return 'other';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const bodyText = await req.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    const useAI = body.useAI === true;

    // Fetch projects
    console.log('Fetching projects...');
    // Helper to safely fetch a small list from SDK (returns string sometimes)
    async function fetchProjects(limit) {
      const raw = await base44.entities.Project.list('-created_date', limit);
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') return JSON.parse(raw);
      return [];
    }

    // Fetch all projects — SDK can only return up to ~10 at a time reliably from backend
    // So fetch in one go with limit 10, classify those, repeat
    // But we need ALL projects. Use filter to get unclassified ones specifically.
    let allUnclassified = [];
    const batchLimit = 10;
    let processedIds = new Set();
    let totalFound = 0;
    let rounds = 0;
    const maxRounds = 60; // Safety cap: 60 rounds * 10 = 600 max projects

    while (rounds < maxRounds) {
      rounds++;
      // Get 10 projects that don't have a sector yet
      // SDK filter doesn't support "field is null", so fetch recent and skip already-processed
      const batch = await fetchProjects(batchLimit);
      if (!batch || batch.length === 0) break;

      // Filter to unclassified and not yet processed in this run
      const toProcess = batch.filter(p => !p.sector && !processedIds.has(p.id));
      if (toProcess.length === 0) break; // all fetched projects already have sectors

      for (const project of toProcess) {
        const sector = useAI ? null : classifyByKeywords(project);
        const finalSector = sector || classifyByKeywords(project);
        await base44.entities.Project.update(project.id, { sector: finalSector });
        allUnclassified.push({ id: project.id, title: project.title, sector: finalSector });
        processedIds.add(project.id);
      }
      totalFound += toProcess.length;

      // If less than batchLimit returned, we've exhausted the list
      if (batch.length < batchLimit) break;
    }

    return Response.json({
      success: true,
      classified: totalFound,
      rounds,
      results: allUnclassified.slice(0, 30),
      message: `Classified ${totalFound} projects in ${rounds} rounds`
    });
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});