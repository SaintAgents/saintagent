import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, session_token, device_info } = body;

    if (action === 'create') {
      // Create a new QR login session (no auth required - this is the requesting device)
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await base44.asServiceRole.entities.QRLoginSession.create({
        session_token: token,
        status: 'pending',
        device_info: device_info || 'Unknown device',
        expires_at: expiresAt.toISOString()
      });

      return Response.json({ 
        success: true, 
        session_token: token,
        expires_at: expiresAt.toISOString()
      });
    }

    if (action === 'check') {
      // Check status of a session (no auth required - polling from requesting device)
      const sessions = await base44.asServiceRole.entities.QRLoginSession.filter({ 
        session_token 
      });
      const session = sessions?.[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      // Check if expired
      if (new Date(session.expires_at) < new Date()) {
        if (session.status === 'pending') {
          await base44.asServiceRole.entities.QRLoginSession.update(session.id, { status: 'expired' });
        }
        return Response.json({ status: 'expired' });
      }

      return Response.json({ 
        status: session.status,
        user_id: session.status === 'approved' ? session.user_id : null
      });
    }

    if (action === 'approve') {
      // Approve login from mobile device (requires auth)
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sessions = await base44.asServiceRole.entities.QRLoginSession.filter({ 
        session_token 
      });
      const session = sessions?.[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.status !== 'pending' && session.status !== 'scanned') {
        return Response.json({ error: 'Session already processed' }, { status: 400 });
      }

      if (new Date(session.expires_at) < new Date()) {
        return Response.json({ error: 'Session expired' }, { status: 400 });
      }

      await base44.asServiceRole.entities.QRLoginSession.update(session.id, {
        status: 'approved',
        user_id: user.email,
        approved_at: new Date().toISOString()
      });

      return Response.json({ success: true, message: 'Login approved' });
    }

    if (action === 'reject') {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sessions = await base44.asServiceRole.entities.QRLoginSession.filter({ 
        session_token 
      });
      const session = sessions?.[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      await base44.asServiceRole.entities.QRLoginSession.update(session.id, {
        status: 'rejected'
      });

      return Response.json({ success: true, message: 'Login rejected' });
    }

    if (action === 'scan') {
      // Mark session as scanned (from mobile app)
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sessions = await base44.asServiceRole.entities.QRLoginSession.filter({ 
        session_token 
      });
      const session = sessions?.[0];

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.status !== 'pending') {
        return Response.json({ error: 'Session already processed' }, { status: 400 });
      }

      await base44.asServiceRole.entities.QRLoginSession.update(session.id, {
        status: 'scanned'
      });

      return Response.json({ 
        success: true, 
        device_info: session.device_info,
        message: 'Confirm login on this device?'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});