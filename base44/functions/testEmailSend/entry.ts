import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to } = await req.json();
    const targetEmail = to || user.email;

    const result = await base44.asServiceRole.integrations.Core.SendEmail({
      to: targetEmail,
      subject: 'SaintAgent Email Test',
      body: '<div style="font-family:sans-serif;padding:20px;"><h2>Test Email</h2><p>This is a test email from SaintAgent to verify delivery works.</p></div>',
      from_name: 'SaintAgent Test'
    });

    return Response.json({ success: true, result, sent_to: targetEmail });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});