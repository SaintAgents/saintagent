import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import LinkTreeContent from '@/components/publicprofile/LinkTreeContent';
import PublicProfileState from '@/components/publicprofile/PublicProfileState';
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { contactPath, shareUrl, treePath } from '@/components/publicprofile/publicLinks';

export default function PublicLinkTree() {
  const { userId } = useParams();
  const [params] = useSearchParams();
  const business = !userId && params.get('p');
  const legacy = !userId && !business && params.get('u');
  const id = userId || business;
  const query = useQuery({ queryKey: ['public-tree', id, !!business], enabled: !!id, retry: false,
    queryFn: async () => (await base44.functions.invoke('getContactCard', { id, kind: business ? 'business' : 'tree' })).data,
  });
  if (legacy && /^[a-zA-Z0-9_-]{1,80}$/.test(legacy)) return <Navigate replace to={treePath(legacy)} />;
  if (!query.data) return <PublicProfileState label="LinkTree" loading={!!id && query.isPending} missing={!id || [400, 404].includes(query.error?.status || query.error?.response?.status)} />;
  const tree = query.data;
  if (!business && tree.tree_id && id !== tree.tree_id) return <Navigate replace to={treePath(tree.tree_id)} />;
  return <main className="min-h-screen bg-background px-4 py-10"><div className="mx-auto max-w-lg"><LinkTreeContent tree={tree}>
    {tree.contact_id && <Link className="block text-center font-medium underline" to={contactPath(tree.contact_id)}>Digital Contact Card</Link>}
    <SharePublicProfile url={shareUrl(treePath(id, !!business))} label="LinkTree" />
  </LinkTreeContent></div></main>;
}