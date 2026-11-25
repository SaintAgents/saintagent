// A starter browse hierarchy, not a statement of data coverage.
export const pulseRegions = [
  { name:'North America', places:[['United States','California'],['Canada','British Columbia']] },
  { name:'Europe', places:[['Germany','Berlin'],['France','Île-de-France']] },
  { name:'Asia-Pacific', places:[['Japan','Tokyo'],['Australia','New South Wales']] },
  { name:'Africa', places:[['Kenya','Nairobi County'],['Ghana','Greater Accra']] },
  { name:'South America', places:[['Brazil','São Paulo'],['Colombia','Bogotá']] },
  { name:'Middle East', places:[['Jordan','Amman Governorate'],['Oman','Muscat Governorate']] },
];
export const pulseScope = ({region, country, local}) => local || country || region || 'Global';
export const pulseLevels = ['Global Pulse','Regional Intelligence','Country Intelligence','Local Developments','Actionable Opportunities'];
export function scopeRoute(domain, demo, scope = {}) {
  const params = new URLSearchParams({pulse:domain});
  if (demo) params.set('impactDemo','1');
  for (const key of ['region','country','local']) if (scope[key]) params.set(`pulse${key}`, scope[key]);
  return `/GlobalImpactDashboard?${params}#world-pulse`;
}
export function readScope(params) {
  const region = pulseRegions.find(row => row.name === params.get('pulseregion'));
  const place = region?.places.find(([country]) => country === params.get('pulsecountry'));
  return {region:region?.name || '',country:place?.[0] || '',local:place?.[1] === params.get('pulselocal') ? place[1] : ''};
}