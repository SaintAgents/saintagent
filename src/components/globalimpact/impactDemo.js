const image = name => `https://media.base44.com/images/public/694f3e0401b05e6e8a042002/${name}_generated_image.png`;
export const demoOpportunities = [
  {id:'garden', title:'Help start a neighborhood food garden', category:'collaboration', listing_type:'request', entity_name:'Juniper Community Garden (demo)', region:'Denver, Colorado', demoPoint:[39.7392,-104.9903], delivery_mode:'in-person', duration_minutes:90, skills_required:['gardening','community outreach'], image_url:image('347d35f33ea2f24f8d8857ebf4865e9d'), description:'Help a volunteer team turn unused raised beds into a neighborhood food garden. Start with a site walk to check water access, accessibility, and what local families would like to grow.'},
  {id:'watershed', title:'Join a creek restoration planning session', category:'strategy', listing_type:'request', entity_name:'Clearbank Watershed Crew (demo)', region:'Boulder, Colorado', demoPoint:[40.015,-105.2705], delivery_mode:'hybrid', duration_minutes:45, skills_required:['ecology','mapping'], image_url:image('3de87200685d9c2d2c20466ce864b21d'), description:'Help turn a creek walk into a short plan for restoring native vegetation. Volunteers compare notes on bare banks, existing plants, and where follow-up surveys would be most useful.'},
  {id:'solar', title:'Learn to teach a hands-on solar workshop', category:'course', listing_type:'offer', entity_name:'Bright Bench Collective (demo)', region:'Santa Fe, New Mexico', demoPoint:[35.687,-105.938], delivery_mode:'online', duration_minutes:60, skills_required:['teaching','clean energy'], image_url:image('f0518bca2060c75a787a084110e7e310'), description:'Join a facilitator practice session for an introductory solar workshop. Review a tabletop demonstration, rehearse a plain-language explanation, and plan a short learner activity.'},
];

const event = (i, category, headline, description, time) => ({id:`sample-pulse-${category}`, category, headline, description, created_date:`2026-11-18T${time}:00Z`, is_demo:true, image_url:demoOpportunities[i].image_url, action_path:`/Intelligence?demo=${demoOpportunities[i].id}`});
export const demoPulse = [
  event(0,'impact','Food garden completes its first site walk','The sample team checked water access and marked space for a wider path between beds. The next decision is who will coordinate the watering rota.','19:00'),
  event(1,'projects','Creek restoration crew maps survey sites','The sample team identified three bare stretches of creek bank for follow-up and set aside a tributary where land access is still unconfirmed.','18:00'),
  event(2,'opportunities','Solar workshop opens a facilitator session','A sample workshop is looking for volunteers to practice teaching a tabletop solar demonstration.','17:00'),
  event(1,'signals','Rain forecast prompts a survey check','The sample restoration team plans to confirm field conditions before setting a survey date.','16:00'),
  event(0,'new_members','Two volunteers join the garden team','Two fictional volunteers offered help with translation and weekend watering.','15:00'),
];

const match = (value, text) => String(value ?? '').toLowerCase().includes(text.trim().toLowerCase());
const demoInterests = ['gardening','teaching'];
export function filterDemoOpportunities(filters, mode) {
  const { search, category, format, duration, region, skill } = filters;
  return demoOpportunities.filter(row => (mode !== 'forYou' || row.skills_required.some(tag => demoInterests.includes(tag))) &&
    [row.title,row.description,row.entity_name,row.category].some(value => match(value,search)) &&
    (!category || row.category === category) && (!format || row.delivery_mode === format) &&
    (!duration || (duration === 'short' ? row.duration_minutes <= 60 : row.duration_minutes > 60)) &&
    match(row.region,region) && (!skill.trim() || row.skills_required.some(value => match(value,skill))));
}
export { demoInterests };