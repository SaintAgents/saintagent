import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileBoostModal from './ProfileBoostModal';

export default function QuickBoostButton({ className, variant = 'default', size = 'default' }) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  const { data: activeBoosts = [] } = useQuery({
    queryKey: ['activeBoosts', profile?.user_id],
    queryFn: () => base44.entities.Boost.filter({ 
      user_id: profile.user_id, 
      status: 'active',
      boost_type: 'profile'
    }),
    enabled: !!profile?.user_id
  });

  const hasActiveBoost = activeBoosts.some(b => new Date(b.end_time) > new Date());
  const currentBoost = activeBoosts.find(b => new Date(b.end_time) > new Date());
  const hoursLeft = currentBoost 
    ? Math.max(0, Math.round((new Date(currentBoost.end_time) - new Date()) / (1000 * 60 * 60)))
    : 0;

  if (hasActiveBoost) {
    return (
      <>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "gap-2 bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100",
            "dark:bg-violet-900/20 dark:border-violet-700 dark:text-violet-300",
            className
          )}
          onClick={() => setModalOpen(true)}
        >
          <Zap className="w-4 h-4 text-violet-500" />
          <span>Boosted</span>
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-violet-200 text-violet-700">
            <Clock className="w-3 h-3 mr-0.5" />
            {hoursLeft}h
          </Badge>
        </Button>
        <ProfileBoostModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          "gap-2",
          variant === 'default' && "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
          className
        )}
        onClick={() => setModalOpen(true)}
      >
        <Rocket className="w-4 h-4" />
        <span>Boost Profile</span>
      </Button>
      <ProfileBoostModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}