import { createClientFromRequest } from 'npm:@base44/sdk@0.8.63';

const documents = /^(pdf|txt|rtf|csv|docx?|xlsx?|pptx?|odt|ods|odp)$/;
const audio = {mp3:'audio/mpeg', wav:'audio/wav', m4a:'audio/mp4', aac:'audio/aac', ogg:'audio/ogg', flac:'audio/flac', opus:'audio/ogg'};
const video = {mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime', m4v:'video/mp4'};
const validId = (value) => typeof value === 'string' && /^[\w-]{1,160}$/.test(value);
const fail = (error, status) => Response.json({ error }, { status });

export default async function(req: Request): Promise<Response> {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me().catch((e) => e.status === 401 ? null : Promise.reject(e));
    if (!user?.email) return fail('Sign in to continue.', 401);
    const multipart = req.headers.get('content-type')?.startsWith('multipart/form-data');
    const form = multipart ? await req.formData().catch(() => null) : null;
    const data = multipart ? Object.fromEntries(form || []) : await req.json().catch(() => ({})) || {};
    const { action, postId, index } = data;
    if (!['publish', 'list', 'open'].includes(action) || (action === 'publish' ? !form || !validId(data.circleId) : multipart || !validId(postId))) return fail('Invalid attachment request.', 400);
    const post = action === 'publish' ? null : await client.entities.GroupPost.get(postId).catch((e) => e.status === 404 ? null : Promise.reject(e));
    const circleId = post?.circle_id || (action === 'publish' ? data.circleId : null);
    if (!circleId) return fail('Post not found.', 404);
    const circle = await client.entities.Circle.get(circleId).catch((e) => e.status === 404 ? null : Promise.reject(e));
    if (!circle || (circle.owner_id !== user.email && !circle.member_ids?.includes(user.email))) return fail('Only circle members can access forum attachments.', 403);
    const records = client.asServiceRole.entities.CircleForumAttachmentSet;

    if (action === 'publish') {
      const { title, content, post_type } = data;
      const files = [...form.values()].filter((item) => item instanceof File);
      if (typeof title !== 'string' || typeof content !== 'string' || !['discussion','question','announcement','resource','poll'].includes(post_type) || !files.length || files.length > 5 || files.reduce((size, file) => size + file.size, 0) > 25 * 1024 * 1024) return fail('Choose up to five files totaling no more than 25 MB.', 400);
      const classified = files.map((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!file.size || !file.name.trim() || file.name.length > 255) return null;
        if (Object.hasOwn(audio, ext)) return { file, kind: 'audio', mime: audio[ext] };
        if (Object.hasOwn(video, ext)) return { file, kind: ext === 'webm' && file.type === 'audio/webm' ? 'audio' : 'video', mime: ext === 'webm' && file.type === 'audio/webm' ? 'audio/webm' : video[ext] };
        if (documents.test(ext)) return { file, kind: 'document', mime: 'application/octet-stream' };
        return null;
      });
      if (classified.some((item) => !item)) return fail('Choose supported document, video, or audio files.', 400);
      const uploaded = await Promise.all(classified.map(async ({ file, kind, mime }) => {
        const { file_uri } = await client.integrations.Core.UploadPrivateFile({ file: new File([file], file.name, { type: mime }) });
        if (!file_uri) throw new Error('Upload returned no file reference');
        return { name: file.name, uri: file_uri, kind };
      }));
      const created = await client.entities.GroupPost.create({ circle_id: circleId, author_id: user.email, author_name: user.full_name || 'Member', title: title.trim(), content: content.trim(), post_type });
      try {
        await records.create({ circle_id: circleId, post_id: created.id, files: uploaded });
      } catch (error) {
        await client.entities.GroupPost.delete(created.id);
        throw error;
      }
      return Response.json({ id: created.id });
    }

    const { items } = await records.filter({ post_id: post.id, circle_id: circleId }, { limit: 1 });
    const files = items[0]?.files || [];
    if (action === 'list') return Response.json({ files: files.map(({ name, kind }) => ({ name, kind })) });
    const file = Number.isInteger(index) && files[index];
    if (!file) return fail('Attachment not found.', 404);
    const { signed_url } = await client.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: file.uri });
    return Response.json({ url: signed_url });
  } catch (error) {
    console.error('Circle forum attachment request failed', error?.status || error?.name);
    return fail('Couldn’t complete the attachment request. Please try again.', 500);
  }
}