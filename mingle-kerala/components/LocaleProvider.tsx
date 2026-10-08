"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Locale = "en" | "ml";
type LocaleContextValue = { locale: Locale; setLocale: (value: Locale) => void; t: (english: string, malayalam: string) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "mingle_kerala_locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const preferred = saved === "en" || saved === "ml" ? saved : (navigator.language.toLowerCase().startsWith("ml") ? "ml" : "en");
    updateLocale(preferred);
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const setLocale = useCallback((value: Locale) => {
    updateLocale(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);
  const t = useCallback((english: string, malayalam: string) => locale === "ml" ? malayalam : english, [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale requires LocaleProvider");
  return value;
}
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  return <div className="lang-toggle" role="group" aria-label="Site language / വെബ്‌സൈറ്റ് ഭാഷ">
    <button type="button" lang="en" aria-pressed={locale === "en"} className={locale === "en" ? "selected" : ""} onClick={() => setLocale("en")}>EN</button>
    <button type="button" lang="ml" aria-pressed={locale === "ml"} className={locale === "ml" ? "selected" : ""} onClick={() => setLocale("ml")}>മലയാളം</button>
  </div>;
}
