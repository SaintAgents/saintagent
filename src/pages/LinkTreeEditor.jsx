import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { linkTreeEditorQuery } from '@/components/publicprofile/linkTreeEditorQuery';
import { useAuth } from '@/lib/AuthContext';
import LinkTreeForm from '@/components/publicprofile/LinkTreeForm';

export default function LinkTreeEditor() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const businessId = params.get('p') || '';
  const options = linkTreeEditorQuery(user, businessId);
  const key = options.queryKey;
  const client = useQueryClient();
  const { data, isPending, isError } = useQuery(options);
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