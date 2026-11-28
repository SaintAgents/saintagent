import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { languages, useLanguage } from '@/components/language/LanguageProvider';

export default function LanguageSwitcher({ mobile = false }) {
  const { language, setLanguage, t } = useLanguage();
  const label = t('Language');
  const options = Object.entries(languages);
  if (mobile) return <label className="flex items-center justify-between gap-3 pt-2 text-sm font-medium">
    <span className="flex items-center gap-2"><Languages className="h-4 w-4" aria-hidden="true" />{label}</span>
    <select value={language} onChange={event => setLanguage(event.target.value)} className="min-h-11 max-w-full rounded-md border border-input bg-background px-3 text-foreground">
      {options.map(([code, name]) => <option key={code} value={code} lang={code}>{name}</option>)}
    </select>
  </label>;
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="hidden rounded-xl md:inline-flex" title={label} aria-label={label}>
        <Languages aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
        {options.map(([code, name]) => <DropdownMenuRadioItem key={code} value={code} lang={code}>{name}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}