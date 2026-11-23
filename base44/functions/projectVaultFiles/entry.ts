import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';

export default async function(req: Request): Promise<Response> {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    if (!user) return Response.json({ error:'Sign in to continue' },{status:401});
    const { projectId, action, cursor, file } = await req.json().catch(()=>({}));
    if (typeof projectId !== 'string' || !projectId || projectId.length > 160 || !['list','attach'].includes(action)) return Response.json({error:'Invalid request'},{status:400});
    const project = await client.entities.Project.get(projectId).catch(e=>e.status===404 ? null : Promise.reject(e));
    if (!project) return Response.json({error:'Project not found'},{status:404});
    // Require a recorded submitter. Editable project owner/claim fields cannot authorize private files.
    const authorized = project.created_by_id && (user.role === 'admin' || project.created_by_id === user.id);
    if (!authorized) return Response.json({error:'Not authorized'},{status:403});
    const attachments = client.asServiceRole.entities.ProjectAttachment;
    if (action === 'attach') {
      if (typeof file?.uri !== 'string' || !file.uri.trim() || /^https?:\/\//i.test(file.uri) || file.uri.length > 4000 || typeof file?.name !== 'string' || !file.name.trim() || file.name.length > 300) return Response.json({error:'A private uploaded file is required'},{status:400});
      await attachments.create({project_id:project.id, file_uri:file.uri, file_name:file.name, uploaded_by_id:user.id, uploaded_by_name:user.full_name || 'Member'});
      return Response.json({ok:true});
    }
    const page = await attachments.filter({project_id:project.id, $or:[{task_id:{$exists:false}},{task_id:null},{task_id:''}]}, {sort:'-created_date',limit:24,cursor:typeof cursor === 'string' ? cursor : undefined});
    return Response.json({items:page.items.map(row=>({id:row.id,name:row.file_name || row.filename || 'Attachment',uri:row.file_uri,url:row.file_url})),next_cursor:page.next_cursor});
  } catch (error) {
    console.error('Project vault files failed', error?.message);
    return Response.json({error:'Could not access project files'},{status:500});
  }
}