const samples = [
  { category: 'opportunities', priority: 'opportunity', headline: 'Community garden seeks mentors', description: 'A neighborhood garden is looking for volunteers to lead its first seed-starting workshop.' },
  { category: 'projects', priority: 'milestone', headline: 'River restoration reaches a milestone', description: 'A volunteer team finished its first native planting day along the river.', metric: '240 native plants' },
  { category: 'collaborations', priority: 'success', headline: 'Two teams launch a repair café', description: 'A makerspace and a community center teamed up to offer monthly repair sessions.' },
  { category: 'research', priority: 'information', headline: 'New report explores community solar', description: 'A sample research team compared three ways for neighbors to share local solar power.' },
  { category: 'impact', priority: 'success', headline: 'Food rescue network expands', description: 'The sample network added a pickup route for local grocers.', metric: '3 new pickup stops' },
  { category: 'needs', priority: 'information', headline: 'Digital skills workshop needs a facilitator', description: 'A library is looking for a volunteer to help adults practice everyday digital skills.' },
];

export function makeDemoActivity(now = Date.now()) {
  return samples.map((event, index) => ({ ...event, id: `ticker-sample-${index + 1}`, is_demo: true, created_date: new Date(now - index * 120000).toISOString() }));
}