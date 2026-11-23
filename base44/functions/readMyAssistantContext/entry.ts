import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(e => {
      if ((e.status ?? e.response?.status) === 401) return null;
      throw e;
    });
    if (!user?.id || !user.email) return Response.json({ error: 'Sign in required' }, { status: 401 });
    const body = await req.json().catch(() => null);
    const area = body?.area;
    const creator = { created_by_id: user.id };
    const page = { sort: '-updated_date', limit: 15 };
    if (area === 'memory' || area === 'objective') {
      const result = await base44.entities.PersonalAssistantItem.filter({ ...creator, kind: area, status: 'active' }, page);
      return Response.json({ area, more: result.has_more, items: result.items.map(({ text }) => ({ text })) });
    }
    if (area === 'project') {
      const result = await base44.entities.Project.filter({ ...creator, owner_id: { $in: [user.id, user.email] } }, page);
      return Response.json({ area, more: result.has_more, items: result.items.map(({ title, status, project_status, progress_percent, end_date }) => ({ title, status, project_status, progress_percent, end_date })) });
    }
    if (area === 'mission') {
      const result = await base44.entities.Mission.filter({ ...creator, creator_id: { $in: [user.id, user.email] } }, page);
      return Response.json({ area, more: result.has_more, items: result.items.map(({ title, objective, status, end_time }) => ({ title, objective, status, end_time })) });
    }
    return Response.json({ error: 'Choose memory, objective, project or mission' }, { status: 400 });
  } catch (error) {
    console.error('Assistant context unavailable', error.status ?? error.response?.status ?? 'unknown');
    return Response.json({ error: 'Could not load assistant context' }, { status: 500 });
  }
}