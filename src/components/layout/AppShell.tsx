import type { ReactNode } from "react";
import { CircleUserRound } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

type AppShellProps = Readonly<{
  children: ReactNode;
  problemTitle: string;
  problems: readonly Readonly<{ id: string; title: string }>[];
  activeProblemId: string;
  onProblemChange: (problemId: string) => void;
}>;

export const AppShell = ({ children, problemTitle, problems, activeProblemId, onProblemChange }: AppShellProps) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen min-w-[1280px] bg-surface font-sans text-ink">
      <header className="border-b border-line/75 bg-surface">
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center px-10">
          <h1 className="font-display text-3xl font-bold leading-none tracking-normal text-black">{t("app.title")}</h1>
          <p className="max-w-[520px] truncate px-8 text-center font-display text-lg font-medium leading-none tracking-normal text-steel">
            {problemTitle}
          </p>
          <div className="flex items-center justify-end gap-5">
            <label className="flex items-center gap-2">
              <span className="sr-only">{t("problem.select")}</span>
              <select
                className="ui-focus h-10 max-w-[280px] rounded border border-line/80 bg-white px-3 font-display text-sm font-medium text-black"
                value={activeProblemId}
                onChange={(event) => onProblemChange(event.target.value)}
                aria-label={t("problem.select")}
              >
                {problems.map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    {problem.title}
                  </option>
                ))}
              </select>
            </label>
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
      <main className="h-[calc(100vh-5rem)] overflow-hidden">{children}</main>
    </div>
  );
};
