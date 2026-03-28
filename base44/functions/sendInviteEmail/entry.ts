import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await req.json();
    if (!email) {
      return Response.json({ error: 'No email provided' }, { status: 400 });
    }

    // Use the SDK's inviteUser - works for all members on public apps
    await base44.users.inviteUser(email.trim(), role || 'user');

    return Response.json({ success: true, email: email.trim() });
  } catch (error) {
    return Response.json({ error: error.message, detail: error?.response?.data }, { status: 500 });
  }
});