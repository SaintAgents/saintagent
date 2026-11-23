import { contactPath, qrImage, shareUrl } from '@/components/publicprofile/publicLinks';

const escapeVCard = value => String(value || '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[;,]/g, '\\$&');
export function buildVCard(profile) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCard(profile.display_name)}`, `N:${escapeVCard(profile.display_name)};;;;`];
  for (const [property, key] of [['ORG', 'organization'], ['TITLE', 'title'], ['EMAIL', 'email'], ['TEL', 'phone'], ['URL', 'website']]) {
    if (profile[key]) lines.push(`${property}:${escapeVCard(profile[key])}`);
  }
  if (profile.location) lines.push(`ADR:;;${escapeVCard(profile.location)};;;;`);
  if (profile.sa_number) lines.push(`NOTE:${escapeVCard(`SA#${profile.sa_number}`)}`);
  return [...lines, 'END:VCARD', ''].join('\r\n');
}

export default function ProfileQRCode({ profile, size = 100, className = '', crossOrigin }) {
  const id = profile?.sa_number || profile?.id;
  if (!id) return null;
  return <img src={qrImage(shareUrl(contactPath(id)), Math.max(size * 4, 400))} alt="Scan to view the Digital Contact Card" width={size} height={size} className={className} crossOrigin={crossOrigin} />;
}