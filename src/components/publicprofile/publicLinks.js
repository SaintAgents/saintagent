const origin = 'https://saintagent.world';
export const contactPath = id => `/v/${encodeURIComponent(id)}`;
export const contactShareUrl = id => new URL(contactPath(id), 'https://saint-agent-1122.base44.app').href;
export const treePath = (id, business = false) => business ? `/LinkTree?p=${encodeURIComponent(id)}` : `/LinkTree/${encodeURIComponent(id)}`;
export const shareUrl = path => new URL(path, origin).href;
export const qrImage = (url, size) => `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&qzone=4&data=${encodeURIComponent(url)}`;
export function webUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
export async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}