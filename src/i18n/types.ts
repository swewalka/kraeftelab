export const supportedLocales = ["de", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "de";

export const isLocale = (value: string): value is Locale =>
  supportedLocales.some((locale) => locale === value);
