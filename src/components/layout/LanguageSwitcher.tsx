import { Languages } from "lucide-react";
import { supportedLocales, type Locale } from "../../i18n/types";
import { useI18n } from "../../i18n/I18nProvider";

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="ml-auto flex items-center gap-2" aria-label={t("language.label")}>
      <Languages className="h-4 w-4 text-steel" aria-hidden="true" />
      <div className="inline-flex rounded-md border border-ink/15 bg-white p-1 shadow-sm">
        {supportedLocales.map((language: Locale) => {
          const isActive = language === locale;
          return (
            <button
              key={language}
              type="button"
              className={[
                "h-8 rounded px-2.5 text-xs font-semibold transition",
                isActive ? "bg-ink text-white" : "text-steel hover:bg-ink/5 hover:text-ink",
              ].join(" ")}
              aria-pressed={isActive}
              onClick={() => setLocale(language)}
            >
              {t(language === "en" ? "language.en" : "language.de")}
            </button>
          );
        })}
      </div>
    </div>
  );
};
