import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';

export default async function(req: Request): Promise<Response> {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me().catch(e => e.status === 401 || e.response?.status === 401 ? null : Promise.reject(e));
    if (!user) return Response.json({error:'Sign in first.'},{status:401});
    const { id, revision, approve } = (await req.json().catch(() => null)) || {};
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id) || typeof revision !== 'string' || approve !== true) return Response.json({error:'Review and explicitly approve the Mission draft first.'},{status:400});
    const scope = {id,created_by_id:user.id};
    const [plan] = await api.entities.GuideActionPlan.filter(scope,'-updated_date',1);
    if (!plan) return Response.json({error:'Private plan not found.'},{status:404});
    if (plan.mission_draft) return Response.json({ draft:plan.mission_draft });
    if (plan.updated_date !== revision || plan.direction !== 'prepare_mission' || !plan.milestone?.trim()) return Response.json({error:'Refresh your plan and save a measurable Mission milestone before approving.'},{status:409});
    const draft = { title:plan.title, objective:plan.objective, milestone:plan.milestone, saved_at:new Date().toISOString(), description:[['First action',plan.first_action],['Timing',plan.schedule],['Dependencies',plan.dependencies],['Resources',plan.resources],['Proposed roles',plan.collaboration]].filter(([,value]) => value?.trim()).map(([label,value]) => `${label}: ${value}`).join('\n\n') };
    // One snapshot lives on the owner’s plan: a repeated or concurrent approval cannot create a second draft.
    const store = api.asServiceRole.entities.GuideActionPlan;
    await store.updateMany({...scope,updated_date:revision,mission_draft:null},{$set:{mission_draft:draft}});
    const [confirmed] = await store.filter(scope,'-updated_date',1);
    if (!confirmed?.mission_draft) return Response.json({error:'The plan changed. Open it again before approving.'},{status:409});
    return Response.json({draft:confirmed.mission_draft});
  } catch (error) {
    console.error('Guide Mission draft failed',error.status || error.name);
    return Response.json({error:'Could not confirm the Mission draft. It is safe to retry.'},{status:500});
  }
}