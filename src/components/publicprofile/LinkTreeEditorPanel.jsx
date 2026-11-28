import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { linkTreeEditorQuery } from '@/components/publicprofile/linkTreeEditorQuery';
import { useAuth } from '@/lib/AuthContext';
import LinkTreeForm from '@/components/publicprofile/LinkTreeForm';

export default function LinkTreeEditorPanel({ businessId = '', embedded = false }) {
  const { user } = useAuth();
  const options = linkTreeEditorQuery(user, businessId);
  const client = useQueryClient();
  const { data, isPending, isError } = useQuery(options);
  const heading = businessId ? 'Business LinkTree' : 'LinkTree & Contact Card';
  const { hash } = useLocation();
  const profileId = data?.profile?.id;
  useEffect(() => {
    if (!profileId || embedded || businessId || hash !== '#contact-card-settings') return;
    const fieldset = document.getElementById('contact-card-settings');
    fieldset?.scrollIntoView({ block: 'start' });
    fieldset?.focus({ preventScroll: true });
  }, [profileId, embedded, businessId, hash]);
  return <section data-dark-contrast className={embedded ? 'space-y-4 text-foreground' : 'mx-auto max-w-6xl space-y-4 px-4 pb-20 pt-6 text-foreground'}>
    {embedded ? <h2 className="text-2xl font-bold">{heading}</h2> : <h1 className="text-2xl font-bold">{heading}</h1>}
    {isPending ? <p role="status">Loading editor…</p> : isError ? <p role="alert">Could not load the editor. Try refreshing the page.</p> : !data.profile ? <p>{businessId ? 'This business is unavailable or you are not its owner.' : 'Set up your profile before editing LinkTree.'}</p> : <>
      {businessId && !['active', 'featured'].includes(data.profile.status) && <p>Visitors can open this LinkTree once the business profile is active.</p>}
      {!businessId && data.profile.profile_visibility && data.profile.profile_visibility !== 'public' && <p>Your profile privacy settings currently prevent signed-out visitors from opening your pages.</p>}
      <LinkTreeForm key={`${user.id}:${businessId}`} profile={data.profile} saved={data.saved} business={!!businessId} user={user} onSaved={saved => {
        client.setQueryData(options.queryKey, old => ({ ...old, saved }));
        client.removeQueries({ queryKey: ['public-contact'], type: 'inactive' });
        client.invalidateQueries({ queryKey: ['public-contact'] });
        client.invalidateQueries({ queryKey: ['public-tree', data.profile.id, !!businessId] });
      }} />
    </>}
  </section>;
}