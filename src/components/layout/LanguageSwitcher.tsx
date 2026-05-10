import { supportedLocales, type Locale } from "../../i18n/types";
import { useI18n } from "../../i18n/I18nProvider";

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="inline-flex items-center font-display text-sm font-bold uppercase leading-none tracking-[0.1em]" aria-label={t("language.label")}>
      {supportedLocales.map((language: Locale, index) => {
        const isActive = language === locale;
        return (
          <span key={language} className="inline-flex items-center">
            {index > 0 ? <span className="mx-0.5 text-black">/</span> : null}
            <button
              type="button"
              className={[
                "ui-focus rounded-sm px-0.5 py-1 transition",
                isActive ? "text-black" : "text-steel hover:text-black",
              ].join(" ")}
              aria-pressed={isActive}
              onClick={() => setLocale(language)}
            >
              {t(language === "en" ? "language.en" : "language.de")}
            </button>
          </span>
        );
      })}
    </div>
  );
};
