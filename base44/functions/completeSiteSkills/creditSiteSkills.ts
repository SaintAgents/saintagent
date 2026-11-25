import creditGGGReward from '../../shared/creditGGGReward.ts';

export default function creditSiteSkills(entities, email) {
  const type = 'site_skills_quest';
  return creditGGGReward(entities, email, { amount: 0.77, type, memo: 'Completed all five Site Skills lessons',
    sourceId: type, eventId: `earn_${type}_${email}` });
}