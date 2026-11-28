import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import LinkTreeContent from '@/components/publicprofile/LinkTreeContent';
import LinkTreeFields from '@/components/publicprofile/LinkTreeFields';
import LinkTreeLinksEditor from '@/components/publicprofile/LinkTreeLinksEditor';
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { shareUrl, treePath, webUrl } from '@/components/publicprofile/publicLinks';

const linkFromProfile = ([key, value]) => ({ id: crypto.randomUUID(), title: key === 'website' ? 'Website' : key[0].toUpperCase() + key.slice(1), url: webUrl(value) || (/^[\w-]+\.[\w.-]+/.test(value) ? webUrl(`https://${value}`) : '') });
export default function LinkTreeForm({ saved, profile, business, user, onSaved }) {
  const [draft, setDraft] = useState(() => ({ theme: 'amber', published: false, showcase: [], ...saved, links: (saved?.links || []).map(link => ({ ...link, id: crypto.randomUUID() })) }));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const patch = changes => { setDirty(true); setStatus(''); setDraft(old => ({ ...old, ...(typeof changes === 'function' ? changes(old) : changes) })); };
  const path = treePath(profile.id, business);
  useEffect(() => {
    if (!dirty) return;
    const unload = event => { event.preventDefault(); event.returnValue = ''; };
    const leave = event => { const link = event.target.closest?.('a[href]'); if (link && link.target !== '_blank' && !event.ctrlKey && !event.metaKey && !event.shiftKey && new URL(link.href).origin === window.location.origin && link.href !== window.location.href && !window.confirm('Leave without saving your LinkTree changes?')) { event.preventDefault(); event.stopPropagation(); } };
    window.addEventListener('beforeunload', unload); document.addEventListener('click', leave, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', leave, true); };
  }, [dirty]);
  function importProfile() {
    const socials = Object.fromEntries(Object.entries(profile.social_links || {}).filter(([key, value]) => typeof value === 'string' && value && !key.endsWith('_label')));
    if (profile.website) socials.website = profile.website;
    const links = Object.entries(socials).map(linkFromProfile).filter(link => link.url);
    patch(old => ({ headline: (profile.display_name || profile.name || '').slice(0, 120), tagline: (profile.tagline || '').slice(0, 160), bio: (profile.bio || profile.description || '').slice(0, 1200), avatar: webUrl(profile.avatar_url || profile.logo_url), banner: webUrl(profile.hero_image_url || profile.cover_image_url), links: [...old.links, ...links.filter(link => !old.links.some(item => item.url === link.url))].slice(0, 30) }));
  }
  async function save(event) {
    event.preventDefault();
    if (draft.links.some(link => !link.title.trim() || !webUrl(link.url) || (link.image && !webUrl(link.image))) || [draft.avatar, draft.banner, ...draft.showcase].some(url => url && !webUrl(url))) { setStatus('Use full http or https URLs and give each link a title.'); return; }
    if (!business && draft.share_phone && !/^[+\d(). -]{5,40}$/.test(draft.contact_phone || '')) { setStatus('Enter a valid phone number to share it.'); return; }
    const { id, created_by, created_by_id, created_date, updated_date, is_sample, business_id, ...fields } = draft;
    const data = { ...fields, business_id: business ? profile.id : '', showcase: (fields.showcase || []).filter(Boolean), links: fields.links.map(({ id: linkId, ...link }) => link) };
    setBusy(true); setStatus('');
    try { const item = id ? await base44.entities.LinkTree.update(id, data) : await base44.entities.LinkTree.create(data); setDraft(current => ({ ...current, id: item.id })); onSaved(item); setDirty(false); setStatus('Changes saved.'); }
    catch { setStatus('Could not save your changes. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="grid items-start gap-6 lg:grid-cols-2"><form onSubmit={save} className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground"><fieldset disabled={busy} className="space-y-4">
    <Button type="button" variant="outline" onClick={importProfile}>Import {business ? 'business profile' : 'my profile'}</Button>
    <LinkTreeFields {...{ draft, patch, business, profile }} email={user.email} />
    <LinkTreeLinksEditor links={draft.links} onChange={change => patch(old => ({ links: change(old.links) }))} />
    {saved?.published && <a href={shareUrl(path)} target="_blank" rel="noreferrer" className="mr-3 underline">Open public LinkTree</a>}
    <Button type="submit" disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
    {status && <p role="status">{status}</p>}
  </fieldset></form><section className="space-y-3"><h2 className="font-semibold">Live preview</h2><LinkTreeContent tree={draft} />{saved?.published && <SharePublicProfile url={shareUrl(path)} label="LinkTree" />}</section></div>;
}