import { createContext, useContext, useMemo } from 'react';
import { widget } from '@/components/dock/dockCatalog';

const DockPinContext = createContext(null);
export const useDockPins = () => useContext(DockPinContext);
const matches = (settings, item) => settings.record_id && item.record_id
  ? settings.record_id === item.record_id && settings.item_type === item.item_type
  : settings.title === item.title;
const isPin = card => card.type === 'pinned_item' || card.type === 'Pinned Item';

export default function DockPinProvider({ prefs, commit, disabled, children }) {
  const value = useMemo(() => disabled ? null : {
    has: item => prefs.cards.some(card => isPin(card) && matches(card.settings, item)),
    set: (item, pinned) => commit(state => {
      const match = card => isPin(card) && matches(card.settings, item);
      if (pinned) return state.cards.some(match) ? {} : { cards: [...state.cards, { ...widget('pinned_item', { ...item, pinned_at: new Date().toISOString() }), deck: state.active }] };
      return state.cards.some(match) ? { cards: state.cards.filter(card => !match(card)) } : {};
    }),
  }, [prefs.cards, commit, disabled]);
  return <DockPinContext.Provider value={value}>{children}</DockPinContext.Provider>;
}