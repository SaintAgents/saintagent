import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';

export default async function(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'Use POST.' }, { status: 405 });
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(error => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Sign in to search.' }, { status: 401 });
    const input = await req.json().catch(() => null);
    const query = typeof input?.query === 'string' ? input.query.trim() : '';
    const cursor = input?.cursor;
    if (query.length < 2 || query.length > 120 || (cursor !== undefined && (typeof cursor !== 'string' || cursor.length > 2048))) {
      return Response.json({ error: 'Enter a search term from 2 to 120 characters.' }, { status: 400 });
    }
    const term = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = { $regex: term, $options: 'i' };
    const page = await base44.entities.SharedSearchProject.filter({ $or: [{ title: match }, { summary: match }] }, { sort: '-created_date', limit: 20, cursor });
    return Response.json({
      items: page.items.map(row => ({ title: row.title, summary: row.summary, link: `/Projects?id=${encodeURIComponent(row.project_id)}` })),
      nextCursor: page.has_more ? page.next_cursor : null,
    });
  } catch (error) {
    console.error('Shared project search failed', error.status ?? error.name);
    return Response.json({ error: 'SaintAgent project search is temporarily unavailable.' }, { status: 500 });
  }
}