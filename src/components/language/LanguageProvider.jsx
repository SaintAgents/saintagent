import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';
import translations from '@/components/language/interfaceTranslations';

export const languages = {
  'en-US': 'English (US)', 'es-ES': 'Español', 'fr-FR': 'Français',
  'de-DE': 'Deutsch', 'pt-BR': 'Português', 'ja-JP': '日本語',
};
const defaultLanguage = 'en-US';
const LanguageContext = createContext(null);

function storedLanguage() {
  try {
    const saved = localStorage.getItem('language');
    if (Object.hasOwn(languages, saved)) return saved;
  } catch { /* preferences may be unavailable */ }
  return defaultLanguage;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(storedLanguage);
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('language', language); } catch { /* apply for this session */ }
  }, [language]);
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (text, values) => {
      const label = translations.get(text)?.[language] ?? text;
      return values ? label.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match) : label;
    },
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}