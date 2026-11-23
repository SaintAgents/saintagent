import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Globe, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildVCard } from '@/components/profile/ProfileQRCode';
import PublicProfileState from '@/components/publicprofile/PublicProfileState';
import SharePublicProfile from '@/components/publicprofile/SharePublicProfile';
import { Button } from '@/components/ui/button';
import { contactPath, contactShareUrl, downloadBlob, treePath } from '@/components/publicprofile/publicLinks';

export default function VCardLanding() {
  const { saNumber } = useParams();
  const legacy = useLocation().pathname.toLowerCase().startsWith('/vcard/');
  const query = useQuery({ queryKey: ['public-contact', saNumber], enabled: !legacy, retry: false,
    queryFn: async () => (await base44.functions.invoke('getContactCard', { id: saNumber })).data,
  });
  if (legacy) return <Navigate replace to={contactPath(saNumber)} />;
  const profile = query.data;
  if (!profile) return <PublicProfileState label="Contact card" loading={query.isPending} missing={[400, 404].includes(query.error?.status || query.error?.response?.status)} />;
  if (profile.contact_id && saNumber !== profile.contact_id) return <Navigate replace to={contactPath(profile.contact_id)} />;
  const name = profile.display_name || 'SaintAgent member';
  const contactUrl = contactShareUrl(profile.contact_id);
  const contact = [
    { Icon: Mail, text: profile.email, href: profile.email && `mailto:${encodeURIComponent(profile.email).replace('%40', '@')}` },
    { Icon: Phone, text: profile.phone, href: profile.phone && `tel:${profile.phone.replace(/[^+\d]/g, '')}` },
    { Icon: MapPin, text: profile.location },
    { Icon: Globe, text: profile.website, href: profile.website, external: true },
  ];
  const save = () => downloadBlob(new Blob([buildVCard(profile)], { type: 'text/vcard;charset=utf-8' }), `${name.replace(/[^\p{L}\p{N}]+/gu, '_')}.vcf`);
  return <main className="min-h-screen bg-background px-4 py-10 text-foreground"><article className="mx-auto max-w-sm space-y-5 rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
    <header className="space-y-2 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">SaintAgent · Digital Contact Card</p>
      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="mx-auto size-24 rounded-full object-cover" /> : <div aria-hidden="true" className="mx-auto grid size-24 place-items-center rounded-full bg-muted text-3xl font-bold">{name[0]}</div>}
      {profile.digital_art_url && <img src={profile.digital_art_url} alt="Digital contact card emblem" className="mx-auto aspect-square w-36 rounded-lg object-cover" />}
      <h1 className="break-words text-2xl font-bold">{name}</h1>
      {(profile.title || profile.organization) && <p>{[profile.title, profile.organization].filter(Boolean).join(' · ')}</p>}
      <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
        {profile.sa_number && <span>SA#{profile.sa_number}</span>}
        {profile.trust_score != null && <span className="inline-flex items-center gap-1"><ShieldCheck size={15} /> {profile.trust_score}/100 Trust</span>}
      </div>
    </header>
    <ul className="space-y-2">{contact.filter(item => item.text).map(({ Icon, text, href, external }) => <li key={text} className="flex items-center gap-2 break-all text-sm"><Icon size={16} className="shrink-0" />{href ? <a className="underline" href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{text}</a> : text}</li>)}</ul>
    {profile.bio && <p className="whitespace-pre-line break-words text-sm text-muted-foreground">{profile.bio}</p>}
    <Button className="w-full" onClick={save}><Download />Save to Contacts</Button>
    {profile.tree_id && <Link to={treePath(profile.tree_id)} className="block text-center underline">View LinkTree</Link>}
    <SharePublicProfile key={contactUrl} url={contactUrl} label="Digital Contact Card" initialOpen />
  </article></main>;
}