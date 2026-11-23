import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import LinkTreeForm from '@/components/publicprofile/LinkTreeForm';

export default function LinkTreeEditor() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const businessId = params.get('p') || '';
  const key = ['linktree-editor', user?.id, businessId];
  const client = useQueryClient();
  const { data, isPending, isError } = useQuery({ queryKey: key, enabled: !!user?.id, retry: false, queryFn: async () => {
    const [profiles, records] = await Promise.all([
      businessId ? base44.entities.BusinessEntity5D.filter({ id: businessId, created_by_id: user.id }, '-updated_date', 1) : base44.entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1),
      base44.entities.LinkTree.filter({ created_by_id: user.id, business_id: businessId }, '-updated_date', 1),
    ]);
    return { profile: profiles[0], saved: records[0] };
  }});
  return <section className="mx-auto max-w-6xl space-y-4 px-4 pb-20 pt-6 text-foreground"><h1 className="text-2xl font-bold">{businessId ? 'Business LinkTree' : 'LinkTree & Contact Card'}</h1>
    {isPending ? <p role="status">Loading editor…</p> : isError ? <p role="alert">Could not load the editor. Try refreshing the page.</p> : !data.profile ? <p>{businessId ? 'This business is unavailable or you are not its owner.' : 'Set up your profile before editing LinkTree.'}</p> : <>
      {businessId && !['active', 'featured'].includes(data.profile.status) && <p>Visitors can open this LinkTree once the business profile is active.</p>}
      {!businessId && data.profile.profile_visibility && data.profile.profile_visibility !== 'public' && <p>Your profile privacy settings currently prevent signed-out visitors from opening your pages.</p>}
      <LinkTreeForm key={`${user.id}:${businessId}`} profile={data.profile} saved={data.saved} business={!!businessId} user={user} onSaved={saved => {
        client.setQueryData(key, old => ({ ...old, saved }));
        client.removeQueries({ queryKey: ['public-contact'], type: 'inactive' });
        client.invalidateQueries({ queryKey: ['public-contact'] });
        client.invalidateQueries({ queryKey: ['public-tree', data.profile.id, !!businessId] });
      }} />
    </>}
  </section>;
}