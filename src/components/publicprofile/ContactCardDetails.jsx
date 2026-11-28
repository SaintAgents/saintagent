import { Briefcase, Building2, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { webUrl } from '@/components/publicprofile/publicLinks';

export const contactLabels = { title: 'Professional title', organization: 'Organization', location: 'Address or location', email: 'Email', phone: 'Phone', website: 'Website' };
const icons = { title: Briefcase, organization: Building2, location: MapPin, email: Mail, phone: Phone, website: Globe };
export function contactOrder(order) {
  const defaults = Object.keys(contactLabels);
  return [...new Set([...(Array.isArray(order) ? order.filter(key => Object.hasOwn(contactLabels, key)) : []), ...defaults])];
}
export default function ContactCardDetails({ profile, compact = false }) {
  const fields = contactOrder(profile.contact_order).filter(key => profile[key]);
  if (!fields.length) return null;
  return <ul className={compact ? 'mt-1 space-y-0.5 border-t pt-1 text-xs leading-tight' : 'space-y-2 text-sm'}>
    {fields.map(key => {
      const Icon = icons[key];
      const value = profile[key];
      const href = key === 'website' ? webUrl(value) : key === 'email' ? `mailto:${encodeURIComponent(value).replace('%40', '@')}` : key === 'phone' ? `tel:${value.replace(/[^+\d]/g, '')}` : '';
      const text = compact && key === 'website' ? value.replace(/^https?:\/\//, '') : value;
      return <li key={key} className="flex min-w-0 items-center gap-2"><Icon className={compact ? 'size-3 shrink-0' : 'size-4 shrink-0'} aria-hidden="true" />
        {!compact && href ? <a className="break-all underline" href={href} target={key === 'website' ? '_blank' : undefined} rel={key === 'website' ? 'noopener noreferrer' : undefined}>{text}</a> : <span className={compact ? 'truncate' : 'break-words min-w-0'} title={compact ? text : undefined}>{text}</span>}
      </li>;
    })}
  </ul>;
}