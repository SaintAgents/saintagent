import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ImpactHeroAvatar({ name = '', avatarUrl }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <Avatar className="impact-hero-avatar mb-3 size-20 border-2 sm:size-24" role="img" aria-label={name ? `${name}’s avatar` : 'Your avatar'}>
    <AvatarImage src={avatarUrl || undefined} alt="" className="object-cover" />
    <AvatarFallback className="bg-transparent text-xl font-semibold" aria-hidden="true">{initials || '?'}</AvatarFallback>
  </Avatar>;
}