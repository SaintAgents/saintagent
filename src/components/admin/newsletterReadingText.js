export default function newsletterReadingText(content) {
  if (!content?.trim()) return '';
  if (!/<[a-z][^>]*>/i.test(content)) return content.trim();

  // Parse in an inert template; never attach the stored HTML to the page.
  const template = document.createElement('template');
  template.innerHTML = content;
  const blocks = /^(DIV|P|H[1-6]|SECTION|ARTICLE|BLOCKQUOTE|UL|OL|TABLE|TR|PRE|HR)$/;
  const ignored = /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|IFRAME|OBJECT|SVG|HEAD)$/;
  const parts = [];
  function visit(node) {
    if (node.nodeType === 3) { parts.push(node.textContent.replace(/\s+/g, ' ')); return; }
    const tag = node.tagName;
    if (ignored.test(tag)) return;
    if (tag === 'BR') { parts.push('\n'); return; }
    if (tag === 'LI') parts.push('\n• ');
    if (blocks.test(tag)) parts.push('\n\n');
    node.childNodes.forEach(visit);
    if (tag === 'TD' || tag === 'TH') parts.push(' ');
    if (blocks.test(tag)) parts.push('\n\n');
  }
  template.content.childNodes.forEach(visit);
  return parts.join('').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}