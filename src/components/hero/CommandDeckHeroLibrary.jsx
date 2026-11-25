import { Button } from '@/components/ui/button';

const imageRoot = 'https://media.base44.com/images/public/694f3e0401b05e6e8a042002/';
const backgrounds = [
  ['Light theme', [
    ['Porcelain Dawn', '5c12021e08492bb19ee80043e8970372'],
    ['Glacier Glass', '6f9dd434d95dbfa313143f4d8a7ead0c'],
    ['Orchid Veil', '841f7a6fcf7f3798438e70aa1e75fb5c'],
  ]],
  ['Dark theme', [
    ['Obsidian Ember', 'bab133691aae9671bf77435a58a9ab99'],
    ['Deep Current', 'bea04c880b73ca4f8ce163f7788024a9'],
    ['Violet Eclipse', '7881dabafbfc8acc791d71111260a13f'],
  ]],
];

export default function CommandDeckHeroLibrary({ selected, toggle }) {
  return <section aria-labelledby="command-deck-backgrounds" className="space-y-3 border-t pt-3">
    <div>
      <h3 id="command-deck-backgrounds" className="text-sm font-semibold">Command Deck backgrounds</h3>
      <p className="text-xs text-muted-foreground">Select an image to add or remove it from the carousel.</p>
    </div>
    {backgrounds.map(([theme, entries]) => <div key={theme} className="space-y-1.5">
      <h4 className="text-xs font-semibold">{theme}</h4>
      <div className="grid grid-cols-3 gap-2">
        {entries.map(([label, asset]) => {
          const url = `${imageRoot}${asset}_generated_image.png`;
          return <Button key={asset} type="button" variant="outline" aria-pressed={selected.some(item => item.url === url)}
            className="h-auto min-w-0 flex-col gap-1 whitespace-normal p-1 text-center text-xs"
            onClick={() => toggle({ url, label })}>
            <img src={url} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
            <span>{label}</span>
          </Button>;
        })}
      </div>
    </div>)}
  </section>;
}