import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';

const fail = (error, status) => Response.json({ error }, { status });
const missing = (e) => e.status === 404 ? null : Promise.reject(e);
const validId = (value) => typeof value === 'string' && /^[\w-]{1,160}$/.test(value);

export default async function(req: Request): Promise<Response> {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    if (!user) return fail('Sign in to continue', 401);
    const form = req.headers.get('content-type')?.includes('multipart/form-data') ? await req.formData().catch(() => null) : null;
    const body = form ? Object.fromEntries(form) : await req.json().catch(() => null);
    const { groupId, action, file, cursor, documentId } = body || {};
    if (!validId(groupId) || !['list', 'upload', 'open'].includes(action)) return fail('Invalid request', 400);
    const admin = client.asServiceRole;
    const group = await admin.entities.VaultGroup.get(groupId).catch(missing);
    if (!group || !(user.role === 'admin' || group.created_by_id === user.id || (user.email && group.member_emails?.includes(user.email)))) return fail('Group not available', 404);
    const docs = admin.entities.VaultGroupDocument;
    if (action === 'upload') {
      if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024 || !file.name.trim() || file.name.length > 255) return fail('Choose a file up to 10 MB with a valid file name.', 400);
      const { file_uri } = await client.integrations.Core.UploadPrivateFile({ file });
      if (!file_uri) return fail('Upload failed', 502);
      await docs.create({ group_id: group.id, name: file.name, file_uri });
      return Response.json({ ok: true });
    }
    if (action === 'open') {
      if (!validId(documentId)) return fail('Invalid document', 400);
      const doc = await docs.get(documentId).catch(missing);
      if (!doc || doc.group_id !== group.id) return fail('Document not available', 404);
      const { signed_url } = await admin.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri, expires_in: 60 });
      if (!signed_url) return fail('Could not open document', 502);
      return Response.json({ url: signed_url });
    }
    const page = await docs.filter({ group_id: group.id }, { sort: '-created_date', limit: 24, cursor: typeof cursor === 'string' ? cursor : undefined });
    return Response.json({ items: page.items.map(({ id, name }) => ({ id, name })), next_cursor: page.next_cursor });
  } catch (error) {
    console.error('Group vault request failed', error?.status || 'unexpected error');
    return fail('Could not access group documents', 500);
  }
}