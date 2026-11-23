import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { shareUrl, treePath, webUrl } from '@/components/publicprofile/publicLinks';
import { linkTreeEditorQuery } from '@/components/publicprofile/linkTreeEditorQuery';

export default function DockLinkTree({ user, visible }) {
  const query = useQuery({ ...linkTreeEditorQuery(user), enabled: visible && !!user?.id });
  if (!visible) return null;
  if (query.isPending) return <p role="status">Loading LinkTree…</p>;
  if (query.isError) return <p role="alert">Could not load your LinkTree. <Button variant="link" size="sm" onClick={() => query.refetch()}>Retry</Button></p>;
  const { profile, saved } = query.data;
  if (!profile) return <Link className="underline" to="/Profile">Set up your profile first</Link>;
  const isPublic = !profile.profile_visibility || profile.profile_visibility === 'public';
  const url = isPublic && saved?.published ? shareUrl(treePath(profile.id)) : null;
  return <div className="dock-links space-y-2">
    {webUrl(saved?.banner) && <img src={webUrl(saved.banner)} alt="LinkTree banner" className="aspect-[3/1] w-full rounded object-cover" />}
    <p className="break-words font-semibold">{saved?.headline || profile.display_name || 'Your LinkTree'}</p>
    {saved && <p>{saved.links?.length || 0} {saved.links?.length === 1 ? 'link' : 'links'}</p>}
    {url ? <><a href={url} target="_blank" rel="noreferrer">Open public LinkTree</a><SharePublicProfile key={url} url={url} label="LinkTree" allowShare /></> :
      <p>{!isPublic ? 'Your profile is private, so visitors can’t open your LinkTree.' : 'Publish your LinkTree to get a share link and QR code.'}</p>}
    <Link to="/LinkTreeEditor">{saved ? 'Edit LinkTree' : 'Set up LinkTree'}</Link>
  </div>;
}