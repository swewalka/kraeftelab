import { BookOpen, PencilRuler, Target } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import type { TranslationKey } from "../../i18n/translations";

export type AppMode = "explore" | "explain" | "practice";

const modes: readonly { id: AppMode; labelKey: TranslationKey; icon: typeof BookOpen }[] = [
  { id: "explore", labelKey: "modes.explore", icon: BookOpen },
  { id: "explain", labelKey: "modes.explain", icon: PencilRuler },
  { id: "practice", labelKey: "modes.practice", icon: Target },
];

type ModeTabsProps = Readonly<{
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}>;

export const ModeTabs = ({ activeMode, onModeChange }: ModeTabsProps) => {
  const { t } = useI18n();

  return (
    <div className="inline-flex rounded-md border border-ink/15 bg-white p-1 shadow-sm" role="tablist" aria-label={t("modes.ariaLabel")}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = mode.id === activeMode;

        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[
              "flex min-h-10 items-center gap-2 rounded px-3 text-sm font-medium transition",
              isActive ? "bg-ink text-white" : "text-steel hover:bg-ink/5 hover:text-ink",
            ].join(" ")}
            onClick={() => onModeChange(mode.id)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t(mode.labelKey)}
          </button>
        );
      })}
    </div>
  );
};
