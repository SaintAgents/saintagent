import { Button } from '@/components/ui/button';
import { canopySunrise, canopyNight } from '@/components/hero/canopyArtwork';

const imageRoot = 'https://media.base44.com/images/public/694f3e0401b05e6e8a042002/';
const backgrounds = [
  ['Light Theme', [
    ['Porcelain Dawn', '5c12021e08492bb19ee80043e8970372'],
    ['Glacier Glass', '6f9dd434d95dbfa313143f4d8a7ead0c'],
    ['Orchid Veil', '841f7a6fcf7f3798438e70aa1e75fb5c'],
    canopySunrise,
  ]],
  ['Dark Theme', [
    ['Obsidian Ember', 'bab133691aae9671bf77435a58a9ab99'],
    ['Deep Current', 'bea04c880b73ca4f8ce163f7788024a9'],
    ['Violet Eclipse', '7881dabafbfc8acc791d71111260a13f'],
    canopyNight,
  ]],
];

export default function CommandDeckHeroLibrary({ selected, onSelect }) {
  return <section aria-label="Command Deck backgrounds" className="space-y-2 border-t pt-2">
    <h4 className="text-sm font-semibold">Command Deck backgrounds</h4>
    {backgrounds.map(([theme, entries]) => <div key={theme} className="space-y-1.5">
      <h5 className="text-xs font-semibold">{theme}</h5>
      <div className="grid grid-cols-3 gap-2">
        {entries.map(([label, asset]) => {
          const url = asset.startsWith('https://') ? asset : `${imageRoot}${asset}_generated_image.png`;
          return <Button key={asset} type="button" variant="outline" aria-pressed={selected?.some(item => item.url === url)}
            className="grid h-auto min-w-0 grid-cols-1 gap-1 whitespace-normal p-1 text-center text-xs text-inherit"
            onClick={() => onSelect({ url, label })}>
            <span className="relative block aspect-video w-full overflow-hidden">
              <img src={url} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" />
            </span>
            <span className="grid h-8 place-items-center leading-4">{label}</span>
          </Button>;
        })}
      </div>
    </div>)}
  </section>;
}