import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { type Lang, type TranslationKey, getT, countryNames, countryList } from './translations';

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------

function detectLang(): Lang {
  // 1. URL param: ?lang=en or ?lang=fr
  const params = new URLSearchParams(window.location.search);
  const paramLang = params.get('lang');
  if (paramLang === 'en') return 'en';
  if (paramLang === 'fr') return 'fr';

  // 2. Host page html[lang] attribute
  const htmlLang = document.documentElement.lang?.toLowerCase() ?? '';
  if (htmlLang.startsWith('en')) return 'en';

  // 3. Default
  return 'fr';
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface LangContextValue {
  lang: Lang;
  t: (key: TranslationKey) => string;
  getCountryName: (iso: string, fallback?: string) => string;
  getCountryList: () => Array<{ iso: string; name: string }>;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const lang = useMemo(() => detectLang(), []);
  const t = useMemo(() => getT(lang), [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      t,
      getCountryName: (iso, fallback) => countryNames[lang][iso] ?? fallback ?? iso,
      getCountryList: () => countryList[lang],
    }),
    [lang, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useTranslation must be used inside LangProvider');
  return ctx;
}
