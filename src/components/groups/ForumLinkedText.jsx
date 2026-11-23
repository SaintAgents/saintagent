import React from 'react';

const URL_PATTERN = /(https?:\/\/[^\s<>"`]+|www\.[^\s<>"`]+)/gi;

function parseLink(token) {
  let label = token.replace(/[.,!?;:'’”]+$/, '');
  for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
    while (label.endsWith(close) && label.split(close).length > label.split(open).length) label = label.slice(0, -1);
  }
  try {
    const url = new URL(/^www\./i.test(label) ? `https://${label}` : label);
    return { label, url, suffix: token.slice(label.length) };
  } catch {
    return null;
  }
}

function mediaFor(url) {
  if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(url.pathname)) return { kind: 'video', src: url.href };
  if (/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(url.pathname)) return { kind: 'audio', src: url.href };
  const host = url.hostname.replace(/^www\./, '');
  const ytId = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' || host === 'm.youtube.com' ? url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)\/?$/)?.[1] : null;
  if (ytId && /^[\w-]{11}$/.test(ytId)) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${ytId}` };
  const vimeoId = (host === 'vimeo.com' || host === 'player.vimeo.com') && url.pathname.match(/^\/(?:video\/)?(\d+)\/?$/)?.[1];
  return vimeoId ? { kind: 'embed', src: `https://player.vimeo.com/video/${vimeoId}` } : null;
}

export default function ForumLinkedText({ text = '', className, playable = false }) {
  const parts = (text || '').split(URL_PATTERN);
  const links = parts.map((part, i) => i % 2 ? parseLink(part) : null);
  const players = playable ? [...new Set(links.filter(Boolean).map(({ url }) => url.href))].map((href) => mediaFor(new URL(href))).filter(Boolean) : [];
  return <>
    <p className={className}>{parts.map((part, i) => {
      const link = links[i];
      return link ? <React.Fragment key={i}>
        <a className="break-all font-medium underline underline-offset-2 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href={link.url.href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>{link.label}</a>{link.suffix}
      </React.Fragment> : part;
    })}</p>
    {players.length > 0 && <div className="mt-3 space-y-3">
      {players.map(({ kind, src }, i) => <React.Fragment key={`${src}-${i}`}>
        {kind === 'video' && <video src={src} controls playsInline preload="none" aria-label="Linked video" className="max-h-96 w-full" />}
        {kind === 'audio' && <audio src={src} controls preload="none" aria-label="Linked audio" className="w-full" />}
        {kind === 'embed' && <iframe src={src} title={`Linked video ${i + 1}`} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-video w-full rounded-md border" />}
      </React.Fragment>)}
    </div>}
  </>;
}