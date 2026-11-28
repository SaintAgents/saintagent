import { createContext, useContext, useMemo } from 'react';
import { widget } from '@/components/dock/dockCatalog';

const DockPinContext = createContext(null);
export const useDockPins = () => useContext(DockPinContext);
const matches = (settings, item) => settings.record_id && item.record_id
  ? settings.record_id === item.record_id && settings.item_type === item.item_type
  : settings.title === item.title;
const isPin = card => card.type === 'pinned_item' || card.type === 'Pinned Item';

export default function DockPinProvider({ prefs, commit, disabled, revealCard, children }) {
  const value = useMemo(() => disabled ? null : {
    has: item => prefs.cards.some(card => card.place !== 'drawer' && isPin(card) && matches(card.settings, item)),
    set: (item, pinned) => {
      let pinnedId;
      commit(state => {
        const match = card => isPin(card) && matches(card.settings, item);
        const current = state.cards.find(card => card.place !== 'drawer' && match(card));
        if (!pinned) return current ? { cards: state.cards.filter(card => card.place === 'drawer' || !match(card)) } : {};
        if (current) return {};
        const archived = state.cards.find(card => card.place === 'drawer' && match(card));
        const card = archived || widget('pinned_item', { ...item, pinned_at: new Date().toISOString() });
        pinnedId = card.id;
        return { cards: [...state.cards.filter(card => card.id !== pinnedId), { ...card, deck: state.active, place: 'deck' }] };
      });
      if (pinnedId) revealCard(pinnedId);
    },
  }, [prefs.cards, commit, disabled, revealCard]);
  return <DockPinContext.Provider value={value}>{children}</DockPinContext.Provider>;
}