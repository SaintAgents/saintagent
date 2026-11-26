import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ImpactHeroAvatar() {
  const { user } = useAuth();
  const email = user?.email;
  const { data } = useQuery({
    queryKey: ['myProfile', email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: email }, '-updated_date', 1),
    enabled: !!email,
  });
  const profile = data?.[0];
  const name = profile?.display_name || user?.full_name || '';
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  if (!user) return null;

  return <Avatar className="impact-hero-avatar row-start-2 size-20 justify-self-center border-2 sm:size-24" role="img" aria-label={name ? `${name}’s avatar` : 'Your avatar'}>
    <AvatarImage src={profile?.avatar_url || undefined} alt="" className="object-cover" />
    <AvatarFallback className="bg-transparent text-xl font-semibold" aria-hidden="true">{initials || '?'}</AvatarFallback>
  </Avatar>;
}