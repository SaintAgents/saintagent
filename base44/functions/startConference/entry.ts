import { createClientFromRequest } from 'npm:@base44/sdk@0.8.62';

export default async function(req) {
  try {
    const api = createClientFromRequest(req);
    const user = await api.auth.me().catch(error => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Sign in first.' }, { status: 401 });
    const { title, email } = (await req.json().catch(() => null)) || {};
    if (typeof title !== 'string' || !title.trim() || title.length > 100 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return Response.json({ error: 'Enter a call name and member email.' }, { status: 400 });
    const [recipient] = await api.asServiceRole.entities.User.filter({ email: email.trim().toLowerCase() }, '-created_date', 1);
    if (!recipient || recipient.id === user.id) return Response.json({ error: 'Enter the email of another registered member.' }, { status: 400 });
    const code = crypto.randomUUID();
    await api.asServiceRole.actors.ConferenceSignal(code).initialize({ code, title: title.trim(), host: { id: user.id, name: user.full_name || 'Host' }, recipient: { id: recipient.id, email: recipient.email, name: recipient.full_name || 'Member' } });
    return Response.json({ code });
  } catch (error) {
    console.error('Conference creation failed', error.status || error.name);
    return Response.json({ error: 'Could not start the call. Please try again.' }, { status: 500 });
  }
}