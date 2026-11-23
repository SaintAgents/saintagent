import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LinkTreeIntroButton from '@/components/publicprofile/LinkTreeIntroButton';

export default function LinkTreeFields({ draft, patch, business, email }) {
  const input = (key, label, maxLength, type = 'text') => <label key={key} className="block text-sm">{label}<Input type={type} value={draft[key] || ''} maxLength={maxLength} onChange={e => patch({ [key]: e.target.value })} /></label>;
  const check = (key, label) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft[key] === true} onChange={e => patch({ [key]: e.target.checked })} />{label}</label>;
  return <div className="space-y-3">
    {input('headline', 'Headline', 120)}{input('tagline', 'Tagline', 160)}
    <label className="block text-sm">Bio<Textarea maxLength={1200} value={draft.bio || ''} onChange={e => patch({ bio: e.target.value })} /></label>
    <LinkTreeIntroButton headline={draft.headline} tagline={draft.tagline} bio={draft.bio} onApply={bio => patch({ bio })} />
    {input('avatar', 'Avatar URL', 1500, 'url')}{input('banner', 'Banner URL', 1500, 'url')}
    <label className="block text-sm">Color theme<select className="block w-full rounded-md border bg-background p-2 text-foreground" value={draft.theme} onChange={e => patch({ theme: e.target.value })}>{['amber','blue','green','purple','dark'].map(theme => <option key={theme} value={theme}>{theme[0].toUpperCase() + theme.slice(1)}</option>)}</select></label>
    <fieldset className="space-y-2 rounded-lg border p-3"><legend className="font-semibold">Showcase</legend>
      {input('showcase_title', 'Section name', 100)}
      {Array.from({ length: 4 }, (_, i) => <label key={i} className="block text-sm">Showcase image {i + 1} URL<Input type="url" maxLength={1500} value={draft.showcase[i] || ''} onChange={e => { const showcase = [...draft.showcase]; showcase[i] = e.target.value; patch({ showcase }); }} /></label>)}
    </fieldset>
    {!business && <fieldset className="space-y-2 rounded-lg border p-3"><legend className="font-semibold">Digital Contact Card</legend>
      <p className="text-sm text-muted-foreground">These settings apply to your contact card, even if LinkTree is unpublished. Email and phone stay off the public card and downloaded contact file unless you opt in.</p>
      {input('contact_title', 'Professional title', 100)}{input('contact_org', 'Organization', 120)}
      {check('share_email', `Share my email (${email})`)}{check('share_phone', 'Share a phone number')}
      {draft.share_phone && input('contact_phone', 'Public phone number', 40, 'tel')}
    </fieldset>}
    {check('published', 'Publish LinkTree for signed-out visitors')}
  </div>;
}