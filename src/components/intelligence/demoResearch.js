const source = title => ({ kind:'demo', title });
const finding = (kind,text,citations = []) => ({ kind,text,citations });
const study = (id,objective,summary,sources,findings,next_steps,parent_id) => ({id,objective,summary,sources,findings,next_steps,parent_id,created_date:'2026-11-18T18:00:00Z'});
export const demoStudies = [
  study('garden','How could we start a neighborhood food garden?',
    'A small pilot is the most practical starting point. Before planting, the team needs a reliable water source, accessible paths, and volunteers willing to cover regular maintenance.',
    [source('Sample site walk: raised beds and water access'),source('Sample resident listening notes')],
    [finding('evidence','The site walk found six raised beds but no confirmed permission to use the nearest tap.',[1]),finding('interpretation','Residents asked for weekend activities and accessible paths; these should shape the pilot before choosing crops.',[2]),finding('hypothesis','A rotating watering shift could keep the pilot manageable for a small team.',[1,2]),finding('unresolved','Who can authorize access to water?')],
    ['Confirm water access with the site owner.','Recruit a small watering team.','Agree on a pilot plot with residents.']),
  study('watering','What would make a volunteer watering rota work?',
    'This branch narrows the garden investigation to staffing. Start with two weeks of named shifts, a backup contact, and one place to log missed shifts.',
    [source('Sample volunteer availability survey')],
    [finding('evidence','Three volunteers offered weekday shifts, but nobody committed to Sundays.',[1]),finding('unresolved','Sunday coverage and holiday backups are not confirmed.')],
    ['Recruit a Sunday volunteer and an on-call backup.','Review missed shifts at the end of the pilot.'],'garden'),
  study('watershed','Where should a creek restoration pilot begin?',
    'Start with a baseline survey of the three accessible stretches, then select one for a small native planting pilot after confirming land access.',
    [source('Sample creek walk field notes'),source('Sample access and permissions checklist')],
    [finding('evidence','The fictional creek walk identified three stretches with exposed banks.',[1]),finding('interpretation','Survey accessible areas first and exclude the tributary until access is confirmed.',[2])],
    ['Confirm access with the land steward.','Record baseline photos and plant cover.']),
  study('solar','What belongs in a first solar workshop?',
    'A short tabletop demonstration followed by a learner explanation is enough for a first session. Focus on how light and shade affect a small panel rather than on installation.',
    [source('Sample facilitator rehearsal notes')],
    [finding('evidence','The rehearsal notes report that comparing the panel in light and shade helped learners explain the result.',[1]),finding('hypothesis','Pairs may need more time to practice explaining the comparison to each other.',[1])],
    ['Pilot the agenda with a small group.','Ask participants to explain one thing they observed.']),
];