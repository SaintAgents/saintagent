import { widget } from '@/components/dock/dockCatalog';

export default function useDockActions(commit, active) {
  const patch = (id, update) => commit(p => ({cards:p.cards.map(c => c.id === id ? {...c,...update,settings:{...c.settings,...update.settings}} : c)}));
  const restore = (id,deck) => commit(p => { const card=p.cards.find(c=>c.id===id); return card ? {cards:[...p.cards.filter(c=>c.id!==id), {...card,deck,place:'deck'}]} : {}; });
  const reorder = (id, target) => commit(p => {
    const cards = [...p.cards], from=cards.findIndex(c=>c.id===id), to=cards.findIndex(c=>c.id===target);
    if(from<0 || to<0 || from===to) return {};
    cards.splice(to,0,...cards.splice(from,1)); return {cards};
  });
  return { patch, restore, reorder,
    add: (type,settings) => commit(p => ({cards:[...p.cards,{...widget(type,settings),deck:p.active}]})),
    remove: id => commit(p => ({cards:p.cards.filter(c=>c.id!==id)})),
    shortcuts: shortcuts => commit({shortcuts}),
    shift: (id,dir) => commit(p => {
      const activeCards=p.cards.filter(c=>c.deck===active && c.place==='deck');
      const other=activeCards[activeCards.findIndex(c=>c.id===id)+dir]; if(!other) return {};
      const cards=[...p.cards], a=cards.findIndex(c=>c.id===id), b=cards.findIndex(c=>c.id===other.id);
      [cards[a],cards[b]]=[cards[b],cards[a]]; return {cards};
    }),
    saveDeck: (name,icon,mode) => commit(p => {
      if(mode==='rename') return {decks:p.decks.map(d => d.id===p.active ? {...d,name,icon} : d)};
      if(p.decks.length>=20) return {};
      const id=crypto.randomUUID(); return {decks:[...p.decks,{id,name,icon}],active:id};
    }),
    deleteDeck: () => commit(p => {
      if(p.decks.length<=1) return {};
      const decks=p.decks.filter(d=>d.id!==p.active), active=decks[0].id;
      return {decks,active,cards:p.cards.map(c=>c.deck===p.active ? {...c,deck:active,place:'drawer'} : c)};
    }),
  };
}