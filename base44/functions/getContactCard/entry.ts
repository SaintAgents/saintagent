import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const validId = (value, kind) => typeof value === 'string' && (/^[0-9a-f]{24}$/i.test(value) || (kind === 'contact' && /^\d{1,16}$/.test(value)));
const webUrl = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
};
const first = async (entity, query) => (await entity.filter(query, '-updated_date', 1))[0];
const missing = () => Response.json({ error: 'Public profile not found' }, { status: 404 });
const visible = profile => profile && (!profile.profile_visibility || profile.profile_visibility === 'public');
const treeData = tree => ({
  headline: tree.headline, tagline: tree.tagline, bio: tree.bio, theme: tree.theme,
  avatar: webUrl(tree.avatar), banner: webUrl(tree.banner), showcase_title: tree.showcase_title,
  showcase: (tree.showcase || []).slice(0, 4).map(webUrl).filter(Boolean),
  links: (tree.links || []).slice(0, 30).map(({ title, url, description, image }) => ({ title, url: webUrl(url), description, image: webUrl(image) })).filter(link => link.url),
});

export default async function(req) {
  try {
    const { kind = 'contact', id: key, sa_number } = (await req.json().catch(() => ({}))) || {};
    const id = key ?? sa_number;
    if (!validId(id, kind) || !['contact', 'tree', 'business'].includes(kind)) return Response.json({ error: 'Invalid public profile identifier' }, { status: 400 });
    // Anonymous by design: return only public presentation fields, never raw entities.
    const { entities } = createClientFromRequest(req).asServiceRole;
    if (kind === 'business') {
      const business = await first(entities.BusinessEntity5D, { id });
      if (!business || !['active', 'featured'].includes(business.status) || !business.created_by_id) return missing();
      const tree = await first(entities.LinkTree, { business_id: id, created_by_id: business.created_by_id });
      return tree?.published === true ? Response.json(treeData(tree)) : missing();
    }
    const memberNumber = kind === 'contact' && /^\d{1,16}$/.test(id);
    let profile = await first(entities.UserProfile, memberNumber ? { sa_number: id } : { id });
    if (!profile && !memberNumber) {
      const member = await entities.User.get(id).catch(error => {
        if ((error.status || error.response?.status) === 404) return null;
        throw error;
      });
      if (member?.email) profile = await first(entities.UserProfile, { user_id: member.email });
    }
    if (!visible(profile)) return missing();
    const tree = profile.user_id && await first(entities.LinkTree, { business_id: '', created_by: profile.user_id });
    const contactId = profile.sa_number || profile.id;
    if (kind === 'tree') return tree?.published === true ? Response.json({ ...treeData(tree), contact_id: contactId, tree_id: profile.id }) : missing();
    const art = profile.user_id && await first(entities.ProfileDigitalArt, { profile_id: profile.id, created_by: profile.user_id });
    const website = profile.social_links?.website?.trim();
    const phone = tree?.share_phone === true && /^[+\d(). -]{5,40}$/.test(tree.contact_phone || '') ? tree.contact_phone : '';
    return Response.json({
      display_name: profile.display_name, handle: profile.handle, bio: profile.bio,
      location: tree?.contact_address?.trim() || profile.location || profile.region, avatar_url: webUrl(profile.avatar_url), trust_score: profile.trust_score,
      contact_order: Array.isArray(tree?.contact_order) ? tree.contact_order.filter(key => ['title', 'organization', 'location', 'email', 'phone', 'website'].includes(key)).slice(0, 6) : undefined,
      sa_number: profile.sa_number, contact_id: contactId, tree_id: tree?.published === true ? profile.id : '',
      digital_art_url: webUrl(art?.digital_art_url),
      website: website && webUrl(/^[\w-]+(?:\.[\w-]+)+(?:[/:?#]|$)/.test(website) ? `https://${website}` : website),
      title: tree?.contact_title, organization: tree?.contact_org,
      email: tree?.share_email === true ? tree.created_by : '', phone,
    });
  } catch {
    return Response.json({ error: 'Public profile could not be loaded' }, { status: 500 });
  }
}