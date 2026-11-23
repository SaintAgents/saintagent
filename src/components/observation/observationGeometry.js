export const arrangements = [['grid','Grid'],['row','Row'],['column','Column'],['stack','Stack'],['top','Align top'],['bottom','Align bottom'],['left','Align left'],['right','Align right'],['flow','Flow across'],['down','Flow down'],['reverse','Reverse flow'],['zigzag','Zigzag flow']];
export const bounds = (n,min,max) => Math.min(Math.max(n,min),Math.max(min,max));
export function layoutCards(ids, width, mode) {
  const gap = 12, w = Math.max(1,width), n = ids.length;
  const col = mode === 'row' ? Math.max(1,Math.min(n,Math.floor(w/185))) : ['column','stack','left','right','down'].includes(mode) ? 1 : w >= 1080 ? 3 : w >= 670 ? 2 : 1;
  const cardWidth = Math.max(1, col === 1 ? Math.min(w, mode === 'column' ? 750 : 620) : (w-gap*(col-1))/col);
  const rowCount = Math.ceil(n/col), h = 340;
  return Object.fromEntries(ids.map((id,index) => {
    const i = mode === 'reverse' ? n-index-1 : index;
    const row = Math.floor(i/col), cell = i%col;
    const x = mode === 'right' ? w-cardWidth : mode === 'stack' ? Math.min(w-cardWidth,i*18) : mode === 'down' ? i%2 * Math.min(56,w-cardWidth) : mode === 'column' ? (w-cardWidth)/2 : (mode === 'zigzag' && row%2 ? col-cell-1 : cell)*(cardWidth+gap);
    const y = mode === 'bottom' ? Math.max(0,600-rowCount*(h+gap))+row*(h+gap) : mode === 'stack' ? i*82 : row*(h+gap);
    const flowW = col > 1 ? Math.max(1,(w-gap)/5) : cardWidth;
    if (mode === 'flow' && col > 1) return [id,{x:i%2 ? flowW*3+gap : 0,y:Math.floor(i/2)*(h+gap),w:flowW*(i%2 ? 2 : 3),h}];
    return [id,{x,y,w:cardWidth,h}];
  }));
}