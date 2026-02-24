import React from 'react';
import { Key, Radio, CircleDot, Calendar } from 'lucide-react';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import DRXCard from '@/components/hud/DRXCard';
import BroadcastCard from '@/components/hud/BroadcastCard';
import EventsCard from '@/components/hud/EventsCard';
import GlobalScheduleCard from '@/components/hud/GlobalScheduleCard';

export default function CommandDeckCards({ 
  isCardVisible, 
  hiddenCards, 
  toggleCardVisibility,
  handleTossToSidePanel,
  forceOpen
}) {
  return (
    <>
      {isCardVisible('drx') && (
        <CollapsibleCard 
          title="Digital Rights Exchange" 
          cardId="drx" 
          icon={Key} 
          badge="New" 
          badgeColor="violet" 
          backgroundImage="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80" 
          defaultOpen={true} 
          forceOpen={forceOpen} 
          isHidden={hiddenCards.has('drx')} 
          onToggleHide={() => toggleCardVisibility('drx')} 
          onTossToSidePanel={handleTossToSidePanel}
          onPopout={() => {}}
        >
          <DRXCard />
        </CollapsibleCard>
      )}

      {isCardVisible('broadcast') && (
        <CollapsibleCard 
          title="Broadcasts" 
          cardId="broadcast" 
          icon={Radio} 
          badge="Live" 
          badgeColor="red" 
          backgroundImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80" 
          defaultOpen={true} 
          forceOpen={forceOpen} 
          isHidden={hiddenCards.has('broadcast')} 
          onToggleHide={() => toggleCardVisibility('broadcast')} 
          onTossToSidePanel={handleTossToSidePanel}
          onPopout={() => {}}
        >
          <BroadcastCard />
        </CollapsibleCard>
      )}

      {isCardVisible('events') && (
        <CollapsibleCard 
          title="Events" 
          cardId="events" 
          icon={CircleDot} 
          badge="Upcoming" 
          badgeColor="emerald" 
          backgroundImage="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80" 
          defaultOpen={true} 
          forceOpen={forceOpen} 
          isHidden={hiddenCards.has('events')} 
          onToggleHide={() => toggleCardVisibility('events')} 
          onTossToSidePanel={handleTossToSidePanel}
          onPopout={() => {}}
        >
          <EventsCard />
        </CollapsibleCard>
      )}
    </>
  );
}