import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const demoEmail = /^(?:demo(?:user)?[\d._+-]*@)|@demo\./i;

export default async function(req: Request): Promise<Response> {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    if (!user) return Response.json({ error: 'Sign-in required' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const db = api.asServiceRole.entities;
    const size = 100;
    let total = 0;
    for (let skip = 0; ; skip += size) {
      const accounts = await db.User.list('id', size, skip, ['email', 'disabled', 'is_verified', 'is_service']);
      total += accounts.filter(account => account.email && !demoEmail.test(account.email) &&
        account.is_verified === true && !account.is_service && !account.disabled).length;
      if (accounts.length < size) break;
    }
    const [existing] = await db.FoundingMemberTotal.list('-updated_date', 1);
    if (!existing) await db.FoundingMemberTotal.create({ total });
    else if (existing.total !== total) await db.FoundingMemberTotal.update(existing.id, { total });
    return Response.json({ total });
  } catch (error) {
    console.error('Founding member count refresh failed', error?.status ?? error?.name);
    return Response.json({ error: 'Could not refresh member count' }, { status: 500 });
  }
}