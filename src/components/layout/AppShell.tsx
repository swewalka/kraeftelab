import type { ReactNode } from "react";
import { CircleUserRound } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

type AppShellProps = Readonly<{
  children: ReactNode;
  modeNavigation: ReactNode;
  problemTitle: string;
  onCatalogOpen: () => void;
}>;

export const AppShell = ({ children, modeNavigation, problemTitle, onCatalogOpen }: AppShellProps) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen min-w-[1280px] bg-surface font-sans text-ink">
      <header className="border-b border-line/75 bg-surface">
        <div className="grid h-24 grid-cols-[1fr_auto_1fr] items-center px-10">
          <button
            type="button"
            className="ui-focus w-fit font-display text-3xl font-bold leading-none tracking-normal text-black transition hover:text-signal"
            onClick={onCatalogOpen}
          >
            {t("app.title")}
          </button>
          <div className="flex min-w-[480px] flex-col items-center gap-3 px-8">
            <p className="max-w-[560px] truncate text-center font-display text-lg font-medium leading-none tracking-normal text-steel">
              {problemTitle}
            </p>
            <div className="w-[420px]">{modeNavigation}</div>
          </div>
          <div className="flex items-center justify-end gap-5">
            <LanguageSwitcher />
            <button
              type="button"
              className="ui-focus inline-flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-muted"
              aria-label={t("app.account")}
            >
              <CircleUserRound className="h-7 w-7 stroke-[2]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <main className="h-[calc(100vh-6rem)] overflow-hidden">{children}</main>
    </div>
  );
};
