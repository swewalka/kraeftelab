import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, isLocale, type Locale } from "./types";
import { translations, type TranslationKey } from "./translations";

const storageKey = "mechanics-playground.locale";

type TranslateOptions = Readonly<Record<string, string | number>>;

type I18nContextValue = Readonly<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, options?: TranslateOptions) => string;
}>;

const I18nContext = createContext<I18nContextValue | null>(null);

const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const storedLocale = window.localStorage.getItem(storageKey);
  return storedLocale !== null && isLocale(storedLocale) ? storedLocale : defaultLocale;
};

const interpolate = (template: string, options: TranslateOptions = {}) =>
  Object.entries(options).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );

type I18nProviderProps = Readonly<{
  children: ReactNode;
}>;

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(storageKey, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, options) => interpolate(translations[locale][key] ?? translations.en[key], options),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }
  return context;
};
