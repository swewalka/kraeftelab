import { useI18n } from "../../i18n/I18nProvider";
import type { TranslationKey } from "../../i18n/translations";

export type AppMode = "explore" | "explain" | "practice";

const modes: readonly { id: AppMode; labelKey: TranslationKey }[] = [
  { id: "explore", labelKey: "modes.explore" },
  { id: "explain", labelKey: "modes.explain" },
  { id: "practice", labelKey: "modes.practice" },
];

type ModeTabsProps = Readonly<{
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}>;

export const ModeTabs = ({ activeMode, onModeChange }: ModeTabsProps) => {
  const { t } = useI18n();

  return (
    <div
      className="grid h-12 w-full grid-cols-3 rounded-md border border-line/55 bg-muted p-1 shadow-tool"
      role="tablist"
      aria-label={t("modes.ariaLabel")}
    >
      {modes.map((mode) => {
        const isActive = mode.id === activeMode;

        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "ui-focus flex min-h-9 items-center justify-center rounded font-display text-sm font-bold leading-none tracking-[0.14em] transition",
              isActive ? "bg-white text-signal shadow-tool" : "text-ink hover:bg-white/60 hover:text-signal",
            ].join(" ")}
            onClick={() => onModeChange(mode.id)}
          >
            {t(mode.labelKey)}
          </button>
        );
      })}
    </div>
  );
};
