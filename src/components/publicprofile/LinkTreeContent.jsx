import { ExternalLink } from 'lucide-react';
import { webUrl } from '@/components/publicprofile/publicLinks';

const themes = {
  amber: 'bg-amber-50 text-amber-950', blue: 'bg-sky-50 text-sky-950', green: 'bg-emerald-50 text-emerald-950',
  purple: 'bg-violet-50 text-violet-950', dark: 'bg-slate-950 text-slate-50',
};
export default function LinkTreeContent({ tree, children }) {
  const avatar = webUrl(tree.avatar), banner = webUrl(tree.banner);
  const images = (tree.showcase || []).map(webUrl).filter(Boolean);
  return <div className={`w-full overflow-hidden rounded-2xl border border-current/10 ${themes[tree.theme] || themes.amber}`}>
    {banner && <img src={banner} alt="" className="h-36 w-full object-cover" />}
    <div className="space-y-5 p-5 sm:p-7">
      <header className="space-y-2 text-center">
        {avatar && <img src={avatar} alt="" className="mx-auto size-20 rounded-full object-cover" />}
        <h1 className="break-words text-2xl font-bold">{tree.headline || 'My LinkTree'}</h1>
        {tree.tagline && <p className="break-words font-medium">{tree.tagline}</p>}
        {tree.bio && <p className="whitespace-pre-line break-words text-sm leading-relaxed">{tree.bio}</p>}
      </header>
      <div className="grid gap-2">
        {(tree.links || []).map((link, index) => {
          const href = webUrl(link.url), image = webUrl(link.image);
          return href && <a key={link.id || index} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-current/20 p-3 hover:underline">
            {image && <img src={image} alt="" loading="lazy" className="size-10 rounded-md object-cover" />}
            <span className="min-w-0 flex-1 break-words"><strong className="block">{link.title || href}</strong>{link.description && <span className="block text-sm">{link.description}</span>}</span><ExternalLink className="size-4 shrink-0" />
          </a>;
        })}
      </div>
      {images.length > 0 && <section className="space-y-2"><h2 className="font-semibold">{tree.showcase_title || 'Showcase'}</h2><div className="grid grid-cols-2 gap-2">{images.map((src, i) => <img key={`${src}-${i}`} src={src} alt={`Showcase image ${i + 1}`} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />)}</div></section>}
      {children}
    </div>
  </div>;
}